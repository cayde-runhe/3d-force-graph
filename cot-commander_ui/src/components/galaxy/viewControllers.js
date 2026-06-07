import { useRef, useCallback } from 'react';
import { createPlanet, createBeam } from './renderHelpers';
import {
  PLANET_ORBIT,
  PLANET_IDS,
  PLANET_VIEWS,
} from './planetConfig';
import {
  getLinkStyle,
  getNodeValByView,
  getNodeOpacityByView,
  getLinkOpacityByView,
} from './graphUtils';
import { orbitState, activateOrbit, computeOrbitCameraPosition } from './orbitCamera';

export { PLANET_VIEWS };

// ============================================================
// 视图切换（暴露给外部按钮）
// ============================================================
export function useViewSwitcher({ setViewId, setCameraPos, cameraPosRef }) {
  const switchTo = useCallback((viewId) => {
    setViewId(viewId);
    activateOrbit(viewId, viewId === 0 ? null : PLANET_IDS[viewId]);

    if (viewId === 0) {
      setCameraPos({ position: { x: 200, y: 80, z: 180 }, target: { x: 0, y: 0, z: 0 } });
    } else {
      const pid = PLANET_IDS[viewId];
      const nodes = cameraPosRef.current?.nodes || [];
      const planet = nodes.find(n => n.id === pid);
      if (planet) {
        const cfg = PLANET_ORBIT[pid] || {};
        setCameraPos({
          position: { x: planet.x + (cfg.cameraDist || 120), y: planet.y + 20, z: planet.z + 30 },
          target: { x: planet.x, y: planet.y, z: planet.z },
        });
      }
    }
  }, [setViewId, setCameraPos, cameraPosRef]);

  return switchTo;
}

// ============================================================
// engineTick：轨道相机 + 脉冲动画
// ============================================================
export function useEngineTick({ cameraPosRef, setCameraPos }) {
  return useCallback((graphData) => {
    // 轨道相机
    const cam = computeOrbitCameraPosition(graphData, PLANET_ORBIT);
    if (cam) {
      cameraPosRef.current = cam;
      setCameraPos({ ...cam });
    }

    // 脉冲动画
    const now = Date.now() * 0.002;
    (graphData?.nodes || []).forEach((node, i) => {
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
  }, [cameraPosRef, setCameraPos]);
}

// ============================================================
// 节点点击
// ============================================================
export function useNodeClick({ onNodeClick, viewId, setViewId, switchTo, setCameraPos }) {
  return useCallback((node) => {
    if (!node) return;

    if (node.layer === 0) {
      const viewMap = {
        '母星-意图理解': 1, '母星-情况判断': 2, '母星-形成构想': 3,
        '母星-制定计划': 4, '母星-仿真推演': 5, '母星-效果评估': 6,
      };
      const vid = viewMap[node.id];
      if (vid) {
        switchTo(vid);
        setCameraPos({ position: { x: node.x + 120, y: node.y + 30, z: node.z + 40 }, target: { x: node.x, y: node.y, z: node.z } });
      }
      onNodeClick?.(node);
      return;
    }

    onNodeClick?.(node);
  }, [onNodeClick, switchTo, setCameraPos]);
}

// ============================================================
// props 工厂（根据 viewId 生成稳定的图样式 props）
// ============================================================
export function useGraphProps({ viewId, data }) {
  return {
    nodeVal: (node) => getNodeValByView(node, viewId, PLANET_IDS),
    nodeOpacity: (node) => getNodeOpacityByView(node, viewId, PLANET_IDS),
    linkOpacity: (link) => getLinkOpacityByView(link, viewId, PLANET_IDS),
    linkColor: (link) => getLinkStyle(link).color,
    linkWidth: (link) => getLinkStyle(link).width,
    linkThreeObject: (link) => createBeam(link),
    nodeThreeObject: (node) => createPlanet(node),
    nodeThreeObjectExtend: false,
    nodeColor: (node) => node.color || '#FFFFFF',
  };
}
