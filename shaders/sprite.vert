#version 300 es
in vec2 a_position;
in vec2 a_texCoord;
uniform mat4 u_projection;
uniform mat4 u_model;
uniform vec2 u_uvOffset;
uniform vec2 u_uvScale;
out vec2 v_texCoord;
void main() {
  gl_Position = u_projection * u_model * vec4(a_position, 0.0, 1.0);
  v_texCoord = u_uvOffset + a_texCoord * u_uvScale;
}
