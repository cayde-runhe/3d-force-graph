import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import {
  PLANET_ORBIT,
  PLANET_IDS,
  PLANET_VIEWS,
} from './galaxy/planetConfig';
import {
  getLinkStyle,
  getNodeValByView,
  getNodeOpacityByView,
  getLinkOpacityByView,
} from './galaxy/graphUtils';
import { createPlanet, createBeam } from './galaxy/renderHelpers';
import { orbitState, activateOrbit } from './galaxy/orbitCamera';

// ============================================================
// 主组件
// ============================================================
export default function ForceGraph3DComponent({ data, onNodeClick, onViewChange }) {
  const graphRef     = useRef(null);
  const rafRef       = useRef(null);
  const initialized   = useRef(false);
  const [viewId, setViewId] = useState(0);
  const [debugOpen, setDebugOpen] = useState(false);

  // ============================================================
  // 视图切换
  // ============================================================
  const switchTo = useCallback((newViewId) => {
    console.log('[switchTo] viewId:', newViewId);
    console.log('[switchTo] data.nodes count:', data?.nodes?.length);
    if (data?.nodes) {
      data.nodes.forEach(n => {
        if (n.layer === 0) {
          console.log(`  母星: ${n.id} at (${n.x?.toFixed(0)}, ${n.y?.toFixed(0)}, ${n.z?.toFixed(0)})`);
        }
      });
    }
    setViewId(newViewId);
    activateOrbit(newViewId, newViewId === 0 ? null : PLANET_IDS[newViewId]);
    onViewChange?.(newViewId);
  }, [data, onViewChange]);

  // 暴露到 window 供外部按钮调用
  useEffect(() => {
    window.__switchView = switchTo;
    console.log('[mount] window.__switchView 注册完成');
    return () => { delete window.__switchView; };
  }, [switchTo]);

  // ============================================================
  // 轨道相机 RAF 循环（从 data.prop 读取节点坐标）
  // ============================================================
  useEffect(() => {
    const run = () => {
      const graph = graphRef.current;
      // 等待 graph 和 data 都就绪
      if (!graph || !data?.nodes?.length) {
        rafRef.current = requestAnimationFrame(run);
        return;
      }

      const nodes = data.nodes;
      const getNode = (id) => nodes.find(n => n.id === id);

      if (orbitState.targetPlanetId === null) {
        // 全景环绕
        orbitState.overviewAngle += 0.004;
        const t = orbitState.overviewAngle;
        const R = 220;
        const pos = { x: Math.sin(t) * R, y: 80 + Math.sin(t * 0.5) * 20, z: Math.cos(t) * R };
        const tgt = { x: 0, y: 0, z: 0 };
        graph.cameraPosition(pos, tgt, 0);
      } else {
        // 母星球环绕
        const cfg = PLANET_ORBIT[orbitState.targetPlanetId] || {};
        orbitState.planetAngle += cfg.orbitSpeed || 0.02;
        const t = orbitState.planetAngle;
        const R = cfg.cameraDist || 110;
        const tx = cfg.tiltX || 0;
        const tz = cfg.tiltZ || 0;
        const planet = getNode(orbitState.targetPlanetId);
        if (planet) {
          const rawX = Math.sin(t) * R;
          const rawZ = Math.cos(t) * R;
          const rawY = Math.cos(t) * R * 0.3;
          const pos = {
            x: planet.x + rawX + rawY * tx,
            y: planet.y + rawY * Math.cos(tx) + rawZ * Math.sin(tz),
            z: planet.z + rawZ * Math.cos(tz) - rawY * Math.sin(tz),
          };
          const tgt = { x: planet.x, y: planet.y, z: planet.z };
          graph.cameraPosition(pos, tgt, 0);
        }
      }

      rafRef.current = requestAnimationFrame(run);
    };

    rafRef.current = requestAnimationFrame(run);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [data]);

  // ============================================================
  // onEngineTick：脉冲动画（节点位置从 data.prop 读取）
  // ============================================================
  const handleEngineTick = useCallback(() => {
    if (!data?.nodes) return;
    const now = Date.now() * 0.002;
    data.nodes.forEach((node, i) => {
      if (!node.__threeObj) return;
      const sphere = node.__threeObj.children[0];
      if (!sphere?.material) return;
      const phase = i * (Math.PI / 3);
      const pulse = node.layer === 0
        ? 0.7 + 0.3 * Math.abs(Math.sin(now * 1.2 + phase))
        : 0.5 + 0.2 * Math.abs(Math.sin(now + phase));
      sphere.material.emissiveIntensity = pulse;
      if (node.layer > 0) {
        node.__threeObj.position.y = (node.y || 0) + Math.sin(now * 0.4 + i) * 0.5;
      }
    });
  }, [data]);

  // ============================================================
  // 节点点击
  // ============================================================
  const handleNodeClick = useCallback((node) => {
    console.log('[handleNodeClick]', node?.id, 'layer:', node?.layer);
    if (!node) return;

    if (node.layer === 0) {
      const viewMap = {
        '母星-意图理解': 1, '母星-情况判断': 2, '母星-形成构想': 3,
        '母星-制定计划': 4, '母星-仿真推演': 5, '母星-效果评估': 6,
      };
      const vid = viewMap[node.id];
      if (vid) {
        switchTo(vid);
        const cfg = PLANET_ORBIT[node.id] || {};
        graphRef.current?.cameraPosition(
          { x: node.x + (cfg.cameraDist || 120), y: node.y + 20, z: node.z + 30 },
          { x: node.x, y: node.y, z: node.z }, 800
        );
      }
    }
    onNodeClick?.(node);
  }, [switchTo, onNodeClick]);

  const handleBackgroundClick = useCallback(() => {
    console.log('[handleBackgroundClick] -> 全景');
    switchTo(0);
  }, [switchTo]);

  // ============================================================
  // 鼠标悬停
  // ============================================================
  const handleNodeHover = useCallback((node) => {
    const tooltip = document.getElementById('galaxy-tooltip');
    if (!tooltip) return;
    if (node) {
      tooltip.innerHTML = `
        <div class="gtt-badge" style="color:${node.color}">${node.layer === 0 ? '母星球' : `AOP-${String(node.aop).padStart(3, '0')}`}</div>
        <div class="gtt-title">${node.label}</div>
        ${node.layer > 0 ? `<div class="gtt-parent">${node.parent}</div>` : `<div class="gtt-range">${node.aopRange}</div>`}
      `;
      tooltip.style.display = 'block';
    } else {
      tooltip.style.display = 'none';
    }
  }, []);

  // ============================================================
  // Props 工厂（viewId 变化时重新计算）
  // ============================================================
  const graphProps = useMemo(() => ({
    nodeVal:      (node) => getNodeValByView(node, viewId, PLANET_IDS),
    nodeOpacity:  (node) => getNodeOpacityByView(node, viewId, PLANET_IDS),
    linkOpacity:  (link) => getLinkOpacityByView(link, viewId, PLANET_IDS),
    linkColor:    (link) => getLinkStyle(link).color,
    linkWidth:    (link) => getLinkStyle(link).width,
  }), [viewId]);

  // ============================================================
  // 初始化时激活全景
  // ============================================================
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    console.log('[init] 激活全景视图');
    const id = setTimeout(() => switchTo(0), 200);
    return () => clearTimeout(id);
  }, []);

  // ============================================================
  // 渲染
  // ============================================================
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ForceGraph3D
        ref={graphRef}
        graphData={data}
        nodeThreeObject={(node) => createPlanet(node)}
        nodeThreeObjectExtend={false}
        nodeVal={graphProps.nodeVal}
        nodeColor={(node) => node.color || '#FFFFFF'}
        nodeLabel={(node) => node.layer === 0 ? `${node.label}\n${node.aopRange}` : `AOP-${String(node.aop).padStart(3, '0')} ${node.label}`}
        nodeOpacity={graphProps.nodeOpacity}

        linkThreeObject={(link) => createBeam(link)}
        linkColor={graphProps.linkColor}
        linkWidth={graphProps.linkWidth}
        linkOpacity={graphProps.linkOpacity}

        nodePosition={(node) => ({ x: node.x, y: node.y, z: node.z })}

        cameraPosition={{ x: 200, y: 80, z: 180 }}
        backgroundColor="#050510"

        onEngineTick={handleEngineTick}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={handleBackgroundClick}

        warmupTicks={0}
        cooldownTicks={0}
        showNavInfo={false}

        style={{ width: '100%', height: '100%' }}
      />

      {/* 调试按钮 */}
      <button
        onClick={() => {
          setDebugOpen(v => !v);
          console.log('[debug] 链路数据:', data?.links?.map(l => ({
            s: typeof l.source === 'object' ? l.source.id : l.source,
            t: typeof l.target === 'object' ? l.target.id : l.target,
            level: l.level, type: l.type, color: l.color, opacity: l.opacity
          })));
        }}
        style={{
          position: 'absolute', bottom: '1rem', right: '1rem',
          zIndex: 200, background: '#111', color: '#0f0',
          border: '1px solid #0f0', borderRadius: 4,
          padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.7rem',
          fontFamily: 'monospace',
        }}
      >
        {debugOpen ? '关闭调试' : '调试链路'}
      </button>

      {debugOpen && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.88)', zIndex: 150, overflowY: 'auto',
          padding: '1rem', fontFamily: 'monospace', fontSize: '0.7rem', color: '#0f0',
        }}>
          <div style={{ marginBottom: '0.5rem', color: '#fff', fontSize: '0.85rem' }}>
            链路调试 — 共 {data?.links?.length || 0} 条连线，当前视图 {viewId}
            （{PLANET_IDS[viewId] || '全景'}）
          </div>
          <div style={{ marginBottom: '1rem', color: '#aaa', fontSize: '0.65rem' }}>
            视图切换逻辑：viewId=0 全景（显示所有链路）/ viewId=1~6 聚焦单个母星球
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1a4a1a' }}>
                <th style={{ padding: '2px 4px', textAlign: 'left' }}>#</th>
                <th style={{ padding: '2px 4px', textAlign: 'left' }}>source</th>
                <th style={{ padding: '2px 4px', textAlign: 'left' }}>target</th>
                <th style={{ padding: '2px 4px', textAlign: 'left' }}>level</th>
                <th style={{ padding: '2px 4px', textAlign: 'left' }}>type</th>
                <th style={{ padding: '2px 4px', textAlign: 'left' }}>color</th>
                <th style={{ padding: '2px 4px', textAlign: 'right' }}>width</th>
                <th style={{ padding: '2px 4px', textAlign: 'right' }}>opacity</th>
                <th style={{ padding: '2px 4px', textAlign: 'right' }}>计算透明度</th>
              </tr>
            </thead>
            <tbody>
              {(data?.links || []).map((link, i) => {
                const sId = typeof link.source === 'object' ? link.source.id : link.source;
                const tId = typeof link.target === 'object' ? link.target.id : link.target;
                const style = getLinkStyle(link);
                const dispOpacity = getLinkOpacityByView(link, viewId, PLANET_IDS);
                const isVisible = dispOpacity > 0.05;
                return (
                  <tr key={i} style={{ background: isVisible ? '#001a00' : '#1a0000', color: isVisible ? '#4f4' : '#500' }}>
                    <td style={{ padding: '1px 4px' }}>{i + 1}</td>
                    <td style={{ padding: '1px 4px', color: isVisible ? '#8f8' : '#444' }}>{sId}</td>
                    <td style={{ padding: '1px 4px', color: isVisible ? '#8f8' : '#444' }}>{tId}</td>
                    <td style={{ padding: '1px 4px' }}>{link.level}</td>
                    <td style={{ padding: '1px 4px' }}>{link.type}</td>
                    <td style={{ padding: '1px 4px' }}>
                      <span style={{ display: 'inline-block', width: 10, height: 10, background: link.color, borderRadius: 2, verticalAlign: 'middle' }} />
                      {' '}{link.color}
                    </td>
                    <td style={{ padding: '1px 4px', textAlign: 'right' }}>{link.width}</td>
                    <td style={{ padding: '1px 4px', textAlign: 'right' }}>{style.opacity.toFixed(2)}</td>
                    <td style={{ padding: '1px 4px', textAlign: 'right', color: isVisible ? '#0f0' : '#f44', fontWeight: isVisible ? 'normal' : 'bold' }}>
                      {dispOpacity.toFixed(3)} {isVisible ? '✓' : '✗'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div id="galaxy-tooltip" style={{
        display: 'none', position: 'fixed', bottom: '2rem', left: '50%',
        transform: 'translateX(-50%)', background: 'rgba(5,5,16,0.92)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
        padding: '0.6rem 1rem', pointerEvents: 'none', zIndex: 1000,
        minWidth: 160, textAlign: 'center',
      }}>
        <style>{`.gtt-badge{font-size:0.7rem;font-weight:700;letter-spacing:0.08em;margin-bottom:0.2rem}.gtt-title{font-size:0.8rem;color:#fff;margin-bottom:0.15rem}.gtt-parent,.gtt-range{font-size:0.7rem;color:#888}`}</style>
      </div>
    </div>
  );
}

export { PLANET_VIEWS };
