import fs from 'fs';
import path from 'path';
import { serializeInvitationPayload } from '../src/components/dashboard/create/steps/publishSerializer.js';

// Real Google Maps share link with coordinates (Statue of Liberty)
const mapsLink = 'https://www.google.com/maps/place/Statue+of+Liberty/@40.6892494,-74.0445004,17z/data=!3m1!4b1!4m5!3m4!1s0x89c250b1b1d5d9ab:0x6c6d6e8f1f1d1e2b';

const invitation = {
  venueName: 'Statue of Liberty',
  mapsLink,
  locationDescription: 'Liberty Island, New York, NY',
  date: '2026-09-01',
  time: '17:00',
};

const published = serializeInvitationPayload(invitation, 'test-statue');

const outDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const jsonPath = path.join(outDir, 'published_test_invitation.json');
fs.writeFileSync(jsonPath, JSON.stringify(published, null, 2), 'utf8');

const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Published Invitation Preview</title></head>
<body>
  <h1>Published Invitation Preview (test-statue)</h1>
  <div id="venue">
    <h2>Venue</h2>
    <div id="venueName"></div>
    <div id="venueAddress"></div>
    <div id="venueCoords"></div>
    <div id="venuePlace"></div>
    <div id="mapLink"></div>
  </div>
  <h2>Full JSON</h2>
  <pre id="fulljson"></pre>
  <script>
    const published = ${JSON.stringify(published)};
    document.getElementById('venueName').textContent = 'Name: ' + (published.venue.name || published.venueName || '');
    document.getElementById('venueAddress').textContent = 'Address: ' + (published.venue.address || published.venueAddress || '');
    document.getElementById('venueCoords').textContent = 'Latitude: ' + (published.latitude ?? published.venue.mapLat) + ' Longitude: ' + (published.longitude ?? published.venue.mapLng);
    document.getElementById('venuePlace').textContent = 'PlaceId: ' + (published.placeId || published.venue.placeId || '');
    const a = document.createElement('a');
    a.href = published.venue.mapUrl || published.mapUrl || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = 'Open in Google Maps';
    document.getElementById('mapLink').appendChild(a);
    document.getElementById('fulljson').textContent = JSON.stringify(published, null, 2);
  </script>
</body>
</html>`;

const htmlPath = path.join(outDir, 'published_preview_test.html');
fs.writeFileSync(htmlPath, html, 'utf8');

console.log('Wrote:', jsonPath);
console.log('Wrote:', htmlPath);
