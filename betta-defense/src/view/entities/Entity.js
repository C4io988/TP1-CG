class Entity {
  constructor({ x, y, texture, hp }) { /* posição, textura, hp, alive = true */ }
  update(dt) { /* sobrescrito pelas subclasses */ }
  render(renderer) { /* pede pro Renderer desenhar seu quad com sua textura/transform */ }
  getBounds() { /* retorna { x, y, radius } — usado pela colisão */ }
  takeDamage(amount) { /* reduz hp, marca alive=false se <= 0 */ }
}