<div align="center">
  <img src="veritas-landing/public/favicon.svg" alt="Veritas Logo" width="120" height="120">
  <h1>Veritas News Analyzer</h1>
  <p><strong>A Hybrid AI Browser Extension for Automated News Credibility Analysis</strong></p>

  [![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

---

## 📖 Overview

**Veritas** is a powerful, AI-driven browser extension designed to help users navigate the modern information space by automatically analyzing the credibility and objectivity of news articles. 

By combining **Large Language Models (LLMs)**, **OSINT (Open-Source Intelligence) techniques**, and a **BRS-based Metzger Model scoring pipeline**, Veritas evaluates articles directly in the browser and highlights potentially manipulative, biased, or unverified claims.

## ✨ Key Features

- **🛡️ Real-Time Credibility Analysis**: Evaluates news articles on the fly as you read them.
- **🧠 Hybrid AI Pipeline**: Combines LLMs for semantic extraction with deterministic scoring (BRS-based Metzger model) for transparent evaluation.
- **🔍 Automated Fact-Checking (OSINT)**: Verifies claims against external, trusted sources and databases.
- **🎨 Intuitive UI**: Seamless browser popup and in-page highlight overlays that don't interrupt the reading experience.
- **📊 Detailed Metrics**: Breaks down scores by Objectivity, Tone, Claim Verifiability, and Source Credibility.

## 🏗️ Architecture

The project is divided into three main components:

1. **Browser Extension (`/extension`)**: 
   A lightweight JavaScript/HTML extension that extracts article text, communicates with the backend, and injects credibility overlays (highlights) back into the DOM.
   
2. **Analysis Backend (`/backend`)**:
   A high-performance Python **FastAPI** server that orchestrates the credibility pipeline. It includes:
   - **LLM Agents**: Extract claims, detect manipulation, and evaluate tone.
   - **OSINT Service**: Cross-references claims with trusted external sources.
   - **Scoring Pipeline**: Aggregates all signals using a deterministic BRS (Believability, Reliability, Source credibility) model based on Miriam Metzger's framework to produce a final "Veritas Score".

3. **Landing Page (`/veritas-landing`)**:
   A sleek, responsive promotional website built with React + Vite, showcasing the features and installation instructions for the extension.

## 🚀 Quick Start

### 1. Backend Setup

Navigate to the backend directory and install the required dependencies:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory and add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key
# Add other required keys...
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

### 2. Extension Installation

1. Open your Chromium-based browser (Chrome, Edge, Brave).
2. Navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the `/extension` folder from this repository.

### 3. Running Benchmark Tests

To validate the model's accuracy on known datasets:
```bash
cd backend
python -m pytest tests/
# or run the specific benchmark suite
python tests/benchmark_articles.py
```

## 📈 Evaluation & Benchmarks

Veritas uses a curated dataset of real-world news articles across different credibility categories (Reliable, Mixed, Fake) to continuously benchmark the accuracy of the Hybrid AI Pipeline. Test results and visualizers can be found in `backend/tests/results/`.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
