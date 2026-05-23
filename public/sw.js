const CACHE_NAME = 'reelread-v2'
const STATIC_ASSETS = ['/', '/index.html']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  // GET 요청만 캐싱 (HEAD, POST 등 제외)
  if (e.request.method !== 'GET') return

  // 외부 도메인 요청은 네트워크 그대로 통과
  if (!e.request.url.startsWith(self.location.origin)) return

  // chrome-extension 등 무시
  if (!e.request.url.startsWith('http')) return

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 정상 응답만 캐싱
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
