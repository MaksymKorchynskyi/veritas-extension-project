import asyncio
from app.services.ml.ml_models import analyze_text_ml, ml_service
from app.services.pipeline import process_article
from app.models.schemas import AnalysisRequest, ParagraphModel

ml_service.initialize()
text = "Зеленський підписав закон про посилення відповідальності за порушення військового обліку"

async def main():
    ml_res = await analyze_text_ml(text)
    print("ML:", ml_res)
    req = AnalysisRequest(
        url="https://example.com",
        title="Зеленський",
        html_content="<p>Зеленський підписав закон про посилення відповідальності за порушення військового обліку</p>",
        paragraphs=[ParagraphModel(id=1, text=text)],
        language="uk"
    )
    res = await process_article(req)
    print("Final Score:", res.trust_score)

asyncio.run(main())
