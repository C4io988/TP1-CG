class InputManager {
  constructor(canvas, camera) { /* registra listeners de teclado/mouse */ }
  isKeyDown(key) { }
  getMouseWorldPosition() { /* converte coordenada de tela pra coordenada de mundo, considerando a escala do viewport */ }
  consumeClick() { /* retorna a posição do último clique não-consumido, ou null */ }
}