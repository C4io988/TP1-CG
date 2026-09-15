export class Shader {
  constructor(gl, vertexSource, fragmentSource) {
    this.gl = gl;
    this.program = createProgram(gl, vertexSource, fragmentSource);
    this.attribLocations = {
      position: gl.getAttribLocation(this.program, 'a_position'),
      texCoord: gl.getAttribLocation(this.program, 'a_texCoord'),
    };
    this.uniformLocations = {
      projection: gl.getUniformLocation(this.program, 'u_projection'),
      model: gl.getUniformLocation(this.program, 'u_model'),
      texture: gl.getUniformLocation(this.program, 'u_texture'),
    };
  }

  use() {
    this.gl.useProgram(this.program);
  }

  // Busca os arquivos .vert/.frag via fetch (por isso o jogo precisa
  // rodar num servidor local, não direto pelo file://).
  static async loadFromFiles(gl, vertUrl, fragUrl) {
    const [vertSource, fragSource] = await Promise.all([
      fetch(vertUrl).then((r) => r.text()),
      fetch(fragUrl).then((r) => r.text()),
    ]);
    return new Shader(gl, vertSource, fragSource);
  }
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Erro ao compilar shader: ${info}`);
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    throw new Error(`Erro ao linkar programa: ${info}`);
  }

  return program;
}
