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
      chao: Texture.fromImage(gl, 'assets/images/cenario/chao.png'),
      tower: Texture.fromImage(gl, 'assets/images/titanic/titanic.jpg'),
      betta: Texture.fromColor(gl, [255, 110, 50, 255]),
      bettaProjectile: Texture.fromColor(gl, [255, 240, 120, 255]),
      towerProjectile: Texture.fromColor(gl, [255, 245, 200, 255]),
      strike: Texture.fromColor(gl, [255, 255, 255, 255]),
    };
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
      x: WORLD.width - 170,
      y: 215,
      texture: this.textures.tower,
      projectileTexture: this.textures.towerProjectile,
    });
    this.betta = new Betta({
      x: WORLD.width * 0.55,
      y: WORLD.height * 0.6,
      gl: this.gl,
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
    this.renderer.desenharSprite(this.tower);
    for (const powerup of this.powerups) this.renderer.desenharSprite(powerup);
    this.renderer.desenharSprite(this.betta);
    for (const enemy of this.enemies) this.renderer.desenharSprite(enemy);
    for (const projectile of this.projectiles) this.renderer.desenharSprite(projectile);
    this.desenharGolpe();
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