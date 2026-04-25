from transformers import pipeline
p1 = pipeline("text-classification", model="hamzab/roberta-fake-news-classification")
print("Roberta Fake News config labels:", p1.model.config.id2label)
p2 = pipeline("text-classification", model="elozano/bert-base-cased-clickbait-news")
print("Bert Clickbait config labels:", p2.model.config.id2label)
