import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EXAMPLES = [
  {
    id: 'standard',
    name: '标准攻防战',
    desc: '集中优势兵力正面突击，配合侧翼迂回包抄，四阶段推进。',
    color: '#4a9eff',
    icon: '⚔',
    score: 87,
  },
  {
    id: 'envelop',
    name: '围困阻击战',
    desc: '切断补给建立包围圈，逐步压缩敌方空间，消耗战中取胜。',
    color: '#34d399',
    icon: '🔒',
    score: 82,
  },
  {
    id: 'network',
    name: '网络中心战',
    desc: '电子对抗先行瘫痪感知，精确制导逐点摧毁，心理战协同。',
    color: '#a78bfa',
    icon: '🛰',
    score: 91,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleStart = () => {
    if (!selected) return;
    sessionStorage.setItem('selectedPlan', selected);
    navigate('/plan-viewer');
  };

  return (
    <div style={{ padding: '2rem 3rem', maxWidth: 900, background: '#0a0a0f', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
          作战计划思维链
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          输入作战方案，生成思维链图谱
        </p>
      </div>

      <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '1.2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        选择示例方案
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem', marginBottom: '2rem' }}>
        {EXAMPLES.map((ex) => (
          <div
            key={ex.id}
            onClick={() => setSelected(ex.id)}
            style={{
              background: selected === ex.id ? '#1a1a20' : '#111118',
              border: `2px solid ${selected === ex.id ? ex.color : '#222'}`,
              borderRadius: 12,
              padding: '1.4rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '1.6rem' }}>{ex.icon}</span>
              {selected === ex.id && (
                <span style={{ color: ex.color, fontSize: '0.75rem', fontWeight: 600 }}>已选择</span>
              )}
            </div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>{ex.name}</div>
            <div style={{ color: '#888', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '1rem' }}>{ex.desc}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: 3, background: '#222', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${ex.score}%`, background: ex.color, borderRadius: 2 }} />
              </div>
              <span style={{ color: ex.color, fontSize: '0.8rem', fontWeight: 600 }}>{ex.score}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        border: '1px solid #222', borderRadius: 10, padding: '1.5rem',
        background: '#111118', display: 'flex', gap: '1.5rem', alignItems: 'center',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>查看思维链图谱</div>
          <div style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.6 }}>
            选定方案后展示完整作战思维链，包含意图理解、情况判断、方案构想、计划制定、仿真推演、效果评估六个阶段。
          </div>
        </div>
        <button
          onClick={handleStart}
          disabled={!selected}
          style={{
            padding: '0.8rem 2rem',
            background: selected ? '#4a9eff' : '#222',
            color: selected ? '#fff' : '#555',
            border: 'none', borderRadius: 8,
            cursor: selected ? 'pointer' : 'not-allowed',
            fontWeight: 600, fontSize: '0.9rem', flexShrink: 0,
          }}
        >
          查看思维链 →
        </button>
      </div>
    </div>
  );
}
