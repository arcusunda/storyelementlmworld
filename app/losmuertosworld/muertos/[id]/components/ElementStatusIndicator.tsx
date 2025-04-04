import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import Tooltip from './Tooltip';

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

interface NFTMetadata {
  name: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface ElementDetailsProps {
  elementDetails: {
    headwear: Trait | null;
    body: Trait | null;
    mask: Trait | null;
    expression: Trait | null;
  };
  metadata: NFTMetadata | null;
}

const ElementStatusIndicator = ({ elementDetails, metadata }: ElementDetailsProps) => {
  if (!metadata?.attributes) {
    return null;
  }

  const isValidTrait = (element: Trait | null): boolean => {
    if (!element || typeof element !== 'object') return false;
    
    if (!('id' in element) || !('name' in element) || !('attributes' in element)) return false;
    
    if (!Array.isArray(element.attributes) || element.attributes.length === 0) return false;
    
    const textAttribute = element.attributes.find(attr => attr.trait_type === 'Text');
    
    return textAttribute !== undefined && 
           textAttribute.value !== undefined && 
           textAttribute.value.trim() !== '' && 
           textAttribute.value !== 'Coming soon...';
  };

  const existingTraits = metadata.attributes
    .filter(attr => ['Body', 'Headwear', 'Mask', 'Expression'].includes(attr.trait_type));

  const traits = existingTraits.map(attr => {
    let trait = null;
    switch (attr.trait_type) {
      case 'Body':
        trait = elementDetails.body;
        break;
      case 'Headwear':
        trait = elementDetails.headwear;
        break;
      case 'Mask':
        trait = elementDetails.mask;
        break;
      case 'Expression':
        trait = elementDetails.expression;
        break;
    }
    
    return {
      name: attr.trait_type,
      value: attr.value,
      hasTraits: isValidTrait(trait),
      text: trait?.attributes?.find(a => a.trait_type === 'Text')?.value || null
    };
  });

  if (traits.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-md bg-gray-800 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-3 text-white">Traits Status:</h3>
      <span className="text-gray-400">More cataloged traits give this muerto more context to work with.</span>
      <div className="grid grid-cols-2 gap-3">
        {traits.map(({ name, hasTraits, text }) => (
          <Tooltip
            key={name}
            content={
              hasTraits ? (
                text
              ) : (
                `Traits for this ${name.toLowerCase()} are coming soon!`
              )
            }
          >
            <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded cursor-help">
              <span className="text-white">{name}</span>
              {hasTraits ? (
                <Check className="text-green-500" size={20} />
              ) : (
                <div className="flex items-center gap-1">
                  <AlertCircle className="text-amber-500" size={20} />
                </div>
              )}
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default ElementStatusIndicator;