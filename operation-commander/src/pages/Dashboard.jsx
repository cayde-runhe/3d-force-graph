import { Link } from 'react-router-dom';
import { NODES } from '../components/Layout';

export default function Dashboard() {
  return (
    <div style={{ padding: '2rem 3rem', maxWidth: 900 }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
        作战计划思维链 — Commander Chain-of-Thought
      </h1>
      <p style={{ color: '#888', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
        整体指挥官智能体 · Intelligence Agent for Operation Planning
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
        {NODES.map((node, i) => (
          <Link
            key={node.path}
            to={node.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.2rem',
              background: '#111118',
              border: '1px solid #222',
              borderRadius: 10,
              textDecoration: 'none',
              color: '#e0e0e0',
              transition: 'border-color 0.2s',
            }}
          >
            <span style={{
              width: 36, height: 36, borderRadius: '50%',
              background: node.color, opacity: 0.2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: node.color, flexShrink: 0,
            }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{node.label}</div>
              <div style={{ color: '#666', fontSize: '0.78rem' }}>{node.en}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{
        border: '1px solid #222', borderRadius: 10, padding: '1.5rem',
        background: '#111118', display: 'flex', gap: '1.5rem', alignItems: 'center',
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>指挥官智能体工作流</h2>
          <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6 }}>
            上传作战方案文本 → 意图理解（21项明确） → 情况判断 → 形成3个构想方案 → 选择1个方案 → 制定详细计划 → 仿真推演 → 效果评估 → 决策输出
          </p>
        </div>
        <Link
          to="/upload"
          style={{
            padding: '0.7rem 1.5rem',
            background: '#4a9eff',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            flexShrink: 0,
          }}
        >
          上传作战方案
        </Link>
      </div>
    </div>
  );
}
