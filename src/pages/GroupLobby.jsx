import { useState } from 'react'
import { createGroup, joinGroupByCode } from '../lib/groups'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function GroupLobby({ user, groups, t, acc, onSelectGroup }) {
  const [tab, setTab] = useState('list') // list | create | join
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      const { id, inviteCode } = await createGroup(user, groupName.trim())
      alert(`그룹 생성 완료!\n초대 코드: ${inviteCode}\n친구들에게 공유해주세요`)
      setGroupName('')
      setTab('list')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const handleJoin = async () => {
    if (!inviteCode.trim()) return setError('초대 코드를 입력해주세요')
    setLoading(true); setError('')
    try {
      await joinGroupByCode(user, inviteCode)
      setInviteCode('')
      setTab('list')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const tabBtn = (id, label) => (
    <button
      key={id}
      onClick={() => { setTab(id); setError('') }}
      style={{
        flex: 1, padding: '8px', border: 'none', borderRadius: 7,
        background: tab === id ? acc.c + '1a' : 'transparent',
        color: tab === id ? acc.c : t.muted,
        fontSize: 13, fontWeight: tab === id ? 500 : 400,
        fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
        borderBottom: `2px solid ${tab === id ? acc.c : 'transparent'}`,
      }}
    >{label}</button>
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
            alt="me"
            onClick={() => signOut(auth)}
            title="로그아웃"
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {groups.map(g => (
                  <div
                    key={g.id}
                    onClick={() => onSelectGroup(g)}
                    style={{
                      padding: '16px 18px', borderRadius: 12,
                      background: t.bg2, border: `0.5px solid ${t.line2}`,
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = acc.c}
                    onMouseLeave={e => e.currentTarget.style.borderColor = t.line2}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: t.text }}>{g.name}</div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={t.muted} strokeWidth="1.5"><path d="M6 4l4 4-4 4"/></svg>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Member avatars */}
                      <div style={{ display: 'flex', gap: -4 }}>
                        {(g.members || []).slice(0, 5).map((m, i) => (
                          <img
                            key={m.uid}
                            src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`}
                            alt={m.name}
                            title={m.name}
                            style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${t.bg2}`, marginLeft: i > 0 ? -8 : 0 }}
                          />
                        ))}
                        {g.members?.length > 5 && (
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: t.bg3, border: `2px solid ${t.bg2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: t.muted, marginLeft: -8 }}>
                            +{g.members.length - 5}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: t.muted }}>{g.members?.length || 0}명</div>
                    </div>
                    {/* Invite code */}
                    <div style={{ marginTop: 10, padding: '6px 10px', background: t.bg3, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: t.muted }}>초대 코드</span>
                      <span
                        style={{ fontSize: 13, fontWeight: 600, color: acc.c, letterSpacing: '0.1em', cursor: 'pointer' }}
                        onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(g.inviteCode); alert('초대 코드가 복사됐어요!') }}
                        title="클릭해서 복사"
                      >
                        {g.inviteCode}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create group */}
        {tab === 'create' && (
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: t.text, marginBottom: 20 }}>새 그룹 만들기</div>
            <input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="그룹 이름 (예: 영화 동호회)"
              style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            {error && <div style={{ color: '#e05a5a', fontSize: 13, marginBottom: 10 }}>{error}</div>}
            <button
              onClick={handleCreate}
              disabled={loading}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: acc.c, color: '#1a1208', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '생성 중...' : '그룹 만들기'}
            </button>
            <div style={{ marginTop: 16, padding: 14, background: t.bg2, borderRadius: 10, border: `0.5px solid ${t.line2}` }}>
              <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.8 }}>
                그룹을 만들면 <span style={{ color: acc.c }}>6자리 초대 코드</span>가 생성돼요.<br />
                친구들에게 코드를 공유하면 같은 그룹에서 감상평을 나눌 수 있어요.
              </div>
            </div>
          </div>
        )}

        {/* Join group */}
        {tab === 'join' && (
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: t.text, marginBottom: 20 }}>초대 코드로 참가</div>
            <input
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              placeholder="초대 코드 6자리 입력"
              style={{ ...inputStyle, letterSpacing: '0.15em', fontSize: 18, textAlign: 'center', fontWeight: 600 }}
              maxLength={6}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
            {error && <div style={{ color: '#e05a5a', fontSize: 13, marginBottom: 10 }}>{error}</div>}
            <button
              onClick={handleJoin}
              disabled={loading}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: acc.c, color: '#1a1208', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '참가 중...' : '그룹 참가'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
