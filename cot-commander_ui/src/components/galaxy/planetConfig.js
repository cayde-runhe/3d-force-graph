// ============================================================
// 母星球轨道配置
// ============================================================
export const PLANET_ORBIT = {
  '母星-意图理解': { orbitSpeed: 0.03, tiltX: 0.4, tiltZ: 0.2, cameraDist: 120 },
  '母星-情况判断': { orbitSpeed: 0.025, tiltX: 0.3, tiltZ: -0.1, cameraDist: 110 },
  '母星-形成构想': { orbitSpeed: 0.02, tiltX: -0.2, tiltZ: 0.3, cameraDist: 110 },
  '母星-制定计划': { orbitSpeed: 0.022, tiltX: -0.3, tiltZ: -0.2, cameraDist: 110 },
  '母星-仿真推演': { orbitSpeed: 0.028, tiltX: 0.2, tiltZ: 0.1, cameraDist: 110 },
  '母星-效果评估': { orbitSpeed: 0.018, tiltX: 0.5, tiltZ: 0.3, cameraDist: 115 },
};

export const PLANET_IDS = [
  '',                      // index 0 = overview
  '母星-意图理解',          // 1
  '母星-情况判断',          // 2
  '母星-形成构想',          // 3
  '母星-制定计划',          // 4
  '母星-仿真推演',          // 5
  '母星-效果评估',          // 6
];

export const PLANET_VIEWS = [
  { id: 0, label: '全景作战方案', color: '#FFFFFF', range: '全视图' },
  { id: 1, label: '意图理解',      color: '#FFD700', range: 'AOP-001~021' },
  { id: 2, label: '情况判断',      color: '#4A90D9', range: 'AOP-022~035' },
  { id: 3, label: '形成构想',      color: '#44DD88', range: 'AOP-036~048' },
  { id: 4, label: '制定计划',      color: '#FF9944', range: 'AOP-049~066' },
  { id: 5, label: '仿真推演',      color: '#AA55FF', range: 'AOP-067~081' },
  { id: 6, label: '效果评估',      color: '#44DDFF', range: 'AOP-082~088' },
];
