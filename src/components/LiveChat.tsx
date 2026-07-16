'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  const loadMessages = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error('Chat: failed to load messages', e);
    }
  }, []);

  useEffect(() => {
    let sid = localStorage.getItem('cheotnun_chat_id');
    if (!sid) {
      sid = 'chat-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('cheotnun_chat_id', sid);
    }
    setChatId(sid);
    loadMessages(sid);

    const interval = setInterval(() => loadMessages(sid), 3000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !chatId) return;

    const content = message;
    setMessage('');

    // Optimistic update
    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      order_id: chatId,
      type: 'chat',
      sender: 'client',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: chatId, sender: 'client', content }),
      });
      // Reload to get the server-assigned order
      loadMessages(chatId);
    } catch (e) {
      console.error('Chat: failed to send message', e);
    }
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

      <div className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 visible' : 'scale-0 opacity-0 invisible'}`}>
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
