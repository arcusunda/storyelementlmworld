import React from 'react';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  muertosId: number;
  userMessage: string;
  aiResponse: string;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  muertosId,
  userMessage,
  aiResponse,
  className = ''
}) => {
  const extractFirstDialogue = (text: string): string => {
    if (!text) return '';
    
    const cleanText = (str: string) => {
      return str.replace(/\s+/g, ' ').trim();
    };
    
    const regex = /\[.*?\]\s*["']([^"]*(?:[''][^"]*)*)['"]/;
    const match = text.match(regex);
    if (match && match[1]) {
      return cleanText(match[1]);
    }
    
    const bracketText = text.replace(/\[.*?\]\s*/, '');
    if (bracketText) {
      return cleanText(bracketText);
    }
    
    return cleanText(text);
  };
  
  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    
    if (text.length <= maxLength) return text;
    
    const lastSpace = text.lastIndexOf(' ', maxLength - 3);
    if (lastSpace > 0) {
      return text.substring(0, lastSpace) + '...';
    }
    
    return text.substring(0, maxLength - 3) + '...';
  };
  
  const handleShare = () => {
    try {
      const processedResponse = extractFirstDialogue(aiResponse);

      const tags = '@los_muertosNFT @StoryElementAI';

      const reservedChars = 65 + tags.length;
      const totalAvailable = 265 - reservedChars;
      const maxQuestionLength = Math.floor(totalAvailable * 0.3);
      const maxAnswerLength = Math.floor(totalAvailable * 0.7);
      
      const tweetText = `Q: ${truncateText(userMessage, maxQuestionLength)}\nA: ${truncateText(processedResponse, maxAnswerLength)}\n\n${tags}\n\nChat with this muerto at:`;
      const url = `${window.location.origin}/losmuertosworld/muertos/${muertosId}`;
      
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
      
      const width = 550;
      const height = 420;
      const left = Math.max(0, (window.screen.width / 2) - (width / 2));
      const top = Math.max(0, (window.screen.height / 2) - (height / 2));
      
      window.open(
        twitterUrl,
        '_blank',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 
        transition-colors duration-200 text-sm mt-1 focus:outline-none 
        focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-md px-2 py-1 
        ${className}`.trim()}
      aria-label="Share on Twitter"
    >
      <Share2 className="w-4 h-4" />
      <span>Share</span>
    </button>
  );
};

export default ShareButton;