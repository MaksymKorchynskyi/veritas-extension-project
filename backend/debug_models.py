"""
VERITAS Debug Script
Lists all available Gemini models for your API key
Run: python debug_models.py
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ ERROR: GEMINI_API_KEY not found in .env file")
    exit(1)

print(f"✅ API Key loaded (ending in ...{api_key[-4:]})")
genai.configure(api_key=api_key)

print("\n📋 Available models that support generateContent:\n")
print("-" * 60)

try:
    models = genai.list_models()
    content_models = []
    
    for model in models:
        # Check if model supports generateContent
        if 'generateContent' in model.supported_generation_methods:
            content_models.append(model.name)
            print(f"  ✓ {model.name}")
            print(f"    Display: {model.display_name}")
            print(f"    Methods: {', '.join(model.supported_generation_methods)}")
            print()
    
    print("-" * 60)
    print(f"\n📌 Total models supporting generateContent: {len(content_models)}")
    
    # Suggest best model for VERITAS
    print("\n💡 Recommended for VERITAS:")
    for name in content_models:
        if 'flash' in name.lower() or 'pro' in name.lower():
            print(f"   → {name}")

except Exception as e:
    print(f"❌ Error listing models: {e}")
