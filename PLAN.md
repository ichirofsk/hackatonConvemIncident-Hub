# Plano Inicial Incident Hub

## Contexto do início

O início das atividades ocorreu mais tarde do que o previsto porque o notebook estava sendo utilizado sem o carregador nativo. A potência insuficiente causava desligamentos e impedia o uso contínuo do equipamento. Após investigar o problema, foi possível estabilizar o funcionamento desconectando o notebook do monitor externo.

Este contexto será considerado na priorização do trabalho: o objetivo é entregar primeiro uma aplicação completa, confiável e implantada, antes de qualquer melhoria não obrigatória.

## Entendimento

O produto será uma aplicação web local para uma pequena equipe de operações registrar e acompanhar incidentes. A aplicação deverá permitir criar incidentes, visualizar e filtrar a lista, consultar detalhes, alterar status e acompanhar o histórico dessas alterações.

A prioridade é entregar uma solução simples, persistente, testada e fácil de executar localmente, com uma implantação funcional dentro do tempo disponível.

## Escopo

### Obrigatório

- Criar incidentes com título, descrição, severidade e responsável.
- Definir automaticamente o status inicial como `Open`.
- Persistir data e hora de criação e última atualização.
- Listar incidentes e filtrar por status e severidade.
- Exibir detalhes completos de cada incidente.
- Alterar o status de um incidente.
- Impedir a transição direta de `Open` para `Resolved` em incidentes `Critical`.
- Registrar e persistir o histórico de alterações de status.
- Permitir comentários obrigatoriamente identificados por autor e conteúdo, persistidos por incidente.
- Exibir uma timeline cronológica única com comentários e alterações de status.
- Exibir dashboard com incidentes abertos, `Critical` não resolvidos e resolvidos.
- Disponibilizar persistência local e dados iniciais obrigatórios.
- Criar testes automatizados para regras críticas.
- Disponibilizar instruções claras de execução no README.

### Desejável

- Exibir mensagens visuais de sucesso e erro.
- Validar campos obrigatórios no frontend e no backend.
- Aplicar filtros combinados por status e severidade.
- Oferecer uma opção simples para restaurar dados de exemplo.
- Manter interface responsiva e organizada.

### Fora de escopo

- Autenticação, autorização e recuperação de senha.
- Múltiplas organizações ou tenants.
- Comentários, anexos e notificações.
- Edição ou exclusão de incidentes.
- Métricas avançadas, SLA e integrações externas.

## Decisões técnicas

Será adotado um monólito modular com TypeScript, React, Vite, Express e SQLite. Frontend e API ficarão no mesmo repositório e serão implantados como uma única aplicação, reduzindo complexidade operacional e risco dentro do tempo disponível.

Em desenvolvimento, o Vite servirá a interface React e encaminhará chamadas para a API Express. Em produção, o Express servirá o build do frontend e as rotas da API no mesmo processo.

SQLite será utilizado para persistência local por exigir pouca configuração. Vitest será usado para testes unitários e de integração.

Após o Change Request #1, comentários foram modelados como registros próprios, associados ao incidente. A timeline unificada é montada no caso de uso a partir de comentários e histórico de status, preservando cada evento original e ordenando-o cronologicamente. Essa escolha evita duplicar eventos e mantém o histórico de status compatível com o requisito original.

`react-router-dom` foi incluído para suportar rotas reais da futura interface (`/`, `/incidents`, `/incidents/new` e `/incidents/:id`) sem acoplar páginas ao backend. A dependência será usada apenas na etapa de interface, depois de estabilizado o contrato da API.

A modularização será mantida por meio de fronteiras claras:

- `domain` não dependerá de React, Express ou SQLite;
- `application` concentrará os casos de uso;
- `infrastructure` implementará banco, seed e repositórios;
- `server` concentrará rotas, controladores e validação HTTP;
- `client` conterá páginas, componentes e serviços da interface;
- `tests` cobrirá regras críticas e integrações principais.

O frontend comunicará apenas com a camada de serviços HTTP. A persistência será acessada por meio da interface `IncidentRepository`. Essas fronteiras permitem, se houver tempo e benefício concreto, separar frontend e API em serviços e implantações independentes sem reescrever o domínio ou as regras de negócio.

O pivot para uma arquitetura distribuída somente será considerado depois que todos os requisitos obrigatórios, os testes críticos, a validação manual, o README e o primeiro deploy estiverem concluídos.

## Estrutura geral da solução

```text
src/
  domain/          # entidades, enums e regras de negócio
  application/     # casos de uso
  infrastructure/  # SQLite, seed e repositórios
  server/          # Express, rotas e validação
  client/          # React, páginas, componentes e serviços
tests/             # testes unitários e de integração
```

## Decomposição

1. Registrar planejamento e decisões iniciais.
2. Configurar estrutura mínima, scripts e ferramentas de teste.
3. Modelar `Incident`, `StatusHistory` e a regra de transição de status.
4. Implementar SQLite, migration simples e dados iniciais idempotentes.
5. Implementar casos de uso e API com validação de entradas.
6. Criar testes para a regra de incidente `Critical` e fluxos persistidos.
7. Construir dashboard, lista, filtros, formulário e tela de detalhes com histórico.
8. Validar os fluxos manualmente e corrigir regressões.
9. Implantar a aplicação.
10. Completar README, AI_LOG e FINAL_REPORT.

O Change Request #1 altera a ordem dos passos 3 a 6: comentários, persistência, API e testes de atividade unificada são concluídos antes da construção da interface.

## Critérios de aceite

- Um incidente criado permanece disponível após reiniciar a aplicação.
- A lista mostra título, severidade, responsável e status.
- Os filtros por status e severidade retornam os dados esperados.
- A tela de detalhes mostra todos os campos obrigatórios e o histórico.
- Um incidente `Critical` em `Open` não pode ser resolvido diretamente.
- Um incidente `Critical` pode seguir de `Open` para `In Progress` e então para `Resolved`.
- Toda alteração de status cria um item persistido no histórico.
- Um comentário com autor e conteúdo válidos pode ser adicionado e continua disponível após reiniciar a aplicação.
- Comentários vazios ou sem autor são rejeitados com feedback compreensível.
- A atividade do incidente apresenta comentários e alterações de status em ordem cronológica.
- O dashboard reflete o estado atual dos dados.
- Os três incidentes iniciais obrigatórios estão disponíveis.
- Os testes das regras críticas passam.
- Um avaliador consegue executar a aplicação seguindo apenas o README.

## Riscos

- Complexidade excessiva na configuração inicial e no deploy.
- Uso de tempo em aparência antes dos requisitos obrigatórios.
- Inconsistência entre banco, API e interface.
- Regressões após mudanças no fluxo de status.
- Ordenação incorreta ou perda de eventos na timeline unificada após a inclusão de comentários.
- Migration de comentários comprometendo dados ou fluxos existentes.
- Documentação incompleta no momento do code freeze.

Para reduzir esses riscos, a ordem de prioridade será: correção, completude, simplicidade, confiabilidade e, por último, funcionalidades adicionais.

## Estratégia de IA

A IA será utilizada para gerar código, testes, documentação e investigar erros a partir de instruções em linguagem natural. Cada mudança relevante será validada por testes, execução local e revisão dos fluxos afetados.

Interações que influenciem arquitetura, correção de bugs, mudanças de abordagem ou validação serão resumidas no `AI_LOG.md`.

## Registro de progresso

Esta seção funcionará como o acompanhamento passo a passo do desenvolvimento. Cada marco será atualizado com data e hora, resultado, validação realizada e próxima decisão.

| Etapa | Status | Resultado e validação | Próxima decisão |
| --- | --- | --- | --- |
| Planejamento inicial | Concluída | Escopo, arquitetura e critérios de aceite registrados neste documento. | Criar estrutura mínima do projeto. |
| Estrutura e testes | Concluída | Vite, TypeScript, React e Vitest configurados. O teste de fumaça e o build de produção foram executados com sucesso. | Modelar domínio e persistência. |
| Domínio e persistência | Concluída e ampliada | Entidades, regra de transição, comentários, SQLite, dados iniciais e persistência testados. | Construir interface sobre o contrato atualizado. |
| API e regras de negócio | Concluída e ampliada | API HTTP para incidentes e comentários, timeline unificada e validações implementadas e testadas. | Construir interface. |
| Interface | Pendente | — | — |
| Testes e validação final | Pendente | — | — |
| Deploy e documentação final | Pendente | — | — |

## Etapa Estrutura e testes

### O que foi feito

Foi criada a fundação técnica do monólito modular, sem implementar regras de negócio ou funcionalidades do produto. A estrutura inclui TypeScript, React, Vite e Vitest, além dos diretórios reservados para `domain`, `application`, `infrastructure`, `server`, `client` e `tests`.

Também foram configurados scripts para desenvolvimento, build, preview e testes. Foi adicionado um componente React provisório apenas para confirmar o carregamento do frontend e um teste de fumaça para validar a ferramenta de testes.

Não foram implementados nesta etapa: entidades de incidente, persistência, API, banco de dados, dashboard, listagem, filtros, formulários ou telas de detalhes.

### Testes executados

| Teste | O que validou | Resultado |
| --- | --- | --- |
| `npm run test` | Execução do Vitest e carregamento de um módulo TypeScript do projeto. | Aprovado: 1 teste executado com sucesso. |
| `npm run build` | Verificação de tipos TypeScript e geração do build de produção do frontend. | Aprovado: build concluído sem erros. |
| Requisição ao preview | Disponibilidade do documento inicial em `http://127.0.0.1:4173/` e presença do ponto de montagem React. | Aprovado: resposta HTTP 200. |
| Verificação do bundle | Disponibilidade do bundle JavaScript gerado e presença do componente React provisório. | Aprovado: resposta HTTP 200 e conteúdo esperado encontrado. |

### Resultado e próxima decisão

A estrutura está apta para receber módulos de domínio e testes de regras de negócio. O próximo passo planejado é modelar o domínio de incidentes e a persistência, mantendo as fronteiras definidas neste plano.

## Etapa Domínio e persistência

### O que foi feito

Foram modelados os tipos de domínio `Incident`, `Severity`, `IncidentStatus` e `StatusHistoryEntry`. A regra crítica foi isolada no domínio: um incidente `Critical` em `Open` não pode passar diretamente para `Resolved`.

Foi definido o contrato `IncidentRepository` e implementado o adaptador `SqliteIncidentRepository`. O adaptador cria as tabelas de incidentes e histórico, persiste mudanças de status de forma transacional e fornece os três incidentes iniciais exigidos de maneira idempotente.

Foi criado também o caso de uso mínimo de alteração de status. Ele consulta o incidente, aplica a regra de domínio e somente então solicita a persistência da alteração e do histórico.

### Testes executados

| Teste | O que validou | Resultado |
| --- | --- | --- |
| Regra de transição `Critical` | Bloqueio de `Open` para `Resolved` e permissão do caminho via `In Progress`. | Aprovado. |
| Dados iniciais | Criação idempotente dos três incidentes obrigatórios, com títulos, severidades, responsáveis e status esperados. | Aprovado. |
| Mudança de status permitida | Atualização do incidente e criação de um registro de histórico. | Aprovado. |
| Mudança de status inválida | Ausência de alteração de status e de histórico quando a transição `Critical` é inválida. | Aprovado. |
| Persistência em arquivo | Manutenção dos dados após fechar e reabrir o banco SQLite. | Aprovado. |
| Persistência de mudança de status | Manutenção de status, data de atualização e histórico após fechar e reabrir o banco SQLite. | Aprovado. |
| Rollback transacional | Reversão da atualização do incidente quando a gravação do histórico falha. | Aprovado. |

### Cobertura de riscos desta etapa

Os testes da camada entregue cobrem a regra de negócio crítica, os dados iniciais, a criação do histórico, a persistência em arquivo e a atomicidade da mudança de status. Em particular, uma falha ao registrar o histórico não deixa o incidente em um estado parcialmente atualizado.

Os riscos ligados à API, validação de entradas, integração com a interface, deploy e documentação final permanecem fora da cobertura atual porque essas partes ainda não foram implementadas. Eles serão tratados nas etapas correspondentes.

### Resultado e próxima decisão

O domínio e a persistência local estão prontos para uso pela camada HTTP, com oito testes automatizados aprovados no projeto. A próxima etapa é expor os casos de uso por uma API com validação de entradas, sem criar ainda a interface funcional.

## Mudança de requisitos Change Request 1

Às 14:00, o produto passou a exigir comentários persistidos por incidente e uma timeline única que reúne comentários e mudanças de status em ordem cronológica. A mudança é obrigatória e não substitui requisitos anteriores.

O impacto ficou restrito às camadas de domínio, aplicação, infraestrutura SQLite e API. Foram adicionados o modelo `IncidentComment`, os casos de uso de adicionar comentário e obter atividade do incidente, a tabela `incident_comments` e os endpoints `POST /api/incidents/:incidentId/comments` e `GET /api/incidents/:incidentId/activity`.

O contrato de histórico de status original foi preservado. A atividade unificada é uma leitura derivada, que combina os dois tipos de eventos sem criar uma cópia adicional dos dados. Eventos com a mesma data são ordenados de maneira determinística pelo identificador.

### Testes da mudança

| Teste | O que validou | Resultado |
| --- | --- | --- |
| Validação de comentário | Rejeição de conteúdo vazio e identificação do campo inválido. | Aprovado. |
| Criação de comentário | Inclusão de autor, conteúdo, data/hora e associação ao incidente. | Aprovado. |
| Incidente inexistente | Resposta 404 ao tentar comentar em incidente ausente. | Aprovado. |
| Persistência | Disponibilidade do comentário após fechar e reabrir o banco SQLite. | Aprovado. |
| Compatibilidade de migration | Abertura de banco no esquema anterior, preservação de incidente existente e criação da tabela de comentários. | Aprovado. |
| Timeline unificada | Combinação e ordenação cronológica de mudança de status e comentário. | Aprovado. |
| Regressão | Execução de todos os testes anteriores de domínio, SQLite e API. | Aprovado. |
| Build | Verificação de tipos e geração do build após a mudança. | Aprovado. |

O resultado é uma implementação compatível com os requisitos originais, sem regressões detectadas: 19 testes automatizados passaram e o build foi concluído.

## Direção visual e brainstorm

Antes da implementação da interface, foi realizado um brainstorm com LLM para encontrar uma identidade visual de Operations Command Center. A proposta prioriza uma interface SaaS escura, sóbria, legível e orientada a incidentes, sem aparência de painel genérico ou excessos decorativos.

O prompt consolidado, suas decisões e restrições estão registrados em [docs/UI_BRAINSTORM_PROMPT.md](docs/UI_BRAINSTORM_PROMPT.md). A análise descartou Reports, Analytics e Settings por não fazerem parte do escopo. A implementação usará somente dados reais da API, cores semânticas de severidade e uma timeline baseada em eventos persistidos.

## Etapa API e regras de negócio

### O que foi feito

Foi criada uma API HTTP Express que conecta os casos de uso já existentes à futura interface. A API disponibiliza criação de incidentes, listagem com filtros por status e severidade, detalhes, histórico, alteração de status e métricas do dashboard.

As entradas HTTP são validadas antes de alcançarem o domínio. Criação exige título, descrição, severidade válida e responsável. Filtros e alterações de status aceitam apenas os valores definidos pelo produto. Erros de recurso inexistente, transição proibida e entrada inválida retornam respostas compreensíveis com status HTTP adequados.

O processo da API é inicializável pelo script `npm run api`; ele cria o banco local, aplica o seed idempotente e inicia o servidor na porta 3000 por padrão. A interface ainda não foi implementada.

### Testes executados

| Teste | O que validou | Resultado |
| --- | --- | --- |
| Listagem e filtros | Retorno de incidentes e aplicação conjunta de filtros de status e severidade. | Aprovado. |
| Validação HTTP | Rejeição de filtros, payload de criação, status e JSON malformado. | Aprovado. |
| Criação | Status inicial `Open`, datas automáticas e consulta posterior do incidente criado. | Aprovado. |
| Detalhes e histórico | Retorno de dados completos e do histórico por ambas as rotas disponíveis. | Aprovado. |
| Regra `Critical` via API | Retorno compreensível de erro e preservação dos dados para transição proibida. | Aprovado. |
| Incidente inexistente | Resposta 404 com feedback compreensível. | Aprovado. |
| Dashboard | Contagens de incidentes abertos, `Critical` não resolvidos e resolvidos com base nos dados atuais. | Aprovado. |
| Build | Verificação de tipos TypeScript e geração do build de produção do frontend. | Aprovado. |
| Execução local da API | Inicialização pelo comando `npm.cmd run api` e consulta manual ao endpoint `/api/dashboard`. | Aprovado: API disponível em `localhost:3000` e métricas iniciais retornadas conforme esperado. |

### Resultado e próxima decisão

A API e suas regras de entrada estão preparadas para consumo pela interface. O conjunto atual possui testes unitários e de integração cobrindo domínio, persistência e API. A próxima etapa é construir a interface funcional sem duplicar regras de negócio no frontend.
