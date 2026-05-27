import React, { useEffect, useState } from 'react';
import { getAllBrands, getTopMention } from '../services/api';
import { Loader } from './Loader';
import '../styles/index.css';

interface TopMention {
  _id: string; // domain
  totalMentions: number;
  uniquePrompts: number;
  brands: string[];
}

const TopMentionsPanel: React.FC = () => {
  const [mentions, setMentions] = useState<TopMention[]>([]);
  const [brand, setBrand] = useState('');
  const [language, setLanguage] = useState('');
  const [location, setLocation] = useState('');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<string[]>([]);

  const fetchMentions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getTopMention({
        brand,
        language,
        location,
        limit,
      });
      setMentions(data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch top mentions:', err);
      setError('Failed to load top mentions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch brand list once
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllBrands();
        setBrands(res.data.data || []);
      } catch (err) {
        console.error('Failed to load brands:', err);
      }
    })();
  }, []);

  // Fetch mentions automatically when any filter changes
  useEffect(() => {
    if (brand) {
      fetchMentions();
    }
  }, [brand, language, location, limit]);

  return (
    <div className="mt-6 pt-3 p-3 bg-white rounded-xl shadow space-y-4">
      <h2 className="font-semibold mb-2">Top mentions per Brand</h2>
      <div className="flex flex-wrap gap-3 justify-around items-center">
        <select
          className="border border-gray-300 rounded p-2"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          <option value="">Select Brand (required)</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="">All languages</option>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="ko">Korean</option>
        </select>

        <select
          className="border p-2 rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">All locations</option>
          <option value="kr">Korea</option>
          <option value="us">USA</option>
          <option value="fr">France</option>
        </select>

        <select
          className="border p-2 rounded"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>

        <button
          onClick={fetchMentions}
          disabled={loading || !brand}
          className="btn-asiance disabled:bg-gray-500 text-white p-2 rounded"
        >
          {loading ? (
            <Loader size={28} color="#ffffff" speed="slow" />
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {!loading && !mentions.length && brand && (
        <div className="text-gray-500 text-center py-4">No data found.</div>
      )}

      {loading && (
        <div className="text-center py-4 text-gray-500">Loading...</div>
      )}

      {!loading && mentions.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Domain</th>
              <th className="p-3 text-left">Total Mentions</th>
              <th className="p-3 text-left">Unique Prompts</th>
              <th className="p-3 text-left">Brands</th>
            </tr>
          </thead>
          <tbody>
            {mentions.map((item, idx) => (
              <tr key={idx} className="border-t hover:bg-slate-50">
                <td className="p-3">{item._id}</td>
                <td className="p-3">{item.totalMentions}</td>
                <td className="p-3">{item.uniquePrompts}</td>
                <td className="p-3">{item.brands.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TopMentionsPanel;
