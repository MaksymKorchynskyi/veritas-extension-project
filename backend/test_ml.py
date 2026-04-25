from app.services.ml.ml_models import ml_service
import logging
logging.basicConfig(level=logging.INFO)
ml_service.initialize()
res = ml_service._analyze_sync("Це український текст. Дуже цікава стаття.")
print(res)
