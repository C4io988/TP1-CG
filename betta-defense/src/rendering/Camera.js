// Projeção ortográfica: o mundo do jogo é tratado em coordenadas de
// pixel da tela, com (0,0) no canto superior esquerdo e Y crescendo
// para baixo (como o mouse/CSS). A matriz converte isso para o espaço
// de clip do WebGL (-1 a 1, Y crescendo para cima).
export class Camera {
  constructor(width, height) {
    this.resize(width, height);
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.projectionMatrix = orthoMatrix(0, width, height, 0, -1, 1);
  }
}

// Matriz 4x4 em column-major, como o WebGL espera.
function orthoMatrix(left, right, bottom, top, near, far) {
  const rl = right - left;
  const tb = top - bottom;
  const fn = far - near;

  return new Float32Array([
    2 / rl, 0, 0, 0,
    0, 2 / tb, 0, 0,
    0, 0, -2 / fn, 0,
    -(right + left) / rl, -(top + bottom) / tb, -(far + near) / fn, 1,
  ]);
}
