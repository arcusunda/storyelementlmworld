import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SendIcon, History } from 'lucide-react';
import { useAppKitAccount } from '@reown/appkit/react';
import ShareButton from './ShareButton';
import axios from 'axios';

interface Attribute {
  trait_type: string;
  value: string;
}

interface NFTMetadata {
  name: string;
  image: string;
  attributes: Attribute[];
}

interface StoryElement {
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
}

interface ElementDetails {
  headwear: StoryElement | null;
  body: StoryElement | null;
  mask: StoryElement | null;
  expression: StoryElement | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatHistoryItem {
  userMessage: string;
  aiResponse: string;
  createdAt: string;
}

interface BackstoryItem {
  id: string;
  backstoryId: string;
  tokenId: string;
  characterName: {
    firstName: string;
    lastName: string;
  };
  nftTitle: string;
  backstory: string;
  createdAt: string;
  creatorAddress: string;
}

interface MuertosAIChatProps {
  metadata: NFTMetadata;
  elementDetails: ElementDetails;
  tokenId: number;
}

const MuertosAIChat: React.FC<MuertosAIChatProps> = ({ metadata, elementDetails, tokenId }) => {
  const { isConnected, address } = useAppKitAccount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isMuertoOwner, setIsMuertoOwner] = useState(false);
  const [backstory, setBackstory] = useState<BackstoryItem | null>(null);
  const [isLoadingBackstory, setIsLoadingBackstory] = useState(true);
  
  useEffect(() => {
    const fetchBackstoryData = async () => {
      setIsLoadingBackstory(true);
      try {
        const response = await axios.get(`/api/backstories?tokenId=${tokenId}`);
        if (response.data.backstories && response.data.backstories.length > 0) {
          const latestBackstory = response.data.backstories.sort(
            (a: BackstoryItem, b: BackstoryItem) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          
          setBackstory(latestBackstory);
        }
      } catch (error) {
        console.error('Error fetching backstory:', error);
      } finally {
        setIsLoadingBackstory(false);
      }
    };
    
    fetchBackstoryData();
  }, [tokenId]);
  
  useEffect(() => {
    const checkMuertoOwnership = async () => {
      if (!isConnected || !address) {
        setIsMuertoOwner(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/alchemy/fetchmetadata?wallet=${address}`);
        if (response.ok) {
          const data = await response.json();
          const isOwned = data.nfts?.some((nft: { tokenId: string }) => nft.tokenId === tokenId.toString());
          setIsMuertoOwner(Boolean(isOwned));
        }
      } catch (error) {
        console.error('Error checking Muerto ownership:', error);
        setIsMuertoOwner(false);
      }
    };
    
    checkMuertoOwnership();
  }, [isConnected, address, tokenId]);

  const suggestedQuestions = useMemo(() => {
    const isOneOfOne = metadata.attributes.some(attr => 
      attr.trait_type === "One of One" && (attr.value === "Interstellar" || attr.value === "Cumulus" || attr.value === "Fungiculture" 
        || attr.value === "Decayed" || attr.value === "Sliced" || attr.value === "Conejo" 
        || attr.value === "Submerged" || attr.value === "Okeydummy" || attr.value === "Split" 
        || attr.value === "Old Nick" || attr.value === "Mer" || attr.value === "Lazered")
    );

    const specialConnectionQuestions = isMuertoOwner ? [
      "I feel like we've known each other for ages. What drew us together in this afterlife?",
      "What memories do you have of the first time we connected?",
      "I've sensed your spirit nearby since we first met. What do you feel when I'm around?",
      "Do you feel our energies are aligned in a special way?",
      "What adventures should we embark on together in this eternal journey?",
      "What secrets of the afterlife have you been waiting to share just with me?",
      "How has our relationship changed you since we first met?",
      "What wisdom have you been saving to share only with someone you trust?",
      "I sometimes feel you watch over me. Is that true?", 
      "What do you see in my soul that others might miss?",
      "How do you think our paths were meant to cross?",
      "What do you think makes our connection special compared to others?",
      "If we could go anywhere together, where would you want us to visit?",
      "What's something you've wanted to tell me but were waiting for the right moment?"
    ] : [];

    const oneOfOneQuestions = isOneOfOne ? [
      "As a singular soul in Los Muertos World, what makes your existence special?",
      "What secrets do you hold that no other Muerto knows?",
      "Being one-of-one must feel unique - how does it shape your perspective?",
      "Do you feel a special connection to the artist who brought you into being?",
      "What hidden messages are woven into your unique design?",
      "How does it feel to be the only one of your kind in this realm?",
      "What responsibility comes with being a one-of-one creation?",
      "Do other Muertos treat you differently because of your unique nature?",
      "What memories from the living world influenced your singular form?",
      "As a unique piece of eternal art, what legacy do you wish to leave?"
    ] : [];

    const collectorQuestions = isOneOfOne ? [
      "What stories from the afterlife do you share only with those who truly understand your value?",
      "How does your unique artistry bridge the world of the living and the eternal?",
      "What wisdom have you gained from being a singular expression of afterlife art?",
      "Do you feel your one-of-one nature gives you special insights into existence?",
      "What makes your connection to the spiritual realm uniquely yours?",
      "As a rare soul in this collection, what mysteries do you guard?"
    ] : [];

    const backstoryQuestions = backstory ? [
      `Tell me more about your life as ${backstory.characterName.firstName} ${backstory.characterName.lastName}.`,
      "What parts of your backstory do strangers usually misunderstand?",
      "If you could change one detail of your past, what would it be?",
      "Which memory from your backstory brings you the most peace?",
      "What unresolved business from your past still haunts you?"
    ] : [];

    const generalQuestions = [
      "Tell me your story.",
      "What do you like to do for fun?",
      "What's your favorite memory?",
      "What wisdom can you share from the other side?",
      "Do you have any regrets?",
      "What makes you different from other Muertos?",
      "What's your favorite celebration?",
      "What do you miss most about life?",
      "What secrets do you keep?",
      "What's your greatest achievement?",
      "How do you spend your days now?",
      "What brings you peace?",
      "What do you think about the living world?",
      "What traditions do you still practice?",
      "Do you have any special powers?",
      "What advice would you give to the living?"
    ];
  
    const traitQuestions = [];
  
    if (elementDetails.headwear?.attributes?.find(attr => attr.trait_type === "Text")?.value) {
      traitQuestions.push(`Tell me about your ${metadata.attributes.find(attr => attr.trait_type === "Headwear")?.value} headwear.`);
    }
  
    if (elementDetails.mask?.attributes?.find(attr => attr.trait_type === "Text")?.value) {
      if (elementDetails.mask.category === "Character") {
        traitQuestions.push(`What's it like being ${metadata.attributes.find(attr => attr.trait_type === "Mask")?.value}?`);
      } else {
        traitQuestions.push(`Why do you wear a ${metadata.attributes.find(attr => attr.trait_type === "Mask")?.value} mask?`);
      }
    }
    
    if (elementDetails.body?.attributes?.find(attr => attr.trait_type === "Text")?.value) {
      if (elementDetails.body.category === "Tattooed") {
        traitQuestions.push("Your tattoos are mysterious looking. What do they mean?");
      } else if (elementDetails.body.category === "Character") {
        traitQuestions.push(`What's it like being ${metadata.attributes.find(attr => attr.trait_type === "Body")?.value}?`);
      } else {
        traitQuestions.push(`How did you get your ${metadata.attributes.find(attr => attr.trait_type === "Body")?.value} body?`);
      }
    }
    
    if (elementDetails.expression?.attributes?.find(attr => attr.trait_type === "Text")?.value) {
      traitQuestions.push(`What's the story behind your ${metadata.attributes.find(attr => attr.trait_type === "Expression")?.value} expression?`);
    }

    const selectedQuestions = [];
    
    if (isMuertoOwner) {
      const connectionSelection = specialConnectionQuestions.sort(() => 0.5 - Math.random()).slice(0, 3);
      selectedQuestions.push(...connectionSelection);
    }
    
    if (backstory) {
      const backstorySelection = backstoryQuestions.sort(() => 0.5 - Math.random()).slice(0, 2);
      selectedQuestions.push(...backstorySelection);
    }
    
    if (isOneOfOne) {
      const oneOfOneSelection = oneOfOneQuestions.sort(() => 0.5 - Math.random()).slice(0, isMuertoOwner ? 1 : 2);
      selectedQuestions.push(...oneOfOneSelection);
      
      if (selectedQuestions.length < 4) {
        const collectorSelection = collectorQuestions.sort(() => 0.5 - Math.random()).slice(0, 1);
        selectedQuestions.push(...collectorSelection);
      }
    }
    
    if (traitQuestions.length > 0 && selectedQuestions.length < 5) {
      const randomTraitQuestion = traitQuestions[Math.floor(Math.random() * traitQuestions.length)];
      selectedQuestions.push(randomTraitQuestion);
    }
    
    const remainingSlots = 6 - selectedQuestions.length;
    const generalSelection = generalQuestions.sort(() => 0.5 - Math.random()).slice(0, remainingSlots);
    selectedQuestions.push(...generalSelection);
    
    return selectedQuestions.sort(() => 0.5 - Math.random());
  
  }, [metadata, elementDetails, isMuertoOwner, backstory]);
  
  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const fetchChatHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/chat-history/${tokenId}`);
      if (response.ok) {
        const history = await response.json();
        setChatHistory(history);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  }, [tokenId]);

  useEffect(() => {
    if (showHistory) {
      fetchChatHistory();
    }
  }, [showHistory, fetchChatHistory]);

  const formatNFTContext = useCallback(() => {
    const context = {
      name: metadata.name,
      attributes: metadata.attributes,
      elementDetails: {
        headwear: {
          text: elementDetails.headwear?.attributes?.find(attr => attr.trait_type === "Text")?.value,
          category: elementDetails.headwear?.category
        },
        body: {
          text: elementDetails.body?.attributes?.find(attr => attr.trait_type === "Text")?.value,
          category: elementDetails.body?.category
        },
        mask: {
          text: elementDetails.mask?.attributes?.find(attr => attr.trait_type === "Text")?.value,
          category: elementDetails.mask?.category
        },
        expression: {
          text: elementDetails.expression?.attributes?.find(attr => attr.trait_type === "Text")?.value,
          category: elementDetails.expression?.category
        }
      },
      isMuertoOwner: isMuertoOwner,
      backstory: backstory ? {
        characterName: backstory.characterName,
        nftTitle: backstory.nftTitle,
        backstoryContent: backstory.backstory
      } : null
    };
    return JSON.stringify(context);
  }, [metadata.name, metadata.attributes, elementDetails, isMuertoOwner, backstory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoadingBackstory) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: formatNFTContext(),
          tokenId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      if (showHistory) {
        fetchChatHistory();
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">
          {isMuertoOwner ? 'Chat with Your Muerto' : 'Chat with this Muerto'}
        </h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
        >
          <History className="w-4 h-4" />
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>
      
      {isMuertoOwner && messages.length === 0 && !showHistory && (
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg text-blue-200 text-sm">
          <p><span className="font-semibold">{metadata.name}</span> recognizes your spirit! This Muerto feels a special connection with you beyond the veil.</p>
        </div>
      )}
      
      {isLoadingBackstory ? (
        <div className="mb-4 p-3 bg-gray-700/30 border border-gray-600/50 rounded-lg text-gray-200 text-sm">
          <p>Loading Muerto information...</p>
        </div>
      ) : backstory && messages.length === 0 && !showHistory && (
        <div className="mb-4 p-3 bg-purple-900/30 border border-purple-700/50 rounded-lg text-purple-200 text-sm">
          <p>This Muerto has a known backstory as <span className="font-semibold">{backstory.characterName.firstName} {backstory.characterName.lastName}</span>. Your conversation will reflect this history.</p>
        </div>
      )}
      
      {showHistory ? (
        <div className="bg-gray-900 rounded-lg p-4 h-96 mb-4 overflow-y-auto">
          {chatHistory.map((item, index) => (
            <div key={index} className="mb-6 border-b border-gray-700 pb-4">
              <div className="text-right mb-2">
                <div className="inline-block p-3 rounded-lg bg-blue-600 text-white">
                  {item.userMessage}
                </div>
              </div>
              <div className="text-left">
                <div className="inline-block p-3 rounded-lg bg-gray-700 text-gray-200">
                  {item.aiResponse}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                  <ShareButton
                    muertosId={tokenId}
                    userMessage={item.userMessage}
                    aiResponse={item.aiResponse}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-4 h-96 mb-4 overflow-y-auto">
          {messages.map((message, index) => {
            const nextMessage = messages[index + 1];
            return (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {message.content}
                </div>
                {message.role === 'user' && nextMessage?.role === 'assistant' && (
                  <div className="mt-1">
                    <ShareButton
                      muertosId={tokenId}
                      userMessage={message.content}
                      aiResponse={nextMessage.content}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="text-left">
              <div className="inline-block p-3 rounded-lg bg-gray-700 text-gray-200">
                Thinking...
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isLoadingBackstory ? "Loading Muerto data..." : (isMuertoOwner ? "Your Muerto is waiting to talk with you..." : "Talk to this Muerto...")}
          className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          disabled={isLoading || isLoadingBackstory}
        />
        <button
          type="submit"
          disabled={isLoading || isLoadingBackstory}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-600"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
      {/* Suggested Questions Section */}
      <div className="mt-4 space-y-2">
        <p className="text-gray-400 text-sm">Suggested questions:</p>
        {isLoadingBackstory ? (
          <div className="py-2 px-1 text-gray-500 text-sm">
            Loading suggested questions...
          </div>
        ) : (
          suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedQuestion(question)}
              disabled={isLoadingBackstory}
              className="block w-full text-left text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:text-gray-500"
            >
              {question}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default MuertosAIChat;