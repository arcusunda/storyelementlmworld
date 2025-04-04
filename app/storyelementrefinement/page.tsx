// app/storyelementrefinement/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  RefreshCw, 
  Search, 
  AlertTriangle, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  X
} from 'lucide-react';

const REFINEMENT_STAGES = [
  'unrefined',
  'animation_notes_added',
  'summary_created',
  'art_prompts_created',
  'structure_refined',
  'uniqueness_determined',
  'narrative_potential_assessed',
  'relationships_identified',
  'ip_assessed',
  'ipa_ready'
];

const STAGE_COLORS = {
  'unrefined': 'bg-gray-500',
  'animation_notes_added': 'bg-blue-500',
  'summary_created': 'bg-green-500',
  'art_prompts_created': 'bg-cyan-500',
  'structure_refined': 'bg-yellow-500',
  'uniqueness_determined': 'bg-purple-500',
  'narrative_potential_assessed': 'bg-pink-500',
  'relationships_identified': 'bg-indigo-500',
  'ip_assessed': 'bg-orange-500',
  'ipa_ready': 'bg-teal-500'
};

const formatStageName = (stage: string) => {
  return stage
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDate = (dateString: string | number | Date) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const StoryElementRefinementPage = () => {
  const [elements, setElements] = useState<StoryElement[]>([]);
  interface Stats {
    stageCounts: { [key: string]: number };
    totalCount: number;
  }

  const [stats, setStats] = useState<Stats>({ stageCounts: {}, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tokenIdFilter, setTokenIdFilter] = useState('');
  
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [resetStageDialogOpen, setResetStageDialogOpen] = useState(false);
  interface StoryElement {
    animationNotesAddedAt: unknown;
    refinedAt: unknown;
    summaryCreatedAt: unknown;
    artPromptsCreatedAt: unknown;
    structureRefinedAt: unknown;
    uniquenessDeterminedAt: unknown;
    narrativePotentialAssessedAt: unknown;
    relationshipsIdentifiedAt: unknown;
    ipAssessedAt: unknown;
    worldbuildingAssessedAt: unknown;
    shortId: string;
    elementTitle?: string;
    elementType?: string;
    tokenId: string;
    nftContext?: { name: string };
    createdAt: string;
    updatedAt?: string;
    refinementTimestamp?: string;
    refinementStage?: string;
    refinementFailed?: boolean;
    errorMessage?: string;
    description?: string;
    storyElement?: string;
    narrativePotential?: string;
    culturalInfluences?: string[];
    relationships?: { relatedElementName: string; relationType: string }[];
    artPrompts?: { [key: string]: { prompt: string; negative_prompt?: string; parameters?: string } };
  }
  
  const [selectedElement, setSelectedElement] = useState<StoryElement | null>(null);
  const [targetStage, setTargetStage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const fetchElements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const skip = (currentPage - 1) * itemsPerPage;
      
      const params = new URLSearchParams();
      params.append('skip', skip.toString());
      params.append('limit', itemsPerPage.toString());
      
      if (selectedStage) {
        params.append('stage', selectedStage);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (tokenIdFilter) {
        params.append('tokenId', tokenIdFilter);
      }
      
      const response = await fetch(`/api/storyelementrefinement?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch story elements');
      }
      
      const data = await response.json();
      setElements(data.elements || []);
      setStats(data.stats || { stageCounts: {}, totalCount: 0 });
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
      console.error('Error fetching story elements:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchElements();
  }, [currentPage, itemsPerPage, selectedStage, tokenIdFilter]);
  
  const handleSearch = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchElements();
  };
  
  const handleStageChange = (e: { target: { value: unknown; }; }) => {
    const value = e.target.value;
    setSelectedStage(value === 'all' ? null : value as string);
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setSelectedStage(null);
    setSearchQuery('');
    setTokenIdFilter('');
    setCurrentPage(1);
  };
  
  const viewElementDetails = async (shortId: unknown) => {
    try {
      setActionLoading(true);
      
      const response = await fetch('/api/storyelementrefinement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'viewDetails',
          shortId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch element details');
      }
      
      const data = await response.json();
      setSelectedElement(data.element);
      setDetailsDialogOpen(true);
      
    } catch (err) {
      console.error('Error fetching element details:', err);
      if (err instanceof Error) {
        alert('Failed to fetch element details: ' + err.message);
      } else {
        alert('Failed to fetch element details');
      }
    } finally {
      setActionLoading(false);
    }
  };
  
  const resetElementStage = async () => {
    if (!selectedElement || !targetStage) return;
    
    try {
      setActionLoading(true);
      
      const response = await fetch('/api/storyelementrefinement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'resetStage',
          shortId: selectedElement.shortId,
          targetStage
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset element stage');
      }
      
      setResetStageDialogOpen(false);
      fetchElements();
      
    } catch (err) {
      console.error('Error resetting element stage:', err);
      if (err instanceof Error) {
        alert('Failed to reset element stage: ' + err.message);
      } else {
        alert('Failed to reset element stage');
      }
    } finally {
      setActionLoading(false);
    }
  };
  
  const retryFailedElement = async (shortId: unknown) => {
    try {
      setActionLoading(true);
      
      const response = await fetch('/api/storyelementrefinement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'retry',
          shortId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to retry element');
      }
      
      fetchElements();
      
    } catch (err) {
      console.error('Error retrying element:', err);
    } finally {
      setActionLoading(false);
    }
  };
  
  const totalPages = Math.ceil(stats.totalCount / itemsPerPage);
  
  const generatePaginationItems = () => {
    const items = [];
    
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    if (startPage > 1) {
      items.push(
        <button 
          key="first"
          className="px-3 py-1 rounded-md hover:bg-gray-100"
          onClick={() => setCurrentPage(1)}
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        items.push(
          <span key="ellipsis-start" className="px-2">
            ...
          </span>
        );
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <button
          key={i}
          className={`px-3 py-1 rounded-md ${
            currentPage === i 
              ? 'bg-blue-500 text-white'
              : 'hover:bg-gray-100'
          }`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <span key="ellipsis-end" className="px-2">
            ...
          </span>
        );
      }
      
      items.push(
        <button
          key="last"
          className="px-3 py-1 rounded-md hover:bg-gray-100"
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    return items;
  };
  
  const stageStatsList = REFINEMENT_STAGES.map(stage => ({
    stage,
    count: stats.stageCounts[stage] || 0,
    name: formatStageName(stage),
    color: STAGE_COLORS[stage as keyof typeof STAGE_COLORS]
  }));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Story Element Refinement Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Refinement Pipeline Statistics</h2>
            <p className="text-gray-500 text-sm">Current status of story elements in the refinement pipeline</p>
          </div>
          <div className="space-y-2">
            {stageStatsList.map(stageStat => (
              <div key={stageStat.stage} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stageStat.color}`}></div>
                  <span>{stageStat.name}</span>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100">
                  {stageStat.count}
                </span>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-500 mt-4">
            Total Elements: {Object.values(stats.stageCounts).reduce((sum, count) => sum + count, 0)}
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Filters and Search</h2>
            <p className="text-gray-500 text-sm">Narrow down story elements by stage or search</p>
          </div>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="stageFilter" className="text-sm font-medium">Filter by Stage:</label>
              <select
                id="stageFilter"
                value={selectedStage || 'all'}
                onChange={handleStageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Stages</option>
                {REFINEMENT_STAGES.map(stage => (
                  <option key={stage} value={stage}>
                    {formatStageName(stage)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="tokenIdFilter" className="text-sm font-medium">Filter by Token ID:</label>
              <input
                id="tokenIdFilter"
                placeholder="Enter token ID"
                value={tokenIdFilter}
                onChange={(e) => setTokenIdFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="searchQuery" className="text-sm font-medium">Search:</label>
              <div className="flex gap-2">
                <input
                  id="searchQuery"
                  placeholder="Search elements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit" 
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>
          <div className="flex justify-between mt-4">
            <button 
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
            <button 
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center"
              onClick={fetchElements}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Elements Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Story Elements</h2>
          <p className="text-gray-500 text-sm">
            {selectedStage 
              ? `Showing ${formatStageName(selectedStage)} stage elements` 
              : 'Showing all elements'}
            {tokenIdFilter && ` for token ID: ${tokenIdFilter}`}
            {searchQuery && ` matching: "${searchQuery}"`}
          </p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12 text-red-500">
              <AlertTriangle className="h-6 w-6 mr-2" />
              {error}
            </div>
          ) : elements.length === 0 ? (
            <div className="flex justify-center items-center py-12 text-gray-500">
              No story elements found matching the criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left border-b border-gray-200 font-semibold">Element</th>
                    <th className="px-4 py-2 text-left border-b border-gray-200 font-semibold">Token ID</th>
                    <th className="px-4 py-2 text-left border-b border-gray-200 font-semibold">Stage</th>
                    <th className="px-4 py-2 text-left border-b border-gray-200 font-semibold">Updated</th>
                    <th className="px-4 py-2 text-left border-b border-gray-200 font-semibold">Status</th>
                    <th className="px-4 py-2 text-left border-b border-gray-200 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {elements.map((element) => (
                    <tr key={element.shortId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b border-gray-200 font-medium">
                        {element.elementTitle || `Element ${element.shortId?.substring(0, 8)}`}
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        {element.tokenId}
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        <span 
                          className={`px-2 py-1 text-xs font-medium rounded-full ${STAGE_COLORS[element.refinementStage as keyof typeof STAGE_COLORS || 'unrefined']} text-white`}
                        >
                          {formatStageName(element.refinementStage || 'unrefined')}
                        </span>
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        {formatDate(element.refinementTimestamp ?? element.createdAt ?? '')}
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        {element.refinementFailed ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Failed
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200">
                        <div className="flex space-x-2">
                          <button 
                            className="p-1 hover:bg-gray-100 rounded-md text-gray-600"
                            onClick={() => viewElementDetails(element.shortId)}
                          >
                            <Info className="h-4 w-4" />
                          </button>
                          
                          {element.refinementFailed && (
                            <button 
                              className="p-1 hover:bg-gray-100 rounded-md text-gray-600"
                              onClick={() => retryFailedElement(element.shortId)}
                              disabled={actionLoading}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button 
                            className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                            onClick={() => {
                              setSelectedElement(element);
                              setTargetStage(element.refinementStage || 'unrefined');
                              setResetStageDialogOpen(true);
                            }}
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {`Showing ${elements.length} of ${stats.totalCount} elements`}
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none text-sm"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-gray-500">per page</span>
          </div>
          
          <div className="flex items-center">
            <button 
              className="p-2 text-gray-600 disabled:text-gray-300"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center mx-2">
              {generatePaginationItems()}
            </div>
            
            <button 
              className="p-2 text-gray-600 disabled:text-gray-300"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Element Details Dialog */}
      {detailsDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {selectedElement?.elementTitle || `Element ${selectedElement?.shortId?.substring(0, 8)}`}
                </h2>
                <button 
                  className="text-gray-500 hover:text-gray-700" 
                  onClick={() => setDetailsDialogOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-500 text-sm">
                Details for story element with ID: {selectedElement?.shortId}
              </p>
            </div>
            
            {selectedElement && (
                              <div>
                <div className="border-b border-gray-200">
                  <div className="flex overflow-x-auto">
                    <button
                      className={`px-4 py-2 ${activeTab === 'basic' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                      onClick={() => setActiveTab('basic')}
                    >
                      Basic Info
                    </button>
                    <button
                      className={`px-4 py-2 ${activeTab === 'content' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                      onClick={() => setActiveTab('content')}
                    >
                      Content
                    </button>
                    <button
                      className={`px-4 py-2 ${activeTab === 'refinement' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                      onClick={() => setActiveTab('refinement')}
                    >
                      Refinement
                    </button>
                    <button
                      className={`px-4 py-2 ${activeTab === 'art' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                      onClick={() => setActiveTab('art')}
                    >
                      Art Prompts
                    </button>
                    <button
                      className={`px-4 py-2 ${activeTab === 'json' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                      onClick={() => setActiveTab('json')}
                    >
                      Raw JSON
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Basic Tab */}
                  {activeTab === 'basic' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium">Element Title</h3>
                          <p>{selectedElement.elementTitle || 'N/A'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Element Type</h3>
                          <p>{selectedElement.elementType || 'N/A'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Token ID</h3>
                          <p>{selectedElement.tokenId}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Character Name</h3>
                          <p>{selectedElement.nftContext?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Created At</h3>
                          <p>{formatDate(selectedElement.createdAt)}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Last Updated</h3>
                          <p>{formatDate(selectedElement.refinementTimestamp ?? selectedElement.updatedAt ?? '')}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Current Stage</h3>
                          <span 
                            className={`px-2 py-1 text-xs font-medium rounded-full ${STAGE_COLORS[selectedElement.refinementStage as keyof typeof STAGE_COLORS || 'unrefined']} text-white`}
                          >
                            {formatStageName(selectedElement.refinementStage || 'unrefined')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Status</h3>
                          {selectedElement.refinementFailed ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Failed
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              OK
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {selectedElement.errorMessage && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-red-500">Error Message</h3>
                          <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm mt-1">
                            {selectedElement.errorMessage}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  
                  {/* Content Tab */}
                  {activeTab === 'content' && (
                    <div className="space-y-4">
                      {selectedElement.elementTitle && (
                        <div>
                          <h3 className="text-sm font-medium">Element Title</h3>
                          <p className="mt-1">{selectedElement.elementTitle}</p>
                        </div>
                      )}
                      
                      {selectedElement.description && (
                        <div>
                          <h3 className="text-sm font-medium">Description</h3>
                          <div className="bg-gray-50 p-3 rounded-md mt-1 whitespace-pre-wrap">
                            {selectedElement.description}
                          </div>
                        </div>
                      )}
                      
                      {selectedElement.storyElement && (
                        <div>
                          <h3 className="text-sm font-medium">Original Story Element</h3>
                          <div className="bg-gray-50 p-3 rounded-md mt-1 whitespace-pre-wrap">
                            {selectedElement.storyElement}
                          </div>
                        </div>
                      )}
                      
                      {selectedElement.narrativePotential && (
                        <div>
                          <h3 className="text-sm font-medium">Narrative Potential</h3>
                          <div className="bg-gray-50 p-3 rounded-md mt-1 whitespace-pre-wrap">
                            {selectedElement.narrativePotential}
                          </div>
                        </div>
                      )}
                      
                      {selectedElement.culturalInfluences && selectedElement.culturalInfluences.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium">Cultural Influences</h3>
                          <ul className="list-disc pl-5 mt-1">
                            {selectedElement.culturalInfluences.map((influence, index) => (
                              <li key={`cultural-influence-${index}`}>
                                {influence}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedElement.relationships && selectedElement.relationships.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium">Relationships</h3>
                          <ul className="list-disc pl-5 mt-1">
                            {selectedElement.relationships.map((rel, index) => (
                              <li key={`relationship-${index}`}>
                                {rel.relatedElementName} ({rel.relationType})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}                        
                    </div>
                  )}
                  
                  {activeTab === 'refinement' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {REFINEMENT_STAGES.map((stage, index) => {
                          const isCompleted = REFINEMENT_STAGES.indexOf(selectedElement.refinementStage || 'unrefined') >= index;
                          const isCurrent = (selectedElement.refinementStage || 'unrefined') === stage;
                          
                          let timestamp: string | number | Date | null = null;
                          if (stage === 'unrefined') {
                            timestamp = selectedElement.createdAt;
                          } else if (stage === 'animation_notes_added') {
                            timestamp = selectedElement.animationNotesAddedAt as string | number | Date || selectedElement.refinedAt as string | number | Date;
                          } else if (stage === 'summary_created') {
                            timestamp = selectedElement.summaryCreatedAt as string | number | Date;
                          } else if (stage === 'art_prompts_created') {
                            timestamp = selectedElement.artPromptsCreatedAt as string | number | Date | null;
                          } else if (stage === 'structure_refined') {
                            timestamp = selectedElement.structureRefinedAt as string | number | Date | null;
                          } else if (stage === 'uniqueness_determined') {
                            timestamp = selectedElement.uniquenessDeterminedAt as string | number | Date | null;
                          } else if (stage === 'narrative_potential_assessed') {
                            timestamp = selectedElement.narrativePotentialAssessedAt as string | number | Date | null;
                          } else if (stage === 'relationships_identified') {
                            timestamp = selectedElement.relationshipsIdentifiedAt as string | number | Date | null;
                          } else if (stage === 'ip_assessed') {
                            timestamp = selectedElement.ipAssessedAt as string | number | Date | null;
                          } else if (stage === 'ipa_ready') {
                            timestamp = selectedElement.worldbuildingAssessedAt as string | number | Date | null;
                          }
                          
                          return (
                            <div 
                              key={stage}
                              className={`flex items-center p-3 rounded-md ${
                                isCurrent ? 'bg-blue-50 border border-blue-200' : 
                                isCompleted ? 'bg-gray-50' : 'bg-gray-50 opacity-50'
                              }`}
                            >
                              <div 
                                className={`w-4 h-4 rounded-full mr-3 ${
                                  isCompleted ? STAGE_COLORS[stage as keyof typeof STAGE_COLORS] : 'bg-gray-300'
                                }`}
                              ></div>
                              <div className="flex-1">
                                <div className="font-medium">{formatStageName(stage)}</div>
                                {timestamp && (
                                  <div className="text-sm text-gray-500">
                                    {formatDate(timestamp)}
                                  </div>
                                )}
                              </div>
                              {isCurrent && (
                                <span className="px-2 py-1 text-xs border border-gray-300 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Art Prompts Tab */}
                  {activeTab === 'art' && (
                    <div className="space-y-4">
                      {selectedElement.artPrompts ? (
                        <div>
                          <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2">Art Generation Prompts</h3>
                            <p className="text-xs text-gray-500">
                              These prompts are optimized for different AI art generation systems. Copy and use them to create visual representations of this story element.
                            </p>
                          </div>

                          {Object.entries(selectedElement.artPrompts).map(([model, prompts]) => (
                            <div key={model} className="mb-6">
                              <h4 className="text-md font-semibold capitalize mb-2">{model}</h4>
                              
                              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                <div className="mb-3">
                                  <h5 className="text-xs text-gray-600 mb-1">Prompt:</h5>
                                  <div className="bg-white p-2 rounded border border-gray-300 text-sm relative group">
                                    <pre className="whitespace-pre-wrap break-words">{prompts.prompt}</pre>
                                    <button 
                                      className="absolute top-2 right-2 bg-white bg-opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        navigator.clipboard.writeText(prompts.prompt);
                                        alert('Prompt copied to clipboard!');
                                      }}
                                    >
                                      Copy
                                    </button>
                                  </div>
                                </div>
                                
                                {prompts.negative_prompt && (
                                  <div className="mb-3">
                                    <h5 className="text-xs text-gray-600 mb-1">Negative Prompt:</h5>
                                    <div className="bg-white p-2 rounded border border-gray-300 text-sm relative group">
                                      <pre className="whitespace-pre-wrap break-words">{prompts.negative_prompt}</pre>
                                      <button 
                                        className="absolute top-2 right-2 bg-white bg-opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                          if (prompts.negative_prompt) {
                                            navigator.clipboard.writeText(prompts.negative_prompt);
                                          }
                                          alert('Negative prompt copied to clipboard!');
                                        }}
                                      >
                                        Copy
                                      </button>
                                    </div>
                                  </div>
                                )}
                                
                                {prompts.parameters && (
                                  <div>
                                    <h5 className="text-xs text-gray-600 mb-1">Parameters:</h5>
                                    <div className="bg-white p-2 rounded border border-gray-300 text-sm">
                                      <code>{prompts.parameters}</code>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No art prompts have been generated for this element yet.</p>
                          <p className="text-sm mt-2">
                            Art prompts are generated after the summary creation stage.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* JSON Tab */}
                  {activeTab === 'json' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <pre className="text-xs overflow-x-auto max-h-96">
                          {JSON.stringify(selectedElement, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setDetailsDialogOpen(false)}
              >
                Close
              </button>
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => {
                  setResetStageDialogOpen(true);
                  setDetailsDialogOpen(false);
                }}
              >
                Reset Stage
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reset Stage Dialog */}
      {resetStageDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Reset Refinement Stage</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700" 
                  onClick={() => setResetStageDialogOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-500 text-sm">
                Select a stage to reset this element to. This will allow refinement to restart from that point.
              </p>
            </div>
            
            <div className="p-6">
              <select
                value={targetStage}
                onChange={(e) => setTargetStage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Select target stage</option>
                {REFINEMENT_STAGES.map(stage => (
                  <option key={stage} value={stage}>
                    {formatStageName(stage)}
                  </option>
                ))}
              </select>
              
              <div className="mt-4 text-sm text-amber-600 flex items-start">
                <AlertTriangle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>Warning: Resetting the stage will clear all refinement data for stages after the selected one.</span>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setResetStageDialogOpen(false)}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${
                  !targetStage || actionLoading 
                    ? 'bg-blue-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
                onClick={resetElementStage}
                disabled={actionLoading || !targetStage}
              >
                {actionLoading && <Loader2 className="h-4 w-4 mr-2 inline-block animate-spin" />}
                Reset Stage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryElementRefinementPage;