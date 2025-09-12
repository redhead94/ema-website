import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Phone, Clock, User, AlertCircle, RefreshCw } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';

// Firebase configuration - same as your other components
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

const SMSDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Check Firebase initialization
  useEffect(() => {
    if (db) {
      setFirebaseReady(true);
    }
  }, []);

  // Real-time listener for conversations
  useEffect(() => {
    if (!db) return;

    setLoading(true);
    
    const q = query(
      collection(db, 'sms_conversations'), 
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationList = [];
      snapshot.forEach((doc) => {
        conversationList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('Loaded conversations from Firebase:', conversationList);
      setConversations(conversationList);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to conversations:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseReady]);

  // Real-time listener for messages when conversation is selected
  useEffect(() => {
    if (!db || !selectedConversation) {
      console.log('No db or selected conversation:', { db: !!db, selectedConversation });
      setMessages([]);
      return;
    }

    console.log('Setting up message listener for:', selectedConversation.phoneNumber);

    const q = query(
      collection(db, 'sms_messages'),
      where('phoneNumber', '==', selectedConversation.phoneNumber),
      orderBy('sentAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Message snapshot received, size:', snapshot.size);
      const messageList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Message data:', data);
        messageList.push({
          id: doc.id,
          ...data,
          sentAt: data.sentAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      
      console.log('Final message list:', messageList);
      setMessages(messageList);
      
      // Mark conversation as read when messages are loaded
      if (messageList.length > 0) {
        markConversationAsRead(selectedConversation.phoneNumber);
      }
    }, (error) => {
      console.error('Error in message listener:', error);
    });

    return () => unsubscribe();
  }, [selectedConversation?.phoneNumber, firebaseReady]);

  const markConversationAsRead = async (phoneNumber) => {
    if (!db) return;
    
    try {
      const conversationRef = doc(db, 'sms_conversations', phoneNumber);
      await updateDoc(conversationRef, {
        unreadCount: 0
      });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !db) return;

    setSendingMessage(true);
    try {
      // Send via Twilio API
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedConversation.phoneNumber,
          message: newMessage,
          sentBy: 'Admin'
        })
      });

      const data = await response.json();
      if (data.success) {
        // The real-time listener will pick up the sent message automatically
        setNewMessage('');
      } else {
        alert('Failed to send message: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
    setSendingMessage(false);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phone;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!firebaseReady) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2 text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Connecting to Firebase...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">SMS Management</h2>
            <span className="text-sm text-gray-500">
              ({conversations.length} conversations)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Live Updates
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-96">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Conversations</h3>
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No conversations yet</p>
                <p className="text-xs mt-1">Send a text to your Twilio number to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {conversation.contactName || formatPhoneNumber(conversation.phoneNumber)}
                        </span>
                        {conversation.contactType && (
                          <span className={`text-xs px-1 py-0.5 rounded ${
                            conversation.contactType === 'family' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {conversation.contactType}
                          </span>
                        )}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatTime(conversation.lastMessageAt?.toDate?.())}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        conversation.status === 'active' ? 'bg-green-100 text-green-800' :
                        conversation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {conversation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Messages Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedConversation.contactName || 'Unknown Contact'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatPhoneNumber(selectedConversation.phoneNumber)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No messages found</p>
                    <p className="text-xs mt-1">Check console for debugging info</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.direction === 'outbound'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.body}</p>
                        <div className={`flex items-center space-x-1 mt-1 ${
                          message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">
                            {formatTime(message.sentAt)}
                            {message.direction === 'outbound' && message.sentBy && (
                              ` • ${message.sentBy}`
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingMessage ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SMSDashboard;