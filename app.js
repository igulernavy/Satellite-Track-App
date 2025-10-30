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

const YT_LIVE_ID = 'iYmvCUonukw';
document.getElementById('ytFrame').src = `https://www.youtube.com/embed/${YT_LIVE_ID}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&playsinline=1`;

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

const API_KEY = ''; // N2YO API KEY : 4639PR-YA423R-EZY4BF-5LFC
let demoMode = !API_KEY;
const OBS_LAT = 47.3769;
const OBS_LON = 8.5417;

// Initialize Leaflet map
const map = L.map('map', { worldCopyJump: true, zoomControl: true }).setView([0, 0], 2);
L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { attribution: '&copy; OpenStreetMap contributors' }
).addTo(map);

// ISS icon URL
const issIconUrl = '/Users/sirius/Library/Mobile Documents/com~apple~CloudDocs/1 - Ilker/01 - Academics/2 - My_Powercoders/5 - CH2025-2/Satellite Track/iss.png';
const issIcon = L.icon({
  iconUrl: issIconUrl,
  iconSize: [32, 32],      // İkon boyutu
  iconAnchor: [16, 16],    // İkon koordinatın ortasında olmalı
  popupAnchor: [0, -16]
});
// ISS marker, path and trail
let issMarker, issPath;
let issTrail = [];
let followISS = true; // Whether map auto-follows ISS position

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

// Update the ISS orbit with custom icon and trail, update map view if followISS is true
async function updateISSOrbit() {
  try {
    const res = await fetch('https://api.open-notify.org/iss-now.json');
    const data = await res.json();
    const lat = parseFloat(data.iss_position.latitude);
    const lon = parseFloat(data.iss_position.longitude);

    const issIconUrl = '/Users/sirius/Library/Mobile Documents/com~apple~CloudDocs/1 - Ilker/01 - Academics/2 - My_Powercoders/5 - CH2025-2/Satellite Track/iss.png';
let issIcon = L.icon({
  iconUrl: issIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

async function updateISSOrbit() {
  try {
    const res = await fetch('https://api.open-notify.org/iss-now.json');
    const data = await res.json();
    const lat = parseFloat(data.iss_position.latitude);
    const lon = parseFloat(data.iss_position.longitude);

    if (!issMarker) {
      issMarker = L.marker([lat, lon], { icon: issIcon }).addTo(map);
      issPath = L.polyline([], { color: '#ffd700', weight: 3, opacity: 0.8 }).addTo(map);
    } else {
      issMarker.setLatLng([lat, lon]);
    }

    issTrail.push([lat, lon]);
    if (issTrail.length > 100) issTrail.shift();
    issPath.setLatLngs(issTrail);

    if (followISS) {
      map.setView([lat, lon], map.getZoom());
    }

  } catch (e) {
    console.error('ISS update error:', e);
  }
}


    issTrail.push([lat, lon]);
    if (issTrail.length > 100) issTrail.shift();
    issPath.setLatLngs(issTrail);

    if (followISS) {
      map.setView([lat, lon], map.getZoom());
    }
  } catch (err) {
    console.error('ISS update error:', err);
  }
}

// Fetch ISS data and update info panel
async function fetchISSData() {
  try {
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    const info = await res.json();
    issData.innerHTML = `
      <hr>
      <div><b>Altitude:</b> ${info.altitude.toFixed(1)} km</div>
      <div><b>Latitude:</b> ${info.latitude.toFixed(2)}</div>
      <div><b>Longitude:</b> ${info.longitude.toFixed(2)}</div>
      <div><b>Velocity:</b> ${info.velocity.toFixed(2)} km/s</div>
      <div><b>Visibility:</b> ${info.visibility}</div>
    `;
  } catch (err) {
    console.warn('ISS data fetch error:', err);
  }
}

setInterval(updateISSOrbit, 5000);
setInterval(fetchISSData, 10000);
updateISSOrbit();
fetchISSData();

// Fetch satellite data either demo or real API
async function fetchSatData(noradId) {
  try {
    if (demoMode) {
      const t = Date.now() / 10000 + noradId;
      const lat = 15 * Math.sin(t / 10);
      const lon = (t % 360) - 180;
      return { satlatitude: lat, satlongitude: lon, sataltitude: 400, satvelocity: 7.6 };
    }
    const PROXY_URL = 'https://corsproxy.io/?';
    const targetURL = `https://api.n2yo.com/rest/v1/satellite/positions/${noradId}/${OBS_LAT}/${OBS_LON}/0/1/?apiKey=${API_KEY}`;
    const res = await fetch(PROXY_URL + targetURL);
    const json = await res.json();
    if (!json.positions?.length) return null;
    return json.positions[0];
  } catch (err) {
    console.error('fetchSatData error:', err);
    return null;
  }
}

// Update all satellite markers excluding ISS (which has special handling)
let allSatObjs = [];
async function updateSatMarkers() {
  allSatObjs.forEach(s => {
    if (s.marker) map.removeLayer(s.marker);
    if (s.path) map.removeLayer(s.path);
  });
  allSatObjs = Object.values(SATS_BY_COUNTRY)
    .flat()
    .filter(s => !s.name.toUpperCase().includes('ISS'));

  for (const s of allSatObjs) {
    const pos = await fetchSatData(s.norad);
    if (!pos) continue;
    const icon = L.divIcon({
      className: 'sat-icon',
      html: '<div style="width:9px;height:9px;background:#38bdf8;border-radius:50%;box-shadow:0 0 6px #22d3ee;"></div>',
      iconSize: [9, 9],
    });
    s.marker = L.marker([pos.satlatitude, pos.satlongitude], { icon }).addTo(map);
    s.path = L.polyline([], { color: '#22d3ee', weight: 1.3, opacity: 0.8 }).addTo(map);
    s.trail = [[pos.satlatitude, pos.satlongitude]];
    s.marker.on('click', () => openCard(s));
  }
}
setInterval(updateSatMarkers, 15000);
updateSatMarkers();

// Opens satellite info card with detailed data
function openCard(s) {
  if (s.name.toUpperCase().includes('ISS')) {
    document.querySelector('[data-tab="tab-iss"]').click();
    fetchISSData();
    return;
  }
  fetchSatData(s.norad).then(pos => {
    if (!pos) return;
    satCard.innerHTML = `
      <h3>${s.name} <span class="tag">${s.operator}</span></h3>
      <div><b>NORAD ID:</b> ${s.norad}</div>
      <div><b>Orbit:</b> ${s.orbit}</div>
      <div><b>Altitude:</b> ${pos.sataltitude.toFixed(1)} km</div>
      <div><b>Latitude:</b> ${pos.satlatitude.toFixed(2)}</div>
      <div><b>Longitude:</b> ${pos.satlongitude.toFixed(2)}</div>
      <div><b>Speed:</b> ${pos.satvelocity.toFixed(2)} km/s</div>
    `;
  });
}
