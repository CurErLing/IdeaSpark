import React, { useState, useCallback, useEffect } from 'react';
import { CheckSquare, MousePointer2 } from 'lucide-react';
import GraphCanvas from './components/GraphCanvas';
import InputBar from './components/InputBar';
import HistoryPanel from './components/HistoryPanel';
import PRDListPanel from './components/PRDListPanel';
import PRDModal from './components/PRDModal';
import SelectionPanel from './components/SelectionPanel';
import { NodeData } from './types';
import { useGraph } from './hooks/useGraph';
import { usePRDSystem } from './hooks/usePRDSystem';

export default function App() {
  // --- Data Hooks ---
  const { 
    nodes, 
    links, 
    history, 
    selectedNodeId, 
    setSelectedNodeId, 
    isProcessing, 
    addNode, 
    expandNode, 
    clearGraph 
  } = useGraph();

  const {
    savedPRDs,
    currentViewingPRD,
    setCurrentViewingPRD,
    isGeneratingPRD,
    isPRDPanelOpen,
    setIsPRDPanelOpen,
    generateAndSavePRD,
    deletePRD
  } = usePRDSystem();

  // --- Local UI State (Selection Mode) ---
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [multiSelectedNodeIds, setMultiSelectedNodeIds] = useState<string[]>([]);

  // --- Persistence Safety (Unload) ---
  // Note: LocalStorage logic is now handled inside useGraph, but we can add extra safety if needed.
  // The hook handles basic persistence.

  // --- Event Handlers ---

  const handleClearApp = useCallback(() => {
    if (window.confirm("Are you sure you want to clear the canvas? This cannot be undone.")) {
        clearGraph();
        setMultiSelectedNodeIds([]);
        setIsSelectionMode(false);
    }
  }, [clearGraph]);

  const handleInputConfirm = useCallback((text: string) => {
    const parentId = (!isSelectionMode && selectedNodeId) ? selectedNodeId : undefined;
    const newNode = addNode(text, parentId);
    if (!isSelectionMode) {
        setSelectedNodeId(newNode.id);
    }
  }, [selectedNodeId, addNode, isSelectionMode, setSelectedNodeId]);

  const handleNodeClick = useCallback((node: NodeData) => {
    // 1. Selection Mode Logic
    if (isSelectionMode) {
        setMultiSelectedNodeIds(prev => {
            if (prev.includes(node.id)) {
                return prev.filter(id => id !== node.id);
            }
            return [...prev, node.id];
        });
        return;
    }

    // 2. Normal Mode: Expand or Select
    expandNode(node);
  }, [isSelectionMode, expandNode]);

  const handleNodeRightClick = useCallback((event: React.MouseEvent, node: NodeData) => {
    if (isSelectionMode) return;
    if (selectedNodeId === node.id) {
      setSelectedNodeId(null); 
    } else {
      setSelectedNodeId(node.id);
    }
  }, [selectedNodeId, isSelectionMode, setSelectedNodeId]);

  const handleBackgroundClick = useCallback(() => {
    if (!isSelectionMode) {
        setSelectedNodeId(null);
    }
  }, [isSelectionMode, setSelectedNodeId]);

  const handleHistoryNavigation = useCallback((nodeId: string) => {
    if (isSelectionMode) return;
    const targetNode = nodes.find(n => n.id === nodeId);
    if (targetNode) {
        setSelectedNodeId(nodeId);
    }
  }, [nodes, isSelectionMode, setSelectedNodeId]);

  const toggleSelectionMode = () => {
      setIsSelectionMode(prev => !prev);
      setSelectedNodeId(null);
      if (!isSelectionMode) {
          setIsPRDPanelOpen(false);
      }
  };

  const handleGeneratePRD = async () => {
    if (multiSelectedNodeIds.length === 0) return;
    const selectedWords = nodes
        .filter(n => multiSelectedNodeIds.includes(n.id))
        .map(n => n.text);
    
    await generateAndSavePRD(selectedWords);
    
    // Reset Selection Mode on success
    setMultiSelectedNodeIds([]);
    setIsSelectionMode(false);
  };

  // Get selected nodes details for the mini-view
  const selectedNodeDetails = nodes.filter(n => multiSelectedNodeIds.includes(n.id));

  return (
    <div className="w-screen h-screen relative bg-white overflow-hidden font-sans text-gray-900 selection:bg-yellow-200">
        {/* Background Visual Flair */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
             <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-yellow-100 rounded-full blur-[100px] mix-blend-multiply" />
             <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-gray-100 rounded-full blur-[80px] mix-blend-multiply" />
        </div>

        <GraphCanvas 
            nodes={nodes} 
            links={links}
            selectedNodeId={selectedNodeId}
            multiSelectedNodeIds={multiSelectedNodeIds}
            isSelectionMode={isSelectionMode}
            onNodeClick={handleNodeClick}
            onNodeRightClick={handleNodeRightClick}
            onBackgroundClick={handleBackgroundClick}
        />

        {/* Top Left: PRD Library */}
        <PRDListPanel 
            savedPRDs={savedPRDs}
            isOpen={isPRDPanelOpen}
            onToggle={() => setIsPRDPanelOpen(!isPRDPanelOpen)}
            onSelectPRD={setCurrentViewingPRD}
            onDeletePRD={deletePRD}
        />

        {/* History Panel (Right) */}
        <HistoryPanel 
            history={history} 
            onClear={handleClearApp} 
            onItemClick={handleHistoryNavigation}
        />
        
        {/* Selection Mode Mini-View */}
        <SelectionPanel 
          selectedNodes={selectedNodeDetails}
          onClear={() => setMultiSelectedNodeIds([])}
          onGenerate={handleGeneratePRD}
          isGenerating={isGeneratingPRD}
          isPRDPanelOpen={isPRDPanelOpen}
        />

        {/* PRD Content Modal */}
        <PRDModal 
          prd={currentViewingPRD}
          onClose={() => setCurrentViewingPRD(null)}
        />

        {/* Bottom Right Select Button */}
        <div className="absolute bottom-8 right-8 z-50">
            <button 
                onClick={toggleSelectionMode}
                className={`
                    w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform
                    ${isSelectionMode 
                        ? 'bg-green-500 text-white rotate-0 scale-110 ring-4 ring-green-200' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105'
                    }
                `}
                title={isSelectionMode ? "Finish Selection" : "Select Nodes to Generate PRD"}
            >
                {isSelectionMode ? <CheckSquare size={24} /> : <MousePointer2 size={24} />}
            </button>
        </div>
        
        <InputBar onConfirm={handleInputConfirm} isLoading={isProcessing} />
    </div>
  );
}