import { Shader } from './Shader.js';

// usado quando a entidade não define um recorte específico
const UV_PADRAO = { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 };

export class Renderer {
  constructor(gl, shader, camera) {
    this.gl = gl;
    this.shader = shader;
    this.camera = camera;
    this.quadVao = createQuadVao(gl, shader);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  static async create(gl, camera) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    const shader = await Shader.loadFromFiles(gl, 'shaders/sprite.vert', 'shaders/sprite.frag');
    return new Renderer(gl, shader, camera);
  }

  clear() {
    const gl = this.gl;
    gl.disable(gl.SCISSOR_TEST);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.03, 0.09, 0.17, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  // Desenha uma entidade centralizado em (x, y)
  desenharSprite(entity) {
    const gl = this.gl;
    const { shader, camera } = this;

    shader.use();
    gl.bindVertexArray(this.quadVao);

    const width = entity.width ?? entity.size ?? 32;
    const height = entity.height ?? entity.size ?? 32;

    this.desenharQuad(entity.x, entity.y, width, height, entity.texture, entity.tint, entity.uv,
      entity.rotation ?? 0);
  }

  desenharQuad(x, y, width, height, texture, tint = [1, 1, 1, 1], uv = UV_PADRAO, rotation = 0) {
    const gl = this.gl;
    const { shader, camera } = this;
    shader.use();
    gl.bindVertexArray(this.quadVao);
    gl.uniformMatrix4fv(shader.uniformLocations.projection, false, camera.projectionMatrix);
    gl.uniformMatrix4fv(shader.uniformLocations.model, false, matrizDoModelo(x, y, width, height, rotation));
    gl.uniform4fv(shader.uniformLocations.tint, tint);
    gl.uniform2f(shader.uniformLocations.uvOffset, uv.offsetX, uv.offsetY);
    gl.uniform2f(shader.uniformLocations.uvScale, uv.scaleX, uv.scaleY);
    texture.bind(0);
    gl.uniform1i(shader.uniformLocations.texture, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
  }
}

function createQuadVao(gl, shader) {
  const vertices = new Float32Array([
    // x,    y,    u,   v
    -0.5, -0.5, 0.0, 1.0,
     0.5, -0.5, 1.0, 1.0,
     0.5,  0.5, 1.0, 0.0,

    -0.5, -0.5, 0.0, 1.0,
     0.5,  0.5, 1.0, 0.0,
    -0.5,  0.5, 0.0, 0.0,
  ]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const stride = 4 * Float32Array.BYTES_PER_ELEMENT;

  gl.enableVertexAttribArray(shader.attribLocations.position);
  gl.vertexAttribPointer(shader.attribLocations.position, 2, gl.FLOAT, false, stride, 0);

  gl.enableVertexAttribArray(shader.attribLocations.texCoord);
  gl.vertexAttribPointer(
    shader.attribLocations.texCoord, 2, gl.FLOAT, false, stride,
    2 * Float32Array.BYTES_PER_ELEMENT
  );

  gl.bindVertexArray(null);
  return vao;
}

// Translação, escala e rotação em torno do centro
function matrizDoModelo(x, y, width, height, rotation) {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return new Float32Array([
    width * cos, width * sin, 0, 0,
    -height * sin, height * cos, 0, 0,
    0, 0, 1, 0,
    x, y, 0, 1,
  ]);
}
