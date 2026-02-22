import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const VoiceChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: '👋 Olá! Sou o assistente FOTIVA.\n\nPode me dizer qualquer coisa, como:\n• "Criar evento para o João, casamento dia 10/03 às 15h, valor 2000"\n• "Novo cliente Maria Silva, telefone 11999990000"\n• "Agendar ensaio para a Carla no dia 25"\n\nFale livremente!' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Configurar reconhecimento de voz
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'pt-BR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      addBotMessage('❌ Reconhecimento de voz não suportado neste navegador.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { type: 'bot', text }]);
  };

  const handleSend = async (text = inputValue) => {
    if (!text.trim() || isLoading) return;

    const userMsg = text.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Buscar clientes e eventos existentes para contexto
      const [clientsRes, eventsRes] = await Promise.all([
        fetch(`${API_URL}/clients`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/events`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const clients = clientsRes.ok ? await clientsRes.json() : [];
      const events = eventsRes.ok ? await eventsRes.json() : [];

      const clientsList = clients.map(c => `- ID: ${c.id}, Nome: ${c.name}, Telefone: ${c.phone || 'não informado'}`).join('\n') || 'Nenhum cliente cadastrado';
      const eventsList = events.slice(0, 5).map(e => `- ID: ${e.id}, Tipo: ${e.event_type}, Data: ${e.event_date}`).join('\n') || 'Nenhum evento cadastrado';

      const today = new Date().toLocaleDateString('pt-BR');
      const currentYear = new Date().getFullYear();

      const systemPrompt = `Você é o assistente inteligente do FOTIVA, um sistema de gestão para fotógrafos.
      
Data de hoje: ${today}
Ano atual: ${currentYear}

Clientes cadastrados:
${clientsList}

Eventos recentes:
${eventsList}

Sua função é interpretar o que o usuário diz em LINGUAGEM NATURAL e executar ações no sistema.

REGRAS IMPORTANTES:
1. Interprete a intenção do usuário livremente, sem exigir formato específico
2. Se o usuário mencionar um cliente pelo nome e ele já existir na lista, use o ID existente
3. Se o cliente não existir, crie um novo cliente primeiro
4. Para datas relativas como "amanhã", "próxima semana", calcule baseado na data de hoje
5. Se faltar informação crítica (como valor do evento), pergunte SOMENTE o que for realmente necessário
6. Responda sempre em português brasileiro
7. Seja direto e confirme o que foi feito

Você deve responder APENAS com um JSON válido neste formato:
{
  "action": "create_event" | "create_client" | "create_both" | "list_events" | "list_clients" | "answer" | "ask",
  "message": "mensagem amigável para o usuário",
  "client": {
    "name": "nome completo",
    "phone": "telefone ou null",
    "email": "email ou null"
  },
  "event": {
    "client_name": "nome do cliente",
    "client_id": "ID se já existir ou null",
    "event_type": "tipo do evento",
    "event_date": "YYYY-MM-DDTHH:MM:00",
    "location": "local ou string vazia",
    "total_value": número ou 0,
    "amount_paid": número ou 0,
    "notes": "observações ou string vazia"
  }
}`;

      // Chamar API do Claude
      const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMsg }]
        })
      });

      const aiData = await aiResponse.json();
      const rawText = aiData.content?.[0]?.text || '{}';

      let parsed;
      try {
        const clean = rawText.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(clean);
      } catch {
        addBotMessage('🤔 Não entendi bem. Pode reformular? Ex: "Criar evento para João, casamento dia 15/03, valor 2500"');
        setIsLoading(false);
        return;
      }

      const { action, message, client, event } = parsed;

      // Executar ação
      if (action === 'answer' || action === 'ask') {
        addBotMessage(message);
      } else if (action === 'list_clients') {
        const list = clients.length > 0
          ? clients.map(c => `• ${c.name}${c.phone ? ` - ${c.phone}` : ''}`).join('\n')
          : 'Nenhum cliente cadastrado ainda.';
        addBotMessage(`📋 Seus clientes:\n${list}`);
      } else if (action === 'list_events') {
        const list = events.length > 0
          ? events.map(e => `• ${e.event_type} - ${new Date(e.event_date).toLocaleDateString('pt-BR')}`).join('\n')
          : 'Nenhum evento cadastrado ainda.';
        addBotMessage(`📅 Seus eventos:\n${list}`);
      } else if (action === 'create_client') {
        await createClient(client, token);
        addBotMessage(message || `✅ Cliente ${client.name} criado com sucesso!`);
      } else if (action === 'create_event') {
        let clientId = event.client_id;
        if (!clientId) {
          // Tentar encontrar o cliente pelo nome
          const found = clients.find(c => c.name.toLowerCase().includes(event.client_name?.toLowerCase()));
          clientId = found?.id || null;
        }
        if (!clientId) {
          addBotMessage(`⚠️ Cliente "${event.client_name}" não encontrado. Tente: "Criar cliente ${event.client_name}"`);
        } else {
          await createEvent({ ...event, client_id: clientId }, token);
          addBotMessage(message || `✅ Evento criado com sucesso!`);
        }
      } else if (action === 'create_both') {
        // Criar cliente e evento juntos
        addBotMessage('⏳ Criando cliente e evento...');
        const newClient = await createClient(client, token);
        if (newClient) {
          await createEvent({ ...event, client_id: newClient.id }, token);
          addBotMessage(message || `✅ Cliente ${client.name} e evento criados com sucesso!`);
        }
      }
    } catch (err) {
      console.error(err);
      addBotMessage('❌ Ocorreu um erro. Verifique sua conexão e tente novamente.');
    }

    setIsLoading(false);
  };

  const createClient = async (clientData, token) => {
    try {
      const res = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: clientData.name,
          phone: clientData.phone || '',
          email: clientData.email || '',
          notes: ''
        })
      });
      if (res.ok) return await res.json();
      throw new Error('Erro ao criar cliente');
    } catch (err) {
      addBotMessage(`❌ Erro ao criar cliente: ${err.message}`);
      return null;
    }
  };

  const createEvent = async (eventData, token) => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          client_id: eventData.client_id,
          event_type: eventData.event_type || 'Evento',
          event_date: eventData.event_date || new Date().toISOString(),
          location: eventData.location || '',
          total_value: parseFloat(eventData.total_value) || 0,
          amount_paid: parseFloat(eventData.amount_paid) || 0,
          remaining_installments: 1,
          notes: eventData.notes || '',
          status: 'confirmado'
        })
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(JSON.stringify(err));
    } catch (err) {
      addBotMessage(`❌ Erro ao criar evento: ${err.message}`);
      return null;
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-gray-600' : 'bg-[#4A9B6E]'
        }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[60] w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100" style={{ height: '520px' }}>
          {/* Header */}
          <div className="bg-[#4A9B6E] text-white p-4 flex items-center gap-3">
            <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <h3 className="font-semibold">Assistente FOTIVA</h3>
              <p className="text-xs text-white/80">Online • IA inteligente</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F5F7]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                  msg.type === 'user'
                    ? 'bg-[#4A9B6E] text-white rounded-br-md'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-md border border-gray-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    {[0, 150, 300].map(delay => (
                      <span key={delay} className="w-2 h-2 bg-[#4A9B6E] rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }}></span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Digite ou fale qualquer coisa..."
                className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A9B6E]"
                disabled={isLoading}
              />
              <button
                onClick={toggleRecording}
                className={`p-2.5 rounded-xl transition-colors ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Falar"
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 bg-[#4A9B6E] text-white rounded-xl hover:bg-[#3D8B5E] disabled:opacity-50"
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
