class Game {
  constructor(canvas) { /* cria GLContext, StateMachine, Camera */ }
  start() { /* inicia o loop de requestAnimationFrame */ }
  loop(timestamp) { /* calcula dt, chama update/render, agenda próximo frame */ }
  handleResize() { /* recalcula escala do viewport mantendo aspect ratio */ }
}