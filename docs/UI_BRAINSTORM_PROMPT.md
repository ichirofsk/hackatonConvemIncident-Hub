# Prompt de brainstorm da interface

## Objetivo

Criar para o Incident Hub uma interface SaaS profissional, clara e tecnicamente simples, inspirada em uma central moderna de operações e gerenciamento de incidentes. A prioridade visual é clareza, hierarquia, legibilidade e facilidade de uso, sem estética exagerada, funcionalidades fora de escopo ou dados fictícios.

## Direção visual recebida

- Tema escuro de azul-marinho, com superfícies discretamente mais claras, bordas suaves, cartões arredondados e espaço negativo generoso.
- Paleta de referência: fundo `#0B1118`, sidebar `#07101D`, superfície `#111827`, cartão `#1A2332`, borda `#2A3442`, texto principal `#F3F4F6`, texto secundário `#9CA3AF` e azul primário `#3B82F6`.
- Severidade semântica: `Critical` em vermelho, `High` em laranja, `Medium` em amarelo e `Low` em verde.
- Tipografia Inter quando disponível, com alternativa `system-ui`/sans-serif, títulos compactos e texto de 13–14px.
- Ícones consistentes, preferencialmente Lucide, sem imagens fotográficas ou assets externos desnecessários.

## Componentes e fluxos solicitados

- Sidebar fixa, header, dashboard, cards de métricas, incidentes que exigem atenção, timeline, gráficos simples, tabela de incidentes, detalhes e modal de criação.
- Rotas conceituais: `/`, `/incidents`, `/incidents/new` e `/incidents/:id`.
- Dashboard com métricas e gráficos alimentados por dados reais; sem comparações temporais ou tempo médio de resolução enquanto esses dados não existirem.
- Lista com busca visual, filtros por status e severidade, tabela legível e badges semânticos.
- Detalhe com status contextual, descrição, metadados, comentários e timeline unificada de status/comentários.
- Formulário de criação com validação e feedback de sucesso/erro.
- Estados de loading, vazio, erro, sucesso, hover e componentes reutilizáveis.

## Restrições incorporadas

- A sidebar deve conter somente Dashboard e Incidentes; Reports, Analytics e Settings foram removidos por estarem fora do escopo.
- A timeline exibirá somente eventos realmente persistidos: mudanças de status e comentários. Não serão inventados autores para transições nem eventos de criação que o modelo atual não registra.
- Não serão adicionados dados de exemplo além dos incidentes exigidos somente para aumentar densidade visual.
- A interface deve consumir a API existente, sem substituir o backend por mocks.
