import { useState, useRef, useEffect } from 'react'
import { saveGroupProfile, uploadGroupPhoto } from '../lib/groupProfile'

export default function GroupProfileModal({ user, group, currentProfile, t, acc, onClose, onSaved }) {
  const [name, setName] = useState(currentProfile?.name || user.displayName || '')
  const [photoURL, setPhotoURL] = useState(currentProfile?.photoURL || user.photoURL || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef()

  const displayPhoto = photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=random`

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return alert('5MB 이하 이미지만 가능해요')
    setUploading(true)
    try {
      const url = await uploadGroupPhoto(group.id, user.uid, file)
      setPhotoURL(url)
    } catch (err) {
      alert('업로드 실패: ' + err.message)
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!name.trim()) return alert('닉네임을 입력해주세요')
    setSaving(true)
    try {
      await saveGroupProfile(group.id, user.uid, {
        name: name.trim(),
        photoURL,
      })
      setSaved(true)
      setTimeout(() => { setSaved(false); onSaved?.(); onClose() }, 1000)
    } catch (err) {
      alert('저장 실패: ' + err.message)
    }
    setSaving(false)
  }

  const inputStyle = {
    width: '100%', background: t.bg3, border: `0.5px solid ${t.line2}`,
    borderRadius: 8, padding: '10px 13px', color: t.text,
    fontSize: 13, outline: 'none', fontFamily: "'DM Sans', sans-serif",
    marginBottom: 10,
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)' }} onClick={onClose} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 680,
        background: t.bg2, borderTop: `0.5px solid ${t.line2}`,
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
        padding: '22px 20px 36px', zIndex: 301,
      }}>
        <div style={{ width: 36, height: 3, background: t.muted2, borderRadius: 2, margin: '0 auto 18px' }} />
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: t.text, marginBottom: 6 }}>
          그룹 프로필 설정
        </div>
        <div style={{ fontSize: 12, color: t.muted, marginBottom: 20 }}>
          <span style={{ color: acc.c }}>{group.name}</span> 에서 사용할 닉네임과 사진이에요
        </div>

        {/* 사진 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={displayPhoto} alt="profile"
              style={{ width: 64, height: 64, borderRadius: '50%', border: `2px solid ${t.line2}`, objectFit: 'cover' }} />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', opacity: uploading ? 1 : 0, transition: 'opacity .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => !uploading && (e.currentTarget.style.opacity = '0')}
            >
              {uploading
                ? <div style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
              }
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 500, marginBottom: 4 }}>{name || '닉네임 없음'}</div>
            <div onClick={() => fileInputRef.current?.click()} style={{ fontSize: 12, color: acc.c, cursor: 'pointer' }}>
              {uploading ? '업로드 중...' : '사진 변경'}
            </div>
          </div>
        </div>

        {/* 닉네임 */}
        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: t.muted, marginBottom: 8 }}>닉네임</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="이 그룹에서 쓸 닉네임" style={inputStyle} onKeyDown={e => e.key === 'Enter' && handleSave()} />

        <button onClick={handleSave} disabled={saving || uploading} style={{
          width: '100%', padding: 11, borderRadius: 8, border: 'none',
          background: saved ? '#4d9e35' : acc.c,
          color: '#1a1208', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          transition: 'background .2s',
        }}>
          {saving ? '저장 중...' : saved ? '저장됨 ✓' : '저장'}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
