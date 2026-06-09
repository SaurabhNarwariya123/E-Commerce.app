import React, { useState, useEffect } from 'react';
import AIChat from '../components/AIChat';

const ChatPage = () => {
  const userId = localStorage.getItem('userId');
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const orderRes = await fetch('/api/order/list', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const orders = await orderRes.json();
      setStats({
        totalOrders: orders.data?.length || 0,
        totalRevenue: orders.data?.reduce((sum, o) => sum + o.amount, 0) || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-gradient-to-b from-purple-600 to-purple-800 text-white p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        {/* Quick Stats */}
        <div className="space-y-3 mb-8">
          <div className="bg-purple-700 bg-opacity-50 p-4 rounded-lg border border-purple-500">
            <div className="text-sm text-purple-200">Total Orders</div>
            <div className="text-2xl font-bold">{isLoadingStats ? '...' : stats?.totalOrders || 0}</div>
          </div>

          <div className="bg-purple-700 bg-opacity-50 p-4 rounded-lg border border-purple-500">
            <div className="text-sm text-purple-200">Total Revenue</div>
            <div className="text-2xl font-bold">${(stats?.totalRevenue || 0).toFixed(2)}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <ul className="space-y-2">
            <li>
              <button className="w-full text-left px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded transition">
                📦 Today's Orders
              </button>
            </li>
            <li>
              <button className="w-full text-left px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded transition">
                💰 Monthly Sales
              </button>
            </li>
            <li>
              <button className="w-full text-left px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded transition">
                ⭐ Top Products
              </button>
            </li>
            <li>
              <button className="w-full text-left px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded transition">
                👥 Customer Count
              </button>
            </li>
          </ul>
        </div>

        {/* Help Section */}
        <div className="bg-purple-700 bg-opacity-50 p-4 rounded-lg border border-purple-500">
          <h3 className="text-lg font-semibold mb-2">💡 Tips</h3>
          <ul className="text-sm space-y-1 text-purple-100">
            <li>• Ask about specific time periods</li>
            <li>• Request comparisons</li>
            <li>• Ask for top performers</li>
            <li>• Filter by status</li>
          </ul>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        <AIChat userId={userId} />
      </div>
    </div>
  );
};

export default ChatPage;

const DashboardWithChat = () => {
  const [showChat, setShowChat] = useState(false);
  const userId = localStorage.getItem('userId');

  return (
    <div className="relative w-full h-screen">
      <div className="p-8">
        {/* Your existing dashboard components */}
      </div>

      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transition"
      >
        🤖
      </button>

      {showChat && (
        <div className="fixed bottom-24 right-8 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
            <h3 className="font-semibold">AI Assistant</h3>
            <button onClick={() => setShowChat(false)} className="text-xl hover:text-gray-200">✕</button>
          </div>
          <div className="flex-1 overflow-hidden">
            <AIChat userId={userId} />
          </div>
        </div>
      )}
    </div>
  );
};

const OrdersPageWithChat = () => {
  const userId = localStorage.getItem('userId');
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'list'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Orders List
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-6 py-3 font-medium transition ${
            activeTab === 'chat'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Ask AI 🤖
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'list' ? (
          <div className="p-8">
            {/* Your existing orders list component */}
          </div>
        ) : (
          <div>
            <AIChat userId={userId} />
          </div>
        )}
      </div>
    </div>
  );
};

const useAIChat = (userId, backendUrl) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message, userId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: message },
          { role: 'assistant', content: data.response, metadata: data.metadata },
        ]);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, error, sendMessage };
};

const CustomChatUI = ({ userId }) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
  const { messages, isLoading, error, sendMessage } = useAIChat(userId, backendUrl);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p>{msg.content}</p>
              {msg.metadata && (
                <small className={msg.role === 'user' ? 'text-purple-100' : 'text-gray-600'}>
                  {msg.metadata.intent}
                </small>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              <span className="animate-bounce">●</span>{' '}
              <span className="animate-bounce delay-100">●</span>{' '}
              <span className="animate-bounce delay-200">●</span>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-start">
            <div className="bg-red-200 text-red-900 px-4 py-2 rounded-lg">{error}</div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-300 p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask something..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chat error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-red-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
            <p className="text-2xl mb-2">❌ Error in Chat</p>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProtectedChatPage = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-gray-700 mb-4">Please login to access the chat</p>
          <a href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <ChatErrorBoundary>
      <ChatPage />
    </ChatErrorBoundary>
  );
};

export {
  DashboardWithChat,
  OrdersPageWithChat,
  useAIChat,
  CustomChatUI,
  ChatErrorBoundary,
  ProtectedChatPage,
};
