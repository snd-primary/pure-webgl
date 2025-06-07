#version 300 es

// 高精度の浮動小数点数を使用
precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
  // フラグメント（ピクセル）の色を赤に設定
	outColor = texture(u_texture, v_texCoord);
}