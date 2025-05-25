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
import tensorflow as tf
from PIL import Image

router = APIRouter()

# Load the trained models and scaler
MODEL_PATH = Path(__file__).parent.parent / "model" / "queenbee_rf_model.pkl"
SCALER_PATH = Path(__file__).parent.parent / "model" / "scaler.pkl"
CNN_MODEL_PATH = Path(__file__).parent.parent / "model" / "queenbee_final_model.h5"

if not MODEL_PATH.exists():
    raise RuntimeError("Random Forest model file not found. Please ensure the model is trained and saved.")
if not SCALER_PATH.exists():
    raise RuntimeError("Scaler file not found. Please ensure the scaler is saved.")
if not CNN_MODEL_PATH.exists():
    raise RuntimeError("CNN model file not found. Please ensure the model is trained and saved.")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
cnn_model = tf.keras.models.load_model(CNN_MODEL_PATH)

IMG_SIZE = (128, 128)
SR = 22050

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

def prepare_cnn_input(audio_path):
    try:
        # Load and preprocess audio for CNN
        y, sr = librosa.load(audio_path, sr=22050)  # Standardize sample rate
        
        # Extract mel spectrogram
        mel_spec = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        
        # Normalize to [0, 1] range
        mel_spec_db = (mel_spec_db - mel_spec_db.min()) / (mel_spec_db.max() - mel_spec_db.min())
        
        # Reshape for CNN input (add channel dimension)
        mel_spec_db = np.expand_dims(mel_spec_db, axis=-1)
        
        return mel_spec_db, y, sr
    except Exception as e:
        print(f"Error preparing CNN input: {str(e)}")
        return None, None, None

def audio_to_spectrogram_image(audio_path):
    y, sr = librosa.load(audio_path, sr=SR)
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    S_dB = librosa.power_to_db(S, ref=np.max)
    fig = plt.figure(figsize=(2, 2), dpi=64)
    librosa.display.specshow(S_dB, sr=sr, cmap='magma')
    plt.axis('off')
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    buf.seek(0)
    img = Image.open(buf).convert('RGB').resize(IMG_SIZE)
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array, y, sr, S_dB

def visualize_audio_prediction(audio_path, model):
    y, sr = librosa.load(audio_path, sr=SR)
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    S_dB = librosa.power_to_db(S, ref=np.max)
    input_data, _, _, _ = audio_to_spectrogram_image(audio_path)
    prediction = model.predict(input_data)
    queen_prob = float(prediction[0][0])
    label = "Queen Bee is Present" if queen_prob >= 0.5 else "Queen Bee is Absent"
    confidence = queen_prob if queen_prob >= 0.5 else (1 - queen_prob)
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle(f'Audio Analysis: {os.path.basename(audio_path)}', fontsize=16, fontweight='bold')
    axes[0, 0].plot(np.linspace(0, len(y)/sr, len(y)), y, color='blue', alpha=0.7)
    axes[0, 0].set_title('Raw Audio Waveform', fontsize=14, fontweight='bold')
    axes[0, 0].set_xlabel('Time (seconds)')
    axes[0, 0].set_ylabel('Amplitude')
    axes[0, 0].grid(True, alpha=0.3)
    im = axes[0, 1].imshow(S_dB, aspect='auto', origin='lower', cmap='magma')
    axes[0, 1].set_title('Mel-Spectrogram (CNN Input)', fontsize=14, fontweight='bold')
    axes[0, 1].set_xlabel('Time Frames')
    axes[0, 1].set_ylabel('Mel Frequency Bins')
    plt.colorbar(im, ax=axes[0, 1], label='Power (dB)')
    categories = ['Queen Absent', 'Queen Present']
    probabilities = [1 - queen_prob, queen_prob]
    colors = ['red' if p == max(probabilities) else 'lightcoral' for p in probabilities]
    bars = axes[1, 0].bar(categories, probabilities, color=colors, alpha=0.8, edgecolor='black')
    axes[1, 0].set_title('Model Predictions', fontsize=14, fontweight='bold')
    axes[1, 0].set_ylabel('Probability')
    axes[1, 0].set_ylim(0, 1)
    axes[1, 0].grid(True, alpha=0.3, axis='y')
    for bar, prob in zip(bars, probabilities):
        height = bar.get_height()
        axes[1, 0].text(bar.get_x() + bar.get_width()/2., height + 0.01,
                       f'{prob:.3f}', ha='center', va='bottom', fontweight='bold')
    axes[1, 1].axis('off')
    duration = len(y) / sr
    max_amplitude = np.max(np.abs(y))
    rms_energy = np.sqrt(np.mean(y**2))
    zero_crossings = np.sum(np.diff(np.sign(y)) != 0) / len(y)
    stats_text = f"""
    Audio Statistics:\n\n    Duration: {duration:.2f} seconds\n    Sample Rate: {sr} Hz\n    Max Amplitude: {max_amplitude:.4f}\n    RMS Energy: {rms_energy:.4f}\n    Zero Crossing Rate: {zero_crossings:.4f}\n\n    Prediction Results:\n\n    Final Prediction: {label}\n    Confidence: {confidence*100:.2f}%\n\n    Queen Present Prob: {queen_prob:.3f}\n    Queen Absent Prob: {1-queen_prob:.3f}\n    """
    axes[1, 1].text(0.1, 0.9, stats_text, transform=axes[1, 1].transAxes,
                   fontsize=12, verticalalignment='top',
                   bbox=dict(boxstyle="round,pad=0.3", facecolor="lightgray", alpha=0.8))
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close(fig)
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return img_base64, label, confidence

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

@router.post("/predict/cnn")
async def predict_queen_cnn(audio_file: UploadFile = File(...)):
    temp_path = f"temp_{audio_file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            content = await audio_file.read()
            buffer.write(content)
        img_array, y, sr, S_dB = audio_to_spectrogram_image(temp_path)
        prediction = cnn_model.predict(img_array)
        queen_prob = float(prediction[0][0])
        label = "Queen Bee is Present" if queen_prob >= 0.5 else "Queen Bee is Absent"
        confidence = queen_prob if queen_prob >= 0.5 else (1 - queen_prob)
        img_base64, _, _ = visualize_audio_prediction(temp_path, cnn_model)
        return {
            "prediction": label,
            "confidence": f"{confidence*100:.2f}%",
            "feature_plot": f"data:image/png;base64,{img_base64}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def create_cnn_visualization(y, sr, mel_spec_db):
    fig, axs = plt.subplots(2, 2, figsize=(18, 12))
    
    # Waveform
    librosa.display.waveshow(y, sr=sr, ax=axs[0, 0])
    axs[0, 0].set_title("Waveform\n(Time domain representation of the audio signal)", fontsize=14)
    axs[0, 0].set_xlabel("Time (seconds)", fontsize=12)
    axs[0, 0].set_ylabel("Amplitude", fontsize=12)
    
    # Mel Spectrogram (dB)
    img1 = librosa.display.specshow(mel_spec_db[:, :, 0], sr=sr, x_axis='time', y_axis='mel', ax=axs[0, 1])
    axs[0, 1].set_title("Mel Spectrogram (Normalized)\n(Input to CNN model)", fontsize=14)
    axs[0, 1].set_xlabel("Time (seconds)", fontsize=12)
    axs[0, 1].set_ylabel("Mel Frequency (Hz)", fontsize=12)
    fig.colorbar(img1, ax=axs[0, 1], format="%+2.0f", label="Normalized Amplitude")
    
    # Spectral Centroid
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    times = librosa.times_like(spectral_centroid)
    axs[1, 0].plot(times, spectral_centroid, color='orange')
    axs[1, 0].set_title("Spectral Centroid\n(Brightness of the sound over time)", fontsize=14)
    axs[1, 0].set_xlabel("Time (seconds)", fontsize=12)
    axs[1, 0].set_ylabel("Frequency (Hz)", fontsize=12)
    axs[1, 0].grid(True)
    
    # Spectral Rolloff
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    axs[1, 1].plot(times, spectral_rolloff, color='green')
    axs[1, 1].set_title("Spectral Rolloff\n(Frequency below which 85% of the energy is contained)", fontsize=14)
    axs[1, 1].set_xlabel("Time (seconds)", fontsize=12)
    axs[1, 1].set_ylabel("Frequency (Hz)", fontsize=12)
    axs[1, 1].grid(True)
    
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close(fig)
    buf.seek(0)
    
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return img_base64

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