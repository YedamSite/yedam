const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const contactoData = {
  hero: { image: '/images/cheotnun-k-beauty-contato-atendimento.webp', title: 'Fale Conosco', subtitle: 'Estamos aqui para ajudar você com dúvidas, sugestões ou qualquer necessidade.', buttonText: 'RESPOSTA RÁPIDA E PERSONALIZADA', badges: [{ icon: 'Clock', text: 'Atendimento em português' }, { icon: 'Clock', text: 'Resposta em menos de 24h' }, { icon: 'CheckCircle2', text: 'Sua satisfação é nossa prioridade' }] },
  contactMethods: {
    title: 'Formas de contato',
    whatsapp: { label: 'WhatsApp', value: '+82 01024836078', time: 'Seg a Sex, 9h às 18h (GMT-3)', desc: 'A forma mais rápida de falar com nossa equipe.', btn: 'FALAR AGORA', link: 'https://wa.me/821024836078' },
    email: { label: 'E-mail', value: 'sac@cheotnun.com', time: 'Resposta em menos de 24h', desc: 'Envie um e-mail e responderemos em breve.', btn: 'ENVIAR E-MAIL', link: 'mailto:sac@cheotnun.com' },
    instagram: { label: 'Instagram', value: '@cheotnun.kbeauty', time: '', desc: 'Envie uma mensagem direta no Instagram.', btn: 'IR PARA O INSTAGRAM', link: 'https://instagram.com/cheotnun.kbeauty' },
    hours: { label: 'Horário de atendimento', value: 'Exceto feriados', time: '', desc: 'Segunda a sexta 9h às 18h (GMT-3)', btn: 'VER HORÁRIOS', link: '#' },
    address: { label: 'Endereço', value: 'Incheon, Coreia do Sul', time: '', desc: 'Escritório administrativo', btn: 'VER NO MAPA', link: 'https://maps.google.com/?q=9+Inju-daero+224beon-gil,+Michuhol-gu,+Incheon' }
  },
  form: {
    title: 'Envie uma mensagem',
    nameLabel: 'Nome completo',
    emailLabel: 'E-mail',
    subjectLabel: 'Assunto',
    subjectOptions: ['Selecione um assunto', 'Dúvidas sobre produtos', 'Status do meu pedido', 'Devoluções', 'Outros'],
    messageLabel: 'Sua mensagem',
    submitText: 'ENVIAR MENSAGEM',
    securityNotice: 'Sua informação está segura conosco e não será compartilhada.',
    successAlert: 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
  },
  faq: {
    title: 'Como podemos ajudar?',
    subtitle: 'Perguntas frequentes rápidas',
    buttonText: 'VER TODAS AS PERGUNTAS FREQUENTES',
    topics: [
      { icon: 'Info', title: 'Informações sobre produtos', desc: 'Dúvidas sobre ingredientes, benefícios e recomendações.' },
      { icon: 'PackageSearch', title: 'Pedidos e envios', desc: 'Acompanhe o status do seu pedido, prazos de entrega.' },
      { icon: 'CreditCard', title: 'Pagamentos e faturamento', desc: 'Informações sobre formas de pagamento, notas fiscais e reembolsos.' },
      { icon: 'RefreshCw', title: 'Devoluções e trocas', desc: 'Dúvidas sobre trocas, devoluções e garantias.' },
      { icon: 'Handshake', title: 'Colaborações e imprensa', desc: 'Propostas de colaboração, eventos e imprensa.' }
    ],
    quickItems: [
      { q: 'Quanto tempo leva para meu pedido chegar?', a: 'Os envios padrão levam de 3 a 7 dias úteis, e os expressos de 1 a 3 dias úteis.' },
      { q: 'Quais métodos de pagamento vocês aceitam?', a: 'Aceitamos cartões de crédito, débito, Pix e transferências bancárias através do Stripe e PayPal.' },
      { q: 'Vocês fazem envios para todo o Brasil?', a: 'Sim, realizamos envios para todo o mundo. Os custos e tempos de entrega variam de acordo com a localização.' },
      { q: 'Posso trocar ou devolver um produto?', a: 'Você tem 30 dias para devolver um produto sem uso e em sua embalagem original. Entre em contato conosco para iniciar o processo.' }
    ]
  },
  community: {
    title: 'Junte-se à nossa comunidade',
    desc: 'Siga-nos nas redes sociais e seja a primeira a descobrir lançamentos, promoções e dicas de beleza.',
    buttonText: 'SEGUIR NO INSTAGRAM',
    buttonLink: 'https://instagram.com/cheotnun.kbeauty',
    images: [
      'https://images.unsplash.com/photo-1615397323281-a6cecd55dbf7?q=80&w=300',
      'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=300',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300'
    ]
  }
};

async function syncContacto() {
  const { data: existing, error: fetchErr } = await supabase
    .from('cheotnun_site_content')
    .select('id')
    .eq('page_name', 'contacto')
    .eq('section_key', 'all');

  if (fetchErr) {
    console.error('Error fetching', fetchErr);
    return;
  }

  if (existing && existing.length > 0) {
    console.log('Updating existing...');
    const { error } = await supabase
      .from('cheotnun_site_content')
      .update({ content: contactoData })
      .eq('id', existing[0].id);
    if (error) console.error('Update error', error);
    else console.log('Update success');
  } else {
    console.log('Inserting new...');
    const { error } = await supabase
      .from('cheotnun_site_content')
      .insert([{ page_name: 'contacto', section_key: 'all', content: contactoData }]);
    if (error) console.error('Insert error', error);
    else console.log('Insert success');
  }
}

syncContacto();
