import asyncio
from app.services.ml.ml_models import analyze_text_ml, ml_service
ml_service.initialize()
text1 = "ТЕРМІНОВО!!! ВИ НЕ ПОВІРИТЕ ЩО ВІДКРИЛИ ВЧЕНІ!!! Захід цинічно зраджує Україну — таємна підготовка до капітуляції"
text2 = "ЄС офіційно скасовує паперові гроші: Європарламент ухвалив скандальну директиву щодо переходу на цифру"
print(asyncio.run(analyze_text_ml(text1)))
print(asyncio.run(analyze_text_ml(text2)))
