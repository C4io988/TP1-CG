export class Hud {
  constructor() {
    this.root = document.getElementById('hud');
    this.root.innerHTML = `
      <div class="hud-panel">
        <div class="bar-row"><span class="bar-label">Titanic</span><div class="hp-track"><div id="tower-hp" class="hp-fill tower"></div></div><span id="tower-hp-text" class="bar-value"></span></div>
        <div class="bar-row"><span class="bar-label">Betta</span><div class="hp-track"><div id="betta-hp" class="hp-fill betta"></div></div><span id="betta-hp-text" class="bar-value"></span></div>
        <div id="score" class="score">Pontos: 0</div>
        <div id="upgrades" class="upgrades"></div>
      </div>
      <div id="toast" class="toast"></div>
      <div id="game-over" class="game-over hidden">
        <h1>Game Over</h1>
        <p id="game-over-reason"></p>
        <p id="final-score"></p>
        <button id="restart-btn">Jogar de novo</button>
      </div>
    `;

    this.towerHp = document.getElementById('tower-hp');
    this.towerHpText = document.getElementById('tower-hp-text');
    this.bettaHp = document.getElementById('betta-hp');
    this.bettaHpText = document.getElementById('betta-hp-text');
    this.scoreEl = document.getElementById('score');
    this.upgradesEl = document.getElementById('upgrades');
    this.toastEl = document.getElementById('toast');
    this.gameOverEl = document.getElementById('game-over');
    this.reasonEl = document.getElementById('game-over-reason');
    this.finalScoreEl = document.getElementById('final-score');
    this.restartBtn = document.getElementById('restart-btn');
    this.toastTimer = null;
  }

  update({ tower, betta, score }) {
    this.atualizarBarra(this.towerHp, this.towerHpText, tower.hp, tower.maxHp);
    this.atualizarBarra(this.bettaHp, this.bettaHpText, betta.hp, betta.maxHp);
    this.scoreEl.textContent = `Pontos: ${score}`;
    const { cadencia, dano, area } = tower.upgrades;
    this.upgradesEl.textContent = `Cadência ${cadencia} · Dano ${dano} · Área ${area}`;
  }

  atualizarBarra(fill, text, hp, maxHp) {
    fill.style.width = `${Math.max(0, hp / maxHp) * 100}%`;
    text.textContent = `${Math.ceil(hp)}/${maxHp}`;
  }

  showToast(message) {
    this.toastEl.textContent = message;
    this.toastEl.classList.add('visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastEl.classList.remove('visible'), 1400);
  }

  mostrarGameOver(reason, score, onRestart) {
    this.reasonEl.textContent = reason;
    this.finalScoreEl.textContent = `Pontuação final: ${score}`;
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
