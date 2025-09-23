import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../api/ai';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your FoodTracker AI assistant. I can help you manage your food inventory. Try asking me things like "What\'s expiring this week?" or "I bought 6 eggs today".',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiAPI.sendMessage(inputMessage.trim());
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.message || response.response || 'I received your message but couldn\'t process it properly.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const suggestedQuestions = [
    "What's expiring this week?",
    "I bought 6 eggs today",
    "How much protein in my eggs?",
    "What should I cook with my fresh vegetables?",
    "Show me my dairy products"
  ];

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>🤖 AI Food Assistant</h3>
        <p>Ask me anything about your food inventory!</p>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-time">
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="suggested-questions">
        <p>Try asking:</p>
        <div className="suggestion-chips">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              className="suggestion-chip"
              onClick={() => handleSuggestedQuestion(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="chatbot-input">
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your food inventory..."
            disabled={isLoading}
            className="message-input"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;









