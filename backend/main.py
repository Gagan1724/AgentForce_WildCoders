from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# Allow frontend (localhost or Vercel) to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 📥 Input Model ==========
class UserInput(BaseModel):
    survey_data: Optional[str]
    customer_reviews: Optional[str]
    product_positioning: Optional[str]
    user_preferences: Optional[List[str]] = []

# ========== 📤 Output Model ==========
class PersonaCard(BaseModel):
    heading: str
    name: str
    age: int
    gender: str
    occupation: str
    photo_url: Optional[str]
    location: str
    background: Optional[str]
    quote: str
    goal: str
    channel: str
    behaviour_traits: List[str]
    pain_points: List[str]
    recommended_messaging: str

class CampaignIdea(BaseModel):
    angle: str
    format: str

class AIResponse(BaseModel):
    persona: PersonaCard
    campaigns: List[CampaignIdea]

# ========== 🧠 Core Logic (Placeholder) ==========
def generate_persona_from_input(data: UserInput) -> AIResponse:
    # This is dummy logic - replace with OpenAI API or LLM logic later
    persona = PersonaCard(
        heading="The Tech Explorer",
        name="Alex",
        age=27,
        gender="Non-binary",
        occupation="Software Developer",
        photo_url=None,
        location="Bangalore",
        background="Alex is a curious techie who loves testing new tools.",
        quote="I want tools that make my life easier, not harder.",
        goal="Stay on top of the latest in AI and productivity.",
        channel="YouTube",
        behaviour_traits=["Early adopter", "Detail-oriented", "Loyal to brands"],
        pain_points=["Too many options", "Information overload", "Lack of personalization"],
        recommended_messaging="Highlight simplicity and cutting-edge features in a friendly tone."
    )

    campaigns = [
        CampaignIdea(angle="Simplify AI", format="Instagram Reels"),
        CampaignIdea(angle="Be the first to know", format="Newsletter drip campaign"),
    ]

    return AIResponse(persona=persona, campaigns=campaigns)

# ========== 🔗 POST API Endpoint ==========
@app.post("/generate-persona", response_model=AIResponse)
def generate_persona(data: UserInput):
    try:
        result = generate_persona_from_input(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))