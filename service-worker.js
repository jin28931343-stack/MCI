const CACHE_NAME = 'mci-sim-v1';

// 定義需要快取的資源列表
// 包含主檔案、圖片資源以及外部引用的 CDN 函式庫
const ASSETS_TO_CACHE = [
  './',
  './manifest.json',
  // 專案內的圖片資源 (根據 HTML 內容推斷)
  'PIC/MIC_game3.png',
  'PIC/radio.png',
  'PIC/tablet.png',
  'PIC/mat.png',
  'PIC/command_post.png',
  'PIC/decon.png',
  'PIC/ambulance_staging.png',
  'PIC/megaphone.png',
  // 外部 CDN 資源 (為了離線執行，必須快取這些)
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://fonts.googleapis.com/css2?family=DotGothic16&family=Press+Start+2P&display=swap'
];

// 安裝階段：快取靜態資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  // 強制讓新的 Service Worker 立即取得控制權
  self.skipWaiting();
});

// 攔截請求階段：優先使用快取，失敗才連網 (Cache First Strategy)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果快取中有，直接回傳
        if (response) {
          return response;
        }
        
        // 如果快取沒有，則發起網路請求
        return fetch(event.request).then(
          (response) => {
            // 檢查回應是否有效
            if(!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors' && response.type !== 'opaque') {
              return response;
            }

            // 複製回應流 (因為串流只能讀取一次)
            var responseToCache = response.clone();

            // 將新請求到的資源動態加入快取
            caches.open(CACHE_NAME)
              .then((cache) => {
                // 只快取 GET 請求
                if (event.request.method === 'GET') {
                    cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});

// 啟動階段：清理舊的快取
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 確保 Service Worker 立即控制所有打開的客戶端頁面
  event.waitUntil(self.clients.claim());
});
