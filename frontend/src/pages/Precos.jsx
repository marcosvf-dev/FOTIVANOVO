import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, X, ArrowRight, Shield, Star, ChevronDown, ChevronUp,
  Users, Calendar, DollarSign, Image, Bell, MessageCircle, 
  Smartphone, BarChart3, Zap
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';

// Componente ROI Calculator
const ROICalculator = () => {
  const [eventsPerMonth, setEventsPerMonth] = useState(10);
  const [hoursPerEvent, setHoursPerEvent] = useState(2);
  const [hourlyRate, setHourlyRate] = useState(80);

  const hoursLost = eventsPerMonth * hoursPerEvent;
  const moneyLost = hoursLost * hourlyRate;
  const hoursSaved = Math.round(hoursLost * 0.7); // 70% de economia
  const moneySaved = hoursSaved * hourlyRate;

  return (
    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100">
      <h3 className="text-2xl font-bold text-[#1D1D1F] mb-2">Quanto vale seu tempo?</h3>
      <p className="text-[#6E6E73] mb-8">Calcule quanto você pode economizar com FOTIVA</p>
      
      <div className="space-y-8">
        {/* Events Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-[#1D1D1F]">Eventos por mês</label>
            <span className="text-sm font-bold text-[#4A9B6E]">{eventsPerMonth}</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={eventsPerMonth}
            onChange={(e) => setEventsPerMonth(Number(e.target.value))}
            className="w-full h-2 bg-[#E8F5EE] rounded-lg appearance-none cursor-pointer accent-[#4A9B6E]"
            data-testid="roi-events-slider"
          />
          <div className="flex justify-between text-xs text-[#6E6E73] mt-1">
            <span>1</span>
            <span>30</span>
          </div>
        </div>

        {/* Hours Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-[#1D1D1F]">Horas de burocracia por evento</label>
            <span className="text-sm font-bold text-[#4A9B6E]">{hoursPerEvent}h</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={hoursPerEvent}
            onChange={(e) => setHoursPerEvent(Number(e.target.value))}
            className="w-full h-2 bg-[#E8F5EE] rounded-lg appearance-none cursor-pointer accent-[#4A9B6E]"
            data-testid="roi-hours-slider"
          />
          <div className="flex justify-between text-xs text-[#6E6E73] mt-1">
            <span>1h</span>
            <span>5h</span>
          </div>
        </div>

        {/* Hourly Rate Input */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-[#1D1D1F]">Valor da sua hora</label>
            <span className="text-sm font-bold text-[#4A9B6E]">R$ {hourlyRate}</span>
          </div>
          <input
            type="range"
            min="30"
            max="200"
            step="10"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="w-full h-2 bg-[#E8F5EE] rounded-lg appearance-none cursor-pointer accent-[#4A9B6E]"
            data-testid="roi-rate-slider"
          />
          <div className="flex justify-between text-xs text-[#6E6E73] mt-1">
            <span>R$ 30</span>
            <span>R$ 200</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-10 p-6 bg-gradient-to-br from-[#E8F5EE] to-[#F5F5F7] rounded-2xl">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-white rounded-xl">
            <p className="text-sm text-[#6E6E73]">Horas perdidas/mês</p>
            <p className="text-2xl font-bold text-red-500">{hoursLost}h</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl">
            <p className="text-sm text-[#6E6E73]">Horas economizadas</p>
            <p className="text-2xl font-bold text-[#4A9B6E]">{hoursSaved}h</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-[#6E6E73] mb-2">Com FOTIVA você economiza</p>
          <p className="text-4xl font-bold text-[#4A9B6E]">R$ {moneySaved.toLocaleString('pt-BR')}</p>
          <p className="text-sm text-[#6E6E73] mt-2">por mês</p>
          <p className="text-xs text-[#9CA3AF] mt-4">
            FOTIVA custa apenas R$ 19,90/mês — retorno de {Math.round(moneySaved / 19.90)}x
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente FAQ Item
const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-gray-100 last:border-0">
    <button
      onClick={onClick}
      className="w-full py-6 flex items-center justify-between text-left hover:text-[#4A9B6E] transition-colors"
      data-testid={`faq-question-${question.substring(0, 20).replace(/\s/g, '-').toLowerCase()}`}
    >
      <span className="text-lg font-medium text-[#1D1D1F] pr-8">{question}</span>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-[#4A9B6E] flex-shrink-0" />
      ) : (
        <ChevronDown className="w-5 h-5 text-[#6E6E73] flex-shrink-0" />
      )}
    </button>
    {isOpen && (
      <div className="pb-6 text-[#6E6E73] leading-relaxed animate-fadeIn">
        {answer}
      </div>
    )}
  </div>
);

const Precos = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const comparisonData = [
    { without: 'Planilhas confusas', with: 'Tudo organizado em segundos' },
    { without: 'Clientes esquecidos', with: 'Lembretes automáticos' },
    { without: 'Pagamentos perdidos', with: 'Controle financeiro completo' },
    { without: 'Horas de burocracia', with: 'Mais tempo fotografando' },
    { without: 'Aparência amadora', with: 'Galeria profissional para clientes' },
  ];

  const planFeatures = [
    { icon: Users, text: 'Clientes ilimitados' },
    { icon: Calendar, text: 'Eventos ilimitados' },
    { icon: DollarSign, text: 'Controle de pagamentos' },
    { icon: Image, text: 'Galeria para clientes' },
    { icon: Bell, text: 'Notificações automáticas' },
    { icon: MessageCircle, text: 'Chatbot de atendimento' },
    { icon: Zap, text: 'Suporte prioritário' },
    { icon: Smartphone, text: 'Acesso mobile (PWA)' },
    { icon: BarChart3, text: 'Atualizações gratuitas' },
  ];

  const testimonials = [
    {
      text: "Antes eu perdia 2 horas por dia em planilhas. Hoje é tudo automático.",
      author: "Carlos M.",
      role: "Fotógrafo de Casamentos, São Paulo",
    },
    {
      text: "Meus clientes amam a galeria. É muito mais profissional.",
      author: "Ana L.",
      role: "Fotógrafa de Família, Rio de Janeiro",
    },
    {
      text: "Em 3 meses, aumentei meus clientes em 40% porque tenho mais tempo para focar no trabalho.",
      author: "Pedro R.",
      role: "Fotógrafo de Eventos, Belo Horizonte",
    },
  ];

  const faqData = [
    {
      question: "Preciso de cartão de crédito para testar?",
      answer: "Não! Você tem 7 dias grátis para testar todas as funcionalidades, sem precisar cadastrar cartão de crédito. Sem compromisso.",
    },
    {
      question: "Posso cancelar quando quiser?",
      answer: "Sim! Você pode cancelar sua assinatura a qualquer momento com apenas 1 clique, diretamente nas configurações da sua conta. Sem burocracia, sem perguntas.",
    },
    {
      question: "Meus dados ficam seguros?",
      answer: "Sim! Usamos criptografia SSL em todas as conexões e fazemos backup automático diário dos seus dados. Sua privacidade e segurança são nossa prioridade.",
    },
    {
      question: "Funciona no celular?",
      answer: "Sim! O FOTIVA funciona como um PWA (Progressive Web App) no seu celular. Compatível com iOS e Android, sem precisar baixar nada da loja de aplicativos.",
    },
    {
      question: "Tenho suporte se precisar de ajuda?",
      answer: "Sim! Nosso suporte está disponível por chat e email, com resposta em até 24 horas. Assinantes têm suporte prioritário.",
    },
    {
      question: "E se eu já usar planilhas? Posso importar?",
      answer: "Sim! Você pode importar seus dados de planilhas via CSV. Assim, a migração para o FOTIVA é rápida e fácil.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1D1D1F] leading-tight"
            data-testid="precos-headline"
          >
            Um investimento que se paga
            <span className="text-[#4A9B6E]"> no primeiro cliente</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#6E6E73] max-w-2xl mx-auto">
            Fotógrafos que usam FOTIVA economizam em média 8 horas por semana.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-6 bg-[#F5F5F7]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
            {/* Without FOTIVA */}
            <div className="bg-white rounded-t-3xl md:rounded-3xl p-8 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <div className="flex items-center gap-2 mb-6">
                <X className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-bold text-[#1D1D1F]">Sem FOTIVA</h3>
              </div>
              <ul className="space-y-4">
                {comparisonData.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[#6E6E73]">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span>{item.without}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* With FOTIVA */}
            <div className="bg-[#4A9B6E] rounded-b-3xl md:rounded-3xl p-8 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
              <div className="flex items-center gap-2 mb-6">
                <Check className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Com FOTIVA</h3>
              </div>
              <ul className="space-y-4">
                {comparisonData.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-white/90">
                    <Check className="w-5 h-5 text-white flex-shrink-0" />
                    <span>{item.with}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-24 px-6">
        <div className="max-w-lg mx-auto">
          <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-2xl border-2 border-[#4A9B6E] reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-[#4A9B6E] text-white text-sm font-semibold px-4 py-2 rounded-full">
                Mais popular
              </span>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#1D1D1F] mb-4">Plano Completo</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl md:text-6xl font-bold text-[#1D1D1F]">R$ 19,90</span>
                <span className="text-[#6E6E73]">/mês</span>
              </div>
              <p className="text-sm text-[#6E6E73] mt-2">
                (equivale a R$ 0,66 por dia)
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-center font-semibold text-[#4A9B6E] mb-4">Inclui TUDO:</p>
              {planFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#E8F5EE] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#4A9B6E]" />
                    </div>
                    <span className="text-[#1D1D1F]">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            <Link
              to="/cadastro"
              data-testid="pricing-cta-btn"
              className="block w-full bg-[#4A9B6E] text-white hover:bg-[#3D8B5E] rounded-full py-4 font-semibold text-lg text-center transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#4A9B6E]/30"
            >
              Começar 7 dias grátis
            </Link>
            
            <p className="text-center text-sm text-[#6E6E73] mt-4">
              Sem cartão de crédito. Cancele quando quiser.
            </p>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-24 px-6 bg-[#F5F5F7]">
        <div className="max-w-2xl mx-auto reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <ROICalculator />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] text-center mb-16 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            O que nossos clientes dizem
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-[#1D1D1F] mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4A9B6E] rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1D1D1F] text-sm">{testimonial.author}</p>
                    <p className="text-xs text-[#6E6E73]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-[#F5F5F7]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] text-center mb-4 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            Perguntas frequentes
          </h2>
          <p className="text-center text-[#6E6E73] mb-12 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            Tire suas dúvidas antes de começar
          </p>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            {faqData.map((faq, idx) => (
              <FAQItem
                key={idx}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === idx}
                onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E8F5EE] rounded-full mb-6">
            <Shield className="w-10 h-10 text-[#4A9B6E]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] mb-4">
            Garantia de 30 dias ou seu dinheiro de volta
          </h2>
          <p className="text-lg text-[#6E6E73] max-w-2xl mx-auto">
            Se você não economizar tempo ou não ficar satisfeito com o FOTIVA nos primeiros 30 dias, 
            devolvemos 100% do seu dinheiro. Sem perguntas.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#4A9B6E] to-[#3D8B5E]">
        <div className="max-w-4xl mx-auto text-center reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Junte-se a 500+ fotógrafos que já transformaram seu negócio
          </h2>
          <Link
            to="/cadastro"
            data-testid="final-cta-btn"
            className="bg-white text-[#4A9B6E] hover:bg-gray-100 rounded-full px-10 py-4 font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg inline-flex items-center gap-2"
          >
            Criar conta grátis agora
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-white/70 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            Leva menos de 2 minutos para começar
          </p>
        </div>
      </section>

      <Footer />
      <ChatBot />

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #4A9B6E;
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #4A9B6E;
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default Precos;
