import React, { useEffect } from 'react';
import { useAnalysisStore } from '../store/analysisStore';
import { getAllAnalyses, getAnalysisTrends } from '../services/api';
import DashboardView from 'components/DasboardView';

const DashboardPage = () => {
  const { page, limit, setAnalyses, setTrends, filters, setLoading } =
    useAnalysisStore();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [analysesRes, trendsRes] = await Promise.all([
          getAllAnalyses({ page, limit, ...filters }),
          getAnalysisTrends(),
        ]);
        setAnalyses(analysesRes.data.data);
        setTrends(trendsRes.data);
      } catch (err) {
        console.error('Failed fetching data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [filters]);

  return <DashboardView />;
};

export default DashboardPage;
