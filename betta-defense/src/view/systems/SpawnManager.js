import { Enemy } from '../entities/Enemy.js';
import { Texture } from '../../rendering/Texture.js';

const BASE_INTERVAL = 2; // segundos entre spawns no início do jogo
const MIN_INTERVAL = 0.4; // intervalo mínimo, mesmo depois de muito tempo

export class SpawnManager {
  constructor(enemyTypes) {
    this.enemyTypes = enemyTypes;
    this.timer = 0;
    this.textureCache = new Map();
  }

  update(dt, elapsedGameTime, enemyList, { gl, world }) {
    this.timer += dt;

    const interval = this.obterIntervaloDeSpawn(elapsedGameTime);
    if (this.timer < interval) return;

    this.timer = 0;
    enemyList.push(this.gerarMobs(gl, elapsedGameTime, world));
  }

  // Reduz o intervalo aos poucos conforme o tempo passa
  obterIntervaloDeSpawn(elapsedGameTime) {
    const reduced = BASE_INTERVAL - elapsedGameTime * 0.014;
    return Math.max(MIN_INTERVAL, reduced);
  }

  gerarMobs(gl, elapsedGameTime, world) {
    const typeKey = this.pickType(elapsedGameTime);
    const type = this.enemyTypes[typeKey];

    const { x, y } = this.SpawnRandonMobs(world, type.size);
    const texture = this.getTexture(gl, typeKey, type.cor);

    return new Enemy({ x, y, texture, type, typeKey });
  }

    // Só sorteia entre os tipos já liberados pelo tempo de jogo
  pickType(elapsedGameTime) {
    const available = Object.keys(this.enemyTypes)
      .filter((key) => elapsedGameTime >= (this.enemyTypes[key].tempoMinimo ?? 0));
    return available[Math.floor(Math.random() * available.length)];
  }

  // A torre fica no canto superior direito, então os inimigos entram
  // pela borda esquerda e pela parte de baixo, atravessando o mapa.
  SpawnRandonMobs(world, size) {
    const margin = size;
    const roll = Math.random();

    if (roll < 0.6) {
      // borda esquerda inteira
      return { x: -margin, y: Math.random() * world.height };
    }
    // borda inferior, favorecendo o lado esquerdo/central
    return {
      x: Math.random() * world.width * 0.75,
      y: world.height + margin,
    };
  }
/*
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
*/

  // Evita recriar uma textura por inimigo spawnado
  getTexture(gl, typeKey, color) {
    if (!this.textureCache.has(typeKey)) {
      this.textureCache.set(typeKey, Texture.fromColor(gl, color));
    }
    return this.textureCache.get(typeKey);
  }
}


// Cor placeholder por tipo, só pra diferenciar visualmente até terem sprites reais
function corDoTipo(typeKey) {
  const palette = {
    pequenoPeixe: [120, 200, 255, 255],
    tubarao: [180, 60, 60, 255],
  };
  return palette[typeKey] ?? [200, 200, 200, 255];
}
