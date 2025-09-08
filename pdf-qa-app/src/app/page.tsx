'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setUploadStatus('');
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setUploadStatus('Uploading and processing PDF...');
    setError('');
    setAnswer('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'x-api-secret': process.env.NEXT_PUBLIC_API_SECRET_KEY || '', 
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setUploadStatus('PDF processed successfully! You can now ask questions.');
    } catch (err: any) {
      setError(err.message);
      setUploadStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) {
      setError('Please enter a question.');
      return;
    }
    if (uploadStatus !== 'PDF processed successfully! You can now ask questions.') {
      setError('Please upload and process a PDF first.');
      return;
    }

    setIsLoading(true);
    setAnswer('');
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-secret': process.env.NEXT_PUBLIC_API_SECRET_KEY || '', 
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setAnswer(data.answer);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setQuestion('');
    }
  };
  

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Mini PDF Q&A</h1>

        {/* --- Upload PDF --- */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">1. Upload your PDF</h2>
          <div className="flex items-center space-x-4">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
            >
              {isLoading && uploadStatus.startsWith('Uploading') ? 'Processing...' : 'Upload & Process'}
            </button>
          </div>
          {uploadStatus && <p className="mt-2 text-sm text-green-600">{uploadStatus}</p>}
        </div>

        {/* --- Ask a Question --- */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">2. Ask a Question</h2>
          <form onSubmit={handleSubmitQuestion} className="flex items-center space-x-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What is this document about?"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || !uploadStatus.includes('successfully')}
              className="px-6 py-2 bg-green-600 text-white rounded-md font-semibold disabled:bg-gray-400 hover:bg-green-700 transition-colors"
            >
              Ask
            </button>
          </form>
        </div>

        {/* --- Display Answer --- */}
        {isLoading && !answer && <p className="text-center text-gray-500">Thinking...</p>}
        {error && <p className="text-red-500 text-center">Error: {error}</p>}
        {answer && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Answer:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>
          </div>
        )}
      </div>
    </main>
  );
}
