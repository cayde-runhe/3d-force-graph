import { useNavigate } from 'react-router-dom';
import ForceGraph3DComponent from '../components/ForceGraph3DComponent';
import graphData from '../../public/datasets/blocks.json';

export default function SimulationRun() {
  const navigate = useNavigate();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0f' }}>
      <div style={{
        padding: '1rem 2rem', borderBottom: '1px solid #222',
        display: 'flex', alignItems: 'center', gap: '1rem',
        background: '#0d0d12',
      }}>
        <button
          onClick={() => navigate('/nodes/simulation-trial')}
          style={{ padding: '0.4rem 1rem', background: '#1a1a24', color: '#888', border: '1px solid #333', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}
        >
          ← 返回
        </button>
        <span style={{ color: '#fff', fontWeight: 600 }}>仿真推演 · Simulation Run</span>
        <span style={{ color: '#666', fontSize: '0.85rem' }}>实时推演中...</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
          {['蓝方胜率 31.6%', '红方胜率 68.4%', '推演进度 73%'].map((s) => (
            <span key={s} style={{ color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600 }}>{s}</span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <ForceGraph3DComponent
          data={graphData}
          nodeAutoColorBy="user"
          nodeLabel={(n) => `${n.user}: ${n.description || ''}`}
          backgroundColor="#0a0a0f"
          showNavInfo={false}
        />
        <div style={{
          position: 'absolute', bottom: '1rem', left: '1rem',
          background: 'rgba(0,0,0,0.8)', border: '1px solid #333',
          borderRadius: 8, padding: '0.8rem 1.2rem',
        }}>
          <div style={{ color: '#666', fontSize: '0.7rem', marginBottom: '0.3rem' }}>实时仿真状态</div>
          <div style={{ color: '#34d399', fontSize: '0.82rem' }}>红方：第3阶段推进中</div>
          <div style={{ color: '#4a9eff', fontSize: '0.82rem' }}>蓝方：预备队待命</div>
          <div style={{ color: '#fbbf24', fontSize: '0.82rem' }}>关键节点：9/12 已占领</div>
        </div>
        <button
          onClick={() => navigate('/nodes/effect-evaluation')}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            padding: '0.6rem 1.5rem', background: '#a78bfa', color: '#000',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
          }}
        >
          结束推演，评估效果 →
        </button>
      </div>
    </div>
  );
}
