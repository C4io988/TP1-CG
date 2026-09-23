export class Hud {
    constructor() {
        this.hudElement = document.getElementById('hud');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.gameOverText = this.gameOverScreen.querySelector('h1');
        this.restartBtn = document.getElementById('restart-btn');
    }

    ocultar() {
        this.gameOverScreen.style.display = 'none';
    }

    update({ tower, betta, score }) {
        // Trava a vida em 0 para não aparecer números negativos
        const towerHp = Math.max(0, Math.floor(tower.hp));
        const bettaHp = Math.max(0, Math.floor(betta.hp));
        
        // Pega os status dinâmicos caso existam na sua arma
        let armaInfo = "";
        if (betta.gun) {
            armaInfo = `<div style="font-size: 18px; margin-top: 10px; color: #ffeb3b;">
                Cadência: ${betta.gun.fireRate || 0} | Dano: ${betta.gun.damage || 0}
            </div>`;
        }

        // Atualiza SÓ os textos da HUD no canto esquerdo
        this.hudElement.innerHTML = `
            <div>Titanic: ${towerHp} / ${tower.maxHp || 400}</div>
            <div>Betta: ${bettaHp} / ${betta.maxHp || 100}</div>
            <div>Pontos: ${Math.floor(score)}</div>
            ${armaInfo}
        `;
    }

    mostrarGameOver(mensagem, score, callbackReiniciar) {
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

        painelPontuacao.innerHTML = `
            <p style="font-size: 1.5rem; color: #fff; margin-bottom: 10px;">${mensagem}</p>
            <p style="font-size: 2.5rem; color: #ffeb3b; font-weight: bold; margin: 0;">Pontuação Final: ${Math.floor(score)}</p>
        `;
        
        // 5. Configura o botão Reiniciar
        this.restartBtn.onclick = () => {
            this.hudElement.style.display = 'block'; 
            this.gameOverScreen.style.display = 'none'; 
            if (callbackReiniciar) callbackReiniciar(); 
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
