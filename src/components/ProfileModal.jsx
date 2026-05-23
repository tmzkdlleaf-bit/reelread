import { useState } from 'react'
import { updateProfile } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function ProfileModal({ user, t, acc, works, onClose }) {
  const [name, setName] = useState(user.displayName || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const myReviews = works.flatMap(w =>
    (w.reviews || []).filter(r => r.userId === user.uid).map(r => ({ ...r, workTitle: w.title, workType: w.type }))
  )
  const avgScore = myReviews.length
    ? (myReviews.reduce((s, r) => s + r.score, 0) / myReviews.length).toFixed(1)
    : '-'

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert('저장 실패: ' + e.message)
    }
    setSaving(false)
  }

  const inputStyle = {
    width: '100%', background: t.bg3, border: `0.5px solid ${t.line2}`,
    borderRadius: 8, padding: '10px 13px', color: t.text,
    fontSize: 13, outline: 'none', marginBottom: 8,
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.62)' }} onClick={onClose} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 680,
        background: t.bg2, borderTop: `0.5px solid ${t.line2}`,
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
        padding: '22px 20px 36px', zIndex: 201,
      }}>
        <div style={{ width: 36, height: 3, background: t.muted2, borderRadius: 2, margin: '0 auto 20px' }} />

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=random`}
            alt="profile"
            style={{ width: 56, height: 56, borderRadius: '50%', border: `2px solid ${t.line2}` }}
          />
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: t.text }}>{user.displayName || '이름 없음'}</div>
            <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{user.email}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: t.bg3, borderRadius: 10, overflow: 'hidden' }}>
          {[
            ['감상한 작품', myReviews.length + '편'],
            ['평균 별점', avgScore === '-' ? '-' : '★ ' + avgScore],
            ['영화', myReviews.filter(r => r.workType === 'movie').length + '편'],
            ['책', myReviews.filter(r => r.workType === 'book').length + '편'],
          ].map(([label, value], i, arr) => (
            <div key={label} style={{
              flex: 1, padding: '12px 8px', textAlign: 'center',
              borderRight: i < arr.length - 1 ? `0.5px solid ${t.line}` : 'none',
            }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: acc.c, marginBottom: 3 }}>{value}</div>
              <div style={{ fontSize: 11, color: t.muted }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Edit name */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: t.muted, marginBottom: 8 }}>닉네임 변경</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="닉네임"
            style={inputStyle}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: saved ? '#4d9e35' : acc.c, color: '#1a1208', fontSize: 13, fontWeight: 500, transition: 'background .2s' }}
          >
            {saving ? '저장 중...' : saved ? '저장됨 ✓' : '저장'}
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={async () => { const { signOut } = await import('firebase/auth'); await signOut(auth); onClose() }}
          style={{ width: '100%', padding: '10px', borderRadius: 8, border: `0.5px solid ${t.line2}`, background: 'none', color: t.muted, fontSize: 13 }}
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
