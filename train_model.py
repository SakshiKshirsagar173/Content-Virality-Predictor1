import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import pickle

# Sample training data (replace later with YouTube dataset)
data = {
    "text": [
        "This video broke the internet!",
        "Amazing tutorial, very helpful",
        "This went super viral",
        "Not interesting",
        "Boring content",
        "Nobody will watch this",
        "This is blowing up!",
        "Incredible reach and engagement"
    ],
    "label": [1, 0, 1, 0, 0, 0, 1, 1]  # 1 = viral, 0 = not viral
}

df = pd.DataFrame(data)

# TF-IDF vectorizer
vectorizer = TfidfVectorizer(stop_words="english")
X = vectorizer.fit_transform(df["text"])
y = df["label"]

# Train model
model = LogisticRegression()
model.fit(X, y)

# Save vectorizer + model
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))
pickle.dump(model, open("model.pkl", "wb"))

print("Model trained and saved successfully!")
