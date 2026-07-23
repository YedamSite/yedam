'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Droplet, 
  Sparkles, 
  Leaf, 
  AlertCircle, 
  Hourglass, 
  LayoutGrid, 
  Sun, 
  Moon,
  ArrowRight,
  Flower,
  ShieldCheck,
  FlaskConical,
  Target,
  Sparkle,
  Atom,
  Mail,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  ShoppingBag
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { saveNewsletterSubscriberToSupabase } from '@/lib/newsletterService';
import { useState, useEffect } from 'react';

export default function RutinasPage() {
  const { t, locale } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await saveNewsletterSubscriberToSupabase(newsletterEmail, 'rutinas');
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A1128] text-white font-sans selection:bg-[#F2D7B6] selection:text-[#0A1128]">
      <Header />

      <main className="flex-1 w-full flex flex-col items-center overflow-x-hidden">
        
        {/* HERO SECTION */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
          <div className="max-w-xl z-10 relative">
            <span className="text-[#F2D7B6] font-bold text-xs tracking-widest uppercase mb-4 block">
              {t('GUIA DE SKINCARE COREANO')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight">
              {t('Aprenda os passos do skincare coreano')}
            </h1>
            <p className="text-white/80 text-sm md:text-base leading-relaxed mb-10 max-w-md">
              {t('Entenda a função de cada etapa, conheça os ingredientes do K-Beauty e descubra como utilizar os produtos corretamente para cuidar da sua pele todos os dias.')}
            </p>
            <Link href="/tienda" className="bg-[#E0B984] hover:bg-[#F2D7B6] text-[#0A1128] font-bold text-[10px] tracking-widest px-8 py-4 rounded-md uppercase inline-flex items-center gap-3 transition-colors">
              {t('EXPLORAR PRODUTOS')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[600px] flex items-center justify-center lg:justify-end z-0">
            {/* Glowing ring effect behind products */}
            <div className="absolute right-0 lg:right-10 top-1/2 -translate-y-1/2 w-[250px] sm:w-[350px] lg:w-[450px] h-[250px] sm:h-[350px] lg:h-[450px] rounded-full border-[1px] border-[#E0B984]/30 shadow-[0_0_100px_rgba(224,185,132,0.15)] flex items-center justify-center">
               <div className="w-[90%] h-[90%] rounded-full border-[3px] border-[#E0B984]/80 shadow-[0_0_50px_rgba(224,185,132,0.3)]"></div>
            </div>
            
            {/* Products image overlay */}
            <div className="relative z-10 w-[110%] md:w-full h-full lg:-mr-12 scale-[1.15] lg:scale-[1.2] origin-right">
              <Image 
                src="https://images.unsplash.com/photo-1615397323136-1e075e7a2b9d?q=80&w=1200&auto=format&fit=crop" 
                alt="Skincare Products"
                fill
                className="object-contain object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A1128] via-transparent to-transparent md:w-1/3 left-0"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-transparent to-transparent h-1/4 bottom-0"></div>
            </div>
          </div>
        </section>

        {/* CONHEÇA CADA ETAPA DO SKINCARE */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
          <div className="mb-10">
            <h2 className="text-3xl font-serif text-white mb-2">{t('Conheça cada etapa do skincare')}</h2>
            <p className="text-white/60 text-sm">{t('Entenda a função de cada passo e descubra como eles trabalham juntos.')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { id: 'limpeza', icon: Droplet, title: 'Limpeza', desc: 'Remove impurezas, oleosidade, maquiagem e prepara a pele.' },
              { id: 'tonico', icon: Sparkle, title: 'Tônico', desc: 'Ajuda a equilibrar a pele e melhora a absorção dos próximos produtos.' },
              { id: 'essencia', icon: Sparkles, title: 'Essência', desc: 'Etapa tradicional do skincare coreano para complementar a hidratação da pele.' },
              { id: 'serum', icon: FlaskConical, title: 'Sérum', desc: 'Produto concentrado com diferentes ingredientes e benefícios.' },
              { id: 'hidratante', icon: LayoutGrid, title: 'Hidratante', desc: 'Ajuda a manter a hidratação e auxilia na proteção da barreira cutânea.' },
              { id: 'protetor', icon: Sun, title: 'Protetor Solar', desc: 'Etapa indispensável durante o dia para proteção contra os raios UV.' },
            ].map((step, idx) => (
              <div key={idx} className="border border-[#1E2943] bg-[#0F1736] hover:border-[#E0B984]/50 transition-all rounded-lg p-6 flex flex-col items-center text-center group">
                <step.icon className="w-8 h-8 text-[#E0B984] mb-4 group-hover:scale-110 transition-transform" strokeWidth={1} />
                <h3 className="text-white font-serif text-lg mb-3">{t(step.title)}</h3>
                <p className="text-white/60 text-[10px] leading-relaxed mb-6 flex-1">{t(step.desc)}</p>
                <Link href={`/tienda?step=${step.id}`} className="text-[9px] font-bold tracking-widest uppercase border border-[#E0B984]/30 text-[#E0B984] hover:bg-[#E0B984] hover:text-[#0A1128] py-2 px-4 rounded w-full transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                  {t('SAIBA MAIS')} <ArrowRight className="w-3 h-3 shrink-0" />
                </Link>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-white/50 text-[11px]">
             <Flower className="w-4 h-4 text-[#E0B984]" />
             {t('* Clique em cada etapa para entender melhor sobre os produtos e encontrar opções disponíveis na Yedam.')}
          </div>
        </section>

        {/* INGREDIENTES DO K-BEAUTY */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16 bg-gradient-to-b from-[#0A1128] to-[#0A1128]">
          <div className="mb-10">
            <h2 className="text-3xl font-serif text-white mb-2">{t('Ingredientes do K-Beauty')}</h2>
            <p className="text-white/60 text-sm">{t('Conheça alguns dos ingredientes mais utilizados na cosmética coreana.')}</p>
          </div>

          <div className="flex overflow-x-auto pb-6 -mx-6 px-6 lg:mx-0 lg:px-0 gap-4 snap-x scrollbar-hide">
            {[
              { img: 'https://images.unsplash.com/photo-1620023023023-e18ec34237c1?q=80&w=400&auto=format&fit=crop', name: 'Centella Asiática', desc: 'Tradicional ingrediente vegetal presente em diversos cosméticos.' },
              { img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&auto=format&fit=crop', name: 'Ácido Hialurônico', desc: 'Ingrediente amplamente utilizado em produtos hidratantes.' },
              { img: 'https://images.unsplash.com/photo-1608248593842-83b632008f51?q=80&w=400&auto=format&fit=crop', name: 'Niacinamida', desc: 'Encontrada em diferentes fórmulas para cuidados diários da pele.' },
              { img: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?q=80&w=400&auto=format&fit=crop', name: 'Chá Verde', desc: 'Ingrediente de origem vegetal muito utilizado na cosmética asiática.' },
              { img: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=400&auto=format&fit=crop', name: 'Extrato de Arroz', desc: 'Conhecido por seu uso tradicional nos cuidados com a pele.' },
              { img: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=400&auto=format&fit=crop', name: 'Ceramidas', desc: 'Presentes em produtos voltados à hidratação e proteção da pele.' },
              { img: 'https://images.unsplash.com/photo-1583516035272-35fa4ff8d80c?q=80&w=400&auto=format&fit=crop', name: 'Mucina de Caracol', desc: 'Ingrediente bastante popular no skincare coreano.' },
              { img: 'https://images.unsplash.com/photo-1587049352847-81a56d773c15?q=80&w=400&auto=format&fit=crop', name: 'Própolis', desc: 'Ingrediente utilizado em diversas formulações.' },
            ].map((ing, idx) => (
              <div key={idx} className="min-w-[160px] md:min-w-[180px] snap-start bg-[#0F1736] border border-[#1E2943] rounded-lg overflow-hidden group hover:border-[#E0B984]/30 transition-colors flex flex-col">
                <div className="h-32 w-full relative overflow-hidden">
                  <Image src={ing.img} alt={ing.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1736] via-transparent to-transparent"></div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="text-white text-xs font-bold mb-2">{t(ing.name)}</h4>
                  <p className="text-white/60 text-[9px] mb-4 flex-1 leading-relaxed">{t(ing.desc)}</p>
                  <Link href={`/tienda?ingredient=${encodeURIComponent(ing.name)}`} className="text-[9px] font-bold text-[#E0B984] hover:text-white uppercase flex items-center gap-1 transition-colors">
                    {t('VER PRODUTOS')} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMO MONTAR SUA ROTINA */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
          <h2 className="text-3xl font-serif text-white mb-12">{t('Como montar sua rotina?')}</h2>
          
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Timeline */}
            <div className="flex-1 w-full flex items-center justify-between relative">
              {/* Connecting line */}
              <div className="absolute top-8 left-4 right-4 h-[1px] bg-[#1E2943] -z-10"></div>
              
              {[
                { num: '1', title: 'Limpeza', icon: Droplet },
                { num: '2', title: 'Tônico', icon: Sparkle },
                { num: '3', title: 'Essência', icon: Sparkles, sub: '(Opcional)' },
                { num: '4', title: 'Sérum', icon: FlaskConical },
                { num: '5', title: 'Hidratante', icon: LayoutGrid },
                { num: '6', title: 'Protetor Solar', icon: Sun, sub: '(Durante o dia)' },
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center group cursor-default">
                  <div className="w-6 h-6 rounded-full bg-[#0A1128] border border-[#1E2943] text-white/50 flex items-center justify-center text-[10px] mb-2 group-hover:border-[#E0B984] group-hover:text-[#E0B984] transition-colors">
                    {step.num}
                  </div>
                  <div className="w-12 h-12 rounded-full border border-[#1E2943] bg-[#0F1736] flex items-center justify-center mb-3 group-hover:border-[#E0B984]/50 transition-colors">
                     <step.icon className="w-5 h-5 text-white/70 group-hover:text-[#E0B984] transition-colors" strokeWidth={1.5} />
                  </div>
                  <span className="text-white text-[11px] text-center font-medium">{t(step.title)}</span>
                  {step.sub && <span className="text-white/40 text-[9px] text-center mt-1">{t(step.sub)}</span>}
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="w-full lg:w-1/3 bg-[#0F1736] border border-[#1E2943] rounded-lg p-8 relative overflow-hidden">
               <h3 className="text-white font-serif text-xl mb-4 relative z-10">{t('Sua rotina pode ser única.')}</h3>
               <p className="text-white/60 text-[11px] leading-relaxed relative z-10">
                 {t('Nem todas as pessoas utilizam todas as etapas. A ordem acima representa uma sequência comum no skincare coreano, mas cada rotina pode variar conforme as preferências e os produtos escolhidos.')}
               </p>
               <Flower className="absolute right-4 bottom-4 w-24 h-24 text-[#E0B984]/10 pointer-events-none" strokeWidth={0.5} />
            </div>
          </div>
        </section>

        {/* DICAS PARA APROVEITAR MELHOR */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
          <h2 className="text-3xl font-serif text-white mb-8">{t('Dicas para aproveitar melhor seus produtos')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                title: 'Rotina da manhã', 
                desc: 'Conheça uma sequência simples para iniciar o dia e proteger sua pele.', 
                img: 'https://images.unsplash.com/photo-1556228578-8d89cb7acb5c?q=80&w=300&auto=format&fit=crop',
                icon: Sun,
                link: '/tienda'
              },
              { 
                title: 'Rotina da noite', 
                desc: 'Veja como organizar seus cuidados antes de dormir para uma pele saudável.', 
                img: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=300&auto=format&fit=crop',
                icon: Moon,
                link: '/tienda'
              },
              { 
                title: 'Antes da maquiagem', 
                desc: 'Alguns cuidados ajudam a preparar melhor a pele antes da maquiagem.', 
                img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=300&auto=format&fit=crop',
                icon: Sparkles,
                link: '/tienda'
              },
              { 
                title: 'Removendo a maquiagem', 
                desc: 'Uma limpeza adequada ajuda a remover resíduos e manter a pele equilibrada.', 
                img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=300&auto=format&fit=crop',
                icon: Droplet,
                link: '/tienda'
              },
            ].map((tip, idx) => (
              <div key={idx} className="bg-[#0F1736] border border-[#1E2943] hover:border-[#E0B984]/30 transition-colors rounded-lg flex overflow-hidden h-40 group">
                <div className="w-1/3 relative">
                  <Image src={tip.img} alt={tip.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#0A1128]/60 backdrop-blur-sm flex items-center justify-center">
                    <tip.icon className="w-3 h-3 text-[#E0B984]" />
                  </div>
                </div>
                <div className="w-2/3 p-5 flex flex-col justify-center">
                  <h4 className="text-white font-serif text-base mb-2">{t(tip.title)}</h4>
                  <p className="text-white/60 text-[10px] leading-relaxed mb-4">{t(tip.desc)}</p>
                  <Link href={tip.link} className="text-[9px] font-bold text-[#E0B984] hover:text-white uppercase flex items-center gap-1 transition-colors mt-auto">
                    {t('SAIBA MAIS')} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* UNIVERSO DA MAQUIAGEM COREANA & CATEGORIAS */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Universo da Maquiagem */}
          <div className="border border-[#1E2943] bg-[#0F1736] p-8 rounded-lg">
            <h2 className="text-2xl font-serif text-white mb-2">{t('Universo da Maquiagem Coreana')}</h2>
            <p className="text-white/60 text-sm mb-8">{t('Explore as categorias mais populares e realce sua beleza.')}</p>
            
            <div className="flex justify-between overflow-x-auto gap-4 pb-4 scrollbar-hide">
              {[
                { name: 'Cushion', img: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=150' },
                { name: 'Lip Tint', img: 'https://images.unsplash.com/photo-1586445580665-22d7d8e204c3?q=80&w=150' },
                { name: 'Bases', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=150' },
                { name: 'Sombras', img: 'https://images.unsplash.com/photo-1583241475880-083f84372725?q=80&w=150' },
                { name: 'Blush', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=150' },
                { name: 'Máscaras para olhos', img: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=150' },
                { name: 'Delineadores', img: 'https://images.unsplash.com/photo-1590159763121-6c3e944747eb?q=80&w=150' },
                { name: 'Pincéis e acessórios', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=150' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 min-w-[60px] group cursor-pointer">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-[#1E2943] group-hover:border-[#E0B984] transition-colors relative">
                    <Image src={item.img} alt={item.name} fill className="object-cover" />
                  </div>
                  <span className="text-[9px] text-white/70 text-center leading-tight group-hover:text-white">{t(item.name)}</span>
                </div>
              ))}
            </div>

            <Link href="/tienda?category=maquiagem" className="text-[10px] font-bold text-[#E0B984] hover:text-white uppercase flex items-center gap-2 transition-colors mt-6">
              {t('VER TODAS AS CATEGORIAS DE MAQUIAGEM')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Explore Categorias */}
          <div className="border border-[#1E2943] bg-[#0F1736] p-8 rounded-lg">
            <h2 className="text-2xl font-serif text-white mb-8">{t('Explore nossas categorias')}</h2>
            
            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
              {[
                { icon: Droplet, name: 'Skincare' },
                { icon: Sparkle, name: 'Maquiagem' },
                { icon: Sun, name: 'Proteção Solar' },
                { icon: Sparkles, name: 'Máscaras Faciais' },
                { icon: ShieldCheck, name: 'Cuidados Labiais' },
                { icon: LayoutGrid, name: 'Kits' },
                { icon: AlertCircle, name: 'Novidades' },
                { icon: Target, name: 'Mais Vendidos' },
              ].map((cat, idx) => (
                <Link key={idx} href={`/tienda`} className="flex flex-col items-center gap-3 group">
                   <div className="w-10 h-10 flex items-center justify-center border border-[#1E2943] rounded bg-[#0A1128] group-hover:border-[#E0B984]/50 transition-colors">
                     <cat.icon className="w-4 h-4 text-white/60 group-hover:text-[#E0B984] transition-colors" strokeWidth={1.5} />
                   </div>
                   <span className="text-[9px] text-white/60 text-center group-hover:text-white transition-colors">{t(cat.name)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* PERGUNTAS FREQUENTES */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
          <h2 className="text-3xl font-serif text-white mb-8">{t('Perguntas frequentes')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { q: 'O skincare coreano possui uma quantidade obrigatória de etapas?', a: 'Não, as rotinas podem ser adaptadas às necessidades da sua pele. As famosas "10 etapas" são apenas um guia.' },
              { q: 'Posso utilizar apenas alguns produtos?', a: 'Sim! Você pode começar com os passos básicos: limpeza, hidratação e proteção solar.' },
              { q: 'Como escolher um produto?', a: 'Sempre considere seu tipo de pele e as preocupações que deseja tratar, como acne, manchas ou ressecamento.' },
              { q: 'A Yedam faz diagnóstico de pele?', a: 'Sim, entre em contato com nosso suporte e uma de nossas consultoras ajudará você a montar a rotina perfeita.' },
            ].map((faq, idx) => (
              <div key={idx} className="border border-[#1E2943] bg-[#0F1736] rounded-lg overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 flex items-start justify-between text-left hover:bg-white/5 transition-colors gap-4"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-4 h-4 text-[#E0B984] shrink-0 mt-0.5" />
                    <span className="text-[11px] text-white/90 leading-relaxed font-medium">{t(faq.q)}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/40 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-[10px] text-white/60 leading-relaxed border-t border-[#1E2943] ml-11">
                    {t(faq.a)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16 mb-8">
           <div className="border border-[#1E2943] bg-[#0F1736] rounded-xl flex flex-col md:flex-row items-center overflow-hidden relative">
              <div className="w-full md:w-1/2 p-10 lg:p-16 flex flex-col justify-center relative z-10">
                 <h2 className="text-3xl font-serif text-white mb-3 max-w-sm">{t('Receba novidades sobre o universo do K-Beauty')}</h2>
                 <p className="text-white/60 text-xs mb-8 max-w-sm leading-relaxed">{t('Lançamentos, tendências, dicas de beleza e promoções exclusivas diretamente no seu e-mail.')}</p>
                 
                 <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3 w-full max-w-md">
                   <input 
                     type="email" 
                     placeholder={t('Seu melhor e-mail')} 
                     className="w-full bg-[#0A1128] border border-[#1E2943] text-white placeholder-white/30 px-4 py-3 rounded text-xs focus:outline-none focus:border-[#E0B984]"
                     value={newsletterEmail}
                     onChange={(e) => setNewsletterEmail(e.target.value)}
                     required
                   />
                   <button 
                     type="submit"
                     className="w-full bg-[#E0B984] hover:bg-[#F2D7B6] text-[#0A1128] font-bold text-[10px] tracking-widest px-4 py-3 rounded uppercase transition-colors"
                   >
                     {newsletterSubscribed ? t('CADASTRADO!') : t('QUERO RECEBER NOVIDADES')}
                   </button>
                   <p className="text-[9px] text-white/40 mt-1">{t('Prometemos não enviar spam. Só compartilhamos o melhor do K-Beauty.')}</p>
                 </form>
              </div>

              {/* Decorative Envelope */}
              <Mail className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 text-white/[0.02] pointer-events-none md:hidden lg:block z-0" strokeWidth={0.5} />

              <div className="w-full md:w-1/2 h-64 md:h-full min-h-[300px] relative">
                 <Image 
                   src="https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=800&auto=format&fit=crop"
                   alt="Newsletter"
                   fill
                   className="object-cover object-center"
                 />
                 <div className="absolute inset-0 bg-gradient-to-r from-[#0F1736] via-transparent to-transparent"></div>
              </div>
           </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
