import React, { useState } from 'react';
import './App.css';

function App() {
  const [word, setWord] = useState('');
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateCard = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setError('');
    setCardData(null);

    try {
      // 🎯 使用完全免费、免 Key 的有道词典官方接口
      const response = await fetch(`https://dict.youdao.com/suggest?q=${encodeURIComponent(word)}&num=1&doctype=json`);
      
      if (!response.ok) throw new Error('网络请求失败，请稍后重试');
      
      const data = await response.json();
      
      // 解析有道返回的结构
      if (data && data.data && data.data.entries && data.data.entries.length > 0) {
        const entry = data.data.entries[0];
        
        // 构建你背单词卡片所需要的数据
        setCardData({
          word: word,
          phonetic: entry.phone ? `/${entry.phone}/` : '', // 音标
          translation: entry.explain, // 中文释义
          // 免费接口提供标准释义，我们模拟一些例句供学习
          sentences: [
            {
              en: `This is a demo sentence for learning the word "${word}".`,
              cn: `这是学习单词 “${word}” 的示范例句。`
            }
          ]
        });
      } else {
        throw new Error('未找到该单词的释义，请换个单词试试。');
      }
    } catch (err) {
      setError(err.message || '生成单词卡失败，请检查网络');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h1 className="title">WordNest 单词巢 🪹</h1>
      
      <div className="input-group" style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={word} 
          onChange={(e) => setWord(e.target.value)} 
          placeholder="输入英文单词，如 Buddhism..." 
          style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
      </div>

      <button 
        onClick={handleCreateCard} 
        disabled={loading}
        style={{ width: '100%', padding: '12px', fontSize: '16px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        {loading ? '正在生成单词卡...' : '生成单词卡'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '15px', padding: '10px', backgroundColor: '#FEE2E2', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {cardData && (
        <div className="word-card" style={{ marginTop: '20px', padding: '20px', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#111827' }}>{cardData.word}</h2>
          {cardData.phonetic && <p style={{ margin: '0 0 15px 0', color: '#6B7280', fontStyle: 'italic' }}>{cardData.phonetic}</p>}
          
          <div style={{ padding: '10px 0', borderTop: '1px solid #F3F4F6' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#374151' }}>中文释义</h4>
            <p style={{ margin: '0', color: '#4B5563' }}>{cardData.translation}</p>
          </div>

          <div style={{ padding: '10px 0', borderTop: '1px solid #F3F4F6', marginTop: '10px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#374151' }}>学习例句</h4>
            {cardData.sentences.map((s, idx) => (
              <div key={idx} style={{ marginBottom: '10px' }}>
                <p style={{ margin: '0 0 3px 0', color: '#1F2937', fontWeight: '500' }}>{s.en}</p>
                <p style={{ margin: '0', color: '#6B7280', fontSize: '14px' }}>{s.cn}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;