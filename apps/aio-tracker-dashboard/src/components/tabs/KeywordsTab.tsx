import { Loader } from 'components/Loader';
import React, { useState } from 'react';
import { generateGooglePrompt } from 'services/api';
import { useAnalysisStore } from 'store/analysisStore';

const KeywordsTab: React.FC = () => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [location, setLocation] = useState('kr');
  const [count, setCount] = useState(5);
  const [goal, setGoal] = useState(''); // optional AI goal / context
  const [prompts, setLocalPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { setPrompts, setActiveTab } = useAnalysisStore();

  const addKeyword = () => {
    const k = input.trim();
    if (!k) return;
    if (!keywords.includes(k)) setKeywords((s) => [...s, k]);
    setInput('');
  };

  const removeKeyword = (k: string) => {
    setKeywords((s) => s.filter((x) => x !== k));
  };

  const generatePrompts = async () => {
    if (!keywords.length) {
      alert('Add at least one keyword');
      return;
    }

    setLoading(true);
    setLocalPrompts([]);

    try {
      const body = {
        keywords,
        language,
        location,
        count,
        goal,
      };

      const res = await generateGooglePrompt(body);

      if (res.data?.prompts && Array.isArray(res.data.prompts)) {
        setLocalPrompts(res.data.prompts);
      } else {
        alert('No prompts returned from API');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating prompts: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const sendToManual = () => {
    if (!prompts.length) {
      alert('No prompts generated yet');
      return;
    }
    setPrompts(prompts);
    setActiveTab('manual');
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-semibold">
              Keywords (required)
            </label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              className="w-full border p-2 rounded"
              placeholder="Enter keyword and press Enter"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Language</label>
            <select
              className="w-full border rounded p-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="ko">Korean</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Location</label>
            <select
              className="w-full border rounded p-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="us">US</option>
              <option value="kr">Korea</option>
              <option value="fr">France</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Count</label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full border rounded p-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold">
              AI Goal (optional)
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Generate marketing ideas for a coffee brand"
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        <div className="mb-3">
          <div className="flex flex-wrap gap-2" id="keyword-tags">
            {keywords.map((k) => (
              <span
                key={k}
                className="bg-slate-200 px-2 py-1 rounded inline-flex items-center"
              >
                {k}
                <button
                  className="ml-2 font-bold text-slate-600 hover:text-red-600"
                  onClick={() => removeKeyword(k)}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {prompts.length > 0 && (
          <div id="generated-prompts" className="generated-prompts mt-4">
            <h4 className="font-semibold mb-2">Generated Prompts:</h4>
            <ul id="prompts-list" className="list-disc pl-5 space-y-1">
              {prompts.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>

            <div className="text-center mt-4">
              <button
                onClick={sendToManual}
                className="btn-asiance disabled:bg-gray-500 text-white px-6 py-2 rounded mt-4"
                disabled={!prompts.length}
              >
                Send to Manual Tab to Process
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="bg-slate-50 border rounded p-3 text-sm text-slate-600">
          <strong>AI Prompt Generation:</strong>
          <p className="mt-1">
            Enter keywords related to Korean marketing agencies — Gemini will
            generate diverse search queries based on keywords.
          </p>
        </div>

        <div className="text-center mt-6">
          <button
            className="btn-asiance disabled:bg-gray-500 px-6 py-2 rounded-md text-white"
            onClick={generatePrompts}
            disabled={loading || keywords.length === 0}
          >
            {loading ? (
              <Loader size={28} color="#ffffff" speed="slow" />
            ) : (
              'Generate Prompts'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeywordsTab;
