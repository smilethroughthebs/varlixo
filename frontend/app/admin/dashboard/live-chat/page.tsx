'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, RefreshCw, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { createSupportChatSocket } from '@/app/lib/supportChatSocket';

type ConversationSummary = {
  id: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  status: string;
  lastMessageAt?: string | Date;
  assignedAdminId?: string;
};

type SupportMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderKind: 'user' | 'admin';
  text: string;
  createdAt: string | Date;
};

export default function AdminLiveChatPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');

  const socketRef = useRef<ReturnType<typeof createSupportChatSocket> | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const fetchConversations = () => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('support:admin_list', (data: ConversationSummary[]) => {
      setConversations(Array.isArray(data) ? data : []);
    });
  };

  const joinConversation = (conversationId: string) => {
    const socket = socketRef.current;
    if (!socket) return;

    setActiveConversationId(conversationId);
    socket.emit('support:admin_join', { conversationId });
  };

  const sendMessage = () => {
    const socket = socketRef.current;
    if (!socket || !activeConversationId) return;

    const text = input.trim();
    if (!text) return;

    setInput('');
    socket.emit('support:message', { conversationId: activeConversationId, text });
  };

  useEffect(() => {
    const socket = createSupportChatSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setIsConnected(true);
      fetchConversations();
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = () => {
      setIsConnected(false);
      toast.error('Live chat connection failed');
    };

    const onMessages = (data: SupportMessage[]) => {
      if (!Array.isArray(data)) return;
      setMessages(
        data.map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        })),
      );
    };

    const onMessage = (m: SupportMessage) => {
      if (!m?.conversationId) return;

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === m.conversationId);
        if (idx === -1) return prev;

        const next = [...prev];
        next[idx] = { ...next[idx], lastMessageAt: m.createdAt };
        next.sort((a, b) => {
          const at = new Date(a.lastMessageAt ?? 0).getTime();
          const bt = new Date(b.lastMessageAt ?? 0).getTime();
          return bt - at;
        });
        return next;
      });

      if (m.conversationId !== activeConversationIdRef.current) return;

      setMessages((prev) => {
        const exists = prev.some((x) => x.id === m.id);
        if (exists) return prev;
        return [...prev, { ...m, createdAt: new Date(m.createdAt) }];
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('support:messages', onMessages);
    socket.on('support:message', onMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('support:messages', onMessages);
      socket.off('support:message', onMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageCircle className="text-red-500" />
            Live Chat
          </h1>
          <p className="text-gray-400 mt-1">Real-time support inbox</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={
            isConnected
              ? 'px-3 py-1.5 bg-green-500/10 rounded-lg text-sm text-green-400'
              : 'px-3 py-1.5 bg-yellow-500/10 rounded-lg text-sm text-yellow-400'
          }>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchConversations()}
            leftIcon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-0 overflow-hidden">
          <div className="p-4 border-b border-dark-700">
            <p className="text-sm font-semibold text-white">Conversations</p>
            <p className="text-xs text-gray-500">Open chats</p>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No active conversations</div>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === activeConversationId;
                const name = `${c.user?.firstName ?? ''} ${c.user?.lastName ?? ''}`.trim();
                return (
                  <button
                    key={c.id}
                    onClick={() => joinConversation(c.id)}
                    className={
                      isActive
                        ? 'w-full text-left px-4 py-3 border-b border-dark-700 bg-red-500/10'
                        : 'w-full text-left px-4 py-3 border-b border-dark-700 hover:bg-dark-700/40'
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {name || c.user?.email || 'User'}
                        </p>
                        {c.user?.email && (
                          <p className="text-xs text-gray-500">{c.user.email}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(c.lastMessageAt ?? 0).toLocaleTimeString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-4 border-b border-dark-700">
            <p className="text-sm font-semibold text-white">
              {activeConversation ? (
                <span>
                  {`${activeConversation.user?.firstName ?? ''} ${activeConversation.user?.lastName ?? ''}`.trim() ||
                    activeConversation.user?.email ||
                    'Conversation'}
                </span>
              ) : (
                <span>Select a conversation</span>
              )}
            </p>
          </div>

          <div className="h-[520px] overflow-y-auto p-4 space-y-3 bg-dark-900/30">
            {activeConversationId ? (
              messages.length === 0 ? (
                <p className="text-sm text-gray-500">No messages yet</p>
              ) : (
                messages
                  .filter((m) => m.conversationId === activeConversationId)
                  .map((m) => (
                    <div
                      key={m.id}
                      className={m.senderKind === 'admin' ? 'flex justify-end' : 'flex justify-start'}
                    >
                      <div
                        className={
                          m.senderKind === 'admin'
                            ? 'max-w-[80%] bg-red-500 text-white rounded-2xl rounded-br-md px-4 py-3'
                            : 'max-w-[80%] bg-dark-700 text-gray-200 rounded-2xl rounded-bl-md px-4 py-3'
                        }
                      >
                        <p className="text-sm whitespace-pre-line">{m.text}</p>
                        <p className={m.senderKind === 'admin' ? 'text-xs mt-1 text-white/70' : 'text-xs mt-1 text-gray-500'}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
              )
            ) : (
              <p className="text-sm text-gray-500">Choose a conversation from the left panel</p>
            )}
          </div>

          <div className="p-4 border-t border-dark-700 bg-dark-800">
            <div className="flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                disabled={!activeConversationId}
                placeholder={activeConversationId ? 'Type a reply...' : 'Select a conversation first'}
                className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              <Button
                variant="danger"
                size="md"
                onClick={() => sendMessage()}
                disabled={!activeConversationId || !input.trim()}
                rightIcon={<Send size={16} />}
              >
                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
