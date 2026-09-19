/* Sydney 2026 Field Guide — offline cache.
   静的ファイルを書き換えたら必ず VERSION を上げること。
   上げないと、端末に残った古いキャッシュが表示され続ける。 */
const VERSION = 'v4';

const SHELL = `syd-shell-${VERSION}`;
const IMAGES = 'syd-images';
const TILES = 'syd-tiles';
const WEATHER = 'syd-weather';
const KEEP = [SHELL, IMAGES, TILES, WEATHER];

const TILE_LIMIT = 1200;
const WEATHER_TTL = 6 * 60 * 60 * 1000;

/* 同一オリジンの静的ファイル。install 時に一括取得する（約120KB）。 */
const SHELL_FILES = [
  './',
  'index.html',
  '2026-09-25.html',
  '2026-09-26.html',
  '2026-09-27.html',
  '2026-09-28.html',
  '2026-09-29.html',
  '2026-09-30.html',
  'assets/styles.css',
  'assets/app.js',
  'assets/pinmap.js',
  'assets/icon.svg',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/apple-touch-icon.png',
  'manifest.webmanifest',
  'sydney-2026-itinerary.ics',
];

/* 「オフライン保存」ボタンでまとめて取得する写真（Wikimedia）。 */
const MEDIA_FILES = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg/960px-Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Haneda-airport-terminal_3_departure.jpg/960px-Haneda-airport-terminal_3_departure.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Blue_Mountains_-_3_sisters.jpg/960px-Blue_Mountains_-_3_sisters.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Interior_of_the_Queen_Victoria_Building%2C_Sydney.jpg/960px-Interior_of_the_Queen_Victoria_Building%2C_Sydney.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Darling_Harbour.jpg/960px-Darling_Harbour.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Bondi_Beach%2C_southwest_view_20230224_1.jpg/960px-Bondi_Beach%2C_southwest_view_20230224_1.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Check-in_in_the_International_terminal_at_Sydney_Airport.jpg/960px-Check-in_in_the_International_terminal_at_Sydney_Airport.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Haneda-airport-terminal_3_departure.jpg/500px-Haneda-airport-terminal_3_departure.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Blue_Mountains_-_3_sisters.jpg/500px-Blue_Mountains_-_3_sisters.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Manly_beach.jpg/500px-Manly_beach.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Darling_Harbour.jpg/500px-Darling_Harbour.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Bondi_Beach%2C_southwest_view_20230224_1.jpg/500px-Bondi_Beach%2C_southwest_view_20230224_1.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Check-in_in_the_International_terminal_at_Sydney_Airport.jpg/500px-Check-in_in_the_International_terminal_at_Sydney_Airport.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL)
      // cache:'reload' で必ずネットワークから取る（VERSION を上げたのに
      // ブラウザのHTTPキャッシュから古いファイルを拾うのを防ぐ）
      .then(cache => cache.addAll(SHELL_FILES.map(u => new Request(u, {cache: 'reload'}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('syd-') && !KEEP.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 同一オリジン: キャッシュ優先。更新は VERSION 変更 → 新しい SHELL で取り直す。 */
async function fromShell(request) {
  const cache = await caches.open(SHELL);
  const hit = await cache.match(request, {ignoreSearch: true});
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (res.ok && res.type === 'basic') cache.put(request, res.clone());
    return res;
  } catch (err) {
    const fallback = await cache.match('index.html');
    if (request.mode === 'navigate' && fallback) return fallback;
    throw err;
  }
}

/* 写真・地図タイル: 一度取ったら以後ネットワークを使わない。 */
async function cacheFirst(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok || res.type === 'opaque') {
    await cache.put(request, res.clone());
    if (limit) trim(cacheName, limit);
  }
  return res;
}

async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  await Promise.all(keys.slice(0, keys.length - limit).map(k => cache.delete(k)));
}

/* 天気: 6時間以内のキャッシュはそのまま返し、古ければ取り直す（失敗時は古い値）。 */
async function weather(request) {
  const cache = await caches.open(WEATHER);
  const hit = await cache.match(request);
  if (hit) {
    const at = Date.parse(hit.headers.get('x-cached-at') || '');
    if (at && Date.now() - at < WEATHER_TTL) return hit;
  }
  try {
    const res = await fetch(request);
    if (res.ok) {
      const body = await res.clone().blob();
      const headers = new Headers(res.headers);
      headers.set('x-cached-at', new Date().toISOString());
      await cache.put(request, new Response(body, {status: 200, headers}));
    }
    return res;
  } catch (err) {
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(fromShell(request));
  } else if (url.hostname === 'upload.wikimedia.org') {
    event.respondWith(cacheFirst(request, IMAGES));
  } else if (url.hostname === 'tile.openstreetmap.org') {
    event.respondWith(cacheFirst(request, TILES, TILE_LIMIT));
  } else if (url.hostname === 'api.open-meteo.com') {
    event.respondWith(weather(request));
  }
});

async function prefetchMedia(client) {
  const cache = await caches.open(IMAGES);
  let stored = 0;
  for (const url of MEDIA_FILES) {
    try {
      if (await cache.match(url)) { stored += 1; continue; }
      const res = await fetch(url, {cache: 'no-store'});   // Wikimedia は CORS 許可済み
      if (res.ok) { await cache.put(url, res); stored += 1; }
    } catch (err) { /* 1枚失敗しても続行。次回アクセス時に取り直す。 */ }
  }
  /* 全部そろったときだけ完了を伝える（途中で切れたら次回また走る）。 */
  if (client && stored === MEDIA_FILES.length) client.postMessage({type: 'prefetch-done'});
}

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'prefetch-media') {
    event.waitUntil(prefetchMedia(event.source));
  }
});
