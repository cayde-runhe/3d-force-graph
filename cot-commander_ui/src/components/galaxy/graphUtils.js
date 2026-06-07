// ============================================================
// 连线样式
// ============================================================
export function getLinkStyle(link) {
  if (!link) return { color: '#FFFFFF', width: 1, opacity: 0.5 };
  return {
    color: link.color || '#FFFFFF',
    width: link.width || 1,
    opacity: link.opacity ?? 0.5,
  };
}

// ============================================================
// 根据母星球过滤连线透明度
// ============================================================
export function getLinkOpacityByPlanet(link, planetId) {
  const sId = typeof link.source === 'object' ? link.source.id : link.source;
  const tId = typeof link.target === 'object' ? link.target.id : link.target;
  const aopRange = getAopRange(planetId);

  if (link.level === 1) {
    return (sId === planetId || tId === planetId) ? 0.95 : 0.08;
  }
  if (link.level === 3) {
    if (sId.startsWith('AOP-') && tId.startsWith('AOP-')) {
      const s = parseInt(sId.split('-')[1]);
      const t = parseInt(tId.split('-')[1]);
      if (s >= aopRange.min && s <= aopRange.max &&
          t >= aopRange.min && t <= aopRange.max) return 0.9;
    }
    return 0.04;
  }
  if (link.level === 4 || link.level === 5) {
    if (sId.startsWith('AOP-') && tId.startsWith('AOP-')) {
      const s = parseInt(sId.split('-')[1]);
      const t = parseInt(tId.split('-')[1]);
      if ((s >= aopRange.min && s <= aopRange.max) ||
          (t >= aopRange.min && t <= aopRange.max)) return 0.5;
    }
    return 0.04;
  }
  return 0.1;
}

// ============================================================
// AOP 范围
// ============================================================
export function getAopRange(planetId) {
  switch (planetId) {
    case '母星-意图理解': return { min: 1, max: 21 };
    case '母星-情况判断': return { min: 22, max: 35 };
    case '母星-形成构想': return { min: 36, max: 48 };
    case '母星-制定计划': return { min: 49, max: 66 };
    case '母星-仿真推演': return { min: 67, max: 81 };
    case '母星-效果评估': return { min: 82, max: 88 };
    default: return { min: 0, max: 0 };
  }
}

// ============================================================
// 节点大小（按视图）
// ============================================================
export function getNodeValByView(node, viewId, PLANET_IDS) {
  if (viewId === 0) {
    return node.layer === 0 ? (node.size || 14) : (node.size || 3);
  }
  const planetId = PLANET_IDS[viewId];
  if (node.id === planetId) return 22;
  if (node.layer === 0) return 6;
  if (node.parent === planetId) return (node.size || 3) * 1.15;
  return (node.size || 3) * 0.65;
}

// ============================================================
// 节点透明度（按视图）
// ============================================================
export function getNodeOpacityByView(node, viewId, PLANET_IDS) {
  if (viewId === 0) return 1.0;
  const planetId = PLANET_IDS[viewId];
  if (node.id === planetId) return 1.0;
  if (node.layer === 0) return 0.12;
  if (node.parent === planetId) return 0.95;
  return 0.3;
}

// ============================================================
// 连线透明度（按视图）
// ============================================================
export function getLinkOpacityByView(link, viewId, PLANET_IDS) {
  if (viewId === 0) return getLinkStyle(link).opacity;
  const planetId = PLANET_IDS[viewId];
  return getLinkOpacityByPlanet(link, planetId);
}

// ============================================================
// 相机初始位置（按视图）
// ============================================================
export function getInitialCameraPosition(viewId, PLANET_IDS, nodes) {
  if (viewId === 0) {
    return { x: 200, y: 80, z: 180 };
  }
  const planetId = PLANET_IDS[viewId];
  const planet = nodes.find(n => n.id === planetId);
  if (planet) {
    const cfg = planet._orbitConfig || {};
    const d = cfg.cameraDist || 120;
    return { x: planet.x + d, y: planet.y + 20, z: planet.z + 30 };
  }
  return { x: 200, y: 80, z: 180 };
}
