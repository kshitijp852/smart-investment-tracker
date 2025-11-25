
from fastapi import FastAPI
from pydantic import BaseModel
import joblib, os
import numpy as np

app = FastAPI(title='ML Service')

# Simple request model
class PredictRequest(BaseModel):
    features: list

# Load model if exists
MODEL_PATH = 'model.joblib'
model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)

@app.get('/')
def read_root():
    return {'ok': True, 'model_loaded': bool(model)}

@app.post('/predict')
def predict(req: PredictRequest):
    if model is None:
        return {'error': 'model not trained'}
    X = np.array(req.features).reshape(1, -1)
    pred = model.predict(X).tolist()
    return {'prediction': pred}
