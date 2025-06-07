import "./style.css";
// シェーダーファイルを文字列としてインポート
import vertexShaderSource from "./shader.vert?raw";
import fragmentShaderSource from "./shader.frag?raw";

// シェーダーをコンパイルするヘルパー関数
const createShader = (
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error("Failed to create shader.");
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // コンパイルエラーのチェック
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

// シェーダープログラムを作成・リンクするヘルパー関数
const createProgram = (
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram | null => {
  const program = gl.createProgram();
  if (!program) {
    console.error("Failed to create program.");
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // リンクエラーのチェック
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(program),
    );
    gl.deleteProgram(program);
    return null;
  }

  return program;
};

const setupTexture = (
  gl: WebGL2RenderingContext,
  imageUrl: string,
  callback: (texture: WebGLTexture) => void,
) => {
  const texture = gl.createTexture();

  if (!texture) {
    console.error("Failed to create texture.");
    return;
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([
      0, 0,
      255, 255,
    ]),
  );

  const image = new Image();
  image.src = imageUrl;
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    callback(texture);
  };
  image.onerror = (err) => {
    console.error("Failed to load image.", err);
  };
};

const main = () => {
  const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }

  const gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("Your browser does not support WebGL 2.0");
    return;
  }

  // シェーダーの作成
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );

  if (!vertexShader || !fragmentShader) return;

  // プログラムの作成
  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) return;

  // ===== attributeとuniformの場所を取得 =====
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
  const textureUniformLocation = gl.getUniformLocation(program, "u_texture");

  // 頂点データを設定
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // 三角形の頂点座標
  const positions = [
    // 1つ目の三角形
    -0.5, 0.5, // 左上
    -0.5, -0.5, // 左下
    0.5, 0.5, // 右上
    // 2つ目の三角形
    -0.5, -0.5, // 左下
    0.5, -0.5, // 右下
    0.5, 0.5, // 右上
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  /*  const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  const colors = [
    1.0, 0.0,
    0.0, 0.0,
    1.0, 0.0,
    0.0, 0.0,
    1.0,
  ]; */

  const textCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textCoordBuffer);
  // 各頂点に対応するテクスチャ座標を追加
  const texCoords = [
    // 1つ目の三角形
    0.0, 1.0, // 左上
    0.0, 0.0, // 左下
    1.0, 1.0, // 右上
    // 2つ目の三角形
    0.0, 0.0, // 左下
    1.0, 0.0, // 右下
    1.0, 1.0, // 右上
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  setupTexture(gl, "/sample.png", (texture) => {
    // 描画処理
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.8, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(texCoordAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, textCoordBuffer);
    gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.uniform1i(textureUniformLocation, 0);

    //色情報のattibuteを有効化
    /*   gl.enableVertexAttribArray(colorAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); //色バッファをバインド
  gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0); */

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });
};

window.onload = main;
