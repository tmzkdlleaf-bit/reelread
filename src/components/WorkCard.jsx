import { useState } from 'react'
import { Stars } from './Stars'
import { POSTER_COLORS } from '../lib/theme'

function timeAgo(ts) {
  if (!ts) return ''
  const d = Math.floor((Date.now() - ts) / 86400000)
  return d === 0 ? '오늘' : d === 1 ? '어제' : `${d}일 전`
}

function avgScore(reviews) {
  if (!reviews?.length) return 0
  return reviews.reduce((s, r) => s + r.score, 0) / reviews.length
}

export default function WorkCard({ work, t, acc, movieColor, bookColor, animeColor, currentUser, onAddReview }) {
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [score, setScore] = useState(0)
  const [text, setText] = useState('')
  const [hoverStar, setHoverStar] = useState(0)

  const reviews = work.reviews || []
  const avg = avgScore(reviews)
  const tc = work.type === 'movie' ? movieColor : work.type === 'book' ? bookColor : animeColor
  const pc = POSTER_COLORS[work.colorIndex % POSTER_COLORS.length]
  const myReview = reviews.find(r => r.userId === currentUser?.uid)

  const handleSubmit = async () => {
    if (!score) return alert('별점을 선택해주세요')
    if (!text.trim()) return alert('감상평을 입력해주세요')
    await onAddReview(work.id, { score, text: text.trim() })
    setScore(0)
    setText('')
    setShowForm(false)
  }

  return (
    <div style={{ borderBottom: `0.5px solid ${t.line}` }}>
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 16,
          padding: '18px 20px 14px', cursor: 'pointer',
          background: t.bg, transition: 'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = t.bg3}
        onMouseLeave={e => e.currentTarget.style.background = t.bg}
      >
        {/* Poster */}
        <div style={{
          width: 52, height: 76, borderRadius: 5, flexShrink: 0,
          background: pc.bg, color: pc.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Serif Display', serif", fontSize: 17,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: tc }} />
          {work.title.slice(0, 2)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase', color: t.muted, marginBottom: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: tc, display: 'inline-block', marginRight: 5 }} />
            {work.type === 'movie' ? '영화' : work.type === 'book' ? '책' : '애니'}
          </div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, lineHeight: 1.25, marginBottom: 3, color: t.text }}>{work.title}</div>
          <div style={{ fontSize: 12, color: t.muted, marginBottom: 10 }}>{work.creator}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {avg > 0 && (
              <>
                <Stars score={avg} size={12} accColor={acc.c} muted2={t.muted2} />
                <span style={{ fontSize: 14, fontWeight: 500, color: acc.c }}>{avg.toFixed(1)}</span>
              </>
            )}
            <span style={{ fontSize: 12, color: t.muted }}>{reviews.length}개의 평</span>
            <button
              onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
              style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11, color: t.muted, background: 'none', border: 'none', padding: '3px 0',
              }}
            >
              {open ? '닫기' : '평 보기'}
              <div style={{ width: 15, height: 15, border: `0.5px solid ${t.muted2}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {open ? <line x1="1" y1="4" x2="7" y2="4" /> : <><line x1="4" y1="1" x2="4" y2="7" /><line x1="1" y1="4" x2="7" y2="4" /></>}
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Panel */}
      {open && (
        <div style={{ background: t.bg, borderTop: `0.5px solid ${t.line}` }}>
          {reviews.length === 0 && (
            <div style={{ padding: '14px 20px 14px 88px', color: t.muted, fontSize: 13 }}>아직 감상평이 없어요.</div>
          )}
          {reviews.map(r => (
            <div key={r.userId} style={{ padding: '13px 20px 13px 88px', borderTop: `0.5px solid ${t.line}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <img
                  src={r.userPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName)}&background=random`}
                  alt={r.userName}
                  style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{r.userName}</span>
                <Stars score={r.score} size={10} accColor={acc.c} muted2={t.muted2} />
                <span style={{ fontSize: 12, fontWeight: 500, color: acc.c }}>{r.score}.0</span>
                <span style={{ fontSize: 11, color: t.muted, marginLeft: 'auto' }}>{timeAgo(r.createdAt)}</span>
              </div>
              <div style={{ fontSize: 13, color: t.text, opacity: .88, lineHeight: 1.65 }}>{r.text}</div>
            </div>
          ))}

          {/* Add review */}
          {!showForm ? (
            <button
              onClick={() => { setShowForm(true); setScore(myReview?.score || 0); setText(myReview?.text || '') }}
              style={{
                display: 'block', width: 'calc(100% - 108px)', margin: '0 20px 14px 88px',
                padding: 9, borderRadius: 7, border: `0.5px dashed ${t.line2}`,
                background: 'none', color: t.muted, fontSize: 12, textAlign: 'center', letterSpacing: '.03em',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = acc.dark; e.currentTarget.style.color = acc.c }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.line2; e.currentTarget.style.color = t.muted }}
            >
              + {myReview ? '내 감상평 수정' : '내 감상평 남기기'}
            </button>
          ) : (
            <div style={{ padding: '14px 20px 14px 88px', borderTop: `0.5px solid ${t.line}` }}>
              {/* Star picker */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {[1,2,3,4,5].map(i => (
                  <div
                    key={i}
                    onClick={() => setScore(i)}
                    onMouseEnter={() => setHoverStar(i)}
                    onMouseLeave={() => setHoverStar(0)}
                    style={{
                      width: 28, height: 28, cursor: 'pointer',
                      background: i <= (hoverStar || score) ? acc.c : t.muted2,
                      clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
                      transition: 'transform .1s',
                      transform: i <= (hoverStar || score) ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="한 줄로 남기는 솔직한 감상..."
                rows={2}
                style={{
                  width: '100%', background: t.bg3, border: `0.5px solid ${t.line2}`,
                  borderRadius: 8, padding: '10px 12px', color: t.text,
                  fontSize: 13, resize: 'none', outline: 'none', marginBottom: 10,
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowForm(false)} style={{ padding: '7px 14px', borderRadius: 7, border: `0.5px solid ${t.line2}`, background: 'none', color: t.muted, fontSize: 12 }}>취소</button>
                <button onClick={handleSubmit} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: acc.c, color: '#1a1208', fontSize: 12, fontWeight: 500 }}>남기기</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
