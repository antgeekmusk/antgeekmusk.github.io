import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/', // 设置相对路径，适用于 GitHub Pages 部署
    build: {
        outDir: 'build',
    },
    resolve: {
        alias: {
            '@': '/src', // 设置 @ 为 src 目录的别名
        }
    }
});