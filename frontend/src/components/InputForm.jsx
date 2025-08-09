import React, { useState } from 'react';

const InputForm = ({ onSubmit }) => {
  const [survey, setSurvey] = useState('');
  const [reviews, setReviews] = useState('');
  const [productBrief, setProductBrief] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ survey, reviews, productBrief });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-8 w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">📝 Input Customer Data</h2>
      <textarea className="w-full p-2 border mb-3" rows="4" placeholder="Paste survey data" value={survey} onChange={e => setSurvey(e.target.value)} />
      <textarea className="w-full p-2 border mb-3" rows="4" placeholder="Paste customer reviews" value={reviews} onChange={e => setReviews(e.target.value)} />
      <textarea className="w-full p-2 border mb-4" rows="4" placeholder="Paste product brief" value={productBrief} onChange={e => setProductBrief(e.target.value)} />
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Generate Personas</button>
    </form>
  );
};

export default InputForm;
