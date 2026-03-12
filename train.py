import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import pickle

print("Loading dataset...")
df = pd.read_csv("linkedin_synthetic_dataset.csv")

X = df["text"]
y = df["viral"]

print("Vectorizing...")
vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
X_vec = vectorizer.fit_transform(X)

print("Training model...")
model = LogisticRegression()
model.fit(X_vec, y)

print("Saving model & vectorizer...")
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("✔ Training complete! New model.pkl & vectorizer.pkl generated.")
