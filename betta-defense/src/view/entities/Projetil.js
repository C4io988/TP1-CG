import { Entity } from './Entity.js';

const LIFETIME = 2; // segundos até o projétil expirar sozinho

export class Projectile extends Entity {
  constructor({ x, y, texture, dirX, dirY, speed, damage }) {
    super({ x, y, texture, hp: 1 });
    this.size = 10;
    this.radius = 5;
    this.dirX = dirX;
    this.dirY = dirY;
    this.speed = speed;
    this.damage = damage;
    this.age = 0;
  }

  update(dt) {
    this.x += this.dirX * this.speed * dt;
    this.y += this.dirY * this.speed * dt;

    this.age += dt;
    if (this.age >= LIFETIME) this.alive = false;
  }
}
