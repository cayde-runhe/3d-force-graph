import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const SECTIONS = [
  { label: '阶段一：先期行动', items: ['电子战压制', '情报侦察', '后勤前推'] },
  { label: '阶段二：主攻行动', items: ['主力进入出发阵位', '火力准备', '突击队开辟通路', '主力跟进'] },
  { label: '阶段三：纵深发展', items: ['快速推进至目标线', '建立侧翼保障', '扩大战果'] },
  { label: '阶段四：结束行动', items: ['清剿残敌', '稳固阵地', '组织撤离'] },
];

export default function PlanDevelopment() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState('');

  const toggle = (section, item) => {
    const key = `${section}-${item}`;
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ width: 440, overflowY: 'auto', borderRight: '1px solid #222', padding: '1.5rem', background: '#0d0d12' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: '#f97316', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step 04 / 06</div>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.3rem' }}>制定计划</h2>
          <p style={{ color: '#666', fontSize: '0.8rem' }}>Plan Development — 详细作战计划制定</p>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: '1.2rem' }}>
            <div style={{ color: '#f97316', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.5rem' }}>{section.label}</div>
            {section.items.map((item) => {
              const key = `${section.label}-${item}`;
              return (
                <label
                  key={item}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={!!checked[key]}
                    onChange={() => toggle(section.label, item)}
                    style={{ accentColor: '#f97316' }}
                  />
                  <span style={{ color: checked[key] ? '#f97316' : '#aaa', fontSize: '0.85rem' }}>{item}</span>
                </label>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop: '1rem' }}>
          <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem' }}>补充说明</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="添加计划细节、注意事项..."
            style={{
              width: '100%', height: 80, background: '#111118', border: '1px solid #333',
              borderRadius: 8, color: '#e0e0e0', padding: '0.6rem', fontSize: '0.85rem',
              fontFamily: 'system-ui, sans-serif', resize: 'none', outline: 'none',
            }}
          />
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/nodes/concept-formation')}
            style={{ flex: 1, padding: '0.7rem', background: '#1a1a24', color: '#888', border: '1px solid #333', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ← 形成构想
          </button>
          <button
            onClick={() => navigate('/simulation-run')}
            style={{ flex: 2, padding: '0.7rem', background: '#f97316', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            下一步：仿真推演 →
          </button>
        </div>
      </div>

      <div style={{ flex: 1, background: '#0a0a0f', padding: '2rem', overflowY: 'auto' }}>
        <div style={{ color: '#f97316', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>计划总览</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {SECTIONS.map((section, si) => (
            <div key={section.label} style={{ borderLeft: `3px solid ${['#4a9eff','#34d399','#fbbf24','#f97316'][si]}`, paddingLeft: '1rem' }}>
              <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem' }}>{section.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {section.items.map((item) => {
                  const key = `${section.label}-${item}`;
                  return (
                    <span
                      key={item}
                      style={{
                        padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.78rem',
                        background: checked[key] ? `${['#4a9eff22','#34d39922','#fbbf2422','#f9731622'][si]}` : '#1a1a24',
                        border: `1px solid ${checked[key] ? ['#4a9eff66','#34d39966','#fbbf2466','#f9731666'][si] : '#333'}`,
                        color: checked[key] ? ['#4a9eff','#34d399','#fbbf24','#f97316'][si] : '#555',
                      }}
                    >
                      {item}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '2rem', color: '#555', fontSize: '0.8rem' }}>
          共 {allChecked} / {SECTIONS.reduce((s, sec) => s + sec.items.length, 0)} 项已完成
        </div>
      </div>
    </div>
  );
}
