import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center justify-center gap-3">
        <FiTrendingUp className="text-asiance text-4xl" />
        Asiance AIO Tracker Dashboard
      </h1>
      <p className="text-slate-500 mt-2">
        Analyze Google AI Overview sources and identify partnership
        opportunities
      </p>

      <div className="mx-auto mt-4 max-w-xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-left text-sm text-yellow-800">
          <strong>Note:</strong> This tool uses SerpAPI to collect Google AI
          Overview data. Each analysis consumes search credits. AI Generation
          mode consumes your LLM credits (Gemini etc.).
        </div>
      </div>
    </header>
  );
};

export default Header;
