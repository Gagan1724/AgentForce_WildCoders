import React, { useState, useEffect } from "react";

const cardColors = [
    { bg: 'bg-white', border: 'border-blue-500', text: 'text-blue-800' },
    { bg: 'bg-white', border: 'border-purple-500', text: 'text-purple-800' },
    { bg: 'bg-white', border: 'border-teal-500', text: 'text-teal-800' },
    { bg: 'bg-white', border: 'border-orange-500', text: 'text-orange-800' },
    { bg: 'bg-white', border: 'border-red-500', text: 'text-red-800' },
    { bg: 'bg-white', border: 'border-indigo-500', text: 'text-indigo-800' }
];

//MOCK DATA
const mockPersonas = [
    { 
      id: 1, 
      heading: 'The Ambitious Achiever', 
      name: 'Alex Chen', 
      age: 28, 
      gender: 'Male', 
      occupation: 'Software Engineer', 
      goal: 'Career advancement and finding tools that boost productivity.', 
      pain_points: ['Time management', 'Work-life balance', 'Finding high-signal resources'], 
      channel: 'LinkedIn', 
      quote: 'I need tools that help me work smarter, not harder.',
      photoUrl: 'https://placehold.co/500x500/E2E8F0/4A5568?text=Alex',
      location: 'San Francisco, CA',
      background: 'Holds a Master\'s in Computer Science. Passionate about AI and has been working in the tech industry for 5 years.',
      previous_experience: 'Has tried various productivity apps but finds them either too simple or too complex. Prefers tools with seamless integration.',
      behavior_traits: ['Data-driven', 'Goal-oriented', 'Early adopter of new technology', 'Prefers clean, minimalist UIs']
    },
    { 
      id: 2, 
      heading: 'The Creative Freelancer', 
      name: 'Brianna Smith', 
      age: 34, 
      gender: 'Female', 
      occupation: 'Graphic Designer', 
      goal: 'Finding high-quality clients and streamlining her workflow.', 
      pain_points: ['Inconsistent income', 'Client management', 'Creative block'], 
      channel: 'Instagram', 
      quote: 'My work is my passion, but the business side is a struggle.',
      photoUrl: 'https://placehold.co/500x500/E2E8F0/4A5568?text=Brianna',
      location: 'Austin, TX',
      background: 'Self-taught designer with a strong portfolio. Left a corporate job to pursue her passion for branding and illustration.',
      previous_experience: 'Uses a mix of spreadsheets and notebooks for project management. Finds it chaotic and is looking for an all-in-one solution.',
      behavior_traits: ['Visual thinker', 'Detail-oriented', 'Values community and collaboration', 'Active on design-focused social media']
    },
];

function PersonaCardWithModal({ persona, color }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://personaspark-backend.onrender.com/api/personas/${persona.id}/generate-campaigns`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error("Error generating campaigns:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isModalOpen && event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);


  return (
    <>
      {/* The clickable preview card */}
      <div
        onClick={() => setIsModalOpen(true)}
        className={`rounded-xl shadow-lg p-6 cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ${color.bg} ${color.border} border-t-8 flex flex-col justify-between h-full`}
      >
        <div>
          <h2 className={`text-2xl font-bold ${color.text}`}>{persona.heading}</h2>
          <p className="text-gray-600 mt-1 font-medium">{persona.name} ({persona.age})</p>
          <p className="italic mt-4 text-gray-700 text-ellipsis overflow-hidden">"{persona.quote}"</p>
        </div>
        <div className="text-right mt-4">
          <span className="text-sm font-semibold text-green-700 hover:text-green-800">
            View Details & Campaigns &rarr;
          </span>
        </div>
      </div>

      {/* The Modal */}
      {isModalOpen && (
         <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className={`relative bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-t-8 ${color.border}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 md:p-8">
                {/* Close Button */}
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl z-10">&times;</button>
                
                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                  
                  {/* Left Column: */}
                  <div className="md:col-span-2">
                    <img 
                      src={persona.photoUrl} 
                      alt={persona.name} 
                      className="w-full h-auto object-cover rounded-lg shadow-md"
                      onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/500x500/E2E8F0/4A5568?text=Image+Not+Found'; }}
                    />
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg border">
                      <h3 className="font-bold text-lg mb-2">Demographics</h3>
                      <p><strong>Location:</strong> {persona.location}</p>
                      <p><strong>Age:</strong> {persona.age}</p>
                      <p><strong>Gender:</strong> {persona.gender}</p>
                      <p><strong>Occupation:</strong> {persona.occupation}</p>
                    </div>
                  </div>

                  {/* Right Column: */}
                  <div className="md:col-span-4 flex flex-col gap-6">
                    <div>
                      <h2 className="text-5xl font-bold text-gray-800">{persona.name}</h2>
                      <p className={`text-xl font-medium ${color.text}`}>{persona.heading}</p>
                    </div>

                    <div className="italic text-center text-2xl text-gray-600 bg-gray-50 p-4 rounded-lg border">
                      "{persona.quote}"
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-bold text-lg mb-2 text-blue-800">Primary Goal</h3>
                        <p>{persona.goal}</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                         <h3 className="font-bold text-lg mb-2 text-red-800">Pain Points</h3>
                         <ul className="list-disc list-inside">
                           {persona.pain_points.map((point, i) => <li key={i}>{point}</li>)}
                         </ul>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border">
                       <h3 className="font-bold text-lg mb-2">Background</h3>
                       <p>{persona.background}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                       <h3 className="font-bold text-lg mb-2">Previous Experience</h3>
                       <p>{persona.previous_experience}</p>
                    </div>
                     <div className="bg-gray-50 p-4 rounded-lg border">
                       <h3 className="font-bold text-lg mb-2">Behavior Traits</h3>
                       <ul className="list-disc list-inside">
                           {persona.behavior_traits.map((trait, i) => <li key={i}>{trait}</li>)}
                         </ul>
                    </div>


                    {/* Campaign Center */}
                    <div className="mt-4 border-t pt-6">
                      <h3 className="text-2xl font-semibold mb-3">Campaign Center</h3>
                      {/* Generate Campaign Button*/}
                      <button 
                        onClick={generateCampaigns} 
                        disabled={loading} 
                        className="w-full flex items-center justify-center gap-3 text-white font-bold py-3 px-6 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>{loading ? "Generating..." : "Generate Campaigns"}</span>
                      </button>
                      {campaigns.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold">Generated Campaign Ideas</h3>
                          <ul className="list-disc list-inside mt-2 space-y-2 bg-gray-50 p-4 rounded-lg border">
                            {campaigns.map((camp, idx) => (
                              <li key={idx}><strong className={color.text}>{camp.angle}</strong> — <span className="text-sm italic">{camp.format}</span></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}
    </>
  );
}


function PersonaCard() {
  const [personas, setPersonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch("https://personaspark-backend.onrender.com/api/personas");
        if (!res.ok) throw new Error('Failed to fetch personas from the server.');
        const data = await res.json();
        setPersonas(data);
      } catch (err) {
        console.error(err.message);
        setError('Could not load personas. Displaying mock data instead.');
        setPersonas(mockPersonas);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPersonas();
  }, []);

  if (isLoading) {
    return <div className="text-center p-10 text-xl font-semibold">Loading Personas...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">Marketing Personas</h1>
            <p className="text-center text-gray-600 mb-8">Click on a card to view details and generate campaign ideas.</p>
            {error && <div className="text-center p-4 mb-4 bg-yellow-100 text-yellow-800 rounded-lg">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {personas.map((persona, index) => (
                  <PersonaCardWithModal
                      key={persona.id}
                      persona={persona}
                      color={cardColors[index % cardColors.length]}
                  />
                ))}
            </div>
        </div>
    </div>
  );
}

export default PersonaCard;
