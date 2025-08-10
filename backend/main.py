
# main.py
# Enhanced backend for the AI Marketing Persona Designer using FastAPI and Google Gemini.

import os
import json
import time
import random
import asyncio
from typing import List, Optional, Dict

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Form, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError

# --- Application Setup ---
load_dotenv()
app = FastAPI(
    title="PERSONA SPARK",
    description="A robust API to generate, refine, and manage marketing personas and campaign ideas.",
    version="1.8.0", # Incremented version
)

# --- AI Model Configuration ---
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables.")
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"Error configuring Generative AI: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-Memory Data Storage ---
personas_db: Dict[str, 'PersonaCard'] = {}

# ========== Helper Functions ==========
def generate_unique_id(prefix: str = "persona"):
    return f"{prefix}{int(time.time())}{random.randint(1000, 9999)}"

# ========== Pydantic Data Models ==========
class CampaignIdea(BaseModel):
    angle: str = Field(..., example="Focus on Time-Saving Features")
    format: str = Field(..., example="Short-form Video (TikTok/Reels)")

class PersonaCard(BaseModel):
    id: str = Field(..., example=generate_unique_id())
    heading: str = Field(..., example="The Pragmatic Professional")
    name: str = Field(..., example="Priya Sharma")
    age: int = Field(..., example=34)
    gender: str = Field(..., example="Female")
    occupation: str = Field(..., example="Project Manager")
    photo_url: Optional[str] = Field(None, example="https://example.com/photo.jpg")
    location: str = Field(..., example="Mumbai, India")
    background: Optional[str] = Field(None, example="Priya manages a team at a fast-growing tech startup.")
    quote: str = Field(..., example="\"I need reliable tools that just work.\"")
    goal: str = Field(..., example="To improve team productivity.")
    channel: str = Field(..., example="LinkedIn, Tech Blogs")
    behaviour_traits: List[str] = Field(..., example=["Prefers well-reviewed products", "Values efficiency"])
    pain_points: List[str] = Field(..., example=["Wasting time on inefficient software", "Information overload"])
    recommended_messaging: str = Field(..., example="Communicate with clarity and focus on ROI.")

class GenerationResponse(BaseModel):
    personas: List[PersonaCard]

# ========== Core AI Logic ==========
async def generate_personas_with_real_ai(survey_data: str, reviews_data: str, product_positioning: str) -> List[PersonaCard]:
    generation_config = { "response_mime_type": "application/json" }
    model = genai.GenerativeModel("gemini-1.5-flash-latest", generation_config=generation_config)
    prompt = f"""
    Analyze the following customer data to create three distinct, detailed marketing personas. Your output MUST be a valid JSON object with a single key "personas" which contains a list of these three persona objects.
    
    **Primary Input Data:**
    1.  **Product Positioning Statement:** "{product_positioning}"
    2.  **Customer Survey Insights (summary):** "{survey_data}"
    3.  **Customer Reviews (summary):** "{reviews_data}"

    **CRITICAL INSTRUCTIONS:**
    1.  **Strict Demographic Adherence:** If the input data contains specific demographic information (like a single age, location, or occupation), **ALL** generated personas **MUST** share these exact demographic features. The personas should then be unique variations *within* that demographic constraint (e.g., different goals, pain points, names, and headings).
    2.  **Uniqueness on Iteration:** Strive to generate entirely new and unique personas that have not been seen before. Avoid repeating names, quotes, and specific combinations of traits on subsequent requests with the same input data.

    **Instructions for each persona's fields:**
    - **heading**: A highly creative, archetype-style title. Maximize variety and avoid repeating titles within the same response.
    - **name**, **age**, **gender**, **occupation**, **location**.
    - **background**, **quote**, **goal**, **channel**, **behaviour_traits** (list), **pain_points** (list), and **recommended_messaging**.
    
    Do NOT include "id" or "photo_url" in your JSON response.
    """
    try:
        print("Generating persona text data with new constraints...")
        response = await model.generate_content_async(prompt)
        response_json = json.loads(response.text)
        
        generated_personas = []
        for persona_data in response_json.get("personas", []):
            persona_data["id"] = generate_unique_id()
            
            # --- SIMPLIFIED IMAGE GENERATION (Gender-Based) ---
            # This uses a service that generates unique human avatars based on a seed.
            # The seed is a hash of the persona's name and gender to ensure a unique face.
            print(f"Generating unique avatar for {persona_data.get('name')} based on gender...")
            gender_seed = f"{persona_data.get('name')}{persona_data.get('gender')}"
            persona_data["photo_url"] = f"https://i.pravatar.cc/500?u={hash(gender_seed)}"

            validated_persona = PersonaCard(**persona_data)
            generated_personas.append(validated_persona)
            
        if not generated_personas: raise ValueError("AI model returned an empty list of personas.")
        return generated_personas
        
    except Exception as e:
        print(f"Error during persona generation: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate personas from AI model.")

async def refine_persona_with_ai(persona: PersonaCard, instruction: str) -> dict:
    generation_config = {"response_mime_type": "application/json"}
    model = genai.GenerativeModel("gemini-1.5-flash-latest", generation_config=generation_config)
    original_persona_dict = persona.model_dump()
    prompt = f"""
    You are an AI assistant helping to refine a marketing persona. **Original Persona Data:** {json.dumps(original_persona_dict, indent=2)}
    **User's Instruction:** "{instruction}"
    **Your Task:** Update the original persona data based on the user's instruction. Your output MUST be a valid JSON object containing ONLY the fields that were changed or added.
    """
    try:
        response = await model.generate_content_async(prompt)
        return json.loads(response.text)
    except Exception as e:
        print(f"Error during AI refinement: {e}")
        return {"error": "Failed to refine persona with AI."}

async def generate_campaigns_with_real_ai(persona: PersonaCard) -> List[CampaignIdea]:
    """Generates marketing campaign ideas for a persona using an AI model."""
    generation_config = {"response_mime_type": "application/json"}
    model = genai.GenerativeModel("gemini-1.5-flash-latest", generation_config=generation_config)
    
    prompt = f"""
    Based on the following marketing persona, generate 3 creative and relevant campaign ideas.
    Your output MUST be a valid JSON object with a single key "campaigns" which contains a list of 3 campaign objects.

    **Persona Details:**
    {persona.model_dump_json(indent=2)}

    **Instructions:**
    For each campaign idea, provide an "angle" and a "format".
    - The 'angle' should be a short, strategic approach (e.g., "Highlight ease of use for busy professionals").
    - The 'format' should be a specific content type (e.g., "Series of 30-second TikTok tutorials").
    """
    try:
        print(f"Generating campaign ideas for {persona.name}...")
        response = await model.generate_content_async(prompt)
        response_json = json.loads(response.text)
        
        campaign_ideas = [CampaignIdea(**idea) for idea in response_json.get("campaigns", [])]
        return campaign_ideas
    except Exception as e:
        print(f"Error during campaign generation: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate campaigns from AI model.")


# ========== WebSocket Manager ==========
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)

manager = ConnectionManager()

# ========== API Endpoints ==========
@app.post("/api/generate-personas", response_model=GenerationResponse, status_code=201)
async def generate_personas(
    survey_data: UploadFile = File(...), customer_reviews: UploadFile = File(...), product_positioning: str = Form(...)
):
    try:
        survey_content = (await survey_data.read()).decode('utf-8', errors='ignore')
        reviews_content = (await customer_reviews.read()).decode('utf-8', errors='ignore')
        new_personas = await generate_personas_with_real_ai(
            survey_data=survey_content, reviews_data=reviews_content, product_positioning=product_positioning
        )
        for p in new_personas:
            personas_db[p.id] = p
        return GenerationResponse(personas=new_personas)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.get("/api/personas/{persona_id}/generate-campaigns", response_model=List[CampaignIdea])
async def generate_campaigns_for_persona(persona_id: str):
    persona = personas_db.get(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    return await generate_campaigns_with_real_ai(persona)

@app.websocket("/ws/refine/{client_id}/{persona_id}")
async def websocket_refine_persona(websocket: WebSocket, client_id: str, persona_id: str):
    await manager.connect(websocket, client_id)
    original_persona = personas_db.get(persona_id)
    if not original_persona:
        await manager.send_personal_message(json.dumps({"error": "Persona not found"}), client_id)
        manager.disconnect(client_id)
        return
    try:
        while True:
            instruction = await websocket.receive_text()
            await manager.send_personal_message(json.dumps({"status": "refining"}), client_id)
            updated_fields = await refine_persona_with_ai(original_persona, instruction)
            if "error" in updated_fields:
                 await manager.send_personal_message(json.dumps(updated_fields), client_id)
                 continue
            updated_persona = original_persona.model_copy(update=updated_fields)
            personas_db[persona_id] = updated_persona
            original_persona = updated_persona
            await manager.send_personal_message(json.dumps({"status": "success", "data": updated_fields}), client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        await manager.send_personal_message(json.dumps({"error": f"An unexpected error occurred: {e}"}), client_id)
        manager.disconnect(client_id)
