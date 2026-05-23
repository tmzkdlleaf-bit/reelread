import { useState, useRef } from 'react'
import { updateProfile } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, storage } from '../lib/firebase'
import { Stars } from './Stars'

export default function ProfileModal({ user, t, acc, works, onClose }) {
  const [name, setName] = useState(user.displayName || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef()

  const myReviews = works.flatMap(w =>
    (w.reviews || []).filter(r => r.userId === user.uid).map(r => ({
      ...r, workTitle: w.title, workType: w.type
    }))
  )
  const avgScore = myReviews.length
    ? (myReviews.reduce((s, r) => s + r.score, 0) / myReviews.length).toFixed(1)
    : '-'

  const currentPhoto = previewUrl || user.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=random`

  const handlePhotoClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return alert('5MB 이하 이미지만 업로드 가능해요')

    // 미리보기
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewUrl(ev.target.result)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await updateProfile(auth.currentUser, { photoURL: url })
      setPreviewUrl(url)
    } catch (e) {
      alert('업로드 실패: ' + e.message)
      setPreviewUrl(null)
    }
    setUploading(false)
  }

  const handleSaveName = async () => {
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
        padding: '22px 20px 36px', zIndex: 201,
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 3, background: t.muted2, borderRadius: 2, margin: '0 auto 20px' }} />

        {/* Avatar 편집 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={currentPhoto}
              alt="profile"
              style={{ width: 64, height: 64, borderRadius: '50%', border: `2px solid ${t.line2}`, objectFit: 'cover' }}
            />
            {/* 카메라 오버레이 */}
            <div
              onClick={handlePhotoClick}
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', opacity: uploading ? 1 : 0,
                transition: 'opacity .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => !uploading && (e.currentTarget.style.opacity = '0')}
            >
              {uploading ? (
                <div style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: t.text }}>{user.displayName || '이름 없음'}</div>
            <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{user.email}</div>
            <div
              onClick={handlePhotoClick}
              style={{ fontSize: 12, color: acc.c, marginTop: 6, cursor: 'pointer' }}
            >
              {uploading ? '업로드 중...' : '사진 변경'}
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div style={{ display: 'flex', marginBottom: 22, background: t.bg3, borderRadius: 10, overflow: 'hidden' }}>
          {[
            ['감상 작품', myReviews.length + '편'],
            ['평균 별점', avgScore === '-' ? '-' : '★ ' + avgScore],
            ['영화', myReviews.filter(r => r.workType === 'movie').length + '편'],
            ['책', myReviews.filter(r => r.workType === 'book').length + '편'],
          ].map(([label, value], i, arr) => (
            <div key={label} style={{
              flex: 1, padding: '12px 6px', textAlign: 'center',
              borderRight: i < arr.length - 1 ? `0.5px solid ${t.line}` : 'none',
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: acc.c, marginBottom: 3 }}>{value}</div>
              <div style={{ fontSize: 11, color: t.muted }}>{label}</div>
            </div>
          ))}
        </div>

        {/* 닉네임 변경 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: t.muted, marginBottom: 8 }}>닉네임 변경</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="닉네임"
            style={{ ...inputStyle, marginBottom: 8 }}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
          />
          <button
            onClick={handleSaveName}
            disabled={saving}
            style={{
              width: '100%', padding: 10, borderRadius: 8, border: 'none',
              background: saved ? '#4d9e35' : acc.c,
              color: '#1a1208', fontSize: 13, fontWeight: 500,
              transition: 'background .2s', cursor: 'pointer',
            }}
          >
            {saving ? '저장 중...' : saved ? '저장됨 ✓' : '저장'}
          </button>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={async () => {
            const { signOut } = await import('firebase/auth')
            await signOut(auth)
            onClose()
          }}
          style={{
            width: '100%', padding: 10, borderRadius: 8,
            border: `0.5px solid ${t.line2}`, background: 'none',
            color: t.muted, fontSize: 13, cursor: 'pointer',
          }}
        >
          로그아웃
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
