# SatTrackApp — Orbital Console

A real-time satellite tracking web application built with **Leaflet.js**, featuring live ISS telemetry, country-filtered satellite visualization, and a night/day terminator overlay.

---

## Features

- **Live ISS Tracking** — Position, altitude, velocity, and visibility fetched every 5 seconds from [wheretheiss.at](https://wheretheiss.at)
- **Satellite Markers** — Color-coded by orbit type: LEO (blue), MEO (purple), GEO (yellow), with hover tooltips and click-to-inspect
- **Orbital Trails** — Polyline trails drawn behind each satellite showing recent path
- **Night/Day Terminator** — Earth's shadow rendered on the map via `leaflet.terminator`
- **Country Filter** — Browse satellites by Switzerland, Turkey, United States, or European Union
- **Search** — Filter by satellite name or NORAD ID
- **Satellite Info Card** — Click any satellite to see altitude, lat/lon, and velocity
- **ISS Live Feed** — Direct link to NASA's ISS live stream
- **Background Music** — Ambient audio player with mute control

---

## File Structure

```
SatTrackApp/
├── index.html      # Main layout, Leaflet + terminator dependencies
├── app.js          # Core logic: map, satellite data, ISS tracking
├── style.css       # Dark theme, glassmorphic panels, responsive grid
├── iss.png         # ISS custom map icon
└── mymusic.mp3     # Background ambient music
```

---

## Technology Stack

| Library | Purpose |
|---|---|
| [Leaflet.js](https://leafletjs.com) | Interactive map rendering |
| [leaflet.terminator](https://github.com/joergdietrich/Leaflet.Terminator) | Night/day shadow overlay |
| [OpenStreetMap](https://www.openstreetmap.org) | Map tile layer |
| [wheretheiss.at API](https://wheretheiss.at) | ISS real-time telemetry |
| [N2YO API](https://www.n2yo.com/api/) | Satellite positions (requires API key) |

---

## API Keys & Configuration

In `app.js`:

```javascript
const API_KEY = 'YOUR_N2YO_KEY'; // Get free key at n2yo.com
```

If `API_KEY` is empty, the app runs in **demo mode** — satellites are shown at algorithmically spread positions so the UI is always functional.

---

## Satellite Data

Satellites are organized by country in the `SATS_BY_COUNTRY` object:

| Country | Examples |
|---|---|
| Switzerland (CH) | SWISSCUBE, CHEOPS, ASTROCAST series |
| Turkey (TR) | TÜRKSAT 3A, GÖKTÜRK-1, İMECE |
| United States (US) | HUBBLE, LANDSAT 8, STARLINK-1001 |
| European Union (EU) | GALILEO 1, SENTINEL-2A, SWARM A |

---

## How to Run

No build step required. Just serve the folder locally:

```bash
# Python
python3 -m http.server 8765

# Node.js
npx serve .
```

Then open `http://localhost:8765` in your browser.

> **Note:** Safari may block cross-origin API calls from localhost due to ITP. Use Chrome or Firefox for full API functionality. Demo mode works in all browsers.

---

## Known Limitations

- N2YO API requires a free account and key for live satellite positions
- Safari ITP restricts cross-origin requests from `localhost` — demo mode activates automatically as fallback
- ISS live video links to NASA's YouTube stream (direct embed disabled by YouTube)

---

## Future Work

1. Add orbital path prediction (TLE-based propagation with satellite.js)
2. Expand satellite catalog with live TLE feeds from Celestrak
3. Define geographically unstable regions as **threat zones** for cybersecurity simulation scenarios
4. Mobile-responsive layout improvements
