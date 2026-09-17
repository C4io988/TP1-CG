export class InputManager {
  constructor(canvas, camera) {
    this.canvas = canvas;
    this.camera = camera;
    this.keys = new Set();
    this.pendingClick = null;

    window.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));

    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const pixelX = (e.clientX - rect.left) * (canvas.width / rect.width);
      const pixelY = (e.clientY - rect.top) * (canvas.height / rect.height);
      this.pendingClick = this.camera.telaParaMundo(pixelX, pixelY);
    });
  }

  teclaPressionada(key) {
    return this.keys.has(key);
  }

  consumirClique() {
    const click = this.pendingClick;
    this.pendingClick = null;
    return click;
  }
}
