import * as d3 from 'd3';

// Simulation Node type extending D3's SimulationNodeDatum
export interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  text: string;
  type: 'root' | 'child';
  level: number; // 0 for root, 1 for children, 2 for grandchildren, etc.
  isLoading?: boolean;
  // D3 optional properties
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  id: string;
  source: string | NodeData; // D3 converts string IDs to object references
  target: string | NodeData;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  text: string;
  action: 'create' | 'expand';
  nodeId?: string; // Optional for backward compatibility, but needed for navigation
}

export interface GeneratedWord {
  text: string;
}

export interface PRDItem {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  keywords: string[];
}