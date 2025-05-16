from fastapi import APIRouter, File, UploadFile
from app.services.audio_processor import extract_features
from app.services.model import load_model, predict

router = APIRouter()

model = load_model()

@router.post("/predict")
async def predict_queen(file: UploadFile = File(...)):
    features = await extract_features(file)
    result = predict(model, features)
    return {"prediction": result}
