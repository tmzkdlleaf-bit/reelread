import WorkCard from '../components/WorkCard'

export default function FeedPage({ works, t, acc, movieColor, bookColor, currentUser, onAddReview, filter, sort, search }) {
  const filtered = works
    .filter(w => filter === 'all' || w.type === filter)
    .filter(w => !search || w.title.toLowerCase().includes(search.toLowerCase()) || w.creator.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'recent') return b.createdAt - a.createdAt
      if (sort === 'score') {
        const avgA = (a.reviews || []).reduce((s, r) => s + r.score, 0) / ((a.reviews || []).length || 1)
        const avgB = (b.reviews || []).reduce((s, r) => s + r.score, 0) / ((b.reviews || []).length || 1)
        return avgB - avgA
      }
      return (b.reviews?.length || 0) - (a.reviews?.length || 0)
    })

  if (filtered.length === 0) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: t.muted, fontSize: 13 }}>작품이 없어요</div>
  }

  return (
    <div>
      {filtered.map(work => (
        <WorkCard
          key={work.id}
          work={work}
          t={t} acc={acc}
          movieColor={movieColor}
          bookColor={bookColor}
          currentUser={currentUser}
          onAddReview={onAddReview}
        />
      ))}
    </div>
  )
}
