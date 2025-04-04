"use client";
import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const convertIpfsUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    const ipfsHash = url.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  }
  return url;
};

interface Trait {
  id: number;
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  attributeImage: string;
  category: string;
  prices?: Array<{
    priceDecimal: number;
    priceUsd: number;
    tokenId: string;
    sourceName: string;
    sourceUrl: string;
    timestamp: string;
    orderTimestampAt: string;
  }>;
}

type RarityScore = {
  _id: string;
  nftName: string;
  imageUrl: string;
  totalScore: number;
  rank: number;
  trait_scores: Record<string, number>;
  trait_rarities: Record<string, number>;
  calculated_at: string;
  tokenId?: string;
  _class: string;
};

type SortField = 'rank' | 'score' | 'name' | 'date';
type SortDirection = 'asc' | 'desc';

export default function RarityPage() {
  const router = useRouter();
  const [rarityData, setRarityData] = useState<RarityScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const [elementLoading, setElementLoading] = useState(false);
  const [elementError, setElementError] = useState<{message: string; traitName: string} | null>(null);
  const [traits, setTraits] = useState<Record<string, Trait>>({});
  const itemsPerPage = 20;

  const fetchTrait = async (attributeName: string): Promise<Trait | null> => {
    const attributeValue = attributeName.split(':')[1]?.trim() || attributeName;
    const response = await fetch(`/api/traits?attributeName=${encodeURIComponent(attributeValue)}`);
    const data = await response.json();
    return data && data.id ? data : null;
  };

  useEffect(() => {
    const fetchRarityData = async () => {
      try {
        const response = await fetch('/api/rarity');
        if (!response.ok) {
          throw new Error('Failed to fetch rarity data');
        }
        const data = await response.json();
        setRarityData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRarityData();
  }, []);

  const handleTraitClick = async (attributeName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setElementLoading(true);
    setElementError(null);
    
    try {
      const attributeValue = attributeName.split(':')[1]?.trim() || attributeName;
      const response = await fetch(`/api/traits?attributeName=${encodeURIComponent(attributeValue)}`);
      const data = await response.json();
      
      if (data && data.id) {
        router.push(`/losmuertosworld/traits/${data.id}`);
      } else {
        setElementError({
          message: `Trait not found for "${attributeValue}"`,
          traitName: attributeValue
        });
      }
    } catch {
      setElementError({
        message: 'Failed to load story element',
        traitName: attributeName
      });
    } finally {
      setElementLoading(false);
    }
  };

  const filteredAndSortedData = React.useMemo(() => {
    let filtered = [...rarityData];
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nftName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'score':
          comparison = b.rank - a.rank;
          break;
        case 'name':
          comparison = a.nftName.localeCompare(b.nftName);
          break;
        case 'date':
          comparison = new Date(b.calculated_at).getTime() - new Date(a.calculated_at).getTime();
          break;
      }
      return sortDirection === 'desc' ? comparison : -comparison;
    });
  }, [rarityData, searchTerm, sortField, sortDirection]);

  const paginatedData = React.useMemo(() => {
    return filteredAndSortedData.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );
  }, [filteredAndSortedData, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  useEffect(() => {
    const fetchVisibleTraits = async () => {
      const newElements: Record<string, Trait> = {};
      
      for (const item of paginatedData) {
        const rarestTrait = Object.entries(item.trait_rarities)
        .reduce((a, b) => (a[1] < b[1] ? a : b));
        
        if (!traits[rarestTrait[0]]) {
          try {
            const element = await fetchTrait(rarestTrait[0]);
            if (element) {
              newElements[rarestTrait[0]] = element;
            }
          } catch (error) {
            console.error('Error fetching story element:', error);
          }
        }
      }
      
      if (Object.keys(newElements).length > 0) {
        setTraits(prev => ({
          ...prev,
          ...newElements
        }));
      }
    };

    fetchVisibleTraits();
  }, [paginatedData, traits]);

  if (loading) {
    return (
      <div className="main-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container flex items-center justify-center">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="main-container p-6">
      <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold mb-4 text-white">Los Muertos Collection Rarity Rankings</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 bg-gray-800 border border-gray-700 rounded-md 
                          text-white placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="w-48 p-2 bg-gray-800 border border-gray-700 rounded-md text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="rank">Rank</option>
              <option value="score">Rarity Score</option>
              <option value="name">Name</option>
            </select>
            
            <button
              onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
              className="nav-button w-48 flex items-center justify-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>

          <div className="text-sm text-gray-400 mb-4">
            Showing {paginatedData.length} of {filteredAndSortedData.length} items
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Image</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">NFT Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rarity Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rarest Trait</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginatedData.map((item, index) => {
                const rarestTrait = Object.entries(item.trait_rarities)
                  .reduce((a, b) => (a[1] > b[1] ? a : b));
                const tokenId = item.tokenId || item.nftName.split('#')[1]?.trim();

                return (
                  <tr 
                    key={item.nftName} 
                    className="hover:bg-gray-800/30 transition-colors cursor-pointer"
                    onClick={() => tokenId && router.push(`/losmuertosworld/muertos/${tokenId}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                      {(page - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.imageUrl && (
                        <div className="relative w-16 h-16">
                          <Image 
                            src={convertIpfsUrl(item.imageUrl)}
                            alt={item.nftName}
                            fill
                            sizes="64px"
                            className="object-contain rounded-md"
                          />
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.nftName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.rank.toFixed(2)}</td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hover:text-blue-400 cursor-pointer relative group"
                      onClick={(e) => handleTraitClick(rarestTrait[0], e)}
                    >
                      <div className="flex items-center gap-2">
                      {traits[rarestTrait[0]] && (
                        <div className="relative w-6 h-6 flex-shrink-0">
                          <Image
                            src={convertIpfsUrl(traits[rarestTrait[0]].attributeImage)}
                            alt={rarestTrait[0]}
                            fill
                            sizes="24px"
                            className="object-contain rounded-sm"
                          />
                        </div>
                      )}
                        <span>
                          {elementLoading && rarestTrait[0] === (elementError?.traitName || '') ? (
                            <span className="text-gray-400">Loading...</span>
                          ) : (
                            rarestTrait[0]
                          )}
                        </span>
                      </div>
                      {elementError && rarestTrait[0] === elementError.traitName && (
                        <div className="absolute z-10 invisible group-hover:visible 
                                      bg-gray-900 text-white p-2 rounded-md shadow-lg 
                                      text-xs -mt-1 left-full ml-2 w-48">
                          {elementError.message}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="nav-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="nav-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}