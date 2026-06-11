'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import styles from './ChatInterface.module.css';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

interface Conversation {
  user: Profile;
  lastMessage: Message;
  unreadCount: number;
}

interface Props {
  currentUser: Profile;
  initialActiveProfile?: Profile | null;
}

export default function ChatInterface({ currentUser, initialActiveProfile }: Props) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(initialActiveProfile || null);
  const [inputContent, setInputContent] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all messages for the current user
  useEffect(() => {
    async function fetchMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, username, display_name, avatar_url),
          receiver:profiles!receiver_id(id, username, display_name, avatar_url)
        `)
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as Message[]);
      }
      setLoading(false);
    }
    fetchMessages();
  }, [currentUser.id, supabase]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMessage = payload.new as Message;
          // If it involves us
          if (newMessage.sender_id === currentUser.id || newMessage.receiver_id === currentUser.id) {
            // Fetch profile info since realtime payload only has foreign keys
            const { data: sender } = await supabase.from('profiles').select('*').eq('id', newMessage.sender_id).single();
            const { data: receiver } = await supabase.from('profiles').select('*').eq('id', newMessage.receiver_id).single();

            const completeMessage: Message = {
              ...newMessage,
              sender: sender || undefined,
              receiver: receiver || undefined
            };
            
            setMessages((prev) => [...prev, completeMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id, supabase]);

  // Mark messages as read when active profile changes
  useEffect(() => {
    if (activeProfile) {
      const unreadIds = messages
        .filter(m => m.sender_id === activeProfile.id && m.receiver_id === currentUser.id && !m.is_read)
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
        supabase.from('messages').update({ is_read: true }).in('id', unreadIds).then();
        // Optimistically update local state
        setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m));
      }
    }
  }, [activeProfile, messages, currentUser.id, supabase]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeProfile]);

  // Compute conversations list
  const conversations = useMemo(() => {
    const map = new Map<string, Conversation>();
    
    // Process messages chronologically (they are sorted ascending)
    messages.forEach(msg => {
      const isSender = msg.sender_id === currentUser.id;
      const otherUser = isSender ? msg.receiver : msg.sender;
      if (!otherUser) return;
      
      const isUnread = !isSender && !msg.is_read;
      const existing = map.get(otherUser.id);
      
      map.set(otherUser.id, {
        user: otherUser,
        lastMessage: msg,
        unreadCount: (existing ? existing.unreadCount : 0) + (isUnread ? 1 : 0)
      });
    });

    // If initialActiveProfile is present but they have no messages yet, add them to the top manually
    if (initialActiveProfile && !map.has(initialActiveProfile.id)) {
      map.set(initialActiveProfile.id, {
        user: initialActiveProfile,
        lastMessage: {
           id: 'temp', 
           sender_id: currentUser.id, 
           receiver_id: initialActiveProfile.id, 
           content: 'Start a conversation...', 
           is_read: true, 
           created_at: new Date().toISOString() 
        },
        unreadCount: 0
      });
    }

    // Sort by most recent message
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );
  }, [messages, currentUser.id, initialActiveProfile]);

  // Active chat messages
  const activeMessages = useMemo(() => {
    if (!activeProfile) return [];
    return messages.filter(
      m => (m.sender_id === currentUser.id && m.receiver_id === activeProfile.id) ||
           (m.sender_id === activeProfile.id && m.receiver_id === currentUser.id)
    );
  }, [messages, activeProfile, currentUser.id]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputContent.trim() || !activeProfile || sending) return;

    setSending(true);
    const text = inputContent.trim();
    setInputContent('');

    // Insert to DB directly
    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: activeProfile.id,
      content: text
    });
    
    setSending(false);
  }

  // CSS variables for mobile layout toggling
  const containerStyle = {
    '--show-sidebar': activeProfile ? 'none' : 'flex',
    '--show-chat': activeProfile ? 'flex' : 'none'
  } as React.CSSProperties;

  return (
    <div className={styles.container} style={containerStyle}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Messages</h2>
        </div>
        
        {loading ? (
           <div className={styles.loadingOverlay} style={{position: 'relative', flex: 1}}>
             <div className={styles.spinner} />
           </div>
        ) : conversations.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={32} className={styles.emptyIcon} />
            <p>No messages yet.</p>
            <p style={{fontSize: 'var(--text-sm)', marginTop: '8px'}}>Visit a user&apos;s profile to message them!</p>
          </div>
        ) : (
          <div className={styles.conversationList}>
            {conversations.map(c => (
              <div 
                key={c.user.id} 
                className={`${styles.conversationItem} ${activeProfile?.id === c.user.id ? styles.active : ''}`}
                onClick={() => setActiveProfile(c.user)}
              >
                <div className={styles.avatarWrap}>
                  {c.user.avatar_url ? (
                    <img src={c.user.avatar_url} alt={c.user.username} className={styles.avatar} />
                  ) : (
                    c.user.username[0].toUpperCase()
                  )}
                </div>
                <div className={styles.convoInfo}>
                  <div className={styles.convoName}>{c.user.display_name}</div>
                  <div className={styles.convoLastMsg}>
                    {c.lastMessage.sender_id === currentUser.id ? 'You: ' : ''}
                    {c.lastMessage.content}
                  </div>
                </div>
                {c.unreadCount > 0 && <div className={styles.unreadDot} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {activeProfile ? (
          <>
            <div className={styles.chatHeader}>
              <button 
                className={styles.mobileBackBtn} 
                onClick={() => setActiveProfile(null)}
                aria-label="Back to messages list"
              >
                <ArrowLeft size={20} />
              </button>
              <div className={styles.avatarWrap} style={{width: 36, height: 36}}>
                {activeProfile.avatar_url ? (
                  <img src={activeProfile.avatar_url} alt={activeProfile.username} className={styles.avatar} />
                ) : (
                  activeProfile.username[0].toUpperCase()
                )}
              </div>
              <Link href={`/u/${activeProfile.username}`} className={styles.convoName} style={{textDecoration: 'none'}}>
                {activeProfile.display_name}
              </Link>
            </div>

            <div className={styles.messagesList}>
              {activeMessages.map(msg => {
                const isMine = msg.sender_id === currentUser.id;
                const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                if (msg.id === 'temp') return null; // Hide temp initial message

                return (
                  <div key={msg.id} className={`${styles.messageRow} ${isMine ? styles.mine : styles.theirs}`}>
                    <div className={styles.messageBubble}>
                      {msg.content}
                    </div>
                    <div className={styles.messageTime}>{time}</div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <form onSubmit={handleSend} className={styles.inputForm}>
                <input 
                  type="text" 
                  value={inputContent}
                  onChange={e => setInputContent(e.target.value)}
                  placeholder={`Message @${activeProfile.username}...`}
                  className={styles.inputField}
                  autoComplete="off"
                />
                <button type="submit" className={styles.sendBtn} disabled={!inputContent.trim() || sending}>
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={styles.emptyState} style={{display: 'var(--show-chat, flex)'}}>
            <MessageSquare size={48} className={styles.emptyIcon} />
            <h2>Your Messages</h2>
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
