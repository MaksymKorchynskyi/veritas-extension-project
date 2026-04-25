import asyncio
from app.services.pipeline import process_article
from app.models.schemas import AnalysisRequest, ParagraphModel

text = "Нацбанк зберіг облікову ставку на рівні 13% — роз'яснення регулятора"

async def main():
    req = AnalysisRequest(
        url="https://example.com",
        title="НБУ",
        html_content=f"<p>{text}</p>",
        paragraphs=[ParagraphModel(id=1, text=text)],
        language="uk"
    )
    res = await process_article(req)
    print("Final Score:", res.trust_score)

asyncio.run(main())
