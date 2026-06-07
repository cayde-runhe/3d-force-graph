import { useEffect, useRef, useState, useCallback } from 'react';
import ForceGraph3D from 'three-forcegraph';
import * as THREE from 'three';

export default function ForceGraph3DComponent({
  data,
  jsonUrl,
  nodeAutoColorBy,
  nodeLabel,
  nodeId,
  linkSource,
  linkTarget,
  linkLabel,
  linkColor,
  linkWidth,
  linkDirectionalArrowLength,
  onNodeClick,
  onNodeRightClick,
  backgroundColor = '#111111',
  showNavInfo = true,
}) {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });

  const handleResize = useCallback(() => {
    setDims({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (!containerRef.current) return;

    const { width, height } = dims;

    const graph = ForceGraph3D({ three: THREE, width, height })(containerRef.current);
    graphRef.current = graph;

    graph
      .backgroundColor(backgroundColor)
      .showNavInfo(showNavInfo);

    if (jsonUrl) graph.jsonUrl(jsonUrl);
    if (data) graph.graphData(data);
    if (nodeAutoColorBy) graph.nodeAutoColorBy(nodeAutoColorBy);
    if (nodeLabel) graph.nodeLabel(nodeLabel);
    if (nodeId) graph.nodeId(nodeId);
    if (linkSource) graph.linkSource(linkSource);
    if (linkTarget) graph.linkTarget(linkTarget);
    if (linkLabel) graph.linkLabel(linkLabel);
    if (linkColor) graph.linkColor(linkColor);
    if (linkWidth !== undefined) graph.linkWidth(linkWidth);
    if (linkDirectionalArrowLength !== undefined) {
      graph.linkDirectionalArrowLength(linkDirectionalArrowLength);
    }
    if (onNodeClick) graph.onNodeClick(onNodeClick);
    if (onNodeRightClick) graph.onNodeRightClick(onNodeRightClick);

    return () => {
      if (graph._cleanup) graph._cleanup();
      containerRef.current && (containerRef.current.innerHTML = '');
    };
  }, [dims, backgroundColor, showNavInfo]);

  useEffect(() => {
    if (!graphRef.current) return;
    if (jsonUrl) graphRef.current.jsonUrl(jsonUrl);
  }, [jsonUrl]);

  useEffect(() => {
    if (!graphRef.current) return;
    if (data) graphRef.current.graphData(data);
  }, [data]);

  useEffect(() => {
    if (!graphRef.current) return;
    if (nodeAutoColorBy) graphRef.current.nodeAutoColorBy(nodeAutoColorBy);
  }, [nodeAutoColorBy]);

  useEffect(() => {
    if (!graphRef.current) return;
    if (nodeLabel) graphRef.current.nodeLabel(nodeLabel);
  }, [nodeLabel]);

  useEffect(() => {
    if (!graphRef.current) return;
    if (linkColor) graphRef.current.linkColor(linkColor);
  }, [linkColor]);

  useEffect(() => {
    if (!graphRef.current) return;
    if (linkWidth !== undefined) graphRef.current.linkWidth(linkWidth);
  }, [linkWidth]);

  useEffect(() => {
    if (!graphRef.current) return;
    if (onNodeClick) graphRef.current.onNodeClick(onNodeClick);
  }, [onNodeClick]);

  return <div ref={containerRef} style={{ width: dims.width, height: dims.height, margin: 0 }} />;
}
