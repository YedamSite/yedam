const fs = require('fs');
let db = fs.readFileSync('src/lib/db.ts', 'utf8');

db = db.replace(/Calle Gran Vía 12, Madrid, Spain/g, '9 Inju-daero 224beon-gil, Michuhol-gu, Incheon');
db = db.replace(/const SEED_VERSION = 'v5';/g, "const SEED_VERSION = 'v6';");

fs.writeFileSync('src/lib/db.ts', db);
console.log('Fixed db.ts and bumped version to v6');
