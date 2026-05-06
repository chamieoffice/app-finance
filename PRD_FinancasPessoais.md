---
produto: FinançasPessoais App
versão: 1.0
data: 2026-05-05
status: Draft
owner_pm: Solo Developer
engineering: Solo Developer (Claude Code)
design: Solo Developer
stakeholders: Solo Developer
---

# PRD: FinançasPessoais App

## Executive Summary

Web app de gestão financeira pessoal que permite ao usuário registrar receitas e despesas, visualizar um dashboard analítico com comparativos temporais (D-1 e semanal), entender seus padrões de gasto por categoria e período, e receber insights estratégicos gerados por IA (Claude API) sob demanda. O app também detecta anomalias de volume financeiro automaticamente e oferece um fluxo de onboarding para coleta do perfil financeiro do usuário, permitindo análises mais profundas como proximidade do limite de gasto mensal considerando metas de economia e investimento. Stack: Next.js + Supabase + Vercel. Projeto desenvolvido na Trilha Claude Code — Engenheiro Agêntico IA.

---

## Problema & Contexto

**O problema:** Pessoas físicas não conseguem entender seus padrões financeiros de forma simples e visual. Registrar transações é apenas o primeiro passo — o que falta é uma visão analítica que responda perguntas como "onde estou gastando mais?", "gasto mais nos fins de semana?", "este mês está fora do padrão?" e "estou perto de estourar meu limite?".

**Por que existe hoje:** As informações financeiras ficam dispersas entre extratos bancários, planilhas manuais e anotações avulsas. Apps existentes como Mobills e Organizze resolvem o registro, mas não entregam inteligência analítica acessível e automatizada.

**Impacto se não resolvido:** Descontrole financeiro, gastos desnecessários em categorias não percebidas, falta de planejamento para metas de economia e investimento, e incapacidade de identificar anomalias antes que causem problemas.

**Evidências:**
- Contexto pessoal: usuário identifica necessidade de melhorar sua própria gestão financeira e ter visão analítica sobre categorias de gasto
- Objetivo declarado: conseguir analisar onde pode melhorar a gestão com base nas dimensões de categoria, período (dia/horário/dia da semana) e anomalias de volume

---

## Goals & Métricas de Sucesso

| Goal | Métrica | Baseline | Target | Prazo |
|------|---------|----------|--------|-------|
| App funcional em produção | Dashboard operacional com CRUD + auth | 0 | Deploy na Vercel | Fim do curso |
| Visão analítica por categoria | Gráficos de categoria com quebras táticas no dashboard | 0 | 100% das transações categorizadas | Após 1ª semana de uso |
| Insights estratégicos via IA | Insights gerados pelo Claude API com "Analisar Agora" | 0 | ≥ 1 insight acionável por sessão de análise | Após ≥ 20 transações |
| Detecção de anomalias | Alertas de variação de volume diário/semanal | 0 | Alertas disparados em variações relevantes | Após 7 dias de dados |
| Perfil financeiro completo | Onboarding preenchido com renda, gasto médio e metas | 0 | 100% (usuário único) | 1ª semana de uso |
| Controle de limite mensal | % de consumo do orçamento mensal visível no dashboard | 0 | Cálculo automático baseado no perfil | Após onboarding |

---

## Personas / Usuários-Alvo

### Persona Principal: Usuário Autenticado (Solo)
- **Perfil:** Pessoa física, familiaridade com tecnologia, quer organizar e entender suas finanças pessoais
- **Contexto de uso:** Acessa o app para registrar transações do dia a dia, acompanha o dashboard semanalmente, usa "Analisar Agora" quando quer uma visão estratégica do mês
- **Dores relacionadas:** Não sabe em quais categorias está gastando mais, não percebe padrões temporais (ex: gastos de fim de semana), não tem visão clara de quanto ainda pode gastar no mês respeitando suas metas

> **Nota de escopo:** Para esta versão, há apenas um tipo de usuário autenticado. Cada usuário visualiza e gerencia exclusivamente suas próprias transações (Row Level Security no Supabase).

---

## Solução Proposta

Web app responsivo com duas camadas:

**Camada 1 — Operacional (CRUD + Dashboard):**
Registro de transações com categorização, filtros por período e categoria, gráficos de distribuição por categoria, e cards de comparativo D-1 e semanal para visão tática imediata.

**Camada 2 — Analítica + IA:**
Motor de insights via Claude API ativado sob demanda ("Analisar Agora") que analisa padrões de gasto por categoria e dimensão temporal. Detecção automática de anomalias de volume diário/semanal com alertas in-app. Perfil financeiro do usuário (renda, gasto médio, metas) coletado via onboarding para cálculos de proximidade de limite mensal.

**Fluxo principal (novo usuário):**
1. Cadastro via e-mail e senha
2. Onboarding: renda média mensal → gasto médio mensal → metas de economia/investimento
3. Dashboard com cards de resumo, comparativos e % do limite mensal consumido
4. Cadastro de transações (receita/despesa, categoria, data, valor)
5. Visualização de gráficos táticos por categoria
6. "Analisar Agora" → Claude API gera insights estratégicos
7. Alertas automáticos de anomalia quando volume foge do padrão

**Fluxo — usuário que pulou o onboarding:**
- Onboarding disponível em "Perfil Financeiro" no menu de configurações (equivalente ao "perfil do investidor" em apps de investimento)

---

## Requisitos Funcionais

> **MoSCoW:** MUST = bloqueante para lançamento | SHOULD = importante, não bloqueante | COULD = desejável se houver tempo | WON'T = fora do escopo desta versão

| ID | Prioridade | Requisito | Notas |
|----|-----------|-----------|-------|
| REQ-001 | MUST | Login e cadastro via e-mail/senha (Supabase Auth) | |
| REQ-002 | MUST | Proteção de rotas autenticadas (redirect para login) | |
| REQ-003 | MUST | CRUD de transações: criar, editar, excluir | Campos: descrição, valor, data, tipo (receita/despesa), categoria |
| REQ-004 | MUST | Categorias pré-definidas: Alimentação, Transporte, Moradia, Lazer, Saúde, Educação, Salário, Freelance, Outros | |
| REQ-005 | MUST | Dashboard com cards: Receita Total, Despesa Total, Saldo do mês | |
| REQ-006 | MUST | Cards de comparativo D-1 (ontem vs anteontem) e semanal (semana atual vs semana anterior) | Delta em R$ e % |
| REQ-007 | MUST | Gráfico de pizza/donut por categoria de gasto (Recharts) | Visão tática para identificar distribuição |
| REQ-008 | MUST | Filtro de transações por mês/ano e por categoria | |
| REQ-009 | MUST | Layout responsivo para desktop e mobile (Tailwind CSS) | |
| REQ-010 | MUST | Onboarding de perfil financeiro: renda média, gasto médio, metas de economia/investimento | Executado após 1º login |
| REQ-011 | MUST | Opção de pular o onboarding e acessá-lo depois via "Perfil Financeiro" no menu | |
| REQ-012 | MUST | Card no dashboard mostrando % do orçamento mensal consumido (baseado no perfil financeiro) | Só aparece se onboarding concluído |
| REQ-013 | SHOULD | Botão "Analisar Agora" → chamada ao Claude API para gerar insights estratégicos | Mínimo de transações necessário antes de ativar |
| REQ-014 | SHOULD | Insights do Claude API cobrem: padrões por categoria, padrões temporais (dia da semana, horário, fim de semana vs semana), e boas práticas para o dia a dia | Exibidos em painel dedicado no dashboard |
| REQ-015 | SHOULD | Detecção automática de anomalias de volume: variações significativas em gasto diário e semanal | Comparativo contra média dos últimos 7/30 dias |
| REQ-016 | SHOULD | Alertas de anomalia exibidos in-app (banner ou card de aviso no dashboard) | Apenas dentro do app |
| REQ-017 | SHOULD | Busca de transações por descrição | |
| REQ-018 | SHOULD | Exportação das transações filtradas em formato CSV | |
| REQ-019 | COULD | Gráfico de linha com evolução de gastos ao longo do mês | |
| REQ-020 | COULD | Landing page pública | |
| REQ-021 | WON'T | Múltiplos usuários / modo família ou compartilhado | Fora do escopo desta versão |
| REQ-022 | WON'T | App mobile nativo (iOS/Android) | Responsivo via Tailwind cobre mobile |
| REQ-023 | WON'T | Integração bancária automática (Open Finance/Plaid) | |
| REQ-024 | WON'T | Orçamento por categoria (budget limits) | Coberto parcialmente via perfil financeiro |
| REQ-025 | WON'T | Notificações por e-mail ou push | Alertas apenas in-app por ora |

---

## Requisitos Não-Funcionais

| Categoria | Requisito | Valor |
|-----------|-----------|-------|
| Performance | Tempo de carregamento do dashboard | < 2s no P95 |
| Performance | Resposta de inserção/edição de transação | < 500ms |
| Disponibilidade | Uptime (via Vercel) | 99.9% |
| Segurança | Dados em trânsito | HTTPS (TLS 1.2+) |
| Segurança | Isolamento de dados por usuário | Row Level Security no Supabase |
| Segurança | Dados enviados ao Claude API | Mínimo necessário — sem dados pessoais identificáveis (apenas agregados e categorias) |
| Compatibilidade | Browsers suportados | Chrome, Safari, Firefox (últimas 2 versões) |
| Responsividade | Dispositivos | Desktop e mobile (Tailwind CSS) |
| Escalabilidade | Usuários simultâneos | 1 (projeto solo) — arquitetura suporta crescimento via Supabase |

---

## User Stories & Critérios de Aceite

### US-001: Cadastro e Login
**Como** usuário novo, **quero** criar uma conta com e-mail e senha **para que** meus dados sejam privados e acessíveis apenas por mim.

**Critério de aceite:**
- Dado que acesso a tela de cadastro
- Quando preencho e-mail válido e senha (mín. 8 caracteres) e confirmo
- Então sou autenticado e redirecionado para o onboarding

---

### US-002: Onboarding de Perfil Financeiro
**Como** usuário recém-cadastrado, **quero** informar minha renda mensal, gasto médio e metas de economia **para que** o app calcule automaticamente meu limite de gasto mensal e meu progresso em relação a ele.

**Critério de aceite:**
- Dado que concluo o cadastro
- Quando preencho renda média, gasto médio e meta de economia/investimento e confirmo
- Então sou redirecionado ao dashboard e o card de "% do orçamento consumido" aparece com o cálculo correto
- E se clicar em "Pular", sou redirecionado ao dashboard sem o card de orçamento e o onboarding fica disponível em "Perfil Financeiro" no menu

---

### US-003: Registro de Transação
**Como** usuário autenticado, **quero** registrar uma receita ou despesa com categoria, valor e data **para que** o dashboard e os gráficos reflitam minha situação financeira atual.

**Critério de aceite:**
- Dado que estou no dashboard
- Quando clico em "Nova Transação", preencho todos os campos obrigatórios e salvo
- Então a transação aparece na lista, os cards do dashboard são atualizados e o gráfico de categoria é recalculado

---

### US-004: Dashboard com Comparativos Táticos
**Como** usuário autenticado, **quero** ver no dashboard os comparativos de ontem vs anteontem (D-1) e da semana atual vs semana passada **para que** eu identifique tendências de gasto sem precisar analisar manualmente.

**Critério de aceite:**
- Dado que tenho transações em pelo menos 2 dias distintos
- Quando acesso o dashboard
- Então vejo cards com delta em R$ e % para D-1 e variação semanal, com indicação visual de positivo/negativo

---

### US-005: Insights Estratégicos via IA
**Como** usuário autenticado, **quero** clicar em "Analisar Agora" e receber insights gerados pelo Claude API sobre meus padrões de gasto **para que** eu tome decisões mais informadas sobre onde cortar ou redistribuir gastos.

**Critério de aceite:**
- Dado que tenho ao menos 20 transações registradas
- Quando clico em "Analisar Agora"
- Então o app envia meus dados agregados (por categoria e período) ao Claude API
- E recebo um painel com insights sobre: categorias de maior gasto, padrões temporais (dia da semana, horário, fim de semana vs semana), e boas práticas sugeridas
- E os dados enviados ao Claude API não contêm informações pessoais identificáveis

---

### US-006: Alerta de Anomalia de Volume
**Como** usuário autenticado, **quero** ser avisado quando meu volume de transações ou gasto diário/semanal estiver fora do padrão **para que** eu perceba comportamentos anômalos antes que se tornem problema.

**Critério de aceite:**
- Dado que tenho pelo menos 7 dias de histórico de transações
- Quando o gasto ou volume do dia/semana varia significativamente em relação à média dos últimos 7/30 dias
- Então um alerta aparece no dashboard (banner ou card de aviso) indicando a anomalia detectada e o percentual de variação

---

### US-007: Exportação CSV
**Como** usuário autenticado, **quero** exportar minhas transações filtradas em CSV **para que** eu possa analisá-las em planilhas ou compartilhá-las.

**Critério de aceite:**
- Dado que tenho transações registradas e apliquei algum filtro (ou não)
- Quando clico em "Exportar CSV"
- Então faço o download de um arquivo .csv com as colunas: data, descrição, tipo, categoria, valor

---

### US-008: Perfil Financeiro (pós-onboarding)
**Como** usuário que pulou o onboarding, **quero** acessar e preencher meu perfil financeiro a qualquer momento pelo menu **para que** eu possa ativar as análises baseadas em limite mensal quando estiver pronto.

**Critério de aceite:**
- Dado que pulei o onboarding
- Quando acesso "Perfil Financeiro" no menu de configurações
- Então vejo o mesmo formulário do onboarding e posso preencher e salvar
- E ao salvar, o card de "% do orçamento consumido" passa a aparecer no dashboard

---

## Fora do Escopo (esta versão)

O seguinte **não** será entregue nesta versão:

- [ ] Múltiplos usuários / modo família ou compartilhado — *arquitetura single-tenant (RLS por usuário)*
- [ ] App mobile nativo (iOS/Android) — *responsivo via Tailwind CSS cobre mobile*
- [ ] Integração bancária automática (Open Finance, Plaid, etc.) — *entrada manual de transações*
- [ ] Orçamento por categoria (budget limits individuais por categoria) — *coberto via limite global no perfil financeiro*
- [ ] Notificações por e-mail ou push — *alertas apenas in-app nesta versão*
- [ ] Metas financeiras com acompanhamento de progresso (ex: "quero juntar R$ 10k") — *coberto de forma simplificada via metas no perfil*
- [ ] Relatórios PDF — *CSV cobre o caso de exportação*

---

## Dependências & Restrições

**Dependências técnicas:**
- **Supabase**: Auth (e-mail/senha), PostgreSQL, Row Level Security
- **Claude API (Anthropic)**: geração de insights estratégicos via "Analisar Agora"
- **Recharts**: visualização de gráficos no dashboard
- **Next.js 14+ (App Router)**: framework frontend com SSR/RSC
- **Vercel**: deploy contínuo via integração com GitHub

**Dependências organizacionais:**
- Chave de API da Anthropic (Claude API) necessária para a feature de insights
- Projeto Supabase criado e configurado com as variáveis de ambiente no Vercel

**Restrições:**
- Dados enviados ao Claude API devem ser agregados e anônimos (sem PII) para conformidade com boas práticas de privacidade
- Projeto desenvolvido como exercício educacional (Aula 4 — Trilha Claude Code)

---

## Riscos & Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|--------------|-----------|
| Dados insuficientes para insights relevantes | Alto | Média | Bloquear "Analisar Agora" até mínimo de transações (sugestão: 20); exibir mensagem orientando o usuário |
| Falsos positivos em alertas de anomalia | Médio | Média | Definir threshold adequado (ex: variação > 50% da média dos últimos 7 dias); avaliar sensibilidade com dados reais |
| Custo de chamadas ao Claude API | Baixo | Baixa | Insights sob demanda (não automáticos); enviar apenas dados agregados, não transação a transação |
| Usuário não completa onboarding e não volta | Médio | Alta | Onboarding sempre disponível via "Perfil Financeiro" no menu; dashboard funciona sem ele, mas com aviso de que análises avançadas ficam disponíveis após preenchimento |
| Complexidade das features analíticas atrasa MVP | Alto | Média | Prioridade: entregar CRUD + dashboard primeiro; insights e anomalias são SHOULD, não MUST |
| RLS mal configurado expõe dados entre usuários | Alto | Baixa | Testar RLS explicitamente antes do deploy; revisar policies no Supabase |

---

## Timeline & Milestones

> Projeto de aula sem deadline fixo. Fases sugeridas para desenvolvimento iterativo.

| Marco | Fase | Responsável |
|-------|------|-------------|
| Auth + CRUD de transações funcionando | Fase 1 | Solo Dev + Claude Code |
| Dashboard básico com cards de resumo | Fase 1 | Solo Dev + Claude Code |
| Gráficos por categoria + filtros | Fase 2 | Solo Dev + Claude Code |
| Cards de comparativo D-1 e semanal | Fase 2 | Solo Dev + Claude Code |
| Exportação CSV + busca | Fase 2 | Solo Dev + Claude Code |
| Onboarding + Perfil Financeiro | Fase 3 | Solo Dev + Claude Code |
| Card de % do orçamento consumido | Fase 3 | Solo Dev + Claude Code |
| Integração Claude API (insights) | Fase 4 | Solo Dev + Claude Code |
| Detecção de anomalias + alertas in-app | Fase 4 | Solo Dev + Claude Code |
| Deploy na Vercel + QA final | Fase 5 | Solo Dev + Claude Code |

---

## Perguntas em Aberto

| # | Pergunta | Responsável | Prazo | Status |
|---|---------|-------------|-------|--------|
| 1 | Qual o threshold exato para disparar alertas de anomalia? (ex: variação > 50% da média dos últimos 7 dias) | Solo Dev | Fase 4 | Aberta |
| 2 | Qual o número mínimo de transações para habilitar "Analisar Agora"? (sugestão: 20) | Solo Dev | Fase 4 | Aberta |
| 3 | Qual modelo Claude usar para os insights? (sugestão: claude-haiku-4-5 para custo, claude-sonnet-4-6 para qualidade) | Solo Dev | Fase 4 | Aberta |
| 4 | O gráfico de categoria deve mostrar só despesas ou também receitas separadamente? | Solo Dev | Fase 2 | Aberta |
| 5 | O card de "% do orçamento consumido" usa o gasto médio informado no onboarding como limite, ou apenas a renda - metas? | Solo Dev | Fase 3 | Aberta |

---

## Apêndice

**Referências de design:**
- Mobills / Organizze: UX limpa, cards de resumo, gráficos simples — referência para apps brasileiros de finanças
- shadcn/ui Dashboard Template: layout moderno, minimalista e responsivo

**Stack tecnológica completa:**
- Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts
- Backend/BaaS: Supabase (PostgreSQL + Auth + RLS)
- IA: Claude API (Anthropic) para geração de insights
- Deploy: Vercel (CI/CD via GitHub)
- Desenvolvimento: Claude Code

**Contexto educacional:**
- Projeto desenvolvido na Aula 4 — Trilha Claude Code — Engenheiro Agêntico IA
- Framework NoCodeStartup
