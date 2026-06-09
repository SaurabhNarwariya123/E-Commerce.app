import React, { useState, useRef, useEffect } from 'react';

const AIChat = ({ userId, userName = 'User', userEmail = '', onClose, backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000' }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! 👋 I\'m your AI assistant. Ask me about your orders, sales, products, customers, or analytics. Try asking "What are my total orders today?" or "Show my best selling products"',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [examples, setExamples] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch example queries
  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/ai/examples`);
        const data = await response.json();
        if (data.success) {
          setExamples(data.data);
        }
      } catch (error) {
        console.error('Error fetching examples:', error);
      }
    };

    fetchExamples();
  }, [backendUrl]);

  // Send message to AI
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setShowExamples(false);
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          message: inputValue,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          content: data.response,
          timestamp: new Date(),
          metadata: data.metadata,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: messages.length + 2,
          type: 'bot',
          content: data.response || data.error || 'Unable to process your request. Please try again.',
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: 'Network error. Please check your connection and try again.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle example click
  const handleExampleClick = (example) => {
    setInputValue(example);
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg flex-shrink-0 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">🤖 AI</h2>
              <p className="text-purple-100 text-xs leading-tight">Gemini</p>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition text-lg sm:text-xl flex-shrink-0 hover:scale-110 active:scale-95"
              >
                ✕
              </button>
            )}
          </div>
          {userName && (
            <div className="bg-white bg-opacity-20 rounded-lg p-1.5 text-white text-xs border border-white border-opacity-30">
              <div className="flex items-center gap-1 min-w-0">
                <div className="w-5 h-5 bg-white bg-opacity-30 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate text-xs">{userName}</p>
                  <p className="text-purple-100 text-xs truncate leading-tight">{userEmail}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-2 sm:py-2.5 space-y-1.5 sm:space-y-2 bg-gradient-to-b from-purple-50 to-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] sm:max-w-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm leading-tight break-words ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-none shadow-md'
                  : message.isError
                  ? 'bg-red-100 text-red-800 border border-red-300 rounded-bl-none shadow-sm'
                  : 'bg-white text-gray-800 shadow border border-gray-100 rounded-bl-none'
              }`}
            >
              <div>
                {message.type === 'bot' ? '🤖' : '👤'} {message.content}
              </div>
              <div className="text-xs mt-0.5 opacity-70 leading-tight">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg rounded-bl-none">
              <div className="flex space-x-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></span>
                <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce delay-100"></span>
                <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Examples Section */}
      {showExamples && examples.length > 0 && (
        <div className="px-2 sm:px-3 py-1.5 bg-white border-t border-gray-200 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-700 mb-1">Try:</p>
          <div className="grid grid-cols-2 gap-1">
            {examples[0]?.examples?.slice(0, 4).map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(example)}
                className="text-xs p-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 rounded border border-purple-300 hover:from-purple-200 hover:to-blue-200 active:from-purple-300 active:to-blue-300 transition font-medium line-clamp-2"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-2 sm:px-3 py-1.5 bg-white border-t border-gray-200 space-y-1 flex-shrink-0">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask..."
          disabled={isLoading}
          rows="1"
          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed text-xs"
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-1 rounded-lg hover:from-purple-700 hover:to-blue-700 active:from-purple-800 active:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-xs"
        >
          {isLoading ? '⏳' : '📤 Send'}
        </button>
      </div>
    </div>
  );
};

export default AIChat;
