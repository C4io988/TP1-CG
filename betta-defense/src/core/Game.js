import { Camera, LARGURA_DO_MUNDO, ALTURA_DO_MUNDO } from '../rendering/Camera.js';
import { Renderer } from '../rendering/Renderer.js';
import { Texture } from '../rendering/Texture.js';
import { InputManager } from '../view/systems/InputManager.js';
import { CollisionSystem } from '../view/systems/SistemaDeColisao.js';
import { SpawnManager } from '../view/systems/SpawnManager.js';
import { Betta } from '../view/entities/Betta.js';
import { Tower } from '../view/entities/Tower.js';
import { PowerUp } from '../view/entities/PowerUp.js';
import { Hud } from '../view/ui/Hud.js';
import { TIPOS_DE_MOBS } from '../view/data/Mobs.js';
import { POWERUP_TYPES } from '../view/data/powerups.js';

const WORLD = { width: LARGURA_DO_MUNDO, height: ALTURA_DO_MUNDO };

function recorteUV(x, y, largura, altura, larguraFolha, alturaFolha) {
  return {
    offsetX: (x + 0.5) / larguraFolha,
    offsetY: 1 - (y + altura - 0.5) / alturaFolha,
    scaleX: (largura - 1) / larguraFolha,
    scaleY: (altura - 1) / alturaFolha,
  };
}

// Três tipos de alga (uma linha cada) e seis quadros do gerador de bolhas.
const QUADROS_ALGAS = [[70, 255], [374, 218], [653, 196]].map(([y, altura]) =>
  Array.from({ length: 6 }, (_, i) => recorteUV(i * 296, y, 296, altura, 1776, 888)));
const QUADROS_GERADOR = Array.from({ length: 6 }, (_, i) =>
  recorteUV(i * 362, 256, 362, 380, 2172, 724));
const QUADROS_PEIXES = [[142, 112], [397, 103], [682, 72]].map(([y, altura]) =>
  Array.from({ length: 6 }, (_, i) => recorteUV(i * 296 + 60, y, 210, altura, 1776, 888)));
const INTERVALO_PEIXES = 30;
const DURACAO_PEIXES = 8;

// baseY é o ponto em que cada decoração encosta no chão do mapa.
const DECORACOES_CENARIO = [
  { x: 365, baseY: 655, largura: 108, altura: 110, textura: 'algas', quadros: QUADROS_ALGAS[0], intervalo: 0.28, fase: 0 },
  { x: 800, baseY: 775, largura: 108, altura: 72, textura: 'algas', quadros: QUADROS_ALGAS[2], intervalo: 0.31, fase: 2 },
  { x: 1265, baseY: 675, largura: 110, altura: 82, textura: 'algas', quadros: QUADROS_ALGAS[1], intervalo: 0.26, fase: 4 },
  { x: 500, baseY: 720, largura: 94, altura: 102, textura: 'geradorBolhas', quadros: QUADROS_GERADOR, intervalo: 0.17, fase: 0 },
  { x: 925, baseY: 710, largura: 94, altura: 102, textura: 'geradorBolhas', quadros: QUADROS_GERADOR, intervalo: 0.19, fase: 2 },
  { x: 1180, baseY: 685, largura: 94, altura: 102, textura: 'geradorBolhas', quadros: QUADROS_GERADOR, intervalo: 0.16, fase: 4 },
];

export class Game {
  constructor(canvas, gl, renderer, camera) {
    this.canvas = canvas;
    this.gl = gl;
    this.renderer = renderer;
    this.camera = camera;

    this.input = new InputManager(canvas, camera);
    this.collision = new CollisionSystem();
    this.spawnManager = new SpawnManager(TIPOS_DE_MOBS);
    this.hud = new Hud();

    this.textures = {
      chao: Texture.fromImage(gl, 'assets/images/cenario/mapa_base_estatica.png'),
      algas: Texture.fromImage(gl, 'assets/images/cenario/algas_animacao_sheet.png', { pixelated: true }),
      geradorBolhas: Texture.fromImage(gl, 'assets/images/cenario/gerador_bolhas_animacao_sheet.png', { pixelated: true }),
      peixesFundo: Texture.fromImage(gl, 'assets/images/cenario/peixes_fundo_animacao_sheet.png', { pixelated: true }),
      tower: Texture.fromImage(gl, 'assets/images/titanic/titanic_sprite_sheet.png'),
      gun: Texture.fromImage(gl, 'assets/images/titanic/atirador_arpao_sheet.png', { pixelated: true }),
      betta: Texture.fromColor(gl, [255, 110, 50, 255]),
      bettaProjectile: Texture.fromColor(gl, [255, 240, 120, 255]),
      towerProjectile: Texture.fromImage(gl, 'assets/images/titanic/arpao_animacao_sheet.png', { pixelated: true }),
      strike: Texture.fromColor(gl, [255, 255, 255, 255]),
    };
    this.texturasBetta = Betta.carregarTexturas(gl);
    this.powerupTextures = {};
    for (const [key, config] of Object.entries(POWERUP_TYPES)) {
      this.powerupTextures[key] = Texture.fromColor(gl, config.color);
    }

    this.lastTime = 0;
    this.elapsedTime = 0;
    this.score = 0;
    this.gameOver = false;

    window.addEventListener('resize', () => this.ajustarTamanho());
    this.ajustarTamanho();

    this.reset();
  }

  handleResize() {
    this.ajustarTamanho();
    }

  static async create(canvas) {
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 não suportado neste navegador');

    const camera = new Camera(canvas.clientWidth, canvas.clientHeight);
    const renderer = await Renderer.create(gl, camera);

    return new Game(canvas, gl, renderer, camera);
  }

  reset() {
    this.tower = new Tower({
      x: WORLD.width - 260,
      y: 215,
      texture: this.textures.tower,
      projectileTexture: this.textures.towerProjectile,
      gunTexture: this.textures.gun,
    });
    this.betta = new Betta({
      x: WORLD.width * 0.55,
      y: WORLD.height * 0.6,
      gl: this.gl,
      texturas: this.texturasBetta,
      projectileTexture: this.textures.bettaProjectile,
    });

    this.enemies = [];
    this.projectiles = [];
    this.powerups = [];
    this.elapsedTime = 0;
    this.score = 0;
    this.gameOver = false;

    this.spawnManager.timer = 0;
    this.hud.ocultar();
    this.hud.update({ tower: this.tower, betta: this.betta, score: this.score });
  }

  start() {
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (!this.gameOver) {
      this.update(dt);
    }
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.elapsedTime += dt;

    this.tower.update(dt, this.enemies);
    this.betta.update(dt, {
      input: this.input,
      enemies: this.enemies,
      bounds: WORLD,
    });

    for (const enemy of this.enemies) {
      enemy.update(dt, this.tower, this.betta);
    }

    for (const projectile of this.projectiles) {
      projectile.update(dt);
    }
    for (const powerup of this.powerups) {
      powerup.update(dt);
    }

    this.spawnManager.update(dt, this.elapsedTime, this.enemies, {
      gl: this.gl,
      world: WORLD,
    });

    const tiroDaTorre = this.tower.tryFire(this.gl);
    if (tiroDaTorre) this.projectiles.push(tiroDaTorre);
    const tiroDoBetta = this.betta.tentarAtirar(this.gl);
    if (tiroDoBetta) this.projectiles.push(tiroDoBetta);

    this.tratarClique();

    this.collision.verificarBettaContraMobs(this.tower, this.betta, this.enemies);
    this.score += this.collision.verificarProjeteisContraMobs(this.projectiles, this.enemies) * 10;
    const coletadas = this.collision.BettaPowerUps(this.betta, this.powerups, this.tower);
    for (const nome of coletadas) this.hud.showToast(nome);

    this.limparInimigosDerrotados();
    this.projectiles = this.projectiles.filter((p) => p.alive);
    this.powerups = this.powerups.filter((p) => p.alive);

    this.hud.update({ tower: this.tower, betta: this.betta, score: this.score });

    this.verificarDerrota();
  }

  tratarClique() {
    const clique = this.input.consumirClique();
    if (!clique || !this.tower.canStrike()) return;
    this.tower.registerStrike(clique.x, clique.y);
    this.score += this.collision.verificarCliqueNosMobs(clique, this.enemies, this.tower) * 10;
  }

  limparInimigosDerrotados() {
    const vivos = [];
    for (const enemy of this.enemies) {
      if (enemy.alive) {
        vivos.push(enemy);
      } else if (Math.random() < enemy.dropChance) {
        this.powerups.push(this.criarPowerUp(enemy.x, enemy.y));
      }
    }
    this.enemies = vivos;
  }

  criarPowerUp(x, y) {
    const tipos = Object.keys(POWERUP_TYPES);
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    return new PowerUp({
      x,
      y,
      typeKey: tipo,
      config: POWERUP_TYPES[tipo],
      texture: this.powerupTextures[tipo],
    });
  }

  verificarDerrota() {
    if (this.tower.hp <= 0) {
      this.gameOver = true;
      this.hud.mostrarGameOver('O Titanic afundou. Os invasores tomaram o navio.', this.score, () => this.reset());
    } else if (this.betta.hp <= 0) {
      this.gameOver = true;
      this.hud.mostrarGameOver('O Betta caiu em combate. O navio ficou indefeso.', this.score, () => this.reset());
    }
  }

  render() {
    this.renderer.clear();
    this.renderer.desenharQuad(
      WORLD.width / 2,
      WORLD.height / 2,
      WORLD.width,
      WORLD.height,
      this.textures.chao,
    );
    this.desenharPeixesFundo();
    for (const decoracao of DECORACOES_CENARIO) {
      const quadro = (Math.floor(this.elapsedTime / decoracao.intervalo) + decoracao.fase) % 6;
      this.renderer.desenharQuad(
        decoracao.x,
        decoracao.baseY - decoracao.altura / 2,
        decoracao.largura,
        decoracao.altura,
        this.textures[decoracao.textura],
        [1, 1, 1, 0.9],
        decoracao.quadros[quadro],
      );
    }
    this.tower.render(this.renderer);
    for (const powerup of this.powerups) this.renderer.desenharSprite(powerup);
    this.renderer.desenharSprite(this.betta);
    for (const enemy of this.enemies) this.renderer.desenharSprite(enemy);
    for (const projectile of this.projectiles) this.renderer.desenharSprite(projectile);
    this.desenharGolpe();
  }

  desenharPeixesFundo() {
    if (this.elapsedTime < INTERVALO_PEIXES) return;
    const tempoNaPassagem = this.elapsedTime % INTERVALO_PEIXES;
    if (tempoNaPassagem >= DURACAO_PEIXES) return;

    const linha = (Math.floor(this.elapsedTime / INTERVALO_PEIXES) - 1) % QUADROS_PEIXES.length;
    const quadro = Math.floor(tempoNaPassagem / 0.16) % 6;
    const x = -130 + (WORLD.width + 260) * tempoNaPassagem / DURACAO_PEIXES;
    const alturas = [105, 100, 75];
    this.renderer.desenharQuad(x, 330, 200, alturas[linha], this.textures.peixesFundo,
      [0.7, 0.8, 1, 0.75], QUADROS_PEIXES[linha][quadro]);
  }

  desenharGolpe() {
    const golpe = this.tower.lastStrike;
    if (!golpe) return;
    const progresso = 1 - golpe.life / golpe.maxLife;
    const tamanho = golpe.radius * 2 * (0.6 + progresso * 0.4);
    const opacidade = 0.45 * (1 - progresso);
    this.renderer.desenharQuad(golpe.x, golpe.y, tamanho, tamanho, this.textures.strike,
      [0.6, 0.9, 1, opacidade]);
  }

  ajustarTamanho() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    if (this.camera) this.camera.resize(this.canvas.width, this.canvas.height);
  }
}
