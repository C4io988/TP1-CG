export class Texture {
  constructor(gl, glTexture) {
    this.gl = gl;
    this.glTexture = glTexture;
  }

  bind(unit = 0) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
  }

  // Cria uma textura 1x1 de cor sólida 
  static fromColor(gl, [r, g, b, a] = [255, 0, 128, 255]) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([r, g, b, a])
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return new Texture(gl, tex);
  }

  // Gera uma pequena textura de bolha sem depender de um arquivo de imagem.
  static fromBubble(gl, size = 24) {
    const pixels = new Uint8Array(size * size * 4);
    const centro = (size - 1) / 2;
    const raio = size * 0.42;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const distancia = Math.hypot(x - centro, y - centro) / raio;
        const contorno = distancia >= 0.72 && distancia <= 1;
        const interior = distancia < 0.72;
        const brilho = Math.hypot(x - size * 0.35, y - size * 0.32) < size * 0.09;
        const indice = (y * size + x) * 4;

        pixels[indice] = brilho ? 245 : 115;
        pixels[indice + 1] = brilho ? 255 : 215;
        pixels[indice + 2] = 255;
        pixels[indice + 3] = brilho ? 255 : contorno ? 230 : interior ? 42 : 0;
      }
    }

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return new Texture(gl, tex);
  }

  // Carrega uma imagem real — usar isso quando os assets (sprites) do
  // Betta/inimigos/armas estiverem prontos em assets/images/...
  static fromImage(gl, url, { pixelated = false } = {}) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // pixel branco 1x1 temporário até a imagem carregar de fato
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

    const image = new Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    };
    image.src = url;

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const filter = pixelated ? gl.NEAREST : gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);

    return new Texture(gl, tex);
  }
}
