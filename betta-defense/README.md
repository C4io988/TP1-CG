# Betta Defense

## Sobre o jogo

Betta Defense é um jogo de defesa com elementos de *survivors-like*. O Titanic
fica parado no cenário e precisa ser protegido dos monstros que chegam pelas
bordas. O Betta é o personagem controlado pelo jogador e pode nadar pelo mapa
para ajudar na defesa.

## O que já funciona

- O Betta se move com `WASD` ou pelas setas do teclado.
- O Betta dispara automaticamente quando existe um inimigo próximo.
- O Titanic também dispara sozinho contra os inimigos ao seu alcance.
- O clique do mouse ativa um golpe em área do Titanic.
- Existem quatro tipos de inimigos: sardinha, piranha, tubarão e lula.
- Alguns inimigos perseguem o Betta e outros vão direto para o Titanic.
- Cada tipo possui vida, velocidade e dano próprios.
- Os inimigos entram pela esquerda e pela parte de baixo do mapa.
- A frequência dos inimigos aumenta com o tempo.
- Inimigos derrotados podem deixar power-ups.
- O Betta coleta os power-ups ao passar por cima deles.
- Os power-ups podem melhorar o dano, a cadência e a área do Titanic, além de
	recuperar a vida do Titanic ou do Betta.
- A HUD mostra a vida dos dois personagens, a pontuação e os upgrades.
- O jogo termina quando o Titanic ou o Betta ficam sem vida.
- A partida pode ser reiniciada pela tela de Game Over.
- A câmera usa um tamanho virtual fixo e mantém a proporção em telas diferentes.

## Controles

- `WASD` ou setas: movimentar o Betta.
- Clique do mouse: usar o golpe em área do Titanic.

## O que ainda falta

- Trocar os retângulos coloridos por sprites e texturas reais.
- Usar os caminhos de imagem que já estão definidos nos arquivos de dados.
- Fazer o arpão e o canudinho funcionarem como armas disponíveis durante a
	partida.
- Criar telas de menu ou splash, caso sejam exigidas na entrega.
- Adicionar sons e partículas, que são melhorias opcionais.

## Como executar

O jogo usa módulos JavaScript e carrega os shaders com `fetch`. Por isso, deve
ser aberto por um servidor local