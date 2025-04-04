'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import Image from 'next/image';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

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
  attributes?: Attribute[];
  state: string;
  isRoot: boolean;
  prices?: PriceInfo[];
}

const TraitDetails = () => {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(typeof params.id === 'string' ? params.id : params.id?.[0] || "0", 10);
  
  const [trait, setTrait] = useState<Trait | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [vote, setVote] = useState<string>('');
  const [likes, setLikes] = useState<number>(0);
  const [unlikes, setUnlikes] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [voteDataLoading, setVoteDataLoading] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchTraitDetails(id as number);
      fetchVoteData(id as number);
    }
  }, [id]);

  const fetchTraitDetails = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/traits/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch story element details');
      }
      const data: Trait = await response.json();
      setTrait(data);
    } catch (error) {
      console.error('Error fetching story element:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleVote = async () => {
    if (!vote) {
      alert('Please select Like or Unlike.');
      return;
    }

    setSubmitLoading(true);
    try {
      const voteData = {
        id: trait?.id,
        name: trait?.name || 'Unknown',
        vote: vote,
        comment: comment,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voteData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      setVote('');
      setComment('');
      await fetchVoteData(id as number);
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('There was an error submitting your vote.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const fetchVoteData = async (id: number) => {
    setVoteDataLoading(true);
    try {
      const response = await fetch('/api/votes/check-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vote data');
      }

      const data = await response.json();
      setLikes(data.likes || 0);
      setUnlikes(data.unlikes || 0);
    } catch (error) {
      console.error('Error fetching vote data:', error);
    } finally {
      setVoteDataLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="flex flex-col items-center justify-center p-6 min-h-[60vh]">
          <ClipLoader color="#ffffff" loading={loading} size={50} />
          <p className="mt-4 text-gray-300 animate-pulse">Loading trait details...</p>
        </main>
        <Footer />
      </div>
    );
  }

    if (!trait) {
      return (
        <div className="min-h-screen bg-gray-900">
          <Header />
          <main className="flex flex-col items-center justify-center p-6 min-h-[60vh]">
            <div className="text-center space-y-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-300">Trait not found</h3>
              <p className="text-gray-400">We couldn&apos;t find the trait you&apos;re looking for.</p>
              <button
                onClick={() => router.push('/losmuertosworld')}
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return to Trait Catalog
              </button>
            </div>
          </main>
          <Footer />
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-8"> {/* Changed py-8 to pt-24 pb-8 */}
    
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image and Details */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="relative rounded-lg overflow-hidden mb-4">
              <Image
                src={trait.attributeImage}
                alt={`${trait.name}`}
                width={500}
                height={500}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full h-auto transform group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent opacity-60" />
            </div>  
                <h1 className="text-2xl font-bold text-white mb-4">{trait.name}</h1>
                
                {trait.attributes && trait.attributes.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-300">Attributes</h2>
                    <div className="space-y-3">
                      {trait.attributes.map((attr, idx) => (
                        <div key={idx} className="flex flex-col bg-gray-700/50 p-3 rounded-lg">
                          <span className="text-sm text-gray-400">{attr.trait_type}</span>
                          {attr.trait_type === 'Text' ? (
                            <p className="text-white mt-2 leading-relaxed">{attr.value}</p>
                          ) : (
                            <span className="text-white font-medium">{attr.value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
  
              {/* Price Information */}
              {trait.prices && trait.prices.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-gray-300 mb-4">Market Prices</h2>
                  <div className="space-y-4">
                    {trait.prices.map((price) => (
                      <a
                        key={price.sourceName}
                        href={price.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-400">Floor Price</p>
                            <div className="text-xl font-bold text-blue-400">
                              Ξ {price.priceDecimal.toFixed(3)}
                            </div>
                            <p className="text-sm text-gray-500">${price.priceUsd.toFixed(2)} USD</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-300">{price.sourceName}</p>
                            <p className="text-sm text-gray-400">Token #{price.tokenId}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(() => {
                                try {
                                  if (!price.timestamp) return 'Date unavailable';
                                  const now = new Date();
                                  const refreshedAt = new Date(price.timestamp);
                                  const minutesAgo = Math.floor((now.getTime() - refreshedAt.getTime()) / 60000);
                                  if (minutesAgo < 0) return 'Invalid timestamp';
                                  return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
                                } catch {
                                  return 'Date unavailable';
                                }
                              })()}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
  
            {/* Right Column - Voting and Comments */}
            <div className="space-y-6">
              {/* Vote Section */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6">Rate This Trait Description</h2>
                
                <div className="flex justify-center gap-4 mb-6">
                  <button
                    onClick={() => setVote('Like')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all
                      ${vote === 'Like' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    👍 Like
                  </button>
                  <button
                    onClick={() => setVote('Unlike')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all
                      ${vote === 'Unlike' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    👎 Unlike
                  </button>
                </div>
  
                <div className="space-y-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this trait (optional)"
                    className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 
                      focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    rows={4}
                  />
  
                  <button
                    onClick={handleVote}
                    disabled={submitLoading || !vote}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all
                      ${submitLoading || !vote
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                  >
                    {submitLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <ClipLoader color="#ffffff" size={20} />
                        Submitting...
                      </span>
                    ) : (
                      'Submit Rating'
                    )}
                  </button>
                </div>
              </div>
  
              {/* Vote Stats */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Community Rating</h2>
                {voteDataLoading ? (
                  <div className="flex justify-center py-4">
                    <ClipLoader color="#ffffff" size={30} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-400 mb-1">Likes</p>
                      <p className="text-2xl font-bold text-green-400">{likes}</p>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-400 mb-1">Unlikes</p>
                      <p className="text-2xl font-bold text-red-400">{unlikes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
};

export default TraitDetails;
