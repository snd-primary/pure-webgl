/// <reference types="vite/client" />

/// <reference types="vite/client" />

// .vert と .frag ファイルを文字列としてインポートできるように型定義を追加
declare module "*.vert?raw" {
	const content: string;
	export default content;
}

declare module "*.frag?raw" {
	const content: string;
	export default content;
}
