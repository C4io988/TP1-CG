export class InputManager {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.camera = camera;
    this.keys = new Set();
    this.pendingClick = null;

    window.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));

    canvas.addEventListener('click', (e) => {
      this.pendingClick = this.converterPosicaoParaJogo(e.clientX, e.clientY);
    });
  }

  teclaPressionada(key) {
    return this.keys.has(key);
  }

  converterPosicaoParaJogo(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  // Retorna a posição do último clique não-consumido, ou null.
  // Consumir (e não só ler) evita processar o mesmo clique em vários frames.
  consumirClique() {
    const click = this.pendingClick;
    this.pendingClick = null;
    return click;
  }
}
