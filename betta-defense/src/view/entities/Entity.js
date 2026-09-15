export class Entity {
  constructor({ x, y, texture, hp = 1 }) {
    this.x = x;
    this.y = y;
    this.texture = texture;
    this.hp = hp;
    this.maxHp = hp;
    this.alive = true;
  }

  update(dt) {
    // cada subclasse (Betta, Enemy, Projectile...) sobrescreve isso
  }

  render(renderer) {
    renderer.desenharSprite(this);
  }

  obterLimites() {
    return { x: this.x, y: this.y, radius: this.radius ?? 16 };
  }

  receberDano(amount) {
    this.hp -= amount;
    if (this.hp <= 0) this.alive = false;
  }
}
