import { useState, useEffect } from 'react'
import { createGroup, joinGroupByCode } from '../lib/groups'
import { getGroupProfile, subscribeGroupProfile } from '../lib/groupProfile'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import GroupProfileModal from './GroupProfileModal'

export default function GroupLobby({ user, groups, t, acc, onSelectGroup }) {
  const [tab, setTab] = useState('list')
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingGroup, setEditingGroup] = useState(null)
  // groupId -> profile
  const [myProfiles, setMyProfiles] = useState({})

  // 각 그룹의 내 프로필 구독
  useEffect(() => {
    if (!groups.length) return
    const unsubs = groups.map(g =>
      subscribeGroupProfile(g.id, user.uid, profile => {
        setMyProfiles(prev => ({ ...prev, [g.id]: profile }))
      })
    )
    return () => unsubs.forEach(u => u())
  }, [groups.map(g => g.id).join(',')])

  const getDisplayProfile = (group) => {
    const p = myProfiles[group.id]
    // p가 null이면 아직 로딩 중이거나 설정 안 된 것 → Google 기본값 사용
    const name = (p && p.name) ? p.name : (user.displayName || user.email || 'Unknown')
    const photo = (p && p.photoURL) ? p.photoURL : (user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=random`)
    return { name, photo }
  }

  const inputStyle = {
    width: '100%', background: t.bg3, border: `0.5px solid ${t.line2}`,
    borderRadius: 8, padding: '11px 13px', color: t.text,
    fontSize: 14, outline: 'none', marginBottom: 10,
    fontFamily: "'DM Sans', sans-serif",
  }

  const handleCreate = async () => {
    if (!groupName.trim()) return setError('그룹 이름을 입력해주세요')
    setLoading(true); setError('')
    try {
      await createGroup(user, groupName.trim())
      setGroupName(''); setTab('list')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const handleJoin = async () => {
    if (!inviteCode.trim()) return setError('초대 코드를 입력해주세요')
    setLoading(true); setError('')
    try {
      await joinGroupByCode(user, inviteCode)
      setInviteCode(''); setTab('list')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const tabBtn = (id, label) => (
    <button key={id} onClick={() => { setTab(id); setError('') }} style={{
      flex: 1, padding: '8px', border: 'none', borderRadius: 7,
      background: tab === id ? acc.c + '1a' : 'transparent',
      color: tab === id ? acc.c : t.muted,
      fontSize: 13, fontWeight: tab === id ? 500 : 400,
      fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
      borderBottom: `2px solid ${tab === id ? acc.c : 'transparent'}`,
    }}>{label}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', flexDirection: 'column', maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: t.text }}>
          reel<span style={{ color: acc.c }}>&</span>read
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: t.muted }}>{user.displayName || user.email}</span>
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=random`}
            alt="me" onClick={() => signOut(auth)} title="로그아웃"
            style={{ width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', border: `1.5px solid ${t.line2}` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '0 20px', borderBottom: `0.5px solid ${t.line}` }}>
        {tabBtn('list', '내 그룹')}
        {tabBtn('create', '그룹 만들기')}
        {tabBtn('join', '코드로 참가')}
      </div>

      <div style={{ flex: 1, padding: '20px' }}>
        {/* Group list */}
        {tab === 'list' && (
          <div>
            {groups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>◎</div>
                <div style={{ color: t.muted, fontSize: 14, marginBottom: 6 }}>아직 참가한 그룹이 없어요</div>
                <div style={{ color: t.muted, fontSize: 12 }}>그룹을 만들거나 초대 코드로 참가해보세요</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {groups.map(g => {
                  const myProfile = getDisplayProfile(g)
                  return (
                    <div key={g.id} style={{ background: t.bg2, border: `0.5px solid ${t.line2}`, borderRadius: 12, overflow: 'hidden' }}>
                      {/* 그룹 진입 영역 */}
                      <div
                        onClick={() => onSelectGroup(g)}
                        style={{ padding: '16px 18px 12px', cursor: 'pointer', transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = t.bg3}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: t.text }}>{g.name}</div>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={t.muted} strokeWidth="1.5"><path d="M6 4l4 4-4 4"/></svg>
                        </div>
                        {/* 멤버 아바타 */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex' }}>
                            {(g.members || []).slice(0, 5).map((m, i) => (
                              <img key={m.uid} src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`}
                                alt={m.name} title={m.name}
                                style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${t.bg2}`, marginLeft: i > 0 ? -8 : 0, objectFit: 'cover' }} />
                            ))}
                            {g.members?.length > 5 && (
                              <div style={{ width: 26, height: 26, borderRadius: '50%', background: t.bg3, border: `2px solid ${t.bg2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: t.muted, marginLeft: -8 }}>
                                +{g.members.length - 5}
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: t.muted }}>{g.members?.length || 0}명</div>
                        </div>
                      </div>

                      {/* 하단 바 — 내 그룹 프로필 + 초대코드 */}
                      <div style={{ borderTop: `0.5px solid ${t.line}`, padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* 내 프로필 표시 + 편집 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={myProfile.photo} alt="me"
                            style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${acc.c}` }} />
                          <span style={{ fontSize: 12, color: t.text }}>{myProfile.name}</span>
                          <button
                            onClick={() => setEditingGroup(g)}
                            style={{ fontSize: 11, color: acc.c, background: 'none', border: `0.5px solid ${acc.dark}`, borderRadius: 10, padding: '2px 8px', cursor: 'pointer' }}
                          >편집</button>
                        </div>
                        {/* 초대코드 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: t.muted }}>코드</span>
                          <span
                            onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(g.inviteCode); alert('초대 코드가 복사됐어요!') }}
                            style={{ fontSize: 13, fontWeight: 600, color: acc.c, letterSpacing: '0.1em', cursor: 'pointer' }}
                            title="클릭해서 복사"
                          >{g.inviteCode}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Create */}
        {tab === 'create' && (
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: t.text, marginBottom: 20 }}>새 그룹 만들기</div>
            <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="그룹 이름" style={inputStyle} onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            {error && <div style={{ color: '#e05a5a', fontSize: 13, marginBottom: 10 }}>{error}</div>}
            <button onClick={handleCreate} disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: acc.c, color: '#1a1208', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '생성 중...' : '그룹 만들기'}
            </button>
          </div>
        )}

        {/* Join */}
        {tab === 'join' && (
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: t.text, marginBottom: 20 }}>초대 코드로 참가</div>
            <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="초대 코드 6자리" style={{ ...inputStyle, letterSpacing: '0.15em', fontSize: 18, textAlign: 'center', fontWeight: 600 }} maxLength={6} onKeyDown={e => e.key === 'Enter' && handleJoin()} />
            {error && <div style={{ color: '#e05a5a', fontSize: 13, marginBottom: 10 }}>{error}</div>}
            <button onClick={handleJoin} disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: acc.c, color: '#1a1208', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '참가 중...' : '그룹 참가'}
            </button>
          </div>
        )}
      </div>

      {/* 그룹 프로필 편집 모달 */}
      {editingGroup && (
        <GroupProfileModal
          user={user}
          group={editingGroup}
          currentProfile={myProfiles[editingGroup.id]}
          t={t} acc={acc}
          onClose={() => setEditingGroup(null)}
          onSaved={() => setEditingGroup(null)}
        />
      )}
    </div>
  )
}
