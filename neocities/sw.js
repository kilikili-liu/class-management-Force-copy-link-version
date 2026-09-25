/**
 * PWA Service Worker - 班級作業管理與訂正系統
 * 採用 Network-First 策略：優先獲取最新線上版本，網路中斷時自動使用快取
 */

const CACHE_NAME = 'class-mgmt-pwa-v9';
const CORE_ASSETS = [
  './index.html',
  './scanner.html',
  './correction.html',
  './correction_scanner.html',
  './StickerGenerator.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

// 安裝事件：預先下載核心靜態資源並立即接管
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS).catch(err => {
        console.warn('[SW] Pre-caching core assets warning:', err);
      });
    })
  );
});

// 啟動事件：清除舊版本快取並立刻控制頁面
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// 請求攔截：Network-First（優先獲取線上新代碼，失敗再讀取快取）
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. GAS API 與外部動態資料直接走網路，不進快取
  if (url.hostname.includes('script.google.com') ||
      url.hostname.includes('googleusercontent.com') ||
      req.method !== 'GET') {
    return;
  }

  // 2. 本站資源：Network-First 策略（確保修改 Neocities 後使用者無感立即更新）
  event.respondWith(
    fetch(req)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // 離線時 fallback 到快取
        return caches.match(req).then(cached => {
          if (cached) return cached;
          if (req.mode === 'navigate') {
            return caches.match('./scanner.html');
          }
          return new Response('離線模式，且此資源尚未快取', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
