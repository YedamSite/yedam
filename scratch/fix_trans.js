const fs = require('fs');
let code = fs.readFileSync('src/context/translations.ts', 'utf8');

code = code.replace(/'WhatsApp: \+34 600 111 222': 'WhatsApp: \+34 600 111 222',/g, "'WhatsApp: +82 01024836078': 'WhatsApp: +82 01024836078',");
code = code.replace(/'Calle Gran Vía 12, Madrid, España': 'Calle Gran Vía 12, Madri, Espanha',/g, "");
code = code.replace(/'Calle Gran Vía 12, Madrid, España': 'Gran Via 12, Madrid, Spain',/g, "");

fs.writeFileSync('src/context/translations.ts', code);
console.log('Fixed translations.ts');
