'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Plus, Trash2, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ShippingTab() {
  const { t } = useLanguage();
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = () => {
    const settings = db.get('system_settings');
    setZones(settings?.shipping_zones || []);
  };

  const saveZones = () => {
    setLoading(true);
    const settings = db.get('system_settings');
    settings.shipping_zones = zones;
    db.save('system_settings', settings);
    setTimeout(() => {
      setLoading(false);
      alert(t('Configurações de frete e prazos salvas com sucesso!'));
    }, 500);
  };

  const addZone = () => {
    setZones([...zones, { country: '', methods: [{ name: 'Standard', days: '10-15', price: 15 }] }]);
  };

  const removeZone = (idx: number) => {
    const newZones = [...zones];
    newZones.splice(idx, 1);
    setZones(newZones);
  };

  const updateZoneCountry = (idx: number, country: string) => {
    const newZones = [...zones];
    newZones[idx].country = country;
    setZones(newZones);
  };

  const updateMethod = (zoneIdx: number, methodIdx: number, field: string, value: any) => {
    const newZones = [...zones];
    newZones[zoneIdx].methods[methodIdx][field] = value;
    setZones(newZones);
  };

  const addMethod = (zoneIdx: number) => {
    const newZones = [...zones];
    newZones[zoneIdx].methods.push({ name: 'Expresso', days: '3-5', price: 30 });
    setZones(newZones);
  };

  const removeMethod = (zoneIdx: number, methodIdx: number) => {
    const newZones = [...zones];
    newZones[zoneIdx].methods.splice(methodIdx, 1);
    setZones(newZones);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-heading text-white">{t('Países e Prazos')}</h2>
          <p className="text-xs text-muted-foreground mt-1">{t('Configure os países atendidos, métodos de envio, prazos estimados e custos.')}</p>
        </div>
        <Button onClick={saveZones} disabled={loading} className="bg-accent hover:bg-accentHover text-background font-bold text-xs flex gap-2">
          {loading ? t('Salvando...') : <><Save className="h-4 w-4" /> {t('Salvar Alterações')}</>}
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {zones.map((zone, zIdx) => (
          <div key={zIdx} className="border border-white/10 rounded-2xl p-5 bg-card flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-accent" />
                <Input 
                  value={zone.country} 
                  onChange={(e) => updateZoneCountry(zIdx, e.target.value)}
                  placeholder="Nome do País (ex: Brasil)"
                  className="bg-black/30 border-white/10 text-white font-bold h-9 w-64"
                />
              </div>
              <Button onClick={() => removeZone(zIdx)} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 text-xs">
                <Trash2 className="h-4 w-4 mr-2" /> {t('Remover País')}
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-accent font-bold uppercase tracking-wider">{t('Métodos de Envio')}</span>
              {zone.methods.map((method: any, mIdx: number) => (
                <div key={mIdx} className="flex items-center gap-3 bg-secondary/30 p-3 rounded-xl border border-white/5">
                  <Input 
                    value={method.name} 
                    onChange={(e) => updateMethod(zIdx, mIdx, 'name', e.target.value)}
                    placeholder="Nome (ex: K-Packet)"
                    className="bg-black/30 border-white/10 text-xs h-8 flex-1"
                  />
                  <Input 
                    value={method.days} 
                    onChange={(e) => updateMethod(zIdx, mIdx, 'days', e.target.value)}
                    placeholder="Prazo (ex: 15-25)"
                    className="bg-black/30 border-white/10 text-xs h-8 w-24 text-center"
                  />
                  <span className="text-xs text-muted-foreground">{t('dias')}</span>
                  
                  <div className="flex items-center ml-4">
                    <span className="text-xs text-muted-foreground mr-2">US$</span>
                    <Input 
                      type="number"
                      value={method.price} 
                      onChange={(e) => updateMethod(zIdx, mIdx, 'price', parseFloat(e.target.value))}
                      className="bg-black/30 border-white/10 text-xs h-8 w-24 text-right"
                    />
                  </div>
                  
                  <Button onClick={() => removeMethod(zIdx, mIdx)} variant="ghost" className="text-red-400 hover:text-red-300 p-1.5 h-8 ml-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button onClick={() => addMethod(zIdx)} variant="outline" className="border-dashed border-white/20 text-muted-foreground hover:text-white mt-2 text-[10px] h-8 w-fit">
                <Plus className="h-3 w-3 mr-1" /> {t('Adicionar Método')}
              </Button>
            </div>
          </div>
        ))}
        
        <Button onClick={addZone} variant="outline" className="border-dashed border-accent text-accent hover:bg-accent/10 h-14 rounded-2xl font-bold flex gap-2">
          <Plus className="h-5 w-5" /> {t('Adicionar Novo País')}
        </Button>
      </div>
    </div>
  );
}
