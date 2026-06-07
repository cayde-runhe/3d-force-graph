# Operation Commander — 作战计划思维链

> 整体指挥官智能体 · Intelligence Agent for Operation Planning

## 系统架构

本系统基于**思维链（Chain-of-Thought, CoT）**框架，构建了一个完整的指挥官智能体，模拟人类指挥官制定作战计划时的认知过程。

## 思维链节点（Thinking Chain）

系统由 **6 个核心思维节点** 构成，顺序执行：

```
意图理解 → 情况判断 → 形成构想 → 制定计划 → 仿真推演 → 效果评估
```

| # | 节点 | 英文 | 说明 |
|---|------|------|------|
| 01 | 意图理解 | Intent Understanding | 从作战方案文本中提取并明确 21 项要素 |
| 02 | 情况判断 | Situation Assessment | 敌我态势全面分析，10 项关键判断 |
| 03 | 形成构想 | Concept Formation | 基于情况判断，形成 3 个行动构想方案并选择 |
| 04 | 制定计划 | Plan Development | 选定方案，细化为 4 阶段详细作战计划 |
| 05 | 仿真推演 | Simulation Trial | 在虚拟环境中验证方案可行性与风险 |
| 06 | 效果评估 | Effect Evaluation | 综合评估各项指标，输出决策建议 |

## 指挥官智能体工作流

```
上传作战方案文本
    ↓
意图理解（21项明确）
    ↓
情况判断（敌我态势）
    ↓
形成构想（生成 3 个方案）
    ↓ 选择 1 个方案
制定详细计划
    ↓
仿真推演（虚拟验证）
    ↓
效果评估（综合输出）
    ↓
决策输出
```

## 与 AOD 的关系

**AOD**（Agentic Oriented Design，智能体导向设计）为本系统提供架构方法论：

- **意图理解** 对应 AOD 的意图解析层
- **情况判断** 对应 AOD 的环境感知层
- **形成构想** 对应 AOD 的方案生成（Plan Generation）
- **制定计划** 对应 AOD 的行动计划（Action Plan）
- **仿真推演** 对应 AOD 的模拟验证层
- **效果评估** 对应 AOD 的反馈闭环（Feedback Loop）

AOD 强调"**意图驱动的自主规划**"，本系统完整实现了从原始作战意图到可执行作战计划的端到端链路。

## 技术栈

- **React 19** + Vite 5
- **three-forcegraph** — 3D 力导向图谱可视化
- **React Router v7** — 页面路由
- **three.js** — WebGL 3D 渲染

## 目录结构

```
operation-commander/
├── public/
│   └── datasets/
│       ├── blocks.json          ← GitHub Gist 网络图（知识图谱）
│       ├── miserables.json       ← Les Misérables 人物关系图
│       └── d3-dependencies.csv  ← D3 依赖树
├── src/
│   ├── components/
│   │   ├── ForceGraph3DComponent.jsx  ← 3D 图谱组件（three-forcegraph 封装）
│   │   └── Layout.jsx                ← 全局布局
│   └── pages/
│       ├── Dashboard.jsx        ← 首页：6 节点总览 + 入口
│       ├── Upload.jsx           ← 作战方案上传
│       ├── SimulationRun.jsx     ← 仿真推演运行视图
│       └── nodes/
│           ├── IntentUnderstanding.jsx  ← 意图理解（21项）
│           ├── SituationAssessment.jsx  ← 情况判断（10项）
│           ├── ConceptFormation.jsx     ← 形成构想（3方案）
│           ├── PlanDevelopment.jsx       ← 制定计划（4阶段）
│           ├── SimulationTrial.jsx       ← 仿真推演
│           └── EffectEvaluation.jsx      ← 效果评估
└── dist/                        ← 生产构建产物
```

## 运行

```bash
cd operation-commander
npm install
npm run dev      # 开发模式
npm run build    # 生产构建
```

## 页面路由

| 路径 | 页面 |
|------|------|
| `/` | 首页：思维链 6 节点总览 + 上传入口 |
| `/upload` | 上传作战方案 |
| `/nodes/intent-understanding` | 意图理解 |
| `/nodes/situation-assessment` | 情况判断 |
| `/nodes/concept-formation` | 形成构想 |
| `/nodes/plan-development` | 制定计划 |
| `/simulation-run` | 仿真推演运行 |
| `/nodes/effect-evaluation` | 效果评估 |
