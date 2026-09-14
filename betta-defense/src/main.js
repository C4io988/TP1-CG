window.onload = () => {
    const canvas = document.getElementById('game-canvas');
    
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.error("WebGL 2 não é suportado neste navegador.");
        return;
    }

    console.log("Contexto WebGL 2 inicializado com sucesso.");

    // Ajusta o tamanho do canvas para ocupar a tela toda
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Configuração de cor de fundo inicial (Azul escuro do fundo do mar)
    gl.clearColor(0.0, 0.1, 0.2, 1.0);

    // Loop de Jogo
    let lastTime = 0;
    function gameLoop(timestamp) {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        gl.clear(gl.COLOR_BUFFER_BIT);
        
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
};