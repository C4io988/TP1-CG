import { Enemy } from '../entities/Enemy.js';
import { Texture } from '../../rendering/Texture.js';

const BASE_INTERVAL = 2; // segundos entre spawns no início do jogo
const MIN_INTERVAL = 0.4; // intervalo mínimo, mesmo depois de muito tempo

export class SpawnManager {
  constructor(enemyTypes) {
    this.enemyTypes = enemyTypes;
    this.timer = 0;
  }

  update(dt, elapsedGameTime, enemyList, { gl, canvasWidth, canvasHeight }) {
    this.timer += dt;

    const interval = this.obterIntervaloDeSpawn(elapsedGameTime);
    if (this.timer < interval) return;

    this.timer = 0;
    enemyList.push(this.gerarMobs(gl, canvasWidth, canvasHeight));
  }

  // Reduz o intervalo aos poucos conforme o tempo passa
  obterIntervaloDeSpawn(elapsedGameTime) {
    const reduced = BASE_INTERVAL - elapsedGameTime * 0.02;
    return Math.max(MIN_INTERVAL, reduced);
  }

  gerarMobs(gl, canvasWidth, canvasHeight) {
    const typeKeys = Object.keys(this.enemyTypes);
    const typeKey = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const type = this.enemyTypes[typeKey];

    const { x, y } = this.obterPosicaoNaBorda(canvasWidth, canvasHeight);
    const texture = Texture.fromColor(gl, corDoTipo(typeKey));

    return new Enemy({ x, y, texture, type });
  }

  obterPosicaoNaBorda(width, height) {
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: return { x: Math.random() * width, y: -20 };          // topo
      case 1: return { x: width + 20, y: Math.random() * height };  // direita
      case 2: return { x: Math.random() * width, y: height + 20 };  // baixo
      default: return { x: -20, y: Math.random() * height };        // esquerda
    }
  }
}

// Cor placeholder por tipo, só pra diferenciar visualmente até terem
// sprites reais (o campo `texture` do enemyTypes.js já está pronto pra
// quando trocarmos Texture.fromColor por Texture.fromImage).
function corDoTipo(typeKey) {
  const palette = {
    pequenoPeixe: [120, 200, 255, 255],
    tubarao: [180, 60, 60, 255],
  };
  return palette[typeKey] ?? [200, 200, 200, 255];
}
