'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Droplet, 
  Sparkles, 
  LayoutGrid, 
  Sun, 
  Moon,
  ArrowRight,
  ShieldCheck,
  FlaskConical,
  Target,
  Sparkle,
  Mail,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { saveNewsletterSubscriberToSupabase } from '@/lib/newsletterService';
import { useState } from 'react';

// Custom Icons to match image perfectly
const FlowerOutline = () => (
  <svg width="60" height="90" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 85 C 30 50, 45 40, 45 10" stroke="#C9C9C9" strokeWidth="1" strokeLinecap="round" />
    <path d="M30 65 C 20 60, 15 50, 15 40" stroke="#C9C9C9" strokeWidth="1" strokeLinecap="round" />
    <path d="M45 10 C 50 15, 55 10, 50 5 C 45 0, 40 5, 45 10" stroke="#C9C9C9" strokeWidth="1" />
    <path d="M15 40 C 20 45, 10 50, 5 45 C 0 40, 10 35, 15 40" stroke="#C9C9C9" strokeWidth="1" />
    <circle cx="45" cy="10" r="1.5" fill="#C9C9C9" />
    <circle cx="15" cy="40" r="1.5" fill="#C9C9C9" />
    <path d="M35 50 C 45 55, 55 50, 50 40 C 45 30, 35 40, 35 50" stroke="#C9C9C9" strokeWidth="1" />
    <circle cx="43" cy="45" r="1.5" fill="#C9C9C9" />
    <path d="M25 25 C 20 15, 10 20, 15 30 C 20 40, 30 35, 25 25" stroke="#C9C9C9" strokeWidth="1" />
    <circle cx="18" cy="25" r="1.5" fill="#C9C9C9" />
  </svg>
);

const OutlineCircle = ({ children }: { children: React.ReactNode }) => (
  <div className="w-5 h-5 rounded-full border border-[#C9C9C9] text-[#C9C9C9] flex items-center justify-center text-[9px]">
    {children}
  </div>
);

export default function RutinasPage() {
  const { t } = useLanguage();
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
    <div className="flex flex-col min-h-screen bg-[#040914] text-white font-sans selection:bg-[#C9C9C9] selection:text-[#040914]">
      <Header />

      <main className="flex-1 w-full flex flex-col items-center overflow-x-hidden">
        
        {/* HERO SECTION */}
        <section className="w-full max-w-[1200px] mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
          <div className="max-w-xl z-10 relative">
            <span className="text-[#C9C9C9] font-medium text-[10px] tracking-widest uppercase mb-4 block">
              {t('GUIA DE SKINCARE COREANO')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-serif text-white mb-6 leading-[1.1] font-light">
              {t('Aprenda os passos do skincare coreano')}
            </h1>
            <p className="text-white/70 text-[13px] leading-relaxed mb-8 max-w-[400px]">
              {t('Entenda a função de cada etapa, conheça os ingredientes do K-Beauty e descubra como utilizar os produtos corretamente para cuidar da sua pele todos os dias.')}
            </p>
            <Link href="/tienda?search=Rutina" className="bg-[#C9C9C9] hover:bg-[#E5E5E5] text-[#040914] font-bold text-[10px] tracking-widest px-6 py-3.5 rounded-sm uppercase inline-flex items-center gap-4 transition-colors">
              {t('EXPLORAR PRODUTOS')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="relative w-full h-[400px] lg:h-[500px] flex items-center justify-center lg:justify-end z-0">
            {/* Glowing ring effect behind products */}
            <div className="absolute right-10 lg:right-20 top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border-[2px] border-[#C9C9C9]/40 shadow-[0_0_100px_rgba(201,201,201,0.4)] flex items-center justify-center">
            </div>
            
            {/* Products image overlay */}
            <div className="relative z-10 w-full h-full scale-[1.1] origin-right">
              <Image 
                src="/images/cheotnun-k-beauty-rutinas-skincare.webp" 
                alt="Skincare Products"
                fill
                className="object-contain object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#040914] via-[#040914]/40 to-transparent w-1/3 left-0"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#040914] via-transparent to-transparent h-1/4 bottom-0"></div>
            </div>
          </div>
        </section>

        <div className="w-full h-[1px] bg-[#1A233A] max-w-[1200px] mx-auto"></div>

        {/* CONHEÇA CADA ETAPA DO SKINCARE */}
        <section className="w-full max-w-[1200px] mx-auto px-6 py-16">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-[26px] font-serif text-white mb-2 font-light">{t('Conheça cada etapa do skincare')}</h2>
            <p className="text-white/60 text-[12px]">{t('Entenda a função de cada passo e descubra como eles trabalham juntos.')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { id: 'limpeza', icon: Droplet, title: 'Limpeza', desc: 'Remove impurezas, oleosidade, maquiagem e prepara a pele.' },
              { id: 'tonico', icon: Droplet, title: 'Tônico', desc: 'Ajuda a equilibrar a pele e melhora a absorção dos próximos produtos.' },
              { id: 'essencia', icon: Sparkles, title: 'Essência', desc: 'Etapa tradicional do skincare coreano para complementar a hidratação da pele.' },
              { id: 'serum', icon: Droplet, title: 'Sérum', desc: 'Produto concentrado com diferentes ingredientes e benefícios.' },
              { id: 'hidratante', icon: LayoutGrid, title: 'Hidratante', desc: 'Ajuda a manter a hidratação e auxilia na proteção da barreira cutânea.' },
              { id: 'protetor', icon: Sun, title: 'Protetor Solar', desc: 'Etapa indispensável durante o dia para proteção contra os raios UV.' },
            ].map((step, idx) => (
              <div key={idx} className="border border-[#1A233A] bg-[#070D1C] rounded-sm p-6 flex flex-col items-center text-center group">
                <step.icon className="w-7 h-7 text-[#C9C9C9] mb-4" strokeWidth={1} />
                <h3 className="text-[#C9C9C9] font-serif text-[15px] mb-3 font-medium">{t(step.title)}</h3>
                <p className="text-white/70 text-[10px] leading-relaxed mb-6 flex-1 px-1">{t(step.desc)}</p>
                <Link href={`/tienda?search=${encodeURIComponent(step.title)}`} className="text-[8px] font-bold tracking-widest uppercase border border-[#1A233A] text-white hover:border-[#C9C9C9] py-2.5 px-6 rounded-sm w-max transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                  {t('SAIBA MAIS')} <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-[#C9C9C9]/80 text-[10px]">
             <Sparkle className="w-3.5 h-3.5 text-[#C9C9C9]" strokeWidth={1.5} />
             {t('* Clique em cada etapa para entender melhor sobre os produtos e encontrar opções disponíveis na Yedam.')}
          </div>
        </section>

        <div className="w-full h-[1px] bg-[#1A233A] max-w-[1200px] mx-auto opacity-50"></div>

        {/* INGREDIENTES DO K-BEAUTY */}
        <section className="w-full max-w-[1200px] mx-auto px-6 py-16">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-[26px] font-serif text-white mb-2 font-light">{t('Ingredientes do K-Beauty')}</h2>
            <p className="text-white/60 text-[12px]">{t('Conheça alguns dos ingredientes mais utilizados na cosmética coreana.')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { img: 'https://images.unsplash.com/photo-1620023023023-e18ec34237c1?q=80&w=200&auto=format&fit=crop', name: 'Centella Asiática', desc: 'Tradicional ingrediente vegetal presente em diversos cosméticos.' },
              { img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=200&auto=format&fit=crop', name: 'Ácido Hialurônico', desc: 'Ingrediente amplamente utilizado em produtos hidratantes.' },
              { img: 'https://images.unsplash.com/photo-1608248593842-83b632008f51?q=80&w=200&auto=format&fit=crop', name: 'Niacinamida', desc: 'Encontrada em diferentes fórmulas para cuidados diários da pele.' },
              { img: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?q=80&w=200&auto=format&fit=crop', name: 'Chá Verde', desc: 'Ingrediente de origem vegetal muito utilizado na cosmética asiática.' },
              { img: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=200&auto=format&fit=crop', name: 'Extrato de Arroz', desc: 'Conhecido por seu uso tradicional nos cuidados com a pele.' },
              { img: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=200&auto=format&fit=crop', name: 'Ceramidas', desc: 'Presentes em produtos voltados à hidratação e proteção da pele.' },
              { img: 'https://images.unsplash.com/photo-1583516035272-35fa4ff8d80c?q=80&w=200&auto=format&fit=crop', name: 'Mucina de Caracol', desc: 'Ingrediente bastante popular no skincare coreano.' },
              { img: 'https://images.unsplash.com/photo-1587049352847-81a56d773c15?q=80&w=200&auto=format&fit=crop', name: 'Própolis', desc: 'Ingrediente utilizado em diversas formulações.' },
            ].map((ing, idx) => (
              <div key={idx} className="bg-[#0A1021] border border-[#1A233A] rounded-sm overflow-hidden flex flex-col group p-2">
                <div className="h-[90px] w-full relative mb-3 rounded-sm overflow-hidden">
                  <Image src={ing.img} alt={ing.name} fill className="object-cover" />
                </div>
                <h4 className="text-white text-[11px] font-bold mb-1 leading-tight">{t(ing.name)}</h4>
                <p className="text-white/50 text-[8px] mb-3 flex-1 leading-[1.4]">{t(ing.desc)}</p>
                <Link href={`/tienda?search=${encodeURIComponent(ing.name.split(" ")[0])}`} className="text-[7.5px] font-bold tracking-widest text-[#C9C9C9] uppercase flex items-center gap-1 transition-colors">
                  {t('VER PRODUTOS')} <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <div className="w-full h-[1px] bg-[#1A233A] max-w-[1200px] mx-auto opacity-50"></div>

        {/* COMO MONTAR SUA ROTINA */}
        <section className="w-full max-w-[1200px] mx-auto px-6 py-16">
          <h2 className="text-[26px] font-serif text-white mb-12 font-light">{t('Como montar sua rotina?')}</h2>
          
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            {/* Timeline */}
            <div className="flex-1 w-full flex items-start justify-between relative mt-2 px-2">
              {[
                { num: '1', title: 'Limpeza', icon: Droplet },
                { num: '2', title: 'Tônico', icon: Droplet },
                { num: '3', title: 'Essência', icon: Sparkles, sub: '(Opcional)' },
                { num: '4', title: 'Sérum', icon: Droplet },
                { num: '5', title: 'Hidratante', icon: LayoutGrid },
                { num: '6', title: 'Protetor Solar', icon: Sun, sub: '(Durante o dia)' },
              ].map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center relative z-10 w-16">
                    <div className="mb-4">
                      <OutlineCircle>{step.num}</OutlineCircle>
                    </div>
                    <step.icon className="w-6 h-6 text-[#C9C9C9] mb-3" strokeWidth={1} />
                    <span className="text-white text-[10px] text-center font-medium leading-tight">{t(step.title)}</span>
                    {step.sub && <span className="text-white/40 text-[8px] text-center mt-0.5">{t(step.sub)}</span>}
                  </div>
                  {idx < 5 && (
                    <div className="hidden md:flex flex-1 items-center justify-center mt-2.5 -mx-4 z-0">
                       <ArrowRight className="w-3.5 h-3.5 text-[#C9C9C9]/50" strokeWidth={1.5} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Info Box */}
            <div className="w-full lg:w-[320px] bg-transparent border border-[#1A233A] rounded-sm p-6 relative min-h-[140px] flex flex-col justify-center">
               <h3 className="text-white font-serif text-[15px] mb-3">{t('Sua rotina pode ser única.')}</h3>
               <p className="text-white/60 text-[9.5px] leading-[1.6] max-w-[200px]">
                 {t('Nem todas as pessoas utilizam todas as etapas. A ordem acima representa uma sequência comum no skincare coreano, mas cada rotina pode variar conforme as preferências e os produtos escolhidos.')}
               </p>
               <div className="absolute right-4 bottom-4">
                 <FlowerOutline />
               </div>
            </div>
          </div>
        </section>

        <div className="w-full h-[1px] bg-[#1A233A] max-w-[1200px] mx-auto opacity-50"></div>

        {/* DICAS PARA APROVEITAR MELHOR */}
        <section className="w-full max-w-[1200px] mx-auto px-6 py-16">
          <h2 className="text-[26px] font-serif text-white mb-8 font-light">{t('Dicas para aproveitar melhor seus produtos')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                title: 'Rotina da manhã', 
                desc: 'Conheça uma sequência simples para iniciar o dia e proteger sua pele.', 
                img: 'https://images.unsplash.com/photo-1556228578-8d89cb7acb5c?q=80&w=200&auto=format&fit=crop',
                icon: Sun,
              },
              { 
                title: 'Rotina da noite', 
                desc: 'Veja como organizar seus cuidados antes de dormir para uma pele saudável.', 
                img: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=200&auto=format&fit=crop',
                icon: Moon,
              },
              { 
                title: 'Antes da maquiagem', 
                desc: 'Alguns cuidados ajudam a preparar melhor a pele antes da maquiagem.', 
                img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=200&auto=format&fit=crop',
                icon: Sparkles,
              },
              { 
                title: 'Removendo a maquiagem', 
                desc: 'Uma limpeza adequada ajuda a remover resíduos e manter a pele equilibrada.', 
                img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200&auto=format&fit=crop',
                icon: Droplet,
              },
            ].map((tip, idx) => (
              <div key={idx} className="bg-transparent border border-[#1A233A] rounded-sm flex h-32 group">
                <div className="w-[100px] sm:w-[120px] relative h-full shrink-0">
                  <Image src={tip.img} alt={tip.title} fill className="object-cover" />
                </div>
                <div className="flex-1 p-5 flex flex-col justify-center relative">
                  <tip.icon className="absolute top-5 left-[-10px] w-5 h-5 text-[#C9C9C9] bg-[#040914] rounded-full p-0.5" strokeWidth={1} />
                  <div className="pl-3">
                    <h4 className="text-white font-serif text-[14px] mb-2 font-medium">{t(tip.title)}</h4>
                    <p className="text-white/60 text-[9.5px] leading-relaxed mb-3">{t(tip.desc)}</p>
                    <Link href="/tienda?search=Rutina" className="text-[8px] tracking-widest font-bold text-white/50 hover:text-white uppercase flex items-center gap-1.5 transition-colors w-fit">
                      {t('SAIBA MAIS')} <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="w-full h-[1px] bg-[#1A233A] max-w-[1200px] mx-auto opacity-50"></div>

        {/* UNIVERSO DA MAQUIAGEM & CATEGORIAS */}
        <section className="w-full max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
          
          {/* Universo da Maquiagem */}
          <div className="border border-[#1A233A] bg-transparent p-8 rounded-sm">
            <h2 className="text-[20px] font-serif text-white mb-2 font-light">{t('Universo da Maquiagem Coreana')}</h2>
            <p className="text-white/50 text-[11px] mb-8">{t('Explore as categorias mais populares e realce sua beleza.')}</p>
            
            <div className="flex justify-between items-start gap-2">
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
                <Link key={idx} href={`/tienda?search=${encodeURIComponent(item.name)}`} className="flex flex-col items-center gap-2 group cursor-pointer w-[50px]">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-[1.5px] border-white/20 group-hover:border-[#C9C9C9] transition-colors relative">
                    <Image src={item.img} alt={item.name} fill className="object-cover" />
                  </div>
                  <span className="text-[7px] text-white/70 text-center leading-[1.2] group-hover:text-white">{t(item.name)}</span>
                </Link>
              ))}
            </div>

            <Link href="/tienda?category=maquiagem" className="text-[8px] font-bold text-[#C9C9C9] tracking-widest uppercase flex items-center gap-2 mt-8 w-fit">
              {t('VER TODAS AS CATEGORIAS DE MAQUIAGEM')} <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          {/* Explore Categorias */}
          <div className="border border-[#1A233A] bg-transparent p-8 rounded-sm">
            <h2 className="text-[20px] font-serif text-white mb-8 font-light">{t('Explore nossas categorias')}</h2>
            
            <div className="grid grid-cols-4 gap-y-8 gap-x-2">
              {[
                { icon: Droplet, name: 'Skincare' },
                { icon: Sparkle, name: 'Maquiagem' },
                { icon: Sun, name: 'Proteção Solar' },
                { icon: Sparkles, name: 'Máscaras Faciais' },
                { icon: ShieldCheck, name: 'Cuidados Labiais' },
                { icon: LayoutGrid, name: 'Kits' },
                { icon: Target, name: 'Novidades' },
                { icon: Target, name: 'Mais Vendidos' }, // Assuming Mais Vendidos is similar icon
              ].map((cat, idx) => (
                <Link key={idx} href={`/tienda?search=${encodeURIComponent(cat.name)}`} className="flex flex-col items-center gap-3 group">
                   <div className="w-8 h-8 flex items-center justify-center">
                     <cat.icon className="w-6 h-6 text-[#C9C9C9]" strokeWidth={1} />
                   </div>
                   <span className="text-[8px] text-white/60 text-center group-hover:text-white transition-colors">{t(cat.name)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="w-full h-[1px] bg-[#1A233A] max-w-[1200px] mx-auto opacity-50"></div>

        {/* PERGUNTAS FREQUENTES */}
        <section className="w-full max-w-[1200px] mx-auto px-6 py-16">
          <h2 className="text-[26px] font-serif text-white mb-8 font-light">{t('Perguntas frequentes')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { q: 'O skincare coreano possui uma quantidade obrigatória de etapas?', a: 'Não, as rotinas podem ser adaptadas às necessidades da sua pele. As famosas "10 etapas" são apenas um guia.' },
              { q: 'Posso utilizar apenas alguns produtos?', a: 'Sim! Você pode começar com os passos básicos: limpeza, hidratação e proteção solar.' },
              { q: 'Como escolher um produto?', a: 'Sempre considere seu tipo de pele e as preocupações que deseja tratar, como acne, manchas ou ressecamento.' },
              { q: 'A Yedam faz diagnóstico de pele?', a: 'Sim, entre em contato com nosso suporte e uma de nossas consultoras ajudará você a montar a rotina perfeita.' },
            ].map((faq, idx) => (
              <div key={idx} className="border border-[#1A233A] bg-transparent rounded-sm flex flex-col h-full">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 flex items-start justify-between text-left gap-4 h-full min-h-[90px]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full border border-[#C9C9C9] text-[#C9C9C9] flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle className="w-3 h-3" strokeWidth={1.5} />
                    </div>
                    <span className="text-[11px] text-white/90 leading-[1.4] font-medium pr-2">{t(faq.q)}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/40 shrink-0 transition-transform mt-0.5 ${openFaq === idx ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-[10px] text-white/50 leading-[1.6]">
                    {t(faq.a)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="w-full max-w-[1200px] mx-auto px-6 py-16 mb-8">
           <div className="border border-[#1A233A] bg-[#070D1C] rounded-sm flex flex-col md:flex-row items-center overflow-hidden relative min-h-[300px]">
              
              <div className="w-full md:w-1/2 p-10 lg:px-16 flex flex-col justify-center relative z-20">
                 <h2 className="text-[26px] font-serif text-white mb-3 max-w-[280px] leading-[1.2]">{t('Receba novidades sobre o universo do K-Beauty')}</h2>
                 <p className="text-white/60 text-[10.5px] mb-8 max-w-[260px] leading-relaxed">{t('Lançamentos, tendências, dicas de beleza e promoções exclusivas diretamente no seu e-mail.')}</p>
                 
                 <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3 w-full max-w-[320px]">
                   <div className="flex w-full gap-2">
                     <input 
                       type="email" 
                       placeholder={t('Seu melhor e-mail')} 
                       className="w-[60%] bg-[#040914] border border-[#1A233A] text-white placeholder-white/30 px-4 py-3 rounded-sm text-[10px] focus:outline-none focus:border-[#C9C9C9]"
                       value={newsletterEmail}
                       onChange={(e) => setNewsletterEmail(e.target.value)}
                       required
                     />
                     <button 
                       type="submit"
                       className="w-[40%] bg-[#C9C9C9] hover:bg-[#E5E5E5] text-[#040914] font-bold text-[9px] tracking-widest px-2 py-3 rounded-sm uppercase transition-colors"
                     >
                       {newsletterSubscribed ? t('CADASTRADO!') : t('QUERO RECEBER NOVIDADES')}
                     </button>
                   </div>
                   <p className="text-[8px] text-white/30">{t('Prometemos não enviar spam. Só compartilhamos o melhor do K-Beauty.')}</p>
                 </form>
              </div>

              {/* Envelope Decorative */}
              <Mail className="absolute right-12 top-10 w-24 h-24 text-white/[0.03] pointer-events-none hidden lg:block z-10" strokeWidth={0.5} />

              <div className="absolute bottom-0 right-[5%] w-[40%] h-[90%] z-20 hidden md:block">
                 <Image 
                   src="https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=400&auto=format&fit=crop"
                   alt="Newsletter Model"
                   fill
                   className="object-contain object-bottom"
                 />
              </div>
           </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
