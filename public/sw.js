// 서비스워커 비활성화 — 캐싱 문제 방지
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  )
  self.clients.claim()
})
// fetch 이벤트 핸들러 없음 — 모든 요청 네트워크 통과
