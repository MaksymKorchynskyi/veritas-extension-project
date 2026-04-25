import asyncio
import os
import instructor
from google import genai
from pydantic import BaseModel

class UserInfo(BaseModel):
    name: str
    age: int

async def main():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("No API key")
        return
    client = genai.Client(api_key=api_key)
    client = instructor.from_gemini(client)
    
    resp = await client.chat.completions.create(
        model="gemini-2.5-flash",
        response_model=UserInfo,
        messages=[{"role": "user", "content": "Extract: Maksim is 25 years old"}]
    )
    print(resp.model_dump())

if __name__ == "__main__":
    asyncio.run(main())
