/** @type {import('tailwindcss').Config} */
export default {
	content: ['./app/**/*.{js,jsx,ts,tsx}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
				},
				background: {
					DEFAULT: '#ffffff',
					dark: '#111827'
				},
				foreground: {
					DEFAULT: '#111827',
					dark: '#ffffff'
				}
			},
			animation: {
				'bounce-slow': 'bounce 3s infinite',
			},
		}
	},
	plugins: []
} 