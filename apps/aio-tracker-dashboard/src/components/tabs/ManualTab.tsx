import React, { useState } from 'react';
import { analyseAIO } from '../../services/api';
import './../../styles/index.css';
import { useAnalysisStore } from 'store/analysisStore';
import { Loader } from 'components/Loader';

const ManualTab: React.FC = () => {
  const [localPrompts, setLocalPrompts] = useState<string[]>([]);
  const [promptInput, setPromptInput] = useState('');
  const [brand, setBrand] = useState('');
  const [language, setLanguage] = useState('en');
  const [location, setLocation] = useState('kr');
  const [loading, setLoading] = useState(false);
  const { prompts, setPrompts, addPrompts, clearPrompts, setAnalyses } =
    useAnalysisStore();

  const addPrompt = () => {
    const trimmed = promptInput.trim();
    if (!trimmed) return;
    addPrompts([trimmed]);
    setPromptInput('');
  };

  const removePrompt = (i: number) => {
    const newList = prompts.filter((_, idx) => idx !== i);
    setPrompts(newList);
  };

  const startAnalysis = async () => {
    if (!prompts || !brand) return alert('Both prompt and brand are required');

    setLoading(true);
    try {
      const { data } = await analyseAIO({
        prompts,
        brand,
        language,
        location,
      });
      setAnalyses(data);

      // Clear prompts after succesful run
      clearPrompts();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  return (
    <div className="flex w-full gap-4">
      {/* Left side (input area) */}
      <div className="flex-1 space-y-4">
        <input
          type="text"
          placeholder="Brand name (required)"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="border w-full p-2 rounded"
        />

        <div className="flex items-center gap-2">
          <textarea
            placeholder="Enter prompt..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            className="flex-1 border p-3 rounded"
            rows={1}
          />
          <button
            onClick={addPrompt}
            className="bg-gray-700 text-white px-4 py-2 rounded whitespace-nowrap"
          >
            Add Prompt
          </button>
        </div>

        <div className="flex gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="ko">Korean</option>
          </select>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="kr">Korea</option>
            <option value="us">USA</option>
            <option value="fr">France</option>
          </select>
        </div>

        <button
          className="btn-asiance disabled:bg-gray-500 text-white px-6 py-2 rounded mt-4"
          onClick={startAnalysis}
          disabled={loading || prompts.length === 0 || brand === ''}
        >
          {loading ? (
            <Loader size={28} color="#ffffff" speed="slow" />
          ) : (
            'Analyze Prompts'
          )}
        </button>
      </div>

      {/* Right side (prompt list) */}

      <div className="w-1/2 bg-gray-100 p-3 rounded max-h-64 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Added Prompts</h3>
          {prompts.length > 0 && (
            <button
              onClick={clearPrompts}
              className="text-red-600 text-sm hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {prompts.length > 0 ? (
          <div>
            {prompts.map((p, i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <span className="text-base">{p}</span>
                <button
                  className="text-red-500 text-base"
                  onClick={() => removePrompt(i)}
                >
                  remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">
            No prompts added yet — add one manually or send from AI tab.
          </p>
        )}
      </div>
    </div>
  );
};

export default ManualTab;
