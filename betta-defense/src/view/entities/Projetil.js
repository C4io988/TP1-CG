import { Entity } from './Entity.js';
import { SpriteAnimation } from '../../rendering/SpriteAnimation.js';

const LIFETIME = 2; // segundos até o projétil expirar sozinho

export class Projectile extends Entity {
  constructor({ x, y, texture, dirX, dirY, speed, damage, size = 10, width, height, rotation = 0,
    animationFrames = null, frameDuration = 0.1 }) {
    super({ x, y, texture, hp: 1 });
    this.size = size;
    this.radius = size / 2;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
    this.animationFrames = animationFrames;
    this.animation = animationFrames
      ? new SpriteAnimation({ frameCount: animationFrames.length, frameDuration }) : null;
    if (this.animation) this.uv = animationFrames[0];
    this.dirX = dirX;
    this.dirY = dirY;
    this.speed = speed;
    this.damage = damage;
    this.age = 0;
  }

  update(dt) {
    if (this.animation) {
      this.animation.update(dt);
      this.uv = this.animationFrames[this.animation.currentFrame];
    }
    this.x += this.dirX * this.speed * dt;
    this.y += this.dirY * this.speed * dt;

    this.age += dt;
    if (this.age >= LIFETIME) this.alive = false;
  }
}
