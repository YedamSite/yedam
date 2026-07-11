'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';

export default function CategoriesTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState('');

  const load = () => setCategories(db.get('categories') || []);

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setFormName(''); setFormSlug(''); setFormDesc(''); setFormImage('');
    setEditingId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;
    const all = db.get('categories');
    if (editingId) {
      const idx = all.findIndex((c: any) => c.id === editingId);
      if (idx !== -1) {
        all[idx] = { ...all[idx], name: formName, slug: formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'), description: formDesc, image: formImage };
      }
    } else {
      all.push({
        id: crypto.randomUUID(),
        name: formName,
        slug: formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formDesc || '',
        image: formImage || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400'
      });
    }
    db.save('categories', all);
    resetForm();
    load();
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDesc(cat.description || '');
    setFormImage(cat.image || '');
  };

  const handleDelete = (id: string) => {
    const all = db.get('categories');
    db.save('categories', all.filter((c: any) => c.id !== id));
    load();
  };

  return (
    <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
      <h2 className="font-heading text-2xl font-light text-white uppercase tracking-wide border-b border-white/5 pb-4 mb-6">Gerenciar Categorias</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-secondary/30 border border-white/5 rounded-2xl p-6 h-fit text-xs text-muted-foreground space-y-4">
          <h3 className="text-xs font-bold text-accent uppercase tracking-wider">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-accent">Nome</label>
              <Input required value={formName} onChange={e => { setFormName(e.target.value); if (!editingId) setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} placeholder="Ex: Cuidado Facial" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-accent">Slug (URL)</label>
              <Input value={formSlug} onChange={e => setFormSlug(e.target.value)} placeholder="cuidado-facial" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-accent">Descrição</label>
              <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} className="flex min-h-[50px] w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-accent">URL da Imagem</label>
              <Input value={formImage} onChange={e => setFormImage(e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-accent hover:bg-accentHover text-background font-bold py-2 rounded-xl text-xs flex-1">
                {editingId ? 'ATUALIZAR' : 'CRIAR'}
              </Button>
              {editingId && (
                <Button type="button" onClick={resetForm} variant="outline" className="border-white/10 text-white py-2 rounded-xl text-xs">CANCELAR</Button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Categorias ({categories.length})</h3>
          {categories.map((cat) => (
            <div key={cat.id} className="border border-white/5 rounded-xl p-4 bg-secondary/30 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                {cat.image && (
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-secondary">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white">{cat.name}</h4>
                  <span className="text-[10px] text-muted-foreground">/{cat.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(cat)} className="text-accent hover:text-accentHover p-1.5"><Edit3 className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-400 p-1.5"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
