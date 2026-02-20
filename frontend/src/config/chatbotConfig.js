// ChatBot FAQ Configuration
// Este arquivo centraliza todas as respostas do chatbot para fácil manutenção
// Futuramente, pode ser substituído por integração com LLM

export const chatbotConfig = {
  welcomeMessage: "Olá! Sou o assistente virtual do FOTIVA. Como posso ajudar você hoje?",
  
  // Palavras-chave mapeadas para respostas
  responses: [
    {
      keywords: ['preço', 'quanto custa', 'valor', 'custo', 'mensalidade', 'plano'],
      response: "O FOTIVA custa apenas R$ 19,90 por mês (cerca de R$ 0,66 por dia). Você pode testar grátis por 7 dias, sem precisar de cartão de crédito!",
      priority: 1
    },
    {
      keywords: ['grátis', 'gratuito', 'free', 'trial', 'teste', 'experimentar'],
      response: "Sim! Você tem 7 dias grátis para testar todas as funcionalidades do FOTIVA. Não precisa de cartão de crédito e pode cancelar quando quiser.",
      priority: 1
    },
    {
      keywords: ['celular', 'mobile', 'aplicativo', 'app', 'smartphone', 'iphone', 'android'],
      response: "Sim! O FOTIVA funciona perfeitamente no celular como um PWA (Progressive Web App). Funciona em iOS e Android, sem precisar baixar nada da loja. Basta acessar pelo navegador e adicionar à tela inicial!",
      priority: 1
    },
    {
      keywords: ['cancelar', 'cancelamento', 'desistir', 'parar'],
      response: "Você pode cancelar sua assinatura a qualquer momento com apenas 1 clique, diretamente nas configurações da sua conta. Sem burocracia, sem perguntas.",
      priority: 1
    },
    {
      keywords: ['seguro', 'segurança', 'dados', 'privacidade', 'proteção', 'backup'],
      response: "Seus dados estão 100% seguros! Usamos criptografia SSL em todas as conexões e fazemos backup automático diário. Sua privacidade é nossa prioridade.",
      priority: 1
    },
    {
      keywords: ['funciona', 'como usar', 'funcionalidade', 'recurso', 'fazer'],
      response: "O FOTIVA oferece: gestão de clientes, controle de eventos, pagamentos e parcelas, galeria para entregar fotos aos clientes, notificações automáticas, dashboard completo e muito mais! Quer saber sobre alguma funcionalidade específica?",
      priority: 2
    },
    {
      keywords: ['suporte', 'ajuda', 'atendimento', 'problema', 'dúvida'],
      response: "Nosso suporte está disponível por chat e email, com resposta em até 24 horas. Assinantes têm suporte prioritário!",
      priority: 2
    },
    {
      keywords: ['pagamento', 'pagar', 'cartão', 'pix', 'boleto'],
      response: "Aceitamos cartão de crédito e PIX. Você pode gerenciar sua assinatura e forma de pagamento diretamente na plataforma.",
      priority: 2
    },
    {
      keywords: ['cliente', 'clientes', 'cadastro', 'cadastrar'],
      response: "Com o FOTIVA você pode cadastrar clientes ilimitados, com todas as informações importantes: contato, histórico de eventos, notas personalizadas e muito mais. Tudo organizado em um só lugar!",
      priority: 2
    },
    {
      keywords: ['evento', 'eventos', 'ensaio', 'casamento', 'sessão'],
      response: "Gerencie todos os seus eventos: casamentos, ensaios, aniversários e qualquer tipo de sessão. Acompanhe status, datas, valores e muito mais. Nunca mais esqueça um compromisso!",
      priority: 2
    },
    {
      keywords: ['galeria', 'foto', 'fotos', 'entrega', 'álbum'],
      response: "A galeria do FOTIVA permite que você entregue fotos de forma profissional. Cada cliente recebe um link exclusivo para visualizar e baixar suas fotos. Você pode definir prazo de acesso e usar marca d'água.",
      priority: 2
    },
    {
      keywords: ['notificação', 'lembrete', 'alerta', 'aviso'],
      response: "O FOTIVA envia notificações automáticas para você e seus clientes: lembretes de eventos, avisos de pagamento e confirmações. Você nunca mais vai esquecer um compromisso!",
      priority: 2
    },
    {
      keywords: ['importar', 'migrar', 'planilha', 'excel', 'csv'],
      response: "Sim! Você pode importar seus dados de planilhas via CSV. Assim, a migração para o FOTIVA é rápida e fácil.",
      priority: 2
    },
    {
      keywords: ['garantia', 'reembolso', 'devolução', 'dinheiro de volta'],
      response: "Oferecemos garantia de 30 dias! Se você não ficar satisfeito ou não economizar tempo, devolvemos 100% do seu dinheiro. Sem perguntas.",
      priority: 1
    },
    {
      keywords: ['começar', 'iniciar', 'criar conta', 'cadastrar', 'registrar'],
      response: "É muito fácil! Clique em 'Começar grátis', preencha seu nome e email, e pronto! Leva menos de 2 minutos. Você terá 7 dias grátis para testar tudo.",
      priority: 1
    },
    {
      keywords: ['whatsapp', 'integração', 'integrar'],
      response: "A integração com WhatsApp está em desenvolvimento e chegará em breve! Por enquanto, você pode usar nossas notificações automáticas por email e push.",
      priority: 3
    },
    {
      keywords: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'eae'],
      response: "Olá! Seja bem-vindo ao FOTIVA! Como posso ajudar você hoje? Pode perguntar sobre preços, funcionalidades, como começar, ou qualquer outra dúvida!",
      priority: 1
    },
  ],

  // Resposta padrão quando não encontra correspondência
  defaultResponse: "Desculpe, não entendi sua pergunta. Você pode perguntar sobre:\n\n• Preços e planos\n• Como funciona o FOTIVA\n• Período de teste grátis\n• Funcionalidades disponíveis\n• Suporte e ajuda\n\nOu clique em 'Ver preços' para conhecer nosso plano!",

  // Sugestões rápidas para mostrar ao usuário
  quickSuggestions: [
    "Quanto custa?",
    "Tem versão grátis?",
    "Funciona no celular?",
    "Como cancelo?",
    "É seguro?",
  ]
};

// Função para encontrar a melhor resposta
export const findBestResponse = (userMessage) => {
  const normalizedMessage = userMessage.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  let bestMatch = null;
  let highestPriority = 999;

  for (const item of chatbotConfig.responses) {
    for (const keyword of item.keywords) {
      const normalizedKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalizedMessage.includes(normalizedKeyword)) {
        if (item.priority < highestPriority) {
          highestPriority = item.priority;
          bestMatch = item.response;
        }
      }
    }
  }

  return bestMatch || chatbotConfig.defaultResponse;
};

export default chatbotConfig;
