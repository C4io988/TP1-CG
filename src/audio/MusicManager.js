const LIMITE_POR_FAIXA_MS = 2 * 60 * 1000;
const INTERVALO_DE_ACELERACAO = 5 * 60;
const REPETICOES_POR_FAIXA = 3;
const DURACAO_FADE_OUT = 1.5;
const DURACAO_FADE_IN_MS = 1500;

export class MusicManager {
  constructor({
    menuTrack, gameTracks, effects = {}, endTracks = [], volume = 0.45, effectsVolume = 0.65,
  }) {
    this.menuTrack = menuTrack;
    this.gameTracks = gameTracks;
    this.volumePadrao = volume;
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.volume = volume;
    this.audio.muted = true;
    this.somAtivo = false;
    this.encerramentoAtual = null;
    this.efeitos = new Map(Object.entries(effects).map(([nome, caminho]) => {
      const efeito = new Audio(caminho);
      efeito.preload = 'auto';
      efeito.volume = effectsVolume;
      efeito.muted = true;
      return [nome, efeito];
    }));
    this.encerramentos = endTracks.map((config) => {
      const audio = new Audio(config.src);
      audio.preload = 'auto';
      audio.volume = volume;
      audio.muted = true;
      audio.loop = false;
      audio.addEventListener('ended', () => {
        if (this.encerramentoAtual?.audio === audio) this.deveTocar = false;
      });
      audio.load();
      return { audio, startAt: config.startAt ?? 0 };
    });

    this.mode = 'silencioso';
    this.ordem = [];
    this.indice = -1;
    this.repeticaoAtual = 0;
    this.timer = null;
    this.fadeFrame = null;
    this.fadeOutAtivo = false;
    this.fadeEntradaPendente = false;
    this.playToken = 0;
    this.deveTocar = false;

    this.audio.addEventListener('ended', () => {
      if (this.mode !== 'partida') return;

      this.repeticaoAtual += 1;
      if (this.repeticaoAtual < REPETICOES_POR_FAIXA) {
        this.cancelarFade();
        this.fadeOutAtivo = false;
        this.audio.volume = this.volumePadrao;
        this.audio.currentTime = 0;
        this.tentarTocar(false);
      } else {
        this.tocarProximaFaixa(true);
      }
    });

    this.audio.addEventListener('timeupdate', () => this.verificarFadeFinal());

    // Navegadores só liberam áudio depois de uma interação do usuário.
    const retomar = () => {
      if (!this.deveTocar) return;
      if (this.mode === 'encerramento') this.tentarTocarEncerramento();
      else if (this.audio.paused) this.tentarTocar(this.mode === 'partida');
    };
    window.addEventListener('pointerdown', retomar, { passive: true });
    window.addEventListener('keydown', retomar);
  }

  alternarSom() {
    this.somAtivo = !this.somAtivo;
    this.audio.muted = !this.somAtivo;
    for (const efeito of this.efeitos.values()) efeito.muted = !this.somAtivo;
    for (const faixa of this.encerramentos) faixa.audio.muted = !this.somAtivo;

    if (this.somAtivo && this.deveTocar) {
      if (this.mode === 'encerramento') this.tentarTocarEncerramento();
      else if (this.audio.paused) this.tentarTocar(this.mode === 'partida');
    }
    return this.somAtivo;
  }

  tocarEfeito(nome) {
    const efeito = this.efeitos.get(nome);
    if (!efeito || !this.somAtivo) return;

    efeito.currentTime = 0;
    const tentativa = efeito.play();
    if (tentativa) tentativa.catch(() => {});
  }

  tocarTemaDoMenu() {
    this.pararEncerramento();
    this.limparTimer();
    this.cancelarFade();
    this.mode = 'menu';
    this.deveTocar = true;
    this.fadeOutAtivo = false;
    this.fadeEntradaPendente = false;
    this.audio.pause();
    this.audio.src = this.menuTrack;
    this.audio.currentTime = 0;
    this.audio.loop = true;
    this.audio.playbackRate = 1;
    this.audio.volume = this.volumePadrao;
    this.tentarTocar(false);
  }

  iniciarPlaylistDaPartida() {
    this.pararEncerramento();
    this.limparTimer();
    this.cancelarFade();
    this.mode = 'partida';
    this.deveTocar = true;
    this.fadeOutAtivo = false;
    this.fadeEntradaPendente = false;
    this.audio.pause();
    this.audio.loop = false;
    this.audio.playbackRate = 1;
    this.audio.volume = this.volumePadrao;
    this.ordem = embaralhar(this.gameTracks);
    this.indice = -1;
    this.repeticaoAtual = 0;
    this.tocarProximaFaixa();
  }

  tocarEncerramentoAleatorio() {
    if (this.encerramentos.length === 0) return;

    this.limparTimer();
    this.cancelarFade();
    this.playToken += 1;
    this.audio.pause();
    this.pararEncerramento();
    this.mode = 'encerramento';
    this.deveTocar = true;

    const indice = Math.floor(Math.random() * this.encerramentos.length);
    this.encerramentoAtual = this.encerramentos[indice];
    this.tentarTocarEncerramento(true);
  }

  tentarTocarEncerramento(reiniciar = false) {
    if (!this.encerramentoAtual) return;
    const { audio, startAt } = this.encerramentoAtual;
    if (!reiniciar && !audio.paused) return;

    const iniciar = () => {
      if (reiniciar) audio.currentTime = startAt;
      const tentativa = audio.play();
      if (tentativa) tentativa.catch(() => {});
    };

    if (audio.readyState >= 1) iniciar();
    else audio.addEventListener('loadedmetadata', iniciar, { once: true });
  }

  pararEncerramento() {
    for (const faixa of this.encerramentos) {
      faixa.audio.pause();
      if (faixa.audio.readyState >= 1) faixa.audio.currentTime = faixa.startAt;
    }
    this.encerramentoAtual = null;
  }

  atualizarVelocidade(tempoDePartida) {
    if (this.mode !== 'partida') return;
    const aumentos = Math.floor(tempoDePartida / INTERVALO_DE_ACELERACAO);
    const velocidade = 1 + aumentos * 0.1;
    if (Math.abs(this.audio.playbackRate - velocidade) > 0.001) {
      this.audio.playbackRate = velocidade;
    }
  }

  tocarProximaFaixa(comFade = false) {
    if (this.mode !== 'partida' || this.gameTracks.length === 0) return;

    this.limparTimer();
    this.cancelarFade();
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
    this.audio.volume = comFade ? 0 : this.volumePadrao;
    this.repeticaoAtual = 0;
    this.fadeOutAtivo = false;
    this.fadeEntradaPendente = comFade;
    this.tentarTocar(true);
  }

  tentarTocar(limitarDuracao) {
    const token = ++this.playToken;
    const tentativa = this.audio.play();
    if (!tentativa) {
      this.iniciarFadeDeEntradaSeNecessario();
      if (limitarDuracao) this.agendarProximaFaixa(token);
      return;
    }

    tentativa
      .then(() => {
        this.iniciarFadeDeEntradaSeNecessario();
        if (limitarDuracao) this.agendarProximaFaixa(token);
      })
      .catch(() => {
        // A próxima interação do usuário chama tentarTocar novamente.
      });
  }

  verificarFadeFinal() {
    if (this.mode !== 'partida' || this.fadeOutAtivo) return;
    if (this.repeticaoAtual !== REPETICOES_POR_FAIXA - 1) return;
    if (!Number.isFinite(this.audio.duration) || this.audio.duration <= 0) return;

    const restante = this.audio.duration - this.audio.currentTime;
    if (restante <= 0 || restante > DURACAO_FADE_OUT) return;

    this.fadeOutAtivo = true;
    const duracaoReal = restante / Math.max(0.1, this.audio.playbackRate);
    this.iniciarFade(0, duracaoReal * 1000);
  }

  iniciarFadeDeEntradaSeNecessario() {
    if (!this.fadeEntradaPendente) return;
    this.fadeEntradaPendente = false;
    this.iniciarFade(this.volumePadrao, DURACAO_FADE_IN_MS);
  }

  iniciarFade(volumeFinal, duracaoMs) {
    this.cancelarFade();
    const volumeInicial = this.audio.volume;
    const inicio = performance.now();

    const atualizar = (agora) => {
      const progresso = Math.min(1, (agora - inicio) / Math.max(1, duracaoMs));
      this.audio.volume = volumeInicial + (volumeFinal - volumeInicial) * progresso;
      if (progresso < 1) this.fadeFrame = window.requestAnimationFrame(atualizar);
      else this.fadeFrame = null;
    };
    this.fadeFrame = window.requestAnimationFrame(atualizar);
  }

  cancelarFade() {
    if (this.fadeFrame !== null) window.cancelAnimationFrame(this.fadeFrame);
    this.fadeFrame = null;
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
