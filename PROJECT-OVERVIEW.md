# 3D Force-Graph — Project Overview

## Commander CoT | 作战计划思维链

> 整体指挥官智能体。基于 3d-force-graph (vasturiano) 技术栈，实现作战计划思维链（Chain-of-Thought）可视化系统。

---

## Project Structure

```
3d-force-graph/
├── DOCUMENTATION.md           # 完整API文档、架构分析、使用指南
├── DEVELOPMENT-EXAMPLES.md    # 8个生产级开发示例
├── vibe-coding-dataset.json  # Vibe Coding数据集（22个模式）
├── commander-cot-dataset.json # 指挥官CoT专用数据集（21项分析+仿真）
│
├── demo/                     # 3d-force-graph 官方源码
│   ├── src/
│   │   ├── 3d-force-graph.js    # 核心库（Kapsule架构）
│   │   ├── kapsule-link.js       # 组件桥接模式
│   │   └── index.d.ts            # TypeScript定义
│   ├── dist/                       # 编译产物
│   └── example/                    # 30+ 示例页面
│
├── operation-commander/       # React + Vite 应用（主项目）
│   ├── src/
│   │   ├── App.jsx              # React Router 路由
│   │   ├── components/
│   │   │   ├── Layout.jsx        # 全局布局 + 顶部导航
│   │   │   └── ForceGraph3DComponent.jsx  # 3D图组件封装
│   │   └── pages/
│   │       ├── Dashboard.jsx      # 首页
│   │       ├── Upload.jsx         # 方案上传
│   │       ├── SimulationRun.jsx  # 实时仿真
│   │       └── nodes/
│   │           ├── IntentUnderstanding.jsx   # 意图理解 (step 1)
│   │           ├── SituationAssessment.jsx   # 情况判断 (step 2)
│   │           ├── ConceptFormation.jsx      # 形成构想 (step 3)
│   │           ├── PlanDevelopment.jsx       # 制定计划 (step 4)
│   │           ├── SimulationTrial.jsx       # 仿真推演 (step 5)
│   │           └── EffectEvaluation.jsx     # 效果评估 (step 6)
│   ├── public/datasets/           # 图数据集
│   │   ├── blocks.json            # GitHub Gist网络 (~3500节点)
│   │   ├── miserables.json        # Les Misérables人物关系 (77节点)
│   │   └── d3-dependencies.csv   # D3模块依赖树
│   └── package.json
│
└── prototype/
    └── datasets/                  # 实验性数据集
```

---

## Technology Stack

| Layer | Technology | Role |
|---|---|---|
| 3D Rendering | ThreeJS (WebGL) | GPU-accelerated graph rendering |
| Physics Engine | d3-force-3d / ngraph | Force-directed layout computation |
| UI Component | three-forcegraph | Core graph logic + rendering |
| Scene Manager | three-render-objects | Camera, controls, lights, post-processing |
| Component Pattern | Kapsule | Stateful reactive component framework |
| Frontend Framework | React 19 + Vite | UI layer |
| Routing | react-router-dom v7 | Multi-page navigation |
| Build Tool | Rollup (core) / Vite (app) | Bundling |

---

## Commander CoT Workflow

```
上传方案 → 意图理解(21项) → 情况判断 → 形成构想(3选1) → 制定计划 → 仿真推演 → 效果评估
     │              │                  │              │            │            │
     ▼              ▼                  ▼              ▼            ▼            ▼
  Upload      IntentUnderstand   SituationAssess  ConceptForm  PlanDev     SimulationTrial
    page       DAG+21 items      DAG+10 items    3方案卡片    阶段列表     推演参数
                                                            PlanDev      SimulationRun
                                                                      实时3D可视化
```

### 6 Nodes Detail

| # | Node | Color | 3D Pattern | Data |
|---|---|---|---|---|
| 1 | 意图理解 | `#4a9eff` | DAG lr + 6 categories | 21 items (mission/enemy/terrain/weather/time/resource) |
| 2 | 情况判断 | `#34d399` | Force graph | 10 assessment items, miserables.json |
| 3 | 形成构想 | `#fbbf24` | Card selection | 3 concept options (A/B/C) with pros/cons/scores |
| 4 | 制定计划 | `#f97316` | Split panel | 4 phases with checkboxes, blocks.json |
| 5 | 仿真推演 | `#a78bfa` | Full 3D + live | Real-time simulation, blocks.json |
| 6 | 效果评估 | `#f43f5e` | Metrics grid | 6 KPIs, summary, bloom effect |

---

## Key Files Reference

### Core Library (`demo/src/3d-force-graph.js`)

- **Kapsule bridge**: `kapsule-link.js` proxies props/methods between outer ForceGraph3D and inner `ThreeForceGraph` / `ThreeRenderObjects`
- **Animation loop**: `requestAnimationFrame` calls `forceGraph.tickFrame()` + `renderObjs.tick()`
- **Node drag**: Uses ThreeJS `DragControls` with `fx/fy/fz` fixed positions (d3 engine only)
- **Links**: Default is `THREE.Line` (constant 1px), width > 0 uses `CylinderGeometry`
- **Camera**: Auto-positions based on node count: `z = cbrt(N) * 170`

### React Component (`operation-commander/src/components/ForceGraph3DComponent.jsx`)

- Wraps `three-forcegraph` (not the full `3d-force-graph` lib)
- Uses `ForceGraph3D({ three: THREE })` factory pattern
- Properly cleans up with `_destructor()` in useEffect
- Supports props: `data`, `jsonUrl`, `nodeAutoColorBy`, `nodeLabel`, `backgroundColor`, etc.

---

## Available Scripts

```bash
# Run the React app
cd operation-commander && npm run dev

# Build the core library
cd demo && npm install && npm run build

# The React app is already built in operation-commander/dist/
```

---

## Core 3D-Force-Graph API Quick Reference

```js
// Initialization
const graph = new ForceGraph3D(container, { controlType: 'orbit' });

// Data
graph.graphData({ nodes, links });
graph.jsonUrl('/data.json');
graph.nodeId('uid').linkSource('src').linkTarget('dst');

// Nodes
graph.nodeVal(n => n.value).nodeColor(n => n.color)
  .nodeLabel(n => n.name).nodeAutoColorBy('group')
  .nodeThreeObject(n => new THREE.Mesh(...));

// Links
graph.linkWidth(l => l.weight).linkColor(l => l.color)
  .linkDirectionalArrowLength(4).linkDirectionalParticles(3)
  .linkCurvature(0.5);

// Physics
graph.forceEngine('d3').dagMode('lr').warmupTicks(100)
  .d3Force('charge', d3.forceManyBody().strength(-200));

// Camera & Render
graph.cameraPosition({ z: 500 }, { z: 0 }, 1000);
graph.zoomToFit(1000, 50);
graph.postProcessingComposer();  // for bloom, etc.
graph.pauseAnimation().resumeAnimation();

// Interaction
graph.onNodeClick((node, event) => {...})
  .onNodeHover((node, prev) => {...})
  .onNodeDragEnd(node => { node.fx = node.x; });

// Utilities
graph.graph2ScreenCoords(x, y, z);
graph.screen2GraphCoords(sx, sy, dist);
graph.getGraphBbox();

// React cleanup
graph._destructor();
```

---

## Datasets

| Dataset | Nodes | Links | Source | Used In |
|---|---|---|---|---|
| `miserables.json` | 77 | 254 | Les Misérables co-occurrence | SituationAssessment |
| `blocks.json` | ~3500 | ~4000 | GitHub Gist blocks | IntentUnderstanding, SimulationRun, PlanDevelopment |
| `d3-dependencies.csv` | 464 | 463 | D3 module tree | N/A (CSV format) |

---

## Files Created by This Analysis

| File | Purpose |
|---|---|
| `DOCUMENTATION.md` | Complete API reference, architecture, examples catalog, React guide |
| `DEVELOPMENT-EXAMPLES.md` | 8 production-ready code examples |
| `vibe-coding-dataset.json` | 22 coding patterns + techniques + use cases + troubleshooting |
| `commander-cot-dataset.json` | Commander CoT specific patterns + 21-item analysis + sample operation data |
| `PROJECT-OVERVIEW.md` | This file — project summary and quick reference |
