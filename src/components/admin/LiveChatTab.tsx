'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LiveChatTab() {
  const { t } = useLanguage();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadChats = () => {
    const logs = db.get('communication_logs') || [];
    const chatLogs = logs.filter((l: any) => l.type === 'chat');
    
    // Group by chat_id (order_id)
    const grouped: Record<string, any[]> = {};
    chatLogs.forEach((l: any) => {
      if (!grouped[l.order_id]) grouped[l.order_id] = [];
      grouped[l.order_id].push(l);
    });

    const chatList = Object.keys(grouped).map(id => {
      const msgs = grouped[id].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      return {
        id,
        messages: msgs,
        lastMessage: msgs[msgs.length - 1]
      };
    }).sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());

    setChats(chatList);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChatId) return;

    const newMsg = {
      id: crypto.randomUUID(),
      order_id: activeChatId,
      type: 'chat',
      sender: 'admin',
      content: message,
      created_at: new Date().toISOString()
    };

    const logs = db.get('communication_logs') || [];
    db.save('communication_logs', [...logs, newMsg]);
    
    setMessage('');
    loadChats();
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, activeChatId]);

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="flex flex-col h-[600px] border border-white/5 rounded-3xl bg-card overflow-hidden">
      <div className="flex h-full">
        {/* Chat List Sidebar */}
        <div className="w-1/3 border-r border-white/5 flex flex-col bg-secondary/20">
          <div className="p-4 border-b border-white/5">
            <h2 className="font-heading text-lg text-white">{t('Conversas')} ({chats.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="text-center p-4 text-xs text-muted-foreground mt-10">
                {t('Nenhuma conversa no momento.')}
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${activeChatId === chat.id ? 'bg-white/10' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs text-white uppercase tracking-wider">{chat.id.substring(0, 13)}</span>
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(chat.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    <strong className="text-accent">{chat.lastMessage.sender === 'admin' ? 'Tu: ' : 'Cliente: '}</strong>
                    {chat.lastMessage.content}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-background/50">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-secondary/30">
                <div className="bg-white/10 p-2 rounded-full">
                  <User className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">{t('Visitante')} - {activeChat.id.substring(0, 8)}</h3>
                  <span className="text-[10px] text-green-400">{t('Online')}</span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                {activeChat.messages.map((msg: any) => (
                  <div key={msg.id} className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs ${msg.sender === 'admin' ? 'bg-accent text-background self-end rounded-tr-sm' : 'bg-secondary border border-white/5 text-white self-start rounded-tl-sm'}`}>
                    <p>{msg.content}</p>
                    <span className={`text-[9px] mt-1 block ${msg.sender === 'admin' ? 'text-background/70 text-right' : 'text-muted-foreground'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 bg-secondary/30 border-t border-white/5 flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('Escreva uma resposta...')}
                  className="bg-black/30 border-white/10 text-white text-xs h-10"
                />
                <Button type="submit" disabled={!message.trim()} className="bg-accent hover:bg-accentHover text-background px-6 h-10 rounded-xl font-bold">
                  {t('Enviar')} <Send className="h-3 w-3 ml-2" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <MessageCircle className="h-12 w-12 mb-4" />
              <p className="text-sm">{t('Selecione uma conversa para responder.')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
