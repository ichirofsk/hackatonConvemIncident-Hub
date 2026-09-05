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

## Critérios de aceite

- Um incidente criado permanece disponível após reiniciar a aplicação.
- A lista mostra título, severidade, responsável e status.
- Os filtros por status e severidade retornam os dados esperados.
- A tela de detalhes mostra todos os campos obrigatórios e o histórico.
- Um incidente `Critical` em `Open` não pode ser resolvido diretamente.
- Um incidente `Critical` pode seguir de `Open` para `In Progress` e então para `Resolved`.
- Toda alteração de status cria um item persistido no histórico.
- O dashboard reflete o estado atual dos dados.
- Os três incidentes iniciais obrigatórios estão disponíveis.
- Os testes das regras críticas passam.
- Um avaliador consegue executar a aplicação seguindo apenas o README.

## Riscos

- Complexidade excessiva na configuração inicial e no deploy.
- Uso de tempo em aparência antes dos requisitos obrigatórios.
- Inconsistência entre banco, API e interface.
- Regressões após mudanças no fluxo de status.
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
| Estrutura e testes | Pendente | — | — |
| Domínio e persistência | Pendente | — | — |
| API e regras de negócio | Pendente | — | — |
| Interface | Pendente | — | — |
| Testes e validação final | Pendente | — | — |
| Deploy e documentação final | Pendente | — | — |
