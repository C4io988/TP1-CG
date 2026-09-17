export class CollisionSystem {
  verificarBettaContraMobs(tower, betta, enemies) {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      if (enemy.attackCooldown > 0) continue;

      const alvo = enemy.targetKind === 'tower' || enemy.alvo === 'torre' ? tower : betta;
      if (this.colisao(alvo, enemy)) {
        alvo.receberDano(enemy.contactDamage);
        enemy.attackCooldown = 1; // 1s entre ataques de contato do mesmo inimigo
      }
    }
  }

  verificarProjeteisContraMobs(projectiles, enemies) {
    let derrotados = 0;
    for (const projectile of projectiles) {
      if (!projectile.alive) continue;

      for (const enemy of enemies) {
        if (!enemy.alive) continue;

        if (this.colisao(projectile, enemy)) {
          enemy.receberDano(projectile.damage);
          projectile.alive = false;
          if (!enemy.alive) derrotados += 1;
          break;
        }
      }
    }
    return derrotados;
  }

  //clicar num inimigo tira vida dele diretamente
  verificarCliqueNosMobs(clickPos, enemies, tower) {
    let killed = 0;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const dist = Math.hypot(enemy.x - clickPos.x, enemy.y - clickPos.y);
      if (dist <= tower.strikeRadius + enemy.radius) {
        enemy.receberDano(tower.strikeDamage);
        if(!enemy.alive) killed += 1;
      }
    }
    return killed;
  }

    // O Betta coleta nadando por cima
  BettaPowerUps(betta, powerups, tower) {
    const collected = [];

    for (const powerup of powerups) {
      if (!powerup.alive) continue;

      if (this.colisao(betta, powerup)) {
        powerup.config.apply(tower, betta);
        powerup.alive = false;
        collected.push(powerup.config.label);
      }
    }
    return collected;
  }

  colisao(a, b) {
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    return dist <= (a.radius ?? 16) + (b.radius ?? 16);
  }
}
