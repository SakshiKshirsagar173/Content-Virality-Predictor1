import os
import pickle
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend JS to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Correct absolute paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(BASE_DIR, "model.pkl")
vectorizer_path = os.path.join(BASE_DIR, "vectorizer.pkl")

model = pickle.load(open(model_path, "rb"))
vectorizer = pickle.load(open(vectorizer_path, "rb"))

class InputText(BaseModel):
    text: str

@app.post("/predict")
def predict(data: InputText):
    transformed = vectorizer.transform([data.text])
    score = model.predict_proba(transformed)[0][1]
    label = "Viral" if score > 0.5 else "Not Viral"
    
    return {"score": float(score), "label": label}
