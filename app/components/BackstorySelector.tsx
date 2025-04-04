// /app/components/BackstorySelector.tsx
import React, { useState, useEffect } from 'react';
import { Info, HelpCircle, Sparkles } from 'lucide-react';
import { BACKSTORY_CATEGORIES, BackstoryChoices, DEFAULT_BACKSTORY_CHOICES } from './BackstoryTypes';

interface BackstorySelectorProps {
  onChoicesChange: (choices: BackstoryChoices) => void;
  initialChoices?: BackstoryChoices;
  disabled?: boolean;
}

export default function BackstorySelector({ 
  onChoicesChange, 
  initialChoices = DEFAULT_BACKSTORY_CHOICES,
  disabled = false 
}: BackstorySelectorProps) {
  const [choices, setChoices] = useState<BackstoryChoices>(initialChoices);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    console.log('initialChoices changed:', initialChoices);
    setChoices(initialChoices);
  }, [initialChoices]);

  const toggleCategory = (categoryId: string) => {
    setExpanded(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const showTooltip = (optionId: string) => {
    setActiveTooltip(optionId);
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  const handleOptionSelect = (categoryId: string, optionId: string) => {
    if (disabled) return;

    const newChoices = {
      ...choices,
      [categoryId]: optionId,
      isRandom: false
    };
    
    setChoices(newChoices);
    onChoicesChange(newChoices);
  };

  const getRandomOption = (categoryId: string) => {
    const category = BACKSTORY_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return undefined;
    
    const randomIndex = Math.floor(Math.random() * category.options.length);
    return category.options[randomIndex].id;
  };

  const handleRandomSelect = () => {
    if (disabled) return;
    
    const newChoices: BackstoryChoices = {
      isRandom: false,
      origin: getRandomOption('origin'),
      purpose: getRandomOption('purpose'),
      emotional: getRandomOption('emotional'),
      relationship: getRandomOption('relationship'),
      archetype: getRandomOption('archetype')
    };
    
    setChoices(newChoices);
    onChoicesChange(newChoices);
    
    const expandedState: Record<string, boolean> = {};
    BACKSTORY_CATEGORIES.forEach(category => {
      expandedState[category.id] = true;
    });
    setExpanded(expandedState);
  };

  return (
    <div className="p-4 bg-gray-800/60 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-purple-300">Backstory Direction</h4>
        
        <button
          onClick={handleRandomSelect}
          disabled={disabled}
          className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium
            bg-purple-600 text-white hover:bg-purple-700 transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Surprise Me</span>
        </button>
      </div>
      
      <p className="text-sm text-gray-400 italic mb-3">
        Select options from any category to guide your character&apos;s backstory or click &quot;Surprise Me&rdquo; for random selections. Each selection will influence the narrative direction.
      </p>
      
      <div className="space-y-4">
        {BACKSTORY_CATEGORIES.map(category => (
          <div 
            key={category.id}
            className={`border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 ${
              expanded[category.id] ? 'bg-gray-700/50' : 'bg-gray-800/50'
            }`}
          >
            <button
              onClick={() => toggleCategory(category.id)}
              disabled={disabled}
              className={`w-full p-3 text-left flex items-center justify-between ${
                disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-gray-700/30'
              }`}
            >
              <div className="flex items-center">
                <span className="font-medium text-white">{category.name}</span>
                <div 
                  className="ml-2 relative"
                  onMouseEnter={() => showTooltip(`category-${category.id}`)}
                  onMouseLeave={hideTooltip}
                >
                  <Info className="h-4 w-4 text-gray-400" />
                  
                  {activeTooltip === `category-${category.id}` && (
                    <div className="absolute z-10 left-6 -top-2 w-64 p-2 bg-gray-900 border border-gray-700 rounded shadow-lg text-xs">
                      {category.description}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {choices[category.id as keyof BackstoryChoices] && (
                  <span className="text-xs px-2 py-1 bg-purple-500/30 rounded text-purple-200">
                    {category.options.find(o => o.id === choices[category.id as keyof BackstoryChoices])?.name || ''}
                  </span>
                )}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 transition-transform duration-200 ${expanded[category.id] ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </div>
            </button>
            
            {expanded[category.id] && (
              <div className="p-3 border-t border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {category.options.map(option => (
                  <div key={option.id} className="relative">
                    <button
                      onClick={() => handleOptionSelect(category.id, option.id)}
                      disabled={disabled}
                      className={`w-full p-2 text-left rounded transition-all flex items-center justify-between ${
                        choices[category.id as keyof BackstoryChoices] === option.id
                          ? 'bg-purple-600/70 text-white'
                          : 'bg-gray-700/50 text-gray-200 hover:bg-gray-600/70'
                      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className="text-sm">{option.name}</span>
                      
                      <div 
                        className="relative"
                        onMouseEnter={() => showTooltip(`option-${option.id}`)}
                        onMouseLeave={hideTooltip}
                      >
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                        
                        {activeTooltip === `option-${option.id}` && (
                          <div className="absolute z-10 right-6 -top-2 w-64 p-2 bg-gray-900 border border-gray-700 rounded shadow-lg text-xs">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}