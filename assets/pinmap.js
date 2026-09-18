(() => {
  const TILE = 256;
  const MIN_ZOOM = 2;
  const MAX_ZOOM = 18;
  const PINCH_STEP_RATIO = 1.55;
  const TRACKPAD_PINCH_THRESHOLD = 120;

  const clampLat = lat => Math.max(-85.05112878, Math.min(85.05112878, lat));
  const mod = (n, m) => ((n % m) + m) % m;

  function project(lat, lon, zoom) {
    lat = clampLat(lat);
    const scale = TILE * 2 ** zoom;
    const sin = Math.sin(lat * Math.PI / 180);
    return {
      x: (lon + 180) / 360 * scale,
      y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
    };
  }

  function unproject(x, y, zoom) {
    const scale = TILE * 2 ** zoom;
    const lon = x / scale * 360 - 180;
    const n = Math.PI - 2 * Math.PI * y / scale;
    const lat = 180 / Math.PI * Math.atan(Math.sinh(n));
    return {lat, lon};
  }

  function fit(points, width, height) {
    if (points.length === 1) return {center: {lat: points[0].lat, lon: points[0].lon}, zoom: 15};
    for (let z = MAX_ZOOM; z >= MIN_ZOOM; z--) {
      const ps = points.map(p => project(p.lat, p.lon, z));
      const xs = ps.map(p => p.x), ys = ps.map(p => p.y);
      const spanX = Math.max(...xs) - Math.min(...xs);
      const spanY = Math.max(...ys) - Math.min(...ys);
      if (spanX <= width - 110 && spanY <= height - 120) {
        const c = unproject((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, z);
        return {center: c, zoom: z};
      }
    }
    const ps = points.map(p => project(p.lat, p.lon, MIN_ZOOM));
    const xs = ps.map(p => p.x), ys = ps.map(p => p.y);
    return {center: unproject((Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2,MIN_ZOOM), zoom: MIN_ZOOM};
  }

  function init(el) {
    const points = JSON.parse(el.querySelector('.pin-map__data').textContent);
    const tiles = el.querySelector('.pin-map__tiles');
    const markers = el.querySelector('.pin-map__markers');
    const route = el.querySelector('.pin-map__route');
    const controls = el.querySelector('.pin-map__controls');
    const fitView = fit(points, el.clientWidth, el.clientHeight);
    const state = {center: fitView.center, zoom: fitView.zoom, raf: 0, dragging: false};

    if (!el.querySelector('[data-map-fullscreen]')) {
      const full = document.createElement('button');
      full.type = 'button';
      full.dataset.mapFullscreen = '';
      full.className = 'pin-map__fullscreen';
      full.setAttribute('aria-label', 'マップを全画面表示');
      full.title = '全画面表示';
      full.textContent = '⛶';
      controls.append(full);
    }
    if (!el.querySelector('.pin-map__hint')) {
      const hint = document.createElement('div');
      hint.className = 'pin-map__hint';
      hint.textContent = 'ドラッグで移動 · ピンチでズーム';
      el.append(hint);
    }

    function schedule() {
      if (state.raf) return;
      state.raf = requestAnimationFrame(() => { state.raf = 0; render(); });
    }

    function render() {
      const width = el.clientWidth, height = el.clientHeight;
      const centerPx = project(state.center.lat, state.center.lon, state.zoom);
      const left = centerPx.x - width / 2;
      const top = centerPx.y - height / 2;
      const tileMinX = Math.floor(left / TILE), tileMaxX = Math.floor((left + width) / TILE);
      const tileMinY = Math.floor(top / TILE), tileMaxY = Math.floor((top + height) / TILE);
      const n = 2 ** state.zoom;

      tiles.replaceChildren();
      for (let tx = tileMinX; tx <= tileMaxX; tx++) {
        for (let ty = tileMinY; ty <= tileMaxY; ty++) {
          if (ty < 0 || ty >= n) continue;
          const img = document.createElement('img');
          img.src = `https://tile.openstreetmap.org/${state.zoom}/${mod(tx,n)}/${ty}.png`;
          img.alt = '';
          img.draggable = false;
          img.style.left = `${Math.round(tx * TILE - left)}px`;
          img.style.top = `${Math.round(ty * TILE - top)}px`;
          tiles.append(img);
        }
      }

      markers.replaceChildren();
      const line = [];
      points.forEach((p, index) => {
        const pos = project(p.lat, p.lon, state.zoom);
        const x = pos.x - left, y = pos.y - top;
        line.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        const marker = document.createElement('div');
        marker.className = 'pin-map__marker';
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
        marker.title = `${index + 1}. ${p.name}`;
        marker.setAttribute('aria-label', marker.title);
        marker.innerHTML = `<span class="pin-map__dot">${String(index + 1).padStart(2,'0')}</span><span class="pin-map__label"></span>`;
        marker.querySelector('.pin-map__label').textContent = p.name;
        markers.append(marker);
      });
      route.setAttribute('viewBox', `0 0 ${width} ${height}`);
      route.replaceChildren();
      if (line.length > 1) {
        const poly = document.createElementNS('http://www.w3.org/2000/svg','polyline');
        poly.setAttribute('points', line.join(' '));
        route.append(poly);
      }
    }

    function setZoom(next) {
      state.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(next)));
      schedule();
    }

    function zoomAt(next, clientX, clientY) {
      next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(next)));
      if (next === state.zoom) return;
      const rect = el.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const oldCenter = project(state.center.lat, state.center.lon, state.zoom);
      const oldLeft = oldCenter.x - el.clientWidth / 2;
      const oldTop = oldCenter.y - el.clientHeight / 2;
      const anchor = unproject(oldLeft + localX, oldTop + localY, state.zoom);
      const anchorNew = project(anchor.lat, anchor.lon, next);
      const newCenterPx = {
        x: anchorNew.x - (localX - el.clientWidth / 2),
        y: anchorNew.y - (localY - el.clientHeight / 2),
      };
      state.zoom = next;
      state.center = unproject(newCenterPx.x, newCenterPx.y, next);
      schedule();
    }

    const centerZoom = step => {
      const r = el.getBoundingClientRect();
      zoomAt(state.zoom + step, r.left + r.width / 2, r.top + r.height / 2);
    };
    el.querySelector('[data-map-zoom-in]').addEventListener('click', e => { e.stopPropagation(); centerZoom(1); });
    el.querySelector('[data-map-zoom-out]').addEventListener('click', e => { e.stopPropagation(); centerZoom(-1); });

    // Normal wheel/trackpad scrolling belongs to the page. Only a trackpad pinch
    // (reported by browsers as ctrl+wheel) zooms the map, and it is deliberately slowed down.
    let pinchWheel = 0;
    el.addEventListener('wheel', e => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      pinchWheel += -e.deltaY;
      if (Math.abs(pinchWheel) < TRACKPAD_PINCH_THRESHOLD) return;
      zoomAt(state.zoom + Math.sign(pinchWheel), e.clientX, e.clientY);
      pinchWheel = 0;
    }, {passive:false});

    const pointers = new Map();
    let dragPointer = null;
    let dragStart = null;
    let pinchDistance = null;

    const pointerDistance = () => {
      const [a,b] = [...pointers.values()];
      return Math.hypot(a.x-b.x,a.y-b.y);
    };
    const pointerMidpoint = () => {
      const [a,b] = [...pointers.values()];
      return {x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    };

    el.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      el.setPointerCapture(e.pointerId);
      if (pointers.size === 1) {
        dragPointer = e.pointerId;
        dragStart = {
          x:e.clientX,
          y:e.clientY,
          center:project(state.center.lat,state.center.lon,state.zoom),
        };
        state.dragging = true;
        el.classList.add('is-dragging');
      } else if (pointers.size === 2) {
        state.dragging = false;
        el.classList.remove('is-dragging');
        dragPointer = null;
        pinchDistance = pointerDistance();
      }
    });

    el.addEventListener('pointermove', e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if (pointers.size >= 2) {
        const distance = pointerDistance();
        const ratio = distance / pinchDistance;
        if (ratio >= PINCH_STEP_RATIO || ratio <= 1 / PINCH_STEP_RATIO) {
          const mid = pointerMidpoint();
          zoomAt(state.zoom + (ratio > 1 ? 1 : -1), mid.x, mid.y);
          pinchDistance = distance;
        }
        return;
      }
      if (!state.dragging || e.pointerId !== dragPointer) return;
      const c = unproject(
        dragStart.center.x - (e.clientX - dragStart.x),
        dragStart.center.y - (e.clientY - dragStart.y),
        state.zoom
      );
      state.center = c;
      schedule();
    });

    const endPointer = e => {
      pointers.delete(e.pointerId);
      if (pointers.size === 1) {
        const [id,p] = [...pointers.entries()][0];
        dragPointer = id;
        dragStart = {x:p.x,y:p.y,center:project(state.center.lat,state.center.lon,state.zoom)};
        state.dragging = true;
        el.classList.add('is-dragging');
        pinchDistance = null;
      } else if (pointers.size === 0) {
        dragPointer = null;
        dragStart = null;
        pinchDistance = null;
        state.dragging = false;
        el.classList.remove('is-dragging');
      }
    };
    el.addEventListener('pointerup', endPointer);
    el.addEventListener('pointercancel', endPointer);

    let safariGestureScale = 1;
    el.addEventListener('gesturestart', e => { e.preventDefault(); safariGestureScale = e.scale; });
    el.addEventListener('gesturechange', e => {
      e.preventDefault();
      const ratio = e.scale / safariGestureScale;
      if (ratio >= PINCH_STEP_RATIO || ratio <= 1 / PINCH_STEP_RATIO) {
        zoomAt(state.zoom + (ratio > 1 ? 1 : -1), e.clientX, e.clientY);
        safariGestureScale = e.scale;
      }
    });

    const fullButton = el.querySelector('[data-map-fullscreen]');
    const isNativeFullscreen = () => document.fullscreenElement === el || document.webkitFullscreenElement === el;
    const updateFullscreenButton = () => {
      const active = isNativeFullscreen() || el.classList.contains('is-fullscreen-fallback');
      fullButton.textContent = active ? '✕' : '⛶';
      fullButton.setAttribute('aria-label', active ? '全画面表示を終了' : 'マップを全画面表示');
      fullButton.title = active ? '全画面表示を終了' : '全画面表示';
      schedule();
    };
    const leaveFallback = () => {
      el.classList.remove('is-fullscreen-fallback');
      document.body.classList.remove('is-map-fullscreen');
      updateFullscreenButton();
    };
    fullButton.addEventListener('click', async e => {
      e.stopPropagation();
      if (isNativeFullscreen()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        await exit.call(document);
        return;
      }
      if (el.classList.contains('is-fullscreen-fallback')) {
        leaveFallback();
        return;
      }
      const request = el.requestFullscreen || el.webkitRequestFullscreen;
      if (request) {
        try {
          await request.call(el);
          return;
        } catch (_) {}
      }
      el.classList.add('is-fullscreen-fallback');
      document.body.classList.add('is-map-fullscreen');
      updateFullscreenButton();
    });
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && el.classList.contains('is-fullscreen-fallback')) leaveFallback();
    });

    const ro = new ResizeObserver(() => schedule());
    ro.observe(el);
    render();
  }

  document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('[data-pin-map]').forEach(init));
})();
