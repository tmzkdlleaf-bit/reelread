export function Stars({ score, size = 12, accColor, muted2 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            background: i <= score ? accColor : muted2,
            clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
          }}
        />
      ))}
    </div>
  )
}

export function StarPicker({ value, onChange, accColor, muted2 }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          onClick={() => onChange(i)}
          style={{
            width: 30,
            height: 30,
            background: i <= value ? accColor : muted2,
            clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
            cursor: 'pointer',
            transition: 'transform .12s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      ))}
    </div>
  )
}
