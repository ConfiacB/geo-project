import React, { useEffect, useState } from 'react';
import { getAllAnalyses, getAllBrands } from '../services/api';
import { useAnalysisStore } from '../store/analysisStore';
import '../styles/index.css';

const ResultsPanel: React.FC = () => {
  const {
    page,
    totalPages,
    setPage,
    analyses,
    setAnalyses,
    loading,
    setLoading,
    filters,
    setFilters,
    limit,
    setLimit,
    totalData,
    setTotalData,
  } = useAnalysisStore();

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<string[]>([]);

  // local prompt input (for debounce)
  const [promptInput, setPromptInput] = useState(filters.prompt || '');

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
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

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        ...filters,
      };
      const { data } = await getAllAnalyses(params);
      setAnalyses(data.data, data.totalPages);
      setTotalData(data.totalData);
    } catch (err: any) {
      console.error('Failed to fetch analyses:', err);
      setError('Failed to fetch analyses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce for prompt input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (promptInput !== filters.prompt) {
        setFilters({ prompt: promptInput || undefined });
      }
    }, 1000); // 1s delay
    return () => clearTimeout(handler);
  }, [promptInput]);

  // Fetch analyses when filters, page, or limit changes
  useEffect(() => {
    fetchAll();
  }, [page, limit, filters]);

  // Error state
  if (error)
    return (
      <div className="mt-4 bg-red-100 text-red-700 p-3 rounded text-center">
        {error}
      </div>
    );

  return (
    <div className="mt-6 pt-3 p-3 space-y-4 bg-white rounded-xl shadow overflow-x-auto">
      <h2 className="font-semibold mb-2">Data Overview</h2>
      <div className="flex flex-wrap gap-4 justify-evenly">
        <select
          className="border border-gray-300 rounded p-2"
          value={filters.brand}
          onChange={(e) => setFilters({ brand: e.target.value })}
        >
          <option value="">Select Brand</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Debounced input */}
        <input
          placeholder="Prompt contains..."
          className="border p-2 rounded"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={filters.language || ''}
          onChange={(e) => setFilters({ language: e.target.value })}
        >
          <option value="">All languages</option>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="ko">Korean</option>
        </select>

        <select
          className="border p-2 rounded"
          value={filters.location || ''}
          onChange={(e) => setFilters({ location: e.target.value })}
        >
          <option value="">All locations</option>
          <option value="kr">Korea</option>
          <option value="us">USA</option>
          <option value="fr">France</option>
        </select>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={!!filters.hasAIO}
            onChange={(e) =>
              setFilters({ hasAIO: e.target.checked || undefined })
            }
          />
          <span>Has AIO only</span>
        </label>

        <select
          className="border p-2 rounded"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>

        <div className="my-auto">Total data: {totalData}</div>
      </div>

      {!analyses?.length ? (
        <div className="mt-6 pb-4 text-center text-gray-500">
          No analyses found. Try changing filters or run a new analysis.
        </div>
      ) : (
        <>
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-100 text-gray-700">
              <tr>
                <th className="p-3 font-medium">Prompt</th>
                <th className="p-3 font-medium">Brand</th>
                <th className="p-3 font-medium">Language</th>
                <th className="p-3 font-medium">Location</th>
                <th className="p-3 font-medium">AI Overview</th>
                <th className="p-3 font-medium">AIO Mentions</th>
                <th className="p-3 font-medium">Sources</th>
                <th className="p-3 font-medium">Date</th>
              </tr>
            </thead>

            <tbody>
              {analyses.map((a, idx) => (
                <React.Fragment key={a._id || idx}>
                  <tr
                    className="border-t hover:bg-slate-50 transition-colors"
                    onClick={() => a._id && toggleRow(a._id)}
                  >
                    <td className="p-3 max-w-xs truncate" title={a.prompt}>
                      {a.prompt}
                    </td>
                    <td className="p-3">{a.brand}</td>
                    <td className="p-3 uppercase">{a.language}</td>
                    <td className="p-3 uppercase">{a.location}</td>
                    <td className="p-3">
                      {a.hasAIO ? (
                        <span className="text-green-600 font-medium">
                          ✅ Yes
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium">❌ No</span>
                      )}
                    </td>
                    <td className="p-3 text-center">{a.overviewBrandCount}</td>
                    <td className="p-3 text-center">
                      {a.sourceResults?.length ?? 0}
                    </td>
                    <td className="p-3 text-gray-500 text-xs">
                      {new Date(a.analyzedAt).toLocaleString()}
                    </td>
                  </tr>

                  {a._id &&
                  expandedRows.has(a._id) &&
                  a.sourceResults?.length ? (
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td colSpan={8} className="p-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-full">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Source Mentions
                          </h4>
                          <ul className="space-y-2">
                            {a.sourceResults.map((s, idx) => {
                              let hostname = '';
                              try {
                                hostname = new URL(
                                  s.url ? s.url : '',
                                ).hostname.replace('www.', '');
                              } catch {
                                hostname = s.url ? s.url : '';
                              }

                              return (
                                <li
                                  key={idx}
                                  className="flex items-center bg-gray-50 hover:bg-gray-100 p-2 rounded-md transition-colors"
                                >
                                  <span className="text-sm text-gray-700 font-medium flex-shrink-0 w-20">
                                    Count: {s.brandCount ?? 0}
                                  </span>
                                  <a
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 text-base underline flex-1 ml-4"
                                    title={s.url}
                                  >
                                    {hostname}
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div className="text-center">
            <span>
              {page} / {totalPages}
            </span>
          </div>
          <div className="space-x-4">
            <button
              className="btn-asiance disabled:bg-gray-500 text-white p-2 rounded"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>
            <button
              className="btn-asiance disabled:bg-gray-500 text-white p-2 rounded"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsPanel;
