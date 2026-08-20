const fs = require('fs');
let content = fs.readFileSync('src/context/translations.ts', 'utf8');

const ptAdd = "    'Preguntas Frecuentes': 'Perguntas Frequentes',\n    'Encuentra respuestas rápidas a las dudas más comunes de nuestros clientes.': 'Encontre respostas rápidas para as dúvidas mais comuns dos nossos clientes.',\n";

const enAdd = "    'Preguntas Frecuentes': 'Frequently Asked Questions',\n    'Encuentra respuestas rápidas a las dudas más comunes de nuestros clientes.': 'Find quick answers to our customers\\' most common questions.',\n";

if (!content.includes('Preguntas Frecuentes')) {
  content = content.replace('pt: {\n', 'pt: {\n' + ptAdd);
  content = content.replace('en: {\n', 'en: {\n' + enAdd);
  fs.writeFileSync('src/context/translations.ts', content);
}
console.log('Translations updated!');
