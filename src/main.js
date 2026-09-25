import { Game } from './core/Game.js?v=7';

window.onload = async () => {
    const canvas = document.getElementById('game-canvas');
    const game = await Game.create(canvas);
    
    window.addEventListener('resize', () => game.handleResize());
    game.handleResize();

    // Captura os elementos da interface
    const startScreen = document.getElementById('start-screen');
    const creditsScreen = document.getElementById('credits-screen');
    const hud = document.getElementById('hud');
    
    const btnPlay = document.getElementById('btn-play');
    const btnCredits = document.getElementById('btn-credits');
    const btnBack = document.getElementById('btn-back');
    const soundToggle = document.getElementById('sound-toggle');

    soundToggle.addEventListener('click', () => {
        const somAtivo = game.toggleSound();
        soundToggle.classList.toggle('is-on', somAtivo);
        soundToggle.setAttribute('aria-pressed', String(somAtivo));
        soundToggle.setAttribute('aria-label', somAtivo ? 'Desativar som' : 'Ativar som');
        soundToggle.title = somAtivo ? 'Desativar som' : 'Ativar som';
    });

    // Navegação do Menu
    btnPlay.addEventListener('click', () => {
        startScreen.style.display = 'none';
        hud.style.display = 'flex';
        game.start(); // O WebGL só começa a renderizar e calcular o loop aqui
    });

    btnCredits.addEventListener('click', () => {
        startScreen.style.display = 'none';
        creditsScreen.style.display = 'flex';
    });

    btnBack.addEventListener('click', () => {
        creditsScreen.style.display = 'none';
        startScreen.style.display = 'flex';
    });

    // Mantém a capa WebGL animada enquanto o menu está aberto.
    game.startMenuAnimation();
};
