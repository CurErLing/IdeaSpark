import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NodeData, LinkData } from '../types';
import { getNodeStyles } from '../utils/nodeStyles';

interface GraphCanvasProps {
  nodes: NodeData[];
  links: LinkData[];
  selectedNodeId: string | null;
  multiSelectedNodeIds: string[];
  isSelectionMode: boolean;
  onNodeClick: (node: NodeData) => void;
  onNodeRightClick: (event: React.MouseEvent, node: NodeData) => void;
  onBackgroundClick: () => void;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  links,
  selectedNodeId,
  multiSelectedNodeIds,
  isSelectionMode,
  onNodeClick,
  onNodeRightClick,
  onBackgroundClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const linesGroupRef = useRef<SVGGElement>(null);
  const nodesLayerRef = useRef<HTMLDivElement>(null);
  const nodesContainerRef = useRef<HTMLDivElement>(null);
  
  const simulationRef = useRef<d3.Simulation<NodeData, LinkData> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<HTMLDivElement, unknown> | null>(null);
  const prevNodeCountRef = useRef<number>(0);

  // Initialize Simulation & Zoom
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Setup Simulation
    const simulation = d3.forceSimulation<NodeData, LinkData>()
      .velocityDecay(0.6) // High friction (0.6) creates a "underwater/syrupy" movement feel
      .force("link", d3.forceLink<NodeData, LinkData>()
        .id(d => d.id)
        // Dynamic distance: Short for leaves, Long for parents
        .distance((link, i, linksArray) => {
            const targetId = typeof link.target === 'object' ? (link.target as NodeData).id : link.target;
            const targetHasChildren = linksArray.some(l => {
                const sourceId = typeof l.source === 'object' ? (l.source as NodeData).id : l.source;
                return sourceId === targetId;
            });
            return targetHasChildren ? 180 : 100; // Increased leaf distance slightly
        }) 
        .strength(0.5) 
      )
      .force("charge", d3.forceManyBody()
        .strength(-900)
        .distanceMax(1200)
      )
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force("collide", d3.forceCollide<NodeData>()
        .radius(d => {
            return d.level === 0 ? 95 : 80; // Slightly larger collision radius for breathing room
        })
        .strength(0.9)
        .iterations(4)
      )
      // Custom "Drift" force for the breathing effect
      .force("drift", (alpha) => {
        // Use a slow time variable
        const time = Date.now() / 3000; 
        nodes.forEach((d: any, i) => {
            // Only apply drift if not being dragged
            if (!d.fx && !d.fy) {
                // Generate a unique phase for each node based on index
                const phase = i * 0.5;
                // Add tiny velocity changes based on sine waves
                // alpha ensures it calms down if we want it to, but we will keep alpha > 0
                d.vx += Math.sin(time + phase) * 0.2 * alpha;
                d.vy += Math.cos(time + phase * 0.8) * 0.2 * alpha;
            }
        });
      });

    simulationRef.current = simulation;

    // 2. Setup Zoom
    const zoom = d3.zoom<HTMLDivElement, unknown>()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            const { transform } = event;
            if (linesGroupRef.current) {
                d3.select(linesGroupRef.current).attr("transform", transform.toString());
            }
            if (nodesContainerRef.current) {
                nodesContainerRef.current.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`;
                nodesContainerRef.current.style.transformOrigin = "0 0";
            }
        });

    zoomBehaviorRef.current = zoom;
    
    const containerSelection = d3.select(containerRef.current);
    containerSelection.call(zoom)
        .on("dblclick.zoom", null);

    return () => {
      simulation.stop();
    };
  }, []);

  // Handle Auto-Pan/Zoom
  useEffect(() => {
    if (selectedNodeId && !isSelectionMode && containerRef.current && zoomBehaviorRef.current) {
        const node = nodes.find(n => n.id === selectedNodeId);
        if (node && typeof node.x === 'number' && typeof node.y === 'number') {
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            
            const scale = 1.2; 
            const targetTransform = d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(scale)
                .translate(-node.x, -node.y);

            d3.select(containerRef.current)
                .transition()
                .duration(750) 
                .ease(d3.easeCubicOut)
                .call(zoomBehaviorRef.current.transform, targetTransform);
        }
    }
  }, [selectedNodeId, nodes, isSelectionMode]);

  // Update Data and Restart Simulation
  useEffect(() => {
    const simulation = simulationRef.current;
    if (!simulation || !svgRef.current || !nodesContainerRef.current || !containerRef.current) return;

    const cleanLinks = links.map(link => ({
      ...link,
      source: typeof link.source === 'object' ? (link.source as NodeData).id : link.source,
      target: typeof link.target === 'object' ? (link.target as NodeData).id : link.target
    }));

    simulation.nodes(nodes);
    
    const linkForce = d3.forceLink<NodeData, LinkData>(cleanLinks)
        .id(d => d.id)
        .distance((link, i, linksArray) => {
            const targetId = typeof link.target === 'object' ? (link.target as NodeData).id : link.target;
            const targetHasChildren = linksArray.some(l => {
                const sourceId = typeof l.source === 'object' ? (l.source as NodeData).id : l.source;
                return sourceId === targetId;
            });
            return targetHasChildren ? 180 : 100;
        })
        .strength(0.5);

    simulation.force("link", linkForce);
    
    simulation.force("collide", d3.forceCollide<NodeData>()
        .radius(d => {
            const isRoot = d.level === 0;
            // Radius needs to account for the node size + thick border
            return isRoot ? 90 : 75;
        })
        .strength(0.9)
        .iterations(4)
    );

    const isStructuralChange = nodes.length !== prevNodeCountRef.current;
    if (isStructuralChange) {
      // Re-heat simulation significantly on structure change
      simulation.alpha(1).restart();
      prevNodeCountRef.current = nodes.length;
    } else {
      // Keep it "warm" (0.05) to allow the drift force to work continuously
      // This is crucial for the "breathing" effect
      simulation.alphaTarget(0.05).restart();
    }

    // --- Rendering ---
    
    // LINES
    const svgGroup = d3.select(linesGroupRef.current);
    const linkSelection = svgGroup.selectAll<SVGLineElement, LinkData>(".link")
      .data(cleanLinks, (d) => d.id);

    const linkEnter = linkSelection.enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#94a3b8") 
      .attr("stroke-width", 2) 
      .attr("stroke-opacity", 0.4);

    const linkUpdate = linkEnter.merge(linkSelection);
    linkSelection.exit().remove();

    // NODES
    const nodesDiv = d3.select(nodesContainerRef.current);
    const nodeSelection = nodesDiv.selectAll<HTMLDivElement, NodeData>(".node-wrapper")
      .data(nodes, (d) => d.id);

    const nodeEnter = nodeSelection.enter()
      .append("div");

    nodeEnter.append("div")
      .attr("class", "node-content flex flex-col items-center justify-center pointer-events-none w-full h-full px-2 overflow-hidden");

    const nodeUpdate = nodeEnter.merge(nodeSelection);
    
    nodeSelection.exit()
      .transition().duration(300).style("opacity", 0)
      .remove();

    // Apply specific styles using the utility
    nodeUpdate.each(function(d) {
      const el = d3.select(this);
      
      const isSelected = selectedNodeId === d.id;
      const isMultiSelected = multiSelectedNodeIds.includes(d.id);
      
      // Get calculated styles
      const { className, mainTextClass, size } = getNodeStyles(
        d, 
        isSelected, 
        isMultiSelected, 
        isSelectionMode
      );

      el.attr("class", className)
        .style("width", `${size}px`)
        .style("height", `${size}px`);

      const contentDiv = el.select(".node-content");
      contentDiv.html("");
      
      contentDiv.append("span")
        .attr("class", `font-bold leading-tight break-words max-w-full px-1 ${mainTextClass}`)
        .style("font-size", d.level === 0 || isSelected ? "1rem" : "0.85rem")
        .text(d.text);

      // --- Interaction Handlers ---
      el.on("click", (event) => {
        event.stopPropagation();
        onNodeClick(d);
      });

      el.on("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();
        onNodeRightClick(event, d);
      });
      
      // Drag behavior
       const drag = d3.drag<HTMLDivElement, NodeData>()
        .on("start", (event, d) => {
           if (!event.active) simulation.alphaTarget(0.3).restart();
           d.fx = d.x;
           d.fy = d.y;
        })
        .on("drag", (event, d) => {
           d.fx = event.x;
           d.fy = event.y;
           el.style("left", `${event.x}px`).style("top", `${event.y}px`);
           linkUpdate
             .filter(l => (l.source as unknown as NodeData).id === d.id || (l.target as unknown as NodeData).id === d.id)
             .attr("x1", l => (l.source as unknown as NodeData).id === d.id ? event.x : (l.source as unknown as NodeData).x!)
             .attr("y1", l => (l.source as unknown as NodeData).id === d.id ? event.y : (l.source as unknown as NodeData).y!)
             .attr("x2", l => (l.target as unknown as NodeData).id === d.id ? event.x : (l.target as unknown as NodeData).x!)
             .attr("y2", l => (l.target as unknown as NodeData).id === d.id ? event.y : (l.target as unknown as NodeData).y!);
        })
        .on("end", (event, d) => {
           if (!event.active) simulation.alphaTarget(0.05); // Return to drift state, not 0
           d.fx = null;
           d.fy = null;
        });
        
       el.call(drag);
    });

    simulation.on("tick", () => {
      linkUpdate
        .attr("x1", d => (d.source as unknown as NodeData).x!)
        .attr("y1", d => (d.source as unknown as NodeData).y!)
        .attr("x2", d => (d.target as unknown as NodeData).x!)
        .attr("y2", d => (d.target as unknown as NodeData).y!);

      nodeUpdate
        .style("left", d => `${d.x}px`)
        .style("top", d => `${d.y}px`);
    });

  }, [nodes, links, selectedNodeId, multiSelectedNodeIds, isSelectionMode, onNodeClick, onNodeRightClick]);


  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden bg-white cursor-move"
      onClick={onBackgroundClick}
    >
      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <g ref={linesGroupRef} />
      </svg>
      <div ref={nodesLayerRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
          <div ref={nodesContainerRef} className="w-full h-full origin-top-left pointer-events-none"></div>
      </div>
    </div>
  );
};

export default GraphCanvas;