# Estado atual do jogo

O jogo já está funcionando como um MVP. O Betta aparece na tela, pode ser
movido com WASD ou pelas setas e fica preso dentro da área visível.

Os inimigos aparecem pelas bordas e seguem o Betta. Existem tipos diferentes
de inimigos, com valores próprios de vida, velocidade e dano de contato.

O Betta ataca automaticamente o inimigo mais próximo dentro do alcance. Os
projéteis causam dano e desaparecem depois de um tempo. Também é possível
clicar diretamente em um inimigo para causar dano.

O jogo já tem colisões, pontuação, aumento gradual da frequência dos inimigos,
barra de vida, tela de Game Over e botão para reiniciar a partida.

## O que falta fazer

- Colocar as texturas e sprites reais dos personagens, inimigos, projéteis e
  cenário. Por enquanto, eles aparecem como retângulos coloridos.
- Usar de verdade os caminhos de textura que já estão nos arquivos de dados.
- Fazer os inimigos deixarem drops ao serem derrotados.
- Adicionar os sacos de ração para recuperar a vida do Betta.
- Implementar melhorias de arma, defesa e vida durante a partida.
- Fazer as outras armas funcionarem. Por enquanto, apenas a pistola está sendo
  usada automaticamente.
- Melhorar os padrões de movimento dos inimigos para que eles não tenham todos
  exatamente o mesmo comportamento.
- Criar telas de menu.
- Adicionar som e efeitos de partículass.
