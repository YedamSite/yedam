const fs = require('fs');
let file = fs.readFileSync('src/lib/db.ts', 'utf8');

file = file.replace(/value: '\+55 \(11\) 99999-9999'/g, "value: '+82 01024836078'");
file = file.replace(/link: '#contacto-form'/g, "link: 'https://wa.me/821024836078'");
file = file.replace(/value: 'ola@cheotnun.com'/g, "value: 'sac@cheotnun.com'");
file = file.replace(/link: 'mailto:ola@cheotnun.com'/g, "link: 'mailto:sac@cheotnun.com'");
file = file.replace(/link: 'https:\/\/www\.instagram\.com\/lacheotnun\/'/g, "link: 'https://instagram.com/cheotnun.kbeauty'");
file = file.replace(/value: 'São Paulo, SP, Brasil'/g, "value: 'Incheon, Coreia do Sul'");

// Specifically for the contact methods array where there are "#" links
// Instead of regex, let's just do targeted replaces on the lines we know:
file = file.replace(/btn: 'VER NO MAPA', link: '#'/g, "btn: 'VER NO MAPA', link: 'https://maps.google.com/?q=9+Inju-daero+224beon-gil,+Michuhol-gu,+Incheon'");

fs.writeFileSync('src/lib/db.ts', file, 'utf8');
console.log('Fixed translations in db.ts!');
