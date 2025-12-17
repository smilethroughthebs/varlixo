'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, RefreshCw, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { createSupportChatSocket } from '@/app/lib/supportChatSocket';
import { useAuthStore } from '@/app/lib/store';

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
  assignedAt?: string | Date;
  firstUserMessageAt?: string | Date;
  lastUserMessageAt?: string | Date;
  firstAdminReplyAt?: string | Date;
  lastAdminReplyAt?: string | Date;
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
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unassigned' | 'mine'>('unassigned');

  const socketRef = useRef<ReturnType<typeof createSupportChatSocket> | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const currentAdminId = user?.id;

  const visibleConversations = useMemo(() => {
    const base = conversations;
    if (inboxFilter === 'unassigned') {
      return base.filter((c) => !c.assignedAdminId);
    }
    if (inboxFilter === 'mine') {
      return base.filter((c) => !!currentAdminId && c.assignedAdminId === currentAdminId);
    }
    return base;
  }, [conversations, inboxFilter, currentAdminId]);

  const unassignedCount = useMemo(
    () => conversations.filter((c) => !c.assignedAdminId).length,
    [conversations],
  );

  const myCount = useMemo(
    () => conversations.filter((c) => !!currentAdminId && c.assignedAdminId === currentAdminId).length,
    [conversations, currentAdminId],
  );

  const formatDuration = (ms: number) => {
    if (!Number.isFinite(ms) || ms <= 0) return '—';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes <= 0) return `${seconds}s`;
    if (minutes < 60) return `${minutes}m ${seconds}s`;
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    return `${hours}h ${remMinutes}m`;
  };

  const fetchConversations = () => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('support:admin_list', (data: ConversationSummary[]) => {
      const normalized = (Array.isArray(data) ? data : []).map((c) => ({
        ...c,
        lastMessageAt: c.lastMessageAt ? new Date(c.lastMessageAt) : c.lastMessageAt,
        assignedAt: c.assignedAt ? new Date(c.assignedAt) : c.assignedAt,
        firstUserMessageAt: c.firstUserMessageAt ? new Date(c.firstUserMessageAt) : c.firstUserMessageAt,
        lastUserMessageAt: c.lastUserMessageAt ? new Date(c.lastUserMessageAt) : c.lastUserMessageAt,
        firstAdminReplyAt: c.firstAdminReplyAt ? new Date(c.firstAdminReplyAt) : c.firstAdminReplyAt,
        lastAdminReplyAt: c.lastAdminReplyAt ? new Date(c.lastAdminReplyAt) : c.lastAdminReplyAt,
      }));
      normalized.sort((a, b) => {
        const at = new Date(a.lastMessageAt ?? 0).getTime();
        const bt = new Date(b.lastMessageAt ?? 0).getTime();
        return bt - at;
      });
      setConversations(normalized);
    });
  };

  const assignActiveToMe = () => {
    const socket = socketRef.current;
    if (!socket || !activeConversationId) return;
    socket.emit('support:admin_assign', { conversationId: activeConversationId }, (resp: any) => {
      if (resp?.ok) return;
      if (resp?.message) toast.error(resp.message);
    });
  };

  const unassignActive = () => {
    const socket = socketRef.current;
    if (!socket || !activeConversationId) return;
    socket.emit('support:admin_unassign', { conversationId: activeConversationId }, (resp: any) => {
      if (resp?.ok) return;
      if (resp?.message) toast.error(resp.message);
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
    socket.emit('support:message', { conversationId: activeConversationId, text }, (resp: any) => {
      if (resp?.ok) return;
      if (resp?.message) toast.error(resp.message);
    });
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

    const onConversationUpdated = (c: ConversationSummary) => {
      if (!c?.id) return;

      const normalized: ConversationSummary = {
        ...c,
        lastMessageAt: c.lastMessageAt ? new Date(c.lastMessageAt) : c.lastMessageAt,
        assignedAt: c.assignedAt ? new Date(c.assignedAt) : c.assignedAt,
        firstUserMessageAt: c.firstUserMessageAt ? new Date(c.firstUserMessageAt) : c.firstUserMessageAt,
        lastUserMessageAt: c.lastUserMessageAt ? new Date(c.lastUserMessageAt) : c.lastUserMessageAt,
        firstAdminReplyAt: c.firstAdminReplyAt ? new Date(c.firstAdminReplyAt) : c.firstAdminReplyAt,
        lastAdminReplyAt: c.lastAdminReplyAt ? new Date(c.lastAdminReplyAt) : c.lastAdminReplyAt,
      };

      setConversations((prev) => {
        const idx = prev.findIndex((x) => x.id === normalized.id);
        const next = idx === -1 ? [normalized, ...prev] : prev.map((x) => (x.id === normalized.id ? { ...x, ...normalized } : x));
        next.sort((a, b) => {
          const at = new Date(a.lastMessageAt ?? 0).getTime();
          const bt = new Date(b.lastMessageAt ?? 0).getTime();
          return bt - at;
        });
        return next;
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('support:messages', onMessages);
    socket.on('support:message', onMessage);
    socket.on('support:conversation_updated', onConversationUpdated);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('support:messages', onMessages);
      socket.off('support:message', onMessage);
      socket.off('support:conversation_updated', onConversationUpdated);
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
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => setInboxFilter('unassigned')}
                className={
                  inboxFilter === 'unassigned'
                    ? 'px-3 py-1.5 bg-red-500/10 rounded-lg text-xs text-red-300 border border-red-500/20'
                    : 'px-3 py-1.5 bg-dark-700/40 rounded-lg text-xs text-gray-300 border border-dark-600'
                }
              >
                Unassigned ({unassignedCount})
              </button>
              <button
                onClick={() => setInboxFilter('mine')}
                className={
                  inboxFilter === 'mine'
                    ? 'px-3 py-1.5 bg-red-500/10 rounded-lg text-xs text-red-300 border border-red-500/20'
                    : 'px-3 py-1.5 bg-dark-700/40 rounded-lg text-xs text-gray-300 border border-dark-600'
                }
              >
                Mine ({myCount})
              </button>
              <button
                onClick={() => setInboxFilter('all')}
                className={
                  inboxFilter === 'all'
                    ? 'px-3 py-1.5 bg-red-500/10 rounded-lg text-xs text-red-300 border border-red-500/20'
                    : 'px-3 py-1.5 bg-dark-700/40 rounded-lg text-xs text-gray-300 border border-dark-600'
                }
              >
                All ({conversations.length})
              </button>
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {visibleConversations.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No active conversations</div>
            ) : (
              visibleConversations.map((c) => {
                const isActive = c.id === activeConversationId;
                const name = `${c.user?.firstName ?? ''} ${c.user?.lastName ?? ''}`.trim();
                const isMine = !!currentAdminId && c.assignedAdminId === currentAdminId;
                const waitingSince = (c.lastUserMessageAt ?? c.firstUserMessageAt) as any;
                const waitingMs = waitingSince ? Date.now() - new Date(waitingSince).getTime() : 0;
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
                        <div className="mt-1 flex items-center gap-2">
                          {!c.assignedAdminId ? (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                              Unassigned
                            </span>
                          ) : isMine ? (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-green-500/10 text-green-300 border border-green-500/20">
                              Mine
                            </span>
                          ) : (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-dark-700/60 text-gray-300 border border-dark-600">
                              Assigned
                            </span>
                          )}
                          <span className="text-[11px] text-gray-500">Wait: {formatDuration(waitingMs)}</span>
                        </div>
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
            <div className="flex items-center justify-between gap-3">
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

              {activeConversationId && activeConversation ? (
                <div className="flex items-center gap-2">
                  {!activeConversation.assignedAdminId ? (
                    <Button size="sm" variant="secondary" onClick={() => assignActiveToMe()}>
                      Assign to me
                    </Button>
                  ) : activeConversation.assignedAdminId === currentAdminId ? (
                    <Button size="sm" variant="secondary" onClick={() => unassignActive()}>
                      Unassign
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-500">Assigned</span>
                  )}
                </div>
              ) : null}
            </div>

            {activeConversation ? (
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                <span>
                  First response:{' '}
                  {activeConversation.firstAdminReplyAt && activeConversation.firstUserMessageAt
                    ? formatDuration(
                        new Date(activeConversation.firstAdminReplyAt).getTime() -
                          new Date(activeConversation.firstUserMessageAt).getTime(),
                      )
                    : '—'}
                </span>
                <span>
                  Waiting:{' '}
                  {activeConversation.lastUserMessageAt || activeConversation.firstUserMessageAt
                    ? formatDuration(
                        Date.now() -
                          new Date(
                            (activeConversation.lastUserMessageAt ?? activeConversation.firstUserMessageAt) as any,
                          ).getTime(),
                      )
                    : '—'}
                </span>
              </div>
            ) : null}
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
              {(() => {
                const isAssignedToOther =
                  !!activeConversationId &&
                  !!activeConversation?.assignedAdminId &&
                  !!currentAdminId &&
                  activeConversation.assignedAdminId !== currentAdminId;
                const disabled = !activeConversationId || isAssignedToOther;
                const placeholder = !activeConversationId
                  ? 'Select a conversation first'
                  : isAssignedToOther
                    ? 'This conversation is assigned to another admin'
                    : 'Type a reply...';

                return (
                  <>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') sendMessage();
                      }}
                      disabled={disabled}
                      placeholder={placeholder}
                      className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => sendMessage()}
                      disabled={disabled || !input.trim()}
                      rightIcon={<Send size={16} />}
                    >
                      Send
                    </Button>
                  </>
                );
              })()}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
