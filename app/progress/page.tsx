'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClipLoader from 'react-spinners/ClipLoader';

const ProgressPage = () => {
  const [bodyCount, setBodyCount] = useState<number | null>(null);
  const [maskCount, setMaskCount] = useState<number | null>(null);
  const [headwearCount, setHeadwearCount] = useState<number | null>(null);
  const [expressionCount, setExpressionCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const bodyCount = await getStoryElementCount('Muerto Body');
        const maskCount = await getStoryElementCount('Muerto Mask');
        const headwearCount = await getStoryElementCount('Muerto Headwear');
        const expressionCount = await getStoryElementCount('Muerto Expression');
        
        setBodyCount(bodyCount);
        setMaskCount(maskCount);
        setHeadwearCount(headwearCount);
        setExpressionCount(expressionCount);
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };

    fetchCounts();
  }, []);

  async function getStoryElementCount(aspect: 'Muerto Body' | 'Muerto Mask' | 'Muerto Headwear' | 'Muerto Expression'): Promise<number> {
    const validAspects = ['Muerto Body', 'Muerto Mask', 'Muerto Headwear', 'Muerto Expression'];
  
    if (!validAspects.includes(aspect)) {
      throw new Error('Invalid aspect value');
    }
  
    const encodedAspect = encodeURIComponent(aspect);
    const response = await fetch(`/api/catalog/${encodedAspect}`);
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch story element count');
    }
  
    const data = await response.json();
    return data.count;
  }

  const renderProgressTable = () => {
    const bodyTotal = 368;
    const maskTotal = 148;
    const headwearTotal = 32;
    const expressionTotal = 25;
  
    const calculatePercentage = (current: number, total: number) => ((current / total) * 100).toFixed(1) + '%';
  
    if (bodyCount === null || maskCount === null || headwearCount === null || expressionCount === null) {
      return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-center h-32">
            <ClipLoader color="#ffffff" size={30} />
          </div>
        </div>
      );
    }
  
    const stats = [
      { label: 'Mask', count: maskCount, total: maskTotal },
      { label: 'Body', count: bodyCount, total: bodyTotal },
      { label: 'Headwear', count: headwearCount, total: headwearTotal },
      { label: 'Expression', count: expressionCount, total: expressionTotal },
    ];
  
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-gray-200">AI Vision Progress</h2>
          <p className="text-sm text-gray-400">Analysis completion by trait type</p>
        </div>
        
        <div className="space-y-3">
          {stats.map(({ label, count, total }) => (
            <div key={label} className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">{label}</span>
                <span className="text-sm font-medium text-blue-400">
                  {calculatePercentage(count, total)}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">{count} analyzed</span>
                <span className="text-xs text-gray-400">of {total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">AI Vision Progress</h1>
          <div className="space-y-8">
            {renderProgressTable()}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-gray-200 mb-4">About AI Vision Analysis</h3>
              <p className="text-gray-300 leading-relaxed">
                Our AI Vision process analyzes each Muerto trait to understand its visual elements, 
                symbolism, and cultural references. This forms the foundation for creating rich 
                narratives, character backstories, and interconnected lore within Los Muertos World. By 
                understanding the visual language of each trait, we can weave more authentic and meaningful 
                stories that bring the world and its inhabitants to life.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProgressPage;