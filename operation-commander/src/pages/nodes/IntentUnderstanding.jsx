import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph3DComponent from '../../components/ForceGraph3DComponent';
import graphData from '../../../public/datasets/blocks.json';

const INTENT_ITEMS = [
  '行动目的', '敌方意图', '我方能力边界', '时间约束', '空间约束',
  '资源总量', '关键节点', '风险上限', '允许的伤亡', '地形因素',
  '天候条件', '电磁环境', '友邻协同', '后勤保障', '指挥关系',
  '通信保障', '情报来源', '法律授权', '政治约束', '退出条件', '终止条件',
];

export default function IntentUnderstanding() {
  const navigate = useNavigate();
  const planText = sessionStorage.getItem('operationPlan') || '';
  const [checked, setChecked] = useState(() => new Array(INTENT_ITEMS.length).fill(false));
  const [notes, setNotes] = useState(() => {
    return Object.fromEntries(INTENT_ITEMS.map((k) => [k, '']));
  });

  const toggle = (i) => {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const completed = checked.filter(Boolean).length;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ width: 420, overflowY: 'auto', borderRight: '1px solid #222', padding: '1.5rem', background: '#0d0d12' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: '#4a9eff', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step 01 / 06</div>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.3rem' }}>意图理解</h2>
          <p style={{ color: '#666', fontSize: '0.8rem' }}>Intent Understanding — 21项要素逐一明确</p>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: 4, background: '#222', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${(completed / INTENT_ITEMS.length) * 100}%`, background: '#4a9eff', borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
          <span style={{ color: '#4a9eff', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{completed}/{INTENT_ITEMS.length}</span>
        </div>

        {planText && (
          <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: 8, padding: '0.8rem', marginBottom: '1rem' }}>
            <div style={{ color: '#4a9eff', fontSize: '0.7rem', marginBottom: '0.4rem' }}>原始方案</div>
            <div style={{ color: '#888', fontSize: '0.8rem', lineHeight: 1.5 }}>{planText}</div>
          </div>
        )}

        {INTENT_ITEMS.map((item, i) => (
          <div key={item} style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                style={{ marginTop: 3, accentColor: '#4a9eff', flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ color: checked[i] ? '#4a9eff' : '#ccc', fontSize: '0.85rem', fontWeight: checked[i] ? 600 : 400 }}>
                  {item}
                </span>
              </div>
            </label>
          </div>
        ))}

        <button
          onClick={() => navigate('/nodes/situation-assessment')}
          style={{
            marginTop: '1.5rem', width: '100%', padding: '0.7rem',
            background: '#4a9eff', color: '#fff', border: 'none',
            borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
          }}
        >
          下一步：情况判断 →
        </button>
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
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(0,0,0,0.7)', border: '1px solid #222',
          borderRadius: 8, padding: '0.8rem 1rem', fontSize: '0.8rem', color: '#888',
        }}>
          意图理解 · 知识图谱
        </div>
      </div>
    </div>
  );
}
