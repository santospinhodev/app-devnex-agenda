Documento 1 Product Vision Document (PVD)
Produto: Devnex Agenda
Versão: 1.0
Responsável: Rodrigo Santos — CEO & Gerente de Projeto
Empresa: Devnex Solutions

1. Visão Geral do Produto
   O Devnex Agenda é uma plataforma mobile-first criada para barbearias e profissionais autônomos que precisam de velocidade, simplicidade e automação no processo de agendamento, atendimento e controle financeiro.
   Seu foco central é remover fricções presentes nos sistemas tradicionais e oferecer uma experiência de agendamento em 2–3 toques, tanto para barbeiros quanto para clientes.

2. Problema que o Produto Resolve
   Barbearias enfrentam diariamente:
   Sistemas lentos, pesados e não otimizados para celular

Clientes que esquecem horários (no-show alto)

Falta de automação e precisão no controle financeiro

Processos de agendamento demorados

Interfaces cheias de telas e passos desnecessários

Falta de organização e falta de previsibilidade da agenda

O Devnex Agenda elimina esses gargalos ao criar uma solução projetada 100% para uso no celular, com foco extremo em rapidez operacional.

3. Proposta de Valor (USP)
   “A agenda mais rápida e inteligente para barbeiros.”
   Agendamentos feitos com 2–3 toques

Cliente agenda e re-agenda em menos de 5 segundos

Automações inteligentes que aprendem padrões da barbearia

Notificações via WhatsApp que reduzem drasticamente no-show

Painel do barbeiro ultra objetivo, enxuto e rápido

4. Objetivos do Produto
   Aumentar eficiência operacional da barbearia

Menos tempo perdido em agendamento

Menos erros de horário

Reduzir drasticamente o no-show

Confirmação automática + lembretes WhatsApp

Aumentar receita por profissional

Mais atendimentos preenchidos

Controle financeiro claro

Criar uma experiência encantadora para o usuário

Simples, rápida, fluida

PWA/App que funciona em qualquer telefone

5. Público-Alvo
   Profissionais
   Barbeiros

Cabeleireiros

Profissionais autônomos da beleza

Negócios
Barbearias de pequeno a médio porte

Salões com vários profissionais

Clientes finais
Usuários que querem agendar com facilidade, sem telefone, sem fricção e sem senha.

6. Principais Benefícios
   Para o barbeiro:
   Agendamento instantâneo

Painel diário ultra rápido

Controle financeiro simples

Histórico de clientes rápido

Diminuição de “desmarcação de última hora”

Para o cliente:
Agendamento rápido

Sem senha (WhatsApp login)

Histórico e re-agendamento fácil

7. Diferencial Competitivo
   O Devnex Agenda se posiciona como a solução mais rápida do mercado, baseada em 3 pilares:
1. Mobile-First Real
   Telas, componentes e navegação feitos exclusivamente para uso no celular.
   Nada de interfaces adaptadas do desktop.
1. Agenda Smart (Inteligente)
   Sugere horários mais prováveis

Preenche duração automaticamente

Aprende padrões semanais

Sugere serviços mais utilizados

3. Automações Inteligentes
   Notificações WhatsApp integradas

Fluxos automáticos de confirmação

Lembretes e alertas inteligentes

8. Métricas de Sucesso (KPIs)
   Redução do no-show (meta: -50%)

Tempo médio para criar um agendamento (meta: < 5 segundos)

Engajamento diário do barbeiro (meta: > 70%)

Taxa de re-agendamentos pelo cliente

Crescimento orgânico via convite WhatsApp

9. Premissas
   O foco inicial é mobile

A agenda é o coração do sistema

O MVP precisa ser enxuto e funcional

O barbeiro deve resolver 80% do seu dia na tela principal

Reduzir toques, telas e carga cognitiva é prioridade absoluta

10. Declaração de Visão
    “Criar a plataforma de agendamentos mais rápida, inteligente e simples do mercado para profissionais da beleza — começando pelos barbeiros.”

Documento 2 Escopo Oficial do MVP (Mobile-First)
Produto: Devnex Agenda
Versão: 1.0
Responsável: Rodrigo Santos — CEO & Gerente de Projeto

1. Objetivo do MVP
   Construir um sistema mobile-first que permita a barbeiros e clientes:
   Agendar serviços de maneira ultra rápida

Reduzir no-show com automações via WhatsApp

Controlar o financeiro essencial

Operar 100% pelo celular, sem complexidade

O MVP deve ser funcional, enxuto e preparado para escalar.

2. Funcionalidades Essenciais do MVP
   As 5 funcionalidades centrais definidas para o MVP são:

2.1. Agenda Inteligente e Rápida (Barbeiro)
Funcionalidades:
Criar horário com 1 toque (“+ Horário”)

Editar horário com 1 toque

Excluir horário com confirmação rápida

Bloqueio de horários

Recorrência simples (ex.: toda semana mesmo horário)

Visualização diária e semanal compacta

Ação rápida: “Adicionar cliente ao horário”

Regras de Negócio:
Cada horário tem: cliente, serviço, duração, status, observações

Quando o barbeiro abre o app, a Agenda do Dia é exibida imediatamente

A sugestão de horário é automática:

Com base no último horário

Com base na duração do serviço escolhido

2.2. Agendamento Online (Cliente)
Funcionalidades:
Cliente seleciona: profissional → serviço → horário → confirmar

Login ultra simples via WhatsApp (sem senha)

Histórico de agendamentos

Reagendamento com 1 toque

Regras de Negócio:
O cliente só vê horários disponíveis

Confirmação é enviada via WhatsApp

Cancelamentos só podem ser feitos até X horas antes (configurável na V2, fixo no MVP)

2.3. Notificações Automáticas via WhatsApp
Tipos de Notificações:
Confirmação automática

Lembrete antes do horário

Atraso/cancelamento pelo barbeiro

Regras de Negócio:
O sistema precisa de integração com API de WhatsApp Business

Lembrete padrão: 1 hora antes

Logs de todas notificações devem ser registrados

2.4. Gestão Financeira Essencial
Funcionalidades:
Registro rápido de serviços finalizados

Resumo de caixa diário

Cálculo automático de comissão por profissional

Regras de Negócio:
Cada serviço finalizado gera um registro financeiro

Comissão é calculada com % fixa por profissional

Caixa diário mostra:

total do dia

entradas

saídas

saldo final

2.5. Painel Simplificado do Barbeiro
Funcionalidades:
Lista do dia: clientes, serviços, horários, valores

Marcar “Finalizado” com 1 toque

Visual limpo, objetivo e rápido

Regras de Negócio:
Status possíveis: “Agendado”, “Em andamento”, “Finalizado”, “Cancelado”

Ao finalizar → gera registro financeiro

Ao cancelar → envia notificação ao cliente

3. Funcionalidades Fora do Escopo do MVP
   (Não podem ser sugeridas nem implementadas agora)
   Programa de fidelidade

Pagamentos online

Dashboard avançado de estatísticas

Gestão de estoque

Multibarberia com gerentes (chega na V2 ou V3)

Plano de assinatura

App desktop

4. Requisitos Não Funcionais
   Carregar tela principal em < 2s

Função “Criar horário” em < 3 toques

PWA leve, responsivo, com push notifications (opcional)

Database otimizado para leitura rápida

Interface projetada para operação com uma mão

Todo fluxo deve funcionar de 3G/4G

5. Restrição de MVP
   Somente o essencial

Sem telas complexas

Sem fluxos longos

Foco total na Agenda e Operação diária

6. Entregáveis da Fase MVP
   PWA/App com 5 blocos principais:

Agenda

Clientes

Serviços

Financeiro

Painel do Barbeiro

API + DB conectados

Sistema de notificação WhatsApp

Testes básicos

Documentação inicial

Documento 3 Arquitetura de Sistema (Devnex Agenda – MVP)
Fase 1: Discovery & Escopo — Documento Técnico Oficial

1. Visão Geral da Arquitetura
   O Devnex Agenda será construído com uma arquitetura moderna, modular e escalável, priorizando:
   Alta velocidade no mobile

Baixa complexidade operacional

Redução máxima de latência

Capacidade de incorporar automações inteligentes no futuro

A arquitetura adota o padrão Clean Architecture + Modular Services, permitindo crescimento natural para um ecossistema com IA, pagamentos e APIs externas.

2. Componentes Principais do Sistema (Visão Macro)
   2.1. Frontend
   Focado em Mobile-First, dividido em:
   a) Aplicativo/PWA para Clientes
   Navegação ultra rápida

Fluxo: escolher serviço → profissional → horário → confirmar

Login via WhatsApp (deep link / magic key)

Histórico e re-agendamento instantâneo

b) Aplicativo Web/Mobile para Barbeiros
Agenda inteligente

Painel do dia

Gestão financeira simplificada

Ações rápidas (one-tap)

c) Painel Admin (Web)
Cadastro de serviços

Controle financeiro geral

Configurações de equipe

Relatórios mínimos do MVP

Tecnologias recomendadas:
React Native OU Flutter (mobile)

React.js (painéis web)

PWA no cliente para reduzir custo inicial

2.2. Backend
Backend unificado, com serviços desacoplados, contendo:
a) Core API
Serviços de agendamento

Usuários (clientes, barbeiros, admin)

Serviços e preços

Regras de horário e disponibilidade

Comandos financeiros (entrada, saída, comissão)

b) Notificações / Mensageria
Envio de mensagens via WhatsApp API

Fila assíncrona (fila de lembretes, confirmações e cancelamentos)

Webhooks para eventos da Meta API

c) Motor de Lógica da Smart Agenda
Primeiro módulo de automações

Lógica inicial:

Sugerir horários prováveis

Preencher padrões repetitivos

Aprender horários mais preenchidos

Desenvolvido já preparado para evoluir para IA

d) Storage / Banco de Dados
PostgreSQL (recomendado)

Redis (cache e filas rápidas)

Migrações via Prisma ou Sequelize

3. Arquitetura Lógica do MVP
   3.1. Fluxos Técnicos de Alto Nível
   Fluxo 1 — Agendamento do Cliente
   Cliente acessa app/PWA

Escolhe serviço

Backend retorna horários disponíveis

Cliente confirma

API grava agendamento

Serviço de mensagens envia confirmação via WhatsApp

Agenda do barbeiro atualiza em tempo real (via WebSockets)

Fluxo 2 — Agenda do Barbeiro
Barbeiro acessa painel

API retorna agenda do dia

Ele edita/cria horários

API processa bloqueios, recorrências e ajustes

Agenda sincroniza com cliente

Fluxo 3 — Financeiro Essencial
Barbeiro marca atendimento como finalizado

API registra serviço concluído

Calcula comissão

Atualiza caixa diário

Painel Admin mostra resumo

4. Microserviços ou Monolito Modular?
   Decisão Oficial (baseada no estágio MVP):
   ➡️ Monolito Modular + Serviços Assíncronos Isolados
   Justificativa:
   Menor custo

Mais rápido para entregar

Reduz complexidade do deploy

Permite modularidade interna (agenda, financeiro, notificações)

Posteriormente, serviços de:
Notificações

Smart Agenda/IA

Pagamentos
podem virar microserviços isolados.

5. Integrações Externas
   5.1 WhatsApp API (Meta Cloud API)
   Confirmações

Lembretes programados via job assíncrono

Cancelamentos

Recuperação de cliente (ex: “Perdeu horário?”)

5.2 Gateway de Pagamento (Futuro, mas previsto na arquitetura)
No MVP: não implementado

Apenas deixar rotas e estrutura preparada

6. Segurança & Autenticação
   MVP Autenticação:
   Via WhatsApp (link + verificação simples)

Token temporário

Sem senha

Criptografia:
Dados sensíveis transportados via HTTPS

Tokens JWT com refresh

Permissões:
Cliente

Barbeiro

Admin

Recepcionista

7. Infraestrutura e Deploy
   Infra sugerida para MVP
   Vercel / Netlify (frontend web)

AWS / Railway / Render para backend

Filas de mensagens: Redis (Upstash)

Banco: PostgreSQL (Supabase ou Neon)

Observações:
Prioridade total → baixa latência e estabilidade nas notificações

Deploy contínuo automatizado (CI/CD)

8. Escalabilidade (Preparação para o Futuro)
   O sistema já nasce preparado para:
   Múltiplas barbearias

Expansão geográfica

Aplicativos nativos

Automação avançada

Funcionalidades premium (assinaturas)

Estrutura modular garantirá evolução sem reescrever do zero.

9. Diretriz Central de Arquitetura
   “O sistema deve manter o foco total em velocidade, simplicidade e precisão nas operações da agenda e notificações.”
   Qualquer decisão técnica deve:
   Reduzir fricção

Minimizar latência

Favorecer o uso mobile

Evitar complexidade desnecessária

Preparar terreno para automações inteligentes

Documento 4 Requisitos Técnicos Detalhados do MVP
Devnex Agenda — MVP Mobile-First para Barbearias
Fase 1 — Discovery & Escopo
Este documento lista todos os requisitos funcionais, técnicos e operacionais do MVP — detalhados, estruturados e prontos para implementação.
Ele será a base oficial para geração dos prompts do Agent DevLeader e desenvolvimento pelo Agent DevSenior.

✅ 1. Estrutura Completa de Usuários e Permissões
1.1 Tipos de Usuário
Cliente

Barbeiro

Recepcionista

Admin

1.2 Regras de Autenticação
Todos Usuários podem ter login via email/senha no Painel Web

JWT para sessões

Refresh tokens com expiração longa

1.3 Permissões por Tipo de Usuário
Cliente
Criar agendamento

Cancelar agendamento

Receber lembretes

Ver histórico

Reagendar com 1 toque

Barbeiro
Ver agenda própria

Criar/editar/bloquear horários

Marcar horário como concluído

Registrar serviço realizado

Ver ganhos e comissões

Editar preço dos serviços próprios (opcional por regra admin)

Recepcionista
Criar agendamentos para clientes

Editar/cancelar horários

Registrar pagamento e finalização

Gerenciar caixa diário

Não acessa configurações avançadas

Admin
Gerenciar barbeiros

Gerenciar recepcionistas

Editar serviços e preços

Ver relatório financeiro completo

Configurar regras de agenda

Configurar mensagens automáticas

📅 2. Módulo de Agendamentos — Requisitos Detalhados
2.1 Estrutura do Agendamento
Um agendamento contém:
ID

Cliente

Barbeiro

Serviço

Tempo do serviço

Horário de início

Horário final calculado

Status: agendado | confirmado | concluído | cancelado

Observação opcional

Valor do serviço

Canal de criação (cliente, recepcionista, barbeiro)

2.2 Regras de Negócio
Agendamentos não podem se sobrepor para o mesmo barbeiro

Horários indisponíveis devem ser ocultados do cliente

Bloqueios manuais do barbeiro devem refletir imediatamente

Cancelamentos devem disparar notificação automática

Reagendamento deve manter histórico de alterações

Deve existir limite de cancelamento configurável (ex: até 1h antes)

2.3 Regras da Agenda Smart (Versão MVP)
Sugestão de horários baseados em:

Horários livres próximos

Padrão de funcionamento

Serviços mais comuns do barbeiro

Aprendizado simples salvo via estatísticas (sem IA avançada ainda)

Dois toques para o barbeiro criar agendamento:

Toca no horário

Seleciona cliente/serviço

💬 3. Módulo de Notificações — Regras Técnicas
3.1 Canal
Meta Cloud API (WhatsApp)

3.2 Mensagens obrigatórias
Confirmação de agendamento

Lembrete antes do horário (30min / 60min configurável)

Alerta de atraso

Cancelamento

Mensagem de “Reagendar agora” caso o cliente não compareça (opcional)

3.3 Regras Técnicas
Todas notificações devem ser enfileiradas no Redis

Tentativa automática de reenvio em caso de falha

Logs armazenados no banco

Webhooks devem registrar:

Mensagens entregues

Falhas

Cliques (quando disponível)

💳 4. Módulo Financeiro Essencial — Requisitos
4.1 Quando um serviço é finalizado
Registrar:

Serviço

Valor

Barbeiro

Comissão

Forma de pagamento (manual)

Observação

4.2 Caixa Diário
Entradas (atendimentos)

Saídas (manuais)

Saldo

Total por barbeiro

Total da barbearia

4.3 Regras de Comissão
% personalizada por barbeiro

Comissão calculada automaticamente

Admin pode editar regras de comissão

4.4 Relatórios MVP
Total diário

Total semanal simples

Histórico por barbeiro

📱 5. Frontend — Requisitos por Interface

5.1 App/PWA Cliente
Listar serviços

Listar barbeiros

Selecionar data

Selecionar horário

Confirmar agendamento

Visualizar histórico

Reagendar em 1 toque

Receber notificações via WhatsApp

Acesso sem senha (somente WhatsApp)

5.2 App Mobile Barbeiro
Painel do dia com lista de horários

Criar agendamento rápido

Editar horário

Bloquear horário

Concluir atendimento

Resumo financeiro da semana

Perfil com fotos (opcional no MVP)

Regras de UX do Barbeiro
Todas ações principais devem ser acessíveis com no máximo 2 toques

Hierarquia visual prioritária: horários → clientes → ações rápidas

Carregamento instantâneo (cache + otimização)

5.3 Painel Web — Recepcionista
Criar agendamento

Editar/cancelar

Visualizar agenda geral

Registrar finalização

Gerenciar caixa diário

5.4 Painel Admin
Gerenciar equipe

Gerenciar serviços e preços

Configurar horários da barbearia

Ver relatórios generalistas

🔧 6. Backend — Requisitos Técnicos
6.1 API
REST ou GraphQL (definir no Doc 5)

Endpoints segmentados por módulo:

/auth

/cliente

/barbeiro

/recepcionista

/admin

/agendamentos

/financeiro

/notificacoes

6.2 Integrações
WhatsApp API

Redis para filas

WebSockets para sincronização ao vivo

6.3 Segurança
Tax-limiting por IP

Verificação do token antes de cada request

Roles obrigatórios em cada rota

Auditoria de eventos críticos

🗄️ 7. Banco de Dados — Requisitos
7.1 Tabelas Principais
users

barbers

clients

appointments

services

cash_flow

commissions

notifications_logs

blocked_times

settings

7.2 Regras do Banco
Todas tabelas com timestamps

Exclusão deve ser sempre lógica (soft delete)

Índices em campos críticos (horários, barbeiro, status)

Históricos sempre preservados

🚀 8. Performance & Requisitos Não Funcionais
App deve carregar em < 1s em 4G

Agendamento deve ser concluído em < 5 segundos

Notificações devem ser enviadas em até 2 segundos após evento

Banco deve suportar 10k agendamentos/mês na primeira fase

Logs e auditorias must-have

🧠 9. Requisitos Futuramente Expansíveis (Mas já previstos)
Não serão implementados agora, mas a arquitetura deve permitir:
Pagamentos no app

Assinaturas e planos

Integração com POS

Automação IA avançada da agenda

Marketplace de barbeiros

Documento 5 ESPECIFICAÇÃO DA API (MVP)
Projeto: Devnex Agenda
Foco: API central em Node.js + NestJS, orientada a módulos, clean architecture e preparada para escalabilidade.
Base: PostgreSQL
Autenticação: JWT (Access + Refresh Tokens)
Formato: REST (v1), com abertura futura para GraphQL.

1. Arquitetura da API
   A API será organizada em módulos independentes:
   Auth

Usuários (Admin, Barbeiro, Recepcionista, Cliente)

Barbearias

Serviços

Agenda

Agendamentos

Financeiro

Notificações

Logs e Auditoria

Cada módulo possui controllers, services, repositories e DTOs.

2. Padrões Gerais
   Formato de resposta:

{
"success": true,
"data": {},
"message": ""
}

Paginação padrão:
?page=1&limit=20

Erros padronizados:

{
"success": false,
"error": {
"code": "RESOURCE_NOT_FOUND",
"message": "Agendamento não encontrado"
}
}

Versionamento:
/api/v1/...

3. Módulo Auth
   3.1 Rotas
   POST /auth/login
   Login via email/senha (Painel Web)
   Body:
   { "email": "user@dev.com", "password": "123456" }

POST /auth/refresh
Gera novo access token.
POST /auth/logout
POST /auth/mobile/whatsapp
(Opcional para cliente — se ativado futuramente no mobile, mas não obrigatório no MVP. Mantemos endpoint reservado.)

4. Usuários
   Representa perfis: admin, barbeiro, recepcionista e cliente.
   4.1 Rotas
   GET /users/me
   Retorna perfil autenticado.
   POST /users
   (Admin) Cria novo usuário.
   Permite criar barbeiros e recepcionistas.
   PATCH /users/:id
   Atualiza dados.
   GET /users
   Lista filtrada.
   Campos base:
   nome

telefone

email

role (admin, barbeiro, recepcionista, cliente)

status

5. Barbearias
   5.1 Rotas
   POST /barbearias
   Criação pelo Admin.
   GET /barbearias/:id
   PATCH /barbearias/:id
   Dados:
   Nome

Endereço

Horários de funcionamento

Regras de bloqueio

Preferências de notificação

6. Serviços
   6.1 Rotas
   POST /servicos
   Cria serviços (ex: cortes, barba, combo).
   GET /servicos
   PATCH /servicos/:id
   Campos:
   nome

duração (minutos)

valor

comissão padrão (%)

7. Agenda
   Módulo crítico do MVP.
   7.1 Rotas
   GET /agenda/barbeiro/:id
   Retorna horários do barbeiro.
   Parâmetros:
   ?date=2025-01-14
   POST /agenda/bloqueios
   Cria bloqueio de agenda.
   DELETE /agenda/bloqueios/:id
   7.2 Lógica da Agenda Smart
   Endpoint dedicado:
   GET /agenda/barbeiro/:id/sugestoes
   Retorna:
   horários prováveis de encaixe

padrões de horários do barbeiro

repetições comuns

melhores horários “livres curtos”

8. Agendamentos
   8.1 Rotas essenciais
   POST /agendamentos
   Criação via cliente ou recepcionista.
   Body:
   {
   "clienteId": 1,
   "barbeiroId": 2,
   "servicoId": 3,
   "data": "2025-01-20",
   "hora": "14:00"
   }

PATCH /agendamentos/:id
Reagendamento rápido.
GET /agendamentos/:id
GET /agendamentos/barbeiro/:id
Lista do dia.
GET /agendamentos/cliente/:id
Histórico do cliente.
PATCH /agendamentos/:id/finalizar
Barbeiro finaliza com 1 toque.

9. Financeiro
   9.1 Rotas
   POST /financeiro/lancamentos
   Entrada ou saída.
   GET /financeiro/caixa/dia
   Caixa diário.
   GET /financeiro/comissoes/:barbeiroId
   Cálculo de comissões baseado em serviços finalizados.
   Campos:
   tipo (entrada/saída)

valor

referência (serviço/agendamento)

método (dinheiro, pix, cartão)

10. Notificações
    10.1 Rotas
    POST /notificacoes/whatsapp
    Envia confirmação, lembrete ou alerta.
    Tipos:
    confirmação imediata

lembrete

atraso/cancelamento

11. Logs & Auditoria
    11.1 Rotas
    GET /logs
    Permite auditoria por Admin.
    Registra:
    login

criação/edição de agendamento

bloqueios

finalizações

fluxo financeiro

12. Segurança
    JWT curto + Refresh longo

RBAC (role based access control)

Rate limit

Sanitização de input

Logs estruturados

Criptografia de senha (bcrypt)

13. Erros Globais
    Código
    Descrição
    INVALID_CREDENTIALS
    Login incorreto
    NO_PERMISSION
    Sem permissão
    DATE_UNAVAILABLE
    Horário não disponível
    SERVICE_INACTIVE
    Serviço desativado
    USER_INACTIVE
    Usuário inativo
    INTERNAL_ERROR
    Erro inesperado

14. Performance
    Cache Redis para:

sugestões de agenda

horários mais acessados

dados estáticos (serviços)

Fila BullMQ para envio de WhatsApp

Query otimizada com índices no PostgreSQL

15. Roadmap Pós-MVP (Reservado, não implementado agora)
    GraphQL

Webhooks

Pagamento integrado

Multiunidade automática

Dashboards avançados

Documento 6 FLUXOS DE USUÁRIO (UX FLOWS)
Projeto: Devnex Agenda
Fase: Discovery & MVP
Foco: Experiência Mobile-First para Barbeiros e Clientes
Objetivo: Mapear fluxos completos, claros e otimizados, servindo como referência direta para telas UI e lógica aplicada.

1. Usuários Mapeados
   Cliente (Mobile PWA)

Barbeiro (Mobile App/PWA)

Recepcionista (Painel Web)

Admin (Painel Web)

Cada fluxo abaixo é otimizado para minimizar toques, reduzir fricção e acelerar a operação.

2. Fluxos do Cliente (PWA Mobile)

2.1 Fluxo – Criar Agendamento
Objetivo: Agendar serviço em 5–10 segundos.
Cliente abre o app

Tela inicial → botão “Agendar”

Seleciona Barbeiro

Seleciona Serviço

Seleciona Data e Hora (somente horários livres)

Confirma agendamento

Recebe notificação de confirmação via WhatsApp

Sistemas envolvidos:
Agenda

Agendamentos

Serviços

Notificações (WhatsApp)

2.2 Fluxo – Reagendar
Cliente abre app

Acessa “Meus Agendamentos”

Seleciona agendamento ativo

Clique em “Reagendar”

Escolhe nova data/hora

Confirma

WhatsApp envia notificação automática

2.3 Fluxo – Cancelar Agendamento
Cliente abre app

Acessa “Meus Agendamentos”

Seleciona o agendamento

Botão “Cancelar”

Confirmação de cancelamento

WhatsApp envia aviso automático

3. Fluxos do Barbeiro (Mobile-First App/PWA)

3.1 Fluxo – Visualizar Agenda do Dia
Abre o app → agenda diária imediatamente visível

Lista dos horários com:

cliente

serviço

status

valor

Barbeiro toca em um item para detalhes ou alteração

3.2 Fluxo – Criar Agendamento Rápido
Tela da agenda

Botão “+”

Seleciona cliente (com busca rápida)

Seleciona serviço

Horário sugerido (Agenda Smart)

sugestões automáticas

Confirma

WhatsApp envia confirmação

3.3 Fluxo – Bloquear Horário
Tela da agenda

Seleciona horário

Opção “Bloquear período”

Define início e fim

Salva

3.4 Fluxo – Finalizar Atendimento
Seleciona agendamento em andamento

Botão “Finalizar” (1 toque)

Sistema registra:

comissão

valor

pagamento (manual, se necessário)

4. Fluxos do Recepcionista (Painel Web)

4.1 Fluxo – Criar Agendamento para Cliente
Acessa painel web

Menu “Agenda”

Seleciona barbeiro

Clique no horário desejado

Preenche:

cliente

serviço

Confirma agendamento

WhatsApp envia notificação

4.2 Fluxo – Gerenciar Agenda
Filtra barbeiro

Visualiza agenda diária

Pode:

cancelar

reagendar

criar

editar

bloquear horários

4.3 Fluxo – Pagamentos / Caixa
Menu “Financeiro”

Registrar entradas

Registrar saídas

Ver caixa diário

Ver comissões

5. Fluxos do Admin (Painel Web)

5.1 Fluxo – Criar Usuários
Menu “Usuários”

Botão “Criar usuário”

Seleciona role

Admin

Barbeiro

Recepcionista

Preenche dados

Salva

5.2 Fluxo – Gerenciar Serviços da Barbearia
Menu “Serviços”

Criar / editar / remover serviços

Definir preços e duração

Salvar

5.3 Fluxo – Visualizar Relatórios Básicos
Menu “Relatórios”

Relatório financeiro (básico)

Serviços mais agendados

Barbeiros com maior volume

6. Diagramas Simplificados (Texto)
   (Versões gráficas podem ser produzidas depois)

6.1 Fluxo Cliente – Criar Agendamento
Home → Selecionar Barbeiro → Selecionar Serviço → Escolher Horário → Confirmar → WhatsApp

6.2 Fluxo Barbeiro – Finalizar Atendimento
Agenda → Selecionar Atendimento → Finalizar → Registrar no Financeiro

6.3 Fluxo Recepcionista – Agendar Cliente
Agenda → Selecionar Barbeiro → Selecionar Horário → Cliente + Serviço → Confirmar → WhatsApp

6.4 Fluxo Admin – Criar Usuário
Painel Admin → Usuários → Criar → Role → Salvar

7. Regras de UX Importantes (Mobile-First)
   Máximo de 3 a 5 toques por fluxo crítico

Sempre priorizar horário sugerido

Ações rápidas visíveis na tela inicial

Feedback instantâneo (loading curto, toasts claros)

Nunca exigir cadastro burocrático

Layout 100% operável com uma mão

Documento 7 MODELAGEM DO BANCO DE DADOS
Devnex Agenda — MVP

1. Visão Geral da Modelagem
   O banco do MVP será relacional (PostgreSQL) usando Prisma ORM, com suporte total ao deploy na Vercel/Postgres ou equivalente.
   A modelagem foi construída com base em:
   Fluxos de usuário

Permissões (Admin, Barbeiro, Recepcionista, Cliente)

Estrutura da API

Requisitos funcionais do MVP

Arquitetura multi-tenant leve (tenant = barbearia)

2. Entidades Principais
   2.1 Usuário (User)
   Representa qualquer pessoa com acesso ao sistema (Admin, Barbeiro, Recepcionista, Cliente).
   Campos principais
   id

name

email

password (hash)

role (enum: ADMIN, BARBER, RECEPTIONIST, CLIENT)

phone

createdAt

updatedAt

2.2 Barbearia (Barbershop)
Unidade principal do sistema.
Campos
id

name

address

ownerId (Admin)

createdAt

Relacionamentos
1 Admin → muitas barbearias

1 barbearia → vários barbeiros

1 barbearia → vários recepcionistas

1 barbearia → vários clientes (que agendam nela)

2.3 Serviços (Service)
Serviços oferecidos pela barbearia.
Campos
id

barbershopId

name

durationMinutes

price

createdAt

2.4 Barbeiro (Barber)
Ligação entre usuário e barbearia.
Campos
id

userId

barbershopId

createdAt

Relacionamento
1 Barbeiro pertence a 1 barbearia

Agenda vinculada ao barbeiro

2.5 Agenda / Horários (Schedule)
Estrutura dos horários disponíveis do barbeiro.
Campos
id

barberId

dayOfWeek (0–6)

startTime

endTime

createdAt

2.6 Horários Bloqueados (BlockedTime)
Barbeiro pode bloquear parte da agenda (férias, intervalo, folga).
Campos
id

barberId

start

end

reason

2.7 Clientes (Customer)
Cliente atrelado à barbearia (pode existir sem login).
Campos
id

name

phone

email?

createdAt

2.8 Agendamentos (Appointment)
Coração do MVP.
Campos
id

barbershopId

barberId

customerId

serviceId

date

start

end

status (enum: PENDING, CONFIRMED, CANCELED, DONE)

createdAt

2.9 Logs de Atividade (ActivityLog)
Para auditoria básica no MVP.
Campos
id

userId?

action

description

createdAt

3. Diagrama Relacional (Texto Estruturado)
   User (1) --- (N) Barbershop (via ownerId)
   User (1) --- (1) Barber --- (N) Schedule
   └--- (N) BlockedTime
   Barbershop (1) --- (N) Service
   Barbershop (1) --- (N) Customer
   Barber (1) --- (N) Appointment
   Customer (1) --- (N) Appointment
   Service (1) --- (N) Appointment

4. Enums
   UserRole
   ADMIN

BARBER

RECEPTIONIST

CLIENT

AppointmentStatus
PENDING

CONFIRMED

CANCELED

DONE

5. Modelo Prisma (versão MVP inicial)
   (Formato direto para implementação)
   model User {
   id String @id @default(uuid())
   name String
   email String @unique
   password String
   phone String?
   role UserRole
   createdAt DateTime @default(now())
   updatedAt DateTime @updatedAt

Barber Barber?
Barbershops Barbershop[] @relation("OwnerShops")
}

model Barbershop {
id String @id @default(uuid())
name String
address String?
ownerId String
createdAt DateTime @default(now())

owner User @relation("OwnerShops", fields: [ownerId], references: [id])
services Service[]
barbers Barber[]
customers Customer[]
appointments Appointment[]
}

model Service {
id String @id @default(uuid())
barbershopId String
name String
durationMinutes Int
price Float
createdAt DateTime @default(now())

barbershop Barbershop @relation(fields: [barbershopId], references: [id])
appointments Appointment[]
}

model Barber {
id String @id @default(uuid())
userId String
barbershopId String
createdAt DateTime @default(now())

user User @relation(fields: [userId], references: [id])
barbershop Barbershop @relation(fields: [barbershopId], references: [id])
schedules Schedule[]
blockedTimes BlockedTime[]
appointments Appointment[]
}

model Schedule {
id String @id @default(uuid())
barberId String
dayOfWeek Int
startTime String
endTime String
createdAt DateTime @default(now())

barber Barber @relation(fields: [barberId], references: [id])
}

model BlockedTime {
id String @id @default(uuid())
barberId String
start DateTime
end DateTime
reason String?
createdAt DateTime @default(now())

barber Barber @relation(fields: [barberId], references: [id])
}

model Customer {
id String @id @default(uuid())
barbershopId String
name String
phone String
email String?
createdAt DateTime @default(now())

barbershop Barbershop @relation(fields: [barbershopId], references: [id])
appointments Appointment[]
}

model Appointment {
id String @id @default(uuid())
barbershopId String
barberId String
customerId String
serviceId String
date DateTime
start DateTime
end DateTime
status AppointmentStatus
createdAt DateTime @default(now())

barbershop Barbershop @relation(fields: [barbershopId], references: [id])
barber Barber @relation(fields: [barberId], references: [id])
customer Customer @relation(fields: [customerId], references: [id])
service Service @relation(fields: [serviceId], references: [id])
}

model ActivityLog {
id String @id @default(uuid())
userId String?
action String
description String?
createdAt DateTime @default(now())
}

enum UserRole {
ADMIN
BARBER
RECEPTIONIST
CLIENT
}

enum AppointmentStatus {
PENDING
CONFIRMED
CANCELED
DONE
}

6. Considerações Técnicas Importantes
   Compatível com deploy na Vercel.

Estrutura leve e escalável para multi-barbeiros e multi-barbeirias.

Suporta autenticação unificada (email/senha) para todos usuários.

Atende todos fluxos do Documento 6.

7. Conclusão
   A modelagem está sólida, alinhada e pronta para implementação imediata no MVP.

Documento 8 Plano de Desenvolvimento (Roadmap Técnico)
Devnex Agenda — MVP Mobile-First para Barbearias

1. Objetivo do Documento
   Definir um roadmap técnico completo, organizado em etapas lógicas de desenvolvimento, garantindo velocidade, previsibilidade, rastreabilidade e fidelidade total ao escopo e UX definidos.
   O plano é estruturado para permitir que o DevLeader → DevSenior trabalhem em ciclos curtos, entregas contínuas e máxima eficiência.

2. Metodologia de Produção
   Estratégia: Incremental + Mobile-First + API-First

Base:

Primeiro a API mínima funcionando

Depois telas essenciais do barbeiro

Depois fluxo do cliente

Depois módulos de automação e financeiro

Ciclos:
Sprints curtas de 3–5 dias

3. Fases do Desenvolvimento (Roadmap Técnico)

Fase 1 — Foundation (Infra + Auth + Projeto Base)
Duração estimada: 3–5 dias
🔧 Entregas técnicas:
Criar monorepo (ou repos separados) configurados na Vercel

Criar API base (Node / Next.js Server Actions / Prisma)

Criar estrutura inicial de banco (usuários, barbeiros, clientes, serviços, horários)

Implementar:

Login email/senha (todas categorias de usuário no painel web)

Login WhatsApp para clientes (PWA)

Configuração de segurança:

Middlewares de autenticação

RBAC inicial (Admin, Barbeiro, Recepcionista, Cliente)

🎯 Objetivo:
Ter o esqueleto funcionando.

Fase 2 — Agenda do Barbeiro (Core do MVP)
Duração: 7–10 dias
🔧 Entregas:
Tela “Agenda Smart” mobile-first

Fluxo 1.1 (ver agenda)

Fluxo 1.2 (criar horário)

Fluxo 1.3 (editar horário)

Bloqueios, recorrências básicas

Tela Lista do Dia

Tela Detalhes do Agendamento

Função “Finalizar Serviço”

🔗 Integração essencial:
Webhooks WhatsApp:

confirmação

lembrete

atraso/cancelamento

🎯 Objetivo:
Entregar a experiência ultra-rápida do barbeiro, o coração do Devnex Agenda.

Fase 3 — Agendamento do Cliente (PWA/App)
Duração: 6–9 dias
🔧 Entregas:
Tela escolha do profissional

Tela escolha do serviço

Tela escolha do horário

Tela de confirmação

Histórico do cliente

Reagendamento

Cancelamento

Notificações WhatsApp correspondentes

🎯 Objetivo:
Cliente cria um agendamento em 5–10 segundos.

Fase 4 — Módulo Financeiro Essencial
Duração: 4–6 dias
🔧 Entregas:
Registro de serviços finalizados

Cálculo automático de comissões

Controle financeiro diário

Relatórios simples (Entradas/Saídas)

Export CSV básico

🎯 Objetivo:
Funcionalidades mínimas para gestão do salão.

Fase 5 — Painéis (Admin, Recepcionista, Barbeiro Web)
Duração: 4–7 dias
🔧 Entregas:
Dashboard Admin

Gerenciamento de profissionais

Gerenciamento de serviços

Controle administrativo de agenda

Recepcionista agenda para clientes (web)

🎯 Objetivo:
Completar camada de controle operacional.

Fase 6 — Estabilização + QA + Ajustes de UX
Duração: 3–6 dias
🔧 Entregas:
Testes e validação de todos os fluxos

Correções de layout mobile-first

Ajustes finos de performance

Ajustes finos de experiência do cliente

Relatórios de QA (testes manuais + automação leve)

🎯 Objetivo:
Garantir que o MVP esteja pronto para produção.

Fase 7 — Deploy Final + Observabilidade
Duração: 2–3 dias
🔧 Entregas:
Deploy API e front na Vercel

Configurações finais de env

Logs básicos

Monitoramento de erros

Setup de backups do banco

🎯 Objetivo:
Disponibilizar o MVP para uso real.

4. Roadmap Completo (Resumo Visual)
   Fase
   Entrega Principal
   Status
   1
   Auth + DB + Infra
   🔜
   2
   Agenda Smart Barbeiro
   🔜
   3
   Agendamento do Cliente
   🔜
   4
   Financeiro
   🔜
   5
   Painéis Web
   🔜
   6
   QA + Ajustes
   🔜
   7
   Deploy Final
   🔜

5. Critérios de Aceite do Roadmap
   Todos os fluxos do Documento 6 implementados exatamente como descritos

API cumprindo integralmente o Documento 5

Requisitos técnicos (Documento 4) atendidos sem desvios

Modelagem do banco (Documento 7) aplicada fielmente

Todos os perfis de usuário funcionando conforme permissões

6. Dependências Entre Entregas
   A Agenda do Barbeiro depende totalmente da Fase 1

O Agendamento do Cliente depende das APIs e lógicas da Fase 2

O Financeiro depende de finalização de serviços

Painéis dependem de estrutura completa de dados

Deploy final depende da estabilidade pós-QA

Documento 9 Plano de Testes e QA do MVP
Devnex Agenda — Garantia de Qualidade e Estabilização

1. Objetivo do Documento
   Definir o plano completo de testes do MVP do Devnex Agenda, garantindo:
   funcionamento correto de todas as funcionalidades essenciais,

experiência mobile-first consistente,

confiabilidade da API e banco de dados,

prevenção de regressões,

estabilidade para deploy em produção.

Este documento será referência para teste manual, automatizado e validação final.

2. Estratégia Geral de Testes
   Testes manuais guiados → foco em UX, usabilidade e fluxo real do barbeiro e cliente

Testes automatizados essenciais → lógica de negócio crítica

Testes exploratórios → descoberta de inconsistências

Testes mobile-first → validar cada tela em tamanhos comuns de celular

Testes de API → Postman / Thunder Client

Teste end-to-end mínimo → nos fluxos principais

Não será priorizado: testes unitários extensos (extrapola o MVP).

3. Escopo dos Testes
   3.1 Fluxos do Barbeiro (Mobile First)
   Ver Agenda Smart

Criar horário

Editar horário

Bloquear horário

Criar recorrência

Finalizar serviço

Ver lista do dia

Navegação rápida

Funcionamento em 4G limitado

3.2 Fluxos do Cliente (PWA/App)
Selecionar profissional

Selecionar serviço

Selecionar horário

Confirmar agendamento

Receber confirmação (WhatsApp)

Reagendar

Cancelar

Ver histórico

Fluxo completo em 5–10 segundos

3.3 Fluxos da Recepcionista
Criar agendamento para cliente

Editar horário

Cancelar

Ver agenda do dia

Buscar cliente

3.4 Fluxos do Admin
Gerenciar profissionais

Gerenciar serviços

Ver painel financeiro

Ajustar permissões

4. Testes de API (Documento 5)
   Testes essenciais:
   Autenticação e RBAC

CRUD de usuários

CRUD de serviços

CRUD de horários

Finalização de serviços

Cálculo de comissão

Relatórios (financeiro)

Webhooks WhatsApp

Ferramenta sugerida: Postman Collection gerada automaticamente.

5. Testes de Banco de Dados
   Integridade dos relacionamentos

Cascata correta em deletes onde aplicável

Checagem de índices

Validação de unique constraints

Teste de consistência nos status de agendamento

6. Testes de Performance
   Abrir agenda do barbeiro < 500ms

Criar agendamento < 1.5s

Tela do cliente carregando < 1s

Consultar API /horarios em carga moderada

Testes em rede fraca

7. Testes de Segurança
   RBAC funcionando 100%

Bloqueio de acessos não autorizados

Validação de tokens

Sanitização de entradas da API

Tentativas de brute force limitadas

8. Testes de Integração com WhatsApp
   Confirmar:
   Mensagem enviada após criar agendamento

Mensagem de lembrete

Mensagem de atraso

Mensagem de cancelamento

Erros esperados:
quedas de webhook

rate limit

falha na API externa

O sistema deve:
logar falhas

tentar novamente

notificar admin em erro crítico

9. Testes de UX
   Mobile-first:
   Teclado não cobrindo inputs

Botões tocáveis facilmente

Zero poluição visual

Navegação clara (2–3 toques max)

Clientes:
Agendamento rápido

Clareza de etapas

Confirmação óbvia

Barbeiro:
Performance máxima

Agenda “respirando” bem

Evitar telas desnecessárias

10. Testes End-to-End Críticos
    Teste E2E 1 — Barbeiro cria horário
    Teste E2E 2 — Cliente agenda sozinho
    Teste E2E 3 — Barbeiro finaliza serviço
    Teste E2E 4 — Financeiro registra comissão
    Teste E2E 5 — Cliente remarca
    Teste E2E 6 — Notificação WhatsApp flui corretamente
    Ferramenta recomendada: Playwright (mínimo viável).

11. Processo de QA Antes do Deploy
    Desenvolvedor conclui fase

DevLeader valida

QA manual segue checklist

Bugs documentados

Correções aplicadas

Repetir até “Qualidade Aceitável”

Deploy para staging na Vercel

Teste final com cliente real (1 barbeiro parceiro)

Deploy produção

12. Checklist Oficial para Garantia de Qualidade
    Funcionalidades Core:
    Agenda Smart funcionando 100%

Cliente agenda sem fricção

WhatsApp funcionando

Finalização funcionando

Financeiro estável

Dados e Performance:
Banco consistente

API rápida

PWA rápido

Painéis sem erros

Usabilidade:
Mobile perfeito

UX comprovada com testes rápidos

Fluxos sem travas

13. Critérios de Aceite do MVP
    O MVP só será considerado pronto para produção quando:
    Todos os testes deste documento forem aprovados

Todos os fluxos do Documento 6 funcionarem

Nenhum bug crítico ou impeditivo existir

WhatsApp estiver operacional

Agenda Smart estiver rápida (<500ms)

Cliente conseguir agendar em <10s

Financeiro calcular comissões corretamente

Documento 10 Guia de Deploy, Infra e Observabilidade

1. Visão Geral
   Este documento descreve como o MVP do Dexnex Barber Ops será implantado, configurado, monitorado e mantido em produção.
   A abordagem prioriza:
   Simplicidade operacional

Deploy rápido (ideal para MVP)

Infraestrutura Vercel + NeonDB + serviços serverless

Observabilidade mínima funcional

Altíssima compatibilidade com arquitetura do Documento 3

2. Infraestrutura de Deploy
   2.1 Front-end Web (Painel Admin / Painel Recepcionista / Painel Barbeiro)
   Hosting: Vercel

Framework: Next.js 15 (App Router)

Edge Network: CDN global da Vercel

Build & Deploy Automático via:

GitHub PR → Preview URL

Merge para main → Produção

Configurações Importantes
Variáveis de ambiente definidas na Vercel (produção + preview)

Cache de build ativado

Middleware de autenticação no edge habilitada

2.2 Back-end API (Next.js no mesmo repo)
Implementação conforme Documento 5:
Runtime: Vercel Serverless Functions

Linguagem: Node 18+

Handlers REST e Webhooks

Liveness automático pela plataforma

Vantagens para MVP
Zero DevOps

Escala automática

Sem custo extra no início

Logs integrados

2.3 Banco de Dados
NeonDB (PostgreSQL Serverless)

Branch principal: main

Branch de preview: shadow branch automático

Prisma ORM com:

Migrações via prisma migrate deploy

Seed para ambiente de staging

Configurações
Pooling habilitado via Neon

SSL required

Min/Max connections ~100 (suficiente para MVP)

2.4 Storage
Para imagens e assets enviados por barbearias ou barbeiros:
Vercel Blob (ideal p/ MVP)

Upload direto do client → signed URLs

Expansão futura possível p/ Cloudflare R2 ou Supabase Storage

3. Entrega Contínua (CI/CD)
   Fluxo:
   Push → GitHub

Vercel cria preview automático

Testes de API (Documento 9) executam no pipeline

Se aprovado: merge na main

Deploy automático em produção

Proteções
Deploy em produção somente via main

Previews validados antes de merge

4. Configuração de Ambientes
   Ambiente
   Objetivo
   Infra
   Local
   Desenvolvimento, testes
   Node, Prisma, Docker opcional
   Preview
   Validação de PRs
   Vercel Preview + Neon Shadow DB
   Produção
   Usuários reais
   Vercel Production + Neon Main DB

5. Observabilidade e Monitoramento
   5.1 Logs
   Vercel Logs para Serverless Functions

Captura automática de erros no Edge e no Serverless

Filtros por rota, status e tempo de execução

5.2 Métricas
Tempo de resposta das rotas

Erros 5xx

Picos de latência

Consumo de DB (Neon)

Ferramentas:
Vercel Analytics

Neon Project Dashboard

5.3 Alertas
Para MVP: simples e eficaz.
Erros 5xx acima de 5/min → alerta manual via e-mail

Falha de deploy → notificação GitHub

NeonDB CPU/IO acima de 90% → alerta automático da Neon

6. Segurança
   6.1 Autenticação
   JWT baseado em rota (conforme Documento 5)

Refresh tokens no serverless

6.2 Network
Todos serviços via HTTPS

Banco com IP-free connection + TLS

6.3 Segredos
Armazenados somente:
Vercel Environment Variables

Nunca commitados

7. Backups e Disaster Recovery
   7.1 Banco de Dados
   Neon fornece:
   Point-in-time recovery

Snapshots automáticos

Retenção padrão suficiente para MVP

7.2 Storage
Replicação automática em múltiplas regiões (Vercel Blob)

7.3 Estratégia de Recuperação
Restaurar snapshot Neon

Rebuild automático no Vercel

Re-hidratar storage se necessário

8. Escalabilidade
   MVP escala automaticamente, pois:
   API é serverless

Front é edge/CDN global

NeonDB escala vertical + horizontal conforme carga

Para cargas mais altas no futuro:
Cache Redis (Upstash)

Filas (Vercel Queues)

Worker dedicado (Vercel Cron Jobs)

9. Checklist de Deploy
   Antes do deploy:
   Variáveis de ambiente configuradas

Prisma migrate deploy aplicado

Todos endpoints testados (Doc 9)

CDN warm-up opcional

Testes de login e roles corretamente funcionando

Pós deploy:
Validar produtividade do admin e recepção

Validar agendamentos e notificações

Monitorar logs por 48h
