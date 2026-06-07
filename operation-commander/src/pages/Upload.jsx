import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!text.trim()) return;
    setLoading(true);
    setTimeout(() => {
      sessionStorage.setItem('operationPlan', text);
      navigate('/nodes/intent-understanding');
    }, 800);
  };

  return (
    <div style={{ maxWidth: 700, margin: '3rem auto', padding: '0 2rem' }}>
      <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>上传作战方案</h2>
      <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        输入或粘贴作战方案文本，系统将自动进行意图理解与情况判断
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="请输入作战方案内容，例如：敌军部署在A区域，我方计划在B方向实施突击..."
        style={{
          width: '100%',
          height: 300,
          background: '#111118',
          border: '1px solid #333',
          borderRadius: 8,
          color: '#e0e0e0',
          padding: '1rem',
          fontSize: '0.9rem',
          fontFamily: 'system-ui, sans-serif',
          resize: 'vertical',
          outline: 'none',
          lineHeight: 1.6,
        }}
      />
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          style={{
            padding: '0.7rem 2rem',
            background: text.trim() ? '#4a9eff' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            fontWeight: 600,
            fontSize: '0.9rem',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '分析中...' : '开始意图理解 →'}
        </button>
      </div>
    </div>
  );
}
