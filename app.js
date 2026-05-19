const SATS_BY_COUNTRY = {
  CH: [
    { name: 'SWISSCUBE', norad: 35932, operator: 'EPFL', orbit: 'LEO' },
    { name: 'TISAT-1',   norad: 36799, operator: 'SUPSI/USI', orbit: 'LEO' },
    { name: 'CHEOPS',    norad: 45150, operator: 'ESA/UniBE', orbit: 'LEO' },
    { name: 'ASTROCAST-0101', norad: 47430, operator: 'Astrocast', orbit: 'LEO' },
    { name: 'ASTROCAST-0204', norad: 48952, operator: 'Astrocast', orbit: 'LEO' },
    { name: 'ASTROCAST-0404', norad: 55112, operator: 'Astrocast', orbit: 'LEO' },
    { name: 'ISS (ZARYA)', norad: 25544, operator: 'NASA/ESA', orbit: 'LEO' },
  ],
  TR: [
    { name: 'TÜRKSAT 3A', norad: 32953, operator: 'TÜRKSAT', orbit: 'GEO' },
    { name: 'RASAT',      norad: 37782, operator: 'TÜBİTAK-UZAY', orbit: 'LEO' },
    { name: 'GÖKTÜRK-1',  norad: 41876, operator: 'Milli Savunma', orbit: 'LEO' },
    { name: 'GÖKTÜRK-2',  norad: 39030, operator: 'TÜBİTAK-UZAY', orbit: 'LEO' },
    { name: 'İMECE',      norad: 56398, operator: 'TÜBİTAK-UZAY', orbit: 'LEO' },
  ],
  US: [
    { name: 'HUBBLE',       norad: 20580, operator: 'NASA', orbit: 'LEO' },
    { name: 'NOAA 20',      norad: 43013, operator: 'NOAA', orbit: 'LEO' },
    { name: 'GPS BIIR-2',   norad: 24876, operator: 'USAF', orbit: 'MEO' },
    { name: 'LANDSAT 8',    norad: 39084, operator: 'USGS', orbit: 'LEO' },
    { name: 'STARLINK-1001',norad: 44914, operator: 'SpaceX', orbit: 'LEO' }
  ],
  EU: [
    { name: 'GALILEO 1',   norad: 37846, operator: 'ESA', orbit: 'MEO' },
    { name: 'SWARM A',     norad: 39451, operator: 'ESA', orbit: 'LEO' },
    { name: 'SENTINEL-2A', norad: 40697, operator: 'ESA', orbit: 'LEO' },
    { name: 'METEOSAT-11', norad: 41987, operator: 'EUMETSAT', orbit: 'GEO' }
  ]
};

// DOM elements
const countrySelect = document.getElementById('countrySelect');
const countryNameEl = document.getElementById('countryName');
const satListEl = document.getElementById('satList');
const searchBox = document.getElementById('searchBox');
const tabs = document.querySelectorAll('.tab');
const panes = document.querySelectorAll('.tabpane');
const satCard = document.getElementById('satCard');
const bgm = document.getElementById('bgm');
const muteBtn = document.getElementById('muteBtn');
const issData = document.getElementById('issData');

// NASA ISS live stream — opened in new tab (embedding disabled by NASA)
const ISS_LIVE_URL = 'https://www.youtube.com/watch?v=uwXgcTc8oY8';

let userInteracted = false;
// Background music play on first click
window.addEventListener('click', () => {
  if (!userInteracted) {
    bgm.volume = 0.5;
    bgm.muted = false;
    bgm.play().catch(() => {});
    userInteracted = true;
  }
});
(function initMusic() {
  bgm.loop = true;
  bgm.volume = 0.5;
  bgm.muted = true;
  bgm.play().catch(() => {});
  muteBtn.addEventListener('click', () => {
    if (bgm.paused) bgm.play().catch(() => {});
    bgm.muted = !bgm.muted;
    muteBtn.textContent = bgm.muted ? 'Unmute' : 'Mute';
    if (bgm.muted) bgm.pause();
    else bgm.play().catch(() => {});
  });
})();

// Tab switching logic
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    panes.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Renders satellite list per selected country and filters
function renderList(countryCode) {
  const data = SATS_BY_COUNTRY[countryCode] || [];
  countryNameEl.textContent = countrySelect.options[countrySelect.selectedIndex].text;
  const q = searchBox.value.trim().toLowerCase();
  const filtered = data.filter(
    s => s.name.toLowerCase().includes(q) || String(s.norad).includes(q)
  );
  satListEl.innerHTML = '';
  if (!filtered.length) {
    satListEl.innerHTML = `<li class="muted">No satellites found.</li>`;
    return;
  }
  filtered.forEach(s => {
    const li = document.createElement('li');
    li.className = 'sitem';
    li.innerHTML = `
      <div>
        <div><strong>${s.name}</strong></div>
        <div class="muted">NORAD: ${s.norad} • Orbit: ${s.orbit}</div>
      </div>
      <span class="tag">${s.operator}</span>
    `;
    li.addEventListener('click', () => openCard(s));
    satListEl.appendChild(li);
  });
}
countrySelect.addEventListener('change', () => renderList(countrySelect.value));
searchBox.addEventListener('input', () => renderList(countrySelect.value));
renderList(countrySelect.value);

const API_KEY = '4639PR-YA423R-EZY4BF-5LFC';
let demoMode = !API_KEY;
const OBS_LAT = 47.3769;
const OBS_LON = 8.5417;

// Initialize Leaflet map
const map = L.map('map', { worldCopyJump: true, zoomControl: true }).setView([0, 0], 2);
L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { attribution: '&copy; OpenStreetMap contributors' }
).addTo(map);

// Night/day terminator — shows the real-time shadow of Earth's dark side
let terminator = null;
try {
  terminator = L.terminator({ fillOpacity: 0.25, color: '#001133' }).addTo(map);
  setInterval(() => terminator.setTime(new Date()), 60000);
} catch (e) {
  console.warn('Terminator plugin not available:', e.message);
}

// ISS icon — relative path so it works on any machine
const issIcon = L.icon({
  iconUrl: 'iss.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// ISS marker, path and trail
let issMarker, issPath;
let issTrail = [];
let followISS = true;

// Follow ISS toggle button
const followBtn = document.createElement('button');
followBtn.textContent = '🛰️ Follow ISS';
followBtn.style.cssText = `
  position:absolute; top:10px; right:10px; z-index:9999;
  background:#ffb703; color:#000; border:none;
  padding:6px 10px; border-radius:6px; font-weight:bold;
  cursor:pointer; box-shadow:0 0 6px rgba(0,0,0,0.4);
`;
map.getContainer().appendChild(followBtn);
followBtn.addEventListener('click', () => {
  followISS = !followISS;
  followBtn.textContent = followISS ? '🛰️ Following ISS' : '🛰️ Follow ISS';
});

// Single function: fetch ISS data from wheretheiss.at, update both marker and info panel
// open-notify.org is deprecated — wheretheiss.at provides all needed fields
async function updateISS() {
  try {
    const res  = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    const info = await res.json();
    const lat  = parseFloat(info.latitude);
    const lon  = parseFloat(info.longitude);

    // Update or create marker on map
    if (!issMarker) {
      issMarker = L.marker([lat, lon], { icon: issIcon }).addTo(map);
      issPath   = L.polyline([], { color: '#ffd700', weight: 3, opacity: 0.8 }).addTo(map);
    } else {
      issMarker.setLatLng([lat, lon]);
    }

    issTrail.push([lat, lon]);
    if (issTrail.length > 120) issTrail.shift();
    issPath.setLatLngs(issTrail);

    if (followISS) map.setView([lat, lon], map.getZoom());

    // Update info panel
    issData.innerHTML = `
      <hr>
      <div><b>Altitude:</b> ${info.altitude.toFixed(1)} km</div>
      <div><b>Latitude:</b> ${lat.toFixed(2)}</div>
      <div><b>Longitude:</b> ${lon.toFixed(2)}</div>
      <div><b>Velocity:</b> ${info.velocity.toFixed(2)} km/s</div>
      <div><b>Visibility:</b> ${info.visibility}</div>
    `;
  } catch (err) {
    console.error('ISS update error:', err);
  }
}

setInterval(updateISS, 5000);
updateISS();

// Demo position: spread satellites across the globe based on NORAD ID
function demoPosition(noradId) {
  const t = Date.now() / 10000 + noradId;
  return {
    satlatitude:  35 * Math.sin(t / 8 + noradId % 6),
    satlongitude: ((noradId * 137.5) % 360) - 180,
    sataltitude:  400 + (noradId % 200),
    satvelocity:  7.6
  };
}

// Fetch real satellite position with 4s timeout; fall back to demo if API fails
async function fetchSatData(noradId) {
  if (!demoMode) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const PROXY_URL = 'https://corsproxy.io/?';
      const targetURL = `https://api.n2yo.com/rest/v1/satellite/positions/${noradId}/${OBS_LAT}/${OBS_LON}/0/1/?apiKey=${API_KEY}`;
      const res  = await fetch(PROXY_URL + targetURL, { signal: ctrl.signal });
      clearTimeout(timer);
      const json = await res.json();
      if (json.positions?.length) return json.positions[0];
    } catch (err) {
      console.warn(`N2YO failed for NORAD ${noradId} — using demo position`);
    }
  }
  return demoPosition(noradId);
}

// Build satellite list once — markers and trails persist across updates
const allSatObjs = Object.values(SATS_BY_COUNTRY)
  .flat()
  .filter(s => !s.name.toUpperCase().includes('ISS'));

function makeSatIcon(orbit) {
  const color = orbit === 'GEO' ? '#f59e0b' : orbit === 'MEO' ? '#a78bfa' : '#38bdf8';
  const glow  = orbit === 'GEO' ? '#fbbf24' : orbit === 'MEO' ? '#8b5cf6' : '#22d3ee';
  return L.divIcon({
    className: 'sat-icon',
    html: `<div style="width:12px;height:12px;background:${color};border-radius:50%;
                box-shadow:0 0 8px ${glow};border:1px solid rgba(255,255,255,0.4);"></div>`,
    iconSize:   [12, 12],
    iconAnchor: [6, 6],
  });
}

// Place all markers instantly with demo positions — no API wait on load
function initSatMarkers() {
  for (const s of allSatObjs) {
    s.trail = [];
    for (let i = 20; i >= 1; i--) {
      const t = (Date.now() - i * 15000) / 10000 + s.norad;
      s.trail.push([
        35 * Math.sin(t / 8 + s.norad % 6),
        ((s.norad * 137.5 + i * 3) % 360) - 180
      ]);
    }
    const demo = demoPosition(s.norad);
    s.trail.push([demo.satlatitude, demo.satlongitude]);

    s.marker = L.marker([demo.satlatitude, demo.satlongitude], { icon: makeSatIcon(s.orbit) }).addTo(map);
    s.path   = L.polyline(s.trail, { color: '#22d3ee', weight: 1.5, opacity: 0.85 }).addTo(map);
    s.marker.bindTooltip(s.name, { permanent: false, direction: 'top', offset: [0, -8] });
    s.marker.on('click', () => openCard(s));
  }
}

// Every 15s: update each satellite's position and extend its trail
async function updateSatMarkers() {
  for (const s of allSatObjs) {
    if (!s.marker) continue;
    const pos = await fetchSatData(s.norad);
    if (!pos) continue;
    const latlng = [pos.satlatitude, pos.satlongitude];
    s.marker.setLatLng(latlng);
    s.trail.push(latlng);
    if (s.trail.length > 60) s.trail.shift();
    s.path.setLatLngs(s.trail);
  }
}

initSatMarkers();
setInterval(updateSatMarkers, 15000);

// Opens satellite info card with detailed data
function openCard(s) {
  if (s.name.toUpperCase().includes('ISS')) {
    document.querySelector('[data-tab="tab-iss"]').click();
    updateISS();
    return;
  }
  fetchSatData(s.norad).then(pos => {
    if (!pos) return;
    satCard.innerHTML = `
      <h3>${s.name} <span class="tag">${s.operator}</span></h3>
      <div><b>NORAD ID:</b> ${s.norad}</div>
      <div><b>Orbit:</b> ${s.orbit}</div>
      <div><b>Altitude:</b> ${pos.sataltitude?.toFixed(1) ?? '—'} km</div>
      <div><b>Latitude:</b> ${pos.satlatitude?.toFixed(2) ?? '—'}</div>
      <div><b>Longitude:</b> ${pos.satlongitude?.toFixed(2) ?? '—'}</div>
      <div><b>Speed:</b> ${pos.satvelocity?.toFixed(2) ?? '—'} km/s</div>
    `;
  });
}
