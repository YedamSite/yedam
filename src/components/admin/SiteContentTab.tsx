'use client';

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ShieldCheck, Truck, ShieldAlert, Heart, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import ImageUpload from '@/components/ImageUpload';

export default function SiteContentTab() {
  const [content, setContent] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [activeLang, setActiveLang] = useState<'es' | 'pt' | 'en'>('es');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = db.get('site_content');
    setContent(JSON.parse(JSON.stringify(c)));
  }, []);

  // Normal/Nested Fields Handlers
  const handleChange = (section: string, field: string, value: any) => {
    setContent((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const parts = field.split('.');
      
      let root = updated;
      if (activeLang !== 'es') {
        if (!updated.translations) updated.translations = {};
        if (!updated.translations[activeLang]) updated.translations[activeLang] = {};
        root = updated.translations[activeLang];
      }

      const isGlobalSec = section === 'header' || section === 'footer';
      if (isGlobalSec) {
        if (!root[section]) root[section] = {};
        let obj = root[section];
        for (let i = 0; i < parts.length - 1; i++) {
          if (!obj[parts[i]]) obj[parts[i]] = {};
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = value;
      } else {
        if (!root.home) root.home = {};
        if (!root.home[section]) root.home[section] = {};
        let obj = root.home[section];
        for (let i = 0; i < parts.length - 1; i++) {
          if (!obj[parts[i]]) obj[parts[i]] = {};
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = value;
      }

      return updated;
    });
  };

  // Array Fields Handlers
  const handleArrayItemChange = (section: string, arrayField: string, index: number, field: string, value: any) => {
    setContent((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      
      let root = updated;
      if (activeLang !== 'es') {
        if (!updated.translations) updated.translations = {};
        if (!updated.translations[activeLang]) updated.translations[activeLang] = {};
        root = updated.translations[activeLang];
      }

      if (!root.home) root.home = {};
      if (!root.home[section]) root.home[section] = {};
      if (!root.home[section][arrayField]) {
        const baseArr = updated.home?.[section]?.[arrayField] || [];
        root.home[section][arrayField] = JSON.parse(JSON.stringify(baseArr));
      }

      const arr = root.home[section][arrayField];
      if (arr) {
        // Ensure index exists
        while (arr.length <= index) {
          arr.push({});
        }

        if (field === '') {
          // Direct value assignment (e.g. for string array like instagram images)
          arr[index] = value;
        } else {
          const parts = field.split('.');
          let obj = arr[index];
          if (typeof obj !== 'object' || obj === null) {
            arr[index] = {};
            obj = arr[index];
          }
          for (let i = 0; i < parts.length - 1; i++) {
            if (!obj[parts[i]]) obj[parts[i]] = {};
            obj = obj[parts[i]];
          }
          obj[parts[parts.length - 1]] = value;
        }
      }
      return updated;
    });
  };

  const addArrayItem = (section: string, arrayField: string, template: any) => {
    // Adding array item always modifies the base structure (ES) first to maintain length consistency
    setContent((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated.home) updated.home = {};
      if (!updated.home[section]) updated.home[section] = {};
      if (!updated.home[section][arrayField]) {
        updated.home[section][arrayField] = [];
      }
      updated.home[section][arrayField].push(JSON.parse(JSON.stringify(template)));
      return updated;
    });
  };

  const removeArrayItem = (section: string, arrayField: string, index: number) => {
    // Removing array item modifies base structure and deletes index from all translations
    setContent((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated.home?.[section]?.[arrayField]) {
        updated.home[section][arrayField].splice(index, 1);
      }
      // Remove from translations as well
      if (updated.translations) {
        Object.keys(updated.translations).forEach(lang => {
          if (updated.translations[lang]?.home?.[section]?.[arrayField]) {
            updated.translations[lang].home[section][arrayField].splice(index, 1);
          }
        });
      }
      return updated;
    });
  };

  const handleSave = () => {
    db.save('site_content', content);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Translation Reading Helpers
  const getValue = (section: string, field: string): string => {
    const parts = field.split('.');
    let root = content;
    if (activeLang !== 'es') {
      root = content.translations?.[activeLang];
    }
    if (!root) return '';
    const isGlobalSec = section === 'header' || section === 'footer';
    let obj = isGlobalSec ? root[section] : root.home?.[section];
    if (!obj) return '';
    let current = obj;
    for (let i = 0; i < parts.length; i++) {
      current = current[parts[i]];
      if (current === undefined || current === null) return '';
    }
    return current;
  };

  const getBaseValue = (section: string, field: string): string => {
    const parts = field.split('.');
    const isGlobalSec = section === 'header' || section === 'footer';
    let obj = isGlobalSec ? content[section] : content.home?.[section];
    if (!obj) return '';
    let current = obj;
    for (let i = 0; i < parts.length; i++) {
      current = current[parts[i]];
      if (current === undefined || current === null) return '';
    }
    return current;
  };

  const getArrayValue = (section: string, arrayField: string, index: number, field: string): string => {
    let root = content;
    if (activeLang !== 'es') {
      root = content.translations?.[activeLang];
    }
    if (!root || !root.home || !root.home[section] || !root.home[section][arrayField] || !root.home[section][arrayField][index]) {
      return '';
    }
    const item = root.home[section][arrayField][index];
    if (field === '') {
      return typeof item === 'string' ? item : '';
    }
    const parts = field.split('.');
    let current = item;
    for (let i = 0; i < parts.length; i++) {
      if (!current) return '';
      current = current[parts[i]];
      if (current === undefined || current === null) return '';
    }
    return current;
  };

  const getBaseArrayValue = (section: string, arrayField: string, index: number, field: string): string => {
    if (!content.home || !content.home[section] || !content.home[section][arrayField] || !content.home[section][arrayField][index]) {
      return '';
    }
    const item = content.home[section][arrayField][index];
    if (field === '') {
      return typeof item === 'string' ? item : '';
    }
    const parts = field.split('.');
    let current = item;
    for (let i = 0; i < parts.length; i++) {
      if (!current) return '';
      current = current[parts[i]];
      if (current === undefined || current === null) return '';
    }
    return current;
  };

  // Render Functions
  const renderInput = (
    label: string, 
    section: string, 
    field: string, 
    options?: { type?: string; placeholder?: string; rows?: number }
  ) => {
    const value = getValue(section, field);
    const baseVal = getBaseValue(section, field);
    const placeholder = options?.placeholder || (activeLang !== 'es' && baseVal ? `[ES]: ${baseVal}` : '');
    const baseClass = "flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white placeholder-gray-500";
    
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase text-accent">
          {label} {activeLang !== 'es' && <span className="opacity-50 font-normal">({activeLang.toUpperCase()})</span>}
        </label>
        {options?.rows && options.rows > 1 ? (
          <textarea
            value={value || ''}
            onChange={e => handleChange(section, field, e.target.value)}
            placeholder={placeholder}
            rows={options.rows}
            className={`${baseClass} min-h-[60px] pt-2`}
          />
        ) : (
          <Input
            type={options?.type || 'text'}
            value={value || ''}
            onChange={e => handleChange(section, field, e.target.value)}
            placeholder={placeholder}
          />
        )}
      </div>
    );
  };

  const renderArrayInput = (
    label: string, 
    section: string, 
    arrayField: string, 
    index: number, 
    field: string, 
    options?: { type?: string; placeholder?: string; rows?: number }
  ) => {
    const value = getArrayValue(section, arrayField, index, field);
    const baseVal = getBaseArrayValue(section, arrayField, index, field);
    const placeholder = options?.placeholder || (activeLang !== 'es' && baseVal ? `[ES]: ${baseVal}` : '');
    const baseClass = "flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white placeholder-gray-500";
    
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase text-accent">
          {label} {activeLang !== 'es' && <span className="opacity-50 font-normal">({activeLang.toUpperCase()})</span>}
        </label>
        {options?.rows && options.rows > 1 ? (
          <textarea
            value={value || ''}
            onChange={e => handleArrayItemChange(section, arrayField, index, field, e.target.value)}
            placeholder={placeholder}
            rows={options.rows}
            className={`${baseClass} min-h-[60px] pt-2`}
          />
        ) : (
          <Input
            type={options?.type || 'text'}
            value={value || ''}
            onChange={e => handleArrayItemChange(section, arrayField, index, field, e.target.value)}
            placeholder={placeholder}
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
    { id: 'experiencias', label: 'Experiencias Cheotnun' },
    { id: 'routines', label: 'Seção Rutinas' },
    { id: 'instagram', label: 'Seção Instagram' },
    { id: 'newsletter', label: 'Newsletter' },
    { id: 'header', label: 'Header / Topo' },
    { id: 'footer', label: 'Footer / Rodapé' },
  ];

  // Base lengths for loop consistency in translation tab
  const highlightsItems = content.home?.highlights?.items || [];
  const experiencesCards = content.home?.experiencias?.cards || [];
  const routinesItems = content.home?.routines?.items || [];
  const routinesBadges = content.home?.routines?.badges || [];
  const instagramImages = content.home?.instagram?.images || [];

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

      {/* Language Selector */}
      <div className="flex items-center gap-2 mb-6 bg-[#030712] border border-white/5 p-1.5 rounded-xl w-fit">
        {(['es', 'pt', 'en'] as const).map(lang => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveLang(lang)}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeLang === lang 
                ? 'bg-accent text-background' 
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            {lang === 'es' ? 'Español (ES)' : lang === 'pt' ? 'Português (PT)' : 'English (EN)'}
          </button>
        ))}
      </div>

      {/* Section selector */}
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
            {renderInput('Linha 1 do Título', 'hero', 'titleLine1')}
            {renderInput('Linha 2 do Título (itálico)', 'hero', 'titleLine2')}
            {renderInput('Linha 3 do Título', 'hero', 'titleLine3')}
            {renderInput('Subtítulo', 'hero', 'subtitle', { rows: 3, placeholder: 'Descrição abaixo do título...' })}
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Texto Botão Comprar', 'hero', 'btnBuyText')}
              {renderInput('Link Botão Comprar', 'hero', 'btnBuyLink')}
              {renderInput('Texto Botão Rutinas', 'hero', 'btnRoutineText')}
              {renderInput('Link Botão Rutinas', 'hero', 'btnRoutineLink')}
            </div>
            {activeLang === 'es' && (
              <ImageUpload
                currentUrl={getBaseValue('hero', 'bgImage')}
                onUrlChange={v => handleChange('hero', 'bgImage', v)}
                folder="hero"
                label="Imagem de Fundo do Hero"
              />
            )}
          </div>
        )}

        {/* HIGHLIGHTS */}
        {activeSection === 'highlights' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Barra de Destaques</h3>
              {activeLang === 'es' && (
                <Button onClick={() => addArrayItem('highlights', 'items', { icon: 'ShieldCheck', title: 'NOVO', text: 'Descrição' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">Ícones disponíveis: ShieldCheck, Truck, ShieldAlert, Heart, Droplet, Sparkles, Smile, Hourglass, ClipboardList, Star, Compass</p>
            {highlightsItems.map((item: any, idx: number) => (
              <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-accent uppercase">Item #{idx + 1}</span>
                  {activeLang === 'es' && (
                    <button onClick={() => removeArrayItem('highlights', 'items', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {renderArrayInput('Ícone', 'highlights', 'items', idx, 'icon')}
                  {renderArrayInput('Título', 'highlights', 'items', idx, 'title')}
                  {renderArrayInput('Texto', 'highlights', 'items', idx, 'text')}
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
              {renderInput('Pré-título', 'categories', 'preTitle')}
              {renderInput('Título', 'categories', 'title')}
              {renderInput('Subtítulo', 'categories', 'subtitle')}
              {renderInput('Texto do Botão', 'categories', 'buttonText')}
            </div>
            <p className="text-[10px] text-muted-foreground border-t border-white/5 pt-3">As categorias em si são gerenciadas na aba "Categorias".</p>
          </div>
        )}

        {/* BEST SELLERS */}
        {activeSection === 'bestSellers' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Seção Mais Vendidos</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Pré-título', 'bestSellers', 'preTitle')}
              {renderInput('Título', 'bestSellers', 'title')}
              {renderInput('Subtítulo', 'bestSellers', 'subtitle', { rows: 2 })}
              {renderInput('Texto do Botão', 'bestSellers', 'buttonText')}
            </div>
          </div>
        )}

        {/* EXPERIENCIAS */}
        {activeSection === 'experiencias' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Experiencias Cheotnun</h3>
              {activeLang === 'es' && (
                <Button onClick={() => addArrayItem('experiencias', 'cards', { badge: 'NOVA', badgeColor: 'accent', title: 'Nova Experiência', text: 'Descrição', buttonText: 'SABER MÁS', image: '' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR CARD
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Pré-título da Seção', 'experiencias', 'preTitle')}
              {renderInput('Título da Seção', 'experiencias', 'title')}
            </div>
            <div className="border-t border-white/5 pt-4 space-y-6">
              {experiencesCards.map((card: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Card #{idx + 1}</span>
                    {activeLang === 'es' && (
                      <button onClick={() => removeArrayItem('experiencias', 'cards', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {renderArrayInput('Badge', 'experiencias', 'cards', idx, 'badge')}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Cor do Badge</label>
                      <select 
                        value={getArrayValue('experiencias', 'cards', idx, 'badgeColor') || 'accent'} 
                        onChange={e => handleArrayItemChange('experiencias', 'cards', idx, 'badgeColor', e.target.value)} 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
                      >
                        <option value="accent">Dourado (accent)</option>
                        <option value="blue">Azul</option>
                      </select>
                    </div>
                    {renderArrayInput('Título', 'experiencias', 'cards', idx, 'title')}
                    {renderArrayInput('Texto do Botão', 'experiencias', 'cards', idx, 'buttonText')}
                  </div>
                  {renderArrayInput('Texto', 'experiencias', 'cards', idx, 'text', { rows: 2 })}
                  {activeLang === 'es' && (
                    <ImageUpload
                      currentUrl={getBaseArrayValue('experiencias', 'cards', idx, 'image')}
                      onUrlChange={v => handleArrayItemChange('experiencias', 'cards', idx, 'image', v)}
                      folder="experiencias"
                      label="Imagem do Card"
                    />
                  )}
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
              {renderInput('Pré-título', 'routines', 'preTitle')}
              {renderInput('Título', 'routines', 'title')}
              {renderInput('Subtítulo', 'routines', 'subtitle')}
              {renderInput('Texto do Botão', 'routines', 'buttonText')}
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-bold text-accent uppercase">Itens de Rutina</h4>
                {activeLang === 'es' && (
                  <Button onClick={() => addArrayItem('routines', 'items', { name: 'Nova Rutina', icon: 'Sparkles' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Plus className="h-3 w-3" /> ADICIONAR
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {routinesItems.map((item: any, idx: number) => (
                  <div key={idx} className="border border-white/5 rounded-lg p-3 bg-secondary/30 flex gap-2 items-center">
                    <div className="flex-1 space-y-1">
                      <input 
                        value={getArrayValue('routines', 'items', idx, 'name')} 
                        onChange={e => handleArrayItemChange('routines', 'items', idx, 'name', e.target.value)} 
                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" 
                        placeholder={activeLang !== 'es' && getBaseArrayValue('routines', 'items', idx, 'name') ? `[ES]: ${getBaseArrayValue('routines', 'items', idx, 'name')}` : "Nome"} 
                      />
                      {activeLang === 'es' && (
                        <input 
                          value={getArrayValue('routines', 'items', idx, 'icon')} 
                          onChange={e => handleArrayItemChange('routines', 'items', idx, 'icon', e.target.value)} 
                          className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" 
                          placeholder="Ícone" 
                        />
                      )}
                    </div>
                    {activeLang === 'es' && (
                      <button onClick={() => removeArrayItem('routines', 'items', idx)} className="text-red-500"><Trash2 className="h-3 w-3" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-bold text-accent uppercase">Badges Inferiores</h4>
                {activeLang === 'es' && (
                  <Button onClick={() => addArrayItem('routines', 'badges', { icon: 'ShieldCheck', title: 'NOVO BADGE' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Plus className="h-3 w-3" /> ADICIONAR
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {routinesBadges.map((badge: any, idx: number) => (
                  <div key={idx} className="border border-white/5 rounded-lg p-3 bg-secondary/30 flex gap-2 items-center">
                    <div className="flex-1 space-y-1">
                      <input 
                        value={getArrayValue('routines', 'badges', idx, 'title')} 
                        onChange={e => handleArrayItemChange('routines', 'badges', idx, 'title', e.target.value)} 
                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" 
                        placeholder={activeLang !== 'es' && getBaseArrayValue('routines', 'badges', idx, 'title') ? `[ES]: ${getBaseArrayValue('routines', 'badges', idx, 'title')}` : "Título"} 
                      />
                      {activeLang === 'es' && (
                        <input 
                          value={getArrayValue('routines', 'badges', idx, 'icon')} 
                          onChange={e => handleArrayItemChange('routines', 'badges', idx, 'icon', e.target.value)} 
                          className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" 
                          placeholder="Ícone" 
                        />
                      )}
                    </div>
                    {activeLang === 'es' && (
                      <button onClick={() => removeArrayItem('routines', 'badges', idx)} className="text-red-500"><Trash2 className="h-3 w-3" /></button>
                    )}
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
              {renderInput('Título', 'instagram', 'title')}
              {renderInput('Subtítulo', 'instagram', 'subtitle')}
              {renderInput('Texto do Botão', 'instagram', 'buttonText')}
              {renderInput('Link do Botão', 'instagram', 'buttonLink')}
            </div>
            {activeLang === 'es' && (
              <div className="border-t border-white/5 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-bold text-accent uppercase">Imagens do Feed</h4>
                  <Button onClick={() => addArrayItem('instagram', 'images', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400')} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Plus className="h-3 w-3" /> ADICIONAR
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {instagramImages.map((url: string, idx: number) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <ImageUpload
                          currentUrl={url}
                          onUrlChange={v => handleArrayItemChange('instagram', 'images', idx, '', v)}
                          folder="instagram"
                          label={`Imagem ${idx + 1}`}
                        />
                      </div>
                      <button onClick={() => removeArrayItem('instagram', 'images', idx)} className="text-red-500 mt-7"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* NEWSLETTER */}
        {activeSection === 'newsletter' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Newsletter</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Pré-título', 'newsletter', 'preTitle')}
              {renderInput('Título', 'newsletter', 'title')}
              {renderInput('Texto do Botão', 'newsletter', 'buttonText')}
              {renderInput('Mensagem de Sucesso', 'newsletter', 'successMessage')}
            </div>
          </div>
        )}

        {/* HEADER */}
        {activeSection === 'header' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Header / Topo do Site</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Texto do Anúncio (barra superior)', 'header', 'announcementText')}
              {renderInput('Texto "Envíos"', 'header', 'shippingText')}
              {renderInput('Texto "Atención"', 'header', 'attentionText')}
              {activeLang === 'es' && (
                <ImageUpload
                  currentUrl={getBaseValue('header', 'logoUrl')}
                  onUrlChange={v => handleChange('header', 'logoUrl', v)}
                  folder="logo"
                  label="Logo do Site"
                />
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        {activeSection === 'footer' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Footer / Rodapé</h3>
            {renderInput('Descrição da Marca', 'footer', 'description', { rows: 3 })}
            <div className="grid grid-cols-2 gap-4">
              {renderInput('URL Instagram', 'footer', 'social.instagram')}
              {renderInput('URL YouTube', 'footer', 'social.youtube')}
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
