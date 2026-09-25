// Power-ups do betta e da torre
// Coletados nadando por cima com o Betta.
export const POWERUP_TYPES = {
  cadencia: {
    label: 'Cadência +',
    color: [255, 220, 90, 255],
    sprite: [49, 265, 290, 304],
    apply: (tower) => {
      tower.fireRate = Math.max(0.12, tower.fireRate * 0.85);
      tower.upgrades.cadencia += 1;
    },
  },
  dano: {
    label: 'Dano +',
    color: [255, 120, 60, 255],
    sprite: [369, 265, 288, 304],
    apply: (tower) => {
      tower.damage = Math.round(tower.damage * 1.25 + 1);
      tower.upgrades.dano += 1;
    },
  },
  area: {
    label: 'Área +',
    color: [140, 120, 255, 255],
    sprite: [693, 265, 290, 304],
    apply: (tower) => {
      tower.strikeRadius += 18;
      tower.strikeDamage = Math.round(tower.strikeDamage * 1.2 + 1);
      tower.upgrades.area += 1;
    },
  },
  reparo: {
    label: 'Reparo do casco',
    color: [110, 240, 150, 255],
    sprite: [1016, 265, 290, 304],
    apply: (tower) => {
      tower.hp = Math.min(tower.maxHp, tower.hp + 60);
    },
  },
  racao: {
    label: 'Ração do Betta',
    color: [255, 170, 210, 255],
    sprite: [1339, 265, 290, 304],
    apply: (_tower, betta) => {
      betta.hp = Math.min(betta.maxHp, betta.hp + 35);
    },
  },
};
