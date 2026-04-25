import asyncio
import os
import instructor
from google import genai
from google.genai import types
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class UserInfo(BaseModel):
    name: str
    age: int

async def main():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("No API key")
        return
    base_client = genai.Client(api_key=api_key)
    client = instructor.from_genai(base_client, mode=instructor.Mode.GENAI_STRUCTURED_OUTPUTS, use_async=True)
    
    resp = await client.chat.completions.create(
        model="gemini-2.5-flash",
        response_model=UserInfo,
        messages=[
            {"role": "system", "content": "You extract user info."},
            {"role": "user", "content": "Maksim is 25 years old"}
        ],
        config=types.GenerateContentConfig(temperature=0.05)
    )
    print(resp.model_dump())

if __name__ == "__main__":
    asyncio.run(main())
