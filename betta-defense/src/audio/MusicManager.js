const LIMITE_POR_FAIXA_MS = 2 * 60 * 1000;
const INTERVALO_DE_ACELERACAO = 5 * 60;
const REPETICOES_POR_FAIXA = 4;

export class MusicManager {
  constructor({ menuTrack, gameTracks, volume = 0.45 }) {
    this.menuTrack = menuTrack;
    this.gameTracks = gameTracks;
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.volume = volume;
    this.audio.muted = true;
    this.somAtivo = false;

    this.mode = 'silencioso';
    this.ordem = [];
    this.indice = -1;
    this.repeticaoAtual = 0;
    this.timer = null;
    this.playToken = 0;
    this.deveTocar = false;

    this.audio.addEventListener('ended', () => {
      if (this.mode !== 'partida') return;

      this.repeticaoAtual += 1;
      if (this.repeticaoAtual < REPETICOES_POR_FAIXA) {
        this.audio.currentTime = 0;
        this.tentarTocar(false);
      } else {
        this.tocarProximaFaixa();
      }
    });

    // Navegadores só liberam áudio depois de uma interação do usuário.
    const retomar = () => {
      if (this.deveTocar && this.audio.paused) this.tentarTocar(this.mode === 'partida');
    };
    window.addEventListener('pointerdown', retomar, { passive: true });
    window.addEventListener('keydown', retomar);
  }

  alternarSom() {
    this.somAtivo = !this.somAtivo;
    this.audio.muted = !this.somAtivo;

    if (this.somAtivo && this.deveTocar && this.audio.paused) {
      this.tentarTocar(this.mode === 'partida');
    }
    return this.somAtivo;
  }

  tocarTemaDoMenu() {
    this.limparTimer();
    this.mode = 'menu';
    this.deveTocar = true;
    this.audio.pause();
    this.audio.src = this.menuTrack;
    this.audio.currentTime = 0;
    this.audio.loop = true;
    this.audio.playbackRate = 1;
    this.tentarTocar(false);
  }

  iniciarPlaylistDaPartida() {
    this.limparTimer();
    this.mode = 'partida';
    this.deveTocar = true;
    this.audio.pause();
    this.audio.loop = false;
    this.audio.playbackRate = 1;
    this.ordem = embaralhar(this.gameTracks);
    this.indice = -1;
    this.repeticaoAtual = 0;
    this.tocarProximaFaixa();
  }

  atualizarVelocidade(tempoDePartida) {
    if (this.mode !== 'partida') return;
    const aumentos = Math.floor(tempoDePartida / INTERVALO_DE_ACELERACAO);
    const velocidade = 1 + aumentos * 0.1;
    if (Math.abs(this.audio.playbackRate - velocidade) > 0.001) {
      this.audio.playbackRate = velocidade;
    }
  }

  tocarProximaFaixa() {
    if (this.mode !== 'partida' || this.gameTracks.length === 0) return;

    this.limparTimer();
    this.indice += 1;
    if (this.indice >= this.ordem.length) {
      const anterior = this.ordem[this.ordem.length - 1];
      this.ordem = embaralhar(this.gameTracks);
      if (this.ordem.length > 1 && this.ordem[0] === anterior) {
        [this.ordem[0], this.ordem[1]] = [this.ordem[1], this.ordem[0]];
      }
      this.indice = 0;
    }

    this.audio.pause();
    this.audio.src = this.ordem[this.indice];
    this.audio.currentTime = 0;
    this.audio.loop = false;
    this.repeticaoAtual = 0;
    this.tentarTocar(true);
  }

  tentarTocar(limitarDuracao) {
    const token = ++this.playToken;
    const tentativa = this.audio.play();
    if (!tentativa) {
      if (limitarDuracao) this.agendarProximaFaixa(token);
      return;
    }

    tentativa
      .then(() => {
        if (limitarDuracao) this.agendarProximaFaixa(token);
      })
      .catch(() => {
        // A próxima interação do usuário chama tentarTocar novamente.
      });
  }

  agendarProximaFaixa(token) {
    if (token !== this.playToken || this.mode !== 'partida') return;
    this.limparTimer();
    this.timer = window.setTimeout(() => this.tocarProximaFaixa(), LIMITE_POR_FAIXA_MS);
  }

  limparTimer() {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
  }
}

function embaralhar(faixas) {
  const resultado = [...faixas];
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}
