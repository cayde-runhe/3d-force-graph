import { Outlet, Link, useLocation } from 'react-router-dom';

const NODES = [
  { path: '/nodes/intent-understanding', label: '意图理解', en: 'Intent Understanding', color: '#4a9eff' },
  { path: '/nodes/situation-assessment', label: '情况判断', en: 'Situation Assessment', color: '#34d399' },
  { path: '/nodes/concept-formation', label: '形成构想', en: 'Concept Formation', color: '#fbbf24' },
  { path: '/nodes/plan-development', label: '制定计划', en: 'Plan Development', color: '#f97316' },
  { path: '/nodes/simulation-trial', label: '仿真推演', en: 'Simulation Trial', color: '#a78bfa' },
  { path: '/nodes/effect-evaluation', label: '效果评估', en: 'Effect Evaluation', color: '#f43f5e' },
];

export { NODES };

export default function Layout() {
  const location = useLocation();
  const isGraphPage = location.pathname.startsWith('/nodes/');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: 'system-ui, sans-serif' }}>
      {!isGraphPage && (
        <header style={{ padding: '1rem 2rem', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#4a9eff' }}>Commander CoT</span>
          <nav style={{ display: 'flex', gap: '1.5rem', marginLeft: '2rem' }}>
            {NODES.map((n) => (
              <Link
                key={n.path}
                to={n.path}
                style={{
                  color: '#888',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: 4,
                  border: '1px solid transparent',
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
      )}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
