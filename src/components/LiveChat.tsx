'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/db';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';

export default function LiveChat() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [chatId, setChatId] = useState<string>('');
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate a unique session ID for the guest or use existing
    let sid = localStorage.getItem('cheotnun_chat_id');
    if (!sid) {
      sid = 'chat-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('cheotnun_chat_id', sid);
    }
    setChatId(sid);
    loadMessages(sid);
    
    // Poll for new messages (simulate real-time)
    const interval = setInterval(() => loadMessages(sid), 3000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = (id: string) => {
    const logs = db.get('communication_logs') || [];
    const chatMsgs = logs.filter((l: any) => l.type === 'chat' && l.order_id === id);
    // order by created_at
    chatMsgs.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    // Auto-reply logic (simulate admin if there's only user messages and the last one is from user)
    if (chatMsgs.length > 0 && chatMsgs[chatMsgs.length - 1].sender === 'client') {
      const lastClientMsgTime = new Date(chatMsgs[chatMsgs.length - 1].created_at).getTime();
      const now = new Date().getTime();
      if (now - lastClientMsgTime > 15000 && chatMsgs.filter(m => m.sender === 'admin').length === 0) {
        // Automatically reply after 15 seconds if admin hasn't
        sendAutoReply(id, logs);
      }
    }
    
    setMessages(chatMsgs);
  };

  const sendAutoReply = (id: string, logs: any[]) => {
    const reply = {
      id: crypto.randomUUID(),
      order_id: id,
      type: 'chat',
      sender: 'admin',
      content: t('Hola! En este momento todos nuestros asesores están ocupados. Deja tu consulta y correo electrónico y te responderemos a la brevedad.'),
      created_at: new Date().toISOString()
    };
    db.save('communication_logs', [...logs, reply]);
    setMessages(prev => [...prev, reply]);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = {
      id: crypto.randomUUID(),
      order_id: chatId,
      type: 'chat',
      sender: 'client',
      content: message,
      created_at: new Date().toISOString()
    };

    const logs = db.get('communication_logs') || [];
    db.save('communication_logs', [...logs, newMsg]);
    
    setMessages([...messages, newMsg]);
    setMessage('');
  };

  const prevMessagesLength = useRef(0);
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      const newMsgs = messages.slice(prevMessagesLength.current);
      const hasNewAdminMsg = newMsgs.some(m => m.sender === 'admin');
      if (hasNewAdminMsg && !isOpen) {
        setUnread(prev => prev + newMsgs.filter(m => m.sender === 'admin').length);
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => { setIsOpen(true); setUnread(0); }}
        className={`fixed bottom-6 z-50 bg-accent hover:bg-accentHover text-background p-4 rounded-full shadow-2xl transition-all duration-300 transform ${isOpen ? '-right-20 scale-0' : 'right-6 scale-100'}`}
      >
        <MessageCircle className="h-6 w-6" />
        {unread > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-bounce">
            {unread}
          </span>
        )}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 visible' : 'scale-0 opacity-0 invisible'}`}>
        {/* Header */}
        <div className="bg-accent text-background p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-background/20 p-2 rounded-full">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-none">{t('Atención al Cliente')}</h3>
              <span className="text-[10px] opacity-80">{t('Respondemos enseguida')}</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-background/20 p-1 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="h-80 bg-background/50 p-4 overflow-y-auto flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground my-auto flex flex-col items-center gap-2">
              <MessageCircle className="h-8 w-8 opacity-20" />
              <p>{t('¡Hola! ¿En qué podemos ayudarte hoy?')}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'client' ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-muted-foreground mb-1 px-1">
                  {msg.sender === 'client' ? t('Você') : t('Atendimento')}
                </span>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-xs ${msg.sender === 'client' ? 'bg-accent text-background rounded-tr-sm' : 'bg-secondary border border-white/5 text-white rounded-tl-sm'}`}>
                  <p>{msg.content}</p>
                  <span className={`text-[8px] mt-1 block ${msg.sender === 'client' ? 'text-background/70 text-right' : 'text-muted-foreground'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="p-3 bg-secondary/50 border-t border-white/5 flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('Escribe tu mensaje...')}
            className="bg-background border-white/10 text-white text-xs h-10"
          />
          <Button type="submit" disabled={!message.trim()} className="bg-accent hover:bg-accentHover text-background px-3 h-10 rounded-xl">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
