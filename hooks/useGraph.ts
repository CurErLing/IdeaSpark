import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NodeData, LinkData, HistoryItem } from '../types';
import { generateRelatedWords } from '../services/geminiService';

const STORAGE_KEYS = {
  NODES: 'idea-spark-nodes',
  LINKS: 'idea-spark-links',
  HISTORY: 'idea-spark-history',
};

export const useGraph = () => {
  // --- State Initialization ---
  const [nodes, setNodes] = useState<NodeData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NODES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((n: any) => ({
          ...n,
          isLoading: false,
          level: typeof n.level === 'number' ? n.level : (n.type === 'root' ? 0 : 1)
        }));
      }
      return [];
    } catch (e) { return []; }
  });

  const [links, setLinks] = useState<LinkData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LINKS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs for async access
  const nodesRef = useRef(nodes);
  const linksRef = useRef(links);

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { linksRef.current = links; }, [links]);

  // --- Persistence ---
  const saveData = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodesRef.current));
    const serializedLinks = linksRef.current.map(l => ({
      ...l,
      source: (typeof l.source === 'object' && l.source !== null) ? (l.source as any).id : l.source,
      target: (typeof l.target === 'object' && l.target !== null) ? (l.target as any).id : l.target
    }));
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(serializedLinks));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    saveData();
  }, [nodes.length, links.length, history.length, saveData]);

  // --- Actions ---

  const clearGraph = useCallback(() => {
    setNodes([]);
    setLinks([]);
    setHistory([]);
    setSelectedNodeId(null);
    localStorage.removeItem(STORAGE_KEYS.NODES);
    localStorage.removeItem(STORAGE_KEYS.LINKS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }, []);

  const addNode = useCallback((text: string, parentId?: string) => {
    let level = 0;
    if (parentId) {
      const parent = nodesRef.current.find(n => n.id === parentId);
      level = parent ? (parent.level || 0) + 1 : 1;
    }

    const newNode: NodeData = {
      id: uuidv4(),
      text,
      type: parentId ? 'child' : 'root',
      level: level,
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 50,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 50,
    };

    setNodes(prev => [...prev, newNode]);

    if (parentId) {
      const newLink: LinkData = {
        id: uuidv4(),
        source: parentId,
        target: newNode.id
      };
      setLinks(prev => [...prev, newLink]);
    }
    
    // History update
    const historyItem: HistoryItem = {
        id: uuidv4(),
        timestamp: Date.now(),
        text: text,
        action: parentId ? 'expand' : 'create',
        nodeId: newNode.id
    };
    setHistory(prev => [...prev, historyItem]);

    return newNode;
  }, []);

  const expandNode = useCallback(async (node: NodeData) => {
    if (loadingNodeId || isProcessing) return;
    
    // Select if not selected
    if (selectedNodeId !== node.id) {
        setSelectedNodeId(node.id);
        return;
    }

    setLoadingNodeId(node.id);
    setIsProcessing(true);
    setNodes(prev => prev.map(n => n.id === node.id ? { ...n, isLoading: true } : n));

    try {
      const relatedWords = await generateRelatedWords(node.text);
      
      if (relatedWords.length > 0) {
        // Deduplication Logic
        const existingChildIds = linksRef.current
            .filter(l => {
                const sourceId = (typeof l.source === 'object' && l.source !== null) ? (l.source as any).id : l.source;
                return sourceId === node.id;
            })
            .map(l => (typeof l.target === 'object' && l.target !== null) ? (l.target as any).id : l.target);

        const existingChildTexts = new Set(
            nodesRef.current
                .filter(n => existingChildIds.includes(n.id))
                .map(n => n.text.toLowerCase().trim())
        );

        const uniqueWords = relatedWords.filter(word => 
            !existingChildTexts.has(word.text.toLowerCase().trim())
        );

        if (uniqueWords.length > 0) {
            const newNodes: NodeData[] = [];
            const newLinks: LinkData[] = [];
            const newLevel = (node.level || 0) + 1;

            uniqueWords.forEach(wordData => {
                const newNodeId = uuidv4();
                newNodes.push({
                    id: newNodeId,
                    text: wordData.text,
                    type: 'child',
                    level: newLevel,
                    x: (node.x || 0) + (Math.random() - 0.5) * 20,
                    y: (node.y || 0) + (Math.random() - 0.5) * 20
                });
                newLinks.push({
                    id: uuidv4(),
                    source: node.id,
                    target: newNodeId
                });
            });

            setNodes(prev => [...prev, ...newNodes]);
            setLinks(prev => [...prev, ...newLinks]);

            const historyItem: HistoryItem = {
                id: uuidv4(),
                timestamp: Date.now(),
                text: `Expanded: ${node.text} (+${uniqueWords.length})`,
                action: 'expand',
                nodeId: node.id
            };
            setHistory(prev => [...prev, historyItem]);
        }
      }
    } catch (error) {
      console.error("Failed to expand node", error);
    } finally {
      setLoadingNodeId(null);
      setIsProcessing(false);
      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, isLoading: false } : n));
    }
  }, [loadingNodeId, isProcessing, selectedNodeId]);

  return {
    nodes,
    links,
    history,
    selectedNodeId,
    setSelectedNodeId,
    loadingNodeId,
    isProcessing,
    addNode,
    expandNode,
    clearGraph
  };
};