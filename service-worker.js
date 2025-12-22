const CACHE_NAME = 'mci-sim-v1.3.3-offline-fix'; // 更新版本號以觸發更新

// 補齊了 HTML 中所有引用的資源 (圖片與音效)
const ASSETS_TO_CACHE = [
    './',
    './index.html', // 建議確認您的主要 HTML 檔名是否固定，若不固定建議改為 index.html
    './manifest.json',
    
    // === 核心資源 ===
    'PIC/MCI_game.png',
    
    // === 音效 ===
    'PIC/intro.mp3',
    'PIC/bgm.mp3',

    // === UI 與 道具 ===
    'PIC/radio.png',
    'PIC/tablet.png',
    'PIC/mat.png',
    'PIC/command_post.png', 
    'PIC/command_post1.png', // HTML 程式碼中實際引用的是 command_post1.png
    'PIC/decon.png',
    'PIC/decon1.png',        // HTML 程式碼中實際引用的是 decon1.png
    'PIC/ambulance_staging.png',
    'PIC/ambulance_staging1.png', // HTML 程式碼中實際引用的是 ambulance_staging1.png
    'PIC/megaphone.png',
    'PIC/BASIC.png',
    'PIC/Pulse.png',
    'PIC/consciousness.png',
    'PIC/flowchart1.png',
    'PIC/flowchart2.png',

    // === 角色與傷患 ===
    'PIC/survivor_man.png', 
    'PIC/survivor_woman.png',
    'PIC/player_man.png', 
    'PIC/player_woman.png',
    'PIC/emt.png',
    'PIC/firefighter.png',

    // === 車輛 ===
    'PIC/firetruck.png', 
    'PIC/ambulance.png', 
    'PIC/police.png',
    'PIC/minibus.png', 
    'PIC/sedan.png', 
    'PIC/truck.png', 
    'PIC/suv.png', 
    'PIC/van.png', 
    'PIC/jeep.png',
    
    // === 開頭動畫車輛 ===
    'PIC/tittle_police.png',
    'PIC/tittle_ambulance.png',
    'PIC/tittle_firetruck.png',

    // === 環境與物件 ===
    'PIC/city_ruins.png',
    'PIC/fire.png', 
    'PIC/water.png', 
    'PIC/breaker.png',
    'PIC/oil.png', 
    'PIC/glass.png', 
    'PIC/metal.png', 
    'PIC/energy_drink.png',

    // === 區域與標示 ===
    'PIC/black_zone.png', 
    'PIC/red_zone.png', 
    'PIC/yellow_zone.png', 
    'PIC/green_zone.png',
    'PIC/icon_green.png',
    'PIC/icon_yellow.png',
    'PIC/icon_red.png',
    'PIC/icon_black.png',

    // === 外部 CDN (建議離線遊玩時也快取) ===
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/react@18/umd/react.development.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
    'https://fonts.googleapis.com/css2?family=DotGothic16&family=Press+Start+2P&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and installing assets');
                // 使用 addAll 若其中一個檔案失敗會導致整個安裝失敗
                // 為了保險起見，可以考慮分批或容錯，但這裡維持標準寫法
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // 1. 如果快取中有，直接回傳
                if (cachedResponse) {
                    return cachedResponse;
                }

                // 2. 如果快取沒有，發送網路請求 (動態快取機制)
                return fetch(event.request).then((networkResponse) => {
                    // 檢查回應是否有效
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        // 注意：CDN 資源通常是 cors 或 opaque，這裡放寬檢查以便能運作
                        // 如果是跨域資源 (type: opaque/cors)，我們也回傳，但不一定能 cache.put (視瀏覽器限制)
                        if (networkResponse.type === 'opaque') {
                             // Opaque response (no-cors) 通常無法讀取內容但可以被 ServiceWorker 快取
                        } else if (!networkResponse) {
                            return networkResponse;
                        }
                    }

                    // 複製回應 (因為回應流只能使用一次)
                    const responseToCache = networkResponse.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        // 將新請求到的資源存入快取，下次離線就能用了
                        // 忽略非 http/https 請求 (如 chrome-extension://)
                        if (event.request.url.startsWith('http')) {
                            cache.put(event.request, responseToCache);
                        }
                    });

                    return networkResponse;
                });
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});




