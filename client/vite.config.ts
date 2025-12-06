import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/api': {
				target: 'http://95.174.104.37:4200', // порт виталика
				changeOrigin: true,
				secure: false,
			},
			// Прокси для Socket.IO, чтобы io('/') мог работать через Vite dev server
			'/socket.io': {
				target: 'http://95.174.104.37:4200',
				ws: true,
				changeOrigin: true,
				secure: false,
			},
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@pages': path.resolve(__dirname, './src/pages'),
			'@features': path.resolve(__dirname, './src/features'),
			'@entities': path.resolve(__dirname, './src/entities'),
			'@shared': path.resolve(__dirname, './src/shared'),
			'@widgets': path.resolve(__dirname, './src/widgets'),
		},
	},
	build: {
		chunkSizeWarningLimit: 800,
		rollupOptions: {
			output: {
				manualChunks: {
					react: ['react', 'react-dom'],
					vendor: ['axios', 'zustand'],
				},
			},
		},
	},
});
