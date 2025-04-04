import React, { useState } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import axios from 'axios';

interface StoryElementShareButtonProps {
  muertosId: number;
  characterName: string;
  storyElement: string;
  className?: string;
  shortId: string;
  walletAddress: string;
}

const StoryElementShareButton: React.FC<StoryElementShareButtonProps> = ({
  muertosId,
  characterName,
  storyElement,
  className = '',
  shortId,
  walletAddress
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleShare = async () => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      
      const response = await axios.post('/api/anthropic/storyelement-generate-tweet', {
        characterName,
        storyElement,
        tokenId: muertosId.toString(),
        shortId,
        walletAddress
      });
      
      if (!response.data || !response.data.tweet) {
        throw new Error('Failed to generate tweet');
      }
      
      const generatedTweet = response.data.tweet;
      
      const tags = '@los_muertosNFT @StoryElementAI';
      
      const maxTweetLength = 280 - tags.length - 5;
      
      let tweetText;
      if (generatedTweet.length > maxTweetLength) {
        tweetText = `${generatedTweet.substring(0, maxTweetLength - 3)}...\n\n${tags}`;
      } else {
        tweetText = `${generatedTweet}\n\n${tags}`;
      }
      
      const url = `${window.location.origin}/losmuertosworld/storyelements/s/${shortId}`;
      
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
      alert('Failed to generate tweet. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isGenerating}
      className={`inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 
        transition-colors duration-200 text-sm mt-1 focus:outline-none 
        focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-md px-4 py-2
        disabled:opacity-70 disabled:cursor-wait
        ${className}`.trim()}
      aria-label="Share on Twitter"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Crafting tweet...</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </>
      )}
    </button>
  );
};

export default StoryElementShareButton;