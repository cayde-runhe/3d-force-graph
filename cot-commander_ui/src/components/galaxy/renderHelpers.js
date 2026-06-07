import * as THREE from 'three';

// ============================================================
// 母星球渲染
// ============================================================
export function createPlanet(node) {
  const group = new THREE.Group();
  const color = new THREE.Color(node.color || '#FFFFFF');

  if (node.layer === 0) {
    const r = node.size || 14;
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(r, 32, 32),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, roughness: 0.2, metalness: 0.1 })
    ));
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(r * 1.6, 32, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
    ));
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(r * 2.5, 16, 16),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.06, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
    ));
  } else {
    const r = node.size || 3;
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(r, 16, 16),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.1 })
    ));
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(r * 1.8, 16, 16),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.08, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
    ));
  }
  return group;
}

// ============================================================
// 连线渲染（贝塞尔曲线）
// ============================================================
export function createBeam(link) {
  const s = typeof link.source === 'object' ? link.source : null;
  const t = typeof link.target === 'object' ? link.target : null;
  if (!s || !t) return null;

  const start = new THREE.Vector3(s.x || 0, s.y || 0, s.z || 0);
  const end   = new THREE.Vector3(t.x || 0, t.y || 0, t.z || 0);
  const mid   = start.clone().lerp(end, 0.5);
  mid.y += 8;

  const color = new THREE.Color(link.color || '#FFFFFF');
  const opacity = link.opacity ?? 0.5;

  return new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(start, mid, end), 20, 0.3, 6, false),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, transparent: true, opacity })
  );
}
