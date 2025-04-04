import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, User, Award } from 'lucide-react'

interface ElementRelationship {
  relatedElementName: string;
  relationType: string;
}

interface IpRegistrationPotential {
  uniqueness: number;
  worldBuilding: number;
  commercialPotential: number;
  recommendedForRegistration: boolean;
}

interface StoryElement {
  id: string;
  tokenId: string;
  shortId: string;
  nftTitle: string;
  elementTitle: string;
  elementType: string;
  description: string;
  culturalInfluences: string[];
  narrativePotential: string;
  relationships: ElementRelationship[];
  walletAddress: string;
  ipRegistrationPotential: IpRegistrationPotential;
  createdAt: string;
  registeredAsIp: boolean;
  registrationDate: string | null;
  registrationTxHash: string | null;
}

interface MuertoNFT {
  tokenId: string;
  name?: string;
  image?: string;
}

interface StoryElementCardProps {
  element: StoryElement;
  nft?: MuertoNFT;
}

const StoryElementCard: React.FC<StoryElementCardProps> = ({ element, nft }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
  
  const getElementTypeColor = (elementType: string) => {
    const typeColors: Record<string, string> = {
      'Artifact': 'bg-purple-500',
      'Location': 'bg-blue-500',
      'Organization': 'bg-green-500',
      'Ritual': 'bg-amber-500',
      'Event': 'bg-red-500',
      'System': 'bg-teal-500',
      'Character': 'bg-pink-500',
      'Faction': 'bg-indigo-500'
    }
    
    return typeColors[elementType] || 'bg-gray-500'
  }
  
  const renderIpPotentialBadge = (potential: IpRegistrationPotential) => {
    if (!potential) return null
    
    const totalScore = potential.uniqueness + potential.worldBuilding + potential.commercialPotential
    const avgScore = Math.round(totalScore / 3)
    
    let badgeColor = 'bg-gray-600'
    if (avgScore >= 8) badgeColor = 'bg-green-600'
    else if (avgScore >= 6) badgeColor = 'bg-amber-600'
    else if (avgScore >= 4) badgeColor = 'bg-orange-600'
    
    return (
      <div className={`text-xs font-medium ${badgeColor} text-white rounded-full px-2 py-0.5 flex items-center`}>
        <span>IP Score: {avgScore}/10</span>
      </div>
    )
  }
  
  return (
    <div className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] border border-gray-700 bg-gray-800/50">
      {/* NFT Image */}
      <div className="relative w-full pt-[80%]">
        <Link href={`/losmuertosworld/storyelements/s/${element.shortId}`}>
          {nft?.image ? (
            <Image
              src={nft.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
              alt={element.nftTitle}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain absolute inset-0 cursor-pointer"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">Image Loading...</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
            <div className="w-full p-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <div className={`text-xs font-medium ${getElementTypeColor(element.elementType)} text-white rounded-full px-2 py-0.5`}>
                  {element.elementType}
                </div>
                {element.registeredAsIp && (
                  <div className="text-xs font-medium bg-yellow-600 text-white rounded-full px-2 py-0.5 flex items-center">
                    <Award className="h-3.5 w-3.5 mr-1" />
                    <span>Registered IP</span>
                  </div>
                )}
                {renderIpPotentialBadge(element.ipRegistrationPotential)}
              </div>
              <h3 className="text-white font-bold text-lg leading-tight">{element.elementTitle}</h3>
              <p className="text-gray-300 text-sm">{element.nftTitle}</p>
            </div>
          </div>
        </Link>
      </div>
      
      <div className="p-5">
        {/* Element preview */}
        <div className="mb-4">
          <h4 className="font-medium text-lg mb-2">Description</h4>
          <p className="text-sm text-gray-300 line-clamp-3">
            {element.description.split('\n')[0]}...
          </p>
        </div>
        
        {/* Cultural Influences */}
        {element.culturalInfluences && element.culturalInfluences.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs text-gray-400 mb-1">Cultural Influences</h4>
            <div className="flex flex-wrap gap-1">
              {element.culturalInfluences.slice(0, 3).map((culture, index) => (
                <span key={index} className="text-xs bg-gray-700 text-gray-300 rounded px-2 py-0.5">{culture}</span>
              ))}
              {element.culturalInfluences.length > 3 && (
                <span className="text-xs bg-gray-700 text-gray-300 rounded px-2 py-0.5">+{element.culturalInfluences.length - 3} more</span>
              )}
            </div>
          </div>
        )}
        
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>{formatDate(element.createdAt)}</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <User className="h-3.5 w-3.5 mr-1" />
            <span>{truncateAddress(element.walletAddress)}</span>
          </div>
        </div>
        
        {/* Action button */}
        <Link
          href={`/losmuertosworld/storyelements/s/${element.shortId}`}
          className="w-full inline-flex items-center justify-center py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View Full Element
        </Link>
      </div>
    </div>
  )
}

export default StoryElementCard