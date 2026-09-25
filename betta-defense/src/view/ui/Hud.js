// Limites reais dos desenhos na imagem (os quadros não têm largura igual).
const BETTA_FRAMES = [[21, 410, 221, 102], [242, 410, 211, 101], [454, 413, 202, 97], [656, 413, 198, 97], [858, 415, 196, 93], [1056, 417, 197, 90], [1257, 416, 196, 91], [1454, 415, 198, 92]];
const TITANIC_FRAMES = [[13, 412, 210, 119], [224, 411, 207, 120], [431, 411, 207, 120], [641, 412, 202, 119], [847, 412, 203, 119], [1053, 411, 205, 120], [1260, 412, 201, 121], [1465, 412, 199, 121]];
const SEGMENTOS_DIGITAIS = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
const BARRAS_DIGITAIS = [[2, 0, 4, 2], [6, 2, 2, 5], [6, 9, 2, 5], [2, 14, 4, 2], [0, 9, 2, 5], [0, 2, 2, 5], [2, 7, 4, 2]];

export class Hud {
    constructor() {
        this.hudElement = document.getElementById('hud');
        this.scoreValue = document.getElementById('score-value');
        this.bettaLifeArt = document.getElementById('betta-life-art');
        this.towerLifeArt = document.getElementById('tower-life-art');
        this.bettaLifeContext = this.bettaLifeArt.getContext('2d');
        this.towerLifeContext = this.towerLifeArt.getContext('2d');
        this.bettaLifeImage = new Image();
        this.bettaLifeImage.src = 'assets/images/betta/hud_vida_betta.png';
        this.towerLifeImage = new Image();
        this.towerLifeImage.src = 'assets/images/titanic/hud_vida_titanic.png';
        this.scoreArt = document.getElementById('score-art');
        this.scoreContext = this.scoreArt.getContext('2d');
        this.scoreAtual = 0;
        this.scoreImage = new Image();
        this.scoreImage.onload = () => this.desenharScore();
        this.scoreImage.src = 'assets/images/hud_score.png';
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.gameOverMessage = document.getElementById('game-over-message');
        this.restartBtn = document.getElementById('restart-btn');
        this.menuBtn = document.getElementById('menu-btn');
        this.startScreen = document.getElementById('start-screen');
    }

    ocultar() {
        this.gameOverScreen.style.display = 'none';
    }

    update({ tower, betta, score }) {
        const bettaHp = Math.max(0, Math.floor(betta.hp));
        const bettaMaxHp = betta.maxHp || 100;
        const towerHp = Math.max(0, Math.floor(tower.hp));
        const towerMaxHp = tower.maxHp || 400;

        const pontuacao = Math.max(0, Math.floor(score));
        this.scoreValue.textContent = pontuacao.toLocaleString('pt-BR');
        if (this.scoreAtual !== pontuacao) {
            this.scoreAtual = pontuacao;
            this.desenharScore();
        }
        this.atualizarArteVidaBetta(bettaHp, bettaMaxHp);
        this.atualizarArteVidaTitanic(towerHp, towerMaxHp);
    }

    desenharScore() {
        if (!this.scoreImage.complete || this.scoreImage.naturalWidth === 0) return;

        const contexto = this.scoreContext;
        contexto.clearRect(0, 0, this.scoreArt.width, this.scoreArt.height);
        contexto.imageSmoothingEnabled = false;
        contexto.drawImage(this.scoreImage, 21, 360, 265, 209, 5, 6, 110, 87);
        // Cobre a estrela do primeiro quadro com a mesma área de um quadro sem brilho.
        contexto.drawImage(this.scoreImage, 1172, 380, 55, 58, 29, 14, 23, 24);

        const digitos = String(this.scoreAtual);
        const largura = digitos.length * 10 - 2;
        const escala = Math.min(1, 62 / largura);
        contexto.save();
        contexto.translate(70 - largura * escala / 2, 61);
        contexto.scale(escala, escala);
        contexto.fillStyle = '#d7f4ff';
        contexto.shadowColor = '#7bc8ff';
        contexto.shadowBlur = 2;
        for (let i = 0; i < digitos.length; i++) {
            const acesos = SEGMENTOS_DIGITAIS[Number(digitos[i])];
            for (let barra = 0; barra < 7; barra++) {
                if (!acesos.includes('abcdefg'[barra])) continue;
                const [x, y, larguraBarra, alturaBarra] = BARRAS_DIGITAIS[barra];
                contexto.fillRect(i * 10 + x, y, larguraBarra, alturaBarra);
            }
        }
        contexto.restore();
    }

    atualizarArteVidaTitanic(hp, maxHp) {
        this.atualizarArteVida(this.towerLifeArt, this.towerLifeContext, this.towerLifeImage, hp, maxHp);
    }

    atualizarArteVidaBetta(hp, maxHp) {
        this.atualizarArteVida(this.bettaLifeArt, this.bettaLifeContext, this.bettaLifeImage, hp, maxHp);
    }

    atualizarArteVida(arte, contexto, imagem, hp, maxHp) {
        if (!imagem.complete || imagem.naturalWidth === 0) return;

        const proporcao = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
        const quadro = hp === 0 ? 7 : Math.min(6, Math.floor((1 - proporcao) * 7));
        const personagem = arte === this.bettaLifeArt ? 'do Betta' : 'do Titanic';
        arte.setAttribute('aria-label', `Vida ${personagem}: ${hp} de ${maxHp}`);
        if (arte.dataset.lifeFrame === String(quadro)) return;

        const betta = arte === this.bettaLifeArt;
        const [x, y, largura, altura] = (betta ? BETTA_FRAMES : TITANIC_FRAMES)[quadro];

        contexto.clearRect(0, 0, arte.width, arte.height);
        contexto.imageSmoothingEnabled = false;
        contexto.drawImage(
            imagem,
            x, y, largura, altura,
            2, betta ? 14 : 5, 156, betta ? 72 : 89,
        );
        arte.dataset.lifeFrame = String(quadro);
    }

    mostrarGameOver(mensagem, score, callbackReiniciar, callbackMenu) {
        this.hudElement.style.display = 'none'; 
        
        // 2. Mostra a tela cheia escura de Game Over
        this.gameOverScreen.style.display = 'flex'; 
        
        // 3. Procura se já criámos o texto da pontuação antes. Se não, cria agora.
        let painelPontuacao = document.getElementById('painel-pontuacao');
        if (!painelPontuacao) {
            painelPontuacao = document.createElement('div');
            painelPontuacao.id = 'painel-pontuacao';
            painelPontuacao.style.textAlign = 'center';
            painelPontuacao.style.marginBottom = '30px';
            // Insere a pontuação logo antes do botão de reiniciar
            this.gameOverScreen.insertBefore(painelPontuacao, this.restartBtn);
        }

        this.gameOverMessage.textContent = mensagem;
        painelPontuacao.textContent = `Pontuação final: ${Math.floor(score).toLocaleString('pt-BR')}`;
        
        // 5. Configura o botão Reiniciar
        this.restartBtn.onclick = () => {
            this.hudElement.style.display = 'flex';
            this.gameOverScreen.style.display = 'none'; 
            if (callbackReiniciar) callbackReiniciar(); 
        };

        this.menuBtn.onclick = () => {
            this.hudElement.style.display = 'none';
            this.gameOverScreen.style.display = 'none';
            this.startScreen.style.display = 'flex';
            if (callbackMenu) callbackMenu();
        };
    }

    showToast(nomeDoPowerUp) {
        // Efeito visual rápido quando o Betta coleta um PowerUp
        const toast = document.createElement('div');
        toast.innerText = "+ " + nomeDoPowerUp;
        toast.style.position = 'absolute';
        toast.style.left = '50%';
        toast.style.top = '20%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.color = '#3498db';
        toast.style.fontWeight = 'bold';
        toast.style.fontSize = '24px';
        toast.style.zIndex = '50';
        toast.style.pointerEvents = 'none';
        toast.style.textShadow = '2px 2px 0 #000';
        toast.style.transition = 'all 1s ease-out';
        
        document.getElementById('game-container').appendChild(toast);
        
        setTimeout(() => {
            toast.style.top = '10%';
            toast.style.opacity = '0';
        }, 50);

        setTimeout(() => {
            toast.remove();
        }, 1050);
    }
}
