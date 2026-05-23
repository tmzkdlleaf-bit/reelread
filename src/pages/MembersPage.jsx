import { useState } from 'react'
import { Stars } from '../components/Stars'

function timeAgo(ts) {
  if (!ts) return ''
  const d = Math.floor((Date.now() - ts) / 86400000)
  return d === 0 ? '오늘' : d === 1 ? '어제' : `${d}일 전`
}

export default function MembersPage({ works, t, acc, movieColor, bookColor, animeColor, groupMembers = [] }) {
  const [selected, setSelected] = useState(null)

  // 그룹 멤버 기준으로 표시 (리뷰 없는 멤버도 보임)
  const membersMap = {}
  groupMembers.forEach(m => {
    membersMap[m.uid] = { ...m, userId: m.uid, userName: m.name, userPhoto: m.photo, reviews: [] }
  })
  works.forEach(w => {
    (w.reviews || []).forEach(r => {
      if (!membersMap[r.userId]) {
        membersMap[r.userId] = { userId: r.userId, userName: r.userName, userPhoto: r.userPhoto, reviews: [] }
      }
      membersMap[r.userId].reviews.push({ ...r, workTitle: w.title, workType: w.type })
    })
  })
  const members = Object.values(membersMap)

  if (selected) {
    const member = membersMap[selected]
    if (!member) return null
    const sorted = [...member.reviews].sort((a, b) => b.createdAt - a.createdAt)
    return (
      <div>
        <div onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: `0.5px solid ${t.line}`, cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={t.muted} strokeWidth="1.5"><path d="M10 4l-4 4 4 4"/></svg>
          <span style={{ fontSize: 13, color: t.muted }}>전체 멤버</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: `0.5px solid ${t.line}` }}>
          <img src={member.userPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.userName)}&background=random`} alt={member.userName} style={{ width: 38, height: 38, borderRadius: '50%' }} />
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: t.text }}>{member.userName}의 감상평</div>
          <span style={{ fontSize: 12, color: t.muted, marginLeft: 'auto' }}>{member.reviews.length}편</span>
        </div>
        {sorted.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: t.muted, fontSize: 13 }}>아직 남긴 감상평이 없어요</div>
        )}
        {sorted.map((r, i) => (
          <div key={i} style={{ padding: '15px 20px', borderBottom: `0.5px solid ${t.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: r.workType === 'movie' ? movieColor : r.workType === 'book' ? bookColor : animeColor }} />
              <span style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: t.muted }}>{r.workType === 'movie' ? '영화' : r.workType === 'book' ? '책' : '애니'}</span>
              <span style={{ fontSize: 15, fontFamily: "'DM Serif Display', serif", color: t.text }}>{r.workTitle}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: t.muted }}>{timeAgo(r.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
              <Stars score={r.score} size={10} accColor={acc.c} muted2={t.muted2} />
              <span style={{ fontSize: 12, color: acc.c, fontWeight: 500 }}>{r.score}.0</span>
            </div>
            <div style={{ fontSize: 13, color: t.text, opacity: .88, lineHeight: 1.65 }}>{r.text}</div>
          </div>
        ))}
      </div>
    )
  }

  if (members.length === 0) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: t.muted, fontSize: 13 }}>아직 멤버가 없어요</div>
  }

  return (
    <div>
      {members.map(m => {
        const a = m.reviews.length ? (m.reviews.reduce((s, r) => s + r.score, 0) / m.reviews.length).toFixed(1) : '-'
        const mv = m.reviews.filter(r => r.workType === 'movie').length
        const bk = m.reviews.filter(r => r.workType === 'book').length
        return (
          <div key={m.userId} onClick={() => setSelected(m.userId)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: `0.5px solid ${t.line}`, cursor: 'pointer', background: t.bg }}
            onMouseEnter={e => e.currentTarget.style.background = t.bg3}
            onMouseLeave={e => e.currentTarget.style.background = t.bg}
          >
            <img src={m.userPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.userName)}&background=random`} alt={m.userName}
              style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2, color: t.text }}>{m.userName}</div>
              <div style={{ fontSize: 12, color: t.muted }}>
                <span style={{ color: movieColor }}>영화 {mv}</span> · <span style={{ color: bookColor }}>책 {bk}</span> · 평균 ★ {a}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={t.muted} strokeWidth="1.5"><path d="M6 4l4 4-4 4"/></svg>
          </div>
        )
      })}
    </div>
  )
}
