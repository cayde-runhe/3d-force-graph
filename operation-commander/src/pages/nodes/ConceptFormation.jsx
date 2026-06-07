import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const MOCK_CONCEPTS = [
  {
    id: 'A',
    title: '方案A：正面突击',
    desc: '集中优势兵力从敌方主防线正面实施强攻，以压倒性火力优势撕裂防线。',
    pros: ['火力集中，毁伤力强', '指挥链简短', '友军协同简单'],
    cons: ['伤亡风险高', '对后勤压力大', '地形限制大'],
    score: 72,
  },
  {
    id: 'B',
    title: '方案B：侧翼迂回',
    desc: '以部分兵力牵制正面之敌，主力从侧翼薄弱环节实施包围切割。',
    pros: ['伤亡相对可控', '可分割敌方', '利用地形隐蔽'],
    cons: ['协同复杂度高', '时间窗口窄', '情报依赖强'],
    score: 85,
  },
  {
    id: 'C',
    title: '方案C：电磁压制+精确打击',
    desc: '先以电子战压制敌方感知，再以精确制导武器逐点摧毁关键节点。',
    pros: ['精确可控', '我方伤亡极低', '可渐进式升级'],
    cons: ['装备依赖高', '天候影响大', '持续压制需保障'],
    score: 78,
  },
];

export default function ConceptFormation() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [decided, setDecided] = useState(false);

  const handleDecide = () => {
    if (!selected) return;
    sessionStorage.setItem('selectedConcept', selected.id);
    setDecided(true);
  };

  return (
    <div style={{ padding: '2rem 3rem', overflowY: 'auto', height: '100vh', background: '#0a0a0f' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step 03 / 06</div>
        <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '0.3rem' }}>形成构想</h2>
        <p style={{ color: '#666', fontSize: '0.85rem' }}>Concept Formation — 基于情况判断，形成多个行动构想方案</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem', marginBottom: '2rem' }}>
        {MOCK_CONCEPTS.map((c) => (
          <div
            key={c.id}
            onClick={() => !decided && setSelected(c.id)}
            style={{
              background: selected === c.id ? '#1a1a10' : '#111118',
              border: `2px solid ${selected === c.id ? '#fbbf24' : decided && selected === c.id ? '#fbbf24' : decided && selected !== c.id ? '#333' : '#222'}`,
              borderRadius: 12, padding: '1.2rem', cursor: decided ? 'default' : 'pointer',
              opacity: decided && selected !== c.id ? 0.4 : 1,
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', background: selected === c.id ? '#fbbf24' : '#333',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: selected === c.id ? '#000' : '#666',
              }}>
                {c.id}
              </span>
              <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{c.title}</span>
            </div>
            <p style={{ color: '#888', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '0.8rem' }}>{c.desc}</p>
            <div style={{ marginBottom: '0.4rem' }}>
              <div style={{ color: '#34d399', fontSize: '0.75rem', marginBottom: '0.3rem' }}>优势</div>
              {c.pros.map((p) => (
                <div key={p} style={{ color: '#aaa', fontSize: '0.78rem', paddingLeft: '0.5rem' }}>• {p}</div>
              ))}
            </div>
            <div style={{ marginBottom: '0.8rem' }}>
              <div style={{ color: '#f43f5e', fontSize: '0.75rem', marginBottom: '0.3rem' }}>风险</div>
              {c.cons.map((c) => (
                <div key={c} style={{ color: '#aaa', fontSize: '0.78rem', paddingLeft: '0.5rem' }}>• {c}</div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: 4, background: '#222', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${c.score}%`, background: '#fbbf24', borderRadius: 2 }} />
              </div>
              <span style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>{c.score}</span>
            </div>
            {selected === c.id && !decided && (
              <div style={{ marginTop: '0.8rem', textAlign: 'center', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>
                ← 已选择此方案
              </div>
            )}
            {decided && selected === c.id && (
              <div style={{ marginTop: '0.8rem', textAlign: 'center', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>
                ★ 选定方案
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => navigate('/nodes/situation-assessment')}
          style={{ padding: '0.7rem 1.5rem', background: '#1a1a24', color: '#888', border: '1px solid #333', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}
        >
          ← 情况判断
        </button>
        <button
          onClick={() => navigate('/nodes/plan-development')}
          disabled={!decided}
          style={{
            padding: '0.7rem 2rem', background: decided ? '#fbbf24' : '#333',
            color: decided ? '#000' : '#666', border: 'none', borderRadius: 8,
            cursor: decided ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.9rem',
          }}
        >
          {decided ? '选定方案，制定详细计划 →' : '请先选择一个方案'}
        </button>
        {!decided && (
          <button
            onClick={handleDecide}
            disabled={!selected}
            style={{
              padding: '0.7rem 1.5rem', background: selected ? '#fbbf24' : '#222',
              color: selected ? '#000' : '#666', border: 'none', borderRadius: 8,
              cursor: selected ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            确定选择
          </button>
        )}
      </div>
    </div>
  );
}
