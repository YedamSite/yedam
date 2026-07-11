'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';

export default function BrandsTab() {
  const [brands, setBrands] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);

  const load = () => setBrands(db.get('brands') || []);

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setFormName(''); setFormSlug(''); setFormDesc(''); setFormFeatured(false);
    setEditingId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;
    const all = db.get('brands');
    if (editingId) {
      const idx = all.findIndex((b: any) => b.id === editingId);
      if (idx !== -1) {
        all[idx] = { ...all[idx], name: formName, slug: formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'), description: formDesc, is_featured: formFeatured };
      }
    } else {
      all.push({
        id: crypto.randomUUID(),
        name: formName,
        slug: formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formDesc || '',
        is_featured: formFeatured
      });
    }
    db.save('brands', all);
    resetForm();
    load();
  };

  const handleEdit = (brand: any) => {
    setEditingId(brand.id);
    setFormName(brand.name);
    setFormSlug(brand.slug);
    setFormDesc(brand.description || '');
    setFormFeatured(brand.is_featured || false);
  };

  const handleDelete = (id: string) => {
    const all = db.get('brands');
    db.save('brands', all.filter((b: any) => b.id !== id));
    load();
  };

  return (
    <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
      <h2 className="font-heading text-2xl font-light text-white uppercase tracking-wide border-b border-white/5 pb-4 mb-6">Gerenciar Marcas</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-secondary/30 border border-white/5 rounded-2xl p-6 h-fit text-xs text-muted-foreground space-y-4">
          <h3 className="text-xs font-bold text-accent uppercase tracking-wider">{editingId ? 'Editar Marca' : 'Nova Marca'}</h3>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-accent">Nome</label>
              <Input required value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ex: COSRX" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-accent">Slug (URL)</label>
              <Input value={formSlug} onChange={e => setFormSlug(e.target.value)} placeholder="cosrx" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-accent">Descrição</label>
              <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} className="flex min-h-[50px] w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={formFeatured} onChange={e => setFormFeatured(e.target.checked)} className="rounded border-white/10" />
              <label htmlFor="featured" className="text-[10px] font-bold text-accent uppercase">Marca em Destaque</label>
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
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Marcas ({brands.length})</h3>
          {brands.map((brand) => (
            <div key={brand.id} className="border border-white/5 rounded-xl p-4 bg-secondary/30 flex items-center justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white">{brand.name}</h4>
                  {brand.is_featured && <span className="text-[8px] text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded-full uppercase font-bold">Destaque</span>}
                </div>
                <span className="text-[10px] text-muted-foreground">/{brand.slug}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(brand)} className="text-accent hover:text-accentHover p-1.5"><Edit3 className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(brand.id)} className="text-red-500 hover:text-red-400 p-1.5"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
