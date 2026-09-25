import { Entity } from './Entity.js';

const LIFETIME = 10; // some se o Betta não coletar a tempo

export class PowerUp extends Entity {
  constructor({ x, y, texture, uv, typeKey, config }) {
    super({ x, y, texture, hp: 1 });
    this.width = 52;
    this.height = 54;
    this.radius = 25;
    this.uv = uv;
    this.typeKey = typeKey;
    this.config = config;
    this.age = 0;
    this.baseY = y;
  }

  update(dt) {
    this.age += dt;
    // flutua suavemente para chamar atenção
    this.y = this.baseY + Math.sin(this.age * 4) * 5;
    if (this.age >= LIFETIME) this.alive = false;
  }

  // pisca quando está prestes a sumir
  get tint() {
    const remaining = LIFETIME - this.age;
    if (remaining < 3 && Math.floor(this.age * 8) % 2 === 0) return [1, 1, 1, 0.35];
    return [1, 1, 1, 1];
  }
}
