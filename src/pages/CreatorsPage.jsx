import { useState } from 'react'
import { Stars } from '../components/Stars'
import { POSTER_COLORS } from '../lib/theme'

function timeAgo(ts) {
  if (!ts) return ''
  const d = Math.floor((Date.now() - ts) / 86400000)
  return d === 0 ? '오늘' : d === 1 ? '어제' : `${d}일 전`
}

function avg(reviews) {
  if (!reviews?.length) return 0
  return reviews.reduce((s, r) => s + r.score, 0) / reviews.length
}

export default function CreatorsPage({ works, t, acc, movieColor, bookColor }) {
  const [selected, setSelected] = useState(null)

  const creatorsMap = {}
  works.forEach(w => {
    if (!creatorsMap[w.creator]) creatorsMap[w.creator] = { name: w.creator, works: [] }
    creatorsMap[w.creator].works.push(w)
  })
  const creators = Object.values(creatorsMap)

  if (selected) {
    const creator = creatorsMap[selected]
    return (
      <div>
        <div onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: `0.5px solid ${t.line}`, cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={t.muted} strokeWidth="1.5"><path d="M10 4l-4 4 4 4" /></svg>
          <span style={{ fontSize: 13, color: t.muted }}>전체 목록</span>
        </div>
        <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${t.line}`, fontFamily: "'DM Serif Display', serif", fontSize: 17, color: t.text }}>{creator.name}</div>
        {creator.works.map(w => {
          const a = avg(w.reviews)
          const pc = POSTER_COLORS[w.colorIndex % POSTER_COLORS.length]
          const tc = w.type === 'movie' ? movieColor : bookColor
          return (
            <div key={w.id} style={{ padding: '18px 20px', borderBottom: `0.5px solid ${t.line}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{ width: 44, height: 62, borderRadius: 4, background: pc.bg, color: pc.fg, fontFamily: "'DM Serif Display', serif", fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: tc }} />
                  {w.title.slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase', color: tc, marginBottom: 4 }}>{w.type === 'movie' ? '영화' : '책'}</div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: t.text }}>{w.title}</div>
                  {a > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                      <Stars score={a} size={10} accColor={acc.c} muted2={t.muted2} />
                      <span style={{ fontSize: 12, color: acc.c }}>{a.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              {(w.reviews || []).map(r => (
                <div key={r.userId} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderTop: `0.5px solid ${t.line}` }}>
                  <img src={r.userPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName)}&background=random`} alt={r.userName} style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{r.userName}</span>
                      <Stars score={r.score} size={10} accColor={acc.c} muted2={t.muted2} />
                      <span style={{ fontSize: 12, color: acc.c, fontWeight: 500 }}>{r.score}.0</span>
                      <span style={{ fontSize: 11, color: t.muted, marginLeft: 'auto' }}>{timeAgo(r.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: t.text, opacity: .88, lineHeight: 1.65 }}>{r.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      {creators.map(c => {
        const allR = c.works.flatMap(w => w.reviews || [])
        const a = allR.length ? (allR.reduce((s, r) => s + r.score, 0) / allR.length).toFixed(1) : '-'
        const mv = c.works.filter(w => w.type === 'movie')
        const bk = c.works.filter(w => w.type === 'book')
        return (
          <div key={c.name} onClick={() => setSelected(c.name)} style={{ padding: '14px 20px', borderBottom: `0.5px solid ${t.line}`, cursor: 'pointer', background: t.bg }}
            onMouseEnter={e => e.currentTarget.style.background = t.bg3}
            onMouseLeave={e => e.currentTarget.style.background = t.bg}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 15, fontFamily: "'DM Serif Display', serif", color: t.text }}>{c.name}</div>
              {a !== '-' && <span style={{ fontSize: 13, color: acc.c }}>{a}</span>}
            </div>
            <div style={{ fontSize: 12, color: t.muted }}>
              {mv.length > 0 && <span style={{ color: movieColor }}>영화 {mv.length}</span>}
              {mv.length > 0 && bk.length > 0 && ' · '}
              {bk.length > 0 && <span style={{ color: bookColor }}>책 {bk.length}</span>}
              {allR.length > 0 && ` · ${allR.length}개의 평`}
            </div>
          </div>
        )
      })}
    </div>
  )
}
