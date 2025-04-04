import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppKitAccount } from '@reown/appkit/react';
import { RefreshCw, BookOpen } from 'lucide-react';

interface BackstoryHistoryProps {
  tokenId?: string;
}

interface BackstoryEntry {
  id: string;
  tokenId: string;
  name: string;
  nftTitle: string;
  backstory: string;
  createdAt: string;
  walletAddress: string;
}

const BackstoryHistory: React.FC<BackstoryHistoryProps> = ({ tokenId }) => {
  const { address } = useAppKitAccount();
  const [backstories, setBackstories] = useState<BackstoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (address) {
      fetchBackstoryHistory();
    }
  }, [address, tokenId]);
  
  const fetchBackstoryHistory = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const endpoint = tokenId 
        ? `/api/anthropic/backstory-history?wallet=${address}&tokenId=${tokenId}`
        : `/api/anthropic/backstory-history?wallet=${address}`;
        
      const response = await axios.get(endpoint);
      
      if (response.data.backstories) {
        setBackstories(response.data.backstories);
      }
    } catch (error) {
      console.error('Error fetching backstory history:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (backstories.length === 0 && !loading) {
    return null;
  }
  
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center">
          <BookOpen className="mr-2 h-5 w-5" />
          {tokenId ? 'Previous Backstories' : 'Your Backstory History'}
        </h3>
        
        <button
          onClick={fetchBackstoryHistory}
          disabled={loading}
          className="px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm flex items-center"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="p-6 bg-gray-800/30 rounded-xl flex justify-center">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {backstories.map((entry) => (
            <div key={entry.id} className="p-4 bg-gray-800/50 rounded-lg">
              <div className="mb-2">
                <h4 className="font-medium">{entry.name}</h4>
                <p className="text-sm text-gray-400">{entry.nftTitle}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
              
              <div className="prose prose-sm prose-invert max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-300">
                  {entry.backstory.substring(0, 250)}
                  {entry.backstory.length > 250 ? '...' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BackstoryHistory;