# 3D Force-Graph — Development Examples

This file contains practical, production-ready examples demonstrating the most important patterns for building applications with 3d-force-graph.

All examples assume:

```js
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import * as d3 from 'd3'; // for custom forces
```

---

## Example 1: Production-Ready React Component

A complete, reusable React component with resize handling, cleanup, and event callbacks.

```jsx
import { useEffect, useRef, useCallback } from 'react';
import ForceGraph3D from 'three-forcegraph';
import * as THREE from 'three';

export default function ForceGraph3DWidget({
  data,
  nodeColor,
  nodeLabel,
  linkColor,
  backgroundColor = '#0d1117',
  controlType = 'orbit',
  onNodeClick,
  onNodeHover,
  onEngineStop,
  warmupTicks = 0,
}) {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const dimsRef = useRef({ width: window.innerWidth, height: window.innerHeight });

  // --- Resize handling ---
  useEffect(() => {
    const handleResize = () => {
      dimsRef.current = { width: window.innerWidth, height: window.innerHeight };
      if (graphRef.current) {
        graphRef.current.width(window.innerWidth);
        graphRef.current.height(window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Graph initialization ---
  useEffect(() => {
    if (!containerRef.current) return;

    const graph = ForceGraph3D({ three: THREE })(
      containerRef.current
    );
    graphRef.current = graph;

    graph
      .backgroundColor(backgroundColor)
      .controlType(controlType)
      .showNavInfo(true);

    if (data) graph.graphData(data);
    if (nodeColor) graph.nodeColor(nodeColor);
    if (nodeLabel) graph.nodeLabel(nodeLabel);
    if (linkColor) graph.linkColor(linkColor);
    if (onNodeClick) graph.onNodeClick(onNodeClick);
    if (onNodeHover) graph.onNodeHover(onNodeHover);
    if (warmupTicks) graph.warmupTicks(warmupTicks);
    if (onEngineStop) graph.onEngineStop(onEngineStop);

    return () => {
      graph._destructor();
      graphRef.current = null;
    };
  }, []); // Run once on mount

  // --- Reactive data updates ---
  useEffect(() => {
    if (graphRef.current && data) {
      graphRef.current.graphData(data);
    }
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100vw', height: '100vh', margin: 0 }}
    />
  );
}
```

---

## Example 2: Interactive Node Exploration

Click a node → camera flies to it, shows a detail panel, highlights connected nodes.

```js
export function createExplorableGraph(containerId, graphData) {
  const container = document.getElementById(containerId);
  const detailPanel = document.getElementById('detail-panel');

  const graph = new ForceGraph3D(container)
    .graphData(graphData)
    .backgroundColor('#0a0a0f')
    .controlType('orbit')
    .nodeAutoColorBy('group')
    .nodeLabel(d => `<b>${d.name || d.id}</b>`)
    .nodeVal(d => d.val || 1)
    .linkDirectionalArrowLength(4)
    .linkDirectionalArrowRelPos(0.8)
    .onNodeClick(handleNodeClick)
    .onNodeHover(handleNodeHover)
    .onBackgroundClick(clearSelection);

  // --- Node click: fly + highlight ---
  function handleNodeClick(node) {
    const dist = 300;
    graph.cameraPosition(
      { x: node.x, y: node.y, z: node.z + dist },
      { x: node.x, y: node.y, z: node.z },
      800
    );

    // Highlight connected subgraph
    const connected = new Set([node.id]);
    graph.graphData().links.forEach(l => {
      const src = l.source.id || l.source;
      const tgt = l.target.id || l.target;
      if (src === node.id) connected.add(tgt);
      if (tgt === node.id) connected.add(src);
    });

    graph.nodeOpacity(n => connected.has(n.id) ? 1 : 0.08);
    graph.linkOpacity(l => {
      const src = l.source.id || l.source;
      const tgt = l.target.id || l.target;
      return (src === node.id || tgt === node.id) ? 0.8 : 0.02;
    });

    showDetailPanel(node);
  }

  // --- Node hover: subtle highlight ---
  let hoveredNode = null;
  function handleNodeHover(node) {
    if (hoveredNode === node) return;
    hoveredNode = node;
    if (!node) {
      graph.nodeOpacity(0.75);
      graph.linkOpacity(0.2);
    }
  }

  // --- Background click: reset ---
  function clearSelection() {
    graph.nodeOpacity(0.75);
    graph.linkOpacity(0.2);
    hideDetailPanel();
  }

  // --- Detail panel helpers ---
  function showDetailPanel(node) {
    detailPanel.innerHTML = `
      <h3>${node.name || node.id}</h3>
      <p>Group: ${node.group ?? 'N/A'}</p>
      <p>Value: ${node.val ?? 1}</p>
      <p>Connections: ${countConnections(node.id)}</p>
    `;
    detailPanel.style.display = 'block';
  }

  function countConnections(nodeId) {
    return graph.graphData().links.filter(l => {
      const src = l.source.id || l.source;
      const tgt = l.target.id || l.target;
      return src === nodeId || tgt === nodeId;
    }).length;
  }

  function hideDetailPanel() {
    detailPanel.style.display = 'none';
  }

  return graph;
}
```

---

## Example 3: DAG Mode for Dependency Visualization

```js
export function createDependencyGraph(containerId, packages) {
  // packages: array of { id, name, version, dependencies: [] }
  const graphData = buildDependencyGraph(packages);

  const graph = new ForceGraph3D(document.getElementById(containerId), {
    controlType: 'orbit',
    rendererConfig: { antialias: true, alpha: true }
  })
    .graphData(graphData)
    .backgroundColor('#111')
    .dagMode('lr')
    .dagLevelDistance(120)
    .nodeThreeObject(node => {
      if (node.dev) {
        // Dev dependency: diamond
        const geo = new THREE.OctahedronGeometry(Math.sqrt(node.val || 1) * 2);
        return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
          color: 0xe74c3c, emissive: 0xe74c3c, emissiveIntensity: 0.3
        }));
      }
      // Regular dependency: sphere
      return null; // use default
    })
    .nodeVal(d => Math.sqrt(d.size || 1) * 1.5)
    .nodeLabel(d => `${d.name}@${d.version}`)
    .nodeColor(d => d.dev ? '#e74c3c' : '#2ecc71')
    .linkDirectionalArrowLength(4)
    .linkDirectionalParticles(3)
    .linkDirectionalParticleSpeed(0.015)
    .onNodeClick(node => {
      console.log('Package:', node.name, node.version);
      console.log('Dependencies:', node.dependencies);
    });

  return graph;
}

function buildDependencyGraph(packages) {
  const nodes = packages.map(p => ({
    id: p.name,
    name: p.name,
    version: p.version,
    val: p.dependencies?.length || 1,
    size: p.size || 1,
    dev: p.dev || false
  }));

  const links = [];
  packages.forEach(p => {
    (p.dependencies || []).forEach(dep => {
      links.push({ source: dep, target: p.name });
    });
  });

  return { nodes, links };
}
```

---

## Example 4: Real-Time Graph with WebSocket

```js
export class LiveGraph {
  constructor(containerId, wsUrl) {
    this.containerId = containerId;
    this.wsUrl = wsUrl;
    this.graphData = { nodes: [], links: [] };
    this.nodeMap = new Map();
    this.linkSet = new Set();
  }

  connect() {
    this.graph = new ForceGraph3D(document.getElementById(this.containerId))
      .graphData(this.graphData)
      .backgroundColor('#080810')
      .nodeAutoColorBy('type')
      .nodeVal(d => d.weight || 1)
      .linkColor(l => l.weight > 1 ? '#ffcc00' : '#444466')
      .linkWidth(l => Math.min(l.weight || 1, 3))
      .onNodeClick(node => this.onNodeClick(node));

    this.ws = new WebSocket(this.wsUrl);
    this.ws.onmessage = ({ data }) => this.handleMessage(JSON.parse(data));
    this.ws.onclose = () => {
      console.log('WS closed, reconnecting...');
      setTimeout(() => this.connect(), 2000);
    };
  }

  handleMessage(msg) {
    switch (msg.type) {
      case 'node_add': {
        const node = { ...msg.data, addedAt: Date.now() };
        this.nodeMap.set(node.id, node);
        this.graphData.nodes.push(node);
        break;
      }
      case 'node_remove': {
        this.nodeMap.delete(msg.id);
        this.graphData.nodes = this.graphData.nodes.filter(n => n.id !== msg.id);
        this.graphData.links = this.graphData.links.filter(l => {
          const src = l.source.id || l.source;
          const tgt = l.target.id || l.target;
          return src !== msg.id && tgt !== msg.id;
        });
        break;
      }
      case 'link_add': {
        const key = `${msg.data.source}->${msg.data.target}`;
        if (!this.linkSet.has(key)) {
          this.linkSet.add(key);
          this.graphData.links.push(msg.data);
        }
        break;
      }
      case 'bulk_sync': {
        this.graphData = msg.data;
        this.graphData.nodes.forEach(n => this.nodeMap.set(n.id, n));
        msg.data.links.forEach(l => {
          const src = l.source.id || l.source;
          const tgt = l.target.id || l.target;
          this.linkSet.add(`${src}->${tgt}`);
        });
        break;
      }
      case 'node_update': {
        const idx = this.graphData.nodes.findIndex(n => n.id === msg.id);
        if (idx >= 0) {
          Object.assign(this.graphData.nodes[idx], msg.data);
        }
        break;
      }
    }
    this.graph.graphData(this.graphData);
  }

  onNodeClick(node) {
    console.log('Node clicked:', node);
  }

  disconnect() {
    this.ws?.close();
    this.graph?._destructor();
  }
}

// Usage:
// const live = new LiveGraph('graph-container', 'wss://api.example.com/graph');
// live.connect();
```

---

## Example 5: Performance-Optimized Large Graph (10k+ nodes)

```js
export function createLargeGraph(containerId, data) {
  // Pre-process: compute node degrees for sizing
  const degree = {};
  data.nodes.forEach(n => degree[n.id] = 0);
  data.links.forEach(l => {
    const src = l.source.id || l.source;
    const tgt = l.target.id || l.target;
    degree[src] = (degree[src] || 0) + 1;
    degree[tgt] = (degree[tgt] || 0) + 1;
  });

  const graph = new ForceGraph3D(document.getElementById(containerId), {
    controlType: 'orbit'
  })
    .graphData(data)
    .backgroundColor('#0a0a0a')

    // Performance: reduce geometry
    .nodeResolution(4)     // default 8
    .linkResolution(4)    // default 6

    // Performance: use Lines instead of 3D cylinders
    .linkWidth(0)

    // Performance: disable hover interaction (still allows clicks)
    .enablePointerInteraction(true)  // keep for labels
    .showNavInfo(false)

    // Physics: use ngraph for large graphs
    .forceEngine('ngraph')
    .ngraphPhysics({
      gravity: true,
      theta: 1.0,
      springLength: 50,
      springCoefficient: 0.8
    })

    // Style
    .nodeVal(n => Math.sqrt(degree[n.id] || 1) * 1.5)
    .nodeColor(n => degree[n.id] > 20 ? '#ff4444' : '#4488ff')
    .nodeOpacity(0.8)
    .linkOpacity(0.15)

    // Node labels only for high-degree nodes
    .nodeLabel(n => degree[n.id] > 10 ? `${n.id} (${degree[n.id]})` : null)

    // Pre-compute layout
    .warmupTicks(200)
    .cooldownTicks(200)
    .onEngineStop(() => {
      graph.cooldownTicks(Infinity);
      console.log('Layout complete');
    });

  return graph;
}
```

---

## Example 6: Custom Forces for Special Layouts

```js
export function createClusteredGraph(containerId, data) {
  // Assign clusters
  const clusters = assignClusters(data); // { nodeId: clusterId }

  // Compute cluster centers
  const clusterCenters = computeClusterCenters(data, clusters);

  const graph = new ForceGraph3D(document.getElementById(containerId))
    .graphData(data)
    .backgroundColor('#111')
    .forceEngine('d3')
    .nodeColor(n => {
      const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
      return colors[clusters[n.id] % colors.length];
    })
    .nodeVal(d => d.val || 1)
    .linkOpacity(0.1)

    // Custom cluster force (pulls nodes toward their cluster center)
    .d3Force('cluster', (alpha) => {
      data.nodes.forEach(node => {
        const center = clusterCenters[clusters[node.id]];
        if (!center) return;
        const k = alpha * 0.1;
        node.vx -= (node.x - center.x) * k;
        node.vy -= (node.y - center.y) * k;
        node.vz -= (node.z - center.z) * k;
      });
    })

    // Standard forces
    .d3Force('charge', d3.forceManyBody().strength(-80).distanceMax(200))
    .d3Force('link', d3.forceLink().id(d => d.id).distance(60).strength(0.5))
    .d3Force('collision', d3.forceCollide().radius(d => Math.sqrt(d.val || 1) * 3 + 2))

    .d3AlphaDecay(0.02)
    .d3VelocityDecay(0.3);

  return graph;
}

function assignClusters(data) {
  // Simple connected-components clustering
  const visited = new Set();
  const clusters = {};
  let clusterId = 0;

  function bfs(nodeId, clusterId) {
    const queue = [nodeId];
    while (queue.length) {
      const id = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      clusters[id] = clusterId;

      data.links.forEach(l => {
        const src = l.source.id || l.source;
        const tgt = l.target.id || l.target;
        if (src === id && !visited.has(tgt)) queue.push(tgt);
        if (tgt === id && !visited.has(src)) queue.push(src);
      });
    }
  }

  data.nodes.forEach(n => {
    if (!visited.has(n.id)) {
      bfs(n.id, clusterId++);
    }
  });

  return clusters;
}

function computeClusterCenters(data, clusters) {
  const centers = {};
  const counts = {};

  data.nodes.forEach(n => {
    const c = clusters[n.id];
    if (!centers[c]) {
      centers[c] = { x: 0, y: 0, z: 0 };
      counts[c] = 0;
    }
    centers[c].x += n.x || 0;
    centers[c].y += n.y || 0;
    centers[c].z += n.z || 0;
    counts[c]++;
  });

  Object.keys(centers).forEach(c => {
    const count = counts[c];
    centers[c].x /= count;
    centers[c].y /= count;
    centers[c].z /= count;
  });

  return centers;
}
```

---

## Example 7: Bloom + Custom Lighting

```js
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export function createImmersiveGraph(containerId, data) {
  const graph = new ForceGraph3D(document.getElementById(containerId), {
    controlType: 'fly',
    rendererConfig: { antialias: true }
  })
    .graphData(data)
    .backgroundColor('#000005')
    .showNavInfo(false)

    // Custom glowing nodes
    .nodeThreeObject(node => {
      const geo = new THREE.SphereGeometry(node.val * 2 || 4);
      const mat = new THREE.MeshStandardMaterial({
        color: node.color || 0x00ffff,
        emissive: node.color || 0x00ffff,
        emissiveIntensity: 1.2,
        metalness: 0.3,
        roughness: 0.4
      });
      return new THREE.Mesh(geo, mat);
    })
    .nodeOpacity(1)
    .nodeResolution(16)

    // Glow links
    .linkMaterial(link => {
      return new THREE.LineBasicMaterial({
        color: link.color || 0x00aaff,
        transparent: true,
        opacity: 0.6
      });
    })
    .linkWidth(0)

    // Camera
    .cameraPosition({ z: 500 })

    // Lights
    .lights([
      new THREE.AmbientLight(0x222244, Math.PI),
      new THREE.DirectionalLight(0xffffff, 0.5 * Math.PI),
      new THREE.PointLight(0xff00ff, 0.5, 500)
    ]);

  // Post-processing bloom
  const composer = graph.postProcessingComposer();

  const renderPass = new RenderPass(graph.scene(), graph.camera());
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,   // strength
    0.4,   // radius
    0.2    // threshold (low = more objects glow)
  );
  const outputPass = new OutputPass();

  composer.reset();
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);

  // Auto-orbit
  let angle = 0;
  const orbit = () => {
    angle += 0.001;
    const r = 600;
    graph.cameraPosition({
      x: Math.sin(angle) * r,
      y: Math.cos(angle * 0.7) * 300,
      z: Math.cos(angle) * r
    });
    requestAnimationFrame(orbit);
  };
  orbit();

  return graph;
}
```

---

## Example 8: Node Selection + Multi-Select with Shift

```js
export function createSelectableGraph(containerId, data) {
  const selectedNodes = new Set();
  let isDragging = false;
  let dragStartPos = null;

  const graph = new ForceGraph3D(document.getElementById(containerId))
    .graphData(data)
    .backgroundColor('#111')
    .nodeAutoColorBy('group')
    .nodeVal(d => d.val || 1)
    .nodeLabel(d => d.name || d.id)
    .onNodeClick((node, event) => {
      if (event.shiftKey) {
        // Multi-select
        if (selectedNodes.has(node.id)) {
          selectedNodes.delete(node.id);
        } else {
          selectedNodes.add(node.id);
        }
        updateSelection();
      } else {
        // Single select
        selectedNodes.clear();
        selectedNodes.add(node.id);
        updateSelection();
      }
    })
    .onNodeDrag((node, translate) => {
      isDragging = true;
    })
    .onNodeDragEnd((node) => {
      isDragging = false;
    })
    .onBackgroundClick((event) => {
      if (!isDragging) {
        selectedNodes.clear();
        updateSelection();
      }
    });

  function updateSelection() {
    graph.nodeThreeObject(node => {
      const isSelected = selectedNodes.has(node.id);
      const geo = new THREE.SphereGeometry((node.val || 1) * 2);
      const mat = new THREE.MeshStandardMaterial({
        color: node.color || '#4488ff',
        emissive: isSelected ? 0xffffff : 0x000000,
        emissiveIntensity: isSelected ? 0.8 : 0,
        metalness: 0.5,
        roughness: 0.3
      });
      return new THREE.Mesh(geo, mat);
    });

    graph.linkColor(l => {
      const src = l.source.id || l.source;
      const tgt = l.target.id || l.target;
      return selectedNodes.has(src) && selectedNodes.has(tgt)
        ? '#ffffff'
        : l.color || '#666';
    });

    graph.linkWidth(l => {
      const src = l.source.id || l.source;
      const tgt = l.target.id || l.target;
      return (selectedNodes.has(src) && selectedNodes.has(tgt)) ? 2 : 0.5;
    });

    // Show count
    console.log(`Selected ${selectedNodes.size} nodes:`, [...selectedNodes]);
  }

  return graph;
}
```

---

*These examples cover the most common production use cases. For the full API reference, see `DOCUMENTATION.md`.*
