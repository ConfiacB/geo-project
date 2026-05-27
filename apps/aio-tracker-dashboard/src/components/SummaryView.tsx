import React, { useEffect, useState } from 'react';
import { useAnalysisStore } from '../store/analysisStore';
import { getAllBrands, getSummary } from '../services/api';

const SummaryView = () => {
  const { summary, setSummary, loading, setLoading } = useAnalysisStore();
  const [brand, setBrand] = useState(''); // brand filter
  const [brands, setBrands] = useState<string[]>([]); // available brand list

  const fetchBrands = async () => {
    const res = await getAllBrands();
    setBrands(res.data.data);
  };

  const fetchSummary = async (selectedBrand?: string) => {
    setLoading(true);

    try {
      const params = selectedBrand ? { brand: selectedBrand } : {};
      const { data } = await getSummary(params);
      setSummary(data.data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchBrands();
  }, []);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setBrand(selected);
    fetchSummary(selected || undefined);
  };

  if (loading)
    return (
      <div className="text-center py-4 text-gray-500">Loading summary...</div>
    );

  if (!summary)
    return (
      <div className="text-center py-4 text-gray-400">
        No summary data available.
      </div>
    );

  return (
    <div className="mt-8">
      {/* Brand Filter */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Summary Overview
        </h2>
        <div className="flex gap-2 items-center">
          <label className=" text-gray-600">Filter by Brand:</label>
          <select
            className="border border-gray-300 rounded p-2"
            value={brand}
            onChange={handleBrandChange}
          >
            <option value="">All Brands</option>
            {brands.length > 0 ? (
              brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))
            ) : (
              <></>
            )}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
          <h3 className="text-sm text-gray-500">Total Analyses</h3>
          <p className="text-2xl font-semibold text-gray-800">
            {summary.totalAnalyses ?? 0}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-green-500">
          <h3 className="text-sm text-gray-500">AI Overview Found</h3>
          <p className="text-2xl font-semibold text-gray-800">
            {summary.totalAIOFound ?? 0}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-yellow-500">
          <h3 className="text-sm text-gray-500">Avg Mentions / AIO</h3>
          <p className="text-2xl font-semibold text-gray-800">
            {summary.avgMentions?.toFixed(2) ?? 0}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-purple-500">
          <h3 className="text-sm text-gray-500">Tracked Brands</h3>
          <p className="text-2xl font-semibold text-gray-800">
            {summary.brandsTracked ?? 0}
          </p>
        </div>
      </div>

      {summary.lastAnalysisAt && (
        <div className="col-span-full text-xs text-gray-400 text-right mt-3">
          Last updated: {new Date(summary.lastAnalysisAt).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default SummaryView;
