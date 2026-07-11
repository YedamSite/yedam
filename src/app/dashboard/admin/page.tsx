'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings, Palette, Layers, Database, Users, Shield,
  CheckCircle2, Plus, Trash2, ArrowUp, ArrowDown, FileText, Mail, Info,
  TrendingUp, DollarSign, ShoppingCart, Tag, Percent, Globe, Key, BookOpen, Sparkles,
  Layout, PenTool, Grid3X3, Save
} from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { db } from '@/lib/db';
import SiteContentTab from '@/components/admin/SiteContentTab';
import CategoriesTab from '@/components/admin/CategoriesTab';
import BrandsTab from '@/components/admin/BrandsTab';
import ImageUpload from '@/components/ImageUpload';

export default function AdminDashboard() {
  const [activeSubTab, setActiveSubTab] = useState('visual');
  const { theme, updateTheme } = useTheme();

  // Color inputs state
  const [primaryColor, setPrimaryColor] = useState(theme.colors.primary);
  const [secondaryColor, setSecondaryColor] = useState(theme.colors.secondary);
  const [accentColor, setAccentColor] = useState(theme.colors.accent);
  const [bgColor, setBgColor] = useState(theme.colors.background);
  const [visualSaved, setVisualSaved] = useState(false);

  // Data States
  const [blocks, setBlocks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  // CRUD Product States
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodStock, setProdStock] = useState(10);
  const [prodCategory, setProdCategory] = useState('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
  const [prodSku, setProdSku] = useState('');
  const [prodHsCode, setProdHsCode] = useState('3304.99.90');
  const [prodWeight, setProdWeight] = useState(0.15);
  const [prodVolume, setProdVolume] = useState('50ml');
  const [prodDesc, setProdDesc] = useState('');
  const [prodDescEn, setProdDescEn] = useState('');
  const [prodImage, setProdImage] = useState('');

  // Coupons State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(0);

  // Newsletter Subscribers State
  const [subscribers, setSubscribers] = useState<any[]>([]);

  // Blog State
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostSlug, setNewPostSlug] = useState('');
  const [newPostSubtitle, setNewPostSubtitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostAuthor, setNewPostAuthor] = useState('');
  const [newPostSeoTitle, setNewPostSeoTitle] = useState('');
  const [newPostSeoDesc, setNewPostSeoDesc] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // SEO & Gateway Config State
  const [seoTitleSuffix, setSeoTitleSuffix] = useState('| Yedam K-Beauty');
  const [seoDescription, setSeoDescription] = useState('Cosméticos coreanos de alta performance seleccionados para tu rutina.');
  const [stripeKey, setStripeKey] = useState('pk_live_51M3c...');
  const [smtpServer, setSmtpServer] = useState('smtp.mailgun.org');
  const [smtpUser, setSmtpUser] = useState('no-reply@yedambeauty.com');
  const [configSaved, setConfigSaved] = useState(false);

  // Invoice Preview Modal
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any>(null);

  const loadData = () => {
    setBlocks(db.get('cms_blocks') || []);
    setProducts(db.get('products') || []);
    setCategories(db.get('categories') || []);
    setOrders(db.get('orders') || []);
    setEmailLogs(db.get('communication_logs') || []);
    setCoupons(db.get('coupons') || []);
    setBlogPosts(db.get('blog_posts') || []);
    setSubscribers(db.get('newsletter_subscribers') || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    updateTheme({
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        accentHover: accentColor,
        text: theme.colors.text,
        background: bgColor,
        card: theme.colors.card
      }
    });
    setVisualSaved(true);
    setTimeout(() => setVisualSaved(false), 3000);
  };

  // Reorder Blocks
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const updated = [...blocks];
    if (direction === 'up' && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === 'down' && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    setBlocks(updated);
    db.save('cms_blocks', updated);
  };

  // Toggle Block status
  const toggleBlockActive = (index: number) => {
    const updated = [...blocks];
    updated[index].active = !updated[index].active;
    setBlocks(updated);
    db.save('cms_blocks', updated);
  };

  // Product editing state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleEditProduct = (prod: any) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdPrice(prod.price);
    setProdStock(prod.stock);
    setProdCategory(prod.category_id);
    setProdSku(prod.sku);
    setProdHsCode(prod.hs_code);
    setProdWeight(prod.weight);
    setProdVolume(prod.volume);
    setProdDesc(prod.description);
    setProdDescEn(prod.description_en);
    setProdImage(prod.image || '');
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setProdName(''); setProdPrice(0); setProdStock(10); setProdCategory('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    setProdSku(''); setProdHsCode('3304.99.90'); setProdWeight(0.15); setProdVolume('50ml');
    setProdDesc(''); setProdDescEn(''); setProdImage('');
  };

  // Create/Update Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;

    const allProds = db.get('products');

    if (editingProductId) {
      const idx = allProds.findIndex((p: any) => p.id === editingProductId);
      if (idx !== -1) {
        allProds[idx] = {
          ...allProds[idx],
          name: prodName,
          sku: prodSku || allProds[idx].sku,
          price: Number(prodPrice),
          stock: Number(prodStock),
          category_id: prodCategory,
          hs_code: prodHsCode,
          weight: Number(prodWeight),
          volume: prodVolume,
          description: prodDesc,
          description_en: prodDescEn,
          image: prodImage || allProds[idx].image,
        };
        db.save('products', allProds);
        cancelEditProduct();
        loadData();
        return;
      }
    }

    const newProd = {
      id: crypto.randomUUID(),
      sku: prodSku || 'YD-' + Math.floor(Math.random() * 10000),
      name: prodName,
      slug: prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: prodDesc || 'Nuevo cosmético coreano importado.',
      description_en: prodDescEn || 'New imported Korean cosmetic product.',
      price: Number(prodPrice),
      stock: Number(prodStock),
      volume: prodVolume || '50ml',
      weight: Number(prodWeight || 0.15),
      hs_code: prodHsCode || '3304.99.90',
      status: 'active',
      brand_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      category_id: prodCategory,
      image: prodImage || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400'
    };

    allProds.push(newProd);
    db.save('products', allProds);
    setProdName('');
    setProdPrice(0);
    setProdStock(10);
    setProdSku('');
    setProdHsCode('3304.99.90');
    setProdWeight(0.15);
    setProdVolume('50ml');
    setProdDesc('');
    setProdDescEn('');
    setProdImage('');
    loadData();
  };

  const handleDeleteProduct = (id: string) => {
    const allProds = db.get('products');
    const filtered = allProds.filter((p: any) => p.id !== id);
    db.save('products', filtered);
    loadData();
  };

  // Stock Adjustment
  const handleAdjustStock = (id: string, delta: number) => {
    const allProds = db.get('products');
    const idx = allProds.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      allProds[idx].stock = Math.max(0, allProds[idx].stock + delta);
      db.save('products', allProds);
      loadData();
    }
  };

  // Create Coupon
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) return;
    const allCoupons = db.get('coupons') || [];
    const newC = {
      id: crypto.randomUUID(),
      code: newCouponCode.toUpperCase(),
      discount: Number(newCouponDiscount),
      type: 'fixed',
      status: 'active'
    };
    allCoupons.push(newC);
    db.save('coupons', allCoupons);
    setCoupons(allCoupons);
    setNewCouponCode('');
    setNewCouponDiscount(0);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const resetBlogForm = () => {
    setNewPostTitle('');
    setNewPostSlug('');
    setNewPostSubtitle('');
    setNewPostContent('');
    setNewPostImage('');
    setNewPostAuthor('');
    setNewPostSeoTitle('');
    setNewPostSeoDesc('');
    setEditingPostId(null);
  };

  // Create Blog Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle) return;
    const allPosts = db.get('blog_posts') || [];
    const slug = newPostSlug || generateSlug(newPostTitle);
    const now = new Date().toISOString().split('T')[0];
    if (editingPostId) {
      const idx = allPosts.findIndex((p: any) => p.id === editingPostId);
      if (idx !== -1) {
        allPosts[idx] = {
          ...allPosts[idx],
          title: newPostTitle,
          slug,
          subtitle: newPostSubtitle,
          content: newPostContent,
          image: newPostImage,
          author: newPostAuthor || 'Yedam Editor',
          seo_title: newPostSeoTitle,
          seo_description: newPostSeoDesc,
          updated_at: now,
        };
      }
    } else {
      allPosts.push({
        id: crypto.randomUUID(),
        title: newPostTitle,
        slug,
        subtitle: newPostSubtitle,
        content: newPostContent,
        image: newPostImage,
        author: newPostAuthor || 'Yedam Editor',
        seo_title: newPostSeoTitle,
        seo_description: newPostSeoDesc,
        status: 'draft',
        created_at: now,
      });
    }
    db.save('blog_posts', allPosts);
    setBlogPosts(db.get('blog_posts'));
    resetBlogForm();
  };

  const handleEditPost = (post: any) => {
    setNewPostTitle(post.title);
    setNewPostSlug(post.slug);
    setNewPostSubtitle(post.subtitle || '');
    setNewPostContent(post.content || '');
    setNewPostImage(post.image || '');
    setNewPostAuthor(post.author || '');
    setNewPostSeoTitle(post.seo_title || '');
    setNewPostSeoDesc(post.seo_description || '');
    setEditingPostId(post.id);
  };

  const handleDeletePost = (id: string) => {
    if (!confirm('¿Eliminar este artículo permanentemente?')) return;
    const allPosts = db.get('blog_posts') || [];
    db.save('blog_posts', allPosts.filter((p: any) => p.id !== id));
    setBlogPosts(db.get('blog_posts'));
  };

  const handlePublishToggle = (id: string, currentStatus: string) => {
    const allPosts = db.get('blog_posts') || [];
    const idx = allPosts.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      allPosts[idx].status = currentStatus === 'published' ? 'draft' : 'published';
      db.save('blog_posts', allPosts);
      setBlogPosts(db.get('blog_posts'));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full py-12 px-4 md:px-8">
        <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-8">
          <span className="p-3 bg-accent/10 rounded-2xl">
            <Settings className="h-6 w-6 text-accent" />
          </span>
          <div>
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">CMS & Sales Enterprise</span>
            <h1 className="font-heading text-3xl font-light text-white uppercase">Panel Administrativo Yedam</h1>
          </div>
        </div>

        {/* Tab Selection Area */}
        <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'visual', label: 'Estilo Visual', icon: Palette },
            { id: 'builder', label: 'Page Builder (Home)', icon: Layers },
            { id: 'sitecontent', label: 'Conteúdo do Site', icon: PenTool },
            { id: 'categories', label: 'Categorias', icon: Grid3X3 },
            { id: 'brands', label: 'Marcas', icon: Grid3X3 },
            { id: 'products', label: 'CRUD Productos & Stock', icon: Database },
            { id: 'orders', label: 'Pedidos & Invoices', icon: ShoppingCart },
            { id: 'suscripciones', label: 'Membresías Club', icon: Sparkles },
            { id: 'newsletter', label: 'Newsletter & Leads', icon: Mail },
            { id: 'coupons', label: 'Cupones & Promos', icon: Tag },
            { id: 'blog', label: 'Blog & Artículos', icon: BookOpen },
            { id: 'settings', label: 'APIs, SMTP & SEO', icon: Globe },
            { id: 'stats', label: 'Reportes Básicos', icon: TrendingUp },
            { id: 'emails', label: 'Transaccionales & Auditoría', icon: Mail }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all min-w-max ${
                  activeSubTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {/* TAB: SITE CONTENT */}
          {activeSubTab === 'sitecontent' && <SiteContentTab />}

          {/* TAB: CATEGORIES */}
          {activeSubTab === 'categories' && <CategoriesTab />}

          {/* TAB: BRANDS */}
          {activeSubTab === 'brands' && <BrandsTab />}

          {/* TAB: VISUAL STYLE */}
          {activeSubTab === 'visual' && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white uppercase tracking-wide border-b border-white/5 pb-4 mb-6">Colores e Identidad del E-Commerce</h2>
              
              {visualSaved && (
                <div className="bg-green-50/10 border border-green-50/20 text-green-400 text-xs rounded-xl p-3.5 mb-6">
                  ✓ ¡Cores de marca modificadas en tempo real a través de CSS variables!
                </div>
              )}

              <form onSubmit={handleSaveTheme} className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-muted-foreground">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-accent">Color de Fondo Primario</label>
                    <div className="flex gap-2">
                      <Input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-12 h-10 p-0 border border-white/10 cursor-pointer" />
                      <Input value={bgColor} onChange={e => setBgColor(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-accent">Color de Acento (Dorado/Glow)</label>
                    <div className="flex gap-2">
                      <Input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-12 h-10 p-0 border border-white/10 cursor-pointer" />
                      <Input value={accentColor} onChange={e => setAccentColor(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-accent">Color de Cabeceras y Paneles</label>
                    <div className="flex gap-2">
                      <Input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-12 h-10 p-0 border border-white/10 cursor-pointer" />
                      <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-accent">Color de Textos Principales</label>
                    <div className="flex gap-2">
                      <Input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-12 h-10 p-0 border border-white/10 cursor-pointer" />
                      <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} />
                    </div>
                  </div>

                  <Button type="submit" className="bg-accent hover:bg-accentHover text-background font-bold py-3 rounded-xl mt-4">
                    APLICAR NUEVOS COLORES
                  </Button>
                </div>

                <div className="border border-white/5 rounded-2xl p-6 bg-secondary/20 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-accent block mb-4">MOCK-UP PREVIEW</span>
                    <div className="border border-white/10 rounded-2xl p-6 shadow-xl" style={{ backgroundColor: bgColor }}>
                      <h4 className="font-heading text-lg font-bold" style={{ color: accentColor }}>YEDAM K-BEAUTY</h4>
                      <p className="text-xs leading-relaxed mt-2" style={{ color: secondaryColor }}>
                        Demostración del contraste de colores de marca y tipografías en el e-commerce internacional.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB: PAGE BUILDER */}
          {activeSubTab === 'builder' && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white uppercase tracking-wide border-b border-white/5 pb-4 mb-6">Page Builder - Secciones de la Homepage</h2>
              
              <div className="flex flex-col gap-4">
                {blocks.map((block, idx) => (
                  <div key={block.id} className="border border-white/5 rounded-xl p-4 bg-secondary/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => moveBlock(idx, 'up')} className="text-muted-foreground hover:text-accent"><ArrowUp className="h-4 w-4" /></button>
                        <button onClick={() => moveBlock(idx, 'down')} className="text-muted-foreground hover:text-accent"><ArrowDown className="h-4 w-4" /></button>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wide">{block.section_id} SECTION</h4>
                        <span className="text-[10px] text-muted-foreground uppercase">{block.block_type} Block • Orden: {idx + 1}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBlockActive(idx)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                        block.active
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {block.active ? 'Habilitado' : 'Deshabilitado'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CRUD PRODUCTS & STOCK CONTROL */}
          {activeSubTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Product Form */}
              <div className="bg-card border border-white/5 rounded-3xl p-6 shadow-xl h-fit">
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
                  <h3 className="font-heading text-xl font-light text-white">{editingProductId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                  {editingProductId && (
                    <button type="button" onClick={cancelEditProduct} className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase">✕ Cancelar</button>
                  )}
                </div>
                <form onSubmit={handleCreateProduct} className="flex flex-col gap-4 text-xs text-muted-foreground">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-accent">Nombre de Producto</label>
                    <Input required value={prodName} onChange={e => setProdName(e.target.value)} placeholder="Ej: Hydrating Emulsion" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Categoría</label>
                      <select
                        value={prodCategory}
                        onChange={e => setProdCategory(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">SKU</label>
                      <Input value={prodSku} onChange={e => setProdSku(e.target.value)} placeholder="Ej: YD-102" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Precio (USD)</label>
                      <Input required type="number" step="0.01" value={prodPrice || ''} onChange={e => setProdPrice(Number(e.target.value))} placeholder="0.00" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Stock Inicial</label>
                      <Input required type="number" value={prodStock} onChange={e => setProdStock(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Código HS</label>
                      <Input required value={prodHsCode} onChange={e => setProdHsCode(e.target.value)} placeholder="3304.99.90" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Peso (kg)</label>
                      <Input required type="number" step="0.01" value={prodWeight} onChange={e => setProdWeight(Number(e.target.value))} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Volumen</label>
                      <Input required value={prodVolume} onChange={e => setProdVolume(e.target.value)} placeholder="150ml" />
                    </div>
                  </div>
                  <ImageUpload
                    currentUrl={prodImage}
                    onUrlChange={setProdImage}
                    folder="products"
                    label="Imagem do Produto"
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-accent">Descripción (Español)</label>
                    <textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)} placeholder="Descripción en español..." className="flex min-h-[60px] w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-accent">Descripción (Inglés - Invoice)</label>
                    <textarea value={prodDescEn} onChange={e => setProdDescEn(e.target.value)} placeholder="English description for export invoices..." className="flex min-h-[60px] w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white" />
                  </div>
                  <Button type="submit" className="bg-accent hover:bg-accentHover text-background font-bold py-2.5 rounded-xl text-xs mt-2">
                    {editingProductId ? 'ATUALIZAR PRODUCTO' : 'CREAR PRODUCTO'}
                  </Button>
                </form>
              </div>

              {/* Product List & Stock Adjustments */}
              <div className="lg:col-span-2 bg-card border border-white/5 rounded-3xl p-6 shadow-xl">
                <h3 className="font-heading text-xl font-light text-white mb-6 border-b border-white/5 pb-3">Productos & Control de Inventario</h3>
                <div className="flex flex-col gap-3">
                  {products.map((prod) => (
                    <div key={prod.id} className="border border-white/5 rounded-xl p-4 bg-secondary/30 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">{prod.name}</h4>
                        <span className="text-[10px] text-muted-foreground uppercase">{prod.sku} • Código HS: {prod.hs_code}</span>
                      </div>
                      
                      {/* Interactive Stock adjustments */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-white/10 rounded-lg px-2 bg-black/40 h-8">
                          <button onClick={() => handleAdjustStock(prod.id, -5)} className="text-xs text-muted-foreground px-1.5 hover:text-white">-5</button>
                          <span className="text-xs text-white px-2 font-mono font-bold">Stock: {prod.stock}</span>
                          <button onClick={() => handleAdjustStock(prod.id, 5)} className="text-xs text-muted-foreground px-1.5 hover:text-white">+5</button>
                        </div>

                        <span className="text-sm font-bold text-accent font-heading">US$ {prod.price.toFixed(2)}</span>
                        <button
                          onClick={() => handleEditProduct(prod)}
                          className="text-accent hover:text-accentHover p-2 hover:bg-accent/5 rounded-lg transition-all"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/5 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORDERS & INVOICES */}
          {activeSubTab === 'orders' && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white border-b border-white/5 pb-4 mb-6">Gestión de Pedidos & Emisión de Commercial Invoice</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Orders list */}
                <div className="lg:col-span-2 flex flex-col gap-3">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <div key={order.id} className="border border-white/5 rounded-xl p-4 bg-secondary/30 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <h4 className="font-bold text-white">Pedido #{order.id.substring(0, 8)}</h4>
                          <p className="text-muted-foreground mt-0.5">Destinatario: {order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                          <p className="text-muted-foreground">País: {order.shipping_address.country} • Documento: {order.document_type.toUpperCase()} ({order.document_number})</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-accent">US$ {order.total_amount.toFixed(2)}</span>
                          <Button
                            size="sm"
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="bg-accent hover:bg-accentHover text-background font-bold text-[10px] h-8 px-3 rounded-lg"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            INVOICE PDF
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-muted-foreground py-8">
                      No hay pedidos registrados en el sistema.
                    </div>
                  )}
                </div>

                {/* Commercial Invoice Template Customizer */}
                <div className="border border-white/5 rounded-2xl p-6 bg-secondary/20 h-fit flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-white/5 pb-2">Configurador de Facturas (ES/EN)</h3>
                  
                  {selectedOrderForInvoice ? (
                    <div className="border border-white/10 bg-white p-4 rounded-xl text-black font-mono text-[9px] flex flex-col gap-2.5 shadow-xl leading-normal">
                      <div className="text-center font-bold text-xs border-b border-black pb-1.5 uppercase">
                        COMMERCIAL INVOICE
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[8px]">
                        <div>
                          <span className="font-bold block">EXPORTER:</span>
                          YEDAM BEAUTY S.L.<br />Calle Gran Vía 12, Madrid, España
                        </div>
                        <div>
                          <span className="font-bold block">IMPORTER:</span>
                          {selectedOrderForInvoice.shipping_address.first_name} {selectedOrderForInvoice.shipping_address.last_name}<br />
                          {selectedOrderForInvoice.shipping_address.street}, {selectedOrderForInvoice.shipping_address.city}, {selectedOrderForInvoice.shipping_address.country}
                        </div>
                      </div>
                      <div className="border-t border-b border-black py-1">
                        <div className="grid grid-cols-4 font-bold text-[8px]">
                          <span>PROD / HS CODE</span>
                          <span className="text-center">QTY</span>
                          <span className="text-right">PRICE</span>
                          <span className="text-right">TOTAL</span>
                        </div>
                        <div className="grid grid-cols-4 text-[7px] mt-1">
                          <span className="truncate">K-Beauty Skincare (3304.99.90)</span>
                          <span className="text-center">1</span>
                          <span className="text-right">US$ {selectedOrderForInvoice.subtotal.toFixed(2)}</span>
                          <span className="text-right">US$ {selectedOrderForInvoice.subtotal.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right font-bold text-[8px]">
                        <div>Subtotal: US$ {selectedOrderForInvoice.subtotal.toFixed(2)}</div>
                        <div>Shipping: US$ {selectedOrderForInvoice.shipping_amount.toFixed(2)}</div>
                        <div className="text-xs border-t border-dashed border-black pt-1 mt-1">Total: US$ {selectedOrderForInvoice.total_amount.toFixed(2)}</div>
                      </div>
                      <a href={selectedOrderForInvoice.commercial_invoice_url} target="_blank" rel="noreferrer" className="w-full">
                        <Button className="w-full bg-black hover:bg-black/80 text-white font-bold text-[9px] py-1.5 h-7 rounded mt-2">
                          DESCARGAR INVOICE PDF
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-muted-foreground py-8">
                      Selecciona un pedido para visualizar la Commercial Invoice en PDF de forma automática.
                    </div>
                  )}
                </div>

                {/* Shipping & Status Management */}
                {selectedOrderForInvoice && (
                  <div className="border border-white/5 rounded-2xl p-6 bg-secondary/20 h-fit flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-white/5 pb-2">Estado del Pedido & Despacho</h3>
                    
                    <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-accent">Estado del Pedido</label>
                        <select
                          value={selectedOrderForInvoice.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            const allOrders = db.get('orders');
                            const idx = allOrders.findIndex((o: any) => o.id === selectedOrderForInvoice.id);
                            if (idx !== -1) {
                              allOrders[idx].status = newStatus;
                              allOrders[idx].updated_at = new Date().toISOString();
                              db.save('orders', allOrders);
                              
                              const tracking = db.get('order_tracking') || [];
                              tracking.push({
                                id: crypto.randomUUID(),
                                order_id: selectedOrderForInvoice.id,
                                status: newStatus,
                                tracking_code: selectedOrderForInvoice.tracking_code || null,
                                carrier: selectedOrderForInvoice.carrier || null,
                                notes: `Estado actualizado por el administrador a ${newStatus.toUpperCase()}`,
                                updated_at: new Date().toISOString()
                              });
                              db.save('order_tracking', tracking);

                              const logs = db.get('communication_logs') || [];
                              logs.push({
                                id: crypto.randomUUID(),
                                order_id: selectedOrderForInvoice.id,
                                type: 'email',
                                status: 'sent',
                                recipient: 'cliente@example.com',
                                subject: `Estado del Pedido - Yedam K-Beauty`,
                                content: `Hola Jaque, tu pedido #${selectedOrderForInvoice.id.substring(0, 8)} ahora tiene el estado: ${newStatus.toUpperCase()}`,
                                created_at: new Date().toISOString()
                              });
                              db.save('communication_logs', logs);

                              setSelectedOrderForInvoice({ ...selectedOrderForInvoice, status: newStatus });
                              loadData();
                            }
                          }}
                          className="flex h-9 w-full rounded-md border border-white/10 bg-background px-3 py-1 text-xs text-white"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="payment_approved">Pago Aprobado</option>
                          <option value="preparing">Separación / Preparación</option>
                          <option value="shipped">Enviado / Shipped</option>
                          <option value="delivered">Entregado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1 mt-2">
                        <label className="text-[9px] uppercase font-bold text-accent">Transportadora / Carrier</label>
                        <Input
                          value={selectedOrderForInvoice.carrier || ''}
                          onChange={(e) => {
                            setSelectedOrderForInvoice({ ...selectedOrderForInvoice, carrier: e.target.value });
                          }}
                          placeholder="Ej: DHL Express, FedEx"
                          className="h-8 text-xs bg-black/30 border-white/10 text-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1 mt-2">
                        <label className="text-[9px] uppercase font-bold text-accent">Código de Rastreo</label>
                        <Input
                          value={selectedOrderForInvoice.tracking_code || ''}
                          onChange={(e) => {
                            setSelectedOrderForInvoice({ ...selectedOrderForInvoice, tracking_code: e.target.value });
                          }}
                          placeholder="Ej: LX123456789KR"
                          className="h-8 text-xs bg-black/30 border-white/10 text-white"
                        />
                      </div>

                      <Button
                        onClick={() => {
                          const allOrders = db.get('orders');
                          const idx = allOrders.findIndex((o: any) => o.id === selectedOrderForInvoice.id);
                          if (idx !== -1) {
                            allOrders[idx].carrier = selectedOrderForInvoice.carrier;
                            allOrders[idx].tracking_code = selectedOrderForInvoice.tracking_code;
                            allOrders[idx].updated_at = new Date().toISOString();
                            db.save('orders', allOrders);

                            const tracking = db.get('order_tracking') || [];
                            tracking.push({
                              id: crypto.randomUUID(),
                              order_id: selectedOrderForInvoice.id,
                              status: selectedOrderForInvoice.status,
                              tracking_code: selectedOrderForInvoice.tracking_code,
                              carrier: selectedOrderForInvoice.carrier,
                              notes: `Detalles de rastreo guardados: ${selectedOrderForInvoice.carrier} - ${selectedOrderForInvoice.tracking_code}`,
                              updated_at: new Date().toISOString()
                            });
                            db.save('order_tracking', tracking);

                            const logs = db.get('communication_logs') || [];
                            logs.push({
                              id: crypto.randomUUID(),
                              order_id: selectedOrderForInvoice.id,
                              type: 'email',
                              status: 'sent',
                              recipient: 'cliente@example.com',
                              subject: `Seguimiento de tu pedido - Yedam K-Beauty`,
                              content: `Hola Jaque, tu pedido #${selectedOrderForInvoice.id.substring(0, 8)} ha sido enviado vía ${selectedOrderForInvoice.carrier}. Número de seguimiento: ${selectedOrderForInvoice.tracking_code}`,
                              created_at: new Date().toISOString()
                            });
                            db.save('communication_logs', logs);

                            loadData();
                            alert('¡Detalles de envío actualizados y correo de seguimiento enviado!');
                          }
                        }}
                        className="bg-accent hover:bg-accentHover text-background font-bold py-2 rounded-xl text-xs mt-3"
                      >
                        GUARDAR DETALLES
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: COUPONS */}
          {activeSubTab === 'coupons' && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white border-b border-white/5 pb-4 mb-6">Gestión de Cupones de Descuento & Promociones</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coupon Form */}
                <div className="bg-secondary/30 border border-white/5 rounded-2xl p-6 h-fit text-xs text-muted-foreground flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider">Crear Nuevo Cupón</h3>
                  <form onSubmit={handleCreateCoupon} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Código del Cupón</label>
                      <Input required value={newCouponCode} onChange={e => setNewCouponCode(e.target.value)} placeholder="Ej: VERANO15" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Descuento (USD)</label>
                      <Input required type="number" value={newCouponDiscount || ''} onChange={e => setNewCouponDiscount(Number(e.target.value))} placeholder="0.00" />
                    </div>
                    <Button type="submit" className="bg-accent hover:bg-accentHover text-background font-bold py-2 rounded-xl text-xs">
                      AGREGAR CUPÓN
                    </Button>
                  </form>
                </div>

                {/* Coupons list */}
                <div className="lg:col-span-2 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Cupones de Descuento Activos</h3>
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="border border-white/5 rounded-xl p-4 bg-secondary/30 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <h4 className="font-bold text-white uppercase tracking-wider">{coupon.code}</h4>
                        <span className="text-[10px] text-muted-foreground">Descuento de US$ {coupon.discount.toFixed(2)} fijos en el checkout</span>
                      </div>
                      <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full uppercase font-bold">
                        {coupon.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: BLOG & ARTICLES CRUD */}
          {activeSubTab === 'blog' && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white border-b border-white/5 pb-4 mb-6">
                {editingPostId ? 'Editar Artículo' : 'Gestión del Blog Corporativo'}
              </h2>

              <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                {/* Form */}
                <div className="xl:col-span-2 bg-secondary/30 border border-white/5 rounded-2xl p-6 h-fit text-xs text-muted-foreground flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-accent uppercase tracking-wider">
                      {editingPostId ? '✏️ Editando' : '✍️ Nuevo Artículo'}
                    </h3>
                    {editingPostId && (
                      <button onClick={resetBlogForm} className="text-[9px] text-accent hover:underline uppercase tracking-wider">
                        + Nuevo
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Título *</label>
                      <Input required value={newPostTitle} onChange={e => {
                        setNewPostTitle(e.target.value);
                        if (!editingPostId) setNewPostSlug(generateSlug(e.target.value));
                      }} placeholder="Ej: Fórmulas de Centella Asiática" />
                    </div>

                    {/* Slug */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Slug (URL)</label>
                      <Input value={newPostSlug} onChange={e => setNewPostSlug(e.target.value)} placeholder="generado-automaticamente" />
                      {newPostSlug && (
                        <span className="text-[8px] text-foreground/40">URL: /blog/{newPostSlug}</span>
                      )}
                    </div>

                    {/* Subtitle */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Subtítulo</label>
                      <Input value={newPostSubtitle} onChange={e => setNewPostSubtitle(e.target.value)} placeholder="Breve descripción que aparece en la tarjeta" />
                    </div>

                    {/* Author */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Autor</label>
                      <Input value={newPostAuthor} onChange={e => setNewPostAuthor(e.target.value)} placeholder="Ej: Dr. Park" />
                    </div>

                    {/* Image Upload */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Imagen Destacada</label>
                      <ImageUpload currentUrl={newPostImage} onUrlChange={setNewPostImage} />
                    </div>

                    {/* Content (HTML textarea) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Contenido (HTML)</label>
                      <textarea
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                        rows={8}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-[11px] text-white font-mono placeholder-gray-500 outline-none focus:border-accent resize-y min-h-[150px]"
                        placeholder="<p>Escribe aquí el contenido del artículo...</p>"
                      />
                      <span className="text-[8px] text-foreground/40">Usa etiquetas HTML: &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;</span>
                    </div>

                    {/* SEO Meta Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">SEO Title (Meta Título)</label>
                      <Input value={newPostSeoTitle} onChange={e => setNewPostSeoTitle(e.target.value)} placeholder="Ej: 5 Secretos del Skincare Coreano | Yedam K-Beauty" />
                      {newPostSeoTitle && (
                        <div className="flex items-center gap-2 text-[8px]">
                          <span className={`font-bold ${newPostSeoTitle.length > 60 ? 'text-red-400' : 'text-green-400'}`}>
                            {newPostSeoTitle.length}/60
                          </span>
                          <span className="text-foreground/40">
                            {newPostSeoTitle.length > 60 ? '⚠️ El título SEO es demasiado largo (máx. 60 caracteres)' : '✅ Longitud ideal'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* SEO Meta Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">SEO Description (Meta Descripción)</label>
                      <textarea
                        value={newPostSeoDesc}
                        onChange={e => setNewPostSeoDesc(e.target.value)}
                        rows={3}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-[11px] text-white font-mono placeholder-gray-500 outline-none focus:border-accent resize-y min-h-[60px]"
                        placeholder="Descripción para buscadores (aparece en Google)..."
                      />
                      {newPostSeoDesc && (
                        <div className="flex items-center gap-2 text-[8px]">
                          <span className={`font-bold ${newPostSeoDesc.length > 160 ? 'text-red-400' : newPostSeoDesc.length > 120 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {newPostSeoDesc.length}/160
                          </span>
                          <span className="text-foreground/40">
                            {newPostSeoDesc.length === 0 ? '' :
                              newPostSeoDesc.length > 160 ? '⚠️ Muy largo (Google truncará)' :
                              newPostSeoDesc.length < 50 ? '⚠️ Muy corto' :
                              newPostSeoDesc.length > 120 ? '⚠️ Casi en el límite' :
                              '✅ Entre 50-120 caracteres (ideal)'
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    {/* SEO Preview */}
                    {(newPostSeoTitle || newPostSeoDesc) && (
                      <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                        <span className="text-[8px] font-bold text-accent uppercase tracking-widest block mb-2">📱 Vista previa Google</span>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-[10px] text-[#1a0dab] font-medium leading-tight hover:underline cursor-pointer truncate">
                            {newPostSeoTitle || 'Título SEO'}
                          </p>
                          <p className="text-[9px] text-[#006621] leading-tight truncate">
                            {`yedambeauty.com/blog/${newPostSlug || 'slug-del-articulo'}`}
                          </p>
                          <p className="text-[9px] text-[#545454] leading-snug mt-0.5 line-clamp-2">
                            {newPostSeoDesc || 'Descripción SEO del artículo...'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Professional SEO Tips */}
                    <div className="bg-accent/5 border border-accent/10 rounded-xl p-4">
                      <h4 className="text-[9px] font-bold text-accent uppercase tracking-widest mb-2">🔍 Consejos SEO Profesional</h4>
                      <ul className="text-[9px] text-foreground/60 flex flex-col gap-1 list-disc pl-4">
                        <li className={newPostSeoTitle && newPostSeoTitle.length <= 60 ? 'text-green-400' : ''}>
                          <strong>Título:</strong> Máx. 60 caracteres, incluye la palabra clave principal.
                        </li>
                        <li className={newPostSeoDesc && newPostSeoDesc.length >= 50 && newPostSeoDesc.length <= 160 ? 'text-green-400' : ''}>
                          <strong>Meta descripción:</strong> Entre 50-160 caracteres, incluye llamado a la acción.
                        </li>
                        <li><strong>Slug:</strong> Usa solo letras, números y guiones. Sin caracteres especiales.</li>
                        <li><strong>Imagen:</strong> Usa imágenes originales con texto alternativo descriptivo.</li>
                        <li><strong>Contenido:</strong> Artículos con más de 300 palabras tienen mejor ranking.</li>
                        <li><strong>Subtítulo:</strong> Debe contener la palabra clave de forma natural.</li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1 bg-accent hover:bg-accentHover text-background font-bold py-2.5 rounded-xl text-xs">
                        {editingPostId ? '💾 ACTUALIZAR ARTÍCULO' : '📝 GUARDAR ARTÍCULO'}
                      </Button>
                      {editingPostId && (
                        <Button type="button" variant="outline" onClick={resetBlogForm} className="border-white/10 text-white hover:bg-white/5 py-2.5 rounded-xl text-xs">
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </div>

                {/* List */}
                <div className="xl:col-span-3 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Artículos ({blogPosts.length})
                  </h3>
                  {blogPosts.length === 0 ? (
                    <div className="border border-dashed border-white/5 rounded-xl p-8 text-center text-[10px] text-foreground/40">
                      No hay artículos todavía. ¡Crea el primero!
                    </div>
                  ) : (
                    blogPosts.map((post) => (
                      <div key={post.id} className="border border-white/5 rounded-xl p-4 bg-secondary/30 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {post.image && (
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-secondary/50">
                              <Image src={post.image} alt={post.title} fill className="object-cover" unoptimized />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-white truncate">{post.title}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                              <span>✍️ {post.author || 'Anónimo'}</span>
                              <span>📅 {post.created_at}</span>
                              <button
                                onClick={() => handlePublishToggle(post.id, post.status)}
                                className={`font-bold ${post.status === 'published' ? 'text-green-400' : 'text-yellow-400'}`}
                              >
                                {post.status === 'published' ? '🟢 Publicado' : '🟡 Borrador'}
                              </button>
                            </div>
                            {post.slug && (
                              <span className="text-[8px] text-foreground/30 truncate block max-w-[200px]">
                                /blog/{post.slug}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleEditPost(post)} className="text-foreground/40 hover:text-accent p-2">
                            <FileText className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:text-red-400 p-2">
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SUSCRIPCIONES (CLUB YEDAM ADMIN) */}
          {/* TAB: NEWSLETTER SUBSCRIBERS */}
          {activeSubTab === 'newsletter' && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <h2 className="font-heading text-2xl font-light text-white">Newsletter & Leads de E-mail</h2>
                <button
                  onClick={() => {
                    const csv = [
                      ['E-mail', 'Nombre', 'Origen', 'Estado', 'Fecha de Registro'],
                      ...subscribers.map((s: any) => [s.email, s.name || '', s.source || 'website', s.status || 'active', s.created_at || ''])
                    ].map(row => row.join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `newsletter_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-[9px] bg-accent hover:bg-accentHover text-background font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <FileText className="h-4 w-4" />
                  EXPORTAR CSV
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Suscriptores', value: subscribers.length, icon: Users, color: 'text-accent' },
                  { label: 'Activos', value: subscribers.filter((s: any) => s.status === 'active').length, icon: CheckCircle2, color: 'text-green-400' },
                  { label: 'De la Homepage', value: subscribers.filter((s: any) => s.source === 'homepage').length, icon: Globe, color: 'text-blue-400' },
                  { label: 'De Experiencias', value: subscribers.filter((s: any) => s.source === 'experiencias').length, icon: Sparkles, color: 'text-purple-400' }
                ].map((stat, idx) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={idx} className="bg-secondary/30 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                      <StatIcon className={`h-6 w-6 ${stat.color}`} />
                      <div>
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Search / Filter */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar por e-mail..."
                  className="w-full max-w-xs bg-black/30 border border-white/10 rounded-xl py-2 px-4 text-xs text-white placeholder-gray-500 outline-none focus:border-accent"
                  onChange={e => {
                    const q = e.target.value.toLowerCase();
                    const all = db.get('newsletter_subscribers') || [];
                    setSubscribers(q ? all.filter((s: any) => s.email.toLowerCase().includes(q)) : all);
                  }}
                />
              </div>

              {/* Subscribers Table */}
              {subscribers.length === 0 ? (
                <div className="border border-dashed border-white/5 rounded-xl p-12 text-center">
                  <Mail className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-xs text-foreground/40">Nenhum inscrito na newsletter ainda.</p>
                  <p className="text-[9px] text-foreground/30 mt-1">Os e-mails serão registrados automaticamente quando alguém se inscrever no site.</p>
                </div>
              ) : (
                <div className="border border-white/5 rounded-2xl overflow-hidden bg-secondary/10 text-xs">
                  <div className="grid grid-cols-5 p-3 bg-secondary/30 font-bold border-b border-white/5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span className="col-span-2">E-mail</span>
                    <span>Origen</span>
                    <span>Fecha</span>
                    <span className="text-right">Acción</span>
                  </div>
                  {subscribers.map((sub: any) => (
                    <div key={sub.id} className="grid grid-cols-5 p-3 border-b border-white/5 last:border-0 items-center hover:bg-white/5 transition-colors">
                      <div className="col-span-2 flex flex-col">
                        <span className="font-bold text-white truncate">{sub.email}</span>
                        {sub.name && <span className="text-[9px] text-muted-foreground">{sub.name}</span>}
                      </div>
                      <span>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          sub.source === 'homepage' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                          {sub.source === 'homepage' ? 'Homepage' : 'Experiencias'}
                        </span>
                      </span>
                      <span className="text-muted-foreground">{sub.created_at || '-'}</span>
                      <span className="text-right">
                        <button
                          onClick={() => {
                            if (!confirm(`¿Eliminar a ${sub.email} de la lista?`)) return;
                            const all = db.get('newsletter_subscribers') || [];
                            db.save('newsletter_subscribers', all.filter((s: any) => s.id !== sub.id));
                            setSubscribers(db.get('newsletter_subscribers') || []);
                          }}
                          className="text-red-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/5 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Info Box */}
              <div className="mt-6 bg-accent/5 border border-accent/10 rounded-xl p-4">
                <h4 className="text-[9px] font-bold text-accent uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  Información de Suscripción
                </h4>
                <ul className="text-[9px] text-foreground/60 flex flex-col gap-1 list-disc pl-4">
                  <li>Los suscriptores se registran automáticamente desde los formularios de la Homepage y la página de Experiencias.</li>
                  <li>Los datos persisten en localStorage y se sincronizan con todos los dispositivos.</li>
                  <li>Puedes exportar la lista completa a CSV para usar en campañas de e-mail marketing.</li>
                  <li>Usa los datos de SMTP configurados en la pestaña "APIs, SMTP & SEO" para enviar newsletters.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB: MEMBRESÍAS CLUB */}
          {activeSubTab === 'suscripciones' && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
              <div>
                <h2 className="font-heading text-2xl font-light text-white uppercase tracking-wide border-b border-white/5 pb-4 mb-6">Membresías del Club Yedam</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Plans List */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Planes Disponibles</h3>
                  {[
                    { name: 'Box Standard', price: 19.90, subscribers: 12 },
                    { name: 'Box Premium', price: 29.90, subscribers: 35 },
                    { name: 'Box Deluxe', price: 39.90, subscribers: 18 }
                  ].map((plan, idx) => (
                    <div key={idx} className="border border-white/5 rounded-xl p-4 bg-secondary/30 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white uppercase">{plan.name}</span>
                        <span className="font-heading font-bold text-accent">US$ {plan.price.toFixed(2)}/mes</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{plan.subscribers} suscriptores activos</span>
                    </div>
                  ))}
                </div>

                {/* Subscribers List */}
                <div className="lg:col-span-2 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Suscriptores Activos</h3>
                  <div className="border border-white/5 rounded-2xl overflow-hidden bg-secondary/10 text-xs">
                    <div className="grid grid-cols-4 p-3 bg-secondary/30 font-bold border-b border-white/5">
                      <span>Cliente</span>
                      <span>Plan Activo</span>
                      <span>Próximo Pago</span>
                      <span className="text-right">Estado</span>
                    </div>
                    {[
                      { name: 'Jaque Customer', email: 'cliente@example.com', plan: 'Premium Box', next: '2026-08-11', status: 'activa' },
                      { name: 'Maria Rodriguez', email: 'maria@example.com', plan: 'Standard Box', next: '2026-07-28', status: 'activa' },
                      { name: 'Sofia Fernandez', email: 'sofia@example.com', plan: 'Deluxe Box', next: '2026-08-01', status: 'cancelada' }
                    ].map((sub, idx) => (
                      <div key={idx} className="grid grid-cols-4 p-3 border-b border-white/5 last:border-0 items-center">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{sub.name}</span>
                          <span className="text-[9px] text-muted-foreground">{sub.email}</span>
                        </div>
                        <span className="text-muted-foreground">{sub.plan}</span>
                        <span className="text-muted-foreground">{sub.next}</span>
                        <span className="text-right">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            sub.status === 'activa' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {sub.status}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GENERAL SETTINGS, SMTP & SEO */}
          {activeSubTab === 'settings' && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white border-b border-white/5 pb-4 mb-6">Configuración del Sistema, SMTP & SEO</h2>
              
              {configSaved && (
                <div className="bg-green-50/10 border border-green-50/20 text-green-400 text-xs rounded-xl p-3.5 mb-6">
                  ✓ ¡Configuraciones generales de APIs, SMTP y SEO guardadas con éxito!
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                const settings = db.get('system_settings');
                settings.seo = { titleSuffix: seoTitleSuffix, metaDescription: seoDescription, googleAnalyticsId: settings.seo?.googleAnalyticsId || '' };
                settings.smtp = { server: smtpServer, email: smtpUser, user: smtpUser };
                settings.payments = { stripePublicKey: stripeKey };
                db.save('system_settings', settings);
                setConfigSaved(true);
                setTimeout(() => setConfigSaved(false), 3000);
              }} className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-muted-foreground">
                <div className="flex flex-col gap-5">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Globe className="h-4.5 w-4.5" />
                    SEO Global Config
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-white">Sufijo de Títulos SEO</label>
                    <Input value={seoTitleSuffix} onChange={e => setSeoTitleSuffix(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-white">Meta Descripción General</label>
                    <Input value={seoDescription} onChange={e => setSeoDescription(e.target.value)} />
                  </div>

                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2 mt-4">
                    <Mail className="h-4.5 w-4.5" />
                    SMTP Email Transaccional
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-white">Servidor SMTP Host</label>
                    <Input value={smtpServer} onChange={e => setSmtpServer(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-white">E-mail de salida SMTP</label>
                    <Input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} />
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Key className="h-4.5 w-4.5" />
                    Pasarelas de Pago & Integraciones APIs
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-white">Stripe Public Key</label>
                    <Input value={stripeKey} onChange={e => setStripeKey(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-white">Google Analytics Tracking ID</label>
                    <Input placeholder="G-XXXXXXXXXX" />
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-white/5 flex flex-col gap-2">
                    <Button type="submit" className="bg-accent hover:bg-accentHover text-background font-bold py-2.5 rounded-xl">
                      GUARDAR CONFIGURACIONES
                    </Button>
                    <Button variant="outline" type="button" onClick={() => alert('¡Generando backup completo del JSON DbState!')} className="border-white/10 text-white hover:bg-white/5 py-2.5 rounded-xl">
                      DESCARGAR COPIA DE SEGURIDAD (BACKUP)
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB: SALES REPORTS */}
          {activeSubTab === 'stats' && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white border-b border-white/5 pb-4 mb-6">Reportes de Vendas e Inventário</h2>
              
              {(() => {
                const allOrders = db.get('orders') || [];
                const allProducts = db.get('products') || [];
                const totalBilled = allOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
                const avgTicket = allOrders.length > 0 ? totalBilled / allOrders.length : 0;
                const totalStock = allProducts.reduce((sum: number, p: any) => sum + (p.stock || 0), 0);
                const totalProducts = allProducts.length;
                const pendingOrders = allOrders.filter((o: any) => o.status === 'pending' || o.status === 'preparing').length;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="border border-white/5 bg-secondary/20 rounded-2xl p-6 shadow-sm">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Faturado Total</span>
                      <h3 className="font-heading text-3xl font-bold text-accent mt-2">US$ {totalBilled.toFixed(2)}</h3>
                      <p className="text-[10px] text-green-500 mt-2 font-semibold">{allOrders.length} pedidos realizados</p>
                    </div>
                    <div className="border border-white/5 bg-secondary/20 rounded-2xl p-6 shadow-sm">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Ticket Medio</span>
                      <h3 className="font-heading text-3xl font-bold text-white mt-2">US$ {avgTicket.toFixed(2)}</h3>
                      <p className="text-[10px] text-accent mt-2 font-semibold">Valor médio por pedido</p>
                    </div>
                    <div className="border border-white/5 bg-secondary/20 rounded-2xl p-6 shadow-sm">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Produtos em Estoque</span>
                      <h3 className="font-heading text-3xl font-bold text-white mt-2">{totalStock} un.</h3>
                      <p className="text-[10px] text-accent mt-2 font-semibold">{totalProducts} produtos cadastrados</p>
                    </div>
                    <div className="border border-white/5 bg-secondary/20 rounded-2xl p-6 shadow-sm">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Pedidos Pendentes</span>
                      <h3 className="font-heading text-3xl font-bold text-white mt-2">{pendingOrders}</h3>
                      <p className="text-[10px] text-yellow-500 mt-2 font-semibold">Aguardando processamento</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB: TRANSACCIONALES & AUDITORIA */}
          {activeSubTab === 'emails' && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white border-b border-white/5 pb-4 mb-6">Logs de Correos Transaccionales</h2>
              <div className="flex flex-col gap-4">
                {emailLogs.map((log) => (
                  <div key={log.id} className="border border-white/5 rounded-2xl p-4 bg-secondary/30 text-xs">
                    <div className="flex justify-between items-center text-[10px] text-accent font-bold uppercase tracking-wider mb-2">
                      <span>Destinatario: {log.recipient}</span>
                      <span>{new Date(log.created_at).toLocaleString('es-ES')}</span>
                    </div>
                    <h4 className="font-bold text-white mb-1">{log.subject}</h4>
                    <p className="text-muted-foreground">{log.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
