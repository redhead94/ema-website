import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Search,
  MoreVertical,
  Circle,
  ArrowLeft,
} from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizePhone, markRead } from '../utils/conversation';

const SMSDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- helpers ---
  const safePhone = (c) => normalizePhone(c?.phoneNumber || c?.id || '');

  const formatPhone = (phone = '') => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const n = cleaned.slice(1);
      return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
    }
    return phone;
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // --- conversations listener ---
useEffect(() => {
  if (!db) return;
  // Try ordered query first, then gracefully fall back to an unordered read
  const ordered = query(
    collection(db, 'sms_conversations'),
    orderBy('lastMessageAt', 'desc')
  );
  const unsub = onSnapshot(
    ordered,
    async (snap) => {
      let list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));

      if (list.length === 0) {
        // Fallback: read without order (handles older docs missing lastMessageAt)
        try {
          const raw = await getDocs(collection(db, 'sms_conversations'));
          const fallback = [];
          raw.forEach((d) => fallback.push({ id: d.id, ...d.data() }));
          setConversations(fallback);
        } catch (e) {
          console.warn('sms_conversations fallback failed', e);
          setConversations([]);
        }
      } else {
        setConversations(list);
      }
    },
    async (err) => {
      // If the ordered query errors (e.g., index/field issues), fall back
      console.warn('ordered conversations query error, falling back:', err);
      try {
        const raw = await getDocs(collection(db, 'sms_conversations'));
        const fallback = [];
        raw.forEach((d) => fallback.push({ id: d.id, ...d.data() }));
        setConversations(fallback);
      } catch (e) {
        console.warn('sms_conversations fallback failed', e);
        setConversations([]);
      }
    }
  );
  return unsub;
}, []);


  // --- messages listener (guarded) ---
  useEffect(() => {
    if (!db) return;
    const phone = safePhone(selectedConversation);
    if (!phone) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'sms_messages'),
      where('phoneNumber', '==', phone),
      orderBy('sentAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((d) => {
        const data = d.data();
        const iso =
          data.sentAt?.toDate?.()?.toISOString() ||
          (typeof data.sentAt === 'string' ? data.sentAt : new Date().toISOString());
        list.push({ id: d.id, ...data, sentAt: iso });
      });
      setMessages(list);
      // mark read (guarded)
      markRead(phone).catch(() => {});
    });

    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, selectedConversation?.phoneNumber, selectedConversation?.id]);

  const sendMessage = async () => {
    const phone = safePhone(selectedConversation);
    if (!newMessage.trim() || !phone) return;
    setSendingMessage(true);
    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phone,
          message: newMessage,
          sentBy: 'Admin',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.success) setNewMessage('');
    } catch (e) {
      console.error('Error sending message:', e);
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const name = (c.contactName || '').toLowerCase();
    const phone = (c.phoneNumber || c.id || '').toLowerCase();
    const last = (c.lastMessage || '').toLowerCase();
    const s = searchTerm.toLowerCase();
    return name.includes(s) || phone.includes(s) || last.includes(s);
  });

  if (!db) {
    return (
      <div className="h-full min-h-0 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to SMS system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 bg-white md:flex md:flex-row flex flex-col">
      {/* ===== Sidebar (conversations) ===== */}
      <div
        className={`md:w-96 w-full md:border-r border-gray-200 md:flex md:flex-col
        ${selectedConversation ? 'hidden md:flex' : 'flex flex-col'}`}
      >
        <div className="p-4 md:p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Messages</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-500">Live</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm mt-1">
                Messages will appear here when people text your number
              </p>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isActive =
                selectedConversation &&
                safePhone(selectedConversation) === safePhone(c);
              const lastAt = c.lastMessageAt?.toDate?.()
                ? c.lastMessageAt.toDate()
                : null;
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() =>
                    setSelectedConversation({
                      ...c,
                      phoneNumber: safePhone(c),
                    })
                  }
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors relative ${
                    isActive ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {(c.contactName || 'U').charAt(0).toUpperCase()}
                      </div>
                      {c.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {c.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {c.contactName || 'Unknown Contact'}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {lastAt ? formatTime(lastAt) : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {formatPhone(safePhone(c))}
                      </p>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {c.lastMessage || 'No messages yet'}
                      </p>
                      {c.contactType && (
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                              ${
                                c.contactType === 'family'
                                  ? 'bg-pink-100 text-pink-800'
                                  : c.contactType === 'volunteer'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {c.contactType}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ===== Chat pane ===== */}
      <div
        className={`flex-1 min-h-0 flex flex-col ${
          selectedConversation ? 'flex' : 'hidden md:flex'
        }`}
      >
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    className="md:hidden mr-1 p-2 -ml-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {(selectedConversation.contactName || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedConversation.contactName || 'Unknown Contact'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {formatPhone(safePhone(selectedConversation))}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Circle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No messages in this conversation</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.direction === 'outbound' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl 
                        ${
                          m.direction === 'outbound'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-md'
                        }
                        max-w-[80%] md:max-w-md`}
                    >
                      <p className="text-sm leading-relaxed">{m.body}</p>
                      <div
                        className={`flex items-center justify-end space-x-1 mt-2 ${
                          m.direction === 'outbound' ? 'text-blue-100' : 'text-gray-400'
                        }`}
                      >
                        <span className="text-xs">{formatTime(m.sentAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 md:p-4 bg-white border-t border-gray-200">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSDashboard;
