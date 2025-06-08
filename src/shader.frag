#version 300 es

// 高精度の浮動小数点数を使用
precision highp float;

in vec2 v_texCoord;
in vec3 v_normal;


uniform sampler2D u_texture;
uniform vec3 u_lightDirection;

out vec4 outColor;

void main() {
	vec4 textureColor = texture(u_texture, v_texCoord);

	vec3 normal = normalize(v_normal);
	vec3 lightDir = normalize(u_lightDirection);
	

	float lightIntensity = max(dot(normal, lightDir), 0.0);
  // フラグメント（ピクセル）の色を赤に設定
	// outColor = texture(u_texture, v_texCoord);
	
	outColor = vec4(textureColor.rgb * lightIntensity, textureColor.a);
}