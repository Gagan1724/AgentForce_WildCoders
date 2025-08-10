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

# Load environment variables from a .env file in your project root
load_dotenv()

app = FastAPI(
    title="PERSONA SPARK",
    description="A robust API to generate, refine, and manage marketing personas and campaign ideas.",
    version="1.2.0", # Incremented version
)

# --- AI Model Configuration ---
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables.")
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"Error configuring Generative AI: {e}")

# Allow all origins for development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-Memory Data Storage (for demonstration) ---
personas_db: Dict[str, 'PersonaCard'] = {}

# ========== Helper Functions ==========
def generate_unique_id(prefix: str = "persona"):
    """Generates a unique ID for a new object."""
    return f"{prefix}{int(time.time())}{random.randint(1000, 9999)}"

# ========== Pydantic Data Models (Unchanged) ==========

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

class PersonaUpdateRequest(BaseModel):
    heading: Optional[str] = None
    name: Optional[str] = None
    age: Optional[int] = None
    pain_points: Optional[List[str]] = None

class GenerationResponse(BaseModel):
    personas: List[PersonaCard]


# ========== Core AI Logic (Unchanged) ==========

async def generate_personas_with_real_ai(survey_data: str, reviews_data: str, product_positioning: str) -> List[PersonaCard]:
    """
    Calls the Google Gemini API to generate personas based on user input.
    """
    generation_config = { "response_mime_type": "application/json" }
    model = genai.GenerativeModel("gemini-1.5-flash-latest", generation_config=generation_config)
    prompt = f"""
    Analyze the following customer data to create three distinct, detailed marketing personas.
    Your output MUST be a valid JSON object with a single key "personas" which contains a list of these three persona objects.

    *Primary Input Data:*
    1.  *Product Positioning Statement:* "{product_positioning}"
    2.  *Customer Survey Insights (summary):* "{survey_data}"
    3.  *Customer Reviews (summary):* "{reviews_data}"

    *Instructions:*
    For each of the three personas, generate all the following fields based on the input data:
    - heading, name, age, gender, occupation, location, background, quote, goal, channel,
    - behaviour_traits (list), pain_points (list), and recommended_messaging.
    Do NOT include "id" or "photo_url" fields in your JSON output.
    """
    try:
        print("Calling Gemini API to generate personas...")
        response = await model.generate_content_async(prompt)
        response_json = json.loads(response.text)
        generated_personas = []
        for persona_data in response_json.get("personas", []):
            persona_data["id"] = generate_unique_id()
            persona_data["photo_url"] = f"https://placehold.co/500x500/E2E8F0/4A5568?text={persona_data.get('name', 'P').split(' ')[0]}"
            validated_persona = PersonaCard(**persona_data)
            generated_personas.append(validated_persona)
        if not generated_personas: raise ValueError("AI model returned an empty list of personas.")
        print(f"Successfully generated and validated {len(generated_personas)} personas from AI.")
        return generated_personas
    except (json.JSONDecodeError, ValidationError, ValueError) as e:
        print(f"Error parsing or validating AI response: {e}")
        print(f"Raw AI response text: {response.text if 'response' in locals() else 'No response'}")
        raise HTTPException(status_code=500, detail="Failed to process the response from the AI model. The format was invalid.")
    except Exception as e:
        print(f"An unexpected error occurred with the AI model: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred with the AI model: {e}")

# ========== NEW: WebSocket Connection Manager ==========
class ConnectionManager:
    def _init_(self):
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

# ========== NEW: Real-time AI Refinement Logic ==========
async def refine_persona_with_ai(persona: PersonaCard, instruction: str) -> dict:
    """
    Uses an AI model to refine a persona based on a user's natural language instruction.
    Returns a dictionary containing only the updated fields.
    """
    generation_config = {"response_mime_type": "application/json"}
    model = genai.GenerativeModel("gemini-1.5-flash-latest", generation_config=generation_config)

    # Convert original persona to a dictionary for the prompt
    original_persona_dict = persona.model_dump()

    prompt = f"""
    You are an AI assistant helping to refine a marketing persona.
    
    *Original Persona Data:*
    {json.dumps(original_persona_dict, indent=2)}

    *User's Instruction:*
    "{instruction}"

    *Your Task:*
    Update the original persona data based on the user's instruction.
    Your output MUST be a valid JSON object containing ONLY the fields that were changed or added.
    For example, if the user says "change age to 42", your output should be: {{"age": 42}}.
    If the user says "add 'prefers video content' to behaviour_traits", your output should include the entire updated list: 
    {{"behaviour_traits": ["Prefers well-reviewed products", "Values efficiency", "prefers video content"]}}.
    Do not include fields that were not changed.
    """
    try:
        print(f"Calling Gemini API to refine persona {persona.id}...")
        response = await model.generate_content_async(prompt)
        # The response will be a JSON object of the changed fields, e.g., {"age": 42, "occupation": "CEO"}
        updated_fields = json.loads(response.text)
        return updated_fields
    except Exception as e:
        print(f"Error during AI refinement: {e}")
        return {"error": "Failed to refine persona with AI."}


# ========== API Endpoints (HTTP part is mostly unchanged) ==========

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
    except HTTPException:
        raise
    except Exception as e:
        print(f"An error occurred in the endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

# --- Other HTTP endpoints remain the same ---
@app.get("/api/personas", response_model=List[PersonaCard])
async def get_all_personas():
    return list(personas_db.values())

@app.get("/api/personas/{persona_id}", response_model=PersonaCard)
async def get_persona_by_id(persona_id: str):
    persona = personas_db.get(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    return persona
    
# ... (PUT and GET campaigns endpoints are unchanged) ...
@app.put("/api/personas/{persona_id}/refine", response_model=PersonaCard)
async def refine_persona(persona_id: str, updates: PersonaUpdateRequest):
    persona = personas_db.get(persona_id)
    if not persona: raise HTTPException(status_code=404, detail="Persona not found")
    update_data = updates.model_dump(exclude_unset=True)
    if not update_data: raise HTTPException(status_code=400, detail="No update data provided")
    updated_persona = persona.model_copy(update=update_data)
    personas_db[persona_id] = updated_persona
    return updated_persona

async def mock_ai_campaign_generation(persona: PersonaCard) -> List[CampaignIdea]:
    await asyncio.sleep(1)
    angles = [f"Address {persona.name}'s primary pain point: {persona.pain_points[0]}", f"Show how our product helps achieve their goal of '{persona.goal}'"]
    formats = ["A series of 'how-to' blog posts.", "Targeted LinkedIn ad campaign with a testimonial."]
    return [CampaignIdea(angle=random.choice(angles), format=random.choice(formats)) for _ in range(2)]

@app.get("/api/personas/{persona_id}/generate-campaigns", response_model=List[CampaignIdea])
async def generate_campaigns_for_persona(persona_id: str):
    persona = personas_db.get(persona_id)
    if not persona: raise HTTPException(status_code=404, detail="Persona not found")
    return await mock_ai_campaign_generation(persona)

# ========== NEW: WebSocket Endpoint for Real-Time Refinement ==========
@app.websocket("/ws/refine/{client_id}/{persona_id}")
async def websocket_refine_persona(websocket: WebSocket, client_id: str, persona_id: str):
    """
    Handles real-time persona refinement using natural language over a WebSocket.
    """
    await manager.connect(websocket, client_id)
    
    # Check if the persona exists
    original_persona = personas_db.get(persona_id)
    if not original_persona:
        await manager.send_personal_message(json.dumps({"error": "Persona not found"}), client_id)
        manager.disconnect(client_id)
        return

    try:
        while True:
            # 1. Wait for a refinement instruction from the client
            instruction = await websocket.receive_text()
            
            # 2. Call the AI to get the updated fields
            await manager.send_personal_message(json.dumps({"status": "refining"}), client_id)
            updated_fields = await refine_persona_with_ai(original_persona, instruction)

            if "error" in updated_fields:
                 await manager.send_personal_message(json.dumps(updated_fields), client_id)
                 continue

            # 3. Update the persona in the database
            updated_persona = original_persona.model_copy(update=updated_fields)
            personas_db[persona_id] = updated_persona
            original_persona = updated_persona # Update for the next iteration

            # 4. Send the dictionary of changed fields back to the client
            await manager.send_personal_message(json.dumps({"status": "success", "data": updated_fields}), client_id)

    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected.")
        manager.disconnect(client_id)
    except Exception as e:
        print(f"Error in WebSocket: {e}")
        await manager.send_personal_message(json.dumps({"error": f"An unexpected error occurred: {e}"}), client_id)
        manager.disconnect(client_id)

@app.get("/", include_in_schema=False)
async def root():
    return {"message": "AI Persona Designer API is running. Visit /docs for API documentation."}