const fs = require('fs');
let db = fs.readFileSync('src/lib/db.ts', 'utf8');
db = db.replace(/const SEED_VERSION = 'v6';/g, "const SEED_VERSION = 'v7';");
fs.writeFileSync('src/lib/db.ts', db);
