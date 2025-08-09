# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os

# Set up your OpenAI API key from an environment variable
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

app = FastAPI()

class PersonaInput(BaseModel):
    survey_data: str
    customer_reviews: str
    product_positioning: str

# Define the endpoint for persona and campaign generation
@app.post("/generate_persona")
async def generate_persona(input_data: PersonaInput):
    """
    Generates a marketing persona and campaign ideas based on input data.
    """
    # ----------------------------------------------------
    #  STEP 1: LLM Prompt for Persona Generation
    # ----------------------------------------------------
    persona_prompt = f"""
    You are an expert marketing strategist. Based on the following data, generate a detailed marketing persona.
    Survey Data: {input_data.survey_data}
    Customer Reviews: {input_data.customer_reviews}
    Product Positioning: {input_data.product_positioning}

    Provide the following fields: name, age/gender, occupation, quote, goals, pain points, and a short heading for the card.
    Return the response as a JSON object.
    """
    
    # Placeholder for the actual LLM call
    # llm_response = client.chat.completions.create(...)

    # For now, we'll return a placeholder to test the API
    generated_persona = {
        "name": "Tech Savvy Tony",
        "title": "Software Engineer",
        "heading": "The Tech Explorer",
        "quote": "I want tools that just work.",
        "goals": ["Improve workflow", "Automate repetitive tasks"],
        "pain_points": ["Clunky software interfaces", "Slow performance"]
    }

    # ----------------------------------------------------
    #  STEP 2: LLM Prompt for Campaign Generation (optional)
    # ----------------------------------------------------
    # You would send a new prompt here using the generated_persona as context

    # Placeholder for campaign ideas
    campaigns = [
        {"angle": "Efficiency First", "formats": ["Blog Post", "LinkedIn Ad"]},
        {"angle": "Seamless Integration", "formats": ["Case Study", "Product Demo Video"]}
    ]

    return {"persona": generated_persona, "campaigns": campaigns}

# TODO: Add the /export_pdf endpoint here
# @app.post("/export_pdf")
# async def export_pdf(data: dict):
#     ...