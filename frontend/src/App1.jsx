// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';

// --- Faux shadcn/ui & lucide-react components for demonstration ---
const Card = ({ className, children }) => <div className={`border bg-card text-card-foreground shadow-sm rounded-xl ${className}`}>{children}</div>;
const CardHeader = ({ className, children }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ className, children }) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent = ({ className, children }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const Textarea = (props) => <textarea {...props} className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`} />;
const Button = ({ className, children, ...props }) => <button {...props} className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}>{children}</button>;

const Icon = ({ name, size = 24, className }) => {
    const icons = {
        Users: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>,
        Upload: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
        DocumentText: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
    };
    return <div className={className}>{icons[name]}</div>;
};

// --- Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8000'; // FastAPI default port
const WS_BASE_URL = 'ws://127.0.0.1:8000'; // FastAPI WebSocket port

const cardColors = [
    { bg: 'bg-white', border: 'border-blue-500', text: 'text-blue-800' },
    { bg: 'bg-white', border: 'border-purple-500', text: 'text-purple-800' },
    { bg: 'bg-white', border: 'border-teal-500', text: 'text-teal-800' },
    { bg: 'bg-white', border: 'border-orange-500', text: 'text-orange-800' },
    { bg: 'bg-white', border: 'border-red-500', text: 'text-red-800' },
    { bg: 'bg-white', border: 'border-indigo-500', text: 'text-indigo-800' }
];

// --- FileDropZone Component (Unchanged) ---
const FileDropZone = ({ onFileSelect, id, label, fileName, iconName = "Upload" }) => {
    const [isDragging, setIsDragging] = useState(false);
    const handleDragEnter = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) onFileSelect(e.dataTransfer.files[0]);
    };
    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) onFileSelect(e.target.files[0]);
    };

    return (
        <div
            onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
            onClick={() => document.getElementById(id).click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer ${isDragging ? 'border-indigo-600 bg-indigo-50/90' : 'border-gray-400 bg-white/60 hover:border-indigo-500'}`}
        >
            <input type="file" id={id} className="hidden" onChange={handleChange} accept=".csv,.txt,.pdf,.docx" />
            <Icon name={iconName} size={48} className="mx-auto text-gray-500" />
            <p className="mt-2 text-sm font-semibold text-gray-700">{label}</p>
            <p className="text-xs text-gray-500">Drag & drop or click to upload</p>
            {fileName && <p className="mt-2 text-sm text-indigo-600 font-medium">{fileName}</p>}
        </div>
    );
};

// --- MODIFIED: PersonaCardWithModal Component ---
function PersonaCardWithModal({ initialPersona, color, onUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // This component now manages its own persona state to allow for real-time updates.
  const [persona, setPersona] = useState(initialPersona);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  // --- NEW: State for WebSocket and Real-time Refinement ---
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinementError, setRefinementError] = useState('');
  const socket = useRef(null);
  // Generate a unique client ID for this session
  const clientId = useRef(`client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`).current;

  // Effect to manage WebSocket connection
  useEffect(() => {
    if (isModalOpen) {
      // Connect to the WebSocket when the modal opens
      const wsUrl = `${WS_BASE_URL}/ws/refine/${clientId}/${persona.id}`;
      socket.current = new WebSocket(wsUrl);

      socket.current.onopen = () => {
        console.log(`WebSocket connected for persona ${persona.id}`);
        setRefinementError('');
      };

      // Handle messages from the backend
      socket.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.status === 'refining') {
          setIsRefining(true);
          setRefinementError('');
        } else if (message.status === 'success') {
          console.log("Received updates:", message.data);
          // Merge the updated fields into the current persona state
          const updatedPersona = { ...persona, ...message.data };
          setPersona(updatedPersona);
          // Propagate the change to the parent component
          onUpdate(updatedPersona);
          setIsRefining(false);
        } else if (message.error) {
          setRefinementError(message.error);
          setIsRefining(false);
        }
      };

      socket.current.onclose = () => {
        console.log('WebSocket disconnected');
      };

      socket.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setRefinementError('Connection to refinement service failed.');
      };

    }

    // Cleanup function to close the socket when the modal is closed
    return () => {
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.close();
      }
    };
  }, [isModalOpen, persona.id, onUpdate, clientId]); // Added clientId to dependency array

  const generateCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/personas/${persona.id}/generate-campaigns`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error("Error generating campaigns:", err);
    } finally {
      setCampaignsLoading(false);
    }
  };
  
  const handleRefinementSubmit = (e) => {
    e.preventDefault();
    if (refinementInput.trim() && socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(refinementInput);
      setRefinementInput('');
    }
  };

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
          {persona.quote && <p className="italic mt-4 text-gray-700 text-ellipsis overflow-hidden">"{persona.quote}"</p>}
        </div>
        <div className="text-right mt-4">
          <span className="text-sm font-semibold text-green-700 hover:text-green-800">
            View Details & Campaigns &rarr;
          </span>
        </div>
      </div>

      {/* The Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className={`relative bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto border-t-8 ${color.border}`} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 md:p-8">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl z-10">&times;</button>
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                {/* Persona Details Section (lg:col-span-4) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* ... All existing persona details UI ... */}
                  <div>
                    <h2 className="text-5xl font-bold text-gray-800">{persona.name}</h2>
                    <p className={`text-xl font-medium ${color.text}`}>{persona.heading}</p>
                  </div>
                  {persona.quote && <div className="italic text-center text-2xl text-gray-600 bg-gray-50 p-4 rounded-lg border">"{persona.quote}"</div>}
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
                  {persona.background && <div className="bg-gray-50 p-4 rounded-lg border"><h3 className="font-bold text-lg mb-2">Background</h3><p>{persona.background}</p></div>}
                  {persona.behaviour_traits && <div className="bg-gray-50 p-4 rounded-lg border"><h3 className="font-bold text-lg mb-2">Behavior Traits</h3><ul className="list-disc list-inside">{persona.behaviour_traits.map((trait, i) => <li key={i}>{trait}</li>)}</ul></div>}
                  {persona.recommended_messaging && <div className="bg-gray-50 p-4 rounded-lg border"><h3 className="font-bold text-lg mb-2">Recommended Messaging</h3><p>{persona.recommended_messaging}</p></div>}
                </div>
                
                {/* Side Panel Section (lg:col-span-3) */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                  <img src={persona.photo_url || `https://placehold.co/500x500/E2E8F0/4A5568?text=${persona.name.split(' ').map(n=>n[0]).join('')}`} alt={persona.name} className="w-full h-auto object-cover rounded-lg shadow-md" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/500x500/E2E8F0/4A5568?text=Image'; }}/>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-bold text-lg mb-2">Demographics</h3>
                    {persona.location && <p><strong>Location:</strong> {persona.location}</p>}
                    <p><strong>Age:</strong> {persona.age}</p>
                    {persona.gender && <p><strong>Gender:</strong> {persona.gender}</p>}
                    <p><strong>Occupation:</strong> {persona.occupation}</p>
                  </div>

                  {/* --- NEW: Real-time Refinement Chat UI --- */}
                  <div className="border-t pt-6">
                    <h3 className="text-2xl font-semibold mb-3">Refine with AI</h3>
                    <p className="text-sm text-gray-600 mb-4">Use natural language to update this persona. Try "Change age to 45" or "Add 'Loves coffee' to their traits".</p>
                    <form onSubmit={handleRefinementSubmit}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={refinementInput}
                          onChange={(e) => setRefinementInput(e.target.value)}
                          placeholder="Type your instruction..."
                          className="flex-grow w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          disabled={isRefining}
                        />
                        <Button type="submit" disabled={isRefining || !refinementInput.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md">
                          {isRefining ? "..." : "Send"}
                        </Button>
                      </div>
                    </form>
                    {refinementError && <p className="text-red-500 text-sm mt-2">{refinementError}</p>}
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-2xl font-semibold mb-3">Campaign Center</h3>
                    <button onClick={generateCampaigns} disabled={campaignsLoading} className="w-full flex items-center justify-center gap-3 text-white font-bold py-3 px-6 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      <span>{campaignsLoading ? "Generating..." : "Generate Campaigns"}</span>
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

// --- Main App Component ---
export default function App() {
    const [surveyFile, setSurveyFile] = useState(null);
    const [reviewsFile, setReviewsFile] = useState(null);
    const [productPositioning, setProductPositioning] = useState('');
    const [personas, setPersonas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // NEW: Function to update a single persona in the main list
    const handleUpdatePersona = (updatedPersona) => {
        setPersonas(currentPersonas => 
            currentPersonas.map(p => p.id === updatedPersona.id ? updatedPersona : p)
        );
    };

    const handleSubmit = async () => {
        if (!productPositioning.trim()) {
            setError('Product positioning statement is required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setPersonas([]);

        const formData = new FormData();
        // Use non-empty fallback files if none are selected
        formData.append('survey_data', surveyFile || new File(["No survey data provided."], "survey.txt", {type: "text/plain"}));
        formData.append('customer_reviews', reviewsFile || new File(["No review data provided."], "reviews.txt", {type: "text/plain"}));
        formData.append('product_positioning', productPositioning);

        try {
            const response = await fetch(`${API_BASE_URL}/api/generate-personas`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Network response was not ok');
            }
            const result = await response.json();
            setPersonas(result.personas);
        } catch (error) {
            setError('Failed to fetch data. Please ensure the backend is running and refresh.');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[url('https://images.pexels.com/photos/2695569/pexels-photo-2695569.jpeg')] bg-cover bg-center bg-fixed min-h-screen font-sans">
            <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
                <header className="py-8 sm:py-12 text-center">
                    <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Persona Spark</h1>
                    <p className="text-xl text-white">Create detailed marketing personas and campaign ideas from your data.</p>
                </header>

                <Card className="mb-12 p-6 sm:p-8 shadow-2xl rounded-3xl bg-white/90 backdrop-blur-md border-blue-100">
                    <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800">Your Data Input</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FileDropZone id="survey-file" label="Upload Survey Data" onFileSelect={setSurveyFile} fileName={surveyFile?.name} iconName="Upload" />
                            <FileDropZone id="reviews-file" label="Upload Customer Reviews" onFileSelect={setReviewsFile} fileName={reviewsFile?.name} iconName="DocumentText" />
                        </div>
                        <Textarea
                            placeholder="Describe your product, its target audience, and unique selling points..."
                            value={productPositioning}
                            onChange={(e) => setProductPositioning(e.target.value)}
                            className="min-h-[120px] text-base bg-white/80"
                        />
                        <Button onClick={handleSubmit} disabled={isLoading} className="w-full text-lg py-4 sm:py-6 rounded-xl transition-all bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:shadow-none">
                            {isLoading ? 'Generating...' : 'Generate Personas'}
                        </Button>
                    </CardContent>
                </Card>

                {isLoading && <p className="text-center text-2xl text-white font-semibold my-8 animate-pulse">Generating your personas...</p>}
                {error && <p className="text-center text-2xl text-red-400 bg-red-100 p-4 rounded-lg font-semibold my-8">{error}</p>}
                
                {personas.length > 0 && (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
                        {personas.map((p, index) => (
                          <PersonaCardWithModal 
                            key={p.id} 
                            initialPersona={p} 
                            color={cardColors[index % cardColors.length]}
                            onUpdate={handleUpdatePersona} // Pass the update handler
                          />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
