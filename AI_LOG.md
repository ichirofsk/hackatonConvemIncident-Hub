# AI_LOG

Este arquivo resume as interações de IA que influenciaram decisões, implementação, validação ou correções do Incident Hub. As conversas originais permaneceram disponíveis para auditoria durante o hackathon.

## 1. Planejamento inicial e escolha de arquitetura

### Objetivo

Definir uma arquitetura que atendesse ao escopo no tempo disponível e permitisse evoluir depois do hackathon.

### Contexto

Foram fornecidos o Challenge Pack e o Candidate Guide do hackathon, com incidentes, regras de status, persistência, testes e documentos obrigatórios.

### Instrução

Analisar o escopo, propor um plano modular e ponderar a separação entre frontend e API.

### Resultado

Foi proposto um monólito modular em TypeScript, React, Vite, Express e SQLite. A separação física entre serviços foi rejeitada para a primeira entrega por adicionar custo operacional sem benefício proporcional.

### Validação

A decisão foi registrada no `PLAN.md` antes do desenvolvimento de funcionalidades e revisada contra o limite de tempo do desafio.

### Decisão

Manter fronteiras de domínio, aplicação, infraestrutura, servidor e cliente no mesmo repositório e processo de produção.

## 2. Fundação e regras críticas

### Objetivo

Criar uma base testável antes da interface.

### Contexto

O desafio exige persistência, regra para incidentes `Critical`, dados iniciais e testes automatizados das regras críticas.

### Instrução

Gerar estrutura TypeScript, scripts, domínio de incidentes, repositório SQLite e testes de persistência/transição.

### Resultado

Foram criados casos de uso, um repositório SQLite com seed idempotente e testes para transição proibida, histórico e atomicidade das gravações.

### Validação

Vitest e build de produção foram executados a cada etapa relevante.

### Decisão

Construir a API somente após estabilizar as regras e a persistência.

## 3. API e limitação de execução no Windows

### Objetivo

Expor os casos de uso para a futura interface e validar a execução local.

### Contexto

Foi encontrada uma falha ao executar `npm run api` no PowerShell: a política local bloqueava `npm.ps1`.

### Instrução

Investigar a falha sem alterar configurações de segurança do sistema.

### Resultado

Foi identificado que `npm.cmd run api` contorna o wrapper PowerShell e inicia a aplicação corretamente.

### Validação

O endpoint `/api/dashboard` foi consultado no processo local em execução.

### Decisão

Documentar o uso de `npm.cmd` no Windows e não modificar a política de execução do computador.

## 4. Change Request #1: comentários e timeline

### Objetivo

Incorporar comentários persistidos e uma timeline única sem regredir a solução existente.

### Contexto

O Change Request #1 tornou obrigatórios comentários com autor, conteúdo e data, ordenados junto ao histórico de status.

### Instrução

Avaliar impacto, alterar domínio, SQLite, API e testes; proteger bancos criados antes da nova tabela.

### Resultado

Foram implementados comentários, endpoints HTTP, atividade unificada e migração da tabela ao abrir banco legado.

### Validação

Testes verificaram rejeição de comentários vazios, persistência após reabertura, ordenação da atividade e compatibilidade com banco anterior.

### Decisão

Concluir e testar a mudança de requisitos antes de iniciar a interface visual.

## 5. Brainstorm e implementação visual

### Objetivo

Definir uma identidade visual que priorizasse leitura operacional sem inventar funcionalidades fora do escopo.

### Contexto

Foi fornecido um prompt de brainstorm para a interface. A análise foi preservada em `docs/UI_BRAINSTORM_PROMPT.md`.

### Instrução

Comparar a proposta visual com o desafio e com o contrato da API existente antes de implementar.

### Resultado

A interface React passou a ter dashboard, tabela com filtros, detalhe, modal de criação, alteração contextual de status, comentários e timeline com dados reais.

### Validação

Build de produção, testes de API e inspeção no monólito local confirmaram as rotas, métricas e dados exibidos.

### Decisão

Remover telas de Reports, Analytics e Settings, pois não faziam parte do desafio.

## 6. Sugestão incorreta de controles visuais e correção

### Objetivo

Revisar criticamente a primeira versão visual antes da entrega.

### Contexto

A primeira proposta de interface incluiu um sino com contador de notificações e uma busca global no cabeçalho, embora nenhuma das duas possuísse comportamento correspondente.

### Instrução

Avaliar os controles da tela pelo escopo real e não apenas por aparência.

### Resultado

O usuário identificou que o sino não era clicável e que a busca global era inútil. Ambos foram removidos; a busca funcional da tabela foi preservada.

### Validação

A inspeção visual posterior confirmou que a navegação só apresenta Dashboard e Incidents e que não restaram controles decorativos que sugiram recursos inexistentes.

### Decisão

Priorizar clareza e comportamento real em vez de elementos comuns de templates de dashboard.

## 7. Semântica de incidentes ativos

### Objetivo

Eliminar a ambiguidade entre `Open` e `In Progress` nas métricas e na interface.

### Contexto

Foi esclarecido que incidente em progresso também é incidente aberto/ativo para o dashboard, mas que os estados precisam permanecer distinguíveis para o usuário.

### Instrução

Atualizar a métrica de incidentes abertos e tornar o status inicial visualmente inequívoco sem alterar o contrato exigido.

### Resultado

O dashboard passou a contar `Open` e `In Progress` como não resolvidos. O status canônico `Open` é exibido como `Open (New)` somente na interface.

### Validação

Os testes de API e o build passaram; a página local exibiu 2 incidentes não resolvidos e separou `Open (New)`, `In Progress` e `Resolved`.

### Decisão

Preservar `Open` no banco, na API e nos filtros para manter compatibilidade com o requisito formal.

## 8. Revisão final de qualidade

### Objetivo

Identificar riscos estruturais restantes e validar a solução completa antes do deploy.

### Contexto

O projeto possui domínio, persistência, API, React e entrega de produção no mesmo processo.

### Instrução

Definir a bateria proporcional ao risco e registrar resultados, incluindo limites da cobertura.

### Resultado

Foram executados 21 testes automatizados em cinco suítes, build com TypeScript/Vite e verificação de leitura da interface no monólito local.

### Validação

Todos os testes e o build foram aprovados. O `PLAN.md` registra o que cada frente cobre e a ausência deliberada de E2E de navegador.

### Decisão

Priorizar documentação final e deploy antes de melhorias adicionais de escopo.

## 9. Testes E2E da interface

### Objetivo

Usar a margem restante do hackathon para proteger os fluxos visuais de maior risco sem modificar o banco de demonstração.

### Contexto

Após a refatoração da interface, existiam testes de domínio, persistência e API, mas nenhuma jornada automatizada no navegador. O Chrome estava disponível localmente; Playwright não estava instalado.

### Instrução

Adicionar uma suíte enxuta para dashboard integrado, busca/filtros e a orientação de status de um incidente `Critical` aberto.

### Resultado

Playwright foi instalado como dependência de desenvolvimento. A suíte sobe um monólito isolado com SQLite em memória e testa a interface compilada em Chrome. Foram implementadas jornadas para dashboard, busca/filtros, criação, comentário e transição permitida de um `Critical`. A primeira execução identificou um seletor de teste ambíguo porque o título do mesmo incidente aparece em três links; o seletor foi restringido ao link exato da tabela.

### Validação

As sete jornadas E2E passaram, incluindo viewport móvel de 390 px sem overflow horizontal, assim como os 21 testes Vitest existentes e o build. A suíte não altera o banco local usado na demonstração.

### Decisão

Manter sete jornadas E2E de alto valor para esta entrega. Auditoria de acessibilidade com tecnologias assistivas reais fica como próxima expansão possível.

## 10. Health check operacional

### Objetivo

Adicionar um refinamento técnico de alto valor sem ampliar o escopo do produto.

### Contexto

O monólito já atende à execução local e possui testes de produto, mas não expunha uma rota simples para identificar rapidamente se o processo HTTP estava disponível.

### Instrução

Implementar `GET /health` com resposta mínima, sem dependência do banco ou da interface, e testá-la.

### Resultado

A API agora retorna `{ "status": "ok" }` com HTTP 200 em `/health`.

### Validação

Foi adicionado um teste de integração ao conjunto da API e a suíte completa será executada após a alteração.

### Decisão

Manter o endpoint mínimo e sem dados sensíveis; não adicionar métricas, autenticação ou observabilidade fora do escopo do hackathon.
