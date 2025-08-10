#  PersonaSpark — AI persona generator

We know that data plays a crucial role in driving business growth. The ability to analyze this data efficiently can reduce workload exponentially.

We, the members of Team **WildCoders**, developed an AI agent called **PersonaSpark** — a smart tool that generates marketing personas in a matter of seconds, helping teams make faster, data-driven decision.

---

## 💡 How It Works

AgentForce takes **three types of customer research input**:
- **Product Briefs**
- **Survey Responses**
- **Customer Reviews**

These are sent to an **AI backend**, which:
1. Analyzes and synthesizes the data
2. Extracts key audience insights
3. Generates **marketing personas**
4. Suggests **custom campaign ideas**

---

## ✨ Features

- **Persona Generation**
- Campaign idea generation
- Can upload different types of file formats
- Refine persona with AI
- Full-stack: React frontend + FastAPI backend

---

## 🛠 Tech Stack

| Layer       | Tools Used                                              |
|-------------|---------------------------------------------------------|
| **Frontend**| React (Vite), TailwindCSS, shadcn/ui, lucide-react      |
| **Backend** | Python, FastAPI, Uvicorn, Pydantic, Google-generativeAI |
| **AI Model**| Google Gemini                                           |
| **Hosting** | Netlify (frontend), Render (backend)                    |

---

## 🖼️ Frontend Overview (`frontend/`)

- Features:
  - Upload form for reviews, briefs, and surveys
  - Fetch logic using `fetch()` to FastAPI endpoints
  - Displays personas with modals and expandable detail cards

---

## 🧠 Backend Overview (`backend/`)

- Contains endpoints for:
  - `/generate_personas` — Create personas from uploaded data
  - `/generate_campaigns` — Generate campaign ideas based on personas

---

## 🚀 How to Run Locally

Clone the repository:

git clone https://github.com/your-username/AgentForce_WildCoders.git
cd AgentForce_WildCoders

### Backend Setup

cd backend
python -m venv venv
source venv/Scripts/activate (or `source venv/bin/activate` on Unix)
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend Setup

cd ../frontend
npm install
npm run dev

## 🚀  How to test the deployed AI agent:

- Open any web browser
- Search for **personaspark.netlify,app**
- Enter the user-input

---

## 👥 Team WildCoders 

We are a passionate team of developers who built **PersonaSpark** as part of the **AgentForce Hackathon**.

### 🧠 Team Members

| Name              | Role                             | GitHub                                           | LinkedIn                                                                 |
|-------------------|----------------------------------|--------------------------------------------------|--------------------------------------------------------------------------|
| Gagandeep Korupolu| Backend Developer                | [@Gagan1724](https://github.com/Gagan1724)       | [Gagandeep Korupolu](https://www.linkedin.com/in/gagandeep-korupolu-ab7615320) |
| Rahul Korrapati   | Frontend Developer               | [@korrapatirahul](https://github.com/korrapatirahul) | [Rahul Korrapati](https://www.linkedin.com/in/rahulkorrapati218)             |




---

Made with ❤️ by Team WildCoders.
