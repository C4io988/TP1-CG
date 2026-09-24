import { Entity } from './Entity.js';
import { Projectile } from './Projetil.js';
import { Texture } from '../../rendering/Texture.js';
import { SpriteAnimation } from '../../rendering/SpriteAnimation.js';
import { WEAPONS } from '../data/Guns.js';

const SPEED = 180; // pixels por segundo
const ATTACK_RANGE = 250; // pixels
const QUADROS_DO_NADO = 8;
const DURACAO_DO_QUADRO = 0.1; // segundos por quadro da animação de nado
const QUADROS_NOVOS = 8;

// caminho de cada sprite que o Betta pode usar, dependendo do estado
const CAMINHOS_DOS_SPRITES = {
  parado: 'assets/images/betta/betta_parado_animacao.png',
  paradoVertical: 'assets/images/betta/betta_parado_vertical_animacao.png',
  nadoVertical: 'assets/images/betta/betta_nado_cima_animacao.png',
  nadoHorizontal: 'assets/images/betta/betta_nado_horizontal_animacao.png',
};

// A folha do parado não tem células de largura igual: estes cortes seguem
// as separações entre os peixes, sem puxar parte do quadro vizinho.
const CORTES_PARADO = [[18, 210], [228, 202], [430, 203], [633, 205],
  [838, 206], [1044, 204], [1248, 206], [1454, 203]];
const UV_PARADO_ESQUERDA = CORTES_PARADO.map(([x, largura]) => uvRecorte(x, 238, largura, 192, 1672, 941));
const UV_PARADO_DIREITA = CORTES_PARADO.map(([x, largura]) => uvRecorte(x, 499, largura, 198, 1672, 941));

// Os quadros verticais têm espaço suficiente para manter um corte fixo;
// assim a cauda pode balançar sem mudar o tamanho do Betta.
const X_NADO_VERTICAL = [112, 534, 946, 1389];
const UV_VERTICAL_CIMA = [80, 485].flatMap(y =>
  X_NADO_VERTICAL.map(x => uvRecorte(x, y, 300, 350, 1774, 887)));
const UV_VERTICAL_BAIXO = UV_VERTICAL_CIMA.map(uv => ({
  offsetX: uv.offsetX,
  offsetY: uv.offsetY + uv.scaleY,
  scaleX: uv.scaleX,
  scaleY: -uv.scaleY,
}));

// O nado horizontal tem 4 quadros em cada linha. A margem superior
// da imagem é vazia, então recortamos apenas a faixa dos peixes.
const X_NADO_HORIZONTAL = [0, 362, 724, 1086];
const UV_NADO_DIREITA = [[268, 282], [590, 280]].flatMap(([y, altura]) =>
  X_NADO_HORIZONTAL.map(x => uvRecorte(x, y, 362, altura, 1448, 1086)));
const UV_NADO_ESQUERDA = UV_NADO_DIREITA.map(uv => ({
  offsetX: uv.offsetX + uv.scaleX,
  offsetY: uv.offsetY,
  scaleX: -uv.scaleX,
  scaleY: uv.scaleY,
}));

function uvRecorte(x, y, largura, altura, larguraFolha, alturaFolha) {
  return {
    offsetX: (x + 0.5) / larguraFolha,
    offsetY: 1 - (y + altura - 0.5) / alturaFolha,
    scaleX: (largura - 1) / larguraFolha,
    scaleY: (altura - 1) / alturaFolha,
  };
}

export class Betta extends Entity {
  // recebe gl (não mais texture pronta), porque agora ele mesmo carrega
  // várias texturas — uma pra cada direção/estado
  constructor({ x, y, gl, projectileTexture, texturas }) {
    const sprites = texturas ?? carregarTexturasDoBetta(gl);
    super({ x, y, texture: sprites.parado, hp: 100 });

    this.texturas = sprites;
    this.width = 74;
    this.height = 68;
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
    this.animacaoParado = new SpriteAnimation({ frameCount: QUADROS_NOVOS, frameDuration: 0.17 });
    this.animacaoVertical = new SpriteAnimation({ frameCount: QUADROS_NOVOS, frameDuration: 0.1 });
    this.uv = UV_PARADO_DIREITA[0];
  }

  static carregarTexturas(gl) {
    return carregarTexturasDoBetta(gl);
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

    this.atualizarSprite(dt, dx, dy, estaSeMovendo);

    // mantém o Betta dentro da área visível usando o tamanho da pose atual
    this.x = Math.max(this.width / 2, Math.min(bounds.width - this.width / 2, this.x));
    this.y = Math.max(this.height / 2, Math.min(bounds.height - this.height / 2, this.y));

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

    const nadandoNaHorizontal =
      estaSeMovendo && (this.direcao === 'direita' || this.direcao === 'esquerda');

    if (nadandoNaHorizontal) {
      this.animacaoParado.reset();
      this.animacaoVertical.reset();
      this.animacaoNado.update(dt);
      this.texture = this.texturas.nadoHorizontal;
      const quadros = this.direcao === 'direita' ? UV_NADO_DIREITA : UV_NADO_ESQUERDA;
      this.uv = quadros[this.animacaoNado.currentFrame];
      this.width = 74;
      this.height = 58;
    } else if (estaSeMovendo) {
      this.animacaoNado.reset();
      this.animacaoParado.reset();
      this.animacaoVertical.update(dt);
      this.texture = this.texturas.nadoVertical;
      const quadros = this.direcao === 'cima' ? UV_VERTICAL_CIMA : UV_VERTICAL_BAIXO;
      this.uv = quadros[this.animacaoVertical.currentFrame];
      this.width = 53;
      this.height = 78;
    } else if (this.direcao === 'direita' || this.direcao === 'esquerda') {
      this.animacaoNado.reset();
      this.animacaoVertical.reset();
      this.animacaoParado.update(dt);
      this.texture = this.texturas.parado;
      const quadros = this.direcao === 'direita' ? UV_PARADO_DIREITA : UV_PARADO_ESQUERDA;
      this.uv = quadros[this.animacaoParado.currentFrame];
      this.width = 74;
      this.height = 68;
    } else {
      this.animacaoNado.reset();
      this.animacaoVertical.reset();
      this.animacaoParado.update(dt);
      this.texture = this.texturas.paradoVertical;
      const quadros = this.direcao === 'cima' ? UV_VERTICAL_CIMA : UV_VERTICAL_BAIXO;
      this.uv = quadros[this.animacaoParado.currentFrame];
      this.width = 53;
      this.height = 78;
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
    parado: Texture.fromImage(gl, CAMINHOS_DOS_SPRITES.parado, { pixelated: true }),
    paradoVertical: Texture.fromImage(gl, CAMINHOS_DOS_SPRITES.paradoVertical, { pixelated: true }),
    nadoVertical: Texture.fromImage(gl, CAMINHOS_DOS_SPRITES.nadoVertical, { pixelated: true }),
    nadoHorizontal: Texture.fromImage(gl, CAMINHOS_DOS_SPRITES.nadoHorizontal, { pixelated: true }),
  };
}
