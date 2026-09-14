# Plano do Jogo — "Betta Defense"

## Conceito
Tower Defense com estrutura de movimentação estilo *survivors-like*: o Peixe Betta atua como a "torre" do jogo, mas, em vez de ficar fixo, move-se pelo cenário (os destroços do Titanic) enquanto ataca automaticamente os inimigos que se aproximam. Ele acumula melhorias de arma e sobrevivência conforme o jogo avança.

## Elementos Centrais

### 1. O Betta (Torre / Personagem Principal)
* **Controle:** Movimentação exclusiva via teclado (WASD) para navegar pelo cenário.
* **Ataque:** Dispara automaticamente contra o inimigo mais próximo que estiver dentro do seu alcance, sem necessidade de comando de ataque do jogador.
* **Atributos:** Possui HP próprio, que será exibido constantemente na HUD.
* **Arsenal:** A arma inicial consiste em uma pistola/rifle, podendo evoluir conforme a progressão.

### 2. Inimigos
* **Comportamento Base:** Peixes e monstros marinhos surgem das bordas da tela e caminham continuamente em direção ao Betta.
* **Variedade Mecânica:** Apresentam diferenças mecânicas reais entre os tipos (não apenas visuais), variando em velocidade, quantidade de HP, dano de contato e padrões de movimento.
* **Ataque:** Causam dano por contato ou proximidade ao Betta (o que substitui o "ataque à torre" tradicional).
* **Dificuldade Progressiva:** A frequência e a quantidade de inimigos gerados (*spawn*) aumentam com o tempo.

### 3. Interação do Jogador
* **Sistema de "Dedada":** O clique com o mouse em um inimigo subtrai o HP dele diretamente.
* **Separação de Controles:** O mouse serve única e exclusivamente para clicar nos inimigos (causar dano), enquanto o teclado (WASD) cuida 100% da movimentação, evitando qualquer conflito de comandos.

### 4. Power-ups e Progressão
* **Drops:** Inimigos derrotados deixam cair itens de forma aleatória.
* **Cura:** Sacos de ração que, ao serem coletados, recuperam o HP do Betta.
* **Melhorias:** Upgrades de arma, aumento de defesa ou vida.

### 5. Interface (HUD)
* **Métricas:** Exibição da vida atual do Betta.
* **Critério de Pontuação:** Baseado na quantidade de inimigos derrotados e/ou no tempo total de sobrevivência.

### 6. Condição de Derrota
* **Fim de Jogo:** Ocorre quando o HP do Betta chega a zero.
* **Game Over:** Exibição de uma tela própria de encerramento, contendo a opção de reiniciar a partida.