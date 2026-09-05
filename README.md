# Incident Hub

Aplicação web para uma pequena equipe de operações registrar, acompanhar e resolver incidentes. A solução atende ao desafio **AI Engineering Hackathon**, incluindo o Change Request #1: comentários persistidos e timeline unificada.

## Pré-requisitos

- Node.js 22 ou superior. O projeto usa `node:sqlite`, disponível nativamente nessa versão.
- npm.
- Google Chrome instalado localmente para executar a suíte E2E Playwright.

No Windows com a política do PowerShell bloqueando scripts, use `npm.cmd` nos comandos abaixo em vez de `npm`.

## Instalação

```powershell
npm.cmd install
```

## Execução

O comando abaixo cria o build do React e inicia o monólito (interface e API) em `http://localhost:3000`.

```powershell
npm.cmd run start
```

Para desenvolvimento da interface com atualização automática:

```powershell
npm.cmd run dev
```

Em outro terminal, inicie a API para o modo de desenvolvimento:

```powershell
npm.cmd run api
```

## Dados iniciais e redefinição

Na primeira execução, a aplicação cria `data/incident-hub.db` e adiciona estes incidentes:

| Título | Severidade | Responsável | Status |
| --- | --- | --- | --- |
| Payment API instability | Critical | Ana | Open |
| Reconciliation delay | High | Bruno | In Progress |
| Incorrect customer notification | Medium | Carla | Resolved |

O banco é persistente: alterações realizadas pela aplicação permanecem após reiniciar o processo. Para restaurar os dados iniciais, interrompa a aplicação, apague apenas o arquivo local abaixo e inicie-a novamente:

```powershell
Remove-Item -LiteralPath .\data\incident-hub.db
```

Esse arquivo é ignorado pelo Git e não altera os dados versionados do projeto.

## Testes

```powershell
npm.cmd run test
npm.cmd run test:e2e
npm.cmd run build
```

A suíte atual possui testes de domínio, persistência SQLite, API Express, entrega do monólito em produção e três jornadas E2E no navegador. O build também executa a checagem de tipos TypeScript.

## Arquitetura

O projeto é um **monólito modular** em TypeScript:

```text
src/
  domain/           Entidades, status e regra de transição Critical
  application/      Casos de uso de incidentes, comentários e métricas
  infrastructure/   Repositório SQLite e seed idempotente
  server/           API Express e entrega do build React
  client/           Interface React e cliente HTTP
tests/              Testes unitários e de integração
```

Em desenvolvimento, o Vite serve o React e encaminha `/api` ao Express. Em produção, o Express serve tanto a API quanto o build estático, permitindo um único processo e links diretos às rotas da SPA.

## Funcionalidades

- Criar e listar incidentes, com filtros por status e severidade.
- Consultar detalhes, datas, responsável e severidade.
- Alterar status, impedindo `Critical: Open -> Resolved`.
- Registrar histórico de status e comentários persistidos em uma timeline cronológica.
- Exibir dashboard com incidentes não resolvidos, `Critical` não resolvidos e resolvidos.

## Limitações conhecidas

- Não há autenticação, perfis, multi-tenancy ou notificações; esses itens estão fora do escopo do desafio.
- Os E2E usam Chrome local e SQLite em memória; por isso não alteram o banco de demonstração. Há validação em viewport móvel de 390 px, mas não uma matriz completa de dispositivos e tecnologias assistivas reais.
- SQLite é adequado ao MVP local, mas uma operação concorrente e distribuída exigiria banco gerenciado, observabilidade e estratégia de migração mais completa.

## Documentação do desafio

- [Plano e registro de progresso](PLAN.md)
- [Registro de interações relevantes com IA](AI_LOG.md)
- [Relatório final](FINAL_REPORT.md)
- [Prompt do brainstorm visual](docs/UI_BRAINSTORM_PROMPT.md)
