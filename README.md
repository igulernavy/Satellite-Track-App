# AI Coding Agent Instructions for SatTrackApp

## Project Overview
SatTrackApp is a web-based satellite tracking application that displays real-time positions of satellites from different countries, with special focus on the International Space Station (ISS). The app features a dynamic map interface, country-specific satellite filtering, and live ISS video feed.

## Key Components

### Data Structure
- Satellite data is stored in `SATS_BY_COUNTRY` object in `app.js`
- Each satellite has: name, NORAD ID, operator, and orbit type (LEO/MEO/GEO)
- ISS has special handling for real-time tracking and video feed

### Core Features
1. Map Visualization (`app.js`)
   - Uses Leaflet.js for map rendering
   - Custom satellite markers with trails
   - Special ISS tracking with custom icon

2. Satellite Management
   - Country-based filtering
   - Search by name/NORAD ID
   - Real-time position updates
   - Detailed info cards

3. UI Components (`style.css`)
   - Dark theme with custom CSS variables
   - Responsive grid layout
   - Glassmorphic panels
   - Custom controls and cards

## Development Patterns

### API Integration
```javascript
// Example satellite data fetch pattern
async function fetchSatData(noradId) {
  const PROXY_URL = 'https://corsproxy.io/?';
  const targetURL = `https://api.n2yo.com/rest/v1/satellite/positions/${noradId}/${OBS_LAT}/${OBS_LON}/0/1/?apiKey=${API_KEY}`;
  const res = await fetch(PROXY_URL + targetURL);
  // Handle response...
}
```

### State Management
- Satellite positions update every 15 seconds
- ISS position updates every 5 seconds
- ISS data refreshes every 10 seconds
- Use `async/await` for all API calls

### User Interaction
- Click handlers for satellite selection
- Tab system for switching views
- Background music with user interaction requirement

## Integration Points
1. Map Integration (Leaflet.js)
2. Satellite APIs:
   - N2YO API for satellite positions
   - Open Notify API for ISS position
   - wheretheiss.at API for ISS details
3. YouTube Embed for ISS live feed

## Development Workflow
1. Test any API changes with both demo mode (`demoMode = true`) and real API key
2. Always handle API errors gracefully with console.error
3. Update satellite markers and trails efficiently to prevent memory leaks
4. Maintain responsive design across all screen sizes

## File Structure
- `index.html`: Main layout and dependencies
- `app.js`: Core application logic and data
- `style.css`: Styling with CSS variables for theme

## ⚠️ Known Issues

- Currently, the **satellites** and the **International Space Station (ISS)** cannot yet be tracked on the map with their orbital paths displayed.  
- The **night-time regions** on Earth are not yet visualized as shaded or darkened areas on the map.  
- Although certain sections of the **JavaScript** file were specifically written to address these issues, they do not yet produce the desired results.

## 🚧 Next Steps / Future Work

1. As I deepen my knowledge of **JavaScript**, the above-mentioned issues will be resolved as a first priority.  
2. The system will then maintain a **real-time list of publicly trackable satellites** and ensure their accurate visualization on the map.  
3. Once these improvements are implemented, **geographically unstable regions** will be defined as **“threat zones”**, and **cyber-attack simulations** targeting satellites from these regions will be conducted.  