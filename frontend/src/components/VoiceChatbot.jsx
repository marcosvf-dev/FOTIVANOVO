import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const VoiceChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    type: 'bot',
    text: '👋 Olá! Sou o assistente FOTIVA.\n\nFale naturalmente, por exemplo:\n• "Ensaio para a Amanda no dia 23 de maio, valor 2500"\n• "Casamento da Josi dia 15/06 às 16h, valor 4000"\n• "Novo cliente Carlos Silva, tel 11999990000"\n• "Ver meus clientes" / "Ver meus eventos"'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const bottomRef = useRef(null);
  const recRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Configura microfone com pausa inteligente
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = 'pt-BR';
    rec.continuous = true;       // Não para automaticamente
    rec.interimResults = true;   // Mostra resultado parcial enquanto fala

    rec.onresult = (e) => {
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalText += e.results[i][0].transcript;
        } else {
          interimText += e.results[i][0].transcript;
        }
      }
      const total = (finalText + interimText).trim();
      setInput(total);
      setTranscript(total);
    };

    rec.onerror = (e) => {
      if (e.error !== 'no-speech') setRecording(false);
    };

    rec.onend = () => {
      setRecording(false);
    };

    recRef.current = rec;
  }, []);

  const toggleMic = () => {
    if (!recRef.current) {
      setMessages(p => [...p, { type: 'bot', text: '❌ Microfone não suportado. Use o campo de texto.' }]);
      return;
    }
    if (recording) {
      recRef.current.stop();
      setRecording(false);
    } else {
      setInput('');
      setTranscript('');
      try {
        recRef.current.start();
        setRecording(true);
      } catch (e) {
        // Se já estava rodando, reinicia
        recRef.current.stop();
        setTimeout(() => {
          recRef.current.start();
          setRecording(true);
        }, 200);
      }
    }
  };

  // Quando parar gravação e tiver texto, envia automaticamente
  useEffect(() => {
    if (!recording && transcript.trim() && transcript === input) {
      // Pequeno delay para o usuário ver o que foi transcrito
      const t = setTimeout(() => {
        if (transcript.trim()) {
          send(transcript);
          setTranscript('');
        }
      }, 800);
      return () => clearTimeout(t);
    }
  }, [recording]);

  const addBot = (text) => setMessages(p => [...p, { type: 'bot', text }]);

  const send = async (txt = input) => {
    const msg = (txt || '').trim();
    if (!msg || loading) return;
    setMessages(p => [...p, { type: 'user', text: msg }]);
    setInput('');
    setTranscript('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: msg })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Erro ${res.status}`);
      }
      const data = await res.json();
      addBot(data.message || '✅ Feito!');
    } catch (e) {
      addBot(`❌ ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 ${isOpen ? 'bg-gray-600' : 'bg-[#4A9B6E]'}`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[60] w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden" style={{ height: '540px' }}>

          {/* Header */}
          <div className="bg-[#4A9B6E] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-2.5 h-2.5 bg-green-300 rounded-full animate-pulse" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Assistente FOTIVA</p>
              <p className="text-xs text-white/70">Online • Fale livremente</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                  m.type === 'user'
                    ? 'bg-[#4A9B6E] text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                }`}>{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex gap-1.5 items-center">
                    {[0,150,300].map(d => <span key={d} className="w-2 h-2 bg-[#4A9B6E] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    <span className="text-xs text-gray-400 ml-1">Processando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Indicador de gravação ativa */}
          {recording && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2 flex-shrink-0">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              <p className="text-xs text-red-600 font-medium">Gravando... Fale normalmente, pressione ⏹ para parar</p>
            </div>
          )}

          {/* Sugestões */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex-shrink-0">
              <p className="text-xs text-gray-400 mb-1.5">Sugestões:</p>
              <div className="flex flex-wrap gap-1.5">
                {['Ver meus clientes', 'Ver meus eventos', 'Ajuda'].map((s, i) => (
                  <button key={i} onClick={() => send(s)}
                    className="text-xs bg-green-50 text-[#4A9B6E] border border-green-200 px-2.5 py-1 rounded-full hover:bg-[#4A9B6E] hover:text-white transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder={recording ? 'Ouvindo...' : 'Ex: ensaio para João dia 20/03...'}
                disabled={loading}
                className={`flex-1 px-3 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A9B6E] disabled:opacity-60 ${recording ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              <button
                onClick={toggleMic}
                className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                  recording
                    ? 'bg-red-500 text-white scale-110 shadow-lg'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title={recording ? 'Parar gravação' : 'Gravar voz'}
              >
                {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="p-2.5 bg-[#4A9B6E] text-white rounded-xl hover:bg-[#3D8B5E] disabled:opacity-40 transition-colors flex-shrink-0"
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

export default VoiceChatbot;
