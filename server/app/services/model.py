import joblib

def load_model():
    return joblib.load("model/queen_model.pkl")

def predict(model, features):
    pred = model.predict([features])
    return "queen" if pred[0] == 1 else "no_queen"
