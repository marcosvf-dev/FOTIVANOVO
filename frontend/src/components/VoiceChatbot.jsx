import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const VoiceChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '👋 Olá! Sou o assistente FOTIVA com IA.\n\nFale livremente, por exemplo:\n• "Criar evento para João, casamento dia 15/03 às 15h, valor 2500"\n• "Novo cliente Maria Silva, telefone 11999990000"\n• "Quais são meus eventos?"\n• "Liste meus clientes"'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'pt-BR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event) => {
        setInputValue(event.results[0][0].transcript);
        setIsRecording(false);
      };
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setMessages(prev => [...prev, { type: 'bot', text: '❌ Voz não suportada neste navegador.' }]);
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSend = async (text = inputValue) => {
    const msg = (text || '').trim();
    if (!msg || isLoading) return;

    setMessages(prev => [...prev, { type: 'user', text: msg }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessages(prev => [...prev, { type: 'bot', text: '❌ Você precisa estar logado.' }]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: msg })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Erro ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.message || '✅ Feito!' }]);

    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { type: 'bot', text: `❌ ${err.message}` }]);
    }

    setIsLoading(false);
  };

  const suggestions = ['Listar meus clientes', 'Ver meus eventos', 'Criar novo cliente'];

  return (
    <>
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-gray-600' : 'bg-[#4A9B6E]'
        }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[60] w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100" style={{ height: '520px' }}>
          <div className="bg-[#4A9B6E] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-2.5 h-2.5 bg-green-300 rounded-full animate-pulse" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Assistente FOTIVA</p>
              <p className="text-xs text-white/75">IA • Fale livremente</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                  msg.type === 'user'
                    ? 'bg-[#4A9B6E] text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex gap-1.5 items-center">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-2 h-2 bg-[#4A9B6E] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">Processando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex-shrink-0">
              <p className="text-xs text-gray-400 mb-1.5">Sugestões:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)}
                    className="text-xs bg-green-50 text-[#4A9B6E] border border-green-200 px-2.5 py-1 rounded-full hover:bg-[#4A9B6E] hover:text-white transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Digite ou use o microfone..."
                disabled={isLoading}
                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A9B6E] disabled:opacity-60"
              />
              <button onClick={toggleRecording}
                className={`p-2.5 rounded-xl transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 bg-[#4A9B6E] text-white rounded-xl hover:bg-[#3D8B5E] disabled:opacity-40 transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceChatbot;
