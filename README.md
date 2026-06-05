# 🧠 Calyros AI

### Transforming Food Labels into Personalized Health Intelligence

Calyros AI is an AI-powered nutrition intelligence platform that helps users understand food products by analyzing nutrition labels, ingredients, allergens, additives, and nutritional value using OCR and Large Language Models.

Instead of forcing users to manually interpret complex nutrition labels, Calyros AI converts food packaging into actionable health insights and personalized recommendations.

---

## 🚀 Problem Statement

Millions of consumers purchase packaged food every day but struggle to understand:

* Complex nutrition labels
* Hidden sugars
* Artificial additives
* Preservatives
* Allergens
* Marketing claims
* Product suitability for personal health goals

Most users end up asking:

> "Can I eat this product?"

Traditional nutrition labels provide information but not understanding.

---

## 💡 Solution

Calyros AI acts as an intelligent nutrition assistant.

Users simply upload a food label image, and the platform:

1. Extracts text using OCR
2. Uses AI to identify nutrition facts and ingredients
3. Detects allergens and additives
4. Generates a health score
5. Provides personalized nutritional insights
6. Allows users to ask follow-up questions through an AI nutrition chatbot

---

# ✨ Features

## 📷 Smart Nutrition Label Scanner

Upload a nutrition label image and instantly receive:

* Product identification
* Ingredient analysis
* Nutrition facts extraction
* Allergen detection
* Additive detection

---

## 🤖 AI-Powered Nutrition Intelligence

The platform intelligently identifies:

### Nutrients

* Protein
* Fiber
* Sugar
* Carbohydrates
* Fat
* Sodium

### Vitamins & Minerals

* Vitamin A
* Vitamin B Complex
* Vitamin C
* Vitamin D
* Calcium
* Iron
* Zinc
* Magnesium
* Potassium

### Other Important Components

* Amino acids
* Electrolytes
* Omega fatty acids
* Preservatives
* Artificial sweeteners
* Food additives

---

## 📊 Personalized Health Scoring

Every scanned product receives:

* Health Score (0–100)
* Product Classification
* Nutritional Assessment
* Personalized Recommendations

Example:

```text
Health Score: 78/100

Classification:
Good

Summary:
Moderate sugar content but high protein and useful micronutrients.
```

---

## ⚠️ Allergy-Aware Analysis

Calyros AI distinguishes between:

### Product Allergens

Ingredients present in the food:

* Milk
* Soy
* Wheat
* Eggs
* Peanuts

### User Allergy Conflicts

The system only triggers warnings when:

```text
Product Allergen ∩ User Allergy Profile ≠ ∅
```

Example:

```text
🚨 Allergy Alert

This product contains Milk,
which matches your allergy profile.
```

---

## 💬 Nutra AI Chat Assistant

After scanning a product, users can ask:

* Can I eat this daily?
* Is this suitable for weight loss?
* Is this good for muscle gain?
* Are there healthier alternatives?
* Does this contain harmful ingredients?

The chatbot uses:

* User Profile
* Health Goals
* Dietary Preferences
* Scan Results
* Nutrition Data

to generate personalized responses.

---

# 🏗 System Architecture

## Scan Pipeline

```text
User Uploads Image
        │
        ▼
     EasyOCR
(Text Extraction)
        │
        ▼
Llama 4 Scout
(Structured Extraction)
        │
        ▼
Nutrition Parser
(Data Validation)
        │
        ▼
Nutrition Intelligence Engine
(Scoring & Analysis)
        │
        ▼
PostgreSQL Database
        │
        ▼
Frontend Dashboard
```

---

## Chat Pipeline

```text
User Question
        │
        ▼
Context Builder
        │
        ▼
User Profile
+
Scan Results
+
Health Score
        │
        ▼
GPT-OSS-120B
        │
        ▼
Personalized Response
```

---

# 🛠 Tech Stack

## Frontend

* React
* Vite
* React Router
* React Query
* Tailwind CSS

## Backend

* FastAPI
* SQLAlchemy
* Pydantic
* Alembic

## AI Layer

* EasyOCR
* Groq API
* Llama 4 Scout
* GPT-OSS-120B

## Database

* PostgreSQL (Neon)

## Storage

* Supabase Storage

## Authentication

* JWT Authentication
* OAuth2 Password Flow

---

# 📂 Project Structure

```text
calyros-ai/
│
├── frontend/
│   ├── src/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── services/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── core/
│   │   └── database/
│   │
│   └── alembic/
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/calyros-ai.git

cd calyros-ai
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

Create `.env`

```env
DATABASE_URL=

SECRET_KEY=

REFRESH_SECRET_KEY=

GROQ_API_KEY_SCOUT=

GROQ_API_KEY_CHAT=

SUPABASE_URL=

SUPABASE_KEY=
```

Run migrations:

```bash
alembic upgrade head
```

Start backend:

```bash
uvicorn app.main:app --reload
```

---

## Frontend Setup

```bash
npm install

npm run dev
```

---

# 📈 Future Roadmap

### Phase 1

* Nutrition Label Scanning
* Personalized Analysis
* AI Chat Assistant

### Phase 2

* Barcode Scanner
* Mobile Application
* Multi-language Support

### Phase 3

* Meal Tracking
* Grocery Recommendations
* Diet Planning
* Voice Assistant

### Phase 4

* Wearable Integration
* Health Monitoring
* Predictive Nutrition Intelligence

---

# 🎯 Impact

## For Consumers

* Better food choices
* Increased nutrition awareness
* Personalized guidance

## For Healthcare

* Preventive health support
* Improved dietary habits
* Data-driven nutrition decisions

---

# 🌍 Vision

> To become the world's most intelligent AI-powered nutrition companion, helping people make healthier food decisions through personalized nutrition intelligence.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👥 Contributors

Contributions, issues, and feature requests are welcome.

If you would like to contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

### Built with ❤️ using AI, FastAPI, React, OCR, and Large Language Models.
