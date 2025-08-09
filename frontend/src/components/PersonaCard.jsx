import React, { useState } from "react";

function PersonaCard({ persona }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/personas/${persona.id}/generate-campaigns`);
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error("Error generating campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">{persona.heading}</h2>
      <p><strong>Name:</strong> {persona.name}</p>
      <p><strong>Age:</strong> {persona.age}</p>
      <p><strong>Gender:</strong> {persona.gender}</p>
      <p><strong>Occupation:</strong> {persona.occupation}</p>
      <p><strong>Goal:</strong> {persona.goal}</p>
      <p><strong>Pain Points:</strong> {persona.pain_points.join(", ")}</p>
      <p><strong>Preferred Channel:</strong> {persona.channel}</p>
      <p className="italic mt-2">"{persona.quote}"</p>

      <button
        onClick={generateCampaigns}
        disabled={loading}
        className="mt-4 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-green-300"
      >
        {loading ? "Generating..." : "Generate Campaigns"}
      </button>

      {campaigns.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Campaign Ideas</h3>
          <ul className="list-disc list-inside mt-2 space-y-1">
            {campaigns.map((camp, idx) => (
              <li key={idx}>
                <strong>{camp.angle}</strong> — <em>{camp.format}</em>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PersonaCard;
