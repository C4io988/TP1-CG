export class CollisionSystem {
  verificarBettaContraMobs(betta, enemies) {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      if (enemy.attackCooldown > 0) continue;

      if (this.colisao(betta, enemy)) {
        betta.receberDano(enemy.contactDamage);
        enemy.attackCooldown = 1; // 1s entre ataques de contato do mesmo inimigo
      }
    }
  }

  verificarProjeteisContraMobs(projectiles, enemies) {
    for (const projectile of projectiles) {
      if (!projectile.alive) continue;

      for (const enemy of enemies) {
        if (!enemy.alive) continue;

        if (this.colisao(projectile, enemy)) {
          enemy.receberDano(projectile.damage);
          projectile.alive = false;
          break;
        }
      }
    }
  }

  // Mecânica da "dedada": clicar num inimigo tira vida dele diretamente
  verificarCliqueNosMobs(clickPos, enemies) {
    const CLICK_DAMAGE = 8;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const dist = Math.hypot(enemy.x - clickPos.x, enemy.y - clickPos.y);
      if (dist <= enemy.radius) {
        enemy.receberDano(CLICK_DAMAGE);
        break;
      }
    }
  }

  colisao(a, b) {
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    return dist <= (a.radius ?? 16) + (b.radius ?? 16);
  }
}
