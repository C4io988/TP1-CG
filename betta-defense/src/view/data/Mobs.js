export const TIPOS_DE_MOBS = {
  sardinha: {
    hp: 12, speed: 115, contactDamage: 4, size: 26,
    alvo: 'betta', dropChance: 0.10, tempoMinimo: 0,
    imagem: 'assets/images/Mobs/sardinha.png',
    cor: [120, 200, 255, 255],
  },
  piranha: {
    hp: 28, speed: 85, contactDamage: 9, size: 38,
    alvo: 'betta', dropChance: 0.18, tempoMinimo: 18,
    imagem: 'assets/images/enemies/piranha_nado_sheet.png',
    cor: [180, 90, 200, 255],
  },
  tubarao: {
    hp: 55, speed: 80, contactDamage: 14, size: 64,
    alvo: 'torre', dropChance: 0.25, tempoMinimo: 0,
    imagem: 'assets/images/enemies/tubarao_nado_ataque_sheet.png',
    cor: [190, 70, 70, 255],
  },
  lula: {
    hp: 110, speed: 60, contactDamage: 22, size: 92,
    alvo: 'torre', dropChance: 0.45, tempoMinimo: 40,
    imagem: 'assets/images/enemies/lula_animacao_sheet.png',
    cor: [80, 150, 120, 255],
  },
};
