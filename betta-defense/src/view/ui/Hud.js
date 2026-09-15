export class Hud {
  constructor() {
    this.root = document.getElementById('hud');
    this.root.innerHTML = `
      <div class="hud-bar">
        <div class="hp-track"><div id="hp-fill" class="hp-fill"></div></div>
        <div id="score" class="score">Pontos: 0</div>
      </div>
      <div id="game-over" class="game-over hidden">
        <h1>Game Over</h1>
        <p id="final-score"></p>
        <button id="restart-btn">Reiniciar</button>
      </div>
    `;

    this.hpFill = document.getElementById('hp-fill');
    this.scoreEl = document.getElementById('score');
    this.gameOverEl = document.getElementById('game-over');
    this.finalScoreEl = document.getElementById('final-score');
    this.restartBtn = document.getElementById('restart-btn');
  }

  update({ hp, maxHp, score }) {
    const pct = Math.max(0, hp / maxHp) * 100;
    this.hpFill.style.width = `${pct}%`;
    this.scoreEl.textContent = `Pontos: ${score}`;
  }

  mostrarGameOver(score, onRestart) {
    this.finalScoreEl.textContent = `Você sobreviveu e marcou ${score} pontos.`;
    this.gameOverEl.classList.remove('hidden');
    this.restartBtn.onclick = () => {
      this.gameOverEl.classList.add('hidden');
      onRestart();
    };
  }

  ocultar() {
    this.gameOverEl.classList.add('hidden');
  }
}
