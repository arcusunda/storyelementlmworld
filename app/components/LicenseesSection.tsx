// app/components/LicenseesSection.tsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'

interface Licensee {
  wallet: string;
  tokenId: string;
  mintedAt: string;
  txHash: string;
}

interface LicenseesSectionProps {
  ipId: string;
  isHidden: boolean;
}

export default function LicenseesSection({ ipId, isHidden }: LicenseesSectionProps) {
  const [licensees, setLicensees] = useState<Licensee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLicensees = async () => {
      if (!ipId || isHidden) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/licenses/fetchAllLicensees?ipId=${ipId}`);
        setLicensees(response.data.licensees || []);
      } catch (error) {
        console.error('Error fetching licensees:', error);
        setError('Failed to load licensee data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLicensees();
  }, [ipId, isHidden]);
  
  if (isHidden || !ipId) return null;
  
  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };
  
  return (
    <div className="mt-6 bg-indigo-900/10 border border-indigo-700/40 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-indigo-400 mb-4">Licensees</h3>
      
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 py-2">{error}</div>
      ) : licensees.length === 0 ? (
        <div className="text-gray-400 py-2 text-center">
          No one has minted a license token for this IP asset yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-3 font-medium text-gray-400">Wallet</th>
                <th className="py-2 px-3 font-medium text-gray-400">Token ID</th>
                <th className="py-2 px-3 font-medium text-gray-400">Minted</th>
                <th className="py-2 px-3 font-medium text-gray-400">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {licensees.map((licensee, index) => (
                <tr 
                  key={`${licensee.wallet}-${licensee.tokenId}`} 
                  className={index % 2 === 0 ? 'bg-gray-800/20' : ''}
                >
                  <td className="py-2 px-3">{formatWalletAddress(licensee.wallet)}</td>
                  <td className="py-2 px-3">{licensee.tokenId}</td>
                  <td className="py-2 px-3 text-gray-400 text-sm">{formatTimeAgo(licensee.mintedAt)}</td>
                  <td className="py-2 px-3">
                    <a 
                      href={`https://aeneid.storyscan.io/tx/${licensee.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}