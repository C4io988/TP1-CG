
export const LARGURA_DO_MUNDO = 1600;
export const ALTURA_DO_MUNDO = 900;

export class Camera {
  constructor(width, height) {
    this.projectionMatrix = orthoMatrix(0, LARGURA_DO_MUNDO, ALTURA_DO_MUNDO, 0, -1, 1);
    this.resize(width, height);
  }

  resize(width, height) {
    this.escalaX = Math.max(1, width) / LARGURA_DO_MUNDO;
    this.escalaY = Math.max(1, height) / ALTURA_DO_MUNDO;
  }

  telaParaMundo(x, y) {
    return {
      x: x / this.escalaX,
      y: y / this.escalaY,
    };
  }
}

// Matriz 4x4 em column-major
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
