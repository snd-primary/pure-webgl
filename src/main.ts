import "./style.css";

// メインの処理を関数にまとめる
const main = () => {
	// canvas要素を取得し、HTMLCanvasElement型として扱う
	const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
	if (!canvas) {
		console.error("Canvas element not found!");
		return;
	}

	// WebGL2コンテキストを取得
	const gl = canvas.getContext("webgl2");
	if (!gl) {
		alert("Your browser does not support WebGL 2.0");
		return;
	}

	// ビューポートをcanvasのサイズに設定
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// 画面をクリアする色を設定 (R, G, B, A)
	gl.clearColor(0.8, 0.5, 0.5, 1.0); // 色を少し変えてみました

	// カラーバッファをクリア
	gl.clear(gl.COLOR_BUFFER_BIT);
};

// ページが読み込まれたらmain関数を実行
window.onload = main;
