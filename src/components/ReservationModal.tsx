'use client';

import React, { useState } from 'react';
import { X, Calendar, Users, Clock, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience: {
    id: string;
    title: string;
    price: string;
    duration: string;
    location: string;
  };
}

export default function ReservationModal({ isOpen, onClose, experience }: ReservationModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    participants: 1,
    date: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    
    // Simular envio para API/backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Salvar no localStorage para demonstração
    const reservations = JSON.parse(localStorage.getItem('cheotnun_reservations') || '[]');
    reservations.push({
      id: crypto.randomUUID(),
      experienceId: experience.id,
      experienceTitle: experience.title,
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('cheotnun_reservations', JSON.stringify(reservations));
    
    setStep('success');
  };

  const handleClose = () => {
    setStep('form');
    setFormData({ name: '', email: '', phone: '', participants: 1, date: '', notes: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-[#0b1329] border border-white/10 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
              {/* Header */}
              <div className="sticky top-0 bg-[#0b1329] border-b border-white/5 p-6 flex items-center justify-between z-10">
                <div>
                  <h3 className="font-heading text-xl font-light text-white">{t('Reservar Experiência')}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{experience.title}</p>
                </div>
                <button onClick={handleClose} className="text-muted-foreground hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {step === 'form' && (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Experience Info */}
                    <div className="bg-secondary/30 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4 text-accent" />
                        <span>{experience.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-4 w-4 text-accent" />
                        <span>{experience.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-accent font-bold">
                        <Calendar className="h-4 w-4" />
                        <span>{experience.price}</span>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1.5 block">
                          {t('Nome Completo')} *
                        </label>
                        <Input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t('Seu nome')}
                          className="bg-black/30 border-white/10 text-white rounded-xl text-xs px-4"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1.5 block">
                          {t('E-mail')} *
                        </label>
                        <Input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={t('seu@email.com')}
                          className="bg-black/30 border-white/10 text-white rounded-xl text-xs px-4"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1.5 block">
                          {t('Telefone')} *
                        </label>
                        <Input
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder={t('+34 600 000 000')}
                          className="bg-black/30 border-white/10 text-white rounded-xl text-xs px-4"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1.5 block">
                          {t('Número de Participantes')} *
                        </label>
                        <Input
                          required
                          type="number"
                          min="1"
                          value={formData.participants}
                          onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
                          className="bg-black/30 border-white/10 text-white rounded-xl text-xs px-4"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1.5 block">
                          {t('Data Preferida')}
                        </label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="bg-black/30 border-white/10 text-white rounded-xl text-xs px-4"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1.5 block">
                          {t('Observações (opcional)')}
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder={t('Alguma informação adicional?')}
                          rows={3}
                          className="w-full bg-black/30 border border-white/10 text-white rounded-xl text-xs px-4 py-2.5 outline-none focus:border-accent transition-colors resize-none"
                        />
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-blue-300 leading-relaxed">
                        {t('Após enviar este formulário, nossa equipe entrará em contato em até 24 horas para confirmar a disponibilidade e finalizar sua reserva.')}
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full bg-accent hover:bg-accentHover text-background font-bold text-xs py-4 rounded-xl mt-2"
                    >
                      {t('SOLICITAR RESERVA')}
                    </Button>
                  </form>
                )}

                {step === 'loading' && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <div className="h-16 w-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-6">{t('Processando sua reserva...')}</p>
                  </div>
                )}

                {step === 'success' && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                      <Check className="h-10 w-10 text-green-400" />
                    </div>
                    <h4 className="font-heading text-xl font-light text-white mb-2">
                      {t('¡Reserva Solicitada!')}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                      {t('Hemos recibido tu solicitud de reserva para')} <strong className="text-accent">{experience.title}</strong>. {t('Nuestra equipo te contactará en breve para confirmar los detalles.')}
                    </p>
                    <Button 
                      onClick={handleClose}
                      className="mt-6 bg-accent hover:bg-accentHover text-background font-bold text-xs px-8 py-3 rounded-xl"
                    >
                      {t('Volver al Inicio')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}