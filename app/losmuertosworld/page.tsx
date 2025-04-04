'use client';

import Link from 'next/link';
import '@/app/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'
import Header from '../components/Header';
import Footer from '../components/Footer';
import SkeletonCard from '../components/SkeletonCard';

interface Attribute {
  trait_type: string;
  value: string;
}

interface PriceInfo {
  priceDecimal: number;
  priceUsd: number;
  tokenId: string;
  sourceName: string;
  sourceUrl: string;
  timestamp: string;
}

interface Trait {
  id: number;
  name: string;
  description: string;
  image: string;
  attributeImage: string;
  category: string;
  attributes?: Attribute[];
  state: string;
  isRoot: boolean;
  prices?: PriceInfo[];
}

const TraitsPage = () => {
  const router = useRouter();
  const [traits, setTraits] = useState<Trait[]>([]);
  const [loading, setLoading] = useState(true);
  const [aspectFilter, setAspectFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [tokenIdInput, setTokenIdInput] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  
  useEffect(() => {
    fetchTraits();
  }, []);

  const fetchTraits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/traits');
      const data: Trait[] = await response.json();
      if (response.ok) {
        const shuffledData = data.sort(() => Math.random() - 0.5);
  
        setTraits(shuffledData);
        localStorage.setItem('traits', JSON.stringify(shuffledData));
      } else {
        console.error('Error:', data);
      }
    } catch (error) {
      console.error('Error fetching Traits:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAspectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAspectFilter(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };
  
  const handleTokenIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenIdInput(e.target.value);
  };

  const handleGetButtonClick = () => {
    if (tokenIdInput.trim()) {
      router.push(`/losmuertosworld/muertos/${tokenIdInput}`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredElements = traits.length
  ? traits.filter((element) => {
      const matchesAspect = !aspectFilter || 
        element.attributes?.some(attr => attr.trait_type === 'Aspect' && attr.value === aspectFilter);
      
      const matchesCategory = !categoryFilter || element.category === categoryFilter;

      const matchesSearch = !searchText || element.name.toLowerCase().includes(searchText.toLowerCase());

      return matchesAspect && matchesCategory && matchesSearch;
    })
  : [];
  
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex flex-col items-center p-6 max-w-7xl mx-auto">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-12 bg-gray-800 rounded-lg w-96 mx-auto mb-4" />
            <div className="h-24 bg-gray-800 rounded-lg w-2/3 mx-auto" />
          </div>
  
          {/* Progress table skeleton */}
          <div className="w-full max-w-3xl mx-auto mb-12 bg-gray-800/50 p-6 rounded-xl animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4 w-1/3 mx-auto" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded" />
              ))}
            </div>
          </div>
  
          {/* Cards grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {[...Array(8)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      {/* Main container with sidebar layout */}
      <div className="container mx-auto px-4 pt-24 pb-8"> {/* Changed py-8 to pt-24 pb-8 */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content area */}
          <div className="flex-1">
            <div className="text-center space-y-6 mb-12">
              <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-gray-300">
                Explore the Stories Behind the Traits
              </p>
              <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-gray-300">
                Step into <i>Story Element for Los Muertos World</i>...
              </p>
            </div>
  
            {/* Filters */}
            <div className="w-full bg-gray-800/30 rounded-xl p-6 mb-12">
              <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="search-filter" className="block text-sm font-medium text-gray-300">
                  Search by Name
                </label>
                <input
                  id="search-filter"
                  type="text"
                  value={searchText}
                  onChange={handleSearchChange}
                  placeholder="Search traits..."
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 hover:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
                <div className="space-y-2">
                  <label htmlFor="aspect-filter" className="block text-sm font-medium text-gray-300">
                    Filter by Aspect
                  </label>
                  <select
                    id="aspect-filter"
                    value={aspectFilter}
                    onChange={handleAspectChange}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 hover:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">All</option>
                    <option value="Muerto Mask">Mask</option>
                    <option value="Muerto Body">Body</option>
                    <option value="Muerto Headwear">Headwear</option>
                    <option value="Muerto Expression">Expression</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="category-filter" className="block text-sm font-medium text-gray-300">
                    Filter by Category
                  </label>
                  <select
                    id="category-filter"
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 hover:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">All</option>
                    <option value="Character">Character</option>
                    <option value="Tattooed">Tattooed</option>
                    <option value="Gold">Gold</option>
                  </select>
                </div>
              </div>
            </div>
  
            <div className="w-full bg-gray-800/30 rounded-xl p-6 mb-12">
            <div className="flex flex-col space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGetButtonClick();
              }}
              className="flex flex-col space-y-4"
            >
              <input
                type="text"
                value={tokenIdInput}
                onChange={handleTokenIdChange}
                placeholder="Enter Token ID"
                className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!/^\d+$/.test(tokenIdInput.trim())}
                className={`${
                  /^\d+$/.test(tokenIdInput.trim())
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                } rounded-lg px-6 py-2.5 transition-colors font-medium`}
              >
                View Muerto
              </button>
            </form>
          </div>

          </div>
  
            {/* Traits Grid */}
            {!filteredElements || filteredElements.length < 1 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                {/* ... your existing empty state ... */}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredElements.map((element) => (
                  <div 
                  key={element.id}
                  className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  {/* Trait details section - clickable area for story element */}
                  <Link 
                    href={`/losmuertosworld/traits/${element.id}`}
                    className="block mb-4 hover:opacity-95 transition-opacity"
                  >
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src={element.attributeImage}
                      alt={`${element.name}`}
                      width={500}
                      height={500}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="w-full h-auto transform group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent opacity-60" />
                  </div>                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-200">{element.name}</h3>
                      {element.attributes && (
                        <div className="text-left">
                          {element.attributes
                            .filter(attr => attr.trait_type !== 'Text')
                            .map((attr, idx) => (
                              <p key={idx} className="text-gray-400">
                                <strong>{attr.trait_type}:</strong> {attr.value}
                              </p>
                            ))}
                        </div>
                      )}
                    </div>
                  </Link>
    
                  {/* Price section */}
                  {element.prices && element.prices.length > 0 ? (
                    <div className="space-y-2">
                      {element.prices.map((price) => (
                        <a 
                          key={price.sourceName}
                          href={price.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-gray-900/50 rounded-lg p-4 mt-4 hover:bg-gray-900/70 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-sm text-gray-400">Floor Price</span>
                              <div className="text-xl font-semibold text-blue-400">
                                Ξ {price.priceDecimal.toFixed(3)}
                              </div>
                              <div className="text-sm text-gray-500">
                                ${price.priceUsd.toFixed(2)} USD
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">
                                Market: {price.sourceName}
                              </p>
                              <p className="text-sm text-gray-400">
                                Token #{price.tokenId}
                              </p>
                              <div className="text-xs text-gray-500 mt-1">
                                {(() => {
                                  try {
                                    if (!price.timestamp) {
                                      return 'Date unavailable';
                                    }
                                    const now = new Date();
                                    const refreshedAt = new Date(price.timestamp);
                                    const minutesAgo = Math.floor((now.getTime() - refreshedAt.getTime()) / 60000);
    
                                    if (minutesAgo < 0) {
                                      return 'Invalid timestamp';
                                    }
    
                                    return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
                                  } catch (e) {
                                    console.error('Error calculating minutes ago:', e);
                                    return 'Date unavailable';
                                  }
                                })()}
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-gray-400">Not listed</div>
                  )}
                </div>
                ))}
              </div>
            )}
          </div>
  
        </div>
      </div>
      <Footer />
    </div>
  );
  
};

export default TraitsPage;