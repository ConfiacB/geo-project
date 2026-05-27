import React, { useState } from 'react';
import ManualTab from './tabs/ManualTab';
import CsvTab from './tabs/CsvTab';
import KeywordsTab from './tabs/KeywordsTab';
import UrlCheckerTab from './tabs/UrlCheckerTab';
import BatchTab from './tabs/BatchTab';
import { useAnalysisStore } from 'store/analysisStore';

const InputTabs: React.FC = () => {
  const [tab, setTab] = useState<
    'manual' | 'csv' | 'keywords' | 'urlChecker' | 'batch'
  >('manual');

  const { activeTab, setActiveTab } = useAnalysisStore();

  return (
    <div className="bg-white rounded-md shadow p-4 mb-6">
      <ul className="flex gap-2 border-b mb-4">
        <li>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2 px-4 ${
              activeTab === 'manual'
                ? 'border-b-2 border-asiance'
                : 'text-slate-600'
            }`}
          >
            Manual Input
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab('csv')}
            className={`py-2 px-4 ${
              activeTab === 'csv'
                ? 'border-b-2 border-asiance'
                : 'text-slate-600'
            }`}
          >
            CSV Upload
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab('keywords')}
            className={`py-2 px-4 ${
              activeTab === 'keywords'
                ? 'border-b-2 border-asiance'
                : 'text-slate-600'
            }`}
          >
            AI Generation
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab('urlChecker')}
            className={`py-2 px-4 ${
              activeTab === 'urlChecker'
                ? 'border-b-2 border-asiance'
                : 'text-slate-600'
            }`}
          >
            URL Checker
          </button>
        </li>
        {/* <li>
          <button
            onClick={() => setTab('batch')}
            className={`py-2 px-4 ${
              tab === 'batch' ? 'border-b-2 border-asiance' : 'text-slate-600'
            }`}
          >
            Batch Collection
          </button>
        </li> */}
      </ul>

      <div>
        {activeTab === 'manual' && <ManualTab />}
        {activeTab === 'csv' && <CsvTab />}
        {activeTab === 'keywords' && <KeywordsTab />}
        {activeTab === 'urlChecker' && <UrlCheckerTab />}
        {/* {tab === 'batch' && <BatchTab />} */}
      </div>
    </div>
  );
};

export default InputTabs;
