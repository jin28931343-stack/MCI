const CACHE_NAME = 'mci-sim-v1';
const ASSETS_TO_CACHE = [
  './Mass Casualty Incident (MCI)11412131452.html',
  './manifest.json',
  'PIC/MIC_game3.png',
  'PIC/radio.png',
  'PIC/tablet.png',
  'PIC/mat.png',
  'PIC/command_post.png',
  'PIC/decon.png',
  'PIC/ambulance_staging.png',
  'PIC/megaphone.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://fonts.googleapis.com/css2?family=DotGothic16&family=Press+Start+2P&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});