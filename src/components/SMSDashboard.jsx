import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Phone, Clock, User, AlertCircle } from 'lucide-react';

const SMSDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.phone_number);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/get-sms-conversations');
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
    setLoading(false);
  };

  const loadMessages = async (phoneNumber) => {
    try {
      const response = await fetch(`/api/get-conversation-messages?phone_number=${encodeURIComponent(phoneNumber)}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedConversation.phone_number,
          message: newMessage,
          sentBy: 'Admin' // You can make this dynamic based on logged-in user
        })
      });

      const data = await response.json();
      if (data.success) {
        // Add the sent message to the messages list
        const sentMessage = {
          id: Date.now(),
          message_body: newMessage,
          direction: 'outbound',
          sent_at: new Date().toISOString(),
          sent_by_user: 'Admin'
        };
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        
        // Refresh conversations to update last message
        loadConversations();
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
    // Format +15551234567 to (555) 123-4567
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phone;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">SMS Management</h2>
          </div>
          <button
            onClick={loadConversations}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
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
              <div className="text-center py-4 text-gray-500">No conversations yet</div>
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
                          {conversation.contact_name || formatPhoneNumber(conversation.phone_number)}
                        </span>
                      </div>
                      {conversation.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.last_message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatTime(conversation.last_message_at)}
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
                      {selectedConversation.contact_name || 'Unknown Contact'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatPhoneNumber(selectedConversation.phone_number)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
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
                      <p className="text-sm">{message.message_body}</p>
                      <div className={`flex items-center space-x-1 mt-1 ${
                        message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">
                          {formatTime(message.sent_at)}
                          {message.direction === 'outbound' && message.sent_by_user && (
                            ` • ${message.sent_by_user}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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
                    <Send className="h-4 w-4" />
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