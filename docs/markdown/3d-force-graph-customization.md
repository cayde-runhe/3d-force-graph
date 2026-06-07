# 3D Force Graph — 完全自定义改造指南

> 基于源码架构的 3 个层次改造路径

---

## 一、源码架构先搞清楚

```
3d-force-graph.js  (454行，主入口)
  ├── ThreeForceGraph (three-forcegraph npm 包)
  │     → 物理引擎（d3-force-3d / ngraph）+ 创建节点/链路 ThreeJS 物体
  ├── ThreeRenderObjects (three-render-objects npm 包)
  │     → WebGLRenderer + PerspectiveCamera + OrbitControls + 光照 + 后处理
  └── DragControls (ThreeJS 原生)
        → 节点拖拽交互

stateInit → 创建 forceGraph + renderObjs
init → 配置拖拽、hover、click 事件，kick-off 渲染循环
_animationCycle → 每帧调用 forceGraph.tickFrame() + renderObjs.tick()
```

库的本质：**两层 Kapsule 状态组件**，节点/链路的 3D 物体由 `three-forcegraph` 包创建。完全自定义有 3 条路：

---

## 二、路径 1：API 层定制（不改源码，最常用）

通过 `nodeThreeObject` / `linkThreeObject` 塞入任意 ThreeJS 物体，库负责渲染循环和物理。

### 2.1 加载 GLTF 3D 模型

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

graph
  .nodeThreeObject((node) => {
    if (!node.modelUrl) return null; // 没有模型则用默认球体

    // 同步返回占位（异步加载在回调里处理）
    const group = new THREE.Group();
    group.__asyncModel = true;

    loader.load(node.modelUrl, (gltf) => {
      const model = gltf.scene;

      // 自动缩放适配
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const scale = 10 / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(scale);

      // 居中
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center.clone().multiplyScalar(scale));

      group.add(model);
      group.__asyncModel = false;
    });

    return group;
  })
  .nodeThreeObjectExtend(false);
```

### 2.2 带骨骼动画的模型

```js
const mixers = [];

graph
  .nodeThreeObject((node) => {
    if (!node.animModelUrl) return null;

    const group = new THREE.Group();
    loader.load(node.animModelUrl, (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(node.scale || 5);
      group.add(model);

      if (gltf.animations.length) {
        const mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();
        mixers.push(mixer);
      }
    });
    return group;
  })
  .onEngineTick(() => {
    mixers.forEach(m => m.update(0.016));
  });
```

### 2.3 合成节点（模型 + 光晕 + 标签）

```js
graph.nodeThreeObject((node) => {
  const group = new THREE.Group();

  // 底层 3D 模型
  const model = createModelFromType(node.type);
  group.add(model);

  // 叠加光晕球
  const glowGeo = new THREE.SphereGeometry(node.size * 1.5, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({
    color: node.color,
    transparent: true,
    opacity: 0.15
  });
  group.add(new THREE.Mesh(glowGeo, glowMat));

  // Canvas 文字标签（作为子节点，跟随父节点移动）
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(node.name, 128, 40);
  const tex = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sprite.position.set(0, node.size * 2, 0);
  sprite.scale.set(40, 10);
  group.add(sprite);

  return group;
}).nodeThreeObjectExtend(false);
```

### 2.4 自定义链路（曲线管道）

```js
graph.linkThreeObject((link) => {
  const start = new THREE.Vector3(link.source.x, link.source.y, link.source.z);
  const end   = new THREE.Vector3(link.target.x, link.target.y, link.target.z);
  const mid   = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 15, 0));

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.5, 8, false);
  const tubeMat = new THREE.MeshPhongMaterial({
    color: link.color || '#00ffff',
    emissive: link.color || '#00ffff',
    emissiveIntensity: 0.3
  });
  return new THREE.Mesh(tubeGeo, tubeMat);
});
```

### 2.5 节点随物理移动但有额外动画

```js
graph.nodePositionUpdate((threeObj, coords, nodeData) => {
  // 在库的默认位置更新之后运行
  // 让节点绕自己旋转
  threeObj.rotation.y += 0.01;
  threeObj.rotation.x += 0.005;
  // 返回 true 则跳过库内置的位置更新（自己接管）
  return false;
});
```

### 2.6 粒子特效（用 Canvas 贴图）

```js
const particleTex = createParticleTexture(); // 128x128 发光圆

graph.nodeThreeObject((node) => {
  const geo = new THREE.BufferGeometry();
  const count = node.particleCount || 50;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i*3]   = (Math.random()-0.5) * 20;
    positions[i*3+1] = (Math.random()-0.5) * 20;
    positions[i*3+2] = (Math.random()-0.5) * 20;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    size: 3,
    map: particleTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  return new THREE.Points(geo, mat);
});
```

---

## 三、路径 2：源码 Fork（改核心逻辑）

直接改 `demo/src/3d-force-graph.js`，适合需要改物理节点创建、拖拽行为、渲染循环的场景。

### 3.1 在 stateInit 里拦截节点/链路创建

```js
stateInit: ({ controlType, rendererConfig, extraRenderers }) => {
  const forceGraph = new ThreeForceGraph();

  // 在 forceGraph 初始化时就注入自定义函数
  forceGraph
    .nodeThreeObject(d => createMyCustomNode(d))
    .linkThreeObject(d => createMyCustomLink(d))
    .nodePositionUpdate((obj, coords, node) => {
      // 自定义每帧位置更新
      obj.rotation.z = node.angle || 0;
      return false; // false = 继续执行库的默认更新
    });

  return {
    forceGraph,
    renderObjs: ThreeRenderObjects({ controlType, rendererConfig, extraRenderers })
      .lights([
        new three.AmbientLight(0x404080, 1.0),
        new three.DirectionalLight(0xffffff, 0.8),
        new three.PointLight(0xff4444, 1.5, 50), // 加点光源
      ])
  };
},
```

### 3.2 在 _animationCycle 里注入自定义渲染逻辑

```js
// 在 methods 中的 _animationCycle 加入
_animationCycle(state) {
  if (state.enablePointerInteraction) {
    renderer.domElement.style.cursor = null;
  }

  // 帧前：物理 tick
  state.forceGraph.tickFrame();

  // === 插入你的自定义逻辑 ===
  // 例如：更新所有带动画标签的节点
  state.graphData.nodes.forEach(node => {
    if (node.__threeObj?.__labelSprite) {
      node.__threeObj.__labelSprite.lookAt(state.renderObjs.camera().position);
    }
  });

  // 帧后：渲染
  state.renderObjs.tick();
  state.animationFrameRequestId = requestAnimationFrame(this._animationCycle);
}
```

### 3.3 改拖拽行为（改 init 里的 DragControls）

把拖拽时改成：记录拖拽路径、触发约束条件计算、发送自定义事件等。

核心代码在 `init` 行 258-365：

```js
// 改 dragstart 事件 — 比如记录初始时间
dragControls.addEventListener('dragstart', function (event) {
  // ... 原有的锁定节点逻辑 ...
  event.object.__dragStartTime = Date.now();
  event.object.__dragPath = [];
});

// 改 drag 事件 — 比如收集路径点
dragControls.addEventListener('drag', function (event) {
  // ... 原有的位置更新逻辑 ...
  event.object.__dragPath.push({
    x: node.x, y: node.y, z: node.z,
    t: Date.now() - event.object.__dragStartTime
  });
  state.onNodeDrag(node, translate);
});

// 改 dragend 事件 — 比如计算拖拽速度、触发事件
dragControls.addEventListener('dragend', function (event) {
  const dragDuration = Date.now() - event.object.__dragStartTime;
  const path = event.object.__dragPath;
  const velocity = calcVelocity(path); // 你自己写的速度计算
  state.onNodeDragEnd(node, { translate, velocity, path });
  delete event.object.__dragStartTime;
  delete event.object.__dragPath;
});
```

### 3.4 改渲染器配置

```js
// 在构造函数参数中加
new ForceGraph3D(domElement, {
  rendererConfig: {
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',  // 高性能模式
    logarithmicDepthBuffer: true,         // 深度缓冲，解决大场景闪烁
  }
})
```

### 3.5 增加新的 Props / Methods

```js
// 在 props 中加一个新的配置项
props: {
  // ... 现有 props ...
  myCustomSpeed: { default: 1.0, triggerUpdate: false },
},

// 在 methods 中加一个新方法
methods: {
  // ... 现有 methods ...
  setNodeHighlight: function(state, nodeId, on) {
    const node = state.graphData.nodes.find(n => n.id === nodeId);
    if (node?.__threeObj) {
      node.__threeObj.traverse(child => {
        if (child.isMesh) {
          child.material.emissive = on
            ? new THREE.Color(0xffaa00)
            : new THREE.Color(0x000000);
        }
      });
    }
    return this;
  },
}
```

---

## 四、路径 3：底层接管（完全自绘）

通过 `scene()` / `camera()` / `renderer()` / `controls()` 把内部 ThreeJS 组件全部拿出来，自己接管渲染循环。

### 4.1 暂停库渲染，自己驱动

```js
const graph = ForceGraph3D()(domElement);
const scene = graph.scene();
const camera = graph.camera();
const renderer = graph.renderer();
const controls = graph.controls();

// 停掉库的渲染循环
graph.pauseAnimation();

// 你的渲染循环
function animate() {
  requestAnimationFrame(animate);

  // 让物理跑
  graph.forceGraph?.tickFrame?.();

  // 你的自定义渲染
  renderer.setClearColor(0x000011);
  renderer.clear();
  renderer.render(scene, camera);

  controls.update();
}
animate();
```

### 4.2 替换整个渲染器

```js
const graph = ForceGraph3D()(domElement);
const oldRenderer = graph.renderer();

// 创建新的渲染器（比如要 CSG 效果）
const newRenderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
newRenderer.setSize(domElement.clientWidth, domElement.clientHeight);

// 替换 canvas
const newCanvas = newRenderer.domElement;
domElement.querySelector('div > div').appendChild(newCanvas);
oldRenderer.dispose();

// 更新 scene 和 camera 引用
const scene = graph.scene();
const camera = graph.camera();
const controls = graph.controls();

// 你的渲染循环
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}
animate();
```

### 4.3 接入自定义后处理

```js
import { EffectComposer, BloomPass, UnrealBloomPass } from 'three/examples/jsm/postprocessing/';

const graph = ForceGraph3D()(domElement);

// 获取 composer 并添加更多效果
const composer = graph.postProcessingComposer();

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // strength
  0.4,  // radius
  0.85  // threshold
);
composer.addPass(bloomPass);

// 调整渲染循环使用 composer
const scene = graph.scene();
const camera = graph.camera();
graph.pauseAnimation();

function animate() {
  requestAnimationFrame(animate);
  graph.forceGraph?.tickFrame?.();
  composer.render();
  graph.controls()?.update();
}
animate();
```

---

## 五、改造层次对照表

| 改造程度 | 改哪里 | 能做到什么 |
|:---|:---|:---|
| **API 级** | `nodeThreeObject` / `linkThreeObject` / `onEngineTick` | GLTF 模型、图片精灵、粒子特效、Canvas 贴图、合成节点、自定义曲线链路 |
| **源码 fork** | `3d-force-graph.js` 的 `stateInit` / `_animationCycle` / `init` | 替换节点/链路创建逻辑、改拖拽行为、增删 Props/Methods、改光照、改渲染循环 |
| **底层接管** | `scene()` / `camera()` / `renderer()` + `pauseAnimation()` | 完全自绘渲染、替换渲染器、自己写后处理 pipeline、接入外部 3D 场景 |

**最推荐的路径**：API 级 + 源码 fork 结合——用 `nodeThreeObject` 做可视化，用 `onEngineTick` 做动画更新，有需要再 fork 改 `stateInit` 里的初始化逻辑。路径 3 基本等于重写，不推荐除非要彻底换一个渲染引擎。

---

## 六、构建与调试

```bash
# 源码在 demo/src/，构建输出到 demo/dist/
cd demo
npm install
npm run build        # 构建 ESM + UMD

# 开发时直接用 dist 文件（debug）
# <script src="../../dist/3d-force-graph.js"></script>

# 调试：在浏览器 DevTools 中
graph = ForceGraph3D()(document.getElementById('graph'))
graph.scene()        # 拿到场景，看节点树
graph.renderer()      # 拿到渲染器
graph.controls()     # 拿到 OrbitControls
graph.forceGraph     # 拿到内部 ThreeForceGraph 实例
```
