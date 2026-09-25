import { Entity } from './Entity.js';
import { Projectile } from './Projetil.js';
import { Texture } from '../../rendering/Texture.js';

const RANGE = 420;          // alcance do tiro automático
const STRIKE_COOLDOWN = 0.9; // tempo entre golpes em área (clique)
const QUADROS_ARPAO = Array.from({ length: 4 }, (_, i) => ({
  offsetX: (i * 64 + 0.5) / 256,
  offsetY: 0.5 / 64,
  scaleX: 63 / 256,
  scaleY: 63 / 64,
}));
const LARGURA_FOLHA_ATIRADOR = 1448;
const ALTURA_FOLHA_ATIRADOR = 1086;
const TAMANHO_QUADRO_ATIRADOR = 362;

// Colunas: direção da mira. Linhas: carregado, disparo e bolhas.
function recorteAtirador(coluna, linha, espelhado) {
  const x = coluna * TAMANHO_QUADRO_ATIRADOR + 64;
  const y = linha * TAMANHO_QUADRO_ATIRADOR + 70;
  const offsetX = (x + 0.5) / LARGURA_FOLHA_ATIRADOR;
  const scaleX = 275 / LARGURA_FOLHA_ATIRADOR;
  return {
    offsetX: espelhado ? offsetX + scaleX : offsetX,
    offsetY: 1 - (y + 245.5) / ALTURA_FOLHA_ATIRADOR,
    scaleX: espelhado ? -scaleX : scaleX,
    scaleY: 245 / ALTURA_FOLHA_ATIRADOR,
  };
}

export class Tower extends Entity {
  constructor({ x, y, texture, projectileTexture, gunTexture, gl }) {
    super({ x, y, texture, hp: 400 });

    // Titanic
    this.width = 460;
    this.height = 515;
    this.uv = { offsetX: 0, offsetY: 0.5, scaleX: 0.25, scaleY: 0.5 };
    this.radius = 185;
    this.gunTexture = gunTexture;
    this.gunX = x - 220;
    this.gunY = y + 155;
    this.gunWidth = 90;
    this.gunHeight = 78;
    this.gunFacingLeft = true;
    this.gunAimColumn = 2;
    this.gunShotAge = Infinity;

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
    this.gunShotAge += dt;
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.strikeCooldown > 0) this.strikeCooldown -= dt;

    if (this.lastStrike) {
      this.lastStrike.life -= dt;
      if (this.lastStrike.life <= 0) this.lastStrike = null;
    }

    this.currentTarget = this.findNearestEnemy(enemies);
    if (this.currentTarget) this.aimGun(this.currentTarget);
  }

  aimGun(target) {
    const dx = target.x - this.gunX;
    const dy = target.y - this.gunY;
    this.gunFacingLeft = dx < 0;
    const angle = Math.atan2(dy, Math.abs(dx));
    this.gunAimColumn = angle < -0.45 ? 1 : angle < -0.12 ? 0 : angle < 0.25 ? 2 : 3;
  }

  getMuzzlePosition() {
    return {
      x: this.gunX + (this.gunFacingLeft ? -39 : 39),
      y: this.gunY + 9,
    };
  }

  render(renderer) {
    renderer.desenharSprite(this);
    if (!this.gunTexture) return;
    const linha = this.gunShotAge < 0.08 ? 1 : this.gunShotAge < 0.25 ? 2 : 0;
    renderer.desenharQuad(this.gunX, this.gunY, this.gunWidth, this.gunHeight,
      this.gunTexture, [1.15, 1.15, 1.15, 1], recorteAtirador(this.gunAimColumn, linha, this.gunFacingLeft));
  }

  findNearestEnemy(enemies) {
    let closest = null;
    let closestDist = RANGE;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dist = Math.hypot(enemy.x - this.gunX, enemy.y - this.gunY);
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
    this.gunShotAge = 0;

    const muzzle = this.getMuzzlePosition();
    const dx = this.currentTarget.x - muzzle.x;
    const dy = this.currentTarget.y - muzzle.y;
    const dist = Math.hypot(dx, dy) || 1;

    return new Projectile({
      x: muzzle.x,
      y: muzzle.y,
      texture: this.projectileTexture,
      dirX: dx / dist,
      dirY: dy / dist,
      speed: this.projectileSpeed,
      damage: this.damage,
      size: 16,
      width: 32,
      height: 32,
      rotation: Math.atan2(dy, dx) + Math.PI / 4,
      animationFrames: QUADROS_ARPAO,
      frameDuration: 0.1,
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
