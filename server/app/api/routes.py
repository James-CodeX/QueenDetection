from fastapi import APIRouter
router = APIRouter()

@router.get("/predict")
async def predict_queen():
    return {"prediction": "Prediction API is running"}
