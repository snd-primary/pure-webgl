#version 300 es

// 頂点シェーダーの入力（頂点属性）
in vec3 a_position;
// in vec3 a_color;
in vec2 a_texCoord;

in vec3 a_normal;

uniform mat4 u_mvpMatrix;
uniform mat4 u_normalMatrix;

out vec2 v_texCoord;
out vec3 v_normal;

void main() {
  // 頂点のクリップ空間座標を設定
  gl_Position = u_mvpMatrix * vec4(a_position,  1.0);
	v_texCoord = a_texCoord;
	
	v_normal = normalize(vec3(u_normalMatrix * vec4(a_normal, 0.0)));
}
