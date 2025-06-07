#version 300 es

// 頂点シェーダーの入力（頂点属性）
in vec2 a_position;
// in vec3 a_color;
in vec2 a_texCoord;

out vec2 v_texCoord;

void main() {
  // 頂点のクリップ空間座標を設定
  gl_Position = vec4(a_position, 0.0, 1.0);
	v_texCoord = a_texCoord;
}
