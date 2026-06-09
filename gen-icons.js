const sharp = require('/root/projects/SiteMitra/backend/node_modules/sharp');
const fs = require('fs');
const svg = fs.readFileSync('/root/projects/SiteMitra/web/icon.svg');
const web = '/root/projects/SiteMitra/web';

Promise.all([
  sharp(svg).resize(192, 192).png().toFile(web + '/icon-192.png'),
  sharp(svg).resize(512, 512).png().toFile(web + '/icon-512.png'),
  sharp(svg).resize(512, 512).png().toFile(web + '/icon-maskable.png'),
]).then(() => console.log('Icons generated')).catch(e => console.error(e.message));
