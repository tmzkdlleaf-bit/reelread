import { useState } from 'react'
import { WORK_TYPES } from '../lib/theme'

export default function AddWorkModal({ t, acc, movieColor, bookColor, animeColor, onAdd, onClose }) {
  const [type, setType] = useState('movie')
  const [title, setTitle] = useState('')
  const [creator, setCreator] = useState('')

  const typeColor = { movie: movieColor, book: bookColor, anime: animeColor }

  const handleAdd = () => {
    if (!title.trim() || !creator.trim()) return alert('제목과 정보를 모두 입력해주세요')
    onAdd({ type, title: title.trim(), creator: creator.trim() })
    onClose()
  }

  const pillStyle = (active) => ({
    padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
    border: `0.5px solid ${active ? acc.dark : t.pillBorder}`,
    background: active ? acc.c + '1a' : t.pillBg,
    color: active ? acc.c : t.pillText,
    display: 'inline-flex', alignItems: 'center', gap: 5,
  })

  const inputStyle = {
    width: '100%', display: 'block', marginBottom: 8,
    background: t.bg3, border: `0.5px solid ${t.line2}`,
    borderRadius: 8, padding: '10px 13px', color: t.text,
    fontSize: 13, outline: 'none', fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.62)' }} onClick={onClose} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 680,
        background: t.bg2, borderTop: `0.5px solid ${t.line2}`,
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
        padding: '22px 20px 32px', zIndex: 201,
      }}>
        <div style={{ width: 36, height: 3, background: t.muted2, borderRadius: 2, margin: '0 auto 18px' }} />
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: t.text, marginBottom: 14 }}>작품 추가</div>

        {/* Type selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {Object.entries(WORK_TYPES).map(([key, { label }]) => (
            <button key={key} style={pillStyle(type === key)} onClick={() => setType(key)}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: typeColor[key] }} />
              {label}
            </button>
          ))}
        </div>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="제목"
          style={inputStyle}
        />
        <input
          value={creator}
          onChange={e => setCreator(e.target.value)}
          placeholder={WORK_TYPES[type].creatorLabel}
          style={{ ...inputStyle, marginBottom: 0 }}
        />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 7, border: `0.5px solid ${t.line2}`, background: 'none', color: t.muted, fontSize: 13 }}>취소</button>
          <button onClick={handleAdd} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: acc.c, color: '#1a1208', fontSize: 13, fontWeight: 500 }}>추가</button>
        </div>
      </div>
    </div>
  )
}
