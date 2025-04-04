'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

interface CharacterData {
  name: string;
  foundation: {
    personality: {
      core_traits: string[];
      quirks: string[];
      emotional_patterns: string[];
    };
    background: {
      manner_of_death: string;
      death_date: string;
      significant_possessions: string[];
      unfinished_business: string;
    };
    underground_status: {
      district: string;
      role: string;
      affiliations: string[];
      territories: string[];
    };
    narrative_elements: {
      goals: string[];
      conflicts: string[];
      story_hooks: string[];
    };
  };
}

const CharacterDetails = () => {
  const params = useParams();
  const router = useRouter();
  const characterName = typeof params.name === 'string' ? decodeURIComponent(params.name) : '';

  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (characterName) {
      fetchCharacterDetails(characterName);
    }
  }, [characterName]);

  const fetchCharacterDetails = async (name: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/character/${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch character details');
      }
      const data: CharacterData = await response.json();
      setCharacter(data);
    } catch (error) {
      console.error('Error fetching character:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="flex flex-col items-center justify-center p-6 min-h-[60vh]">
          <ClipLoader color="#ffffff" loading={loading} size={50} />
          <p className="mt-4 text-gray-300 animate-pulse">Loading character details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!character) {
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
            <h3 className="text-xl font-medium text-gray-300">Character not found</h3>
            <p className="text-gray-400">We couldn&apos;t find the character you&apos;re looking for.</p>
            <button
              onClick={() => router.push('/losmuertosworld')}
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Characters
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
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Personality and Background */}
          <div className="space-y-6">
            {/* Personality Section */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h1 className="text-2xl font-bold text-white mb-6">{character.name}</h1>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-300 mb-4">Core Traits</h2>
                  <div className="space-y-3">
                    {character.foundation.personality.core_traits.map((trait, idx) => (
                      <div key={idx} className="bg-gray-700/50 p-3 rounded-lg">
                        <span className="text-white">{trait}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-300 mb-4">Quirks</h2>
                  <div className="space-y-3">
                    {character.foundation.personality.quirks.map((quirk, idx) => (
                      <div key={idx} className="bg-gray-700/50 p-3 rounded-lg">
                        <span className="text-white">{quirk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-300 mb-4">Emotional Patterns</h2>
                  <div className="space-y-3">
                    {character.foundation.personality.emotional_patterns.map((pattern, idx) => (
                      <div key={idx} className="bg-gray-700/50 p-3 rounded-lg">
                        <span className="text-white">{pattern}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Background Section */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">Background</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-1">Manner of Death</h3>
                  <p className="text-white">{character.foundation.background.manner_of_death}</p>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-1">Death Date</h3>
                  <p className="text-white">{character.foundation.background.death_date}</p>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-1">Unfinished Business</h3>
                  <p className="text-white">{character.foundation.background.unfinished_business}</p>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-1">Significant Possessions</h3>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    {character.foundation.background.significant_possessions.map((possession, idx) => (
                      <li key={idx} className="text-white">{possession}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status and Narrative */}
          <div className="space-y-6">
            {/* Underground Status Section */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">Underground Status</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-1">District</h3>
                  <p className="text-white">{character.foundation.underground_status.district}</p>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-1">Role</h3>
                  <p className="text-white">{character.foundation.underground_status.role}</p>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-1">Affiliations</h3>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    {character.foundation.underground_status.affiliations.map((affiliation, idx) => (
                      <li key={idx} className="text-white">{affiliation}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-400 mb-1">Territories</h3>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    {character.foundation.underground_status.territories.map((territory, idx) => (
                      <li key={idx} className="text-white">{territory}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Narrative Elements Section */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">Narrative Elements</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">Goals</h3>
                  <div className="space-y-3">
                    {character.foundation.narrative_elements.goals.map((goal, idx) => (
                      <div key={idx} className="bg-gray-700/50 p-3 rounded-lg">
                        <span className="text-white">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">Conflicts</h3>
                  <div className="space-y-3">
                    {character.foundation.narrative_elements.conflicts.map((conflict, idx) => (
                      <div key={idx} className="bg-gray-700/50 p-3 rounded-lg">
                        <span className="text-white">{conflict}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">Story Hooks</h3>
                  <div className="space-y-3">
                    {character.foundation.narrative_elements.story_hooks.map((hook, idx) => (
                      <div key={idx} className="bg-gray-700/50 p-3 rounded-lg">
                        <span className="text-white">{hook}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CharacterDetails;