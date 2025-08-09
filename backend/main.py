# main.py
# Enhanced backend for the AI Marketing Persona Designer using FastAPI.

import time
import random
import asyncio
from typing import List, Optional, Dict

from fastapi import FastAPI, HTTPException, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# --- Application Setup ---
app = FastAPI(
    title="PERSONA SPARK",
    description="A robust API to generate, refine, and manage marketing personas and campaign ideas.",
    version="1.0.0",
)

# Allow all origins for development. In production, you should restrict this to your frontend's domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-Memory Data Storage (for demonstration) ---
# In a production environment, replace this with a proper database (e.g., PostgreSQL with SQLModel, or MongoDB with Beanie).
personas_db: Dict[str, 'PersonaCard'] = {}
API_CALL_DELAY_SECONDS = 2  # Simulate AI processing time

# ========== Helper Functions ==========
def generate_unique_id(prefix: str = "persona"):
    """Generates a unique ID for a new object."""
    return f"{prefix}{int(time.time())}{random.randint(1000, 9999)}"

# ========== Pydantic Data Models (Schema) ==========

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
    background: Optional[str] = Field(None, example="Priya manages a team at a fast-growing tech startup and juggles a busy family life.")
    quote: str = Field(..., example="\"I need reliable tools that just work, without a steep learning curve.\"")
    goal: str = Field(..., example="To improve team productivity and find a better work-life balance.")
    channel: str = Field(..., example="LinkedIn, Tech Blogs")
    behaviour_traits: List[str] = Field(..., example=["Prefers well-reviewed products", "Values efficiency", "Is brand-loyal once trust is established"])
    pain_points: List[str] = Field(..., example=["Wasting time on inefficient software", "Information overload from marketing", "Poor customer support"])
    recommended_messaging: str = Field(..., example="Communicate with clarity and focus on ROI. Use case studies and testimonials.")

class PersonaUpdateRequest(BaseModel):
    """A model for updating a persona. All fields are optional."""
    heading: Optional[str] = None
    name: Optional[str] = None
    age: Optional[int] = None
    pain_points: Optional[List[str]] = None
    # Add any other fields from PersonaCard you want to be updatable

class GenerationResponse(BaseModel):
    personas: List[PersonaCard]


# ========== Core AI Logic (Now uses user input) ==========

async def mock_ai_persona_generation(survey_data: str, reviews_data: str, product_positioning: str) -> List[PersonaCard]:
    """
    Mock function to simulate AI persona generation.
    This version now uses the input data to influence the generated personas.
    """
    print("AI Model: Generating personas based on user input...")
    await asyncio.sleep(API_CALL_DELAY_SECONDS)

    # --- Base Data Pools ---
    names = [("Priya Sharma", "Female"), ("Amit Singh", "Male"), ("Sunita Rao", "Female"), ("Rohan Verma", "Male"), ("Alex Mathew", "Non-binary")]
    locations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Dhanbad"]
    base_occupations = ["Marketing Director", "Data Analyst", "HR Manager", "Freelance Designer"]
    base_pain_points = ["Too much manual data entry", "Lack of integration between tools", "Confusing pricing models", "Poor customer support"]
    base_goals = ["To streamline workflow and increase efficiency.", "To find products that align with my values.", "To learn new skills and advance my career."]

    # --- Analyze Input and Adjust Data Pools ---
    positioning_lower = product_positioning.lower()
    custom_pain_points = []
    
    # Example of adjusting logic based on keywords in product_positioning
    if "student" in positioning_lower:
        occupations = ["University Student", "Intern", "Part-time Tutor"]
        goals = ["To manage study schedules effectively", "To find budget-friendly tools", "To collaborate on group projects"]
        age_range = (18, 24)
    elif "luxury" in positioning_lower or "premium" in positioning_lower:
        occupations = ["Architect", "Business Owner", "Consultant", "Doctor"]
        goals = ["To acquire high-quality, long-lasting products", "To experience premium customer service"]
        age_range = (35, 60)
    else:
        occupations = base_occupations
        goals = base_goals
        age_range = (25, 55)

    if "eco-friendly" in positioning_lower or "sustainable" in positioning_lower:
        custom_pain_points.append("Difficulty finding genuinely sustainable brands.")
    if "save money" in positioning_lower or "budget" in positioning_lower:
        custom_pain_points.append("Products are often too expensive for the value offered.")


    # --- Generate Personas ---
    num_personas = random.randint(2, 3)
    generated_personas = []

    for _ in range(num_personas):
        name, gender = random.choice(names)
        
        # Combine base pain points with custom ones derived from input
        final_pain_points = base_pain_points + custom_pain_points
        
        persona = PersonaCard(
            id=generate_unique_id(),
            heading=random.choice(["The Ambitious Achiever", "The Cautious Planner", "The Creative Innovator", "The Busy Parent"]),
            name=name,
            gender=gender,
            age=random.randint(*age_range),
            occupation=random.choice(occupations),
            location=random.choice(locations),
            quote=random.choice([
                "Give me the data, and I'll make the decision.",
                "How can this product fit into my daily routine?",
                "I'm always looking for the next big thing."
            ]),
            goal=random.choice(goals),
            channel=random.choice(["LinkedIn", "Instagram", "Tech Forums", "YouTube"]),
            behaviour_traits=random.sample(["Seeks peer reviews", "Is budget-conscious", "Early adopter of new tech", "Prefers visual content"], k=2),
            pain_points=random.sample(final_pain_points, k=min(len(final_pain_points), 2)),
            recommended_messaging=f"Focus on what matters to {name.split()[0]}: {random.choice(goals).lower()}"
        )
        generated_personas.append(persona)

    print(f"AI Model: Generated {len(generated_personas)} personas influenced by input.")
    return generated_personas

async def mock_ai_campaign_generation(persona: PersonaCard) -> List[CampaignIdea]:
    """Mock function to generate campaign ideas for a specific persona."""
    print(f"AI Model: Generating campaigns for {persona.name}...")
    await asyncio.sleep(API_CALL_DELAY_SECONDS / 2)

    angles = [
        f"Address {persona.name}'s primary pain point: {persona.pain_points[0]}",
        f"Show how our product helps achieve their goal of '{persona.goal}'",
        "Create content for their preferred channel, " + persona.channel,
    ]
    formats = [
        "A series of 'how-to' blog posts.",
        "Targeted LinkedIn ad campaign with a testimonial.",
        "An email drip campaign with success stories.",
        "Instagram Reels showcasing key features.",
    ]
    
    return [CampaignIdea(angle=random.choice(angles), format=random.choice(formats)) for _ in range(2)]


# ========== API Endpoints ==========

@app.post("/api/generate-personas", response_model=GenerationResponse, status_code=201)
async def generate_personas(
    survey_data: UploadFile = File(..., description="CSV, TXT, or PDF of survey results"),
    customer_reviews: UploadFile = File(..., description="File containing customer reviews"),
    product_positioning: str = Form(..., description="Detailed description of the product and its positioning")
):
    """
    Generate a list of new marketing personas based on uploaded data and product info.
    """
    try:
        # In a real application, you'd use libraries like pandas, pypdf, etc., to parse these files.
        survey_content = (await survey_data.read()).decode('utf-8')
        reviews_content = (await customer_reviews.read()).decode('utf-8')

        # Call the core logic to get personas
        new_personas = await mock_ai_persona_generation(
            survey_data=survey_content,
            reviews_data=reviews_content,
            product_positioning=product_positioning
        )
        
        # Store the new personas in our 'database'
        for p in new_personas:
            personas_db[p.id] = p
        
        return GenerationResponse(personas=new_personas)

    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.get("/api/personas", response_model=List[PersonaCard])
async def get_all_personas():
    """Retrieve all personas that have been generated in the current session."""
    return list(personas_db.values())

@app.get("/api/personas/{persona_id}", response_model=PersonaCard)
async def get_persona_by_id(persona_id: str):
    """Retrieve a single persona by its unique ID."""
    persona = personas_db.get(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    return persona

@app.put("/api/personas/{persona_id}/refine", response_model=PersonaCard)
async def refine_persona(persona_id: str, updates: PersonaUpdateRequest):
    """Refine or update specific attributes of an existing persona."""
    persona = personas_db.get(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    # Get the update data, excluding any fields that were not set in the request
    update_data = updates.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    # Update the persona object with the new data
    updated_persona = persona.model_copy(update=update_data)
    personas_db[persona_id] = updated_persona # Save the updated persona back to the DB

    print(f"Refined Persona {persona_id}. New data: {update_data}")
    return updated_persona

@app.get("/api/personas/{persona_id}/generate-campaigns", response_model=List[CampaignIdea])
async def generate_campaigns_for_persona(persona_id: str):
    """Generate a list of marketing campaign ideas for a specific persona."""
    persona = personas_db.get(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    
    return await mock_ai_campaign_generation(persona)

@app.get("/", include_in_schema=False)
async def root():
    return {"message": "AI Persona Designer API is running. Visit /docs for API documentation."}