import { Entity } from './Entity.js';
import { Projectile } from './Projetil.js';
import { Texture } from '../../rendering/Texture.js';
import { WEAPONS } from '../data/Guns.js';

const SPEED = 180; // pixels por segundo
const ATTACK_RANGE = 250; // pixels

export class Betta extends Entity {
  constructor({ x, y, texture }) {
    super({ x, y, texture, hp: 100 });
    this.width = 46;
    this.height = 30;
    this.size = 40;
    this.radius = 20;
    this.speed = SPEED;
    this.weapon = WEAPONS.pistola;
    this.fireCooldown = 0;
    this.currentTarget = null;
  }

  update(dt, { input, enemies, bounds }) {
    let dx = 0;
    let dy = 0;
    if (input.teclaPressionada('w') || input.teclaPressionada('arrowup')) dy -= 1;
    if (input.teclaPressionada('s') || input.teclaPressionada('arrowdown')) dy += 1;
    if (input.teclaPressionada('a') || input.teclaPressionada('arrowleft')) dx -= 1;
    if (input.teclaPressionada('d') || input.teclaPressionada('arrowright')) dx += 1;

    const length = Math.hypot(dx, dy);
    if (length > 0) {
      this.x += (dx / length) * this.speed * dt;
      this.y += (dy / length) * this.speed * dt;
    }

    // mantém o Betta dentro da área visível
    this.x = Math.max(this.size / 2, Math.min(bounds.width - this.size / 2, this.x));
    this.y = Math.max(this.size / 2, Math.min(bounds.height - this.size / 2, this.y));

    if (this.fireCooldown > 0) this.fireCooldown -= dt;

    this.currentTarget = this.encontrarInimigoMaisProximo(enemies);
  }

  encontrarInimigoMaisProximo(enemies) {
    let closest = null;
    let closestDist = ATTACK_RANGE;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist < closestDist) {
        closest = enemy;
        closestDist = dist;
      }
    }

    return closest;
  }

  // Chamado todo frame pelo Game; devolve um Projectile novo ou null
  tentarAtirar(gl) {
    if (this.fireCooldown > 0 || !this.currentTarget) return null;

    this.fireCooldown = this.weapon.fireRate;

    const dx = this.currentTarget.x - this.x;
    const dy = this.currentTarget.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;

    return new Projectile({
      x: this.x,
      y: this.y,
      texture: Texture.fromColor(gl, [255, 240, 120, 255]),
      dirX: dx / dist,
      dirY: dy / dist,
      speed: this.weapon.projectileSpeed,
      damage: this.weapon.damage,
    });
  }
}
