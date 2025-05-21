from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np
import librosa
import joblib
import os
import matplotlib.pyplot as plt
import librosa.display
import io
import base64
from pathlib import Path

router = APIRouter()

# Load the trained model and scaler
MODEL_PATH = Path(__file__).parent.parent / "model" / "queenbee_rf_model.pkl"
SCALER_PATH = Path(__file__).parent.parent / "model" / "scaler.pkl"

if not MODEL_PATH.exists():
    raise RuntimeError("Model file not found. Please ensure the model is trained and saved.")
if not SCALER_PATH.exists():
    raise RuntimeError("Scaler file not found. Please ensure the scaler is saved.")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

def extract_features(audio_path, include_mfcc_stats=True):
    try:
        # Load audio (preserve original sample rate)
        y, sr = librosa.load(audio_path, sr=None)

        # Silence trimming
        y, _ = librosa.effects.trim(y, top_db=20)

        # Amplitude normalization
        if np.max(np.abs(y)) != 0:
            y = y / np.max(np.abs(y))

        # Feature extraction
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mel_spec = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
        zero_crossing_rate = librosa.feature.zero_crossing_rate(y)

        features = []

        # Add basic feature stats (mean, std, min, max)
        for feature in [spectral_centroid, spectral_bandwidth, spectral_rolloff, zero_crossing_rate]:
            features.extend([
                np.mean(feature),
                np.std(feature),
                np.min(feature),
                np.max(feature)
            ])

        # Add mel spectrogram stats
        for i in range(mel_spec_db.shape[0]):
            features.extend([
                np.mean(mel_spec_db[i]),
                np.std(mel_spec_db[i])
            ])

        # Optionally add MFCC stats
        if include_mfcc_stats:
            for i in range(mfccs.shape[0]):
                features.extend([
                    np.mean(mfccs[i]),
                    np.std(mfccs[i])
                ])

        return np.array(features), y, sr, mfccs, mel_spec_db

    except Exception as e:
        print(f"Error processing {audio_path}: {str(e)}")
        return None, None, None, None, None

@router.post("/predict")
async def predict_queen(audio_file: UploadFile = File(...)):
    temp_path = f"temp_{audio_file.filename}"
    try:
        # Save uploaded file temporarily
        with open(temp_path, "wb") as buffer:
            content = await audio_file.read()
            buffer.write(content)

        # Extract features with MFCC stats
        feature_vector, y, sr, mfccs, mel_spec_db = extract_features(temp_path, include_mfcc_stats=True)

        if feature_vector is not None:
            # Scale and predict
            feature_vector_scaled = scaler.transform([feature_vector])
            prediction = model.predict(feature_vector_scaled)[0]
            prob = model.predict_proba(feature_vector_scaled)[0].max()
            label = "Queen Bee is Present" if prediction == 1 else "Queen Bee is Absent"

            print(f"Prediction: {label} (Confidence: {prob:.2f})")

            img_base64 = create_feature_plots(y, sr, mfccs, mel_spec_db)

            return {
                "prediction": label,
                "confidence": f"{float(prob) * 100:.2f}%",
                "feature_plot": f"data:image/png;base64,{img_base64}"
            }
        else:
            print("Could not extract features from audio.")
            raise HTTPException(status_code=400, detail="Could not extract features from audio file")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def create_feature_plots(y, sr, mfccs, mel_spec_db):
    fig, axs = plt.subplots(2, 2, figsize=(18, 12))
    
    # Waveform
    librosa.display.waveshow(y, sr=sr, ax=axs[0, 0])
    axs[0, 0].set_title("Waveform\n(Time domain representation of the audio signal)", fontsize=14)
    axs[0, 0].set_xlabel("Time (seconds)", fontsize=12)
    axs[0, 0].set_ylabel("Amplitude", fontsize=12)
    
    # Mel Spectrogram (dB)
    img1 = librosa.display.specshow(mel_spec_db, sr=sr, x_axis='time', y_axis='mel', ax=axs[0, 1])
    axs[0, 1].set_title("Mel Spectrogram (dB)\n(Frequency content over time using Mel scale)", fontsize=14)
    axs[0, 1].set_xlabel("Time (seconds)", fontsize=12)
    axs[0, 1].set_ylabel("Mel Frequency (Hz)", fontsize=12)
    fig.colorbar(img1, ax=axs[0, 1], format="%+2.0f dB", label="Decibels (dB)")
    
    # MFCC
    img2 = librosa.display.specshow(mfccs, x_axis='time', sr=sr, ax=axs[1, 0])
    axs[1, 0].set_title("MFCC (Mel-Frequency Cepstral Coefficients)\n(Representation of the short-term power spectrum of sound)", fontsize=14)
    axs[1, 0].set_xlabel("Time (seconds)", fontsize=12)
    axs[1, 0].set_ylabel("MFCC Coefficient Index", fontsize=12)
    fig.colorbar(img2, ax=axs[1, 0], label="Coefficient Amplitude")
    
    # Zero Crossing Rate
    zcr = librosa.feature.zero_crossing_rate(y)
    time = np.linspace(0, len(y) / sr, num=len(zcr[0]))
    axs[1, 1].plot(time, zcr[0], color='orange')
    axs[1, 1].set_title("Zero Crossing Rate\n(Rate at which the audio signal changes sign)", fontsize=14)
    axs[1, 1].set_xlabel("Time (seconds)", fontsize=12)
    axs[1, 1].set_ylabel("Zero Crossing Rate", fontsize=12)
    axs[1, 1].grid(True)
    
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close(fig)
    buf.seek(0)
    
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return img_base64