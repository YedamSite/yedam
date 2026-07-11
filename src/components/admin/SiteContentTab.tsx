'use client';

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ImageUp, Type, Heading, List, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';

export default function SiteContentTab() {
  const [content, setContent] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = db.get('site_content');
    setContent(JSON.parse(JSON.stringify(c)));
  }, []);

  const handleChange = (section: string, field: string, value: any) => {
    setContent((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const parts = field.split('.');
      let obj = updated.home[section];
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return updated;
    });
  };

  const handleArrayItemChange = (section: string, arrayField: string, index: number, field: string, value: any) => {
    setContent((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const arr = updated.home[section][arrayField];
      if (arr && arr[index]) {
        const parts = field.split('.');
        let obj = arr[index];
        for (let i = 0; i < parts.length - 1; i++) {
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = value;
      }
      return updated;
    });
  };

  const addArrayItem = (section: string, arrayField: string, template: any) => {
    setContent((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated.home[section][arrayField]) {
        updated.home[section][arrayField] = [];
      }
      updated.home[section][arrayField].push({ ...template });
      return updated;
    });
  };

  const removeArrayItem = (section: string, arrayField: string, index: number) => {
    setContent((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.home[section][arrayField].splice(index, 1);
      return updated;
    });
  };

  const handleSave = () => {
    db.save('site_content', content);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const renderInput = (label: string, value: string, onChange: (v: string) => void, options?: { type?: string; placeholder?: string; rows?: number }) => {
    const baseClass = "flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white placeholder-gray-500";
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase text-accent">{label}</label>
        {options?.rows && options.rows > 1 ? (
          <textarea
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={options?.placeholder}
            rows={options.rows}
            className={`${baseClass} min-h-[60px] pt-2`}
          />
        ) : (
          <Input
            type={options?.type || 'text'}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={options?.placeholder}
          />
        )}
      </div>
    );
  };

  if (!content) return <div className="text-xs text-muted-foreground">Carregando...</div>;

  const sections = [
    { id: 'hero', label: 'Hero / Banner Principal' },
    { id: 'highlights', label: 'Barra de Destaques' },
    { id: 'categories', label: 'Seção Categorias' },
    { id: 'bestSellers', label: 'Seção Mais Vendidos' },
    { id: 'experiencias', label: 'Experiencias Yedam' },
    { id: 'routines', label: 'Seção Rutinas' },
    { id: 'instagram', label: 'Seção Instagram' },
    { id: 'newsletter', label: 'Newsletter' },
    { id: 'header', label: 'Header / Topo' },
    { id: 'footer', label: 'Footer / Rodapé' },
  ];

  const c = content.home;
  const h = content;

  return (
    <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
        <h2 className="font-heading text-2xl font-light text-white uppercase tracking-wide">Conteúdo do Site</h2>
        <Button onClick={handleSave} className="bg-accent hover:bg-accentHover text-background font-bold text-xs px-6 py-2 rounded-xl flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saved ? '✓ SALVO!' : 'SALVAR TUDO'}
        </Button>
      </div>

      {saved && (
        <div className="bg-green-50/10 border border-green-50/20 text-green-400 text-xs rounded-xl p-3.5 mb-6">
          ✓ Todo o conteúdo foi salvo com sucesso!
        </div>
      )}

      <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto pb-2">
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap px-3 py-2 border-b-2 transition-all ${
              activeSection === sec.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      <div className="space-y-6 text-xs text-muted-foreground max-w-4xl">

        {/* HERO */}
        {activeSection === 'hero' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Hero / Banner Principal</h3>
            {renderInput('Linha 1 do Título', c.hero?.titleLine1, v => handleChange('hero', 'titleLine1', v))}
            {renderInput('Linha 2 do Título (itálico)', c.hero?.titleLine2, v => handleChange('hero', 'titleLine2', v))}
            {renderInput('Linha 3 do Título', c.hero?.titleLine3, v => handleChange('hero', 'titleLine3', v))}
            {renderInput('Subtítulo', c.hero?.subtitle, v => handleChange('hero', 'subtitle', v), { rows: 3, placeholder: 'Descrição abaixo do título...' })}
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Texto Botão Comprar', c.hero?.btnBuyText, v => handleChange('hero', 'btnBuyText', v))}
              {renderInput('Link Botão Comprar', c.hero?.btnBuyLink, v => handleChange('hero', 'btnBuyLink', v))}
              {renderInput('Texto Botão Rutinas', c.hero?.btnRoutineText, v => handleChange('hero', 'btnRoutineText', v))}
              {renderInput('Link Botão Rutinas', c.hero?.btnRoutineLink, v => handleChange('hero', 'btnRoutineLink', v))}
            </div>
            {renderInput('URL da Imagem de Fundo', c.hero?.bgImage, v => handleChange('hero', 'bgImage', v), { placeholder: 'URL ou caminho da imagem...' })}
            <div className="relative h-32 rounded-xl overflow-hidden border border-white/10 bg-secondary">
              {c.hero?.bgImage && <img src={c.hero.bgImage} alt="Preview" className="w-full h-full object-cover" />}
            </div>
          </div>
        )}

        {/* HIGHLIGHTS */}
        {activeSection === 'highlights' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Barra de Destaques</h3>
              <Button onClick={() => addArrayItem('highlights', 'items', { icon: 'ShieldCheck', title: 'NOVO', text: 'Descrição' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="h-3 w-3" /> ADICIONAR
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Ícones disponíveis: ShieldCheck, Truck, ShieldAlert, Heart, Droplet, Sparkles, Smile, Hourglass, ClipboardList, Star, Compass</p>
            {(c.highlights?.items || []).map((item: any, idx: number) => (
              <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-accent uppercase">Item #{idx + 1}</span>
                  <button onClick={() => removeArrayItem('highlights', 'items', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {renderInput('Ícone', item.icon, v => handleArrayItemChange('highlights', 'items', idx, 'icon', v))}
                  {renderInput('Título', item.title, v => handleArrayItemChange('highlights', 'items', idx, 'title', v))}
                  {renderInput('Texto', item.text, v => handleArrayItemChange('highlights', 'items', idx, 'text', v))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CATEGORIES SECTION TEXT */}
        {activeSection === 'categories' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Seção de Categorias</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Pré-título', c.categories?.preTitle, v => handleChange('categories', 'preTitle', v))}
              {renderInput('Título', c.categories?.title, v => handleChange('categories', 'title', v))}
              {renderInput('Subtítulo', c.categories?.subtitle, v => handleChange('categories', 'subtitle', v))}
              {renderInput('Texto do Botão', c.categories?.buttonText, v => handleChange('categories', 'buttonText', v))}
            </div>
            <p className="text-[10px] text-muted-foreground border-t border-white/5 pt-3">As categorias em si são gerenciadas na aba "Categorias".</p>
          </div>
        )}

        {/* BEST SELLERS */}
        {activeSection === 'bestSellers' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Seção Mais Vendidos</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Pré-título', c.bestSellers?.preTitle, v => handleChange('bestSellers', 'preTitle', v))}
              {renderInput('Título', c.bestSellers?.title, v => handleChange('bestSellers', 'title', v))}
              {renderInput('Subtítulo', c.bestSellers?.subtitle, v => handleChange('bestSellers', 'subtitle', v), { rows: 2 })}
              {renderInput('Texto do Botão', c.bestSellers?.buttonText, v => handleChange('bestSellers', 'buttonText', v))}
            </div>
          </div>
        )}

        {/* EXPERIENCIAS */}
        {activeSection === 'experiencias' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Experiencias Yedam</h3>
              <Button onClick={() => addArrayItem('experiencias', 'cards', { badge: 'NOVA', badgeColor: 'accent', title: 'Nova Experiência', text: 'Descrição', buttonText: 'SABER MÁS', image: '' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="h-3 w-3" /> ADICIONAR CARD
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Pré-título da Seção', c.experiencias?.preTitle, v => handleChange('experiencias', 'preTitle', v))}
              {renderInput('Título da Seção', c.experiencias?.title, v => handleChange('experiencias', 'title', v))}
            </div>
            <div className="border-t border-white/5 pt-4 space-y-6">
              {(c.experiencias?.cards || []).map((card: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Card #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('experiencias', 'cards', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {renderInput('Badge', card.badge, v => handleArrayItemChange('experiencias', 'cards', idx, 'badge', v))}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Cor do Badge</label>
                      <select value={card.badgeColor} onChange={e => handleArrayItemChange('experiencias', 'cards', idx, 'badgeColor', e.target.value)} className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white">
                        <option value="accent">Dourado (accent)</option>
                        <option value="blue">Azul</option>
                      </select>
                    </div>
                    {renderInput('Título', card.title, v => handleArrayItemChange('experiencias', 'cards', idx, 'title', v))}
                    {renderInput('Texto do Botão', card.buttonText, v => handleArrayItemChange('experiencias', 'cards', idx, 'buttonText', v))}
                  </div>
                  {renderInput('Texto', card.text, v => handleArrayItemChange('experiencias', 'cards', idx, 'text', v), { rows: 2 })}
                  {renderInput('URL da Imagem', card.image, v => handleArrayItemChange('experiencias', 'cards', idx, 'image', v))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROUTINES */}
        {activeSection === 'routines' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Seção Rutinas</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Pré-título', c.routines?.preTitle, v => handleChange('routines', 'preTitle', v))}
              {renderInput('Título', c.routines?.title, v => handleChange('routines', 'title', v))}
              {renderInput('Subtítulo', c.routines?.subtitle, v => handleChange('routines', 'subtitle', v))}
              {renderInput('Texto do Botão', c.routines?.buttonText, v => handleChange('routines', 'buttonText', v))}
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-bold text-accent uppercase">Itens de Rutina</h4>
                <Button onClick={() => addArrayItem('routines', 'items', { name: 'Nova Rutina', icon: 'Sparkles' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(c.routines?.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="border border-white/5 rounded-lg p-3 bg-secondary/30 flex gap-2 items-center">
                    <div className="flex-1 space-y-1">
                      <input value={item.name} onChange={e => handleArrayItemChange('routines', 'items', idx, 'name', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" placeholder="Nome" />
                      <input value={item.icon} onChange={e => handleArrayItemChange('routines', 'items', idx, 'icon', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" placeholder="Ícone" />
                    </div>
                    <button onClick={() => removeArrayItem('routines', 'items', idx)} className="text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-bold text-accent uppercase">Badges Inferiores</h4>
                <Button onClick={() => addArrayItem('routines', 'badges', { icon: 'ShieldCheck', title: 'NOVO BADGE' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(c.routines?.badges || []).map((badge: any, idx: number) => (
                  <div key={idx} className="border border-white/5 rounded-lg p-3 bg-secondary/30 flex gap-2 items-center">
                    <div className="flex-1 space-y-1">
                      <input value={badge.title} onChange={e => handleArrayItemChange('routines', 'badges', idx, 'title', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" placeholder="Título" />
                      <input value={badge.icon} onChange={e => handleArrayItemChange('routines', 'badges', idx, 'icon', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" placeholder="Ícone" />
                    </div>
                    <button onClick={() => removeArrayItem('routines', 'badges', idx)} className="text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INSTAGRAM */}
        {activeSection === 'instagram' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Seção Instagram</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Título', c.instagram?.title, v => handleChange('instagram', 'title', v))}
              {renderInput('Subtítulo', c.instagram?.subtitle, v => handleChange('instagram', 'subtitle', v))}
              {renderInput('Texto do Botão', c.instagram?.buttonText, v => handleChange('instagram', 'buttonText', v))}
              {renderInput('Link do Botão', c.instagram?.buttonLink, v => handleChange('instagram', 'buttonLink', v))}
            </div>
            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-bold text-accent uppercase">URLs das Imagens</h4>
                <Button onClick={() => addArrayItem('instagram', 'images', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400')} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(c.instagram?.images || []).map((url: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input value={url} onChange={e => handleArrayItemChange('instagram', 'images', idx, '', e.target.value)} className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-[11px] text-white" placeholder="URL da imagem..." />
                    <button onClick={() => removeArrayItem('instagram', 'images', idx)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NEWSLETTER */}
        {activeSection === 'newsletter' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Newsletter</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Pré-título', c.newsletter?.preTitle, v => handleChange('newsletter', 'preTitle', v))}
              {renderInput('Título', c.newsletter?.title, v => handleChange('newsletter', 'title', v))}
              {renderInput('Texto do Botão', c.newsletter?.buttonText, v => handleChange('newsletter', 'buttonText', v))}
              {renderInput('Mensagem de Sucesso', c.newsletter?.successMessage, v => handleChange('newsletter', 'successMessage', v))}
            </div>
          </div>
        )}

        {/* HEADER */}
        {activeSection === 'header' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Header / Topo do Site</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Texto do Anúncio (barra superior)', h.header?.announcementText, v => { setContent((prev: any) => { const u = JSON.parse(JSON.stringify(prev)); u.header.announcementText = v; return u; }); })}
              {renderInput('Texto "Envíos"', h.header?.shippingText, v => { setContent((prev: any) => { const u = JSON.parse(JSON.stringify(prev)); u.header.shippingText = v; return u; }); })}
              {renderInput('Texto "Atención"', h.header?.attentionText, v => { setContent((prev: any) => { const u = JSON.parse(JSON.stringify(prev)); u.header.attentionText = v; return u; }); })}
              {renderInput('URL do Logo', h.header?.logoUrl, v => { setContent((prev: any) => { const u = JSON.parse(JSON.stringify(prev)); u.header.logoUrl = v; return u; }); })}
            </div>
          </div>
        )}

        {/* FOOTER */}
        {activeSection === 'footer' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Footer / Rodapé</h3>
            {renderInput('Descrição da Marca', h.footer?.description, v => { setContent((prev: any) => { const u = JSON.parse(JSON.stringify(prev)); u.footer.description = v; return u; }); }, { rows: 3 })}
            <div className="grid grid-cols-2 gap-4">
              {renderInput('URL Instagram', h.footer?.social?.instagram, v => { setContent((prev: any) => { const u = JSON.parse(JSON.stringify(prev)); u.footer.social.instagram = v; return u; }); })}
              {renderInput('URL YouTube', h.footer?.social?.youtube, v => { setContent((prev: any) => { const u = JSON.parse(JSON.stringify(prev)); u.footer.social.youtube = v; return u; }); })}
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[10px] font-bold text-accent uppercase mb-2">Colunas do Footer</h4>
              <p className="text-[10px] text-muted-foreground">As colunas, links e ícones do footer são editáveis através do código fonte em src/components/Footer.tsx para maior flexibilidade.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <Button onClick={handleSave} className="bg-accent hover:bg-accentHover text-background font-bold py-3 px-8 rounded-xl flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saved ? '✓ SALVO!' : 'SALVAR TODAS AS ALTERAÇÕES'}
        </Button>
      </div>
    </div>
  );
}
