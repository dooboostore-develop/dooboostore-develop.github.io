import { defineConfig } from 'vite';

// 브라우저 진입점은 front-end/, 결과물은 dist/ (back-end 가 여기서 읽어 서빙·SSR)
export default defineConfig({
  root: 'front-end',
  build: { outDir: '../dist', emptyOutDir: true },
});
