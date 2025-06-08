import "./style.css";
// シェーダーファイルを文字列としてインポート
import vertexShaderSource from "./shader.vert?raw";
import fragmentShaderSource from "./shader.frag?raw";

import { mat4 } from "gl-matrix";

type ProgramInfo = {
  program: WebGLProgram;
  attribLocations: {
    position: number;
    texCoord: number;
    normal: number;
  };
  uniformLocations: {
    mvpMatrix: WebGLUniformLocation | null;
    texture: WebGLUniformLocation | null;
    normalMatrix: WebGLUniformLocation | null;
    lightDirection: WebGLUniformLocation | null;
  };
};

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
      0, 0, 255,
      255,
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

  const programInfo: ProgramInfo = {
    program: program,
    attribLocations: {
      position: gl.getAttribLocation(program, "a_position"),
      texCoord: gl.getAttribLocation(program, "a_texCoord"),
      normal: gl.getAttribLocation(program, "a_normal"),
    },
    uniformLocations: {
      mvpMatrix: gl.getUniformLocation(program, "u_mvpMatrix"),
      texture: gl.getUniformLocation(program, "u_texture"),
      normalMatrix: gl.getUniformLocation(program, "u_normalMatrix"),
      lightDirection: gl.getUniformLocation(program, "u_lightDirection"),
    },
  };

  // 頂点データを設定
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // 立方体の頂点座標 (3次元)
  const positions = [
    // Front face
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    -1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, -1.0, -1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  //テクスチャのデータをバッファに書き込む
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

  // 各面に対応するテクスチャ座標
  const texCoords = [
    // Front
    0.0, 0.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 0.0, 1.0,
    1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 0.0, 1.0,
    1.0, 0.0, 1.0, // Top
    0.0, 0.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 0.0, 1.0,
    1.0, 0.0, 1.0, // Bottom
    0.0, 0.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 0.0, 1.0,
    1.0, 0.0, 1.0, // Right
    0.0, 0.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 0.0, 1.0,
    1.0, 0.0, 1.0, // Left
    0.0, 0.0, 1.0,
    0.0, 1.0, 1.0,
    0.0, 0.0, 1.0,
    1.0, 0.0, 1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  // 立方体の各頂点の法線ベクトル
  const normals = [
    // Front face
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    // Back face
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,

    // Top face
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,

    // Bottom face
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,

    // Right face
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,

    // Left face
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
  ];

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  setupTexture(gl, "/sample.png", (texture) => {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    let cubeRotation = 0.0;
    let then = 0;

    const render = (now: number) => {
      now *= 0.001;
      const deltaTime = now - then;
      then = now;

      drawScene(
        gl,
        programInfo,
        program,
        { positionBuffer, texCoordBuffer },
        texture,
        cubeRotation,
      );

      cubeRotation += deltaTime;

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  });
};

const drawScene = (
  gl: WebGL2RenderingContext,
  programInfo: ProgramInfo,
  program: WebGLProgram,
  buffers: { positionBuffer: WebGLBuffer; texCoordBuffer: WebGLBuffer },
  texture: WebGLTexture,
  cubeRotation: number,
) => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //プロジェクション行列：カメラのレンズ
  const fieldOfView = (45 * Math.PI) / 180;
  const aspect = gl.canvas.width / gl.canvas.height;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  //モデル行列：対象の位置・回転
  const modelMatrix = mat4.create();

  mat4.translate(
    modelMatrix,
    modelMatrix,
    [
      -0.0, 0.0, -12.0,
    ],
  );
  mat4.rotate(
    modelMatrix,
    modelMatrix,
    cubeRotation,
    [
      0, 0, 1,
    ],
  );
  mat4.rotate(
    modelMatrix,
    modelMatrix,
    cubeRotation * 0.7,
    [
      0, 1, 0,
    ],
  );

  //ビュー行列：カメラの位置 今回固定なのでこのまま。
  const viewMatrix = mat4.create();

  //MBP行列の作成( P * V * M の順で掛ける)
  const mvpMatrix = mat4.create();
  mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);
  mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);

  gl.useProgram(program);

  // ===== 描画 =====
  gl.useProgram(program);

  // 頂点属性の設定
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
  gl.vertexAttribPointer(
    programInfo.attribLocations.position,
    3,
    gl.FLOAT,
    false,
    0,
    0,
  ); // 3次元なのでsize=3
  gl.enableVertexAttribArray(programInfo.attribLocations.position);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoordBuffer);

  gl.vertexAttribPointer(
    programInfo.attribLocations.texCoord,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.texCoord);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
  gl.vertexAttribPointer(
    programInfo.attribLocations.normal,
    3,
    gl.FLOAT,
    false,
    0,
    0,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.normal);

  // テクスチャの設定
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(programInfo.uniformLocations.texture, 0);

  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.normalMatrix,
    false,
    normalMatrix,
  );

  // シェーダーにMVP行列を渡す
  gl.uniformMatrix4fv(programInfo.uniformLocations.mvpMatrix, false, mvpMatrix);

  // 光源の方向を設定（例：右上から左下へ向かう光）
  const lightDirection = [
    5, 5, 8,
  ];
  gl.uniform3fv(programInfo.uniformLocations.lightDirection, lightDirection);

  // 描画命令 (頂点36個)
  gl.drawArrays(gl.TRIANGLES, 0, 36);
};

window.onload = main;
