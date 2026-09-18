(() => {
  const TILE = 256;
  const MIN_ZOOM = 2;
  const MAX_ZOOM = 18;

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
    const fitView = fit(points, el.clientWidth, el.clientHeight);
    const state = {center: fitView.center, zoom: fitView.zoom, raf: 0, dragging: false};

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
        const a = document.createElement('a');
        a.className = 'pin-map__marker';
        a.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`;
        a.target = '_blank';
        a.rel = 'noopener';
        a.style.left = `${x}px`;
        a.style.top = `${y}px`;
        a.title = `${index + 1}. ${p.name}`;
        a.innerHTML = `<span class="pin-map__dot">${String(index + 1).padStart(2,'0')}</span><span class="pin-map__label"></span>`;
        a.querySelector('.pin-map__label').textContent = p.name;
        markers.append(a);
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
      state.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next));
      schedule();
    }

    el.querySelector('[data-map-zoom-in]').addEventListener('click', e => { e.stopPropagation(); setZoom(state.zoom + 1); });
    el.querySelector('[data-map-zoom-out]').addEventListener('click', e => { e.stopPropagation(); setZoom(state.zoom - 1); });

    el.addEventListener('wheel', e => {
      e.preventDefault();
      setZoom(state.zoom + (e.deltaY < 0 ? 1 : -1));
    }, {passive:false});

    let startX = 0, startY = 0, startCenter = null;
    el.addEventListener('pointerdown', e => {
      if (e.target.closest('a,button')) return;
      state.dragging = true;
      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);
      startX = e.clientX; startY = e.clientY;
      startCenter = project(state.center.lat, state.center.lon, state.zoom);
    });
    el.addEventListener('pointermove', e => {
      if (!state.dragging) return;
      const c = unproject(startCenter.x - (e.clientX - startX), startCenter.y - (e.clientY - startY), state.zoom);
      state.center = c;
      schedule();
    });
    const stopDrag = () => { state.dragging = false; el.classList.remove('is-dragging'); };
    el.addEventListener('pointerup', stopDrag);
    el.addEventListener('pointercancel', stopDrag);

    const ro = new ResizeObserver(() => schedule());
    ro.observe(el);
    render();
  }

  document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('[data-pin-map]').forEach(init));
})();
