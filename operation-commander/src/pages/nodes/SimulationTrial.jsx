import { useNavigate } from 'react-router-dom';

export default function SimulationTrial() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem 3rem', background: '#0a0a0f', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 600 }}>
        <div style={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Step 05 / 06</div>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '0.5rem' }}>仿真推演</h2>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Simulation Trial — 在虚拟环境中验证作战方案的可行性与风险</p>

        <div style={{
          background: '#111118', border: '1px solid #2a2a3a', borderRadius: 12,
          padding: '2rem', marginBottom: '2rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: '想定规模', value: '师级对抗' },
              { label: '推演时长', value: '72小时模拟' },
              { label: '红方胜率', value: '68.4%' },
              { label: '蓝方反应', value: '预期反应' },
              { label: '关键节点', value: '12个' },
              { label: '风险点', value: '3个预警' },
            ].map((item) => (
              <div key={item.label} style={{ background: '#0d0d12', borderRadius: 8, padding: '0.8rem', textAlign: 'center' }}>
                <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.3rem' }}>{item.label}</div>
                <div style={{ color: '#a78bfa', fontSize: '1rem', fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/nodes/plan-development')}
            style={{ padding: '0.7rem 1.5rem', background: '#1a1a24', color: '#888', border: '1px solid #333', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ← 制定计划
          </button>
          <button
            onClick={() => navigate('/simulation-run')}
            style={{ padding: '0.7rem 2rem', background: '#a78bfa', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            查看推演详情 →
          </button>
          <button
            onClick={() => navigate('/nodes/effect-evaluation')}
            style={{ padding: '0.7rem 2rem', background: '#a78bfa', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            下一步：效果评估 →
          </button>
        </div>
      </div>
    </div>
  );
}
