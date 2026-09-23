import { Entity } from './Entity.js';
import { Projectile } from './Projetil.js';
import { Texture } from '../../rendering/Texture.js';
import { SpriteAnimation } from '../../rendering/SpriteAnimation.js';
import { WEAPONS } from '../data/Guns.js';

const SPEED = 180; // pixels por segundo
const ATTACK_RANGE = 250; // pixels
const QUADROS_DO_NADO = 4;
const DURACAO_DO_QUADRO = 0.1; // segundos por quadro da animação de nado

// caminho de cada sprite que o Betta pode usar, dependendo do estado
const CAMINHOS_DOS_SPRITES = {
  paradoDireita: 'assets/images/betta/betta_parado_direita.png',
  paradoEsquerda: 'assets/images/betta/betta_parado_esquerda.png',
  paradoCima: 'assets/images/betta/betta_parado_cima.png',
  paradoBaixo: 'assets/images/betta/betta_parado_baixo.png',
  nadoDireita: 'assets/images/betta/betta_nado_direita_sheet.png',
  nadoEsquerda: 'assets/images/betta/betta_nado_esquerda_sheet.png',
};

const UV_TEXTURA_INTEIRA = { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 };

export class Betta extends Entity {
  // recebe gl (não mais texture pronta), porque agora ele mesmo carrega
  // várias texturas — uma pra cada direção/estado
  constructor({ x, y, gl, projectileTexture }) {
    const texturas = carregarTexturasDoBetta(gl);
    super({ x, y, texture: texturas.paradoDireita, hp: 100 });

    this.texturas = texturas;
    this.width = 74;
    this.height = 53;
    this.radius = 20;
    this.speed = SPEED;
    this.weapon = WEAPONS.pistola;
    this.projectileTexture = projectileTexture ?? Texture.fromColor(gl, [255, 240, 120, 255]);
    this.fireCooldown = 0;
    this.currentTarget = null;

    this.direcao = 'direita'; // última direção encarada, usada quando ele para
    this.animacaoNado = new SpriteAnimation({
      frameCount: QUADROS_DO_NADO,
      frameDuration: DURACAO_DO_QUADRO,
    });
    this.uv = UV_TEXTURA_INTEIRA;
  }

  update(dt, { input, enemies, bounds }) {
    let dx = 0;
    let dy = 0;
    if (input.teclaPressionada('w') || input.teclaPressionada('arrowup')) dy -= 1;
    if (input.teclaPressionada('s') || input.teclaPressionada('arrowdown')) dy += 1;
    if (input.teclaPressionada('a') || input.teclaPressionada('arrowleft')) dx -= 1;
    if (input.teclaPressionada('d') || input.teclaPressionada('arrowright')) dx += 1;

    const length = Math.hypot(dx, dy);
    const estaSeMovendo = length > 0;

    if (estaSeMovendo) {
      this.x += (dx / length) * this.speed * dt;
      this.y += (dy / length) * this.speed * dt;
    }

    // mantém o Betta dentro da área visível (agora usando o tamanho real dele)
    this.x = Math.max(this.width / 2, Math.min(bounds.width - this.width / 2, this.x));
    this.y = Math.max(this.height / 2, Math.min(bounds.height - this.height / 2, this.y));

    this.atualizarSprite(dt, dx, dy, estaSeMovendo);

    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    this.currentTarget = this.encontrarInimigoMaisProximo(enemies);
  }

  // Decide pra que lado o Betta está olhando e troca a textura/quadro
  // de acordo com isso — é só aqui que a movimentação vira animação.
  atualizarSprite(dt, dx, dy, estaSeMovendo) {
    // só troca de direção se realmente houver input; parado, mantém a última
    if (dx !== 0 && Math.abs(dx) >= Math.abs(dy)) {
      this.direcao = dx > 0 ? 'direita' : 'esquerda';
    } else if (dy !== 0) {
      this.direcao = dy > 0 ? 'baixo' : 'cima';
    }

    // só temos quadros de nado pra esquerda/direita (o material de origem
    // não trouxe nado pra cima/baixo) — nesses casos usa o sprite parado
    // já olhando pra direção certa, sem animar
    const nadandoNaHorizontal =
      estaSeMovendo && (this.direcao === 'direita' || this.direcao === 'esquerda');

    if (nadandoNaHorizontal) {
      this.animacaoNado.update(dt);
      this.texture = this.direcao === 'direita' ? this.texturas.nadoDireita : this.texturas.nadoEsquerda;
      this.uv = this.animacaoNado.getUV();
    } else {
      this.animacaoNado.reset();
      const chave = 'parado' + this.direcao.charAt(0).toUpperCase() + this.direcao.slice(1);
      this.texture = this.texturas[chave];
      this.uv = UV_TEXTURA_INTEIRA;
    }
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
      texture: this.projectileTexture,
      dirX: dx / dist,
      dirY: dy / dist,
      speed: this.weapon.projectileSpeed,
      damage: this.weapon.damage,
    });
  }
}

function carregarTexturasDoBetta(gl) {
  return {
    paradoDireita: Texture.fromImage(gl, CAMINHOS_DOS_SPRITES.paradoDireita),
    paradoEsquerda: Texture.fromImage(gl, CAMINHOS_DOS_SPRITES.paradoEsquerda),
    paradoCima: Texture.fromImage(gl, CAMINHOS_DOS_SPRITES.paradoCima),
    paradoBaixo: Texture.fromImage(gl, CAMINHOS_DOS_SPRITES.paradoBaixo),
    nadoDireita: Texture.fromImage(gl, CAMINHOS_DOS_SPRITES.nadoDireita),
    nadoEsquerda: Texture.fromImage(gl, CAMINHOS_DOS_SPRITES.nadoEsquerda),
  };
}
