import { Camera } from '../rendering/Camera.js';
import { Renderer } from '../rendering/Renderer.js';
import { Texture } from '../rendering/Texture.js';
import { InputManager } from '../view/systems/InputManager.js';
import { CollisionSystem } from '../view/systems/SistemaDeColisao.js';
import { SpawnManager } from '../view/systems/SpawnManager.js';
import { Betta } from '../view/entities/Betta.js';
import { Hud } from '../view/ui/Hud.js';
import { ENEMY_TYPES } from '../view/data/Mobs.js';

export class Game {
  constructor(canvas, gl, renderer, camera) {
    this.canvas = canvas;
    this.gl = gl;
    this.renderer = renderer;
    this.camera = camera;

    this.input = new InputManager(canvas, camera);
    this.collision = new CollisionSystem();
    this.spawnManager = new SpawnManager(ENEMY_TYPES);
    this.hud = new Hud();

    this.lastTime = 0;
    this.elapsedTime = 0;
    this.score = 0;
    this.gameOver = false;

    window.addEventListener('resize', () => this.ajustarTamanho());
    this.ajustarTamanho();

    this.reset();
  }

  // Fábrica assíncrona: precisa existir porque carregar os shaders
  // (fetch dos .vert/.frag) é assíncrono.
  static async create(canvas) {
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 não suportado neste navegador');

    const camera = new Camera(canvas.clientWidth, canvas.clientHeight);
    const renderer = await Renderer.create(gl, camera);

    return new Game(canvas, gl, renderer, camera);
  }

  reset() {
    const bettaTexture = Texture.fromColor(this.gl, [255, 130, 60, 255]); // laranja
    this.betta = new Betta({
      x: this.canvas.clientWidth / 2,
      y: this.canvas.clientHeight / 2,
      texture: bettaTexture,
    });

    this.enemies = [];
    this.projectiles = [];
    this.elapsedTime = 0;
    this.score = 0;
    this.gameOver = false;

    this.hud.ocultar();
    this.hud.update({ hp: this.betta.hp, maxHp: this.betta.maxHp, score: this.score });
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

    this.betta.update(dt, {
      input: this.input,
      enemies: this.enemies,
      bounds: { width: this.canvas.clientWidth, height: this.canvas.clientHeight },
    });

    for (const enemy of this.enemies) {
      enemy.update(dt, this.betta);
    }

    for (const projectile of this.projectiles) {
      projectile.update(dt);
    }

    this.spawnManager.update(dt, this.elapsedTime, this.enemies, {
      gl: this.gl,
      canvasWidth: this.canvas.clientWidth,
      canvasHeight: this.canvas.clientHeight,
    });

    const novoProjetil = this.betta.tentarAtirar(this.gl);
    if (novoProjetil) this.projectiles.push(novoProjetil);

    const clique = this.input.consumirClique();
    if (clique) {
      this.collision.verificarCliqueNosMobs(clique, this.enemies);
    }

      this.collision.verificarBettaContraMobs(this.betta, this.enemies);
      this.collision.verificarProjeteisContraMobs(this.projectiles, this.enemies);

    const defeated = this.enemies.filter((e) => !e.alive).length;
    this.score += defeated * 10;

    this.enemies = this.enemies.filter((e) => e.alive);
    this.projectiles = this.projectiles.filter((p) => p.alive);

    this.hud.update({ hp: Math.max(0, this.betta.hp), maxHp: this.betta.maxHp, score: this.score });

    if (this.betta.hp <= 0) {
      this.gameOver = true;
      this.hud.mostrarGameOver(this.score, () => this.reset());
    }
  }

  render() {
    this.renderer.clear();
    this.renderer.desenharSprite(this.betta);
    for (const enemy of this.enemies) this.renderer.desenharSprite(enemy);
    for (const projectile of this.projectiles) this.renderer.desenharSprite(projectile);
  }

  ajustarTamanho() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    if (this.camera) this.camera.resize(this.canvas.clientWidth, this.canvas.clientHeight);
  }
}
