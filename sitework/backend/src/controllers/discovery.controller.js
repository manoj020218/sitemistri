const https = require('https');
const http  = require('http');
const { searchNearby, searchByPincode } = require('../services/discovery.service');
const { ok, err }      = require('../utils/response');

// Follow HTTP redirects and return the final URL
function resolveRedirects(url, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth > 12) return reject(new Error('Too many redirects'));
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
    }, (res) => {
      res.resume(); // discard body
      const loc = res.headers.location;
      if (res.statusCode >= 300 && res.statusCode < 400 && loc) {
        const next = loc.startsWith('http') ? loc : new URL(loc, url).toString();
        resolve(resolveRedirects(next, depth + 1));
      } else {
        resolve(url);
      }
    });
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout resolving URL')); });
    req.on('error', reject);
  });
}

function extractCoords(url) {
  // Google Maps place data format: !3d<lat>!4d<lng> — checked FIRST (actual pin, most precise)
  // e.g. data=!4m6!3m5!...!8m2!3d26.8676!4d75.7580  (maps.app.goo.gl resolves to this)
  const latM = url.match(/!3d(-?\d{1,3}\.\d+)/);
  const lngM = url.match(/!4d(-?\d{1,3}\.\d+)/);
  if (latM && lngM) return { lat: parseFloat(latM[1]), lng: parseFloat(lngM[1]) };

  // @lat,lng,zoom  or  @lat,lng (map view center — less precise than place pin)
  let m = url.match(/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };

  // q=lat,lng  or  query=lat,lng
  m = url.match(/[?&]q=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  // ll=lat,lng (legacy)
  m = url.match(/[?&]ll=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  // center=lat,lng
  m = url.match(/[?&]center=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  return null;
}

function nominatimReverse(lat, lng) {
  return new Promise((resolve, reject) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`;
    https.get(url, { headers: { 'User-Agent': 'SiteMitra/1.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { reject(new Error('Parse error')); } });
    }).on('error', reject);
  });
}

exports.resolveMapLink = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') return err(res, 'url required');

    // Accept google maps or goo.gl short links
    const isMapsUrl = /maps\.app\.goo\.gl|maps\.google\.com|google\.com\/maps|goo\.gl\/maps/i.test(url);
    if (!isMapsUrl) return err(res, 'Not a Google Maps link');

    const finalUrl = await resolveRedirects(url.trim());
    const coords   = extractCoords(finalUrl);
    if (!coords) return err(res, 'Could not extract coordinates from this link. Try sharing from Google Maps with the "Share" option.');

    let address = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
    try {
      const geo = await nominatimReverse(coords.lat, coords.lng);
      if (geo.display_name) address = geo.display_name;
    } catch {}

    return ok(res, { lat: coords.lat, lng: coords.lng, address });
  } catch (e) { return err(res, e.message, 500); }
};

exports.nearby = async (req, res) => {
  try {
    const { siteLocation, pincode, radiusKm = 10, requiredSkills = [], workType } = req.body;

    // Pincode-based search
    if (pincode) {
      const clean = String(pincode).trim();
      if (!/^\d{6}$/.test(clean)) return err(res, 'pincode must be exactly 6 digits');
      const results = await searchByPincode({ pincode: clean, requiredSkills });
      return ok(res, { results, count: results.length });
    }

    // Location-based search
    if (!siteLocation?.lat || !siteLocation?.lng)
      return err(res, 'siteLocation (lat/lng) or pincode required');

    const results = await searchNearby({
      lat: parseFloat(siteLocation.lat),
      lng: parseFloat(siteLocation.lng),
      radiusKm: Math.min(parseFloat(radiusKm), 50),
      requiredSkills,
      workType,
    });

    return ok(res, { results, count: results.length });
  } catch (e) { return err(res, e.message, 500); }
};
