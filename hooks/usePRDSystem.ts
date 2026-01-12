import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PRDItem } from '../types';
import { generatePRD } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';

export const usePRDSystem = () => {
  const [savedPRDs, setSavedPRDs] = useState<PRDItem[]>([]);
  const [isLoadingPRDs, setIsLoadingPRDs] = useState(false);
  const [currentViewingPRD, setCurrentViewingPRD] = useState<PRDItem | null>(null);
  const [isGeneratingPRD, setIsGeneratingPRD] = useState(false);
  const [isPRDPanelOpen, setIsPRDPanelOpen] = useState(false);

  // --- Actions ---

  const fetchPRDs = useCallback(async () => {
    setIsLoadingPRDs(true);
    try {
      const { data, error } = await supabase
        .from('prds')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error.message || error);
        return;
      }

      if (data) {
        const safeData = data.map((item: any) => ({
          ...item,
          keywords: Array.isArray(item.keywords) ? item.keywords : []
        }));
        setSavedPRDs(safeData as PRDItem[]);
      }
    } catch (err) {
      console.error('Unexpected error fetching PRDs:', err);
    } finally {
      setIsLoadingPRDs(false);
    }
  }, []);

  const generateAndSavePRD = useCallback(async (selectedWords: string[]) => {
    setIsGeneratingPRD(true);
    try {
        const prdText = await generatePRD(selectedWords);
        
        // Extract Title
        const titleMatch = prdText.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : `PRD: ${selectedWords[0]}...`;

        const newPRD: PRDItem = {
            id: uuidv4(),
            title: title,
            content: prdText,
            timestamp: Date.now(),
            keywords: selectedWords
        };

        const { error } = await supabase
            .from('prds')
            .insert([newPRD]);

        if (error) {
            console.error('Error saving PRD to Supabase:', error.message || error);
            alert(`Failed to save PRD: ${error.message || 'Unknown error'}`);
            // Optimistic update
            setSavedPRDs(prev => [newPRD, ...prev]);
            setCurrentViewingPRD(newPRD);
        } else {
            setSavedPRDs(prev => [newPRD, ...prev]);
            setCurrentViewingPRD(newPRD);
        }
    } catch (e) {
        console.error("Error generating/saving PRD", e);
    } finally {
        setIsGeneratingPRD(false);
    }
  }, []);

  const deletePRD = useCallback(async (id: string) => {
    if (window.confirm("Remove this PRD from library?")) {
        const { error } = await supabase
            .from('prds')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting PRD from Supabase:', error.message || error);
            alert(`Failed to delete PRD: ${error.message || 'Unknown error'}`);
            return;
        }

        setSavedPRDs(prev => prev.filter(p => p.id !== id));
        if (currentViewingPRD?.id === id) {
            setCurrentViewingPRD(null);
        }
    }
  }, [currentViewingPRD]);

  // Initial Fetch
  useEffect(() => {
    fetchPRDs();
  }, [fetchPRDs]);

  return {
    savedPRDs,
    isLoadingPRDs,
    currentViewingPRD,
    setCurrentViewingPRD,
    isGeneratingPRD,
    isPRDPanelOpen,
    setIsPRDPanelOpen,
    generateAndSavePRD,
    deletePRD
  };
};