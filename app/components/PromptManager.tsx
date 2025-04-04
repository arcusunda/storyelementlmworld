// components/admin/PromptManager.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Prompt {
  _id: string;
  type: string;
  version: string;
  active: boolean;
  name: string;
  systemContext: string;
  contentTemplate: string;
  createdAt: string;
  updatedAt: string;
}

const PromptManager: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [promptTypes, setPromptTypes] = useState<string[]>([]);
  
  const router = useRouter();
  
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/prompts');
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setPrompts(data.prompts);
        
        const types = [...new Set(data.prompts.map((p: Prompt) => p.type))] as string[];
        setPromptTypes(types);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrompts();
  }, []);
  
  const activatePrompt = async (promptId: string) => {
    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setPrompts(prompts.map(p => ({
        ...p,
        active: p._id === promptId ? true : p.type === selectedPrompt?.type ? false : p.active
      })));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate prompt');
    }
  };
  
  const filteredPrompts = filterType 
    ? prompts.filter(p => p.type === filterType)
    : prompts;
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prompt Manager</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Filter by Type:</label>
        <select 
          className="border rounded p-2 w-full md:w-1/3"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {promptTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => router.push('/admin/prompts/new')}
        >
          Create New Prompt
        </button>
      </div>
      
      {loading ? (
        <p>Loading prompts...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border text-left">Type</th>
                <th className="py-2 px-4 border text-left">Name</th>
                <th className="py-2 px-4 border text-left">Version</th>
                <th className="py-2 px-4 border text-center">Status</th>
                <th className="py-2 px-4 border text-left">Created</th>
                <th className="py-2 px-4 border text-left">Updated</th>
                <th className="py-2 px-4 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrompts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-4 border text-center">
                    No prompts found
                  </td>
                </tr>
              ) : (
                filteredPrompts.map(prompt => (
                  <tr key={prompt._id} className={prompt.active ? 'bg-green-50' : ''}>
                    <td className="py-2 px-4 border">{prompt.type}</td>
                    <td className="py-2 px-4 border">{prompt.name}</td>
                    <td className="py-2 px-4 border">{prompt.version}</td>
                    <td className="py-2 px-4 border text-center">
                      {prompt.active ? (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 border">
                      {new Date(prompt.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border">
                      {new Date(prompt.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border text-center">
                      <button
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        onClick={() => router.push(`/admin/prompts/edit/${prompt._id}`)}
                      >
                        Edit
                      </button>
                      {!prompt.active && (
                        <button
                          className="text-green-500 hover:text-green-700 mr-2"
                          onClick={() => activatePrompt(prompt._id)}
                        >
                          Activate
                        </button>
                      )}
                      <button
                        className="text-purple-500 hover:text-purple-700"
                        onClick={() => router.push(`/admin/prompts/clone/${prompt._id}`)}
                      >
                        Clone
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{selectedPrompt.name}</h2>
            <div className="mb-4">
              <h3 className="font-semibold">System Context:</h3>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
                {selectedPrompt.systemContext}
              </pre>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold">Content Template:</h3>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
                {selectedPrompt.contentTemplate}
              </pre>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                onClick={() => setSelectedPrompt(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptManager;