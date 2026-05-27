import React, { useEffect } from 'react';
import { useAnalysisStore } from '../store/analysisStore';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { getAnalysisTrends } from 'services/api';

const DashboardView = () => {
  const { trends, setTrends, loading, setLoading } = useAnalysisStore();

  const fetchAllTrend = async () => {
    setLoading(true);

    try {
      const { data } = await getAnalysisTrends();
      const formatted = data.data.map((item: any) => ({
        prompt: item._id.prompt || 'Unknown',
        totalAnalyses: item.totalAnalyses,
        avgBrandCount: item.avgBrandCount,
      }));
      setTrends(formatted);
    } catch (err: any) {
      console.error('Failed to fetch analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTrend();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white shadow p-4 rounded">
        <h2 className="font-semibold mb-2">Trends Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="prompt" hide />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalAnalyses" fill="#3b82f6" />
            <Bar dataKey="avgBrandCount" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardView;
