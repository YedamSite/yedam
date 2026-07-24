'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ChatMessage {
  id: string;
  order_id: string;
  type: string;
  sender: 'client' | 'admin';
  content: string;
  created_at: string;
  sender_name?: string;
  sender_email?: string;
  user_id?: string;
}

interface ChatGroup {
  id: string;
  messages: ChatMessage[];
  lastMessage: ChatMessage;
}

export default function LiveChatTab() {
  const { t } = useLanguage();
  const [chats, setChats] = useState<ChatGroup[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMsgCountPerChat = useRef<Record<string, number>>({});
  const prevTotalChats = useRef(0);

  const loadChats = useCallback(async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (!data.messages) return;

      const grouped: Record<string, ChatMessage[]> = {};
      data.messages.forEach((m: ChatMessage) => {
        if (!grouped[m.order_id]) grouped[m.order_id] = [];
        grouped[m.order_id].push(m);
      });

      const chatList: ChatGroup[] = Object.keys(grouped).map(id => {
        const msgs = grouped[id].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        return { id, messages: msgs, lastMessage: msgs[msgs.length - 1] };
      }).sort(
        (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );

      setChats(chatList);
    } catch (e) {
      console.error('LiveChatTab: failed to load chats', e);
    }
  }, []);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 3000);
    return () => clearInterval(interval);
  }, [loadChats]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChatId) return;

    const content = message;
    setMessage('');

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeChatId, sender: 'admin', content }),
      });
      loadChats();
    } catch (err) {
      console.error('LiveChatTab: failed to send', err);
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  const scrollLockRef = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastAutoScrollRef = useRef<{ chatId: string | null; count: number }>({ chatId: null, count: 0 });

  useEffect(() => {
    if (!chatContainerRef.current) return;
    if (!activeChat) return;

    const currentCount = activeChat.messages.length;
    const isNewChat = activeChat.id !== lastAutoScrollRef.current.chatId;
    const hasNewMessages = currentCount > lastAutoScrollRef.current.count;

    if (isNewChat || hasNewMessages) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      scrollLockRef.current = false;
      lastAutoScrollRef.current = { chatId: activeChat.id, count: currentCount };
    }
  }, [activeChat?.id, activeChat?.messages?.length]);

  // Track user scrolling: if user scrolls up, lock auto-scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    scrollLockRef.current = !isAtBottom;
  };

  // When sending a message, unlock scroll and go to bottom
  const handleSendAndScroll = async (e: React.FormEvent) => {
    scrollLockRef.current = false;
    await sendMessage(e);
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="flex flex-col h-[600px] border border-white/5 rounded-3xl bg-card overflow-hidden">
      <div className="flex h-full">
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
                  onClick={() => { setActiveChatId(chat.id); scrollLockRef.current = false; }}
                  className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${activeChatId === chat.id ? 'bg-white/10' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs text-white uppercase tracking-wider truncate max-w-[180px]">
                      {chat.messages.find(m => m.sender_name)?.sender_name || chat.messages.find(m => m.sender_email)?.sender_email || chat.id.substring(0, 13)}
                    </span>
                    <span className="text-[9px] text-muted-foreground shrink-0 ml-2">
                      {new Date(chat.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {chat.messages.find(m => m.sender_email) && (
                    <p className="text-[8px] text-accent/60 uppercase tracking-wider mb-1 truncate">
                      {chat.messages.find(m => m.sender_email)?.sender_email}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    <strong className="text-accent">{chat.lastMessage.sender === 'admin' ? 'Tu: ' : 'Cliente: '}</strong>
                    {chat.lastMessage.content}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="w-2/3 flex flex-col bg-background/50">
          {activeChat ? (
            <>
                <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-secondary/30">
                  <div className="bg-white/10 p-2 rounded-full">
                    <User className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                      {activeChat.messages.find(m => m.sender_name)?.sender_name || t('Visitante')}
                    </h3>
                    {(activeChat.messages.find(m => m.sender_email)?.sender_email) && (
                      <span className="text-[10px] text-accent/70 block">
                        {activeChat.messages.find(m => m.sender_email)?.sender_email}
                      </span>
                    )}
                    <span className="text-[10px] text-green-400">{t('Online')}</span>
                  </div>
                </div>

              <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto flex flex-col gap-4" onScroll={handleScroll}>
                {activeChat.messages.map((msg) => (
                  <div key={msg.id} className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs ${msg.sender === 'admin' ? 'bg-accent text-background self-end rounded-tr-sm' : 'bg-secondary border border-white/5 text-white self-start rounded-tl-sm'}`}>
                    <p>{msg.content}</p>
                    <span className={`text-[9px] mt-1 block ${msg.sender === 'admin' ? 'text-background/70 text-right' : 'text-muted-foreground'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendAndScroll} className="p-4 bg-secondary/30 border-t border-white/5 flex gap-2">
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
