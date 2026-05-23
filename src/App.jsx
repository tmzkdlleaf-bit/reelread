import { useState, useEffect } from 'react'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import {
  collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc,
  query, where,
} from 'firebase/firestore'
import { auth, db } from './lib/firebase'
import { THEMES, ACC_LIST, POSTER_COLORS } from './lib/theme'
import { subscribeMyGroups } from './lib/groups'
import { getGroupProfile } from './lib/groupProfile'
import './index.css'

import LoginPage from './pages/LoginPage'
import GroupLobby from './pages/GroupLobby'
import FeedPage from './pages/FeedPage'
import MembersPage from './pages/MembersPage'
import CreatorsPage from './pages/CreatorsPage'
import SettingsModal from './components/SettingsModal'
import AddWorkModal from './components/AddWorkModal'
import ProfileModal from './components/ProfileModal'

const STORAGE = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def } catch { return def } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}

export default function App() {
  const [user, setUser] = useState(undefined)
  const [groups, setGroups] = useState([])
  const [currentGroup, setCurrentGroup] = useState(null)
  const [works, setWorks] = useState([])
  const [view, setView] = useState('feed')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('recent')
  const [search, setSearch] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showAddWork, setShowAddWork] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const [theme, setTheme] = useState(() => STORAGE.get('theme', 'dark'))
  const [accIdx, setAccIdx] = useState(() => STORAGE.get('accIdx', 0))
  const [movieColor, setMovieColor] = useState(() => STORAGE.get('movieColor', '#7ab0e0'))
  const [bookColor, setBookColor] = useState(() => STORAGE.get('bookColor', '#90c97a'))
  const [animeColor, setAnimeColor] = useState(() => STORAGE.get('animeColor', '#c47ac0'))

  const t = THEMES[theme]
  const acc = ACC_LIST[accIdx]

  // Auth
  useEffect(() => {
    // 리디렉트 로그인 결과 처리
    getRedirectResult(auth).catch(() => {})
    return onAuthStateChanged(auth, u => setUser(u))
  }, [])

  // My groups
  useEffect(() => {
    if (!user) return
    return subscribeMyGroups(user.uid, setGroups)
  }, [user])

  // Works for current group
  useEffect(() => {
    if (!user || !currentGroup) return
    const q = query(
      collection(db, 'works'),
      where('groupId', '==', currentGroup.id)
    )
    return onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // 클라이언트에서 정렬 (인덱스 불필요)
      docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      setWorks(docs)
    })
  }, [user, currentGroup])

  // Sync currentGroup data from groups list (for member updates etc)
  useEffect(() => {
    if (!currentGroup) return
    const updated = groups.find(g => g.id === currentGroup.id)
    if (updated) setCurrentGroup(updated)
  }, [groups])

  useEffect(() => { STORAGE.set('theme', theme) }, [theme])
  useEffect(() => { STORAGE.set('accIdx', accIdx) }, [accIdx])
  useEffect(() => { STORAGE.set('movieColor', movieColor) }, [movieColor])
  useEffect(() => { STORAGE.set('bookColor', bookColor) }, [bookColor])
  useEffect(() => { STORAGE.set('animeColor', animeColor) }, [animeColor])

  useEffect(() => {
    document.body.style.background = t.bg
    document.body.style.color = t.text
  }, [t])

  const handleAddWork = async ({ type, title, creator }) => {
    const colorIndex = Math.floor(Math.random() * POSTER_COLORS.length)
    await addDoc(collection(db, 'works'), {
      type, title, creator, colorIndex,
      reviews: [],
      groupId: currentGroup.id,
      createdAt: Date.now(),
      addedBy: user.uid,
    })
  }

  const handleUpdateWork = async (workId, updates) => {
    await updateDoc(doc(db, 'works', workId), updates)
  }

  const handleDeleteWork = async (workId) => {
    await deleteDoc(doc(db, 'works', workId))
  }

  const handleDeleteReview = async (workId) => {
    const workRef = doc(db, 'works', workId)
    const work = works.find(w => w.id === workId)
    const reviews = (work?.reviews || []).filter(r => r.userId !== user.uid)
    await updateDoc(workRef, { reviews })
  }

  const handleAddReview = async (workId, { score, text }) => {
    const workRef = doc(db, 'works', workId)
    const work = works.find(w => w.id === workId)
    let userName = user.displayName || user.email
    let userPhoto = user.photoURL
    try {
      const groupProfile = await getGroupProfile(currentGroup.id, user.uid)
      if (groupProfile?.name) userName = groupProfile.name
      if (groupProfile?.photoURL) userPhoto = groupProfile.photoURL
    } catch (e) {}
    const reviews = (work?.reviews || []).filter(r => r.userId !== user.uid)
    reviews.unshift({ userId: user.uid, userName, userPhoto, score, text, createdAt: Date.now() })
    await updateDoc(workRef, { reviews })
  }

  // Loading
  if (user === undefined) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#888', fontSize: 13 }}>로딩 중...</div>
      </div>
    )
  }

  if (!user) return <LoginPage t={t} acc={acc} />

  // Group lobby (그룹 미선택)
  if (!currentGroup) {
    return (
      <GroupLobby
        user={user} groups={groups} t={t} acc={acc}
        onSelectGroup={g => { setCurrentGroup(g); setWorks([]); setView('feed') }}
      />
    )
  }

  const pillStyle = (active) => ({
    padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
    border: `0.5px solid ${active ? acc.dark : t.pillBorder}`,
    background: active ? acc.c + '1a' : t.pillBg,
    color: active ? acc.c : t.pillText,
    whiteSpace: 'nowrap',
    display: 'inline-flex', alignItems: 'center', gap: 5,
  })

  const tabStyle = (active) => ({
    padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
    border: 'none', background: active ? t.bg4 : 'transparent',
    color: active ? t.text : t.muted,
    cursor: 'pointer', letterSpacing: '.04em',
  })

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: t.bg }}>

      {/* Topbar */}
      <div style={{ background: t.bg, borderBottom: `0.5px solid ${t.line}`, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {/* Back to groups */}
          <button
            onClick={() => setCurrentGroup(null)}
            style={{ width: 28, height: 28, borderRadius: 7, border: `0.5px solid ${t.iconBorder}`, background: 'transparent', color: t.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}
            title="그룹 목록"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 4l-4 4 4 4"/></svg>
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentGroup.name}
            </div>
            <div style={{ fontSize: 11, color: t.muted }}>멤버 {currentGroup.members?.length || 0}명</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', background: t.bg3, borderRadius: 8, padding: 3 }}>
            {[['feed','피드'],['members','멤버'],['creators','감독·작가']].map(([v, label]) => (
              <button key={v} style={tabStyle(view === v)} onClick={() => setView(v)}>{label}</button>
            ))}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            style={{ width: 30, height: 30, borderRadius: 8, border: `0.5px solid ${t.iconBorder}`, background: 'transparent', color: t.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
              <path d="M16.2 10c0-.3 0-.6-.1-.9l1.9-1.5-1.8-3.1-2.2.9c-.5-.4-1-.7-1.6-.9L12 2h-4l-.4 2.5c-.6.2-1.1.5-1.6.9l-2.2-.9L2 7.6l1.9 1.5c0 .3-.1.6-.1.9s0 .6.1.9L2 12.4l1.8 3.1 2.2-.9c.5.4 1 .7 1.6.9L8 18h4l.4-2.5c.6-.2 1.1-.5 1.6-.9l2.2.9 1.8-3.1-1.9-1.5c.1-.3.1-.6.1-.9Z"/>
            </svg>
          </button>
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=random`}
            alt="me"
            onClick={() => setShowProfile(true)}
            style={{ width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', border: `1.5px solid ${t.line2}`, flexShrink: 0 }}
          />
        </div>
      </div>

      {/* Search + Filter */}
      {view === 'feed' && (
        <>
          <div style={{ padding: '10px 20px', borderBottom: `0.5px solid ${t.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', background: t.searchBg, border: `0.5px solid ${t.searchBorder}`, borderRadius: 8, overflow: 'hidden', height: 36 }}>
              <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={t.searchIco} strokeWidth="1.6">
                  <circle cx="6.8" cy="6.8" r="4.2"/><path d="M10 10l3 3"/>
                </svg>
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="제목, 감독, 작가 검색..."
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 12px 0 0', fontSize: 13, color: t.searchText, outline: 'none', height: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderBottom: `0.5px solid ${t.line}`, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: t.muted, marginRight: 2 }}>유형</span>
            {[['all','전체'],['movie','영화'],['book','책'],['anime','애니']].map(([f, label]) => (
              <button key={f} style={pillStyle(filter === f)} onClick={() => setFilter(f)}>
                {f !== 'all' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: f === 'movie' ? movieColor : f === 'book' ? bookColor : animeColor }} />}
                {label}
              </button>
            ))}
            <div style={{ width: 0.5, height: 14, background: t.line2, margin: '0 4px' }} />
            <span style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: t.muted, marginRight: 2 }}>정렬</span>
            {[['recent','최신순'],['score','별점순'],['cnt','평 많은']].map(([s, label]) => (
              <button key={s} style={pillStyle(sort === s)} onClick={() => setSort(s)}>{label}</button>
            ))}
          </div>
        </>
      )}

      {view !== 'feed' && (
        <div style={{ padding: '16px 20px 10px', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: t.muted, borderBottom: `0.5px solid ${t.line}` }}>
          {view === 'members' ? '멤버별 감상평' : '감독 · 작가'}
        </div>
      )}

      <div style={{ flex: 1, paddingBottom: 90 }}>
        {view === 'feed' && <FeedPage works={works} t={t} acc={acc} movieColor={movieColor} bookColor={bookColor} animeColor={animeColor} currentUser={user} onAddReview={handleAddReview} onDeleteWork={handleDeleteWork} onDeleteReview={handleDeleteReview} onUpdateWork={handleUpdateWork} filter={filter} sort={sort} search={search} />}
        {view === 'members' && <MembersPage works={works} t={t} acc={acc} movieColor={movieColor} bookColor={bookColor} animeColor={animeColor} groupMembers={currentGroup.members} />}
        {view === 'creators' && <CreatorsPage works={works} t={t} acc={acc} movieColor={movieColor} bookColor={bookColor} animeColor={animeColor} />}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddWork(true)}
        style={{ position: 'fixed', bottom: 28, right: 'calc(50% - 320px)', zIndex: 100, width: 52, height: 52, borderRadius: '50%', border: 'none', background: acc.c, color: '#1a1208', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 5px ${acc.c}28` }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {showSettings && (
        <SettingsModal t={t} acc={acc} theme={theme} movieColor={movieColor} bookColor={bookColor} animeColor={animeColor}
          onTheme={setTheme} onAccent={setAccIdx}
          onTypeColor={(key, c) => key === 'movie' ? setMovieColor(c) : key === 'book' ? setBookColor(c) : setAnimeColor(c)}
          onClose={() => setShowSettings(false)} />
      )}
      {showAddWork && (
        <AddWorkModal t={t} acc={acc} movieColor={movieColor} bookColor={bookColor} animeColor={animeColor} onAdd={handleAddWork} onClose={() => setShowAddWork(false)} />
      )}
      {showProfile && (
        <ProfileModal user={user} t={t} acc={acc} works={works} onClose={() => setShowProfile(false)} />
      )}
    </div>
  )
}
