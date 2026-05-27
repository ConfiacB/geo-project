import React from 'react';
import Header from './components/Header';
import InputTabs from './components/InputTabs';
import ResultsPanel from './components/ResultsPanel';
import DashboardView from 'components/DasboardView';
import { useAnalysisStore } from 'store/analysisStore';
import TopMentionsPanel from 'components/TopMentionPanel';
import SummaryView from 'components/SummaryView';

const App: React.FC = () => {
  const { loading } = useAnalysisStore();
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-6 px-4">
        {/* App Header */}
        <Header />

        {/* Input Tabs (Single, Bulk, Filters) */}
        <InputTabs />

        {/* Summary view */}
        <SummaryView />

        {/* Results for single or multiple prompts */}
        <ResultsPanel />

        {/* Results for a brand top mention */}
        <TopMentionsPanel />

        {/* Dashboard (stats + charts + filters) */}
        <DashboardView />
      </div>
    </div>
  );
};

export default App;
