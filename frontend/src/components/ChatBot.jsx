import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, HelpCircle } from 'lucide-react';
import { chatbotConfig, findBestResponse } from '@/config/chatbotConfig';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: chatbotConfig.welcomeMessage }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text = inputValue) => {
    if (!text.trim()) return;

    // Adiciona mensagem do usuário
    setMessages(prev => [...prev, { type: 'user', text: text.trim() }]);
    setInputValue('');
    setIsTyping(true);

    // Simula delay de resposta (para parecer mais natural)
    // Futuramente, aqui entraria a integração com LLM
    setTimeout(() => {
      const response = findBestResponse(text);
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickSuggestion = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="chatbot-toggle-btn"
        className={`fixed bottom-24 right-6 z-[60] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen 
            ? 'bg-[#6E6E73] hover:bg-[#5E5E63]' 
            : 'bg-[#4A9B6E] hover:bg-[#3D8B5E]'
        }`}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat de ajuda'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Janela do Chat */}
      {isOpen && (
        <div 
          data-testid="chatbot-window"
          className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          style={{ height: '500px' }}
        >
          {/* Header */}
          <div className="bg-[#4A9B6E] text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">Assistente FOTIVA</h3>
              <p className="text-xs text-white/80">Pergunte sobre o FOTIVA</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Fechar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F5F7]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                    msg.type === 'user'
                      ? 'bg-[#4A9B6E] text-white rounded-br-md'
                      : 'bg-white text-[#1D1D1F] shadow-sm rounded-bl-md border border-gray-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#4A9B6E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-[#4A9B6E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-[#4A9B6E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugestões Rápidas */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-white border-t border-gray-100">
              <p className="text-xs text-[#6E6E73] mb-2">Perguntas frequentes:</p>
              <div className="flex flex-wrap gap-2">
                {chatbotConfig.quickSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="text-xs bg-[#E8F5EE] text-[#4A9B6E] px-3 py-1.5 rounded-full hover:bg-[#4A9B6E] hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta..."
                data-testid="chatbot-input"
                className="flex-1 px-4 py-2.5 bg-[#F5F5F7] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A9B6E] focus:border-transparent text-sm"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                data-testid="chatbot-send-btn"
                className="p-2.5 bg-[#4A9B6E] text-white rounded-xl hover:bg-[#3D8B5E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
