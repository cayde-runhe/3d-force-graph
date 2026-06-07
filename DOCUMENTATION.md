# 3D Force-Directed Graph — Complete Documentation & Vibe Coding Guide

> **3D Force-Directed Graph** is a web component for rendering force-directed graphs in 3D space using ThreeJS/WebGL for rendering and d3-force-3d (or ngraph) for physics simulation.

- **GitHub**: [vasturiano/3d-force-graph](https://github.com/vasturiano/3d-force-graph)
- **Stars**: 6,108 | **Forks**: 987
- **License**: MIT | **Author**: Vasco Asturiano
- **Dependencies**: ThreeJS (>= 0.179 < 1), three-forcegraph, three-render-objects, kapsule, accessor-fn
- **Build Tool**: Rollup | **Node >= 12**

---

## Table of Contents

1. [Architecture Deep Dive](#1-architecture-deep-dive)
2. [Project Structure](#2-project-structure)
3. [Core API Reference](#3-core-api-reference)
4. [Example Catalog](#4-example-catalog)
5. [React Integration Guide](#5-react-integration-guide)
6. [Advanced Techniques](#6-advanced-techniques)
7. [Datasets Reference](#7-datasets-reference)
8. [Vibe Coding Dataset](#8-vibe-coding-dataset)
9. [Development Guide](#9-development-guide)

---

## 1. Architecture Deep Dive

### 1.1 Component Architecture

The library is built on a layered architecture using **Kapsule** (a stateful component pattern):

```
┌─────────────────────────────────────────────────┐
│           ForceGraph3D (Kapsule)                 │
│  ┌───────────────────────────────────────────┐   │
│  │  ThreeRenderObjects (Kapsule)              │   │
│  │  - ThreeJS Scene, Camera, Renderer         │   │
│  │  - Controls (Trackball/Orbit/Fly)         │   │
│  │  - Post-processing Composer                │   │
│  │  - Pointer interaction / Hover / Click     │   │
│  └───────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────┐   │
│  │  ThreeForceGraph (Kapsule)                │   │
│  │  - d3-force-3d / ngraph physics engine    │   │
│  │  - Node/Link data structures               │   │
│  │  - Force simulation (tick)                │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Key insight**: `kapsule-link.js` is the bridge pattern. It creates a proxy that propagates property changes and method calls between the outer `ForceGraph3D` Kapsule and the inner `ThreeForceGraph` / `ThreeRenderObjects` Kapsules.

### 1.2 Rendering Pipeline

Each animation frame (`requestAnimationFrame` loop):

1. **`state.forceGraph.tickFrame()`** — advance the physics simulation one tick (update node positions based on force calculations)
2. **`state.renderObjs.tick()`** — render the ThreeJS scene (draw nodes, links, particles, labels)

### 1.3 Node Dragging (d3 engine only)

The library uses `ThreeJS DragControls` for node dragging. The drag system:

- Locks the dragged node by setting `fx/fy/fz` (fixed position)
- Keeps the simulation alive with low alpha (`0.3`)
- Tracks `__initialFixedPos` and `__initialPos` for drag-end calculations
- On drag end: restores `fx/fy/fz` based on whether the node had pre-existing fixed positions

### 1.4 Link System

- **Default**: ThreeJS `Line` (constant 1px width regardless of distance)
- **With width > 0**: ThreeJS `CylinderGeometry` (3D tube)
- **Curved links**: Bezier curves via parametric equation
- **Arrows**: `ConeGeometry` placed along the link direction at `linkDirectionalArrowRelPos`
- **Particles**: Small spheres animated along the link direction using `sin/cos` of time + offset

### 1.5 Post-Processing

The `postProcessingComposer()` method exposes ThreeJS's `EffectComposer`. You can add effects like bloom, DOF, etc. The default composer has only a `RenderPass`.

### 1.6 Force Engine Comparison

| Feature | d3-force-3d | ngraph |
|---|---|---|
| Dimensions | 1D, 2D, 3D | 3D only |
| Node dragging | Yes | No |
| DAG layout | Yes | No |
| Custom forces | Yes (d3Force) | Yes (ngraphPhysics) |
| Performance | Good | Better for large graphs |

---

## 2. Project Structure

```
3d-force-graph/
├── demo/                          # Main demo/website
│   ├── src/
│   │   ├── 3d-force-graph.js      # ⭐ Core library source
│   │   ├── 3d-force-graph.css     # CSS (cursor styles, info message)
│   │   ├── index.js               # Export re-export
│   │   ├── index.d.ts             # TypeScript definitions
│   │   └── kapsule-link.js        # Kapsule proxy bridge
│   ├── dist/                      # Built output (mjs, js, min.js, d.ts)
│   ├── example/                    # Individual example pages (served via GitHub Pages)
│   │   ├── basic/
│   │   ├── controls-orbit/
│   │   ├── large-graph/
│   │   ├── directional-links-arrows/
│   │   ├── bloom-effect/
│   │   └── ... (30+ examples)
│   └── package.json
│
├── operation-commander/            # React + Vite application
│   ├── src/
│   │   ├── App.jsx                # Router setup
│   │   ├── main.jsx               # React entry point
│   │   ├── index.css              # Global styles
│   │   ├── components/
│   │   │   └── ForceGraph3DComponent.jsx  # React wrapper
│   │   └── pages/
│   │       ├── Home.jsx           # Dataset listing
│   │       ├── LargeGraph.jsx      # blocks.json viewer
│   │       └── Miserables.jsx      # Character network
│   ├── public/
│   │   └── datasets/              # JSON/CSV graph data
│   │       ├── blocks.json        # GitHub Gist network (large)
│   │       ├── miserables.json    # Les Misérables co-occurrence
│   │       └── d3-dependencies.csv # D3 module dependency tree
│   └── package.json
│
└── prototype/                     # Scratch/experimentation area
    └── datasets/
        ├── blocks.json
        ├── miserables.json
        └── d3-dependencies.csv
```

### Key Dependencies Explained

| Package | Purpose |
|---|---|
| `three-forcegraph` | Core graph logic: data management, physics engine integration, node/link rendering, DAG processing |
| `three-render-objects` | ThreeJS scene management: camera, renderer, controls, lights, post-processing, pointer events |
| `kapsule` | Stateful component pattern with reactive props/methods |
| `accessor-fn` | Normalizes function/string/constant accessors into unified accessor functions |

---

## 3. Core API Reference

### 3.1 Initialization

```js
import ForceGraph3D from '3d-force-graph';

const myGraph = new ForceGraph3D(document.getElementById('container'), {
  controlType: 'orbit',        // 'trackball' | 'orbit' | 'fly'
  rendererConfig: {            // ThreeJS WebGLRenderer config
    antialias: true,
    alpha: true
  },
  extraRenderers: []            // e.g., [new CSS3DRenderer()]
});
```

Or via script tag:

```html
<script src="//cdn.jsdelivr.net/npm/3d-force-graph"></script>
<script>
  const myGraph = new ForceGraph3D(document.getElementById('container'))
    .graphData({ nodes: [...], links: [...] });
</script>
```

### 3.2 Data Input

```js
// Basic
graph.graphData({
  nodes: [
    { id: 'node1', name: 'Alice', val: 10, color: '#ff0000' },
    { id: 'node2', name: 'Bob',   val: 5  }
  ],
  links: [
    { source: 'node1', target: 'node2', value: 1 },
    { source: 'node1', target: 'node3' }      // value defaults to 1
  ]
});

// Or load from URL
graph.jsonUrl('/data/my-graph.json');

// Customize ID accessors (for non-standard node/link schemas)
graph.nodeId('uid')           // default: 'id'
  .linkSource('src')           // default: 'source'
  .linkTarget('dst');          // default: 'target'
```

### 3.3 Node Styling

| Method | Type | Description | Default |
|---|---|---|---|
| `nodeVal(fn)` | num/str/fn | Node size (affects sphere volume) | `val` |
| `nodeColor(fn)` | str/fn | Node color | `color` |
| `nodeOpacity(num)` | num | Sphere opacity [0-1] | 0.75 |
| `nodeResolution(num)` | num | Sphere smoothness (circumference segments) | 8 |
| `nodeRelSize(num)` | num | Sphere volume per value unit | 4 |
| `nodeLabel(fn)` | str/fn | Hover tooltip label (text/HTML/HTMLElement) | `name` |
| `nodeVisibility(fn)` | bool/str/fn | Whether to render | `true` |
| `nodeAutoColorBy(fn)` | str/fn | Auto-color by attribute (only affects uncolored nodes) | - |
| `nodeThreeObject(fn)` | Object3d/fn | Custom ThreeJS mesh (return falsy for default sphere) | sphere |
| `nodeThreeObjectExtend(bool)` | bool/fn | Extend default sphere with custom object | `false` |
| `nodePositionUpdate(fn)` | fn | Custom position update per frame | - |

```js
// Custom node geometry — return a ThreeJS Object3D
graph.nodeThreeObject(node => {
  if (node.type === 'planet') {
    return new THREE.Mesh(
      new THREE.SphereGeometry(10, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x3498db })
    );
  }
  return null; // use default sphere
});
```

### 3.4 Link Styling

| Method | Type | Description | Default |
|---|---|---|---|
| `linkColor(fn)` | str/fn | Link color | `color` |
| `linkWidth(fn)` | num/str/fn | Line width (0 = Line object) | 0 |
| `linkResolution(num)` | num | Cylinder smoothness | 6 |
| `linkOpacity(num)` | num | Link opacity [0-1] | 0.2 |
| `linkLabel(fn)` | str/fn | Hover tooltip label | `name` |
| `linkVisibility(fn)` | bool/str/fn | Whether to render | `true` |
| `linkCurvature(fn)` | num/str/fn | Bezier curvature (0=straight, 1=semicircle) | 0 |
| `linkCurveRotation(fn)` | num/str/fn | Rotation along link axis (radians) | 0 |
| `linkMaterial(fn)` | Material/fn | Custom ThreeJS material | MeshLambertMaterial |
| `linkThreeObject(fn)` | Object3d/fn | Custom ThreeJS object for links | line/cylinder |
| `linkDirectionalArrowLength(fn)` | num/str/fn | Arrow head length | 0 |
| `linkDirectionalArrowColor(fn)` | str/fn | Arrow color | `color` |
| `linkDirectionalArrowRelPos(fn)` | num/str/fn | Arrow position along link [0-1] | 0.5 |
| `linkDirectionalArrowResolution(num)` | num | Arrow cone smoothness | 8 |
| `linkDirectionalParticles(fn)` | num/str/fn | Number of animated particles | 0 |
| `linkDirectionalParticleSpeed(fn)` | num/str/fn | Particle speed (ratio of link length/frame) | 0.01 |
| `linkDirectionalParticleWidth(fn)` | num/str/fn | Particle sphere size | 0.5 |
| `linkDirectionalParticleColor(fn)` | str/fn | Particle color | `color` |

```js
// Directional arrows with particles
graph.linkDirectionalArrowLength(3)
  .linkDirectionalArrowColor(link => link.color || '#fff')
  .linkDirectionalParticles(4)
  .linkDirectionalParticleSpeed(0.02)
  .linkDirectionalParticleColor(link => '#00ffff');

// Curved links for self-references
graph.linkCurvature(link => {
  if (link.source === link.target) return 2; // loop around node
  return 0.5; // gentle curve
});

// Custom link as glowing tube
graph.linkThreeObject(link => {
  const geometry = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(link.source.x, link.source.y, link.source.z),
      new THREE.Vector3(link.target.x, link.target.y, link.target.z)
    ]),
    20, 0.5, 8, false
  );
  return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    color: link.color || '#ff0',
    transparent: true,
    opacity: 0.8
  }));
});
```

### 3.5 Render Control

```js
// Camera
graph.cameraPosition({ x: 0, y: 0, z: 1000 }, { x: 0, y: 0, z: 0 }, 2000);
// Animate camera to fit all nodes
graph.zoomToFit(1000, 50);

// Post-processing
graph.postProcessingComposer()  // returns EffectComposer
  .addPass(new BloomPass());

// Access ThreeJS internals
graph.scene()    // THREE.Scene
graph.camera()   // THREE.PerspectiveCamera
graph.renderer() // THREE.WebGLRenderer
graph.controls() // THREE.OrbitControls / TrackballControls / FlyControls

// Pause/Resume
graph.pauseAnimation();
graph.resumeAnimation();

// Manual refresh
graph.refresh();
```

### 3.6 Force Engine Configuration

```js
// Choose engine
graph.forceEngine('d3'); // or 'ngraph'

// D3 force configuration
graph.d3AlphaDecay(0.0228)      // simulation intensity decay
  .d3VelocityDecay(0.4)          // velocity damping
  .d3AlphaMin(0);                // minimum alpha

// Custom d3 forces
graph.d3Force('charge', d3.forceManyBody().strength(-300));
graph.d3Force('link', d3.forceLink().distance(100).strength(0.5));
graph.d3Force('center', d3.forceCenter(0, 0, 0).strength(0.1));
graph.d3Force('collision', d3.forceCollide(30));

// Reheat simulation
graph.d3ReheatSimulation();

// Ngraph configuration
graph.ngraphPhysics({
  gravity: true,
  theta: 1.5,
  springLength: 200,
  springCoefficient: 0.8
});

// DAG layout (directed acyclic graph)
graph.dagMode('lr')              // 'td' | 'bu' | 'lr' | 'rl' | 'zout' | 'zin' | 'radialout' | 'radialin'
  .dagLevelDistance(100)
  .dagNodeFilter(node => node.depth > 0);

// Lifecycle
graph.warmupTicks(100)           // dry-run layout before first render
  .cooldownTicks(500)            // freeze after N ticks
  .cooldownTime(20000)           // freeze after N ms
  .onEngineTick(() => console.log('tick'))
  .onEngineStop(() => console.log('stopped'));
```

### 3.7 Interaction

```js
// Node interactions
graph.onNodeClick((node, event) => {
  console.log('Clicked:', node.id);
  // Focus camera on node
  const dist = graph.graph2ScreenCoords(node.x, node.y, node.z);
  graph.cameraPosition(
    { z: node.z + 200 },
    { x: node.x, y: node.y, z: node.z },
    1000
  );
})
.onNodeRightClick((node, event) => {
  // context menu
})
.onNodeHover((node, prevNode) => {
  if (node) console.log('Hovering:', node.id);
})
.onNodeDrag((node, translate) => {
  // dragged continuously
})
.onNodeDragEnd((node, translate) => {
  console.log('Dragged from', translate, 'delta');
});

// Link interactions
graph.onLinkClick((link, event) => { /* ... */ })
  .onLinkRightClick((link, event) => { /* ... */ })
  .onLinkHover((link, prevLink) => { /* ... */ });

// Background
graph.onBackgroundClick((event) => { /* ... */ })
  .onBackgroundRightClick((event) => { /* ... */ });

// Control toggles
graph.enablePointerInteraction(true)
  .enableNodeDrag(true)
  .enableNavigationControls(true)
  .showNavInfo(true)
  .showPointerCursor(true);

// Particle emission
graph.emitParticle(linkObject); // single-shot particle
```

### 3.8 Utility Methods

```js
// Bounding box
const bbox = graph.getGraphBbox(node => node.group === 1);

// Coordinate conversion
const screen = graph.graph2ScreenCoords(100, 200, 50);
// { x: 1234, y: 567 }

const graphCoords = graph.screen2GraphCoords(500, 400, 300);
// { x: 50.2, y: 100.1, z: -20.3 }
```

---

## 4. Example Catalog

### Basic Examples

| Example | Source | Description |
|---|---|---|
| [Basic](https://vasturiano.github.io/3d-force-graph/example/basic/) | basic/index.html | Random tree, 300 nodes, simplest usage |
| [Async Load](https://vasturiano.github.io/3d-force-graph/example/async-load/) | async-load/index.html | Load data via `jsonUrl()` |
| [Controls Orbit](https://vasturiano.github.io/3d-force-graph/example/controls-orbit/) | controls-orbit/index.html | OrbitControls camera |
| [Controls Fly](https://vasturiano.github.io/3d-force-graph/example/controls-fly/) | controls-fly/index.html | FlyControls for free navigation |
| [Pause/Resume](https://vasturiano.github.io/3d-force-graph/example/pause-resume/) | pause-resume/index.html | Toggle animation |
| [Fit to Canvas](https://vasturiano.github.io/3d-force-graph/example/fit-to-canvas/) | fit-to-canvas/index.html | `zoomToFit()` usage |

### Visual Styling

| Example | Description |
|---|---|
| [Directional Arrows](example/directional-links-arrows/) | `linkDirectionalArrowLength` |
| [Directional Particles](example/directional-links-particles/) | Animated particles along links |
| [Curved Lines](example/curved-links/) | `linkCurvature` for self-links |
| [Auto-Colored](example/auto-colored/) | `nodeAutoColorBy` |
| [Text Nodes](example/text-nodes/) | 3D text as node geometry |
| [Image Nodes](example/img-nodes/) | Texture-mapped spheres |
| [HTML Nodes](example/html-nodes/) | CSS3D-rendered HTML in nodes |
| [Custom Node Geometry](example/custom-node-geometry/) | `nodeThreeObject` |
| [Gradient Links](example/gradient-links/) | Custom `linkMaterial` |
| [Text Links](example/text-links/) | Labels along links |
| [Bloom Effect](example/bloom-effect/) | Post-processing bloom |
| [Auto Orbit](example/camera-auto-orbit/) | Camera animation |

### Interaction & Behavior

| Example | Description |
|---|---|
| [Click to Focus](example/click-to-focus/) | Camera fly-to on node click |
| [Expand/Collapse](example/expandable-nodes/) | Dynamic data updates |
| [Fix Dragged Nodes](example/fix-dragged-nodes/) | Lock nodes after drag |
| [Highlight](example/highlight/) | Hover highlighting |
| [Multi-Selection](example/multi-selection/) | Select multiple nodes |
| [Dynamic Data](example/dynamic/) | Add/remove nodes live |
| [Collision Detection](example/collision-detection/) | `d3Force` with collide |
| [Link Force Distance](example/manipulate-link-force/) | Adjust `d3Force('link')` |
| [Emit Particles](example/emit-particles/) | `emitParticle()` |
| [Scene Extension](example/scene/) | Add custom ThreeJS objects |

### DAG (Directed Acyclic Graph)

| Example | Description |
|---|---|
| [Force Tree](example/tree/) | DAG mode with radial layout |
| [Yarn Dependencies](example/dag-yarn/) | DAG mode with `lr` direction |

---

## 5. React Integration Guide

### 5.1 Basic React Wrapper

The `operation-commander` project provides a reusable React component:

```jsx
import ForceGraph3DComponent from './components/ForceGraph3DComponent';

<ForceGraph3DComponent
  data={graphData}
  jsonUrl="/datasets/miserables.json"
  nodeAutoColorBy="group"
  nodeLabel={(node) => `${node.id} (Group ${node.group})`}
  linkColor={(link) => '#555'}
  linkWidth={0.5}
  backgroundColor="#0a0a0a"
  onNodeClick={(node) => console.log('Clicked:', node.id)}
/>
```

### 5.2 React Hook Pattern (Custom Hook)

For more control, create a custom hook:

```jsx
import { useEffect, useRef, useCallback } from 'react';
import ForceGraph3D from 'three-forcegraph';
import * as THREE from 'three';

export function useForceGraph3D(containerRef, options = {}) {
  const graphRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = ForceGraph3D({ three: THREE })(
      containerRef.current
    );
    graphRef.current = graph;

    // Apply options
    graph.backgroundColor(options.backgroundColor || '#111')
      .showNavInfo(options.showNavInfo !== false);

    if (options.jsonUrl) graph.jsonUrl(options.jsonUrl);
    if (options.data) graph.graphData(options.data);
    if (options.nodeLabel) graph.nodeLabel(options.nodeLabel);
    if (options.nodeAutoColorBy) graph.nodeAutoColorBy(options.nodeAutoColorBy);
    if (options.onNodeClick) graph.onNodeClick(options.onNodeClick);

    return () => {
      graph._destructor && graph._destructor();
    };
  }, []);

  return graphRef;
}
```

### 5.3 react-force-graph Package

The official React bindings are available at [vasturiano/react-force-graph](https://github.com/vasturiano/react-force-graph):

```jsx
import ForceGraph3D from 'react-force-graph-3d';

<ForceGraph3D
  graphData={data}
  nodeAutoColorBy="group"
  linkDirectionalArrowLength={3}
  onNodeClick={handleNodeClick}
/>
```

### 5.4 State Management Integration

```jsx
import { useState, useCallback } from 'react';
import ForceGraph3D from 'three-forcegraph';
import * as THREE from 'three';

export default function GraphWithState() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const handleResize = useCallback(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <div ref={containerRef}>
      {selectedNode && (
        <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}
```

---

## 6. Advanced Techniques

### 6.1 Bloom Post-Processing

```js
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const composer = graph.postProcessingComposer();

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,   // strength
  0.4,   // radius
  0.85   // threshold
);
composer.addPass(bloomPass);
```

### 6.2 Custom Node Drag Behavior (Fix Node After Drag)

```js
graph.onNodeDragEnd((node, translate) => {
  // Automatically fix node position after drag
  node.fx = node.x;
  node.fy = node.y;
  node.fz = node.z;
});
```

### 6.3 Dynamic Node Expansion/Collapse

```js
let expandedNodes = new Set();

function toggleNode(nodeId) {
  if (expandedNodes.has(nodeId)) {
    expandedNodes.delete(nodeId);
    // Remove children from graphData
    const newData = { ...graphData };
    newData.nodes = newData.nodes.filter(n => !n.parentId || !wasChildOf(nodeId));
    newData.links = newData.links.filter(l =>
      l.source !== nodeId && l.target !== nodeId
    );
    graph.graphData(newData);
  } else {
    expandedNodes.add(nodeId);
    // Add children (fetch or generate)
    const children = fetchChildren(nodeId);
    graph.graphData({
      nodes: [...graphData.nodes, ...children],
      links: [...graphData.links, ...children.map(c => ({
        source: nodeId, target: c.id
      }))]
    });
  }
}
```

### 6.4 Custom Force: Collision + Clustering

```js
graph
  .d3Force('charge', d3.forceManyBody().strength(-120).distanceMax(300))
  .d3Force('link', d3.forceLink().id(d => d.id).distance(80).strength(0.3))
  .d3Force('collision', d3.forceCollide().radius(d => Math.sqrt(d.val) * 4 + 2))
  .d3Force('cluster', customClusterForce);

function customClusterForce(alpha) {
  graph.graphData().nodes.forEach(node => {
    if (node.cluster) {
      const clusterCenter = getClusterCenter(node.cluster);
      node.vx -= (node.x - clusterCenter.x) * 0.1 * alpha;
      node.vy -= (node.y - clusterCenter.y) * 0.1 * alpha;
      node.vz -= (node.z - clusterCenter.z) * 0.1 * alpha;
    }
  });
}
```

### 6.5 Performance Optimization for Large Graphs

```js
// 1. Reduce node resolution for many small nodes
graph.nodeResolution(4);  // default is 8

// 2. Disable pointer interaction for read-only views
graph.enablePointerInteraction(false);

// 3. Pre-compute layout
graph.warmupTicks(300)
  .cooldownTicks(300)
  .onEngineStop(() => {
    graph.cooldownTicks(Infinity); // unfreeze
  });

// 4. Use Line rendering (no 3D geometry)
graph.linkWidth(0); // 0 = Line (constant 1px), >0 = CylinderGeometry

// 5. Use ngraph for better large-graph performance
graph.forceEngine('ngraph');

// 6. Level-of-detail: hide small nodes at far distances
graph.nodeVisibility(node => {
  const screenPos = graph.graph2ScreenCoords(node.x, node.y, node.z);
  return node.val > 5 || screenPos.z < 2000;
});
```

### 6.6 Integration with External Scene Objects

```js
// Add a ground plane
const groundGeo = new THREE.PlaneGeometry(500, 500);
const groundMat = new THREE.MeshBasicMaterial({
  color: 0x222222, side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = Math.PI / 2;
graph.scene().add(ground);

// Add ambient particles (stars)
const starGeo = new THREE.BufferGeometry();
const starPositions = new Float32Array(3000);
for (let i = 0; i < 3000; i += 3) {
  starPositions[i] = (Math.random() - 0.5) * 2000;
  starPositions[i+1] = (Math.random() - 0.5) * 2000;
  starPositions[i+2] = (Math.random() - 0.5) * 2000;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
const stars = new THREE.Points(starGeo, starMat);
graph.scene().add(stars);

// Dynamic lighting based on node position
const pointLight = new THREE.PointLight(0xffffff, 1, 500);
graph.scene().add(pointLight);
graph.onNodeDrag(node => {
  pointLight.position.set(node.x, node.y, node.z);
});
```

---

## 7. Datasets Reference

### 7.1 miserables.json — Les Misérables Character Network

**Source**: Victor Hugo's *Les Misérables* co-occurrence network  
**Nodes**: 77 characters  
**Links**: 254 co-appearances  
**Schema**:
```json
{
  "nodes": [
    { "id": "Myriel", "group": 1 },
    { "id": "Valjean", "group": 2 },
    ...
  ],
  "links": [
    { "source": "Valjean", "target": "Myriel", "value": 5 },
    ...
  ]
}
```

**Groups** (character families/affiliations):
| Group | Description |
|---|---|
| 0 | Religious figures |
| 1 | Bishop Myriel's circle |
| 2 | Valjean (ex-convict) |
| 3 | Fantine's circle (Tholomyes group) |
| 4 | Thenardier gang |
| 5 | Gillenormand/Marius/Cosette |
| 6 | Boulatruelle (isolated) |
| 7 | Jondrette/Gavroche |
| 8 | Les Amis de l'ABC (ABC friends/revolutionaries) |
| 9 | Mabeuf connection |
| 10 | Children (Gavroche's circle) |

### 7.2 blocks.json — GitHub Gist Block Network

**Source**: GitHub Gist file dependency network  
**Nodes**: ~3,500+ blocks  
**Links**: ~4,000+ dependencies  
**Schema**:
```json
{
  "nodes": [
    { "id": "...", "user": "...", "description": "...", "language": "..." },
    ...
  ],
  "links": [
    { "source": "blockId1", "target": "blockId2" },
    ...
  ]
}
```

### 7.3 d3-dependencies.csv — D3 Library Dependency Tree

**Source**: D3 v4 module dependency structure  
**Format**: CSV (size,path)  
**Usage**: Demonstrates tree/DAG layouts  
**Conversion to JSON**:
```js
const csvToGraphData = (csv) => {
  const nodes = [], links = [];
  const seen = new Set();
  csv.forEach(row => {
    const parts = row.path.split('/');
    const id = row.path;
    nodes.push({ id, path: row.path, size: row.size });
    if (parts.length > 1) {
      const parent = parts.slice(0, -1).join('/') || 'd3';
      links.push({ source: parent, target: id });
    }
  });
  return { nodes, links };
};
```

---

## 8. Vibe Coding Dataset

The following dataset captures patterns, techniques, and use cases derived from analyzing the 3d-force-graph codebase and its ecosystem. It serves as a comprehensive reference for building applications with this library.

### 8.1 Vibe Coding Pattern Reference

#### Pattern A: The "Load & Explore" Pattern
*Simple data exploration with auto-coloring*

```js
const gData = await fetch('/data/network.json').then(r => r.json());

new ForceGraph3D(document.getElementById('graph'))
  .graphData(gData)
  .nodeAutoColorBy('group')
  .nodeLabel(d => `${d.name || d.id} (${d.group})`)
  .linkDirectionalArrowLength(3)
  .linkDirectionalParticleSpeed(0.01);
```

#### Pattern B: The "Camera Focus" Pattern
*Click node → camera flies to it*

```js
graph.onNodeClick((node, event) => {
  const dist = 200;
  const { x, y, z } = node;
  graph
    .cameraPosition({ z: z + dist }, { x, y, z }, 800)
    .nodeThreeObject(n => n.id === node.id ? highlightSphere(n) : null);
});
```

#### Pattern C: The "Expand on Demand" Pattern
*Lazy-load children when clicking a node*

```js
let graphData = { nodes: rootNodes, links: [] };

graph.onNodeClick((node) => {
  if (node.expanded) return;
  node.expanded = true;
  const children = fetchChildren(node.id);
  graphData.nodes.push(...children);
  graphData.links.push(...children.map(c => ({
    source: node.id, target: c.id
  })));
  graph.graphData(graphData);
});
```

#### Pattern D: The "Live Updating" Pattern
*WebSocket-driven real-time graph updates*

```js
const ws = new WebSocket('wss://...');
ws.onmessage = ({ data }) => {
  const update = JSON.parse(data);
  if (update.type === 'node_added') {
    graphData.nodes.push(update.node);
  } else if (update.type === 'link_added') {
    graphData.links.push(update.link);
  } else if (update.type === 'node_removed') {
    graphData.nodes = graphData.nodes.filter(n => n.id !== update.id);
  }
  graph.graphData(graphData);
};
```

#### Pattern E: The "Custom Force DAG" Pattern
*Hierarchical layout for dependency graphs*

```js
graph
  .dagMode('lr')
  .dagLevelDistance(150)
  .nodeThreeObject(node => {
    const geo = node.leaf
      ? new THREE.ConeGeometry(8, 16, 4)
      : new THREE.BoxGeometry(16, 16, 16);
    return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: node.leaf ? 0x4CAF50 : 0x2196F3
    }));
  })
  .linkDirectionalArrowLength(d => d.source.leaf ? 4 : 0);
```

#### Pattern F: The "Highlight on Hover" Pattern
*Isolate connected subgraph on hover*

```js
let highlightedNodes = new Set();
let highlightedLinks = new Set();

graph
  .nodeHover(node => {
    if (!node) { resetHighlight(); return; }
    const connected = getConnectedNodes(node);
    highlightedNodes = new Set([node.id, ...connected.map(n => n.id)]);
    highlightedLinks = new Set(
      graph.graphData().links
        .filter(l => highlightedNodes.has(l.source.id) && highlightedNodes.has(l.target.id))
        .map((_, i) => i)
    );
    graph.nodeOpacity(n => highlightedNodes.has(n.id) ? 1 : 0.1)
         .linkOpacity(l => highlightedLinks.has(l) ? 0.8 : 0.05);
  })
  .onBackgroundClick(() => resetHighlight());

function resetHighlight() {
  highlightedNodes.clear();
  highlightedLinks.clear();
  graph.nodeOpacity(0.75).linkOpacity(0.2);
}
```

#### Pattern G: The "Performance Dashboard" Pattern
*Display node/link counts, FPS, simulation state*

```js
const stats = document.createElement('div');
stats.style.cssText = 'position:absolute;top:10px;left:10px;color:#fff;font:14px monospace';
document.getElementById('graph').appendChild(stats);

let frameCount = 0, lastTime = performance.now();

graph.onEngineTick(() => {
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    stats.textContent = `Nodes: ${graph.graphData().nodes.length} | ` +
      `Links: ${graph.graphData().links.length} | ` +
      `FPS: ${frameCount}`;
    frameCount = 0;
    lastTime = now;
  }
});
```

### 8.2 API Method Quick Reference

| Category | Methods |
|---|---|
| **Data** | `graphData()`, `jsonUrl()`, `nodeId()`, `linkSource()`, `linkTarget()` |
| **Nodes** | `nodeVal()`, `nodeColor()`, `nodeLabel()`, `nodeThreeObject()`, `nodeAutoColorBy()`, `nodeOpacity()`, `nodeResolution()`, `nodeRelSize()`, `nodeVisibility()`, `nodePositionUpdate()` |
| **Links** | `linkColor()`, `linkLabel()`, `linkWidth()`, `linkCurvature()`, `linkDirectionalArrowLength()`, `linkDirectionalParticles()`, `linkMaterial()`, `linkThreeObject()`, `linkOpacity()` |
| **Camera** | `cameraPosition()`, `zoomToFit()`, `controls()` |
| **Physics** | `forceEngine()`, `d3Force()`, `dagMode()`, `warmupTicks()`, `cooldownTicks()`, `onEngineTick()`, `onEngineStop()` |
| **Interaction** | `onNodeClick()`, `onNodeHover()`, `onNodeDrag()`, `enableNodeDrag()`, `enablePointerInteraction()`, `enableNavigationControls()` |
| **Render** | `pauseAnimation()`, `resumeAnimation()`, `refresh()`, `postProcessingComposer()`, `backgroundColor()` |
| **Scene** | `scene()`, `camera()`, `renderer()`, `lights()` |
| **Utils** | `getGraphBbox()`, `graph2ScreenCoords()`, `screen2GraphCoords()` |

### 8.3 Common Gotchas & Solutions

| Issue | Cause | Solution |
|---|---|---|
| Nodes not visible | Node `val` is 0 or negative | Set `nodeVal(node => node.value || 1)` |
| Links not directional | Need both arrow + particles | Add `linkDirectionalArrowLength` AND `linkDirectionalParticles` |
| Node drag doesn't work | Using ngraph engine | Switch to `forceEngine('d3')` |
| Memory leak on re-mount | Missing cleanup | Call `graph._destructor()` in React useEffect cleanup |
| Performance slow with 10k+ nodes | Too many geometries | Use `forceEngine('ngraph')`, reduce `nodeResolution`, disable `enablePointerInteraction` |
| Camera doesn't reset | Camera was manually moved | Track camera state; don't reset if user has modified |
| DAG throws on cycle | Graph has cycles | Use `dagNodeFilter` to exclude problematic nodes, or handle `onDagError` |
| Arrows pointing wrong direction | Link source/target swapped | Verify `linkSource()` / `linkTarget()` accessors match data |
| CSS labels not showing | z-index conflict | Ensure labels have higher z-index than canvas |

---

## 9. Development Guide

### 9.1 Building from Source

```bash
git clone https://github.com/vasturiano/3d-force-graph.git
cd 3d-force-graph/demo
npm install
npm run build          # production build → dist/
npm run dev            # watch mode for development
```

### 9.2 Running the Demo Locally

```bash
cd 3d-force-graph/operation-commander
npm install
npm run dev            # Vite dev server on http://localhost:5173
```

### 9.3 Creating a New Example

Create `example/my-example/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Example</title>
  <style>body { margin: 0; }</style>
</head>
<body>
  <div id="3d-graph"></div>
  <script src="../../dist/3d-force-graph.min.js"></script>
  <script>
    const Graph = new ForceGraph3D(document.getElementById('3d-graph'), {
      controlType: 'orbit'
    })
    .jsonUrl('../datasets/miserables.json')
    .nodeAutoColorBy('group')
    .nodeLabel('id');

    Graph.onNodeClick(node => {
      Graph.cameraPosition(
        { z: node.z + 200 },
        { x: node.x, y: node.y, z: node.z },
        1000
      );
    });
  </script>
</body>
</html>
```

### 9.4 Package.json Scripts (demo)

```json
{
  "scripts": {
    "build": "rimraf dist && rollup -c",
    "dev": "rollup -w -c rollup.config.dev.js",
    "prepare": "npm run build"
  }
}
```

### 9.5 Related Projects in the Ecosystem

| Project | Description |
|---|---|
| [force-graph](https://github.com/vasturiano/force-graph) | 2D canvas version |
| [3d-force-graph-vr](https://github.com/vasturiano/3d-force-graph-vr) | VR headset version |
| [3d-force-graph-ar](https://github.com/vasturiano/3d-force-graph-ar) | AR/WebXR version |
| [react-force-graph](https://github.com/vasturiano/react-force-graph) | React component bindings |
| [d3-force-3d](https://github.com/vasturiano/d3-force-3d) | 3D force simulation (fork of d3-force) |
| [three-forcegraph](https://github.com/vasturiano/three-forcegraph) | ThreeJS graph rendering engine |
| [three-render-objects](https://github.com/vasturiano/three-render-objects) | ThreeJS scene renderer |
| [kapsule](https://github.com/vasturiano/kapsule) | Stateful component pattern |

---

*Last updated: 2026-06-07 | Source: [vasturiano/3d-force-graph](https://github.com/vasturiano/3d-force-graph) v1.80.0*
