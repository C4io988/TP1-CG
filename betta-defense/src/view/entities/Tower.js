import { Entity } from './Entity.js';
import { Projectile } from './Projetil.js';
import { Texture } from '../../rendering/Texture.js';

const RANGE = 420;          // alcance do tiro automático
const STRIKE_COOLDOWN = 0.9; // tempo entre golpes em área (clique)

export class Tower extends Entity {
  constructor({ x, y, texture, projectileTexture, gl }) {
    super({ x, y, texture, hp: 400 });

    // Titanic
    this.width = 420;
    this.height = 470;
    this.uv = { offsetX: 0, offsetY: 0.5, scaleX: 0.25, scaleY: 0.5 };
    this.radius = 185;

    // Stats melhoráveis por power-up
    this.fireRate = 0.6;
    this.damage = 14;
    this.projectileSpeed = 620;
    this.projectileTexture = projectileTexture ?? Texture.fromColor(gl, [255, 245, 200, 255]);
    this.strikeRadius = 90;
    this.strikeDamage = 18;

    this.fireCooldown = 0;
    this.strikeCooldown = 0;
    this.upgrades = { cadencia: 0, dano: 0, area: 0 };

    // Feedback visual do golpe em área
    this.lastStrike = null;
  }

  update(dt, enemies) {
    super.update(dt);
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.strikeCooldown > 0) this.strikeCooldown -= dt;

    if (this.lastStrike) {
      this.lastStrike.life -= dt;
      if (this.lastStrike.life <= 0) this.lastStrike = null;
    }

    this.currentTarget = this.findNearestEnemy(enemies);
  }

  findNearestEnemy(enemies) {
    let closest = null;
    let closestDist = RANGE;

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

  // Tiro automático da torre
  tryFire(gl) {
    if (this.fireCooldown > 0 || !this.currentTarget) return null;
    this.fireCooldown = this.fireRate;

    const dx = this.currentTarget.x - this.x;
    const dy = this.currentTarget.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;

    return new Projectile({
      x: this.x,
      y: this.y,
      texture: this.projectileTexture,
      dirX: dx / dist,
      dirY: dy / dist,
      speed: this.projectileSpeed,
      damage: this.damage,
      size: 16,
    });
  }

  canStrike() {
    return this.strikeCooldown <= 0;
  }

  // Golpe em área disparado pelo clique do jogador
  registerStrike(x, y) {
    this.strikeCooldown = STRIKE_COOLDOWN;
    this.lastStrike = { x, y, radius: this.strikeRadius, life: 0.25, maxLife: 0.25 };
  }
}
