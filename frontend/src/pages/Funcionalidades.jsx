import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, DollarSign, Image, Bell, MessageCircle,
  LayoutDashboard, Smartphone, BarChart3, Shield, ArrowRight, Check, Lock
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';

// Componente para Screenshot/Placeholder
const FeatureScreenshot = ({ icon: Icon, title, gradient = false }) => (
  <div className={`relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 ${gradient ? 'bg-gradient-to-br from-[#E8F5EE] to-[#F5F5F7]' : 'bg-white'}`}>
    {/* Browser bar */}
    <div className="bg-[#F5F5F7] px-4 py-3 flex items-center gap-2 border-b border-gray-100">
      <span className="w-3 h-3 rounded-full bg-red-400"></span>
      <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
      <span className="w-3 h-3 rounded-full bg-green-400"></span>
      <div className="flex-1 bg-white rounded-full px-4 py-1 ml-4 text-xs text-[#6E6E73]">
        fotiva.app
      </div>
    </div>
    {/* Content placeholder */}
    <div className="p-8 flex flex-col items-center justify-center h-64">
      <div className="w-20 h-20 bg-[#4A9B6E] rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-white" />
      </div>
      <p className="text-lg font-semibold text-[#1D1D1F]">{title}</p>
      <p className="text-sm text-[#6E6E73] mt-2">Screenshot disponível em breve</p>
    </div>
  </div>
);

// Componente para cada bloco de funcionalidade
const FeatureBlock = ({ feature, index, isReversed }) => {
  const Icon = feature.icon;
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
      {/* Text Side */}
      <div className={`${isReversed ? 'lg:order-2' : ''} reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700`}>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${feature.comingSoon ? 'bg-gray-100 text-[#6E6E73]' : 'bg-[#E8F5EE] text-[#4A9B6E]'}`}>
          <Icon className="w-4 h-4" />
          {feature.badge}
          {feature.comingSoon && <Lock className="w-3 h-3 ml-1" />}
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-[#1D1D1F] leading-tight mb-4">
          {feature.title}
        </h2>
        
        <p className="text-lg text-[#6E6E73] mb-8">
          {feature.subtitle}
        </p>
        
        <ul className="space-y-4">
          {feature.benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#E8F5EE] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-[#4A9B6E]" />
              </div>
              <span className="text-[#1D1D1F]">{benefit}</span>
            </li>
          ))}
        </ul>

        {feature.comingSoon && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm text-[#6E6E73] flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Em breve — Disponível nas próximas atualizações</span>
            </p>
          </div>
        )}
      </div>
      
      {/* Screenshot Side */}
      <div className={`${isReversed ? 'lg:order-1' : ''} reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200`}>
        <FeatureScreenshot icon={Icon} title={feature.badge} />
      </div>
    </div>
  );
};

const Funcionalidades = () => {
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

  const features = [
    {
      icon: Users,
      badge: 'Gestão de Clientes',
      title: 'Todos os seus clientes, organizados',
      subtitle: 'Nunca mais perca informações importantes de um cliente.',
      benefits: [
        'Histórico completo de cada cliente',
        'Busca rápida e filtros inteligentes',
        'Contato em 1 clique (telefone, email, WhatsApp)',
        'Notas e observações personalizadas',
      ],
    },
    {
      icon: Calendar,
      badge: 'Gerenciamento de Eventos',
      title: 'Nunca mais esqueça um ensaio',
      subtitle: 'Organize todos os seus compromissos em um só lugar.',
      benefits: [
        'Calendário visual e intuitivo',
        'Alertas automáticos antes do evento',
        'Status em tempo real (pendente, confirmado, concluído)',
        'Detalhes completos do contrato',
      ],
    },
    {
      icon: DollarSign,
      badge: 'Controle de Pagamentos',
      title: 'Seu financeiro no controle',
      subtitle: 'Acompanhe todas as entradas e saídas do seu negócio.',
      benefits: [
        'Visão clara de entradas e saídas',
        'Status de pagamento por cliente',
        'Histórico completo de transações',
        'Relatórios mensais automáticos',
      ],
    },
    {
      icon: Image,
      badge: 'Galeria para o Cliente',
      title: 'Entregue fotos de forma profissional',
      subtitle: 'Impressione seus clientes com uma entrega elegante.',
      benefits: [
        'Link exclusivo para cada cliente',
        'Download fácil e organizado',
        'Marca d\'água opcional',
        'Acesso por tempo limitado',
      ],
    },
    {
      icon: Bell,
      badge: 'Notificações Automáticas',
      title: 'Lembretes que trabalham por você',
      subtitle: 'Nunca mais esqueça um compromisso importante.',
      benefits: [
        'Lembrete automático de eventos',
        'Aviso de pagamentos pendentes',
        'Confirmação automática para clientes',
        'Notificações push no celular',
      ],
    },
    {
      icon: MessageCircle,
      badge: 'ChatBot de Atendimento',
      title: 'Atenda seus clientes 24/7',
      subtitle: 'Respostas automáticas para perguntas frequentes.',
      benefits: [
        'Respostas automáticas inteligentes',
        'FAQ personalizado',
        'Disponível 24 horas por dia',
        'Integração com WhatsApp (em breve)',
      ],
      comingSoon: false, // WhatsApp integration is coming soon
    },
    {
      icon: LayoutDashboard,
      badge: 'Dashboard Completo',
      title: 'Visão geral do seu negócio em segundos',
      subtitle: 'Métricas importantes sempre à mão.',
      benefits: [
        'Resumo do dia atualizado',
        'Próximos eventos na tela principal',
        'Pagamentos pendentes em destaque',
        'Novos clientes do mês',
      ],
    },
    {
      icon: Smartphone,
      badge: 'Acesso Mobile (PWA)',
      title: 'Funciona no seu celular, sem instalar nada',
      subtitle: 'Acesse de qualquer lugar, a qualquer momento.',
      benefits: [
        'PWA - funciona como app nativo',
        'Compatível com iOS e Android',
        'Interface adaptada para mobile',
        'Adicione à tela inicial',
      ],
    },
    {
      icon: BarChart3,
      badge: 'Relatórios e Histórico',
      title: 'Entenda seu negócio com dados reais',
      subtitle: 'Tome decisões baseadas em informações concretas.',
      benefits: [
        'Faturamento mensal detalhado',
        'Clientes mais ativos',
        'Eventos por período',
        'Exportação em PDF',
      ],
    },
    {
      icon: Shield,
      badge: 'Segurança e Backup',
      title: 'Seus dados protegidos, sempre',
      subtitle: 'Tranquilidade para você e seus clientes.',
      benefits: [
        'Criptografia SSL em todas as conexões',
        'Backup automático diário',
        'Acesso protegido por senha',
        'Privacidade garantida',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6 bg-gradient-to-b from-[#F5F5F7] to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1D1D1F] leading-tight"
            data-testid="funcionalidades-headline"
          >
            Tudo que você precisa para
            <span className="text-[#4A9B6E]"> gerenciar seu negócio</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#6E6E73] max-w-2xl mx-auto">
            Conheça cada funcionalidade do FOTIVA e veja como ele pode transformar sua rotina de trabalho.
          </p>
        </div>
      </section>

      {/* Features List */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-32">
          {features.map((feature, index) => (
            <FeatureBlock 
              key={index}
              feature={feature}
              index={index}
              isReversed={index % 2 !== 0}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-[#1A1A2E]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para experimentar?
          </h2>
          <p className="text-lg text-white/70 mb-10">
            Teste todas essas funcionalidades gratuitamente por 7 dias.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/cadastro"
              data-testid="funcionalidades-cta-primary"
              className="bg-[#4A9B6E] text-white hover:bg-[#3D8B5E] rounded-full px-8 py-4 font-semibold text-lg transition-all hover:scale-[1.02] inline-flex items-center justify-center gap-2"
            >
              Começar grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/precos"
              className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-4 font-semibold text-lg transition-all inline-flex items-center justify-center"
            >
              Ver preços
            </Link>
          </div>
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

export default Funcionalidades;
