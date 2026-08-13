"""
Genera la tabla de recomendaciones precalculada que consume la API Node/Express.

Reproduce el pipeline del notebook TP_Machine_Learning_Fernando_Cavalli.ipynb:
descarga los datasets publicos del Estado argentino (Registro MiPyME +
variacion de facturacion por sector), entrena el mismo Random Forest, y en
vez de servir el modelo en vivo, calcula la prediccion para cada combinacion
real de (Categoria, Sector, Provincia, Regimen_Tributario) que aparece en el
dataset y la exporta a recomendaciones.json. Ese JSON es lo que se carga en
MongoDB (ver ../scripts/seed.js) y consulta la API.

Uso: python3 generar_recomendaciones.py
Salida: recomendaciones.json (en esta misma carpeta) + metricas.json
"""

import json
import os

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

MIPYME_URL = "https://cdn.produccion.gob.ar/cdn-sepyme/registro_mipyme_23-12-2024.csv"
FACTURACION_URL = "https://cdn.produccion.gob.ar/cdn-cep/datos-facturacion/fact_por_clae3.csv"

HERE = os.path.dirname(os.path.abspath(__file__))
MIPYME_CSV = os.path.join(HERE, "mipyme.csv")
FACTURACION_CSV = os.path.join(HERE, "facturacion.csv")
OUT_RECOMENDACIONES = os.path.join(HERE, "recomendaciones.json")
OUT_METRICAS = os.path.join(HERE, "metricas.json")

MIN_MUESTRAS_POR_COMBINACION = 5
SAMPLE_SIZE = 200_000
RANDOM_STATE = 42


def descargar_si_falta(url, destino):
    if os.path.exists(destino):
        print(f"[skip] ya existe {destino}")
        return
    print(f"[download] {url} -> {destino}")
    os.system(f'curl -sL "{url}" -o "{destino}"')


def cargar_datasets():
    descargar_si_falta(MIPYME_URL, MIPYME_CSV)
    descargar_si_falta(FACTURACION_URL, FACTURACION_CSV)

    mipyme = pd.read_csv(MIPYME_CSV)
    fact = pd.read_csv(FACTURACION_CSV)
    return mipyme, fact


def limpiar(mipyme, fact):
    mipyme = mipyme.drop(columns=["Unnamed: 0"], errors="ignore")

    mipyme["clae3"] = (
        mipyme["CLAE6"].astype(str).str.replace(r"\D", "", regex=True).str[:3]
    )
    mipyme["target_exito"] = mipyme["Vigente"].astype(int)

    fact["fecha"] = pd.to_datetime(fact["fecha"])
    fact["var_facturacion"] = pd.to_numeric(fact["var_facturacion"], errors="coerce")

    mipyme["clae3"] = mipyme["clae3"].astype(str).str.zfill(3)
    fact["clae3"] = fact["clae3"].astype(int).astype(str).str.zfill(3)

    return mipyme, fact


def armar_dataset(mipyme, fact):
    fact_features = (
        fact.sort_values("fecha")
        .groupby("clae3")
        .agg(
            var_fact_last=("var_facturacion", "last"),
            var_fact_mean_3m=("var_facturacion", lambda x: x.tail(3).mean()),
        )
        .reset_index()
    )

    df = mipyme.merge(fact_features, on="clae3", how="left")
    df["clae3"] = df["clae3"].astype(str)
    df_ml = df.dropna(subset=["var_fact_last", "var_fact_mean_3m"])
    return df_ml


def entrenar(df_ml):
    cat_features = ["Categoria", "Sector", "Provincia", "Regimen_Tributario"]
    num_features = ["var_fact_last", "var_fact_mean_3m"]

    df_sample = df_ml.sample(
        n=min(SAMPLE_SIZE, len(df_ml)), random_state=RANDOM_STATE
    )

    X = df_sample[cat_features + num_features].copy()
    y = df_sample["target_exito"].copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    preprocess = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_features),
            ("num", "passthrough", num_features),
        ]
    )

    rf_model = Pipeline(
        steps=[
            ("prep", preprocess),
            (
                "clf",
                RandomForestClassifier(
                    n_estimators=200,
                    random_state=RANDOM_STATE,
                    n_jobs=-1,
                    class_weight="balanced",
                ),
            ),
        ]
    )

    rf_model.fit(X_train, y_train)

    y_pred = rf_model.predict(X_test)
    reporte = classification_report(y_test, y_pred, output_dict=True)

    return rf_model, df_sample, reporte


def clasificar(p_exito):
    if p_exito >= 0.70:
        return "INVERTIR"
    if p_exito >= 0.45:
        return "INVERTIR CON CAUTELA"
    return "NO INVERTIR"


def generar_tabla_recomendaciones(rf_model, df_sample):
    cat_features = ["Categoria", "Sector", "Provincia", "Regimen_Tributario"]

    combinaciones = (
        df_sample.groupby(cat_features)
        .agg(
            var_fact_last=("var_fact_last", "mean"),
            var_fact_mean_3m=("var_fact_mean_3m", "mean"),
            muestras=("target_exito", "size"),
        )
        .reset_index()
    )

    combinaciones = combinaciones[
        combinaciones["muestras"] >= MIN_MUESTRAS_POR_COMBINACION
    ].copy()

    X_new = combinaciones[
        ["Categoria", "Sector", "Provincia", "Regimen_Tributario", "var_fact_last", "var_fact_mean_3m"]
    ]
    probs = rf_model.predict_proba(X_new)[:, 1]

    registros = []
    for row, p_exito in zip(combinaciones.itertuples(index=False), probs):
        registros.append(
            {
                "categoria": row.Categoria,
                "sector": row.Sector,
                "provincia": row.Provincia,
                "regimenTributario": row.Regimen_Tributario,
                "varFactLast": round(float(row.var_fact_last), 2),
                "varFactMean3m": round(float(row.var_fact_mean_3m), 2),
                "muestras": int(row.muestras),
                "probExito": round(float(p_exito), 4),
                "riesgo": round(float(1 - p_exito), 4),
                "recomendacion": clasificar(p_exito),
            }
        )

    return registros


def main():
    print("Cargando datasets...")
    mipyme, fact = cargar_datasets()

    print("Limpiando...")
    mipyme, fact = limpiar(mipyme, fact)

    print("Armando dataset combinado...")
    df_ml = armar_dataset(mipyme, fact)
    print(f"Filas utilizables: {len(df_ml)}")

    print("Entrenando Random Forest...")
    rf_model, df_sample, reporte = entrenar(df_ml)

    print("Generando tabla de recomendaciones...")
    registros = generar_tabla_recomendaciones(rf_model, df_sample)
    print(f"Combinaciones exportadas: {len(registros)}")

    with open(OUT_RECOMENDACIONES, "w", encoding="utf-8") as f:
        json.dump(registros, f, ensure_ascii=False, indent=2)

    with open(OUT_METRICAS, "w", encoding="utf-8") as f:
        json.dump(
            {
                "filas_entrenamiento": len(df_sample),
                "combinaciones_exportadas": len(registros),
                "classification_report": reporte,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )

    print(f"Listo -> {OUT_RECOMENDACIONES}")
    print(f"Listo -> {OUT_METRICAS}")


if __name__ == "__main__":
    main()
