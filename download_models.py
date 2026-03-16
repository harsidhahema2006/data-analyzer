import httpx
import os
from pathlib import Path

MODELS_DIR = Path("frontend/public/models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

BASE_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
FILES = [
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
]

def download_models():
    for file in FILES:
        url = f"{BASE_URL}/{file}"
        dest = MODELS_DIR / file
        if not dest.exists():
            print(f"Downloading {file}...")
            try:
                response = httpx.get(url, follow_redirects=True)
                response.raise_for_status()
                with open(dest, "wb") as f:
                    f.write(response.content)
            except Exception as e:
                print(f"Failed to download {file}: {e}")

if __name__ == "__main__":
    download_models()
