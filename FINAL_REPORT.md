# FINAL_REPORT

## 1. O que foi entregue?

- Dashboard com incidentes ativos, `Critical` não resolvidos e resolvidos.
- Criação, listagem, busca e filtros de incidentes.
- Detalhe de incidente com dados completos, alteração de status e feedback de erro.
- Regra de negócio que impede `Critical: Open -> Resolved`.
- Histórico persistido de status, comentários persistidos e timeline unificada.
- Persistência SQLite com dados iniciais obrigatórios e compatibilidade com banco anterior à inclusão de comentários.
- Monólito de produção que serve React e API Express em um único processo.
- Health check público em `GET /health` para confirmar a disponibilidade do processo.
- Testes automatizados e documentação de execução/decisões: 22 testes Vitest e 7 jornadas E2E aprovados; a instalação limpa com `npm.cmd ci` também foi verificada.

## 2. O que não foi entregue?

- Autenticação, permissões, notificações, relatórios, multi-tenancy e integrações externas.
- Observabilidade de produção, paginação e uma estratégia de banco adequada a múltiplas instâncias concorrentes.

## 3. O que foi deliberadamente decidido não fazer?

Não foram implementados microsserviços, autenticação, notificações, Analytics, Reports e Settings. Esses itens não faziam parte dos requisitos e desviariam tempo da persistência, regra `Critical`, Change Request de comentários, testes e entrega local reproduzível.

## 4. Quais foram as três principais decisões técnicas?

1. **Monólito modular:** React, Express e SQLite no mesmo repositório/processo de produção para reduzir a complexidade de deploy, mantendo camadas separadas para evolução futura.
2. **SQLite com seed idempotente:** garante persistência local e permite que o avaliador comece com os três incidentes obrigatórios sem configuração adicional.
3. **Regras no domínio/API, não no frontend:** a interface orienta o usuário, mas o backend impede de fato a transição inválida de incidentes `Critical`.

## 5. Qual foi o maior erro produzido pela IA durante o desenvolvimento?

A primeira proposta visual incluiu um sino de notificações com badge e uma busca global no cabeçalho sem implementar os respectivos comportamentos. Os elementos sugeriam capacidades inexistentes e não pertenciam ao escopo do desafio.

## 6. Como esse erro foi identificado?

Durante a validação manual, foi observado que o sino com duas notificações não era clicável e que a busca global não tinha propósito. A revisão considerou o comportamento real da aplicação, e não apenas o visual.

## 7. Como o erro foi corrigido e validado?

Os controles foram removidos. A busca funcional da tabela de incidentes foi preservada. A interface foi novamente verificada no monólito local, junto com o build e a suíte automatizada.

## 8. Houve alguma regressão?

Não houve regressão funcional identificada após o Change Request ou os ajustes visuais: a suíte final executou 21 testes aprovados. A migração do banco foi testada explicitamente com um banco anterior à tabela de comentários.

## 9. Em qual parte houve mais retrabalho?

Na interface visual e na semântica das métricas. Foi necessário eliminar controles decorativos, definir que `Open` e `In Progress` são ambos incidentes ativos no dashboard e preservar simultaneamente o valor formal `Open` exigido pelo desafio. A apresentação `Open (New)` resolveu a ambiguidade sem alterar API ou persistência.

## 10. Cite uma situação em que você rejeitou ou alterou uma abordagem sugerida pela IA.

A separação imediata entre aplicação frontend e API foi considerada, mas rejeitada para esta entrega. Foi adotado o monólito modular, pois atende ao escopo dentro do tempo e mantém fronteiras suficientes para um pivot futuro. Também foram descartadas telas sugeridas de Reports, Analytics e Settings por serem extras sem valor para os critérios de aceite.

## 11. Qual parte da aplicação é menos confiável?

A interface ainda é a parte menos coberta. As sete jornadas E2E cobrem dashboard, filtros, criação, comentário, mudança de status `Critical` e viewport móvel, mas não há uma matriz automatizada de acessibilidade em tecnologias assistivas reais. Mudanças futuras na composição visual ainda podem introduzir falhas fora dessa cobertura.

## 12. Se tivesse mais duas horas, quais seriam suas três prioridades?

1. Adicionar validação de acessibilidade com tecnologias assistivas e auditoria automatizada.
2. Dividir a interface em componentes menores e adicionar testes de componentes.
3. Evoluir configuração de produção com variáveis de ambiente, logs estruturados e banco gerenciado para um cenário concorrente.

## 13. Como você avalia sua estratégia inicial?

A estratégia de estabilizar domínio, persistência e API antes da interface foi adequada e reduziu regressões quando o Change Request chegou. Eu manteria o monólito modular e a validação por etapas. Em uma próxima execução, reservaria mais cedo uma janela explícita para documentação final e testes de interface.

## 14. Aproximadamente quantas interações relevantes com IA foram necessárias?

Aproximadamente 25 interações relevantes, entre planejamento, implementação, revisão visual, correções, testes e documentação.

## 15. Quais ferramentas de IA foram utilizadas?

Foram utilizados ChatGPT Free Tier e Codex Free Tier. Não foi necessária troca de ferramenta durante o desafio.
