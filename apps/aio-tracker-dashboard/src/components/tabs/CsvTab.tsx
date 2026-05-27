import { Loader } from 'components/Loader';
import React, { useState } from 'react';
import { analyzePromptCSV } from 'services/api';
import { useAnalysisStore } from 'store/analysisStore';

const CsvTab = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { setAnalyses } = useAnalysisStore();

  const handleUpload = async () => {
    if (!file) return alert('Please select a CSV file first.');
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await analyzePromptCSV(formData);
      console.log('data', data);
      setAnalyses(data.data);
    } catch (err) {
      console.error(err);
      alert('Error uploading CSV');
    } finally {
      setUploading(false);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        className="btn-asiance disabled:bg-gray-500 text-white px-4 py-2 rounded"
        onClick={handleUpload}
        disabled={uploading || !file}
      >
        {uploading ? (
          <Loader size={28} color="#ffffff" speed="slow" />
        ) : (
          'Upload CSV'
        )}
      </button>
    </div>
  );
};

export default CsvTab;
