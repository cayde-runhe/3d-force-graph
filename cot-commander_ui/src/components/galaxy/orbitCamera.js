// ============================================================
// 轨道相机状态（模块级单例）
// ============================================================
export const orbitState = {
  active: false,
  viewId: 0,
  targetPlanetId: null,
  overviewAngle: 0,
  planetAngle: 0,
};

// ============================================================
// 更新轨道状态
// ============================================================
export function activateOrbit(viewId, planetId) {
  orbitState.active = true;
  orbitState.viewId = viewId;
  orbitState.targetPlanetId = planetId || null;
  orbitState.overviewAngle = 0;
  orbitState.planetAngle = 0;
}

export function deactivateOrbit() {
  orbitState.active = false;
}

// ============================================================
// 计算当前视图的相机位置（在 onEngineTick 中调用）
// data: graphData prop（包含当前节点位置）
// ============================================================
export function computeOrbitCameraPosition(data, planetOrbit) {
  if (!orbitState.active || !data || !data.nodes) return null;

  const getNode = (id) => data.nodes.find(n => n.id === id);

  if (orbitState.targetPlanetId === null) {
    // 全景环绕
    orbitState.overviewAngle += 0.004;
    const t = orbitState.overviewAngle;
    const R = 220;
    return {
      position: { x: Math.sin(t) * R, y: 80 + Math.sin(t * 0.5) * 20, z: Math.cos(t) * R },
      target: { x: 0, y: 0, z: 0 },
    };
  }

  // 母星球环绕
  orbitState.planetAngle += (planetOrbit[orbitState.targetPlanetId]?.orbitSpeed || 0.02);
  const t = orbitState.planetAngle;
  const cfg = planetOrbit[orbitState.targetPlanetId] || {};
  const R = cfg.cameraDist || 110;
  const tx = cfg.tiltX || 0;
  const tz = cfg.tiltZ || 0;

  const planet = getNode(orbitState.targetPlanetId);
  if (!planet) return null;

  const rawX = Math.sin(t) * R;
  const rawZ = Math.cos(t) * R;
  const rawY = Math.cos(t) * R * 0.3;

  return {
    position: {
      x: planet.x + rawX + rawY * tx,
      y: planet.y + rawY * Math.cos(tx) + rawZ * Math.sin(tz),
      z: planet.z + rawZ * Math.cos(tz) - rawY * Math.sin(tz),
    },
    target: { x: planet.x, y: planet.y, z: planet.z },
  };
}
