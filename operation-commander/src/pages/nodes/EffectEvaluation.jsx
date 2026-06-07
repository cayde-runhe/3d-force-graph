import { useNavigate } from 'react-router-dom';

const METRICS = [
  { label: '任务完成率', value: 87, unit: '%', color: '#34d399' },
  { label: '己方伤亡预估', value: 12, unit: '%', color: '#f43f5e' },
  { label: '敌方毁伤率', value: 74, unit: '%', color: '#4a9eff' },
  { label: '作战持续时间', value: 58, unit: '小时', color: '#fbbf24' },
  { label: '弹药消耗率', value: 63, unit: '%', color: '#f97316' },
  { label: '协同成功率', value: 91, unit: '%', color: '#a78bfa' },
];

export default function EffectEvaluation() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem 3rem', background: '#0a0a0f', overflowY: 'auto', height: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ color: '#f43f5e', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step 06 / 06</div>
        <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '0.3rem' }}>效果评估</h2>
        <p style={{ color: '#666', fontSize: '0.85rem' }}>Effect Evaluation — 综合评估作战方案实施效果</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem', marginBottom: '2rem' }}>
        {METRICS.map((m) => (
          <div key={m.label} style={{ background: '#111118', border: '1px solid #222', borderRadius: 12, padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{m.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: m.color, marginBottom: '0.3rem' }}>
              {m.value}<span style={{ fontSize: '0.9rem', fontWeight: 400 }}>{m.unit}</span>
            </div>
            <div style={{ height: 4, background: '#222', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${m.value}%`, background: m.color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#111118', border: '1px solid #222', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: '1rem' }}>评估结论</div>
        <div style={{ color: '#34d399', fontSize: '0.9rem', lineHeight: 1.8 }}>
          方案总体可行，预期任务完成率为87%，己方伤亡控制在可接受范围内。建议按计划执行，加强侧翼掩护力量以应对敌方可能的反击。
        </div>
        <div style={{ color: '#fbbf24', fontSize: '0.85rem', lineHeight: 1.8, marginTop: '0.5rem' }}>
          预警事项：推演中发现第三阶段存在3处风险点，需在作战前细化应急预案。
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => navigate('/nodes/simulation-trial')}
          style={{ padding: '0.7rem 1.5rem', background: '#1a1a24', color: '#888', border: '1px solid #333', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}
        >
          ← 仿真推演
        </button>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '0.7rem 2rem', background: '#f43f5e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
        >
          完成评估，返回首页
        </button>
      </div>
    </div>
  );
}
