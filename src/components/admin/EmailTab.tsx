'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Save, Eye, Trash2, Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getEmailLogsFromSupabase } from '@/lib/emailService';

export default function EmailTab() {
  const { t } = useLanguage();
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadEmailLogs();
  }, []);

  const loadEmailLogs = async () => {
    setLoading(true);
    const logs = db.get('communication_logs') || [];
    setEmailLogs(logs);
    setLoading(false);
  };

  const syncWithSupabase = async () => {
    setLoading(true);
    const result = await getEmailLogsFromSupabase();
    if (result.success && result.data) {
      setEmailLogs(result.data);
      alert(t('✓ Logs de e-mail sincronizados do Supabase!'));
    } else {
      alert(t('✗ Erro ao sincronizar: ') + (result.error || t('Erro desconhecido')));
    }
    setLoading(false);
  };

  const filteredLogs = filter === 'all' 
    ? emailLogs 
    : emailLogs.filter(log => log.type === filter);

  const emailTypes = ['confirmation', 'password_reset', 'welcome_order', 'newsletter', 'order_update'];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-heading text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-accent" />
            {t('Configuração de E-mails')}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t('Gerencie templates de e-mail e visualize o histórico de envios')}
          </p>
        </div>
        <Button onClick={syncWithSupabase} disabled={loading} className="bg-accent hover:bg-accentHover text-background font-bold text-xs flex gap-2">
          {loading ? t('Sincronizando...') : <><Save className="h-4 w-4" /> {t('Sincronizar com Supabase')}</>}
        </Button>
      </div>

      {/* Email Templates Configuration */}
      <div className="bg-card border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">
          {t('Templates de E-mail')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emailTypes.map((type) => (
            <div key={type} className="bg-secondary/30 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase">{t(type)}</span>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {type === 'confirmation' && t('E-mail de confirmação de cadastro com boas-vindas')}
                {type === 'password_reset' && t('E-mail de recuperação de senha')}
                {type === 'welcome_order' && t('E-mail de agradecimento após primeira compra')}
                {type === 'newsletter' && t('E-mail de newsletter e promoções')}
                {type === 'order_update' && t('Atualizações de status do pedido')}
              </p>
              <Button 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 text-[10px] h-8 w-fit"
              >
                <Eye className="h-3 w-3 mr-1" /> {t('Visualizar Template')}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* SMTP Configuration */}
      <div className="bg-card border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">
          {t('Configuração SMTP')}
        </h3>
        
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1.5 block">
                {t('Servidor SMTP')}
              </label>
              <Input 
                placeholder="smtp.sendgrid.net"
                className="bg-black/30 border-white/10 text-white rounded-xl text-xs px-4"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1.5 block">
                {t('Porta')}
              </label>
              <Input 
                type="number"
                placeholder="587"
                className="bg-black/30 border-white/10 text-white rounded-xl text-xs px-4"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1.5 block">
                {t('Usuário / API Key')}
              </label>
              <Input 
                type="password"
                placeholder="apikey"
                className="bg-black/30 border-white/10 text-white rounded-xl text-xs px-4"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1.5 block">
                {t('Senha / Secret')}
              </label>
              <Input 
                type="password"
                placeholder="••••••••"
                className="bg-black/30 border-white/10 text-white rounded-xl text-xs px-4"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1.5 block">
              {t('Remetente Padrão')}
            </label>
            <Input 
              placeholder="Cheotnun Beauty <no-reply@cheotnun.com>"
              className="bg-black/30 border-white/10 text-white rounded-xl text-xs px-4"
            />
          </div>

          <Button className="bg-accent hover:bg-accentHover text-background font-bold text-xs flex gap-2 w-fit">
            <Save className="h-4 w-4" /> {t('Salvar Configuração SMTP')}
          </Button>
        </div>
      </div>

      {/* Email Logs */}
      <div className="bg-card border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-accent uppercase tracking-wider">
            {t('Histórico de Envios')}
          </h3>
          <div className="flex gap-2">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-black/30 border-white/10 text-white rounded-xl text-xs px-3 py-1.5"
            >
              <option value="all">{t('Todos')}</option>
              {emailTypes.map(type => (
                <option key={type} value={type}>{t(type)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-3 text-[9px] text-accent uppercase tracking-wider font-bold">{t('Data/Hora')}</th>
                <th className="text-left py-3 px-3 text-[9px] text-accent uppercase tracking-wider font-bold">{t('Tipo')}</th>
                <th className="text-left py-3 px-3 text-[9px] text-accent uppercase tracking-wider font-bold">{t('Destinatário')}</th>
                <th className="text-left py-3 px-3 text-[9px] text-accent uppercase tracking-wider font-bold">{t('Assunto')}</th>
                <th className="text-left py-3 px-3 text-[9px] text-accent uppercase tracking-wider font-bold">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    {t('Nenhum e-mail enviado ainda')}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="py-3 px-3 text-white">
                      {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold text-accent uppercase px-2 py-1 bg-accent/10 rounded-full">
                        {log.type || 'custom'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white">{log.email}</td>
                    <td className="py-3 px-3 text-muted-foreground">{log.subject || '-'}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        log.status === 'sent' ? 'text-green-400 bg-green-500/10' :
                        log.status === 'failed' ? 'text-red-400 bg-red-500/10' :
                        'text-yellow-400 bg-yellow-500/10'
                      }`}>
                        {log.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex items-start gap-3">
        <Mail className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1.5">
          <h4 className="text-xs font-bold text-blue-300 uppercase">
            {t('Configuração de E-mail Profissional')}
          </h4>
          <p className="text-[10px] text-blue-200 leading-relaxed">
            {t('Para enviar e-mails com o domínio oficial da Cheotnun (ex: no-reply@cheotnun.com), configure um serviço SMTP como SendGrid, Mailgun ou Amazon SES. Os templates de e-mail estão disponíveis em espanhol, português e inglês e incluem: confirmação de cadastro, recuperação de senha e agradecimento de compra.')}
          </p>
        </div>
      </div>
    </div>
  );
}