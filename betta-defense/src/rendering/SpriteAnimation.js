// Controla qual quadro de um spritesheet horizontal (quadros lado a lado,
// todos do mesmo tamanho) deve ser desenhado neste instante.
export class SpriteAnimation {
  constructor({ frameCount, frameDuration = 0.12 }) {
    this.frameCount = frameCount;
    this.frameDuration = frameDuration;
    this.timer = 0;
    this.currentFrame = 0;
  }

  update(dt) {
    this.timer += dt;
    if (this.timer >= this.frameDuration) {
      this.timer -= this.frameDuration;
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
    }
  }

  // volta pro primeiro quadro (chamado quando a entidade para de se mover)
  reset() {
    this.timer = 0;
    this.currentFrame = 0;
  }

  // devolve o retângulo de UV do quadro atual, pro Renderer usar
  getUV() {
    return {
      offsetX: this.currentFrame / this.frameCount,
      offsetY: 0,
      scaleX: 1 / this.frameCount,
      scaleY: 1,
    };
  }
}
