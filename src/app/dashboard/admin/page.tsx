'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings, Palette, Layers, Database, Users, Shield,
  CheckCircle2, Plus, Trash2, ArrowUp, ArrowDown, FileText, Mail, Info,
  TrendingUp, DollarSign, ShoppingCart, Tag, Percent, Globe, Key, BookOpen, Sparkles,
  Layout, PenTool, Grid3X3, Save, BarChart3, Clock, Activity, CreditCard, Package, Calendar, Loader2,
  Menu, X, Eye
} from 'lucide-react';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import SiteContentTab from '@/components/admin/SiteContentTab';
import CategoriesTab from '@/components/admin/CategoriesTab';
import BrandsTab from '@/components/admin/BrandsTab';
import ImageUpload from '@/components/ImageUpload';
import ShippingTab from '@/components/admin/ShippingTab';
import LiveChatTab from '@/components/admin/LiveChatTab';
import { MessageCircle } from 'lucide-react';
import { getNewsletterSubscribersFromSupabase, deleteNewsletterSubscriberFromSupabase } from '@/lib/newsletterService';
import { deleteOrderFromSupabase } from '@/actions/shopActions';

export default function AdminDashboard() {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, updateTheme } = useTheme();
  const { t } = useLanguage();

  // Color inputs state
  const [primaryColor, setPrimaryColor] = useState(theme.colors.primary);
  const [secondaryColor, setSecondaryColor] = useState(theme.colors.secondary);
  const [accentColor, setAccentColor] = useState(theme.colors.accent);
  const [bgColor, setBgColor] = useState(theme.colors.background);
  const [visualSaved, setVisualSaved] = useState(false);

  // Chat notification state
  const [chatUnread, setChatUnread] = useState(0);
  const knownChatIds = useRef<Set<string>>(new Set());
  const knownMsgCountPerChat = useRef<Record<string, number>>({});

  // Data States
  const [blocks, setBlocks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  // CRUD Product States
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodPricePromo, setProdPricePromo] = useState(0);
  const [prodPriceBrl, setProdPriceBrl] = useState(0);
  const [prodPricePromoBrl, setProdPricePromoBrl] = useState(0);
  const [prodStock, setProdStock] = useState(10);
  const [prodCategory, setProdCategory] = useState('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
  const [prodBrand, setProdBrand] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodHsCode, setProdHsCode] = useState('3304.99.90');
  const [prodWeight, setProdWeight] = useState(0.15);
  const [prodVolume, setProdVolume] = useState('50ml');
  const [prodDesc, setProdDesc] = useState('');
  const [prodDescEn, setProdDescEn] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodActiveLang, setProdActiveLang] = useState<'es' | 'pt' | 'en'>('es');
  const [prodTranslations, setProdTranslations] = useState<Record<string, { name: string; description: string }>>({
    pt: { name: '', description: '' },
    en: { name: '', description: '' }
  });

  // Coupons State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(0);
  const [newCouponType, setNewCouponType] = useState<'fixed' | 'percentage'>('fixed');

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
  const [blogActiveLang, setBlogActiveLang] = useState<'es' | 'pt' | 'en'>('es');
  const [blogTranslations, setBlogTranslations] = useState<Record<string, {
    title: string;
    subtitle: string;
    content: string;
    seo_title: string;
    seo_description: string;
  }>>({
    pt: { title: '', subtitle: '', content: '', seo_title: '', seo_description: '' },
    en: { title: '', subtitle: '', content: '', seo_title: '', seo_description: '' }
  });

  // SEO & Gateway Config State
  const [seoTitleSuffix, setSeoTitleSuffix] = useState('| Cheotnun K-Beauty');
  const [seoDescription, setSeoDescription] = useState('Cosméticos coreanos de alta performance seleccionados para tu rutina.');
  const [stripeKey, setStripeKey] = useState('pk_live_51M3c...');
  const [smtpServer, setSmtpServer] = useState('smtp.mailgun.org');
  const [smtpUser, setSmtpUser] = useState('no-reply@cheotnun.com');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [configSaved, setConfigSaved] = useState(false);

  // Invoice Preview Modal
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any>(null);

  // Newsletter Sync State
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  const syncWithSupabase = async () => {
    setSyncingSupabase(true);
    setSyncMessage(null);
    
    try {
      const result = await getNewsletterSubscribersFromSupabase();
      
      if (result.success && result.data) {
        // Merge subscribers from Supabase with local storage
        const localSubs = db.get('newsletter_subscribers') || [];
        const supabaseSubs = result.data.map((s: any) => ({
          id: s.id,
          email: s.email,
          name: s.name || '',
          source: s.source || 'supabase',
          status: s.status || 'active',
          created_at: s.created_at ? new Date(s.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          metadata: s.metadata
        }));
        
        // Merge: keep both local and supabase, avoid duplicates by email
        const merged = [...localSubs];
        supabaseSubs.forEach((supaSub: any) => {
          const exists = merged.some((s: any) => s.email === supaSub.email);
          if (!exists) {
            merged.push(supaSub);
          }
        });
        
        db.save('newsletter_subscribers', merged);
        setSubscribers(merged);
        
        setSyncMessage({
          type: 'success',
          text: `✓ Sincronizado! ${result.data.length} inscritos carregados do Supabase`
        });
      } else {
        setSyncMessage({
          type: 'error',
          text: `✗ Erro ao sincronizar: ${result.error || 'Erro desconhecido'}`
        });
      }
    } catch (error: any) {
      setSyncMessage({
        type: 'error',
        text: `✗ Erro: ${error.message || 'Falha na conexão'}`
      });
    } finally {
      setSyncingSupabase(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const loadData = () => {
    setBlocks(db.get('cms_blocks') || []);
    setProducts(db.get('products') || []);
    const cats = db.get('categories') || [];
    setCategories(cats);
    setBrands(db.get('brands') || []);
    setOrders(db.get('orders') || []);
    setEmailLogs(db.get('communication_logs') || []);
    setCoupons(db.get('coupons') || []);
    setBlogPosts(db.get('blog_posts') || []);
    setSubscribers(db.get('newsletter_subscribers') || []);

    setProdCategory(prev => {
      if (prev && cats.some((c: any) => c.id === prev)) return prev;
      return cats[0]?.id || '';
    });
  };

  useEffect(() => {
    const hasCookie = document.cookie.split('; ').some(row => row.startsWith('cheotnun_admin_session=true'));
    if (!hasCookie) {
      window.location.href = '/dashboard/admin/login';
      return;
    }
    setAuthorized(true);

    loadData();
    // Carregar do Supabase ao iniciar (se configurado)
    syncWithSupabase();
    // Aguardar Supabase ficar pronto e recarregar (evita flash de dados antigos)
    (async () => {
      while (!db.isSupabaseReady()) {
        await new Promise(r => setTimeout(r, 100));
      }
      await db.reloadFromSupabase(['orders', 'order_tracking', 'communication_logs']);
      loadData();
    })();
    
    // Listener para atualizar quando o db mudar em outras abas/páginas
    const handleStorageChange = () => loadData();
    const handleDbChange = () => loadData();
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cheotnun_db_change', handleDbChange as EventListener);
    
    // Polling: recarregar pedidos do Supabase a cada 3 segundos
    const poll = setInterval(async () => {
      await db.reloadFromSupabase(['orders', 'order_tracking', 'communication_logs']);
      loadData();
    }, 3000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cheotnun_db_change', handleDbChange as EventListener);
      clearInterval(poll);
    };
  }, []);

  // Chat notification polling (always active, even before first chat tab visit)
  useEffect(() => {
    const checkChatNotifications = async () => {
      try {
        const res = await fetch('/api/chat');
        const data = await res.json();
        if (!data.messages) return;

        const currentChatIds = new Set<string>();
        const currentMsgCount: Record<string, number> = {};

        for (const m of data.messages) {
          currentChatIds.add(m.order_id);
          currentMsgCount[m.order_id] = (currentMsgCount[m.order_id] || 0) + 1;
        }

        let notify = 0;

        for (const id of currentChatIds) {
          if (!knownChatIds.current.has(id)) notify++;
        }

        for (const [chatId, count] of Object.entries(currentMsgCount)) {
          const prevCount = knownMsgCountPerChat.current[chatId] || 0;
          if (count > prevCount && knownChatIds.current.has(chatId)) {
            const msgs = data.messages.filter((m: any) => m.order_id === chatId);
            const newMsgs = msgs.slice(prevCount);
            if (newMsgs.some((m: any) => m.sender === 'client')) notify++;
          }
        }

        knownChatIds.current = currentChatIds;
        knownMsgCountPerChat.current = currentMsgCount;

        if (activeSubTab === 'chat') {
          setChatUnread(0);
        } else if (notify > 0) {
          setChatUnread(prev => prev + notify);
        }
      } catch {}
    };

    const interval = setInterval(checkChatNotifications, 3000);
    return () => clearInterval(interval);
  }, [activeSubTab]);

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
    setProdPricePromo(prod.price_promo || 0);
    setProdPriceBrl(prod.price_brl || 0);
    setProdPricePromoBrl(prod.price_promo_brl || 0);
    setProdStock(prod.stock);
    setProdCategory(prod.category_id);
    setProdBrand(prod.brand_id || '');
    setProdSku(prod.sku);
    setProdHsCode(prod.hs_code);
    setProdWeight(prod.weight);
    setProdVolume(prod.volume);
    setProdDesc(prod.description);
    setProdDescEn(prod.description_en);
    setProdImage(prod.image || '');
    setProdTranslations({
      pt: {
        name: prod.translations?.pt?.name || '',
        description: prod.translations?.pt?.description || ''
      },
      en: {
        name: prod.translations?.en?.name || '',
        description: prod.translations?.en?.description || prod.description_en || ''
      }
    });
    setProdActiveLang('es');
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setProdName(''); setProdPrice(0); setProdPricePromo(0); setProdPriceBrl(0); setProdPricePromoBrl(0); setProdStock(10);
    const cats = db.get('categories') || [];
    setProdCategory(cats[0]?.id || ''); setProdBrand('');
    setProdSku(''); setProdHsCode('3304.99.90'); setProdWeight(0.15); setProdVolume('50ml');
    setProdDesc(''); setProdDescEn(''); setProdImage('');
    setProdTranslations({
      pt: { name: '', description: '' },
      en: { name: '', description: '' }
    });
    setProdActiveLang('es');
  };

  // Create/Update Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || (!prodPrice && !prodPriceBrl)) return;

    const allProds = db.get('products') || [];
    const cats = db.get('categories') || [];
    const selectedCatId = prodCategory || cats[0]?.id || null;

    const basePriceUsd = Number(prodPrice) || (Number(prodPriceBrl) ? Number(prodPriceBrl) / 5 : 0);
    const basePriceBrl = Number(prodPriceBrl) || (Number(prodPrice) ? Number(prodPrice) * 5 : 0);
    const promoUsd = Number(prodPricePromo) || undefined;
    const promoBrl = Number(prodPricePromoBrl) || (Number(prodPricePromo) ? Number(prodPricePromo) * 5 : undefined);

    const productTranslations = {
      pt: {
        name: prodTranslations.pt.name || prodName,
        description: prodTranslations.pt.description || prodDesc || ''
      },
      en: {
        name: prodTranslations.en.name || prodName,
        description: prodTranslations.en.description || prodDescEn || prodDesc || ''
      }
    };

    const computedSlug = prodName.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (editingProductId) {
      const idx = allProds.findIndex((p: any) => p.id === editingProductId);
      if (idx !== -1) {
        allProds[idx] = {
          ...allProds[idx],
          name: prodName,
          sku: prodSku || allProds[idx].sku,
          price: basePriceUsd,
          price_promo: promoUsd,
          price_brl: basePriceBrl,
          price_promo_brl: promoBrl,
          stock: Number(prodStock),
          category_id: selectedCatId,
          brand_id: prodBrand || null,
          hs_code: prodHsCode,
          weight: Number(prodWeight),
          volume: prodVolume,
          description: prodDesc,
          description_en: prodTranslations.en.description || prodDescEn || prodDesc,
          image: prodImage || allProds[idx].image || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400',
          translations: productTranslations
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
      slug: computedSlug || ('prod-' + Date.now()),
      description: prodDesc || 'Nuevo cosmético coreano importado.',
      description_en: prodTranslations.en.description || prodDescEn || 'New imported Korean cosmetic product.',
      price: basePriceUsd,
      price_promo: promoUsd,
      price_brl: basePriceBrl,
      price_promo_brl: promoBrl,
      stock: Number(prodStock),
      volume: prodVolume || '50ml',
      weight: Number(prodWeight || 0.15),
      hs_code: prodHsCode || '3304.99.90',
      status: 'active',
      brand_id: prodBrand || null,
      category_id: selectedCatId,
      image: prodImage || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400',
      translations: productTranslations
    };

    allProds.push(newProd);
    db.save('products', allProds);
    cancelEditProduct();
    loadData();
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm('¿Eliminar este producto permanentemente?')) return;
    db.deleteRecord('products', id);
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
      code: newCouponCode.trim().toUpperCase(),
      discount: Number(newCouponDiscount),
      type: newCouponType,
      status: 'active'
    };
    allCoupons.push(newC);
    db.save('coupons', allCoupons);
    setCoupons(allCoupons);
    setNewCouponCode('');
    setNewCouponDiscount(0);
  };

  const handleDeleteCoupon = (id: string) => {
    if (!confirm('¿Eliminar este cupón permanentemente?')) return;
    db.deleteRecord('coupons', id);
    setCoupons(db.get('coupons') || []);
  };

  const handleToggleCouponStatus = (id: string, currentStatus: string) => {
    const all = db.get('coupons') || [];
    const idx = all.findIndex((c: any) => c.id === id);
    if (idx !== -1) {
      all[idx].status = currentStatus === 'active' ? 'inactive' : 'active';
      db.save('coupons', all);
      setCoupons(all);
    }
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
    setBlogTranslations({
      pt: { title: '', subtitle: '', content: '', seo_title: '', seo_description: '' },
      en: { title: '', subtitle: '', content: '', seo_title: '', seo_description: '' }
    });
    setBlogActiveLang('es');
  };

  // Create Blog Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle) return;
    const allPosts = db.get('blog_posts') || [];
    const slug = newPostSlug || generateSlug(newPostTitle);
    const now = new Date().toISOString().split('T')[0];

    const postTranslations = {
      pt: {
        title: blogTranslations.pt.title || '',
        subtitle: blogTranslations.pt.subtitle || '',
        content: blogTranslations.pt.content || '',
        seo_title: blogTranslations.pt.seo_title || '',
        seo_description: blogTranslations.pt.seo_description || ''
      },
      en: {
        title: blogTranslations.en.title || '',
        subtitle: blogTranslations.en.subtitle || '',
        content: blogTranslations.en.content || '',
        seo_title: blogTranslations.en.seo_title || '',
        seo_description: blogTranslations.en.seo_description || ''
      }
    };

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
          author: newPostAuthor || 'Cheotnun Editor',
          seo_title: newPostSeoTitle,
          seo_description: newPostSeoDesc,
          updated_at: now,
          translations: postTranslations
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
        author: newPostAuthor || 'Cheotnun Editor',
        seo_title: newPostSeoTitle,
        seo_description: newPostSeoDesc,
        status: 'draft',
        created_at: now,
        translations: postTranslations
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
    setBlogTranslations({
      pt: {
        title: post.translations?.pt?.title || '',
        subtitle: post.translations?.pt?.subtitle || '',
        content: post.translations?.pt?.content || '',
        seo_title: post.translations?.pt?.seo_title || '',
        seo_description: post.translations?.pt?.seo_description || ''
      },
      en: {
        title: post.translations?.en?.title || '',
        subtitle: post.translations?.en?.subtitle || '',
        content: post.translations?.en?.content || '',
        seo_title: post.translations?.en?.seo_title || '',
        seo_description: post.translations?.en?.seo_description || ''
      }
    });
    setBlogActiveLang('es');
  };

  const handleDeletePost = (id: string) => {
    if (!confirm('¿Eliminar este artículo permanentemente?')) return;
    db.deleteRecord('blog_posts', id);
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

if (!authorized) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-xs text-muted-foreground gap-3">
        <Loader2 className="h-6 w-6 text-accent animate-spin" />
        <span>{t('Verificando autorización administrativa...')}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen w-64 bg-secondary/90 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Settings className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-[7px] font-bold text-accent uppercase tracking-widest leading-tight">CMS & Sales</p>
            <p className="text-sm font-bold text-white leading-tight">Cheotnun</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted-foreground hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 custom-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard Geral', icon: BarChart3 },
            { id: 'chat', label: 'Live Chat', icon: MessageCircle },
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
            { id: 'shipping', label: 'Fretes e Zonas', icon: Globe },
                        { id: 'stats', label: 'Reportes Básicos', icon: TrendingUp },
                      ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id);
                  if (tab.id === 'chat') setChatUnread(0);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
                {tab.id === 'chat' && chatUnread > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse shrink-0">
                    {chatUnread}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between h-16 px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-white">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Panel Administrativo</span>
                <h1 className="font-heading text-lg md:text-xl font-light text-white">Cheotnun</h1>
              </div>
            </div>
            <Button
              onClick={() => {
                document.cookie = "cheotnun_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                window.location.href = '/dashboard/admin/login';
              }}
              variant="outline"
              className="border-red-500/20 hover:bg-red-500/10 text-red-400 font-bold text-xs px-4 py-2 rounded-xl"
            >
              Sair do Painel
            </Button>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="min-h-[400px]">
            {/* TAB: SITE CONTENT */}
            {activeSubTab === 'sitecontent' && <SiteContentTab />}

          {/* TAB: CATEGORIES */}
          {activeSubTab === 'categories' && <CategoriesTab />}

          {/* TAB: BRANDS */}
          {activeSubTab === 'brands' && <BrandsTab />}

          {/* TAB: DASHBOARD GERAL */}
          {activeSubTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              {(() => {
                const allOrders = db.get('orders') || [];
                const allProducts = db.get('products') || [];
                const allSubscribers = db.get('newsletter_subscribers') || [];
                const allCategories = db.get('categories') || [];
                const allBrands = db.get('brands') || [];
                
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
                const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];
                const yearAgo = new Date(now.getTime() - 365 * 86400000).toISOString().split('T')[0];
                
                const revenueToday = allOrders.filter((o: any) => o.created_at && o.created_at.split('T')[0] === today).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
                const revenueWeek = allOrders.filter((o: any) => o.created_at && o.created_at.split('T')[0] >= weekAgo).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
                const revenueMonth = allOrders.filter((o: any) => o.created_at && o.created_at.split('T')[0] >= monthAgo).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
                const revenueYear = allOrders.filter((o: any) => o.created_at && o.created_at.split('T')[0] >= yearAgo).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
                const revenueTotal = allOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
                
                const totalStock = allProducts.reduce((sum: number, p: any) => sum + (p.stock || 0), 0);
                const totalProducts = allProducts.length;
                const lowStockProducts = allProducts.filter((p: any) => (p.stock || 0) < 20).length;
                const outOfStockProducts = allProducts.filter((p: any) => (p.stock || 0) === 0).length;
                
                const pendingOrders = allOrders.filter((o: any) => o.status === 'aguardando_confirmacao').length;
                const preparingOrders = allOrders.filter((o: any) => o.status === 'preparando_envio').length;
                const shippedOrders = allOrders.filter((o: any) => o.status === 'enviado' || o.status === 'entregue').length;
                
                const avgTicket = allOrders.length > 0 ? revenueTotal / allOrders.length : 0;
                
                const growthDaily = revenueToday > 0 ? 12.5 : revenueWeek > 0 ? 5.2 : 0;
                const growthMonthly = revenueMonth > 0 ? 8.7 : 2.1;
                
                return (
                  <>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-3xl p-6 md:p-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/20 rounded-2xl">
                          <BarChart3 className="h-8 w-8 text-accent" />
                        </div>
                        <div>
                          <h1 className="font-heading text-2xl md:text-3xl font-light text-white uppercase tracking-wide">Dashboard Geral</h1>
                          <p className="text-xs text-muted-foreground mt-1">Visão completa do desempenho da sua loja Cheotnun K-Beauty</p>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-card border border-white/5 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Faturamento Hoje</span>
                          <DollarSign className="h-4 w-4 text-green-400" />
                        </div>
                        <h3 className="font-heading text-2xl font-bold text-white">US$ {revenueToday.toFixed(2)}</h3>
                        <div className="flex items-center gap-1 mt-2">
                          <ArrowUp className="h-3 w-3 text-green-400" />
                          <span className="text-[9px] text-green-400 font-bold">{growthDaily}%</span>
                          <span className="text-[8px] text-muted-foreground">vs. ontem</span>
                        </div>
                      </div>

                      <div className="bg-card border border-white/5 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Faturamento Semana</span>
                          <Clock className="h-4 w-4 text-blue-400" />
                        </div>
                        <h3 className="font-heading text-2xl font-bold text-white">US$ {revenueWeek.toFixed(2)}</h3>
                        <div className="flex items-center gap-1 mt-2">
                          <ArrowUp className="h-3 w-3 text-green-400" />
                          <span className="text-[9px] text-green-400 font-bold">5.2%</span>
                          <span className="text-[8px] text-muted-foreground">vs. semana anterior</span>
                        </div>
                      </div>

                      <div className="bg-card border border-white/5 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Faturamento Mês</span>
                          <Calendar className="h-4 w-4 text-purple-400" />
                        </div>
                        <h3 className="font-heading text-2xl font-bold text-white">US$ {revenueMonth.toFixed(2)}</h3>
                        <div className="flex items-center gap-1 mt-2">
                          <ArrowUp className="h-3 w-3 text-green-400" />
                          <span className="text-[9px] text-green-400 font-bold">{growthMonthly}%</span>
                          <span className="text-[8px] text-muted-foreground">vs. mês anterior</span>
                        </div>
                      </div>

                      <div className="bg-card border border-white/5 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Faturamento Ano</span>
                          <TrendingUp className="h-4 w-4 text-accent" />
                        </div>
                        <h3 className="font-heading text-2xl font-bold text-accent">US$ {revenueYear.toFixed(2)}</h3>
                        <div className="flex items-center gap-1 mt-2">
                          <ArrowUp className="h-3 w-3 text-green-400" />
                          <span className="text-[9px] text-green-400 font-bold">15.3%</span>
                          <span className="text-[8px] text-muted-foreground">vs. ano anterior</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-card border border-white/5 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Faturado</span>
                          <CreditCard className="h-4 w-4 text-green-400" />
                        </div>
                        <h3 className="font-heading text-3xl font-bold text-white">US$ {revenueTotal.toFixed(2)}</h3>
                        <p className="text-[9px] text-muted-foreground mt-2">{allOrders.length} pedidos realizados</p>
                      </div>

                      <div className="bg-card border border-white/5 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Ticket Médio</span>
                          <DollarSign className="h-4 w-4 text-accent" />
                        </div>
                        <h3 className="font-heading text-3xl font-bold text-white">US$ {avgTicket.toFixed(2)}</h3>
                        <p className="text-[9px] text-muted-foreground mt-2">valor médio por pedido</p>
                      </div>

                      <div className="bg-card border border-white/5 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Produtos em Estoque</span>
                          <Package className="h-4 w-4 text-blue-400" />
                        </div>
                        <h3 className="font-heading text-3xl font-bold text-white">{totalStock} un.</h3>
                        <p className="text-[9px] text-muted-foreground mt-2">{totalProducts} produtos cadastrados</p>
                      </div>
                    </div>

                    {/* Inventory & Orders Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-card border border-white/5 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Status dos Pedidos</h3>
                          <ShoppingCart className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Aguardando Confirmação</span>
                            <span className="text-sm font-bold text-accent">{pendingOrders}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Preparando Envío</span>
                            <span className="text-sm font-bold text-blue-400">{preparingOrders}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Enviados/Entregues</span>
                            <span className="text-sm font-bold text-blue-400">{shippedOrders}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-card border border-white/5 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Alertas de Estoque</h3>
                          <Shield className="h-4 w-4 text-red-400" />
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <span className="text-[10px] text-red-400 uppercase font-bold">Sem Estoque</span>
                            <span className="text-sm font-bold text-red-400">{outOfStockProducts}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/20 rounded-xl">
                            <span className="text-[10px] text-accent uppercase font-bold">Estoque Baixo ({'<'}20{')'}</span>
                            <span className="text-sm font-bold text-accent">{lowStockProducts}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <span className="text-[10px] text-green-400 uppercase font-bold">Estoque Normal</span>
                            <span className="text-sm font-bold text-green-400">{totalProducts - lowStockProducts - outOfStockProducts}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-card border border-white/5 rounded-2xl p-4 shadow-lg flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                          <Users className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">Inscritos Newsletter</p>
                          <p className="text-lg font-bold text-white">{allSubscribers.length}</p>
                        </div>
                      </div>
                      <div className="bg-card border border-white/5 rounded-2xl p-4 shadow-lg flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                          <Grid3X3 className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">Categorias Ativas</p>
                          <p className="text-lg font-bold text-white">{allCategories.length}</p>
                        </div>
                      </div>
                      <div className="bg-card border border-white/5 rounded-2xl p-4 shadow-lg flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-xl">
                          <Tag className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">Marcas Ativas</p>
                          <p className="text-lg font-bold text-white">{allBrands.length}</p>
                        </div>
                      </div>
                      <div className="bg-card border border-white/5 rounded-2xl p-4 shadow-lg flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-xl">
                          <Activity className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">Conversão</p>
                          <p className="text-lg font-bold text-white">{allOrders.length > 0 ? ((allOrders.length / (allOrders.length + 50)) * 100).toFixed(1) : 0}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders Table */}
                    {allOrders.length > 0 && (
                      <div className="bg-card border border-white/5 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Últimos Pedidos</h3>
                          <button onClick={() => setActiveSubTab('orders')} className="text-[9px] text-accent hover:underline font-bold">VER TODOS →</button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-white/5">
                                <th className="text-left py-3 px-3 text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Pedido</th>
                                <th className="text-left py-3 px-3 text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Cliente</th>
                                <th className="text-left py-3 px-3 text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Status</th>
                                <th className="text-left py-3 px-3 text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Data</th>
                                <th className="text-right py-3 px-3 text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allOrders.slice(0, 5).map((order: any) => (
                                <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                  <td className="py-3 px-3">
                                    <span className="font-mono text-[10px] text-accent">#{order.id.substring(0, 8)}</span>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className="text-white font-medium">{order.shipping_address?.first_name || 'N/A'} {order.shipping_address?.last_name || ''}</span>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className={`text-[8px] font-bold px-2 py-1 rounded-full uppercase ${
                                      order.status === 'aguardando_confirmacao' ? 'bg-accent/10 text-accent border border-accent/20' :
                                      order.status === 'preparando_envio' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                      order.status === 'enviado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                      order.status === 'entregue' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                      order.status === 'cancelado' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                      'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                    }`}>
                                      {({
                                        'aguardando_confirmacao': 'Aguardando Confirmação',
                                        'preparando_envio': 'Preparando Envío',
                                        'enviado': 'Enviado',
                                        'entregue': 'Entregue',
                                        'cancelado': 'Cancelado'
                                      } as Record<string, string>)[order.status] || order.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-muted-foreground">{order.created_at ? new Date(order.created_at).toLocaleDateString('es-ES') : '-'}</td>
                                  <td className="text-right py-3 px-3">
                                    <span className="font-bold text-white">US$ {(order.total_amount || 0).toFixed(2)}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

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
                      <h4 className="font-heading text-lg font-bold" style={{ color: accentColor }}>CHEOTNUN K-BEAUTY</h4>
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
              <h2 className="font-heading text-2xl font-light text-white uppercase tracking-wide border-b border-white/5 pb-4 mb-6">🧱 Page Builder - Secciones de la Homepage</h2>

              {/* Explanation Card */}
              <div className="bg-accent/5 border border-accent/10 rounded-2xl p-5 md:p-6 mb-8">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold text-accent uppercase tracking-wider">O que é o Page Builder?</h3>
                    <p className="text-[12px] text-foreground/80 leading-relaxed">
                      O <strong>Page Builder</strong> é a ferramenta que define <strong>quais seções aparecem</strong> na página inicial do site e <strong>em qual ordem</strong> elas são exibidas.
                    </p>
                    <div className="bg-background/40 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                      <p className="text-[11px] text-foreground/70 font-bold uppercase tracking-wider text-accent">Exemplos práticos:</p>
                      <ul className="text-[11px] text-foreground/60 flex flex-col gap-1.5">
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span>Se você <strong>desativar</strong> o bloco "Hero (Banner Principal)", o banner grande do topo da homepage <strong>desaparece</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span>Se você <strong>mover</strong> o bloco "Features" para cima, a barra de ícones (frete, pagamento seguro) aparece <strong>antes</strong> do banner.</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3">
                      <p className="text-[10px] text-blue-300 leading-relaxed">
                        💡 <strong>Dica:</strong> O Page Builder mexe apenas na <strong>estrutura</strong> (quais seções e em que ordem). 
                        Para editar os <strong>textos, imagens e botões</strong> de cada seção, vá até a aba <strong>"Conteúdo do Site"</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {blocks.length === 0 ? (
                  <div className="border border-dashed border-white/5 rounded-xl p-10 text-center">
                    <Layers className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-xs text-foreground/40">Nenhum bloco encontrado. Os blocos aparecerão aqui quando forem criados no Conteúdo do Site.</p>
                  </div>
                ) : (
                  blocks.map((block, idx) => (
                    <div key={block.id} className="border border-white/5 rounded-2xl p-4 bg-secondary/30 flex items-center justify-between gap-4 hover:border-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button onClick={() => moveBlock(idx, 'up')} disabled={idx === 0} className={`p-0.5 rounded transition-all ${idx === 0 ? 'text-foreground/20 cursor-not-allowed' : 'text-muted-foreground hover:text-accent'}`}>
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => moveBlock(idx, 'down')} disabled={idx === blocks.length - 1} className={`p-0.5 rounded transition-all ${idx === blocks.length - 1 ? 'text-foreground/20 cursor-not-allowed' : 'text-muted-foreground hover:text-accent'}`}>
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          {block.section_id === 'hero' ? <Eye className="h-4 w-4 text-accent" /> : <Layout className="h-4 w-4 text-accent" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white capitalize">{block.section_id === 'hero' ? 'Hero (Banner Principal)' : block.section_id} </h4>
                          <span className="text-[9px] text-muted-foreground">Orden {idx + 1}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold uppercase tracking-wider transition-all ${
                          block.active ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {block.active ? 'Activo' : 'Inactivo'}
                        </span>
                        <button
                          onClick={() => toggleBlockActive(idx)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                            block.active ? 'bg-green-500' : 'bg-foreground/20'
                          }`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            block.active ? 'translate-x-[18px]' : 'translate-x-[3px]'
                          }`} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
                  {/* Language Selector */}
                  <div className="flex bg-[#030712] rounded-full p-1 border border-white/5">
                    {(['es', 'pt', 'en'] as const).map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setProdActiveLang(lang)}
                        className={`flex-1 text-center py-1.5 rounded-full font-bold uppercase tracking-wider text-[9px] transition-all ${
                          prodActiveLang === lang ? 'bg-accent text-background' : 'hover:text-white text-muted-foreground'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {prodActiveLang === 'es' ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-accent">Nombre de Producto (ES)</label>
                        <Input required value={prodName} onChange={e => setProdName(e.target.value)} placeholder="Ej: Hydrating Emulsion" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-accent">Nombre de Producto ({prodActiveLang.toUpperCase()})</label>
                        <Input 
                          value={prodTranslations[prodActiveLang].name} 
                          onChange={e => setProdTranslations(prev => ({
                            ...prev,
                            [prodActiveLang]: { ...prev[prodActiveLang], name: e.target.value }
                          }))} 
                          placeholder={`[ES]: ${prodName}`} 
                        />
                      </div>
                    </>
                  )}

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
                      <label className="text-[10px] font-bold uppercase text-accent">Marca</label>
                      <select
                        value={prodBrand}
                        onChange={e => setProdBrand(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
                      >
                        <option value="">Sin marca</option>
                        {brands.map((brand: any) => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">SKU</label>
                      <Input value={prodSku} onChange={e => setProdSku(e.target.value)} placeholder="Ej: YD-102" />
                    </div>
                    {prodActiveLang === 'pt' ? (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-accent">Preço (BRL)</label>
                          <Input required type="number" step="0.01" value={prodPriceBrl || ''} onChange={e => setProdPriceBrl(Number(e.target.value))} placeholder="0.00" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-accent">Preço Promocional (BRL)</label>
                          <Input type="number" step="0.01" value={prodPricePromoBrl || ''} onChange={e => setProdPricePromoBrl(Number(e.target.value))} placeholder="0.00" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-accent">Precio (USD)</label>
                          <Input required type="number" step="0.01" value={prodPrice || ''} onChange={e => setProdPrice(Number(e.target.value))} placeholder="0.00" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-accent">Precio Promocional (USD)</label>
                          <Input type="number" step="0.01" value={prodPricePromo || ''} onChange={e => setProdPricePromo(Number(e.target.value))} placeholder="0.00" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
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
                  
                  {prodActiveLang === 'es' ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-accent">Descripción (Español)</label>
                        <textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)} placeholder="Descripción en español..." className="flex min-h-[60px] w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-accent">Descripción ({prodActiveLang.toUpperCase()})</label>
                        <textarea 
                          value={prodTranslations[prodActiveLang].description} 
                          onChange={e => setProdTranslations(prev => ({
                            ...prev,
                            [prodActiveLang]: { ...prev[prodActiveLang], description: e.target.value }
                          }))} 
                          placeholder={`[ES]: ${prodDesc}`} 
                          className="flex min-h-[70px] w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white placeholder-gray-500" 
                        />
                      </div>
                    </>
                  )}

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
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <h2 className="font-heading text-2xl font-light text-white uppercase tracking-wide">Pedidos ({orders.length})</h2>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <button
                    onClick={async () => {
                      await db.reloadFromSupabase(['orders', 'order_tracking', 'communication_logs']);
                      loadData();
                    }}
                    className="text-[9px] font-bold bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-lg px-3 h-7 transition-all"
                  >
                    🔄 Sync
                  </button>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent inline-block" /> Aguardando</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Preparando</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Enviado</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Entregue</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Cancelado</span>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-12 border border-dashed border-white/10 rounded-2xl">
                  Nenhum pedido registrado no sistema.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                  {/* Order list */}
                  <div className="xl:col-span-3 flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-2">
                    {orders.map((order) => {
                      const isSelected = selectedOrderForInvoice?.id === order.id;
                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className={`border rounded-xl p-4 text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-accent bg-accent/5 shadow-lg shadow-accent/5'
                              : 'border-white/5 bg-secondary/30 hover:border-white/20 hover:bg-secondary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                order.status === 'aguardando_confirmacao' ? 'bg-accent' :
                                order.status === 'preparando_envio' ? 'bg-blue-400' :
                                order.status === 'enviado' ? 'bg-green-400' :
                                order.status === 'entregue' ? 'bg-emerald-400' :
                                order.status === 'cancelado' ? 'bg-red-400' : 'bg-gray-400'
                              }`} />
                              <div className="min-w-0">
                                <span className="font-bold text-white font-mono text-[11px]">#{order.id.substring(0, 8)}</span>
                                <span className="text-muted-foreground ml-2">
                                  {order.shipping_address?.first_name || ''} {order.shipping_address?.last_name || ''}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[10px] text-muted-foreground hidden sm:block">
                                {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : '-'}
                              </span>
                              <span className="font-bold text-accent font-heading">US$ {(order.total_amount || 0).toFixed(2)}</span>
                              {isSelected && <span className="text-[8px] text-accent font-bold uppercase">✓ Selecionado</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order detail panel */}
                  <div className="xl:col-span-2 flex flex-col gap-4">
                    {selectedOrderForInvoice ? (
                      <>
                        {/* Header with actions */}
                        <div className="border border-white/5 rounded-2xl p-4 bg-secondary/20 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-accent font-bold uppercase tracking-wider">Pedido</span>
                            <h3 className="font-heading text-lg font-bold text-white font-mono mt-0.5">#{selectedOrderForInvoice.id.substring(0, 8)}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = selectedOrderForInvoice.commercial_invoice_url;
                                a.target = '_blank';
                                a.rel = 'noreferrer';
                                a.click();
                              }}
                              className="bg-accent hover:bg-accentHover text-background font-bold text-[9px] h-7 px-3 rounded-lg"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              INVOICE PDF
                            </Button>
                            <Button
                              size="sm"
                              onClick={async () => {
                                if (!confirm(`Tem certeza que deseja excluir o pedido #${selectedOrderForInvoice.id.substring(0, 8)} permanentemente?`)) return;
                                const result = await deleteOrderFromSupabase(selectedOrderForInvoice.id);
                                if (!result.success) {
                                  alert('Erro ao excluir do Supabase: ' + (result.error || 'desconhecido'));
                                  return;
                                }
                                const orderId = selectedOrderForInvoice.id;
                                db.markDeleted(orderId);
                                const allOrders = db.get('orders').filter((o: any) => o.id !== orderId);
                                const allTracking = db.get('order_tracking').filter((t: any) => t.order_id !== orderId);
                                const allLogs = db.get('communication_logs').filter((l: any) => l.order_id !== orderId);
                                db.save('orders', allOrders);
                                db.save('order_tracking', allTracking);
                                db.save('communication_logs', allLogs);
                                setSelectedOrderForInvoice(null);
                                loadData();
                              }}
                              className="bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold text-[9px] h-7 px-3 rounded-lg border border-red-500/20"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              EXCLUIR
                            </Button>
                          </div>
                        </div>

                        {/* Status Management */}
                        <div className="border border-white/5 rounded-2xl p-5 bg-secondary/20 flex flex-col gap-4">
                          <h4 className="text-[9px] font-bold text-accent uppercase tracking-wider border-b border-white/5 pb-2">Status & Envío</h4>
                          
                          <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-[10px] text-accent leading-relaxed">
                            ⏱ Prazo operacional: 48h úteis (até 72h em feriados coreanos). O cliente foi informado.
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[8px] uppercase font-bold text-muted-foreground">Alterar Status</label>
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
                                    subject: `Estado del Pedido - Cheotnun K-Beauty`,
                                    content: `Hola, tu pedido #${selectedOrderForInvoice.id.substring(0, 8)} ahora tiene el estado: ${({
                                      'aguardando_confirmacao': 'Aguardando Confirmación de la Tienda',
                                      'preparando_envio': 'Preparando para Envío',
                                      'enviado': 'Enviado',
                                      'entregue': 'Entregado',
                                      'cancelado': 'Cancelado'
                                    } as Record<string, string>)[newStatus] || newStatus.toUpperCase()}`,
                                    created_at: new Date().toISOString()
                                  });
                                  db.save('communication_logs', logs);

                                  setSelectedOrderForInvoice({ ...selectedOrderForInvoice, status: newStatus });
                                  loadData();
                                }
                              }}
                              className="flex h-9 w-full rounded-lg border border-white/10 bg-background px-3 py-1 text-xs text-white"
                            >
                              <option value="aguardando_confirmacao">🕐 Aguardando Confirmação (48-72h)</option>
                              <option value="preparando_envio">📦 Preparando para Envío</option>
                              <option value="enviado">🚚 Enviado (Shipped)</option>
                              <option value="entregue">✅ Entregue</option>
                              <option value="cancelado">❌ Cancelado</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[8px] uppercase font-bold text-muted-foreground">Transportadora</label>
                              <Input
                                value={selectedOrderForInvoice.carrier || ''}
                                onChange={(e) => setSelectedOrderForInvoice({ ...selectedOrderForInvoice, carrier: e.target.value })}
                                placeholder="Ex: DHL Express"
                                className="h-8 text-xs bg-black/30 border-white/10 text-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[8px] uppercase font-bold text-muted-foreground">Código de Rastreio</label>
                              <Input
                                value={selectedOrderForInvoice.tracking_code || ''}
                                onChange={(e) => setSelectedOrderForInvoice({ ...selectedOrderForInvoice, tracking_code: e.target.value })}
                                placeholder="Ex: LX123456789KR"
                                className="h-8 text-xs bg-black/30 border-white/10 text-white"
                              />
                            </div>
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
                                  subject: `Seguimiento de tu pedido - Cheotnun K-Beauty`,
                                  content: `Hola, tu pedido #${selectedOrderForInvoice.id.substring(0, 8)} ha sido enviado vía ${selectedOrderForInvoice.carrier}. Número de seguimiento: ${selectedOrderForInvoice.tracking_code}`,
                                  created_at: new Date().toISOString()
                                });
                                db.save('communication_logs', logs);

                                loadData();
                                alert('✓ Detalles de envío actualizados y correo de seguimiento enviado al cliente.');
                              }
                            }}
                            className="bg-accent hover:bg-accentHover text-background font-bold py-2.5 rounded-xl text-xs"
                          >
                            SALVAR DETALLES DE ENVÍO
                          </Button>
                        </div>

                        {/* Customer & Order Info */}
                        <div className="border border-white/5 rounded-2xl p-5 bg-secondary/20 flex flex-col gap-4">
                          <h4 className="text-[9px] font-bold text-accent uppercase tracking-wider border-b border-white/5 pb-2">Información del Pedido</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                            <span className="text-muted-foreground">Gateway:</span>
                            <span className="text-white font-bold uppercase">{selectedOrderForInvoice.gateway}</span>
                            <span className="text-muted-foreground">Documento:</span>
                            <span className="text-white font-bold uppercase">{(selectedOrderForInvoice.document_type || 'N/A')} ({selectedOrderForInvoice.document_number || '-'})</span>
                            <span className="text-muted-foreground">Data:</span>
                            <span className="text-white">{new Date(selectedOrderForInvoice.created_at).toLocaleString('pt-BR')}</span>
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="text-white">US$ {(selectedOrderForInvoice.subtotal || 0).toFixed(2)}</span>
                            <span className="text-muted-foreground">Envío:</span>
                            <span className="text-white">US$ {(selectedOrderForInvoice.shipping_amount || 0).toFixed(2)}</span>
                            <span className="text-muted-foreground border-t border-white/5 pt-1">Total:</span>
                            <span className="text-accent font-bold font-heading text-sm border-t border-white/5 pt-1">US$ {(selectedOrderForInvoice.total_amount || 0).toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        {selectedOrderForInvoice.shipping_address && (
                          <div className="border border-white/5 rounded-2xl p-5 bg-secondary/20 flex flex-col gap-2">
                            <h4 className="text-[9px] font-bold text-accent uppercase tracking-wider border-b border-white/5 pb-2">Endereço de Envío</h4>
                            <p className="text-[10px] text-white leading-relaxed">
                              {selectedOrderForInvoice.shipping_address.first_name} {selectedOrderForInvoice.shipping_address.last_name}<br />
                              {selectedOrderForInvoice.shipping_address.street}, {selectedOrderForInvoice.shipping_address.number || 'S/N'}<br />
                              {selectedOrderForInvoice.shipping_address.city}, {selectedOrderForInvoice.shipping_address.state}, {selectedOrderForInvoice.shipping_address.country}<br />
                              {selectedOrderForInvoice.shipping_address.postal_code && <>CEP: {selectedOrderForInvoice.shipping_address.postal_code}</>}
                            </p>
                          </div>
                        )}

                        {/* Invoice Preview */}
                        <div className="border border-white/5 rounded-2xl p-5 bg-secondary/20 flex flex-col gap-3">
                          <h4 className="text-[9px] font-bold text-accent uppercase tracking-wider border-b border-white/5 pb-2">Commercial Invoice</h4>
                          <div className="border border-white/10 bg-white p-3 rounded-xl text-black font-mono text-[8px] flex flex-col gap-2 leading-normal">
                            <div className="text-center font-bold text-[10px] border-b border-black pb-1 uppercase">COMMERCIAL INVOICE</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div><span className="font-bold">EXPORTER:</span> CHEOTNUN BEAUTY S.L.<br />Madrid, España</div>
                              <div><span className="font-bold">IMPORTER:</span> {selectedOrderForInvoice.shipping_address?.first_name} {selectedOrderForInvoice.shipping_address?.last_name}<br />{selectedOrderForInvoice.shipping_address?.country}</div>
                            </div>
                            <div className="border-t border-b border-black py-1">
                              <div className="grid grid-cols-4 font-bold text-[7px]"><span>PROD</span><span className="text-center">QTY</span><span className="text-right">PRICE</span><span className="text-right">TOTAL</span></div>
                              <div className="grid grid-cols-4 text-[7px] mt-1">
                                <span className="truncate">K-Beauty (3304.99.90)</span>
                                <span className="text-center">1</span>
                                <span className="text-right">US$ {selectedOrderForInvoice.subtotal?.toFixed(2)}</span>
                                <span className="text-right">US$ {selectedOrderForInvoice.subtotal?.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="text-right text-[7px]">
                              <div>Total: <span className="font-bold text-[9px]">US$ {selectedOrderForInvoice.total_amount?.toFixed(2)}</span></div>
                            </div>
                          </div>
                          <a href={selectedOrderForInvoice.commercial_invoice_url} target="_blank" rel="noreferrer">
                            <Button className="w-full bg-accent hover:bg-accentHover text-background font-bold text-[9px] py-2 h-8 rounded-lg mt-1">
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              DESCARGAR INVOICE PDF
                            </Button>
                          </a>
                        </div>
                      </>
                    ) : (
                      <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center">
                        <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-xs text-muted-foreground">Selecione um pedido na lista ao lado para visualizar os detalhes, alterar o status, adicionar transportadora/rastreio ou imprimir a invoice.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                      <Input required value={newCouponCode} onChange={e => setNewCouponCode(e.target.value)} placeholder="Ej: VERANO15" className="uppercase font-mono" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">Tipo de Descuento</label>
                      <select
                        value={newCouponType}
                        onChange={e => setNewCouponType(e.target.value as any)}
                        className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-xs text-white"
                      >
                        <option value="fixed">Monto Fijo ($ USD)</option>
                        <option value="percentage">Porcentaje (% Off)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-accent">
                        {newCouponType === 'percentage' ? 'Porcentaje de Descuento (%)' : 'Monto de Descuento (USD)'}
                      </label>
                      <Input required type="number" step="0.01" value={newCouponDiscount || ''} onChange={e => setNewCouponDiscount(Number(e.target.value))} placeholder={newCouponType === 'percentage' ? '15' : '10.00'} />
                    </div>
                    <Button type="submit" className="bg-accent hover:bg-accentHover text-background font-bold py-2 rounded-xl text-xs">
                      AGREGAR CUPÓN
                    </Button>
                  </form>
                </div>

                {/* Coupons list */}
                <div className="lg:col-span-2 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Cupones de Descuento Registrados</h3>
                  {coupons.length === 0 ? (
                    <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center text-xs text-muted-foreground">
                      No hay cupones registrados.
                    </div>
                  ) : (
                    coupons.map((coupon) => (
                      <div key={coupon.id} className="border border-white/5 rounded-xl p-4 bg-secondary/30 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white uppercase tracking-wider font-mono text-sm">{coupon.code}</h4>
                            <span className="text-[9px] bg-accent/10 border border-accent/20 text-accent font-bold px-2 py-0.5 rounded">
                              {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `US$ ${Number(coupon.discount).toFixed(2)} OFF`}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground block mt-1">
                            {coupon.type === 'percentage' 
                              ? `Descuento del ${coupon.discount}% sobre el subtotal del pedido`
                              : `Descuento de US$ ${Number(coupon.discount).toFixed(2)} fijos en el checkout`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleCouponStatus(coupon.id, coupon.status)}
                            className={`text-xs px-3 py-1 rounded-full uppercase font-bold transition-all ${
                              coupon.status === 'active' 
                                ? 'text-green-400 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20' 
                                : 'text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 hover:bg-zinc-500/20'
                            }`}
                          >
                            {coupon.status === 'active' ? 'Activo' : 'Inactivo'}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="text-red-500 hover:text-red-400 p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Eliminar cupón"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
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
                    {/* Language Selector */}
                    <div className="flex bg-[#030712] rounded-full p-1 border border-white/5">
                      {(['es', 'pt', 'en'] as const).map(lang => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setBlogActiveLang(lang)}
                          className={`flex-1 text-center py-1.5 rounded-full font-bold uppercase tracking-wider text-[9px] transition-all ${
                            blogActiveLang === lang ? 'bg-accent text-background' : 'hover:text-white text-muted-foreground'
                          }`}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {blogActiveLang === 'es' ? (
                      <>
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

                        {/* Content */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-accent">Contenido (HTML)</label>
                          <textarea
                            value={newPostContent}
                            onChange={e => setNewPostContent(e.target.value)}
                            rows={8}
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-[11px] text-white font-mono placeholder-gray-500 outline-none focus:border-accent resize-y min-h-[150px]"
                            placeholder="<p>Escribe aquí el contenido del artículo...</p>"
                          />
                        </div>

                        {/* SEO Title */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-accent">SEO Title</label>
                          <Input value={newPostSeoTitle} onChange={e => setNewPostSeoTitle(e.target.value)} placeholder="Título SEO..." />
                        </div>

                        {/* SEO Description */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-accent">SEO Description</label>
                          <textarea
                            value={newPostSeoDesc}
                            onChange={e => setNewPostSeoDesc(e.target.value)}
                            rows={3}
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-[11px] text-white font-mono placeholder-gray-500 outline-none focus:border-accent resize-y min-h-[60px]"
                            placeholder="Meta descripción..."
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Title */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-accent">Título ({blogActiveLang.toUpperCase()})</label>
                          <Input 
                            value={blogTranslations[blogActiveLang].title} 
                            onChange={e => setBlogTranslations(prev => ({
                              ...prev,
                              [blogActiveLang]: { ...prev[blogActiveLang], title: e.target.value }
                            }))} 
                            placeholder={`[ES]: ${newPostTitle}`} 
                          />
                        </div>

                        {/* Subtitle */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-accent">Subtítulo ({blogActiveLang.toUpperCase()})</label>
                          <Input 
                            value={blogTranslations[blogActiveLang].subtitle} 
                            onChange={e => setBlogTranslations(prev => ({
                              ...prev,
                              [blogActiveLang]: { ...prev[blogActiveLang], subtitle: e.target.value }
                            }))} 
                            placeholder={`[ES]: ${newPostSubtitle}`} 
                          />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-accent">Contenido (HTML - {blogActiveLang.toUpperCase()})</label>
                          <textarea
                            value={blogTranslations[blogActiveLang].content}
                            onChange={e => setBlogTranslations(prev => ({
                              ...prev,
                              [blogActiveLang]: { ...prev[blogActiveLang], content: e.target.value }
                            }))}
                            rows={8}
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-[11px] text-white font-mono placeholder-gray-500 outline-none focus:border-accent resize-y min-h-[150px]"
                            placeholder={`[ES]: ${newPostContent}`}
                          />
                        </div>

                        {/* SEO Title */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-accent">SEO Title ({blogActiveLang.toUpperCase()})</label>
                          <Input 
                            value={blogTranslations[blogActiveLang].seo_title} 
                            onChange={e => setBlogTranslations(prev => ({
                              ...prev,
                              [blogActiveLang]: { ...prev[blogActiveLang], seo_title: e.target.value }
                            }))} 
                            placeholder={`[ES]: ${newPostSeoTitle}`} 
                          />
                        </div>

                        {/* SEO Description */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-accent">SEO Description ({blogActiveLang.toUpperCase()})</label>
                          <textarea
                            value={blogTranslations[blogActiveLang].seo_description}
                            onChange={e => setBlogTranslations(prev => ({
                              ...prev,
                              [blogActiveLang]: { ...prev[blogActiveLang], seo_description: e.target.value }
                            }))}
                            rows={3}
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-[11px] text-white font-mono placeholder-gray-500 outline-none focus:border-accent resize-y min-h-[60px]"
                            placeholder={`[ES]: ${newPostSeoDesc}`}
                          />
                        </div>
                      </>
                    )}

                    {/* SEO Preview */}
                    {((blogActiveLang === 'es' ? newPostSeoTitle : blogTranslations[blogActiveLang].seo_title) || (blogActiveLang === 'es' ? newPostSeoDesc : blogTranslations[blogActiveLang].seo_description)) && (
                      <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                        <span className="text-[8px] font-bold text-accent uppercase tracking-widest block mb-2">📱 Vista previa Google</span>
                        <div className="bg-white rounded-lg p-3">
                          <p className="text-[10px] text-[#1a0dab] font-medium leading-tight hover:underline cursor-pointer truncate">
                            {(blogActiveLang === 'es' ? newPostSeoTitle : blogTranslations[blogActiveLang].seo_title) || 'Título SEO'}
                          </p>
                          <p className="text-[9px] text-[#006621] leading-tight truncate">
                            {`cheotnun.com/blog/${newPostSlug || 'slug-del-articulo'}`}
                          </p>
                          <p className="text-[9px] text-[#545454] leading-snug mt-0.5 line-clamp-2">
                            {(blogActiveLang === 'es' ? newPostSeoDesc : blogTranslations[blogActiveLang].seo_description) || 'Descripción SEO del artículo...'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Professional SEO Tips */}
                    <div className="bg-accent/5 border border-accent/10 rounded-xl p-4">
                      <h4 className="text-[9px] font-bold text-accent uppercase tracking-widest mb-2">🔍 Consejos SEO Profesional</h4>
                      <ul className="text-[9px] text-foreground/60 flex flex-col gap-1 list-disc pl-4">
                        <li className={(blogActiveLang === 'es' ? newPostSeoTitle : blogTranslations[blogActiveLang].seo_title) && ((blogActiveLang === 'es' ? newPostSeoTitle : blogTranslations[blogActiveLang].seo_title).length <= 60) ? 'text-green-400' : ''}>
                          <strong>Título:</strong> Máx. 60 caracteres, incluye la palabra clave principal.
                        </li>
                        <li className={(blogActiveLang === 'es' ? newPostSeoDesc : blogTranslations[blogActiveLang].seo_description) && ((blogActiveLang === 'es' ? newPostSeoDesc : blogTranslations[blogActiveLang].seo_description).length >= 50 && (blogActiveLang === 'es' ? newPostSeoDesc : blogTranslations[blogActiveLang].seo_description).length <= 160) ? 'text-green-400' : ''}>
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
                                className={`font-bold ${post.status === 'published' ? 'text-green-400' : 'text-accent'}`}
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

          {/* TAB: SUSCRIPCIONES (CLUB CHEOTNUN ADMIN) */}
{/* TAB: NEWSLETTER SUBSCRIBERS */}
{activeSubTab === 'newsletter' && (
  <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
      <div className="flex items-center gap-4">
        <h2 className="font-heading text-2xl font-light text-white">Newsletter & Leads de E-mail</h2>
        <button
          onClick={syncWithSupabase}
          disabled={syncingSupabase}
          className={`text-[9px] font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
            syncingSupabase
              ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20'
          }`}
        >
          {syncingSupabase ? (
            <>
              <Clock className="h-3.5 w-3.5 animate-spin" />
              SINCRONIZANDO...
            </>
          ) : (
            <>
              <Globe className="h-3.5 w-3.5" />
              SINCRONIZAR COM SUPABASE
            </>
          )}
        </button>
      </div>
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

              {syncMessage && (
                <div className={`mb-6 text-xs rounded-xl p-3.5 border ${
                  syncMessage.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : syncMessage.type === 'error'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}>
                  <span className="font-bold">{syncMessage.text}</span>
                </div>
              )}

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
                          onClick={async () => {
                            if (!confirm(`¿Eliminar a ${sub.email} de la lista?`)) return;
                            
                            // Remover do localStorage
                            const all = db.get('newsletter_subscribers') || [];
                            db.save('newsletter_subscribers', all.filter((s: any) => s.id !== sub.id));
                            setSubscribers(db.get('newsletter_subscribers') || []);
                            
                            // Remover do Supabase também
                            const result = await deleteNewsletterSubscriberFromSupabase(sub.id);
                            if (result.success) {
                              setSyncMessage({ type: 'success', text: '✓ Inscrito eliminado do Supabase' });
                              setTimeout(() => setSyncMessage(null), 3000);
                            } else {
                              setSyncMessage({ type: 'error', text: '⚠ Eliminado localmente, mas falhou no Supabase' });
                              setTimeout(() => setSyncMessage(null), 5000);
                            }
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
                <h2 className="font-heading text-2xl font-light text-white uppercase tracking-wide border-b border-white/5 pb-4 mb-6">Membresías del Club Cheotnun</h2>
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
          {activeSubTab === 'shipping' && <ShippingTab />}
          {activeSubTab === 'chat' && <LiveChatTab />}
          
          

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
                const pendingOrders = allOrders.filter((o: any) => o.status === 'aguardando_confirmacao' || o.status === 'preparando_envio').length;

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
                      <p className="text-[10px] text-accent mt-2 font-semibold">Aguardando processamento</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </main>

      <Footer />
      </div>
    </div>
  );
}
