# FOTIVA - Product Requirements Document

## Project Overview
**Nome:** FOTIVA — Sistema de Gestão para Fotógrafos Profissionais  
**Stack:** React + FastAPI + MongoDB + TailwindCSS + shadcn/ui + Lucide React  
**Data de criação:** Janeiro 2026

---

## User Personas

### Fotógrafo Profissional (Principal)
- Fotografa casamentos, ensaios, eventos
- Precisa organizar clientes, eventos e pagamentos
- Quer entregar fotos de forma profissional
- Busca economizar tempo em tarefas administrativas

### Cliente do Fotógrafo (Secundário)
- Acessa galeria para visualizar/baixar fotos
- Recebe notificações sobre eventos e pagamentos

---

## Core Requirements (Static)

### Backend (Existente - NÃO MODIFICADO)
- ✅ Autenticação JWT (login, registro, recuperação de senha)
- ✅ CRUD de Clientes
- ✅ CRUD de Eventos  
- ✅ CRUD de Pagamentos
- ✅ CRUD de Galerias
- ✅ Dashboard com estatísticas
- ✅ Push notifications (estrutura)

### Frontend - Landing Page
- ✅ 3 páginas públicas: Home (/), Funcionalidades (/funcionalidades), Preços (/precos)
- ✅ Design Apple-like com animações suaves
- ✅ ChatBot FAQ flutuante
- ✅ Navbar responsiva com menu mobile
- ✅ Footer com links organizados

### Frontend - Dashboard
- ✅ Sidebar corrigida (branco + Lucide icons)
- ✅ Dashboard com métricas
- ✅ Gestão de clientes, eventos, pagamentos, galeria
- ✅ Configurações
- ✅ VoiceChatbot (mantido do projeto original)

---

## What's Been Implemented

### Sessão 1 - 20/02/2026

#### FASE 1: Sidebar Corrigida
- Background branco (#FFFFFF)
- Ícones Lucide React (Dashboard, Calendar, Users, DollarSign, Image, Settings, LogOut)
- Item ativo: verde #4A9B6E com texto branco
- Item hover: verde claro #E8F5EE
- Avatar do usuário logado no rodapé
- Botão de logout

#### FASE 2: Navbar + Footer
- Navbar sticky com blur ao scroll
- Links para Funcionalidades e Preços
- Botões Entrar e Começar grátis
- Menu hambúrguer no mobile
- Footer com 4 colunas (Produto, Suporte, Legal, Redes sociais)

#### FASE 3: Página Home (/)
- Hero section com headline impactante
- Mockup do dashboard
- Social proof (500+ fotógrafos, R$ 2M+, 98% satisfação)
- Seção Problema → Solução
- Preview cards das funcionalidades
- Depoimento em destaque
- CTA final

#### FASE 4: Página Funcionalidades (/funcionalidades)
- 10 funcionalidades detalhadas com screenshots placeholder
- Layout alternado (imagem/texto)
- Badges coloridos
- Lista de benefícios com checkmarks

#### FASE 5: Página Preços (/precos)
- Comparação visual Sem/Com FOTIVA
- Card de preço (R$ 19,90/mês)
- ROI Calculator interativo
- 3 depoimentos de clientes
- FAQ com 6 perguntas (accordion)
- Seção de garantia 30 dias
- CTA final urgente

#### FASE 6: ChatBot FAQ
- Botão flutuante verde no canto inferior
- Janela de chat com mensagens
- Respostas automáticas por palavras-chave
- 15+ respostas configuradas
- Sugestões rápidas de perguntas
- Estrutura preparada para integração LLM futura

---

## Prioritized Backlog

### P0 (Crítico) - Completo
- [x] Sidebar com design correto
- [x] 3 páginas de landing page
- [x] ChatBot FAQ

### P1 (Alta prioridade)
- [ ] Screenshots reais do app (substituir placeholders)
- [ ] Integração com gateway de pagamento (Stripe/MercadoPago)
- [ ] Integração WhatsApp para ChatBot

### P2 (Média prioridade)
- [ ] Email transacional (SendGrid/Resend)
- [ ] Notificações push funcionais
- [ ] Galeria pública para clientes

### P3 (Backlog futuro)
- [ ] Relatórios exportáveis PDF
- [ ] Multi-idioma
- [ ] Tema escuro

---

## Next Tasks

1. **Substituir screenshots placeholder** por capturas reais do sistema
2. **Integrar Stripe** para pagamentos de assinatura
3. **Configurar WhatsApp Business API** para o ChatBot
4. **Implementar envio de emails** para notificações

---

## Technical Notes

### Dependências Adicionadas
- `chatbotConfig.js` - Configuração centralizada do FAQ
- `Navbar.jsx` - Navbar responsiva
- `Footer.jsx` - Footer com links
- `ChatBot.jsx` - Chatbot de FAQ

### Arquivos Modificados
- `Sidebar.jsx` - Redesign completo
- `LandingPage.js` - Refatoração total
- `App.js` - Novas rotas

### Design System
- Cor principal: #4A9B6E (verde FOTIVA)
- Fundo: #FFFFFF, #F5F5F7
- Texto: #1D1D1F, #6E6E73
- Fontes: SF Pro Display, Inter
