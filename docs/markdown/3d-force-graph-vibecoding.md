# 3D Force Graph — Vibecoding Cheatsheet

> 快速参考 · 基于 [3d-force-graph](https://github.com/vasturiano/3d-force-graph) v2.x

---

## 安装 / Install

```bash
npm install 3d-force-graph
```

CDN（直接 script 标签使用）：

```html
<script src="//cdn.jsdelivr.net/npm/3d-force-graph"></script>
```

---

## 最简示例 / Minimal

```js
import ForceGraph3D from '3d-force-graph';

const myGraph = ForceGraph3D()
  (document.getElementById('graph'))       // 挂载 DOM 元素
  .graphData({
    nodes: [
      { id: 'A', name: 'Alice' },
      { id: 'B', name: 'Bob' },
      { id: 'C', name: 'Carol' }
    ],
    links: [
      { source: 'A', target: 'B' },
      { source: 'B', target: 'C' }
    ]
  });
```

---

## 数据格式 / Data Format

```json
{
  "nodes": [
    { "id": "1", "name": "节点名", "val": 1, "color": "#ff6b6b" }
  ],
  "links": [
    { "source": "1", "target": "2", "color": "#aaa", "width": 1 }
  ]
}
```

| 字段 | 说明 | 默认值 |
|:---|:---|:---|
| `id` | 节点唯一标识 | `id` |
| `val` | 节点大小（影响球体体积） | `val` |
| `color` | 节点/链路颜色 | `color` |
| `name` | 悬停标签文字 | `name` |

> 可通过 `nodeId()` / `linkSource()` / `linkTarget()` 自定义 ID 字段名。

---

## 常用配置链 / Common Config Chains

| 需求 | 配置方法 |
|---|---|
| 背景色 | `.backgroundColor('#0d1117')` |
| 节点大小按 `val` 缩放 | `.nodeVal('val')` |
| 鼠标悬停显示标签 | `.nodeLabel(d => d.name)` |
| 节点颜色（函数） | `.nodeColor(d => d.group === 'A' ? 'red' : 'blue')` |
| 按字段自动分组着色 | `.nodeAutoColorBy('group')` |
| 隐藏某节点 | `.nodeVisibility(d => d.active !== false)` |
| 链路颜色 | `.linkColor(d => d.type === 'friend' ? 'green' : 'gray')` |
| 链路粗细 | `.linkWidth(d => d.weight)` |
| 链路箭头（表示方向） | `.linkDirectionalArrowLength(6)` |
| 链路粒子流 | `.linkDirectionalParticles(3)` |
| 曲线 + 自环 | `.linkCurvature(0.5)` |
| DAG 定向布局 | `.dagMode('td')` / `'lr'` / `'radialout'` |
| 切换物理引擎（性能） | `.forceEngine('ngraph')` |
| 调节点间斥力 | `.d3Force('charge').strength(-200)` |

---

## 自定义 3D 物体 / Custom 3D Objects

```js
import * as THREE from 'three';

myGraph
  .nodeThreeObject(d => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(8),
      new THREE.MeshNormalMaterial({ wireframe: true })
    );
    return mesh;
  })
  .nodeThreeObjectExtend(true);   // true = 叠加在默认球体上；false = 替换
```

同理链路：

```js
.linkThreeObject(d => {
  const geo = new THREE.CylinderGeometry(0.5, 0.5, 10, 8);
  const mat = new THREE.MeshBasicMaterial({ color: d.color });
  return new THREE.Mesh(geo, mat);
})
```

---

## 交互回调 / Interactions

```js
myGraph
  .onNodeClick((node, event) => {
    console.log('clicked', node);
    // 平滑聚焦节点
    myGraph.cameraPosition(
      { x: node.x, y: node.y, z: node.z + 50 },
      { x: 0, y: 0, z: 0 },
      300
    );
  })
  .onNodeHover(node => {
    document.body.style.cursor = node ? 'pointer' : 'default';
  })
  .onNodeDragEnd(node => {
    // 固定拖拽后的位置
    node.fx = node.x;
    node.fy = node.y;
    node.fz = node.z;
  });
```

---

## 摄像机控制 / Camera

```js
myGraph
  .zoomToFit(400)                          // 自动缩放适应全部节点
  .cameraPosition({ z: 300 }, null, 1000)   // 平滑移动镜头
  .controls()                               // 访问 ThreeJS OrbitControls
```

---

## 动态数据 / Dynamic Updates

```js
// 直接替换整图数据
myGraph.graphData(newData);

// 增量更新参考：https://bl.ocks.org/vasturiano/2f602ea6c51c664c29ec56cbe2d6a5f6
```

---

## 性能优化 / Performance

```js
myGraph
  .enablePointerInteraction(false)  // 禁用悬停检测，FPS 大幅提升
  .nodeResolution(6)               // 降低球体精度（默认 8）
  .linkResolution(4)               // 降低链路精度
  .warmupTicks(100)                // 预计算布局再渲染
  .cooldownTicks(1000)            // 渲染 N 帧后冻结引擎
  .pauseAnimation()               // 手动暂停渲染
  .resumeAnimation()              // 恢复渲染
```

---

## 后处理 / Post-Processing

```js
import { EffectComposer, BloomPass } from 'three/examples/jsm/postprocessing/';

const composer = myGraph.postProcessingComposer();
const bloomPass = new BloomPass();
composer.addPass(bloomPass);
```

---

## 场景扩展 / Extend Scene

```js
myGraph.scene().add(new THREE.AmbientLight(0x222222));
myGraph.camera();    // ThreeJS Camera
myGraph.renderer();  // WebGLRenderer
myGraph.scene();     // ThreeJS Scene
```

---

## 完整配置速查表 / Full Config Reference

| 分类 | 方法 | 说明 |
|:---|:---|:---|
| **数据** | `graphData()` | 图数据 `{nodes, links}` |
| | `jsonUrl()` | 从 URL 加载 JSON |
| **布局** | `dagMode('td')` | DAG 定向（td/lr/bu/rl/zout/zin/radialout/radialin） |
| | `numDimensions(2)` | 2D 布局 |
| | `warmupTicks()` | 预热帧数 |
| **节点** | `nodeVal()` | 大小 |
| | `nodeColor()` | 颜色 |
| | `nodeLabel()` | 标签 |
| | `nodeVisibility()` | 显示/隐藏 |
| | `nodeThreeObject()` | 自定义 3D 物体 |
| | `nodeOpacity()` | 透明度 |
| **链路** | `linkColor()` | 颜色 |
| | `linkWidth()` | 粗细 |
| | `linkCurvature()` | 曲率 |
| | `linkDirectionalArrowLength()` | 箭头长度 |
| | `linkDirectionalParticles()` | 粒子数 |
| | `linkLabel()` | 链路标签 |
| **渲染** | `backgroundColor()` | 背景色 |
| | `showNavInfo()` | 显示导航提示 |
| | `pauseAnimation()` / `resumeAnimation()` | 暂停/恢复 |
| | `zoomToFit()` | 适应画布 |
| | `cameraPosition()` | 镜头位置 |
| | `postProcessingComposer()` | 后处理 |
| **物理** | `forceEngine('ngraph')` | 切换引擎 |
| | `d3Force('charge').strength()` | 调斥力 |
| | `d3ReheatSimulation()` | 重热模拟 |
| **交互** | `onNodeClick()` | 节点点击 |
| | `onNodeHover()` | 节点悬停 |
| | `onNodeDragEnd()` | 拖拽结束 |
| | `onLinkClick()` | 链路点击 |
| | `enablePointerInteraction()` | 鼠标交互开关 |
| | `enableNodeDrag()` | 允许拖节点 |
| **工具** | `getGraphBbox()` | 包围盒 |
| | `graph2ScreenCoords()` | 坐标转换 |
| | `screen2GraphCoords()` | 坐标转换 |
