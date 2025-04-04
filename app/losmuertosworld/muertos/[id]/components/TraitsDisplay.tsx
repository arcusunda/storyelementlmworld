import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface ElementDetails {
  [key: string]: {
    id: number;
  } | null;
}

interface RarityData {
  rank: number;
  trait_rarities: {
    [key: string]: number;
  };
}

interface Attribute {
  trait_type: string;
  value: string;
}

interface CombinedTraitsDisplayProps {
  metadata: {
    attributes: Attribute[];
  };
  elementDetails: ElementDetails;
  rarityData: RarityData | null;
}

const TraitsDisplay: React.FC<CombinedTraitsDisplayProps> = ({ 
  metadata, 
  elementDetails, 
  rarityData 
}) => {
  const linkableTypes = ['Headwear', 'Mask', 'Body', 'Expression'];
  
  const getRarityInfo = (traitType: string, value: string) => {
    if (!rarityData?.trait_rarities) return null;
    const key = `${traitType}:${value}`;
    const score = rarityData.trait_rarities[key];
    return score ? score * 100 : null;
  };

  const filteredAttributes = metadata.attributes.filter(
    attr => !['Nose', 'Background'].includes(attr.trait_type)
  );

  return (
    <div className="border-t border-gray-700 pt-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-300">Attributes</h2>
        {/*{rarityData && (
          <div className="text-sm text-gray-400">
            Rank #{rarityData.rank}
          </div>
        )} */}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {filteredAttributes.map((attr, idx) => {
          const isLinkable = linkableTypes.includes(attr.trait_type);
          const elementKey = attr.trait_type.toLowerCase();
          const elementId = isLinkable ? elementDetails[elementKey]?.id : null;
          const rarityScore = getRarityInfo(attr.trait_type, attr.value);
          
          interface ContentWrapperProps {
            children: React.ReactNode;
          }
          
          const ContentWrapper: React.FC<ContentWrapperProps> = ({ children }) => 
            elementId ? (
              <Link 
                href={`/losmuertosworld/traits/${elementId}`}
                className="block bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700/70 transition-colors group relative"
              >
                {children}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/50 rounded-lg transition-colors" />
              </Link>
            ) : (
              <div className="bg-gray-700/50 rounded-lg p-3">
                {children}
              </div>
            );

          return (
            <ContentWrapper key={idx}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-400">{attr.trait_type}</p>
                  <p className="text-white font-medium truncate">{attr.value}</p>
                  {rarityScore && (
                    <p className="text-sm text-blue-300 mt-1">
                      {rarityScore < 1 ? rarityScore.toFixed(2) : Math.round(rarityScore)}% rarity
                    </p>
                  )}
                </div>
                {elementId && (
                  <ExternalLink 
                    className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" 
                    size={16}
                  />
                )}
              </div>
            </ContentWrapper>
          );
        })}
      </div>
    </div>
  );
};

export default TraitsDisplay;