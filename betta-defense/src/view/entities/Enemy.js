import { Entity } from './Entity.js';

export class Enemy extends Entity {
  constructor({ x, y, texture, type }) {
    super({ x, y, texture, hp: type.hp });
    this.size = 28;
    this.radius = 14;
    this.speed = type.speed;
    this.contactDamage = type.contactDamage;
    this.attackCooldown = 0;
  }

  update(dt, betta) {
    const dx = betta.x - this.x;
    const dy = betta.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;

    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;

    if (this.attackCooldown > 0) this.attackCooldown -= dt;
  }
}
