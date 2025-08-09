import React, { useState } from "react";
import PersonaCard from "./components/PersonaCard";

function App() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);

  const generatePersonas = () => {
    setLoading(true);

    fetch("http://localhost:8000/generate-persona", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        survey_data: "This is some mock survey data",
        customer_reviews: "These are some example customer reviews",
        product_positioning: "This product helps people stay productive using AI tools.",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPersonas([data.persona]); // backend returns single object → wrap in array
        setLoading(false);
        console.log("Received Personas:", data);
      })
      .catch((err) => {
        console.error("Error fetching personas:", err);
        setLoading(false);
      });
  };

  return (
    <div className="p-6 font-sans text-center">
      <h1 className="text-3xl font-bold mb-4">AI Marketing Persona Generator</h1>

      <button
        onClick={generatePersonas}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Generate Personas
      </button>

      {loading && <p className="mt-4">Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {personas.length > 0 ? (
          personas.map((persona, index) => (
            <PersonaCard key={index} persona={persona} />
          ))
        ) : (
          !loading && <p className="mt-4 col-span-2">No personas yet. Please click Generate.</p>
        )}
      </div>
    </div>
  );
}

export default App;
