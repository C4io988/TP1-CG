export class Entity {
  constructor({ x, y, texture, hp = 1 }) {
    this.x = x;
    this.y = y;
    this.texture = texture;
    this.hp = hp;
    this.maxHp = hp;
    this.alive = true;
    this.hitFlash = 0;
  }

  update(dt) {
    if (this.hitFlash > 0) this.hitFlash -= dt;
  }

  get tint() {
    return [1, 1, 1, 1];
  }

  render(renderer) {
    renderer.desenharSprite(this);
  }

  obterLimites() {
    return { x: this.x, y: this.y, radius: this.radius ?? 16 };
  }

  receberDano(amount) {
    this.hp -= amount;
    this.hitFlash = 0.08;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }
}
