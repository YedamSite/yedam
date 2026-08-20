const fs = require('fs');
let file = fs.readFileSync('src/lib/db.ts', 'utf8');

// Replace contact methods
file = file.replace(/value: '\+1 \(555\) 123-4567'/g, "value: '+82 01024836078'");
file = file.replace(/value: 'hello@cheotnun\.com'/g, "value: 'sac@cheotnun.com'");
file = file.replace(/link: 'mailto:hello@cheotnun\.com'/g, "link: 'mailto:sac@cheotnun.com'");
file = file.replace(/value: 'Miami, FL, USA'/g, "value: 'Incheon, South Korea'");
file = file.replace(/btn: 'VIEW ON MAP', link: '#'/g, "btn: 'VIEW ON MAP', link: 'https://maps.google.com/?q=9+Inju-daero+224beon-gil,+Michuhol-gu,+Incheon'");

// Replace quickItems in EN
file = file.replace(
  "quickItems: [\n              'How long does shipping take?',\n              'What payment methods do you accept?',\n              'Do you ship to my country?',\n              'Can I return or exchange a product?'\n            ]",
  `quickItems: [
              { q: 'How long does shipping take?', a: 'Standard shipping takes 3 to 7 business days, and express 1 to 3 business days.' },
              { q: 'What payment methods do you accept?', a: 'We accept credit cards, debit cards, Pix, and bank transfers via Stripe and PayPal.' },
              { q: 'Do you ship to my country?', a: 'Yes, we ship worldwide. Shipping costs and delivery times vary by location.' },
              { q: 'Can I return or exchange a product?', a: 'You have 30 days to return an unused product in its original packaging. Contact us to start the process.' }
            ]`
);

fs.writeFileSync('src/lib/db.ts', file, 'utf8');
console.log('EN translations updated in db.ts!');
