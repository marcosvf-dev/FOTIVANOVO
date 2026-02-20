import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Calendar, DollarSign, Image, Check, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';

// Componente para Screenshots/Placeholders do App
const AppScreenshot = ({ title, icon: Icon, description }) => (
  <div className="relative bg-gradient-to-br from-[#E8F5EE] to-[#F5F5F7] rounded-2xl p-8 shadow-lg border border-gray-100 group hover:shadow-xl transition-all duration-300">
    <div className="absolute top-4 left-4 right-4 h-3 bg-white/60 rounded-full flex items-center gap-1 px-2">
      <span className="w-2 h-2 rounded-full bg-red-400"></span>
      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
      <span className="w-2 h-2 rounded-full bg-green-400"></span>
    </div>
    <div className="mt-6 flex flex-col items-center justify-center h-48">
      <div className="w-16 h-16 bg-[#4A9B6E] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h4 className="text-lg font-semibold text-[#1D1D1F] mb-2">{title}</h4>
      <p className="text-sm text-[#6E6E73] text-center">{description}</p>
    </div>
  </div>
);

const LandingPage = () => {
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

  const proofNumbers = [
    { value: '500+', label: 'Fotógrafos' },
    { value: 'R$ 2M+', label: 'Em pagamentos gerenciados' },
    { value: '98%', label: 'Satisfação' },
  ];

  const previewCards = [
    {
      title: 'Gestão de Clientes',
      icon: Users,
      description: 'Todos seus clientes organizados em um só lugar',
    },
    {
      title: 'Controle de Pagamentos',
      icon: DollarSign,
      description: 'Financeiro completo com parcelas e relatórios',
    },
    {
      title: 'Galeria para Clientes',
      icon: Image,
      description: 'Entregue fotos de forma profissional',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1D1D1F] leading-[1.1] tracking-tight"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, Inter, sans-serif' }}
                data-testid="hero-headline"
              >
                Pare de perder tempo com planilhas.
                <br />
                <span className="text-[#4A9B6E]">Comece a fotografar mais.</span>
              </h1>
              
              <p className="mt-6 text-lg md:text-xl text-[#6E6E73] leading-relaxed max-w-lg">
                FOTIVA organiza seus clientes, eventos e pagamentos em um só lugar. 
                100% feito para fotógrafos.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/cadastro"
                  data-testid="hero-cta-primary"
                  className="bg-[#4A9B6E] text-white hover:bg-[#3D8B5E] rounded-full px-8 py-4 font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#4A9B6E]/30 inline-flex items-center justify-center gap-2"
                >
                  Começar grátis por 7 dias
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/funcionalidades"
                  data-testid="hero-cta-secondary"
                  className="border-2 border-[#4A9B6E] text-[#4A9B6E] hover:bg-[#E8F5EE] rounded-full px-8 py-4 font-semibold text-lg transition-all inline-flex items-center justify-center"
                >
                  Ver como funciona
                </Link>
              </div>
              
              <p className="mt-6 text-sm text-[#9CA3AF]">
                Sem cartão de crédito • Cancele quando quiser
              </p>
            </div>
            
            {/* Hero Image - Mockup */}
            <div className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200 relative">
              <div className="relative bg-gradient-to-br from-[#1A1A2E] to-[#2C3E50] rounded-3xl p-4 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-2xl overflow-hidden">
                  {/* Fake browser bar */}
                  <div className="bg-[#F5F5F7] px-4 py-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    <div className="flex-1 bg-white rounded-full px-4 py-1 ml-4 text-xs text-[#6E6E73]">
                      fotiva.app/dashboard
                    </div>
                  </div>
                  {/* Dashboard Preview */}
                  <div className="p-6 bg-[#F5F5F7]">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-[#6E6E73]">Faturamento</p>
                        <p className="text-xl font-bold text-[#4A9B6E]">R$ 12.450</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-[#6E6E73]">Eventos</p>
                        <p className="text-xl font-bold text-[#1D1D1F]">8</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-[#6E6E73] mb-3">Próximos Eventos</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 bg-[#E8F5EE] rounded-lg">
                          <Calendar className="w-4 h-4 text-[#4A9B6E]" />
                          <span className="text-sm text-[#1D1D1F]">Casamento - Ana e Pedro</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-[#F5F5F7] rounded-lg">
                          <Calendar className="w-4 h-4 text-[#6E6E73]" />
                          <span className="text-sm text-[#6E6E73]">Ensaio - Família Silva</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 top-10 -right-10 w-32 h-32 bg-[#4A9B6E]/10 rounded-full blur-3xl"></div>
              <div className="absolute -z-10 -bottom-5 -left-5 w-24 h-24 bg-[#4A9B6E]/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-[#1A1A2E]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16" data-testid="social-proof">
            {proofNumbers.map((item, idx) => (
              <div key={idx} className="text-center reveal-on-scroll opacity-0 translate-y-8 transition-all duration-500" style={{ transitionDelay: `${idx * 100}ms` }}>
                <p className="text-3xl md:text-4xl font-bold text-white">{item.value}</p>
                <p className="text-sm text-white/60 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Problem Side */}
            <div className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <div className="bg-[#FEF2F2] rounded-3xl p-8 md:p-10">
                <h3 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] mb-6">
                  Você já passou por isso?
                </h3>
                <ul className="space-y-4">
                  {[
                    'Perdeu um cliente porque esqueceu de ligar?',
                    'Passou horas procurando informações em planilhas?',
                    'Se confundiu com pagamentos em atraso?',
                    'Entregou fotos de forma desorganizada?',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#6E6E73]">
                      <span className="text-red-500 font-bold text-lg">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Solution Side */}
            <div className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
              <div className="bg-[#E8F5EE] rounded-3xl p-8 md:p-10">
                <h3 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] mb-6">
                  Com FOTIVA, tudo muda.
                </h3>
                <ul className="space-y-4">
                  {[
                    'Todos os dados do cliente em um clique',
                    'Lembretes automáticos de eventos',
                    'Controle financeiro completo',
                    'Galeria profissional para entregar fotos',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#1D1D1F]">
                      <Check className="w-5 h-5 text-[#4A9B6E] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[#4A9B6E] font-semibold">
                  Seu negócio organizado. Mais tempo para fotografar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Cards */}
      <section className="py-24 px-6 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F]">
              Tudo que você precisa
            </h2>
            <p className="mt-4 text-lg text-[#6E6E73] max-w-2xl mx-auto">
              Uma plataforma completa para gerenciar seu negócio fotográfico
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {previewCards.map((card, idx) => (
              <div key={idx} className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700" style={{ transitionDelay: `${idx * 100}ms` }}>
                <AppScreenshot {...card} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12 reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <Link
              to="/funcionalidades"
              className="text-[#4A9B6E] font-semibold hover:underline inline-flex items-center gap-2"
            >
              Ver todas as funcionalidades
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Preview */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 text-center reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-[#1D1D1F] font-medium leading-relaxed mb-6">
              "Antes eu perdia 2 horas por dia em planilhas. Hoje é tudo automático. O FOTIVA transformou meu negócio."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-[#4A9B6E] rounded-full flex items-center justify-center text-white font-bold">
                C
              </div>
              <div className="text-left">
                <p className="font-semibold text-[#1D1D1F]">Carlos M.</p>
                <p className="text-sm text-[#6E6E73]">Fotógrafo de Casamentos, São Paulo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#4A9B6E] to-[#3D8B5E]">
        <div className="max-w-4xl mx-auto text-center reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de fotógrafos que já economizam tempo e ganham mais com FOTIVA.
          </p>
          <Link
            to="/cadastro"
            data-testid="final-cta-btn"
            className="bg-white text-[#4A9B6E] hover:bg-gray-100 rounded-full px-10 py-4 font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg inline-flex items-center gap-2"
          >
            Criar conta grátis — 7 dias sem cartão
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-white/60">
            Cancele quando quiser. Sem burocracia.
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
      `}</style>
    </div>
  );
};

export default LandingPage;
