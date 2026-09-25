import { Entity } from './Entity.js';
import { SpriteAnimation } from '../../rendering/SpriteAnimation.js';

// Quatro quadros de 496 px; o peixe ocupa só a faixa central da folha.
const QUADROS_SARDINHA = Array.from({ length: 4 }, (_, i) => ({
  offsetX: (i * 496 + 35.5) / 1984,
  offsetY: 1 - (153 + 185.5) / 496,
  scaleX: 424 / 1984,
  scaleY: 185 / 496,
}));

// Quatro quadros por linha; recorte fixo para a piranha não mudar de tamanho.
const QUADROS_PIRANHA = [108, 506].flatMap(y =>
  Array.from({ length: 4 }, (_, i) => ({
    offsetX: (i * 444 + 15.5) / 1776,
    offsetY: 1 - (y + 331.5) / 888,
    scaleX: 423 / 1776,
    scaleY: 331 / 888,
  })));

// A primeira linha é nado; a segunda, ataque. O tubarão ocupa quase
// toda a largura das células, então o corte horizontal usa a célula inteira.
const QUADROS_TUBARAO = [98, 531].map(y =>
  Array.from({ length: 4 }, (_, i) => ({
    offsetX: (i * 444 + 0.5) / 1776,
    offsetY: 1 - (y + 285.5) / 888,
    scaleX: 443 / 1776,
    scaleY: 285 / 888,
  })));

// Quatro quadros por linha: nado, tentáculos e tinta. As linhas da lula
// não começam nos múltiplos de 362 px, por isso cada faixa tem seu próprio y.
const QUADROS_LULA = [99, 411, 713].map(y =>
  Array.from({ length: 4 }, (_, i) => ({
    offsetX: (i * 362 + 0.5) / 1448,
    offsetY: 1 - (y + 291.5) / 1086,
    scaleX: 361 / 1448,
    scaleY: 291 / 1086,
  })));

const ANIMACOES = {
  sardinha: { quadros: QUADROS_SARDINHA, largura: 50, altura: 24, duracao: 0.14 },
  piranha: { quadros: QUADROS_PIRANHA, largura: 60, altura: 46, duracao: 0.12 },
  tubarao: { quadros: QUADROS_TUBARAO[0], ataque: QUADROS_TUBARAO[1], largura: 128, altura: 82, duracao: 0.16 },
  lula: { quadros: QUADROS_LULA[0], ataque: [...QUADROS_LULA[1], ...QUADROS_LULA[2]], largura: 138, altura: 112, duracao: 0.18 },
};

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
    const sprite = ANIMACOES[typeKey];
    if (sprite) {
      this.width = sprite.largura;
      this.height = sprite.altura;
      this.quadrosAnimacao = sprite.quadros;
      this.animacao = new SpriteAnimation({ frameCount: sprite.quadros.length, frameDuration: sprite.duracao });
      if (sprite.ataque) {
        this.quadrosAtaque = sprite.ataque;
        this.animacaoAtaque = new SpriteAnimation({ frameCount: sprite.ataque.length, frameDuration: 0.13 });
      }
      this.uv = sprite.quadros[0];
    }
  }

  update(dt, titanic, betta) {
    super.update(dt);
    const alvo = this.alvo === 'torre' ? titanic : betta;
    const dx = alvo.x - this.x;
    const dy = alvo.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;

    if (this.animacao) {
      const atacando = this.animacaoAtaque && dist <= (alvo.radius ?? 16) + this.radius + 12;
      let uv;
      if (atacando) {
        this.animacaoAtaque.update(dt);
        this.animacao.reset();
        uv = this.quadrosAtaque[this.animacaoAtaque.currentFrame];
      } else {
        this.animacaoAtaque?.reset();
        this.animacao.update(dt);
        uv = this.quadrosAnimacao[this.animacao.currentFrame];
      }
      this.uv = dx < 0
        ? { ...uv, offsetX: uv.offsetX + uv.scaleX, scaleX: -uv.scaleX }
        : uv;
    }

    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;

    if (this.attackCooldown > 0) this.attackCooldown -= dt;
  }
}
