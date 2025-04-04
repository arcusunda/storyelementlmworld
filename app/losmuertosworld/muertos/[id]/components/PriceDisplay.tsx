import { StoryElement } from '@/app/types';
import { useEffect, useState } from 'react';

interface Price {
  priceDecimal: number;
  priceUsd: number;
  tokenId: string;
  sourceName: string;
  sourceUrl: string;
  timestamp: string;
  orderTimestampAt: string;
}

interface PriceDisplayProps {
  tokenId: number;
  elementDetails: {

    headwear: StoryElement | null;

    body: StoryElement | null;

    mask: StoryElement | null;

    expression: StoryElement | null;

  };  
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ tokenId }) => {
  const [prices, setPrices] = useState<Price[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(`/api/prices/${tokenId}`);
        if (!response.ok) throw new Error('Failed to fetch price');
        
        const allPrices = await response.json();
        const pricesBySource = allPrices.reduce((acc: Price[], price: Price) => {
          const existingPrice = acc.find(p => p.sourceName === price.sourceName);
          if (!existingPrice) {
            acc.push(price);
          }
          return acc;
        }, []);

        setPrices(pricesBySource);
      } catch (error) {
        console.error('Error fetching price:', error);
        setPrices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
  }, [tokenId]);

  const getTimeAgo = (timestamp: string) => {
    try {
      if (!timestamp) return 'Date unavailable';
      const now = new Date();
      const refreshedAt = new Date(timestamp);
      const minutesAgo = Math.floor((now.getTime() - refreshedAt.getTime()) / 60000);
      if (minutesAgo < 0) return 'Invalid timestamp';
      return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
    } catch {
      return 'Date unavailable';
    }
  };

  if (isLoading) return null;
  if (prices.length === 0) return null;

  return (
    <div className="border-t border-gray-700 pt-4 mt-4">
      <h2 className="text-lg font-semibold text-gray-300 mb-4">This Muerto is Listed</h2>
      <div className="space-y-2">
        {prices.map((price) => (
          <a
            key={`${price.sourceName}-${price.timestamp}`}
            href={price.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Floor Price</p>
                <div className="text-xl font-bold text-blue-400">
                  {'Ξ'} {price.priceDecimal.toFixed(3)}
                </div>
                <p className="text-sm text-gray-500">${price.priceUsd.toFixed(2)} USD</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-300">{price.sourceName}</p>
                <p className="text-sm text-gray-400">Token #{price.tokenId}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {getTimeAgo(price.timestamp)}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default PriceDisplay;