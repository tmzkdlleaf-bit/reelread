import { signInWithPopup, signInWithRedirect } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

export default function LoginPage({ t, acc }) {
  const handleLogin = async () => {
    try {
      // 팝업 먼저 시도, 실패하면 리디렉트
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider)
        } catch (e2) {
          alert('로그인 실패: ' + e2.message)
        }
      } else if (e.code !== 'auth/cancelled-popup-request') {
        alert('로그인 실패: ' + e.message)
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 32 }}>
      <div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: t.text, textAlign: 'center' }}>
          reel<span style={{ color: acc.c }}>&</span>read
        </div>
        <div style={{ fontSize: 13, color: t.muted, textAlign: 'center', marginTop: 8 }}>
          친구들과 영화·책 감상평을 나눠요
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {['#2a1f3d','#1d2f1a','#1a2535'].map((bg, i) => (
          <div key={i} style={{ width: 52, height: 76, borderRadius: 6, background: bg, opacity: 0.6 + i * 0.15 }} />
        ))}
      </div>

      <button
        onClick={handleLogin}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderRadius: 12, border: `0.5px solid ${t.line2}`, background: t.bg2, color: t.text, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
        </svg>
        Google로 로그인
      </button>

      <div style={{ fontSize: 12, color: t.muted, textAlign: 'center', maxWidth: 260 }}>
        로그인하면 친구들과 같은 피드를 공유할 수 있어요
      </div>
    </div>
  )
}
