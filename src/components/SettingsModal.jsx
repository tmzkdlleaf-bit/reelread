import { ACC_LIST, TYPE_COLORS } from '../lib/theme'

export default function SettingsModal({ t, acc, theme, movieColor, bookColor, animeColor, onTheme, onAccent, onTypeColor, onClose }) {
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
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: t.text, marginBottom: 20 }}>설정</div>

        {/* Theme */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: t.muted, marginBottom: 11 }}>화면 모드</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[['dark', '◑', '다크'], ['light', '○', '라이트']].map(([th, icon, label]) => (
              <div key={th} onClick={() => onTheme(th)} style={{
                flex: 1, padding: '10px 6px', borderRadius: 10, textAlign: 'center',
                border: `0.5px solid ${theme === th ? acc.c : t.line2}`,
                background: t.bg3, color: theme === th ? acc.c : t.text,
                cursor: 'pointer', fontSize: 13,
              }}>
                <div style={{ fontSize: 20, marginBottom: 3 }}>{icon}</div>
                <div>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Accent */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: t.muted, marginBottom: 11 }}>강조 색상</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
            {ACC_LIST.map((a, i) => (
              <div key={i} onClick={() => onAccent(i)} style={{
                height: 34, borderRadius: 8, background: a.c, cursor: 'pointer',
                outline: a.c === acc.c ? `3px solid ${t.text}` : 'none', outlineOffset: 2,
                transition: 'transform .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        </div>

        {/* Type colors */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: t.muted, marginBottom: 11 }}>유형 색상</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[['영화', 'movie', movieColor], ['책', 'book', bookColor], ['애니', 'anime', animeColor]].map(([label, key, val]) => (
              <div key={key} style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 12, color: t.muted, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: val, display: 'inline-block' }} />
                  {label}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {TYPE_COLORS.map(c => (
                    <div key={c} onClick={() => onTypeColor(key, c)} style={{
                      width: 26, height: 26, borderRadius: 6, background: c, cursor: 'pointer',
                      outline: c === val ? `3px solid ${t.text}` : 'none', outlineOffset: 2,
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: acc.c, color: '#1a1208', fontSize: 13, fontWeight: 500 }}>완료</button>
        </div>
      </div>
    </div>
  )
}
