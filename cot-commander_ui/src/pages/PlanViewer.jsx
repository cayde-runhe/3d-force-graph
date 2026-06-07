import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph3DComponent from '../components/ForceGraph3DComponent';

const PLAN_DATA = {
  standard: {
    name: '标准攻防战',
    plan: '集中优势兵力对A区域实施正面突击，同时以侧翼部队迂回包抄。全程分四阶段推进：先期电子压制，主力正面强攻，纵深快速穿插，结束阶段稳固阵地并撤离。',
    concept: '方案B（侧翼迂回）：以部分兵力牵制正面，集中主力从侧翼薄弱环节实施包围切割，风险可控，战效比最高。',
    metrics: { complete: 87, casualty: 12, destroy: 74, coord: 91 },
    conclusion: '方案可行，建议按计划执行，加强侧翼掩护以应对敌方反击。',
    warnings: '第三阶段存在3处风险点，需细化应急预案。',
  },
  envelop: {
    name: '围困阻击战',
    plan: '首先切断敌方补给线，形成包围圈后逐步压缩敌方活动空间，迫使其在消耗战中处于劣势，最终发起决定性突击。',
    concept: '方案A（围困方案）：利用地形优势建立封锁线，断敌补给，稳扎稳打，逐步削弱敌方战斗力。',
    metrics: { complete: 82, casualty: 9, destroy: 68, coord: 95 },
    conclusion: '方案稳妥，伤亡可控，但耗时较长，需确保补给线自身安全。',
    warnings: '补给线较长，存在被敌方袭扰的风险，建议加强护卫力量。',
  },
  network: {
    name: '网络中心战',
    plan: '以电子对抗开路，瘫痪敌方C4ISR系统，再以精确制导武器逐点摧毁关键节点，心理战与火力打击协同推进。',
    concept: '方案C（精确打击）：信息化主导作战，精确可控，我方伤亡极低，可渐进式升级。',
    metrics: { complete: 91, casualty: 4, destroy: 85, coord: 78 },
    conclusion: '方案技术含量高，效果显著，但对装备保障和情报实时性要求极高。',
    warnings: '电子对抗环节若受干扰，整个作战链条可能中断，需备份方案。',
  },
};

const PLANETS = [
  { id: 0, label: '全景作战方案', color: '#FFFFFF', range: '全视图' },
  { id: 1, label: '意图理解',      color: '#FFD700', range: 'AOP-001~021' },
  { id: 2, label: '情况判断',      color: '#4A90D9', range: 'AOP-022~035' },
  { id: 3, label: '形成构想',      color: '#44DD88', range: 'AOP-036~048' },
  { id: 4, label: '制定计划',      color: '#FF9944', range: 'AOP-049~066' },
  { id: 5, label: '仿真推演',      color: '#AA55FF', range: 'AOP-067~081' },
  { id: 6, label: '效果评估',      color: '#44DDFF', range: 'AOP-082~088' },
];

export default function PlanViewer() {
  const navigate = useNavigate();
  const planId = sessionStorage.getItem('selectedPlan') || 'standard';
  const plan = PLAN_DATA[planId];

  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [activeView, setActiveView] = useState(0);

  useEffect(() => {
    fetch('/datasets/galaxy-6planet-88aop.json')
      .then(res => res.json())
      .then(data => setGraphData(data))
      .catch(err => console.error('Failed to load galaxy graph data:', err));
  }, []);

  const handleViewChange = useCallback((viewId) => {
    setActiveView(viewId);
  }, []);

  const handleNodeClick = useCallback((node) => {
    if (!node) return;
    if (node.layer === 0) {
      sessionStorage.setItem('selectedStep', node.id);
    }
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', background: '#050510',
      color: '#e0e0e0', fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        padding: '0.8rem 1.5rem',
        borderBottom: '1px solid #1a1a2e',
        display: 'flex', alignItems: 'center', gap: '1rem',
        background: '#08080f', flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.35rem 0.9rem',
            background: '#111122', color: '#888',
            border: '1px solid #333', borderRadius: 6,
            cursor: 'pointer', fontSize: '0.82rem',
          }}
        >
          返回
        </button>
        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
          {plan.name}
        </span>
        <span style={{ color: '#444', fontSize: '0.78rem' }}>
          CoT x AOD 宇宙星云作战视图
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
          <span style={{ color: '#34d399', fontSize: '0.8rem' }}>完成率 {plan.metrics.complete}%</span>
          <span style={{ color: '#f43f5e', fontSize: '0.8rem' }}>伤亡 {plan.metrics.casualty}%</span>
          <span style={{ color: '#4a9eff', fontSize: '0.8rem' }}>毁伤 {plan.metrics.destroy}%</span>
          <span style={{ color: '#a78bfa', fontSize: '0.8rem' }}>协同 {plan.metrics.coord}%</span>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左侧面板 */}
        <div style={{
          width: 340, overflowY: 'auto', padding: '1.2rem',
          borderRight: '1px solid #1a1a2e', background: '#08080f',
          flexShrink: 0,
        }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ color: '#4a9eff', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              作战计划
            </div>
            <p style={{ color: '#ccc', fontSize: '0.83rem', lineHeight: 1.7 }}>{plan.plan}</p>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ color: '#fbbf24', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              选定构想
            </div>
            <p style={{ color: '#ccc', fontSize: '0.83rem', lineHeight: 1.7 }}>{plan.concept}</p>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ color: '#f43f5e', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              效果指标
            </div>
            {[
              { label: '任务完成率', value: plan.metrics.complete, color: '#34d399' },
              { label: '己方伤亡', value: plan.metrics.casualty, color: '#f43f5e', invert: true },
              { label: '敌方毁伤率', value: plan.metrics.destroy, color: '#4a9eff' },
              { label: '协同成功率', value: plan.metrics.coord, color: '#a78bfa' },
            ].map(m => (
              <div key={m.label} style={{ marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#888', fontSize: '0.78rem' }}>{m.label}</span>
                  <span style={{ color: m.color, fontSize: '0.78rem', fontWeight: 600 }}>{m.value}%</span>
                </div>
                <div style={{ height: 4, background: '#1a1a2e', borderRadius: 2 }}>
                  <div style={{
                    height: '100%',
                    width: `${m.invert ? 100 - m.value : m.value}%`,
                    background: m.color, borderRadius: 2,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: '#0d0d1a', border: '1px solid #34d39933',
            borderRadius: 8, padding: '0.9rem', marginBottom: '0.9rem',
          }}>
            <div style={{ color: '#34d399', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              评估结论
            </div>
            <p style={{ color: '#ccc', fontSize: '0.8rem', lineHeight: 1.6 }}>{plan.conclusion}</p>
          </div>

          {plan.warnings && (
            <div style={{
              background: '#0d0d1a', border: '1px solid #fbbf2433',
              borderRadius: 8, padding: '0.9rem',
            }}>
              <div style={{ color: '#fbbf24', fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                预警
              </div>
              <p style={{ color: '#ccc', fontSize: '0.8rem', lineHeight: 1.6 }}>{plan.warnings}</p>
            </div>
          )}
        </div>

        {/* 3D 图区域 */}
        <div style={{ flex: 1, position: 'relative' }}>
          <ForceGraph3DComponent
            data={graphData}
            onNodeClick={handleNodeClick}
            onViewChange={handleViewChange}
          />

          {/* 视图切换面板 */}
          <div style={{
            position: 'absolute', top: '1rem', right: '1rem',
            zIndex: 100,
            background: 'rgba(5,5,16,0.88)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '0.8rem',
            backdropFilter: 'blur(10px)',
            minWidth: 180,
          }}>
            <div id="view-badge" style={{
              color: '#fff', fontSize: '0.75rem', fontWeight: 700,
              textAlign: 'center', marginBottom: '0.5rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              letterSpacing: '0.05em',
            }}>
              {PLANETS.find(p => p.id === activeView)?.label || '视图'}
            </div>

            {PLANETS.map(p => (
              <button
                key={p.id}
                onClick={() => window.__switchView?.(p.id)}
                style={{
                  display: 'block', width: '100%',
                  padding: '0.45rem 0.8rem',
                  marginBottom: '0.3rem',
                  border: `1px solid ${p.color}${activeView === p.id ? 'ff' : '44'}`,
                  borderRadius: 6,
                  background: activeView === p.id
                    ? `${p.color}22`
                    : 'transparent',
                  color: activeView === p.id ? p.color : `${p.color}cc`,
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  fontFamily: 'system-ui, sans-serif',
                }}
                onMouseEnter={e => {
                  if (activeView !== p.id) {
                    e.currentTarget.style.background = `${p.color}15`;
                    e.currentTarget.style.color = p.color;
                  }
                }}
                onMouseLeave={e => {
                  if (activeView !== p.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = `${p.color}cc`;
                  }
                }}
              >
                <span style={{ opacity: 0.7, marginRight: '0.5rem', fontSize: '0.68rem' }}>{p.id === 0 ? '' : `V${p.id}`}</span>
                {p.label}
                <span style={{ display: 'block', fontSize: '0.62rem', color: '#666', marginTop: '0.1rem', marginLeft: p.id === 0 ? 0 : '1.2rem' }}>
                  {p.range}
                </span>
              </button>
            ))}
          </div>

          {/* 图例 */}
          <div style={{
            position: 'absolute', bottom: '1rem', left: '1rem',
            background: 'rgba(5,5,16,0.88)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '0.7rem 1rem',
            backdropFilter: 'blur(6px)',
          }}>
            <div style={{ color: '#555', fontSize: '0.68rem', marginBottom: '0.5rem' }}>CoT x AOD 图例</div>
            {PLANETS.slice(1).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: p.color,
                  boxShadow: `0 0 6px ${p.color}`,
                }} />
                <span style={{ color: '#888', fontSize: '0.72rem' }}>{p.label}</span>
              </div>
            ))}
            <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <div style={{ width: 16, height: 2, background: '#FFFFFF', borderRadius: 1 }} />
                <span style={{ color: '#888', fontSize: '0.72rem' }}>母星链路</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 16, height: 2, background: '#44DDFF', borderRadius: 1, borderTop: '1px dashed #44DDFF', background: 'transparent' }} />
                <span style={{ color: '#888', fontSize: '0.72rem' }}>反馈链路</span>
              </div>
            </div>
          </div>

          {/* 提示 */}
          <div style={{
            position: 'absolute', top: '1rem', left: '1rem',
            background: 'rgba(5,5,16,0.75)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6, padding: '0.5rem 0.8rem',
            color: '#555', fontSize: '0.68rem',
          }}>
            点击母星进入该视角 | 双击背景返回全景
          </div>
        </div>
      </div>
    </div>
  );
}
