/** @type {import('tailwindcss').Config} */
export default {
	content: ['./app/**/*.{js,jsx,ts,tsx}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#2563eb',
					dark: '#1d4ed8'
				},
				background: {
					DEFAULT: '#ffffff',
					dark: '#111827'
				},
				foreground: {
					DEFAULT: '#111827',
					dark: '#ffffff'
				}
			}
		}
	},
	plugins: []
} 