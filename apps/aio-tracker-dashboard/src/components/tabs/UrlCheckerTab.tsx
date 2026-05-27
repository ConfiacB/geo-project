import React, { useState } from 'react';
import { getBrandMention } from '../../services/api';
import { Loader } from 'components/Loader';

const UrlCheckerTab: React.FC = () => {
  const [url, setUrl] = useState('');
  const [brand, setBrand] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    const cleanUrl = url.trim();
    const cleanBrand = brand.trim();

    if (!cleanUrl.match(/^https?:\/\/.+/)) {
      alert('Enter a valid URL starting with http(s)://');
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await getBrandMention({ url: cleanUrl, brand: cleanBrand });
      setResult(res.data);
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <label className="block font-semibold mb-2">Enter URL to Check</label>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded p-2"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
          />
          <input
            className="w-full md:w-1/3 border rounded p-2"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Brand name (optional)"
          />
          <button
            className="btn-asiance disabled:bg-gray-500 px-4 py-2 rounded-md text-white"
            onClick={check}
            disabled={loading || url.length === 0}
          >
            {loading ? (
              <Loader size={28} color="#ffffff" speed="slow" />
            ) : (
              'Check URL'
            )}
          </button>
        </div>
        <div id="url-check-results" className="mt-4">
          {result && (
            <div className="bg-white rounded-md shadow p-4">
              <h5 className="font-semibold">URL Analysis Complete</h5>
              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div>
                  <p>
                    <strong>URL:</strong>{' '}
                    <a href={result.url} target="_blank" rel="noreferrer">
                      {result.url}
                    </a>
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Asiance Mentioned:</strong>{' '}
                    {result.count > 0 ? (
                      <span className="text-green-600 font-semibold">YES</span>
                    ) : (
                      <span className="text-slate-600">NO</span>
                    )}
                  </p>
                  <p>
                    <strong>Count:</strong>{' '}
                    <span className="font-semibold">{result.count}</span>
                  </p>
                  <div
                    className={`mt-2 p-3 rounded ${
                      result.count > 0
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-slate-50 border border-slate-100'
                    }`}
                  >
                    {result
                      ? `This URL contains mentions of ${result.brand}.`
                      : `No mentions of ${result.brand} found.`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="bg-slate-50 border rounded p-3 text-sm text-slate-600">
          <strong>Single URL Analysis:</strong>
          <p className="mt-1">
            Enter any URL to check if it contains mentions of "Asiance" or
            variants. Uses same algorithm as bulk processing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UrlCheckerTab;
