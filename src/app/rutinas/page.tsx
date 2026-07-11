'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, Play, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';

export default function RutinasPage() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedSkinType, setSelectedSkinType] = useState('Piel Sensible');

  const loadData = () => {
    setRoutines(db.get('routines') || []);
    setProducts(db.get('products') || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const skinTypes = [
    { id: 'Piel Hidratada', label: 'Piel Hidratada', emoji: '💧' },
    { id: 'Piel Iluminada', label: 'Piel Iluminada', emoji: '✨' },
    { id: 'Piel Sensible', label: 'Piel Sensible', emoji: '🌿' },
    { id: 'Antiedad', label: 'Antiedad', emoji: '⏳' },
    { id: 'Acné', label: 'Acné', emoji: '🧴' }
  ];

  const currentRoutine = routines.find(r => r.skin_type === selectedSkinType) || routines[0];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="max-w-2xl mb-12">
          <span className="text-xs uppercase tracking-widest text-accent font-bold">RITUALES DE CUIDADO</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-white mt-2">Rutinas Recomendadas</h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Descubre el ritual coreano perfecto para tu tipo de piel. Siguiendo estos simples pasos, nutrirás y protegerás tu cutis de forma efectiva y duradera.
          </p>
        </div>

        {/* Skin Type Filter */}
        <div className="flex flex-wrap gap-3 border-b border-white/5 pb-6 mb-10 justify-start sm:justify-center">
          {skinTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedSkinType(type.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl border transition-all ${
                selectedSkinType === type.id
                  ? 'border-accent bg-accent text-background shadow-lg shadow-accent/15 font-bold'
                  : 'border-white/10 bg-card text-foreground/80 hover:bg-white/5'
              }`}
            >
              <span>{type.emoji}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Active Routine display */}
        {currentRoutine ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left - Detail cards */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                <h2 className="font-heading text-2xl font-light text-white mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                  {currentRoutine.title}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentRoutine.description}
                </p>

                {/* Steps Timeline */}
                <div className="relative pl-6 border-l border-white/10 flex flex-col gap-8 mt-8">
                  {currentRoutine.steps.map((step: any, idx: number) => {
                    const prod = products.find((p: any) => p.id === step.product_id);
                    return (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[30px] top-1 bg-background border border-accent h-4.5 w-4.5 rounded-full flex items-center justify-center text-[8px] font-bold text-accent">
                          {step.step}
                        </div>
                        <div className="flex items-center justify-between gap-4 text-[10px] text-accent font-bold uppercase tracking-wider">
                          <span>Etapa: {step.action}</span>
                        </div>
                        <h4 className="font-heading text-base font-medium text-white mt-1">
                          {prod ? prod.name : 'Producto Recomendado'}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {step.instruction}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right - Extra media & actions */}
            <div className="flex flex-col gap-6">
              {/* Routine Video */}
              <div className="bg-card border border-white/5 rounded-3xl overflow-hidden shadow-xl group">
                <div className="relative aspect-video w-full bg-secondary flex items-center justify-center">
                  <Image
                    src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400"
                    alt="Routine Video Preview"
                    fill
                    className="object-cover brightness-[0.5] group-hover:scale-105 transition-transform duration-300"
                  />
                  <a href={currentRoutine.video_url} target="_blank" rel="noreferrer" className="relative z-10 p-4 bg-accent hover:bg-accentHover text-background rounded-full shadow-lg transition-transform scale-95 hover:scale-100">
                    <Play className="h-6 w-6 fill-current ml-0.5" />
                  </a>
                </div>
                <div className="p-6">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Videotutorial de Aplicación</h4>
                  <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                    Aprende la técnica de masaje coreano para maximizar la absorción de los nutrientes.
                  </p>
                </div>
              </div>

              {/* Consultation Call out */}
              <div className="bg-gradient-to-br from-secondary to-card border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <BookOpen className="h-6 w-6 text-accent" />
                  <h4 className="font-heading text-lg font-medium text-white mt-3">¿Dudas sobre tu rutina?</h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Haz nuestro test de piel rápido o chatea directamente con una experta en cosmetología.
                  </p>
                </div>
                <Button className="w-full bg-accent hover:bg-accentHover text-background text-xs font-bold py-2.5 rounded-xl mt-6">
                  INICIAR EVALUACIÓN GRATUITA
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-white/10 rounded-3xl p-12 text-center text-xs text-muted-foreground">
            No hay rutinas registradas para este tipo de piel.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
