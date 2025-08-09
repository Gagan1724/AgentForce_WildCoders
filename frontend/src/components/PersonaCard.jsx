import React from 'react';

function PersonaCard({ persona }) {
  if (!persona) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-auto hover:shadow-xl transition">
      <h2 className="text-2xl font-bold text-indigo-600">{persona.heading || "Persona"}</h2>
      <p className="text-gray-700 italic mb-2">"{persona.quote}"</p>
      <ul className="text-sm text-gray-600 space-y-1 text-left">
        <li><strong>Name:</strong> {persona.name}</li>
        <li><strong>Age/Gender:</strong> {persona.age} / {persona.gender}</li>
        <li><strong>Occupation:</strong> {persona.occupation}</li>
        <li><strong>Location:</strong> {persona.location}</li>
        <li><strong>Goal:</strong> {persona.goal}</li>
        <li><strong>Pain Points:</strong> {persona.pain_points.join(", ")}</li>
        <li><strong>Channel:</strong> {persona.channel}</li>
        <li><strong>Behavior Traits:</strong> {persona.behaviour_traits.join(", ")}</li>
        <li><strong>Recommended Messaging:</strong> {persona.recommended_messaging}</li>
      </ul>
    </div>
  );
}

export default PersonaCard;
