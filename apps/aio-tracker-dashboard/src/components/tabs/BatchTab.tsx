import React, { useState, useRef } from 'react';
// import api from '../../services/api';

const BatchTab: React.FC = () => {
  const [cycles, setCycles] = useState(24);
  const [intervalSec, setIntervalSec] = useState(3600);
  const [limitPrompts, setLimitPrompts] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const pollingRef = useRef<number | null>(null);

  const start = async () => {
    // if (cycles < 1 || intervalSec < 60) {
    //   alert('Please enter valid values');
    //   return;
    // }
    // try {
    //   const res = await api.post('/batch_start', {
    //     cycles,
    //     interval: intervalSec,
    //     limit_prompts: limitPrompts,
    //   });
    //   if (res.data.job_id) {
    //     setJobId(res.data.job_id);
    //     startPolling(res.data.job_id);
    //   } else {
    //     alert(res.data.error || 'Failed to start');
    //   }
    // } catch (err) {
    //   alert('Error: ' + (err as Error).message);
    // }
  };

  const stop = async () => {
    // if (!jobId) return;
    // try {
    //   await api.post(`/batch_stop/${jobId}`);
    //   setJobId(null);
    //   if (pollingRef.current) window.clearInterval(pollingRef.current);
    // } catch (err) {
    //   alert('Error stopping: ' + (err as Error).message);
    // }
  };

  const startPolling = (id: string) => {
    // if (pollingRef.current) window.clearInterval(pollingRef.current);
    // pollingRef.current = window.setInterval(async () => {
    //   try {
    //     const res = await api.get(`/batch_status/${id}`);
    //     if (
    //       res.data.status === 'completed' ||
    //       res.data.status === 'error' ||
    //       res.data.status === 'stopped'
    //     ) {
    //       if (pollingRef.current) window.clearInterval(pollingRef.current);
    //       setJobId(null);
    //       // Optionally show result stats
    //       alert('Batch finished: ' + res.data.status);
    //     }
    //   } catch (err) {
    //     console.error(err);
    //   }
    // }, 2000);
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-2">Number of Cycles</label>
            <input
              type="number"
              min={1}
              value={cycles}
              onChange={(e) => setCycles(Number(e.target.value))}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">
              Interval (seconds)
            </label>
            <input
              type="number"
              min={60}
              value={intervalSec}
              onChange={(e) => setIntervalSec(Number(e.target.value))}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Limit Prompts</label>
            <input
              type="number"
              min={0}
              value={limitPrompts}
              onChange={(e) => setLimitPrompts(Number(e.target.value))}
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        <div className="mt-4">
          <div id="batch-status-card" className="hidden">
            {/* dynamic status area */}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              className="btn-asiance px-6 py-2 rounded-md text-white"
              onClick={start}
              disabled={!!jobId}
            >
              Start Batch Collection
            </button>
            <button
              className="border border-red-400 px-6 py-2 rounded-md text-red-600"
              onClick={stop}
              style={{ display: jobId ? 'inline-block' : 'none' }}
            >
              Stop Collection
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-slate-50 border rounded p-3 text-sm text-slate-600">
          <strong>Batch Collection:</strong>
          <p className="mt-1">
            Runs prompts from your selection.csv across multiple locations.
            Results are saved on the server and can be downloaded once complete.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BatchTab;
