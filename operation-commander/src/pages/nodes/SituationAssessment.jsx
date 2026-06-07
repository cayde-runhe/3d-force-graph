import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ForceGraph3DComponent from '../../components/ForceGraph3DComponent';
import graphData from '../../../public/datasets/miserables.json';

const ASSESSMENT_ITEMS = [
  { label: '敌方兵力部署', status: 'pending' },
  { label: '敌方装备性能', status: 'pending' },
  { label: '敌方作战企图', status: 'pending' },
  { label: '敌方薄弱环节', status: 'pending' },
  { label: '我方兵力优势', status: 'pending' },
  { label: '我方装备劣势', status: 'pending' },
  { label: '地形利弊分析', status: 'pending' },
  { label: '天候影响评估', status: 'pending' },
  { label: '协同保障条件', status: 'pending' },
  { label: '敌方反应预判', status: 'pending' },
];

export default function SituationAssessment() {
  const navigate = useNavigate();
  const [items, setItems] = useState(ASSESSMENT_ITEMS);
  const [conclusion, setConclusion] = useState('');

  const toggleItem = (i) => {
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], status: next[i].status === 'done' ? 'pending' : 'done' };
      return next;
    });
  };

  const completed = items.filter((x) => x.status === 'done').length;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ width: 420, overflowY: 'auto', borderRight: '1px solid #222', padding: '1.5rem', background: '#0d0d12' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step 02 / 06</div>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.3rem' }}>情况判断</h2>
          <p style={{ color: '#666', fontSize: '0.8rem' }}>Situation Assessment — 敌我态势全面分析</p>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: 4, background: '#222', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${(completed / items.length) * 100}%`, background: '#34d399', borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
          <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{completed}/{items.length}</span>
        </div>

        {items.map((item, i) => (
          <div
            key={item.label}
            onClick={() => toggleItem(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.6rem 0.8rem', borderRadius: 6, cursor: 'pointer',
              background: item.status === 'done' ? 'rgba(52,211,153,0.1)' : 'transparent',
              border: `1px solid ${item.status === 'done' ? '#34d39933' : 'transparent'}`,
              marginBottom: '0.4rem',
            }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: item.status === 'done' ? '#34d399' : '#333',
            }} />
            <span style={{ color: item.status === 'done' ? '#34d399' : '#aaa', fontSize: '0.85rem' }}>
              {item.label}
            </span>
          </div>
        ))}

        <div style={{ marginTop: '1rem' }}>
          <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem' }}>综合判断结论</div>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            placeholder="综合以上分析，得出情况判断结论..."
            style={{
              width: '100%', height: 80, background: '#111118', border: '1px solid #333',
              borderRadius: 8, color: '#e0e0e0', padding: '0.6rem', fontSize: '0.85rem',
              fontFamily: 'system-ui, sans-serif', resize: 'none', outline: 'none',
            }}
          />
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/nodes/intent-understanding')}
            style={{ flex: 1, padding: '0.7rem', background: '#1a1a24', color: '#888', border: '1px solid #333', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ← 意图理解
          </button>
          <button
            onClick={() => navigate('/nodes/concept-formation')}
            style={{ flex: 2, padding: '0.7rem', background: '#34d399', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            下一步：形成构想 →
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <ForceGraph3DComponent
          data={graphData}
          nodeAutoColorBy="group"
          nodeLabel="id"
          backgroundColor="#0a0a0f"
          showNavInfo={false}
        />
        <div style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(0,0,0,0.7)', border: '1px solid #222',
          borderRadius: 8, padding: '0.8rem 1rem', fontSize: '0.8rem', color: '#888',
        }}>
          情况判断 · 关系图谱
        </div>
      </div>
    </div>
  );
}
