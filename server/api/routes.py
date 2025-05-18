from fastapi import APIRouter, UploadFile, File
router = APIRouter()

@router.get("/predict")
async def predict_queen(audio_file: UploadFile = File(...)):
    return {"prediction": "Prediction API is running"}
