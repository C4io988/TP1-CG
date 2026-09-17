import { Entity } from './Entity.js';

export class Enemy extends Entity {
  constructor({ x, y, texture, type, typeKey }) {
    super({ x, y, texture, hp: type.hp });
    this.tipo = typeKey;
    this.size = type.size ?? 28;
    this.radius = this.size / 2;
    this.speed = type.speed;
    this.contactDamage = type.contactDamage;
    this.alvo = type.alvo ?? 'betta';
    this.dropChance = type.dropChance ?? 0;
    this.attackCooldown = 0;
  }

  update(dt, titanic, betta) {
    super.update(dt);
    const alvo = this.alvo === 'torre' ? titanic : betta;
    const dx = alvo.x - this.x;
    const dy = alvo.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;

    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;

    if (this.attackCooldown > 0) this.attackCooldown -= dt;
  }
}
