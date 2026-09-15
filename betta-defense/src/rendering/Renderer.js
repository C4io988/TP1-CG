import { Shader } from './Shader.js';

export class Renderer {
  constructor(gl, shader, camera) {
    this.gl = gl;
    this.shader = shader;
    this.camera = camera;
    this.quadVao = createQuadVao(gl, shader);
  }

  static async create(gl, camera) {
    const shader = await Shader.loadFromFiles(gl, 'shaders/sprite.vert', 'shaders/sprite.frag');
    return new Renderer(gl, shader, camera);
  }

  clear() {
    const gl = this.gl;
    gl.clearColor(0.04, 0.08, 0.16, 1.0); // azul escuro de oceano
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  // Desenha uma entidade como um quad texturizado, centralizado em (x, y)
  desenharSprite(entity) {
    const gl = this.gl;
    const { shader, camera } = this;

    shader.use();
    gl.bindVertexArray(this.quadVao);

    const size = entity.size ?? 32;
    const modelMatrix = matrizDoModelo(entity.x, entity.y, size, size);

    gl.uniformMatrix4fv(shader.uniformLocations.projection, false, camera.projectionMatrix);
    gl.uniformMatrix4fv(shader.uniformLocations.model, false, modelMatrix);

    entity.texture.bind(0);
    gl.uniform1i(shader.uniformLocations.texture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
  }
}

function createQuadVao(gl, shader) {
  // Quad de -0.5 a 0.5 (espaço "unitário"), escalado depois pelo model
  // matrix. Dois triângulos formando um retângulo, com posição (x,y) e
  // texCoord (u,v) intercalados por vértice.
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

// Translação + escala (sem rotação — suficiente para o MVP)
function matrizDoModelo(x, y, width, height) {
  return new Float32Array([
    width, 0, 0, 0,
    0, height, 0, 0,
    0, 0, 1, 0,
    x, y, 0, 1,
  ]);
}
