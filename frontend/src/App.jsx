import React, { useState, useCallback } from 'react';

// --- Faux shadcn/ui & lucide-react components for demonstration ---
// In a real project, you would install these libraries.
// e.g., `npm install lucide-react` and setup shadcn/ui.

const Card = ({ className, children }) => <div className={`border bg-card text-card-foreground shadow-sm rounded-xl ${className}`}>{children}</div>;
const CardHeader = ({ className, children }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ className, children }) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardDescription = ({ className, children }) => <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
const CardContent = ({ className, children }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const Textarea = (props) => <textarea {...props} className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`} />;
const Button = ({ className, children, ...props }) => <button {...props} className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}>{children}</button>;
const Avatar = ({ className, children }) => <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>;
const AvatarFallback = ({ children }) => <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">{children}</span>;
const Separator = () => <hr className="border-t border-gray-200" />;

const Icon = ({ name, size = 24, className }) => {
    const icons = {
        Users: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>,
        Briefcase: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
        Target: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>,
        MessageCircle: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
        Copy: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
        Check: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
        Upload: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
        DocumentText: <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
    };
    return <div className={className}>{icons[name]}</div>;
};

// --- Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8000'; // FastAPI default port

// --- FileDropZone Component ---
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

// --- Persona and Campaign Components ---
const PersonaCardComponent = ({ persona }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
    const [campaignError, setCampaignError] = useState(null);

    const handleCopyPersona = () => {
        const personaText = `Persona: ${persona.heading}\nName: ${persona.name}, Age: ${persona.age}, Occupation: ${persona.occupation}\nBackground: ${persona.background} from ${persona.location}\nGoals: ${persona.goal}\nPain Points: ${persona.pain_points.join(', ')}\nRecommended Messaging: ${persona.recommended_messaging}`;
        navigator.clipboard.writeText(personaText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        });
    };
    
    const fetchCampaigns = async () => {
        setIsLoadingCampaigns(true);
        setCampaignError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/personas/${persona.id}/generate-campaigns`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Could not generate campaigns.');
            }
            const result = await response.json();
            setCampaigns(result);
        } catch (error) {
            setCampaignError(error.message);
        } finally {
            setIsLoadingCampaigns(false);
        }
    };

    return (
        <Card className="h-full border-blue-200 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-white/90 backdrop-blur-md">
            <CardHeader className="flex flex-col items-center text-center p-6 bg-blue-50/90 rounded-t-xl relative">
                <Avatar className="h-24 w-24 mb-4 text-2xl font-bold bg-blue-100 text-blue-800">
                    <AvatarFallback>{persona.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-bold text-gray-800">{persona.heading}</CardTitle>
                <CardDescription className="text-gray-600 italic">"{persona.quote}"</CardDescription>
                <Button onClick={handleCopyPersona} className="absolute top-4 right-4 text-gray-500 hover:text-blue-600 transition-colors bg-transparent hover:bg-gray-200/50 p-2 rounded-full">
                    {isCopied ? <Icon name="Check" size={20} className="text-green-500" /> : <Icon name="Copy" size={20} />}
                </Button>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
                 <div className="flex items-start space-x-3">
                    <Icon name="Users" size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-lg text-gray-700">Demographics</h4>
                        <p className="text-gray-600">{persona.name}, {persona.age}, {persona.occupation}</p>
                    </div>
                </div>
                <Separator />
                <div className="flex items-start space-x-3">
                    <Icon name="Briefcase" size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-lg text-gray-700">Background & Location</h4>
                        <p className="text-gray-600">{persona.background} from {persona.location}</p>
                    </div>
                </div>
                <Separator />
                <div className="flex items-start space-x-3">
                    <Icon name="Target" size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-lg text-gray-700">Goals & Pain Points</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>Goal: {persona.goal}</li>
                            {persona.pain_points.map((point, idx) => <li key={idx}>Pain Point: {point}</li>)}
                        </ul>
                    </div>
                </div>
                <Separator />
                 <div className="p-4 bg-gray-50/70 border-t border-white/20 rounded-b-xl -m-6 mt-6">
                    {campaigns.length > 0 ? (
                         <div className="space-y-2 p-4">
                            <h4 className="font-semibold text-lg text-gray-700">Campaign Ideas</h4>
                            {campaigns.map((campaign, index) => (
                                <div key={index} className="bg-white/90 p-3 rounded-lg shadow-sm border border-gray-200">
                                    <h5 className="font-semibold text-gray-700">{campaign.angle}</h5>
                                    <p className="text-gray-500 mt-1 text-sm">Format: {campaign.format}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4">
                            {campaignError && <p className="text-xs text-red-500 mb-2">{campaignError}</p>}
                            <Button onClick={fetchCampaigns} disabled={isLoadingCampaigns} className="w-full text-md py-3 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700">
                                {isLoadingCampaigns ? 'Generating...' : 'Generate Campaigns'}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// --- Main App Component ---
export default function App() {
    const [surveyFile, setSurveyFile] = useState(null);
    const [reviewsFile, setReviewsFile] = useState(null);
    const [productPositioning, setProductPositioning] = useState('');
    const [personas, setPersonas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!productPositioning.trim()) {
            setError('Product positioning statement is required.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setPersonas([]);

        const formData = new FormData();
        formData.append('survey_data', surveyFile || new File([" "], "survey.txt"));
        formData.append('customer_reviews', reviewsFile || new File([" "], "reviews.txt"));
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
            <div className="container mx-auto p-8 max-w-7xl">
                <header className="py-12 text-center">
                    <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Persona Spark</h1>
                    <p className="text-xl text-white">Create detailed marketing personas and campaign ideas from your data.</p>
                </header>

                <Card className="mb-12 p-8 shadow-2xl rounded-3xl bg-white/90 backdrop-blur-md border-blue-100">
                    <CardHeader className="mb-6">
                        <CardTitle className="text-3xl font-bold text-gray-800">Your Data Input</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FileDropZone id="survey-file" label="Upload Survey Data" onFileSelect={setSurveyFile} fileName={surveyFile?.name} iconName="Upload" />
                            <FileDropZone id="reviews-file" label="Upload Customer Reviews" onFileSelect={setReviewsFile} fileName={reviewsFile?.name} iconName="DocumentText" />
                        </div>
                        <Textarea
                            placeholder="Paste product positioning here..."
                            value={productPositioning}
                            onChange={(e) => setProductPositioning(e.target.value)}
                            className="min-h-[120px] text-base bg-white/80"
                        />
                        <Button onClick={handleSubmit} disabled={isLoading} className="w-full text-lg py-6 rounded-xl transition-all bg-blue-600 hover:bg-blue-700 text-white">
                            {isLoading ? 'Generating...' : 'Generate Personas'}
                        </Button>
                    </CardContent>
                </Card>

                {isLoading && <p className="text-center text-2xl text-white font-semibold my-8 animate-pulse">Generating your personas...</p>}
                {error && <p className="text-center text-2xl text-red-400 font-semibold my-8">{error}</p>}
                
                {personas.length > 0 && (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
                        {personas.map(p => <PersonaCardComponent key={p.id} persona={p} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
