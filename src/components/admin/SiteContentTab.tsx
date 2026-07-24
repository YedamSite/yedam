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
    const defaults = db.getDefault('site_content');
    // Deep merge: fill empty/null/undefined fields with defaults
    const merged = JSON.parse(JSON.stringify(defaults));
    deepMerge(merged, JSON.parse(JSON.stringify(c || {})));
    setContent(merged);
  }, []);

  function deepMerge(target: any, source: any) {
    if (!source || !target) return;
    for (const key of Object.keys(source)) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
          target[key] = source[key];
        }
      }
    }
  }

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

      const isRootSec = ['header', 'footer', 'marcas', 'comoFunciona', 'contacto', 'envios', 'ayudaDevoluciones', 'rutinasPage', 'experienciasPage', 'terminos', 'privacidad', 'blog'].includes(section);
      if (isRootSec) {
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

  // Helper to resolve dotted paths like 'maeum.cards' -> obj['maeum']['cards']
  const getNested = (obj: any, path: string): any => {
    if (!obj || !path) return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  };

  const setNested = (obj: any, path: string, value: any): boolean => {
    if (!obj || !path) return false;
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    return true;
  };

  const ensureNested = (obj: any, path: string): any => {
    if (!obj || !path) return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (!current[part]) current[part] = {};
      current = current[part];
    }
    return current;
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

      const isRootSec = ['header', 'footer', 'marcas', 'comoFunciona', 'contacto', 'envios', 'ayudaDevoluciones', 'rutinasPage', 'experienciasPage', 'terminos', 'privacidad', 'blog'].includes(section);
      const parentObj = isRootSec ? root : root.home;

      if (!isRootSec && !root.home) root.home = {};
      if (!parentObj[section]) parentObj[section] = {};
      // Ensure the nested array path exists
      const arrContainer = ensureNested(parentObj[section], arrayField.split('.').slice(0, -1).join('.'));
      const arrKey = arrayField.split('.').pop() || arrayField;
      if (!arrContainer[arrKey]) {
        const baseParent = isRootSec ? updated : updated.home;
        const baseArr = getNested(baseParent?.[section], arrayField) || [];
        arrContainer[arrKey] = JSON.parse(JSON.stringify(baseArr));
      }

      const arr = arrContainer[arrKey];
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
    setContent((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const isRootSec = ['header', 'footer', 'marcas', 'comoFunciona', 'contacto', 'envios', 'ayudaDevoluciones', 'rutinasPage', 'experienciasPage', 'terminos', 'privacidad', 'blog'].includes(section);
      const parentObj = isRootSec ? updated : updated.home;

      if (!isRootSec && !updated.home) updated.home = {};
      if (!parentObj[section]) parentObj[section] = {};
      const arrContainer = ensureNested(parentObj[section], arrayField.split('.').slice(0, -1).join('.'));
      const arrKey = arrayField.split('.').pop() || arrayField;
      if (!arrContainer[arrKey]) {
        arrContainer[arrKey] = [];
      }
      arrContainer[arrKey].push(JSON.parse(JSON.stringify(template)));
      return updated;
    });
  };

  const getNestedArray = (obj: any, path: string): any[] | null => {
    if (!obj || !path) return null;
    const val = getNested(obj, path);
    return Array.isArray(val) ? val : null;
  };

  const removeArrayItem = (section: string, arrayField: string, index: number) => {
    setContent((prev: any) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const isRootSec = ['header', 'footer', 'marcas', 'comoFunciona', 'contacto', 'envios', 'ayudaDevoluciones', 'rutinasPage', 'experienciasPage', 'terminos', 'privacidad', 'blog'].includes(section);
      const parentObj = isRootSec ? updated : updated.home;

      const arr = getNestedArray(parentObj?.[section], arrayField);
      if (arr) {
        arr.splice(index, 1);
      }
      // Remove from translations as well
      if (updated.translations) {
        Object.keys(updated.translations).forEach(lang => {
          const tParentObj = isRootSec ? updated.translations[lang] : updated.translations[lang]?.home;
          const tArr = getNestedArray(tParentObj?.[section], arrayField);
          if (tArr) {
            tArr.splice(index, 1);
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
    const isRootSec = ['header', 'footer', 'marcas', 'comoFunciona', 'contacto', 'envios', 'ayudaDevoluciones', 'rutinasPage', 'experienciasPage', 'terminos', 'privacidad', 'blog'].includes(section);
    let obj = isRootSec ? root[section] : root.home?.[section];
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
    const isRootSec = ['header', 'footer', 'marcas', 'comoFunciona', 'contacto', 'envios', 'ayudaDevoluciones', 'rutinasPage', 'experienciasPage', 'terminos', 'privacidad', 'blog'].includes(section);
    let obj = isRootSec ? content[section] : content.home?.[section];
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
    const isRootSec = ['header', 'footer', 'marcas', 'comoFunciona', 'contacto', 'envios', 'ayudaDevoluciones', 'rutinasPage', 'experienciasPage', 'terminos', 'privacidad', 'blog'].includes(section);
    const parentObj = isRootSec ? root : root?.home;

    const arr = getNestedArray(parentObj?.[section], arrayField);
    if (!arr || !arr[index]) return '';
    const item = arr[index];
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
    const isRootSec = ['header', 'footer', 'marcas', 'comoFunciona', 'contacto', 'envios', 'ayudaDevoluciones', 'rutinasPage', 'experienciasPage', 'terminos', 'privacidad', 'blog'].includes(section);
    const parentObj = isRootSec ? content : content.home;

    const arr = getNestedArray(parentObj?.[section], arrayField);
    if (!arr || !arr[index]) return '';
    const item = arr[index];
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
    { id: 'marcas', label: 'Página: Marcas' },
    { id: 'comoFunciona', label: 'Página: Como Funciona' },
    { id: 'contacto', label: 'Página: Contacto' },
    { id: 'ayudaDevoluciones', label: 'Página: Devoluciones' },
    { id: 'envios', label: 'Página: Envíos' },
    { id: 'rutinasPage', label: 'Página: Rutinas' },
    { id: 'experienciasPage', label: 'Página: Experiencias' },
    { id: 'terminos', label: 'Página: Términos' },
    { id: 'privacidad', label: 'Página: Privacidad' },
    { id: 'blog', label: 'Página: Blog' },
  ];

  // Base lengths for loop consistency in translation tab
  const highlightsItems = content.home?.highlights?.items || [];
  const experiencesCards = content.home?.experiencias?.cards || [];
  const routinesItems = content.home?.routines?.items || [];
  const routinesBadges = content.home?.routines?.badges || [];
  const instagramImages = content.home?.instagram?.images || [];
  const headerLinks = content.header?.navLinks || [];
  const footerCols = content.footer?.columns || [];
  const rutinasSteps = content.rutinasPage?.steps || [];
  const expList = content.experienciasPage?.experiencesList || [];
  const maeumCards = content.experienciasPage?.maeum?.cards || [];
  const testList = content.experienciasPage?.testimonials?.list || [];
  const termSections = content.terminos?.sections || [];
  const privSections = content.privacidad?.sections || [];
  const rutinasIngredients = content.rutinasPage?.ingredients || [];
  const rutinasRoutineSteps = content.rutinasPage?.routineSteps || [];
  const rutinasTips = content.rutinasPage?.tips || [];
  const rutinasMakeup = content.rutinasPage?.makeup || [];
  const rutinasCategories = content.rutinasPage?.categories || [];
  const rutinasFaq = content.rutinasPage?.faq || [];
  const maeumPoints = content.experienciasPage?.maeum?.points || [];
  const comoFuncionaSteps = content.comoFunciona?.steps || [];
  const shippingItems = content.comoFunciona?.shippingInfo?.items || [];

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
            <ImageUpload
              currentUrl={getBaseValue('hero', 'bgImage')}
              onUrlChange={v => handleChange('hero', 'bgImage', v)}
              folder="hero"
              label="Imagem de Fundo do Hero (Desktop)"
            />
            <ImageUpload
              currentUrl={getBaseValue('hero', 'bgImageMobile')}
              onUrlChange={v => handleChange('hero', 'bgImageMobile', v)}
              folder="hero"
              label="Imagem de Fundo do Hero (Mobile)"
            />
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
            {highlightsItems.map((item: any, idx: number) => (
              <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-accent uppercase">Item #{idx + 1}</span>
                  <button onClick={() => removeArrayItem('highlights', 'items', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
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
              <Button onClick={() => addArrayItem('experiencias', 'cards', { badge: 'NOVA', badgeColor: 'accent', title: 'Nova Experiência', text: 'Descrição', buttonText: 'SABER MÁS', image: '' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="h-3 w-3" /> ADICIONAR CARD
              </Button>
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
                    <button onClick={() => removeArrayItem('experiencias', 'cards', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
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
                  <ImageUpload
                    currentUrl={getBaseArrayValue('experiencias', 'cards', idx, 'image')}
                    onUrlChange={v => handleArrayItemChange('experiencias', 'cards', idx, 'image', v)}
                    folder="experiencias"
                    label="Imagem do Card"
                  />
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
                <Button onClick={() => addArrayItem('routines', 'items', { name: 'Nova Rutina', icon: 'Sparkles' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
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
                      <input 
                        value={getArrayValue('routines', 'items', idx, 'icon')} 
                        onChange={e => handleArrayItemChange('routines', 'items', idx, 'icon', e.target.value)} 
                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" 
                        placeholder="Ícone" 
                      />
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
                {routinesBadges.map((badge: any, idx: number) => (
                  <div key={idx} className="border border-white/5 rounded-lg p-3 bg-secondary/30 flex gap-2 items-center">
                    <div className="flex-1 space-y-1">
                      <input 
                        value={getArrayValue('routines', 'badges', idx, 'title')} 
                        onChange={e => handleArrayItemChange('routines', 'badges', idx, 'title', e.target.value)} 
                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" 
                        placeholder={activeLang !== 'es' && getBaseArrayValue('routines', 'badges', idx, 'title') ? `[ES]: ${getBaseArrayValue('routines', 'badges', idx, 'title')}` : "Título"} 
                      />
                      <input 
                        value={getArrayValue('routines', 'badges', idx, 'icon')} 
                        onChange={e => handleArrayItemChange('routines', 'badges', idx, 'icon', e.target.value)} 
                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" 
                        placeholder="Ícone" 
                      />
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
              {renderInput('Título', 'instagram', 'title')}
              {renderInput('Subtítulo', 'instagram', 'subtitle')}
              {renderInput('Texto do Botão', 'instagram', 'buttonText')}
              {renderInput('Link do Botão', 'instagram', 'buttonLink')}
            </div>
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
              <ImageUpload
                currentUrl={getBaseValue('header', 'logoUrl')}
                onUrlChange={v => handleChange('header', 'logoUrl', v)}
                folder="logo"
                label="Logo do Site"
              />
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
              {renderInput('URL TikTok', 'footer', 'social.tiktok')}
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[10px] font-bold text-accent uppercase mb-2">Colunas do Footer</h4>
              <p className="text-[10px] text-muted-foreground">As colunas, links e ícones do footer são editáveis através do código fonte em src/components/Footer.tsx para maior flexibilidade.</p>
            </div>
          </div>
        )}

        {/* MARCAS */}
        {activeSection === 'marcas' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Página: Marcas</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Título do Hero', 'marcas', 'hero.title')}
              {renderInput('Subtítulo do Hero', 'marcas', 'hero.subtitle')}
              {renderInput('Texto do Botão Hero', 'marcas', 'hero.buttonText')}
            </div>
            <ImageUpload
              currentUrl={getBaseValue('marcas', 'hero.image')}
              onUrlChange={v => handleChange('marcas', 'hero.image', v)}
              folder="marcas"
              label="Imagem Hero (Marcas)"
            />

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Recursos (Features)</h4>
              <p className="text-[9px] text-muted-foreground">Ícones disponíveis: Award, Beaker, Heart, ShieldCheck, ShoppingBag, Headset, Gift, Star</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-accent font-bold uppercase">Lista de Recursos</span>
                <Button onClick={() => addArrayItem('marcas', 'features', { title: 'Novo', text: 'Descrição', icon: 'Award' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {(content?.marcas?.features || []).map((feat: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Feature #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('marcas', 'features', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {renderArrayInput('Ícone', 'marcas', 'features', idx, 'icon', { placeholder: 'Award, Beaker, Heart...' })}
                    {renderArrayInput('Título', 'marcas', 'features', idx, 'title')}
                    {renderArrayInput('Texto', 'marcas', 'features', idx, 'text')}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Por que nos escolher (Why Choose Us)</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título da Seção', 'marcas', 'whyChooseUs.title')}
                {renderInput('Texto de Conclusão (Título)', 'marcas', 'whyChooseUs.conclusionTitle')}
                {renderInput('Texto de Conclusão', 'marcas', 'whyChooseUs.conclusionText', { rows: 2 })}
              </div>
              <ImageUpload
                currentUrl={getBaseValue('marcas', 'whyChooseUs.image')}
                onUrlChange={v => handleChange('marcas', 'whyChooseUs.image', v)}
                folder="marcas"
                label="Imagem Why Choose Us"
              />
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-accent font-bold uppercase">Itens</span>
                <Button onClick={() => addArrayItem('marcas', 'whyChooseUs.items', { title: 'Novo', text: 'Descrição', icon: 'ShieldCheck' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {(content?.marcas?.whyChooseUs?.items || []).map((item: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Item #{idx + 1}</span>
                    <button onClick={() => { removeArrayItem('marcas', 'whyChooseUs.items', idx); }} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {renderArrayInput('Ícone', 'marcas', 'whyChooseUs.items', idx, 'icon')}
                    {renderArrayInput('Título', 'marcas', 'whyChooseUs.items', idx, 'title')}
                    {renderArrayInput('Texto', 'marcas', 'whyChooseUs.items', idx, 'text')}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Depoimentos (Testimonials)</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título da Seção', 'marcas', 'testimonials.title')}
                {renderInput('Texto do Botão', 'marcas', 'testimonials.buttonText')}
                {renderInput('Link do Botão', 'marcas', 'testimonials.buttonLink')}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-accent font-bold uppercase">Lista de Depoimentos</span>
                <Button onClick={() => addArrayItem('marcas', 'testimonials.list', { name: 'Nome', text: 'Depoimento', country: 'País', img: '' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {(content?.marcas?.testimonials?.list || []).map((item: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Depoimento #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('marcas', 'testimonials.list', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {renderArrayInput('Nome', 'marcas', 'testimonials.list', idx, 'name')}
                    {renderArrayInput('País', 'marcas', 'testimonials.list', idx, 'country')}
                  </div>
                  {renderArrayInput('Texto', 'marcas', 'testimonials.list', idx, 'text', { rows: 2 })}
                  <ImageUpload
                    currentUrl={getBaseArrayValue('marcas', 'testimonials.list', idx, 'img')}
                    onUrlChange={v => handleArrayItemChange('marcas', 'testimonials.list', idx, 'img', v)}
                    folder="marcas"
                    label="Foto do Depoimento"
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sellos de Confiança (Trust Badges)</h4>
              <p className="text-[9px] text-muted-foreground">Ícones: Leaf, FlaskConical, Rabbit, Recycle, Flower2, Award, Beaker, Heart, ShieldCheck</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-accent font-bold uppercase">Badges</span>
                <Button onClick={() => addArrayItem('marcas', 'trustBadges', { icon: 'Leaf', text: 'Nuevo badge' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {(content?.marcas?.trustBadges || []).map((item: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Badge #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('marcas', 'trustBadges', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {renderArrayInput('Ícone', 'marcas', 'trustBadges', idx, 'icon')}
                    {renderArrayInput('Texto', 'marcas', 'trustBadges', idx, 'text')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMO FUNCIONA */}
        {activeSection === 'comoFunciona' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Página: Como Funciona</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Título do Hero', 'comoFunciona', 'hero.title')}
              {renderInput('Subtítulo do Hero', 'comoFunciona', 'hero.subtitle')}
              {renderInput('Título da Qualidade', 'comoFunciona', 'qualityInfo.title')}
              {renderInput('Subtítulo da Qualidade', 'comoFunciona', 'qualityInfo.subtitle')}
              {renderInput('Título de Pagamentos', 'comoFunciona', 'paymentsInfo.title')}
              {renderInput('Subtítulo de Pagamentos', 'comoFunciona', 'paymentsInfo.subtitle')}
              {renderInput('Título de Envíos', 'comoFunciona', 'shippingInfo.title')}
              {renderInput('Subtítulo de Envíos', 'comoFunciona', 'shippingInfo.subtitle')}
            </div>
            <ImageUpload
              currentUrl={getBaseValue('comoFunciona', 'hero.image')}
              onUrlChange={v => handleChange('comoFunciona', 'hero.image', v)}
              folder="como-funciona"
              label="Imagem Hero (Como Funciona)"
            />

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Passos (Steps)</h4>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-accent font-bold uppercase">Lista de Passos</span>
                <Button onClick={() => addArrayItem('comoFunciona', 'steps', { number: '1', icon: 'ShoppingBag', title: 'Novo Passo', text: 'Descrição' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {comoFuncionaSteps.map((item: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Passo #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('comoFunciona', 'steps', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {renderArrayInput('Número', 'comoFunciona', 'steps', idx, 'number')}
                    {renderArrayInput('Ícone', 'comoFunciona', 'steps', idx, 'icon')}
                    {renderArrayInput('Título', 'comoFunciona', 'steps', idx, 'title')}
                    {renderArrayInput('Texto', 'comoFunciona', 'steps', idx, 'text', { rows: 2 })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Informações de Envio (Shipping Info Items)</h4>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-accent font-bold uppercase">Itens de Envio</span>
                <Button onClick={() => addArrayItem('comoFunciona', 'shippingInfo.items', { title: 'Novo Título', text: 'Descrição' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {shippingItems.map((item: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Item #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('comoFunciona', 'shippingInfo.items', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  {renderArrayInput('Título', 'comoFunciona', 'shippingInfo.items', idx, 'title')}
                  {renderArrayInput('Texto', 'comoFunciona', 'shippingInfo.items', idx, 'text', { rows: 2 })}
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">FAQ - Perguntas Frequentes</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título FAQ', 'comoFunciona', 'faq.title')}
                {renderInput('Subtítulo FAQ', 'comoFunciona', 'faq.subtitle')}
                {renderInput('Texto Botão', 'comoFunciona', 'faq.buttonText')}
              </div>
              <div className="mt-4 space-y-4">
                <h5 className="text-[10px] font-bold text-white/70 uppercase">Perguntas</h5>
                {(content?.comoFunciona?.faq?.items || []).map((q: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="flex-1"><input value={getArrayValue('comoFunciona', 'faq.items', idx, '')} onChange={e => handleArrayItemChange('comoFunciona', 'faq.items', idx, '', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" placeholder="Pergunta" /></div>
                    <button onClick={() => removeArrayItem('comoFunciona', 'faq.items', idx)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <Button onClick={() => addArrayItem('comoFunciona', 'faq.items', 'Nova pergunta')} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR PERGUNTA
                </Button>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Promessas / Qualidade</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título', 'comoFunciona', 'promises.title')}
                {renderInput('Subtítulo', 'comoFunciona', 'promises.subtitle', { rows: 2 })}
                <div className="col-span-2">
                  <ImageUpload currentUrl={getBaseValue('comoFunciona', 'promises.image')} onUrlChange={v => handleChange('comoFunciona', 'promises.image', v)} folder="como-funciona" label="Imagem Promessas" />
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <h5 className="text-[10px] font-bold text-white/70 uppercase">Itens de Qualidade</h5>
                {(content?.comoFunciona?.promises?.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-accent uppercase">Item #{idx + 1}</span>
                      <button onClick={() => removeArrayItem('comoFunciona', 'promises.items', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {renderArrayInput('Ícone', 'comoFunciona', 'promises.items', idx, 'icon')}
                      {renderArrayInput('Título', 'comoFunciona', 'promises.items', idx, 'title')}
                    </div>
                  </div>
                ))}
                <Button onClick={() => addArrayItem('comoFunciona', 'promises.items', { icon: 'ShieldCheck', title: 'Novo item' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR ITEM
                </Button>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Comunidade / Instagram</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título', 'comoFunciona', 'community.title')}
                {renderInput('Descrição', 'comoFunciona', 'community.desc', { rows: 2 })}
                {renderInput('Texto Botão', 'comoFunciona', 'community.buttonText')}
                {renderInput('Link Instagram', 'comoFunciona', 'community.buttonLink')}
              </div>
              <div className="mt-4 space-y-4">
                <h5 className="text-[10px] font-bold text-white/70 uppercase">Imagens (URLs)</h5>
                {(content?.comoFunciona?.community?.images || []).map((img: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="flex-1"><input value={getArrayValue('comoFunciona', 'community.images', idx, '')} onChange={e => handleArrayItemChange('comoFunciona', 'community.images', idx, '', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" placeholder="URL da imagem" /></div>
                    <button onClick={() => removeArrayItem('comoFunciona', 'community.images', idx)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <Button onClick={() => addArrayItem('comoFunciona', 'community.images', 'https://')} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR IMAGEM
                </Button>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Newsletter</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título', 'comoFunciona', 'newsletter.title')}
                {renderInput('Subtítulo', 'comoFunciona', 'newsletter.subtitle', { rows: 2 })}
                {renderInput('Placeholder Email', 'comoFunciona', 'newsletter.placeholder')}
                {renderInput('Texto Botão', 'comoFunciona', 'newsletter.buttonText')}
                {renderInput('Disclaimer', 'comoFunciona', 'newsletter.disclaimer', { rows: 2 })}
              </div>
            </div>
          </div>
        )}

        {/* CONTACTO */}
        {activeSection === 'contacto' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Página: Contacto</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Título do Hero', 'contacto', 'hero.title', { rows: 2 })}
              {renderInput('Subtítulo do Hero', 'contacto', 'hero.subtitle', { rows: 3 })}
              {renderInput('Texto do Botão Hero', 'contacto', 'hero.buttonText')}
            </div>
            <ImageUpload
              currentUrl={getBaseValue('contacto', 'hero.image')}
              onUrlChange={v => handleChange('contacto', 'hero.image', v)}
              folder="contacto"
              label="Imagem Hero (Contacto)"
            />

            <div className="border-t border-white/5 pt-4 space-y-4">
              <h4 className="text-[10px] font-bold text-accent uppercase mb-2">Badges do Hero</h4>
              {(content?.contacto?.hero?.badges || []).map((badge: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Badge #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('contacto', 'hero.badges', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {renderArrayInput('Ícone', 'contacto', 'hero.badges', idx, 'icon')}
                    {renderArrayInput('Texto', 'contacto', 'hero.badges', idx, 'text')}
                  </div>
                </div>
              ))}
              <Button onClick={() => addArrayItem('contacto', 'hero.badges', { icon: 'Clock', text: 'Novo badge' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="h-3 w-3" /> ADICIONAR BADGE
              </Button>
            </div>
            
            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[10px] font-bold text-accent uppercase mb-2">Informações de Contato</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título da Seção', 'contacto', 'contactMethods.title')}
                {renderInput('Número do WhatsApp', 'contacto', 'contactMethods.whatsapp.value')}
                {renderInput('Horário de Atendimento', 'contacto', 'contactMethods.whatsapp.time')}
                {renderInput('Descrição WhatsApp', 'contacto', 'contactMethods.whatsapp.desc', { rows: 2 })}
                {renderInput('Texto Botão WhatsApp', 'contacto', 'contactMethods.whatsapp.btn')}
                {renderInput('Link WhatsApp', 'contacto', 'contactMethods.whatsapp.link')}
                {renderInput('Endereço de E-mail', 'contacto', 'contactMethods.email.value')}
                {renderInput('Descrição E-mail', 'contacto', 'contactMethods.email.desc', { rows: 2 })}
                {renderInput('Texto Botão E-mail', 'contacto', 'contactMethods.email.btn')}
                {renderInput('Link E-mail', 'contacto', 'contactMethods.email.link')}
                {renderInput('Instagram Label', 'contacto', 'contactMethods.instagram.label')}
                {renderInput('Instagram @', 'contacto', 'contactMethods.instagram.value')}
                {renderInput('Descrição Instagram', 'contacto', 'contactMethods.instagram.desc', { rows: 2 })}
                {renderInput('Texto Botão Instagram', 'contacto', 'contactMethods.instagram.btn')}
                {renderInput('Link Instagram', 'contacto', 'contactMethods.instagram.link')}
                {renderInput('Horário Label', 'contacto', 'contactMethods.hours.label')}
                {renderInput('Descrição Horário', 'contacto', 'contactMethods.hours.desc', { rows: 2 })}
                {renderInput('Texto Botão Horário', 'contacto', 'contactMethods.hours.btn')}
                {renderInput('Endereço Label', 'contacto', 'contactMethods.address.label')}
                {renderInput('Descrição Endereço', 'contacto', 'contactMethods.address.desc', { rows: 2 })}
                {renderInput('Texto Botão Endereço', 'contacto', 'contactMethods.address.btn')}
                {renderInput('Link Endereço', 'contacto', 'contactMethods.address.link')}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[10px] font-bold text-accent uppercase mb-2">Formulário de Contato</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título do Form', 'contacto', 'form.title')}
                {renderInput('Label Nome', 'contacto', 'form.nameLabel')}
                {renderInput('Label E-mail', 'contacto', 'form.emailLabel')}
                {renderInput('Label Assunto', 'contacto', 'form.subjectLabel')}
                {renderInput('Label Mensagem', 'contacto', 'form.messageLabel')}
                {renderInput('Texto Botão Enviar', 'contacto', 'form.submitText')}
                {renderInput('Aviso de Segurança', 'contacto', 'form.securityNotice', { rows: 2 })}
                {renderInput('Alerta de Sucesso', 'contacto', 'form.successAlert', { rows: 2 })}
              </div>
              <div className="mt-4 space-y-4">
                <h5 className="text-[10px] font-bold text-white/70 uppercase">Opções de Assunto</h5>
                {(content?.contacto?.form?.subjectOptions || []).map((opt: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <input value={getArrayValue('contacto', 'form.subjectOptions', idx, '')} onChange={e => handleArrayItemChange('contacto', 'form.subjectOptions', idx, '', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" placeholder="Opção de assunto" />
                    </div>
                    <button onClick={() => removeArrayItem('contacto', 'form.subjectOptions', idx)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <Button onClick={() => addArrayItem('contacto', 'form.subjectOptions', 'Novo assunto')} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR OPÇÃO
                </Button>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[10px] font-bold text-accent uppercase mb-2">FAQ - Tópicos</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título FAQ', 'contacto', 'faq.title')}
                {renderInput('Subtítulo FAQ Rápida', 'contacto', 'faq.subtitle')}
                {renderInput('Texto Botão FAQ', 'contacto', 'faq.buttonText')}
              </div>
              <div className="mt-4 space-y-4">
                {(content?.contacto?.faq?.topics || []).map((topic: any, idx: number) => (
                  <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-accent uppercase">Tópico #{idx + 1}</span>
                      <button onClick={() => removeArrayItem('contacto', 'faq.topics', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {renderArrayInput('Ícone', 'contacto', 'faq.topics', idx, 'icon')}
                      {renderArrayInput('Título', 'contacto', 'faq.topics', idx, 'title')}
                      {renderArrayInput('Descrição', 'contacto', 'faq.topics', idx, 'desc', { rows: 2 })}
                    </div>
                  </div>
                ))}
                <Button onClick={() => addArrayItem('contacto', 'faq.topics', { icon: 'Info', title: 'Novo tópico', desc: '' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR TÓPICO
                </Button>
              </div>
              <div className="mt-4 space-y-4">
                <h5 className="text-[10px] font-bold text-white/70 uppercase">Perguntas Rápidas</h5>
                {(content?.contacto?.faq?.quickItems || []).map((q: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="flex-1"><input value={getArrayValue('contacto', 'faq.quickItems', idx, '')} onChange={e => handleArrayItemChange('contacto', 'faq.quickItems', idx, '', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" placeholder="Pergunta rápida" /></div>
                    <button onClick={() => removeArrayItem('contacto', 'faq.quickItems', idx)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <Button onClick={() => addArrayItem('contacto', 'faq.quickItems', 'Nova pergunta')} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR PERGUNTA
                </Button>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[10px] font-bold text-accent uppercase mb-2">Comunidade / Instagram</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título Comunidade', 'contacto', 'community.title')}
                {renderInput('Descrição', 'contacto', 'community.desc', { rows: 2 })}
                {renderInput('Texto Botão', 'contacto', 'community.buttonText')}
                {renderInput('Link Instagram', 'contacto', 'community.buttonLink')}
              </div>
              <div className="mt-4 space-y-4">
                <h5 className="text-[10px] font-bold text-white/70 uppercase">Imagens Instagram (URLs)</h5>
                {(content?.contacto?.community?.images || []).map((img: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="flex-1"><input value={getArrayValue('contacto', 'community.images', idx, '')} onChange={e => handleArrayItemChange('contacto', 'community.images', idx, '', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white" placeholder="URL da imagem" /></div>
                    <button onClick={() => removeArrayItem('contacto', 'community.images', idx)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <Button onClick={() => addArrayItem('contacto', 'community.images', 'https://')} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR IMAGEM
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* DEVOLUCIONES */}
        {activeSection === 'ayudaDevoluciones' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Página: Devoluciones</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Badge', 'ayudaDevoluciones', 'hero.badge')}
              {renderInput('Título', 'ayudaDevoluciones', 'hero.title')}
              {renderInput('Subtítulo', 'ayudaDevoluciones', 'hero.subtitle', { rows: 2 })}
              {renderInput('Título da Seção de Passos', 'ayudaDevoluciones', 'hero.sectionTitle')}
              {renderInput('Título Condições', 'ayudaDevoluciones', 'hero.conditionsTitle')}
              {renderInput('Título Não Aceitos', 'ayudaDevoluciones', 'hero.notAcceptedTitle')}
              {renderInput('Título Contato', 'ayudaDevoluciones', 'hero.contactTitle')}
              {renderInput('Texto Contato', 'ayudaDevoluciones', 'hero.contactText', { rows: 2 })}
              {renderInput('Email Contato', 'ayudaDevoluciones', 'hero.contactEmail')}
              {renderInput('WhatsApp Contato', 'ayudaDevoluciones', 'hero.contactWhatsapp')}
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Passos</h4>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-accent font-bold uppercase">Lista de Passos</span>
                <Button onClick={() => addArrayItem('ayudaDevoluciones', 'hero.steps', { step: '01', icon: 'Clock', title: 'Novo', desc: '' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {(content?.ayudaDevoluciones?.hero?.steps || []).map((item: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Passo #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('ayudaDevoluciones', 'hero.steps', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {renderArrayInput('Número', 'ayudaDevoluciones', 'hero.steps', idx, 'step')}
                    {renderArrayInput('Ícone', 'ayudaDevoluciones', 'hero.steps', idx, 'icon')}
                    {renderArrayInput('Título', 'ayudaDevoluciones', 'hero.steps', idx, 'title')}
                    <div className="col-span-2">
                      {renderArrayInput('Descrição', 'ayudaDevoluciones', 'hero.steps', idx, 'desc', { rows: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resumo (Summary Cards)</h4>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-accent font-bold uppercase">Cards</span>
                <Button onClick={() => addArrayItem('ayudaDevoluciones', 'hero.summary', { icon: 'Clock', title: 'Novo', text: '' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {(content?.ayudaDevoluciones?.hero?.summary || []).map((item: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Card #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('ayudaDevoluciones', 'hero.summary', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {renderArrayInput('Ícone', 'ayudaDevoluciones', 'hero.summary', idx, 'icon')}
                    {renderArrayInput('Título', 'ayudaDevoluciones', 'hero.summary', idx, 'title')}
                    {renderArrayInput('Texto', 'ayudaDevoluciones', 'hero.summary', idx, 'text')}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Condições Aceitas</h4>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-accent font-bold uppercase">Condições</span>
                <Button onClick={() => addArrayItem('ayudaDevoluciones', 'hero.conditions', 'Nova condição')} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {(content?.ayudaDevoluciones?.hero?.conditions || []).map((cond: string, idx: number) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input
                      value={getArrayValue('ayudaDevoluciones', 'hero.conditions', idx, '')}
                      onChange={e => handleArrayItemChange('ayudaDevoluciones', 'hero.conditions', idx, '', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                      placeholder="Condição"
                    />
                  </div>
                  <button onClick={() => removeArrayItem('ayudaDevoluciones', 'hero.conditions', idx)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Não Aceitos</h4>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-accent font-bold uppercase">Itens Não Aceitos</span>
                <Button onClick={() => addArrayItem('ayudaDevoluciones', 'hero.notAccepted', 'Novo item')} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {(content?.ayudaDevoluciones?.hero?.notAccepted || []).map((item: string, idx: number) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input
                      value={getArrayValue('ayudaDevoluciones', 'hero.notAccepted', idx, '')}
                      onChange={e => handleArrayItemChange('ayudaDevoluciones', 'hero.notAccepted', idx, '', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                      placeholder="Item não aceito"
                    />
                  </div>
                  <button onClick={() => removeArrayItem('ayudaDevoluciones', 'hero.notAccepted', idx)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENVIOS */}
        {activeSection === 'envios' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Página: Envíos</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Título do Hero', 'envios', 'hero.title')}
              {renderInput('Subtítulo do Hero', 'envios', 'hero.subtitle')}
              {renderInput('Texto do Hero', 'envios', 'hero.text', { rows: 3 })}
              {renderInput('Título de Como Funciona', 'envios', 'shipping.title')}
              {renderInput('Texto Adicional de Como Funciona', 'envios', 'shipping.text')}
              {renderInput('Título Tabela Internacional', 'envios', 'shipping.tableTitle')}
              {renderInput('Subtítulo Tabela Internacional', 'envios', 'shipping.tableSubtitle')}
              {renderInput('Título Pagamentos Seguros', 'envios', 'payments.title')}
              {renderInput('Subtítulo Pagamentos Seguros', 'envios', 'payments.subtitle')}
            </div>
            <ImageUpload
              currentUrl={getBaseValue('envios', 'hero.image')}
              onUrlChange={v => handleChange('envios', 'hero.image', v)}
              folder="envios"
              label="Imagem Hero (Envíos)"
            />
          </div>
        )}

        {/* RUTINAS PAGE */}
        {activeSection === 'rutinasPage' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Página: Rutinas</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Título do Hero', 'rutinasPage', 'hero.title')}
              {renderInput('Subtítulo do Hero', 'rutinasPage', 'hero.subtitle')}
              {renderInput('Texto do Botão Hero', 'rutinasPage', 'hero.buttonText')}
            </div>
            <ImageUpload
              currentUrl={getBaseValue('rutinasPage', 'hero.image')}
              onUrlChange={v => handleChange('rutinasPage', 'hero.image', v)}
              folder="rutinas"
              label="Imagem Hero (Rutinas)"
            />

            <div className="flex items-center justify-between mt-6">
              <h4 className="text-[10px] font-bold text-accent uppercase mb-2">Passos da Rotina</h4>
              <Button onClick={() => addArrayItem('rutinasPage', 'steps', { step: '1', title: 'Novo', subtitle: '', description: '', icon: 'Droplet' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="h-3 w-3" /> ADICIONAR
              </Button>
            </div>
            {rutinasSteps.map((item: any, idx: number) => (
              <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-accent uppercase">Passo #{idx + 1}</span>
                  <button onClick={() => removeArrayItem('rutinasPage', 'steps', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderArrayInput('Número (Step)', 'rutinasPage', 'steps', idx, 'step')}
                  {renderArrayInput('Ícone', 'rutinasPage', 'steps', idx, 'icon')}
                  {renderArrayInput('Título', 'rutinasPage', 'steps', idx, 'title')}
                  {renderArrayInput('Subtítulo', 'rutinasPage', 'steps', idx, 'subtitle')}
                  <div className="col-span-2">
                     {renderArrayInput('Descrição', 'rutinasPage', 'steps', idx, 'description', { rows: 2 })}
                  </div>
                </div>
              </div>
            ))}

            {/* STEPS SECTION */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Seção de Etapas (Steps Section)</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título da Seção', 'rutinasPage', 'stepsSection.title')}
                {renderInput('Subtítulo da Seção', 'rutinasPage', 'stepsSection.subtitle')}
                {renderInput('Texto do Rodapé', 'rutinasPage', 'stepsSection.footerText', { rows: 2 })}
              </div>
            </div>

            {/* INGREDIENTS SECTION */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Seção de Ingredientes</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título da Seção', 'rutinasPage', 'ingredientsSection.title')}
                {renderInput('Subtítulo da Seção', 'rutinasPage', 'ingredientsSection.subtitle')}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-accent font-bold uppercase">Ingredientes</span>
                <Button onClick={() => addArrayItem('rutinasPage', 'ingredients', { name: 'Novo Ingrediente', desc: 'Descrição', img: '' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {rutinasIngredients.map((item: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Ingrediente #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('rutinasPage', 'ingredients', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {renderArrayInput('Nome', 'rutinasPage', 'ingredients', idx, 'name')}
                    <div className="col-span-2">
                      {renderArrayInput('Descrição', 'rutinasPage', 'ingredients', idx, 'desc', { rows: 2 })}
                    </div>
                  </div>
                  <ImageUpload
                    currentUrl={getBaseArrayValue('rutinasPage', 'ingredients', idx, 'img')}
                    onUrlChange={v => handleArrayItemChange('rutinasPage', 'ingredients', idx, 'img', v)}
                    folder="rutinas"
                    label="Imagem do Ingrediente"
                  />
                </div>
              ))}
            </div>

            {/* ROUTINE SECTION */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Como Montar sua Rotina</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título da Seção', 'rutinasPage', 'routineSection.title')}
                {renderInput('Título do Box', 'rutinasPage', 'routineSection.boxTitle')}
                {renderInput('Descrição do Box', 'rutinasPage', 'routineSection.boxDesc', { rows: 2 })}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-accent font-bold uppercase">Passos da Rotina</span>
                <Button onClick={() => addArrayItem('rutinasPage', 'routineSteps', { num: '1', title: 'Novo', icon: 'Droplet', sub: '' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {rutinasRoutineSteps.map((item: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Passo #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('rutinasPage', 'routineSteps', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {renderArrayInput('Número', 'rutinasPage', 'routineSteps', idx, 'num')}
                    {renderArrayInput('Ícone', 'rutinasPage', 'routineSteps', idx, 'icon')}
                    {renderArrayInput('Título', 'rutinasPage', 'routineSteps', idx, 'title')}
                    {renderArrayInput('Subtítulo (opcional)', 'rutinasPage', 'routineSteps', idx, 'sub')}
                  </div>
                </div>
              ))}
            </div>

            {/* TIPS SECTION */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dicas</h4>
              {renderInput('Título da Seção', 'rutinasPage', 'tipsSection.title')}
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-accent font-bold uppercase">Dicas</span>
                <Button onClick={() => addArrayItem('rutinasPage', 'tips', { title: 'Nova Dica', desc: 'Descrição', img: '', icon: 'Sun' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {rutinasTips.map((item: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Dica #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('rutinasPage', 'tips', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {renderArrayInput('Ícone', 'rutinasPage', 'tips', idx, 'icon')}
                    {renderArrayInput('Título', 'rutinasPage', 'tips', idx, 'title')}
                    <div className="col-span-2">
                      {renderArrayInput('Descrição', 'rutinasPage', 'tips', idx, 'desc', { rows: 2 })}
                    </div>
                  </div>
                  <ImageUpload
                    currentUrl={getBaseArrayValue('rutinasPage', 'tips', idx, 'img')}
                    onUrlChange={v => handleArrayItemChange('rutinasPage', 'tips', idx, 'img', v)}
                    folder="rutinas"
                    label="Imagem da Dica"
                  />
                </div>
              ))}
            </div>

            {/* MAKEUP SECTION */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Universo da Maquiagem Coreana</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título da Seção', 'rutinasPage', 'makeupSection.title')}
                {renderInput('Subtítulo da Seção', 'rutinasPage', 'makeupSection.subtitle')}
                {renderInput('Texto do Botão', 'rutinasPage', 'makeupSection.buttonText')}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-accent font-bold uppercase">Maquiagens</span>
                <Button onClick={() => addArrayItem('rutinasPage', 'makeup', { name: 'Novo', img: '' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {rutinasMakeup.map((item: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">Maquiagem #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('rutinasPage', 'makeup', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  {renderArrayInput('Nome', 'rutinasPage', 'makeup', idx, 'name')}
                  <ImageUpload
                    currentUrl={getBaseArrayValue('rutinasPage', 'makeup', idx, 'img')}
                    onUrlChange={v => handleArrayItemChange('rutinasPage', 'makeup', idx, 'img', v)}
                    folder="rutinas"
                    label="Imagem da Maquiagem"
                  />
                </div>
              ))}
            </div>

            {/* CATEGORIES SECTION */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explorar Categorias</h4>
              {renderInput('Título da Seção', 'rutinasPage', 'categoriesSection.title')}
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-accent font-bold uppercase">Categorias</span>
                <Button onClick={() => addArrayItem('rutinasPage', 'categories', { name: 'Nova Categoria', icon: 'Sparkles' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {rutinasCategories.map((item: any, idx: number) => (
                  <div key={idx} className="border border-white/5 rounded-lg p-3 bg-secondary/30 flex gap-2 items-center">
                    <div className="flex-1 space-y-1">
                      <input
                        value={getArrayValue('rutinasPage', 'categories', idx, 'name')}
                        onChange={e => handleArrayItemChange('rutinasPage', 'categories', idx, 'name', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                        placeholder={activeLang !== 'es' && getBaseArrayValue('rutinasPage', 'categories', idx, 'name') ? `[ES]: ${getBaseArrayValue('rutinasPage', 'categories', idx, 'name')}` : "Nome"}
                      />
                      <input
                        value={getArrayValue('rutinasPage', 'categories', idx, 'icon')}
                        onChange={e => handleArrayItemChange('rutinasPage', 'categories', idx, 'icon', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                        placeholder="Ícone"
                      />
                    </div>
                    <button onClick={() => removeArrayItem('rutinasPage', 'categories', idx)} className="text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ SECTION */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">FAQ</h4>
              {renderInput('Título da Seção', 'rutinasPage', 'faqSection.title')}
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-accent font-bold uppercase">Perguntas Frequentes</span>
                <Button onClick={() => addArrayItem('rutinasPage', 'faq', { q: 'Nova Pergunta?', a: 'Resposta' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {rutinasFaq.map((item: any, idx: number) => (
                <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent uppercase">FAQ #{idx + 1}</span>
                    <button onClick={() => removeArrayItem('rutinasPage', 'faq', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  {renderArrayInput('Pergunta', 'rutinasPage', 'faq', idx, 'q')}
                  {renderArrayInput('Resposta', 'rutinasPage', 'faq', idx, 'a', { rows: 3 })}
                </div>
              ))}
            </div>

            {/* NEWSLETTER */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Newsletter</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título', 'rutinasPage', 'newsletter.title')}
                {renderInput('Subtítulo', 'rutinasPage', 'newsletter.subtitle')}
                {renderInput('Texto do Botão', 'rutinasPage', 'newsletter.buttonText')}
                {renderInput('Aviso Legal', 'rutinasPage', 'newsletter.disclaimer', { rows: 2 })}
              </div>
              <ImageUpload
                currentUrl={getBaseValue('rutinasPage', 'newsletter.image')}
                onUrlChange={v => handleChange('rutinasPage', 'newsletter.image', v)}
                folder="rutinas"
                label="Imagem da Newsletter"
              />
            </div>

          </div>
        )}

        {/* EXPERIENCIAS PAGE */}
        {activeSection === 'experienciasPage' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Página: Experiencias</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Título do Hero', 'experienciasPage', 'hero.title')}
              {renderInput('Subtítulo do Hero', 'experienciasPage', 'hero.subtitle')}
              {renderInput('Texto do Botão Hero', 'experienciasPage', 'hero.buttonText')}
            </div>
            <ImageUpload
              currentUrl={getBaseValue('experienciasPage', 'hero.image')}
              onUrlChange={v => handleChange('experienciasPage', 'hero.image', v)}
              folder="experiencias"
              label="Imagem Hero (Experiencias)"
            />

            {renderInput('Título da Seção Experiências', 'experienciasPage', 'experiences.title')}

            <div className="flex items-center justify-between mt-6">
              <h4 className="text-[10px] font-bold text-accent uppercase mb-2">Lista de Experiências</h4>
              <Button onClick={() => addArrayItem('experienciasPage', 'experiencesList', { title: 'Novo', desc: '', icon: 'Award', img: '' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="h-3 w-3" /> ADICIONAR
              </Button>
            </div>
            {expList.map((item: any, idx: number) => (
              <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-accent uppercase">Card #{idx + 1}</span>
                  <button onClick={() => removeArrayItem('experienciasPage', 'experiencesList', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderArrayInput('Título', 'experienciasPage', 'experiencesList', idx, 'title')}
                  {renderArrayInput('Ícone', 'experienciasPage', 'experiencesList', idx, 'icon')}
                  <div className="col-span-2">
                     {renderArrayInput('Descrição', 'experienciasPage', 'experiencesList', idx, 'desc', { rows: 2 })}
                  </div>
                </div>
                <ImageUpload
                  currentUrl={getBaseArrayValue('experienciasPage', 'experiencesList', idx, 'img')}
                  onUrlChange={v => handleArrayItemChange('experienciasPage', 'experiencesList', idx, 'img', v)}
                  folder="experiencias"
                  label="Imagem do Card"
                />
              </div>
            ))}

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Maeum Global - Textos</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Badge', 'experienciasPage', 'maeum.badge')}
                {renderInput('Título', 'experienciasPage', 'maeum.title')}
                {renderInput('Subtítulo', 'experienciasPage', 'maeum.subtitle')}
                {renderInput('Descrição', 'experienciasPage', 'maeum.desc', { rows: 2 })}
                {renderInput('Texto do Botão', 'experienciasPage', 'maeum.buttonText')}
                {renderInput('Link do Botão', 'experienciasPage', 'maeum.buttonLink')}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-accent font-bold uppercase">Pontos (Points)</span>
                <Button onClick={() => addArrayItem('experienciasPage', 'maeum.points', 'Novo ponto')} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
              {maeumPoints.map((point: string, idx: number) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input
                      value={getArrayValue('experienciasPage', 'maeum.points', idx, '')}
                      onChange={e => handleArrayItemChange('experienciasPage', 'maeum.points', idx, '', e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                      placeholder="Texto do ponto"
                    />
                  </div>
                  <button onClick={() => removeArrayItem('experienciasPage', 'maeum.points', idx)} className="text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <h4 className="text-[10px] font-bold text-accent uppercase mb-2">Maeum Global - Cards</h4>
              <Button onClick={() => addArrayItem('experienciasPage', 'maeum.cards', { title: 'Novo', desc: '', icon: 'Award', img: '' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="h-3 w-3" /> ADICIONAR
              </Button>
            </div>
            {maeumCards.map((item: any, idx: number) => (
              <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-accent uppercase">Maeum Card #{idx + 1}</span>
                  <button onClick={() => removeArrayItem('experienciasPage', 'maeum.cards', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderArrayInput('Título', 'experienciasPage', 'maeum.cards', idx, 'title')}
                  {renderArrayInput('Ícone', 'experienciasPage', 'maeum.cards', idx, 'icon')}
                  <div className="col-span-2">
                     {renderArrayInput('Descrição', 'experienciasPage', 'maeum.cards', idx, 'desc', { rows: 2 })}
                  </div>
                </div>
                <ImageUpload
                  currentUrl={getBaseArrayValue('experienciasPage', 'maeum.cards', idx, 'img')}
                  onUrlChange={v => handleArrayItemChange('experienciasPage', 'maeum.cards', idx, 'img', v)}
                  folder="experiencias"
                  label="Imagem do Card"
                />
              </div>
            ))}

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Depoimentos</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título da Seção', 'experienciasPage', 'testimonials.title')}
                {renderInput('Texto do Botão', 'experienciasPage', 'testimonials.buttonText')}
              </div>
              <div className="flex items-center justify-between mt-4">
                <h4 className="text-[10px] font-bold text-accent uppercase mb-2">Lista de Depoimentos</h4>
                <Button onClick={() => addArrayItem('experienciasPage', 'testimonials.list', { name: 'Nome', country: 'País', quote: '', img: '' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Plus className="h-3 w-3" /> ADICIONAR
                </Button>
              </div>
            </div>
            {testList.map((item: any, idx: number) => (
              <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-accent uppercase">Depoimento #{idx + 1}</span>
                  <button onClick={() => removeArrayItem('experienciasPage', 'testimonials.list', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderArrayInput('Nome', 'experienciasPage', 'testimonials.list', idx, 'name')}
                  {renderArrayInput('País', 'experienciasPage', 'testimonials.list', idx, 'country')}
                  <div className="col-span-2">
                     {renderArrayInput('Citação (Quote)', 'experienciasPage', 'testimonials.list', idx, 'quote', { rows: 2 })}
                  </div>
                </div>
                <ImageUpload
                  currentUrl={getBaseArrayValue('experienciasPage', 'testimonials.list', idx, 'img')}
                  onUrlChange={v => handleArrayItemChange('experienciasPage', 'testimonials.list', idx, 'img', v)}
                  folder="experiencias"
                  label="Foto do Depoimento"
                />
              </div>
            ))}

            {/* NEWSLETTER */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Newsletter</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderInput('Título', 'experienciasPage', 'newsletter.title')}
                {renderInput('Subtítulo', 'experienciasPage', 'newsletter.subtitle')}
                {renderInput('Texto do Botão', 'experienciasPage', 'newsletter.buttonText')}
                {renderInput('Aviso Legal', 'experienciasPage', 'newsletter.disclaimer', { rows: 2 })}
              </div>
            </div>

          </div>
        )}

        {/* TERMINOS */}
        {activeSection === 'terminos' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Página: Términos y Condiciones</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Badge', 'terminos', 'hero.badge')}
              {renderInput('Título', 'terminos', 'hero.title')}
              {renderInput('Subtítulo', 'terminos', 'hero.subtitle', { rows: 2 })}
            </div>
            <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
              {renderInput('Intro P1', 'terminos', 'intro.p1', { rows: 2 })}
              {renderInput('Intro Brand', 'terminos', 'intro.brand')}
              {renderInput('Intro P2', 'terminos', 'intro.p2', { rows: 2 })}
            </div>
            <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
              {renderInput('Nome Empresa', 'terminos', 'company.name')}
              {renderInput('NIF', 'terminos', 'company.nif')}
              {renderInput('Endereço', 'terminos', 'company.address')}
              {renderInput('Email', 'terminos', 'company.email')}
              {renderInput('Telefone', 'terminos', 'company.phone')}
            </div>
            <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
              {renderInput('Título Idade', 'terminos', 'additional.ageTitle')}
              {renderInput('Desc Idade', 'terminos', 'additional.ageDesc', { rows: 2 })}
              {renderInput('Título Conta', 'terminos', 'additional.accountTitle')}
              {renderInput('Desc Conta', 'terminos', 'additional.accountDesc', { rows: 2 })}
            </div>
            <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
              {renderInput('Contato Título', 'terminos', 'contact.title')}
              {renderInput('Contato Desc', 'terminos', 'contact.desc')}
            </div>

            <div className="flex items-center justify-between mt-6">
              <h4 className="text-[10px] font-bold text-accent uppercase mb-2">Seções e Regras</h4>
              <Button onClick={() => addArrayItem('terminos', 'sections', { title: 'Nova Seção', content: '', icon: 'FileText' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="h-3 w-3" /> ADICIONAR
              </Button>
            </div>
            {termSections.map((item: any, idx: number) => (
              <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-accent uppercase">Seção #{idx + 1}</span>
                  <button onClick={() => removeArrayItem('terminos', 'sections', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderArrayInput('Ícone', 'terminos', 'sections', idx, 'icon')}
                  {renderArrayInput('Título', 'terminos', 'sections', idx, 'title')}
                  <div className="col-span-2">
                     {renderArrayInput('Conteúdo', 'terminos', 'sections', idx, 'content', { rows: 3 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRIVACIDAD */}
        {activeSection === 'privacidad' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Página: Política de Privacidad</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Badge', 'privacidad', 'hero.badge')}
              {renderInput('Título', 'privacidad', 'hero.title')}
              {renderInput('Subtítulo', 'privacidad', 'hero.subtitle', { rows: 2 })}
            </div>
            <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
              {renderInput('Intro P1', 'privacidad', 'intro.p1', { rows: 2 })}
              {renderInput('Intro Brand', 'privacidad', 'intro.brand')}
              {renderInput('Intro P2', 'privacidad', 'intro.p2', { rows: 2 })}
              {renderInput('Intro P3', 'privacidad', 'intro.p3', { rows: 2 })}
            </div>
            <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
              {renderInput('Segurança Título', 'privacidad', 'security.title')}
              {renderInput('Segurança P1', 'privacidad', 'security.p1', { rows: 2 })}
              {renderInput('Segurança P2', 'privacidad', 'security.p2', { rows: 2 })}
            </div>
            <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
              {renderInput('Cookies Título', 'privacidad', 'cookies.title')}
              {renderInput('Cookies P1', 'privacidad', 'cookies.p1', { rows: 2 })}
              {renderInput('Cookies P2', 'privacidad', 'cookies.p2', { rows: 2 })}
            </div>
            <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
              {renderInput('Contato Título', 'privacidad', 'contact.title')}
              {renderInput('Contato Desc', 'privacidad', 'contact.desc', { rows: 2 })}
              {renderInput('Contato Email', 'privacidad', 'contact.email')}
              {renderInput('Contato Endereço', 'privacidad', 'contact.address')}
            </div>

            <div className="flex items-center justify-between mt-6">
              <h4 className="text-[10px] font-bold text-accent uppercase mb-2">Cláusulas</h4>
              <Button onClick={() => addArrayItem('privacidad', 'sections', { title: 'Nova Cláusula', content: '', icon: 'Shield' })} className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="h-3 w-3" /> ADICIONAR
              </Button>
            </div>
            {privSections.map((item: any, idx: number) => (
              <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-accent uppercase">Cláusula #{idx + 1}</span>
                  <button onClick={() => removeArrayItem('privacidad', 'sections', idx)} className="text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderArrayInput('Ícone', 'privacidad', 'sections', idx, 'icon')}
                  {renderArrayInput('Título', 'privacidad', 'sections', idx, 'title')}
                  <div className="col-span-2">
                     {renderArrayInput('Conteúdo', 'privacidad', 'sections', idx, 'content', { rows: 3 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BLOG */}
        {activeSection === 'blog' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Página: Blog</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderInput('Título da Página', 'blog', 'pageTitle')}
              {renderInput('Subtítulo da Página', 'blog', 'pageSubtitle', { rows: 3 })}
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
