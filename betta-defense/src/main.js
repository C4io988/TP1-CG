import { Game } from './core/Game.js';

const canvas = document.getElementById('game-canvas');
const game = await Game.create(canvas);
game.start();
