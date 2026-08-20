const fs = require('fs');
let db = fs.readFileSync('src/lib/db.ts', 'utf8');

db = db.replace(/\+34 600 111 222/g, '+82 01024836078');
db = db.replace(/34600111222/g, '8201024836078');
db = db.replace(/Calle Gran Vía 12, Madrid, España/g, '9 Inju-daero 224beon-gil, Michuhol-gu, Incheon');
db = db.replace(/São Paulo, SP, Brasil/g, '9 Inju-daero 224beon-gil, Michuhol-gu, Incheon');
db = db.replace(/Miami, FL, USA/g, '9 Inju-daero 224beon-gil, Michuhol-gu, Incheon');
db = db.replace(/ola@cheotnun\.com/g, 'sac@cheotnun.com');
db = db.replace(/hello@cheotnun\.com/g, 'sac@cheotnun.com');
db = db.replace(/\+55 \(11\) 99999-9999/g, '+82 01024836078');
db = db.replace(/\+1 \(555\) 123-4567/g, '+82 01024836078');
db = db.replace(/\+34600000000/g, '+8201024836078');
db = db.replace(/WhatsApp: \+34 600 111 222/g, 'WhatsApp: +82 01024836078');
db = db.replace(/const SEED_VERSION = 'v4';/g, "const SEED_VERSION = 'v5';");

fs.writeFileSync('src/lib/db.ts', db);
console.log('Fixed db.ts and bumped version to v5');
