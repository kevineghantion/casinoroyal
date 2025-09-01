import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Casino Royal neon theme - Production Ready
				'bg-dark': 'hsl(var(--bg-dark))',
				'bg-darker': 'hsl(var(--bg-darker))',
				'bg-card': 'hsl(var(--bg-card))',
				'neon-pink': 'hsl(var(--neon-pink))',
				'neon-pink-glow': 'hsl(var(--neon-pink-glow))',
				'neon-magenta': 'hsl(var(--neon-magenta))',
				'electric-blue': 'hsl(var(--electric-blue))',
				'electric-blue-glow': 'hsl(var(--electric-blue-glow))',
				'cyan-glow': 'hsl(var(--cyan-glow))',
				'lime-green': 'hsl(var(--lime-green))',
				'lime-green-glow': 'hsl(var(--lime-green-glow))',
				'neon-white': 'hsl(var(--neon-white))',
				'neon-gray': 'hsl(var(--neon-gray))',
				'neon-gray-dark': 'hsl(var(--neon-gray-dark))',
				
				// Semantic tokens
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'neon-pink': 'var(--glow-pink)',
				'neon-blue': 'var(--glow-blue)',
				'neon-green': 'var(--glow-green)',
				'neon-magenta': 'var(--glow-magenta)',
				'glow': '0 0 20px rgba(255, 45, 203, 0.5)',
				'glow-lg': '0 0 40px rgba(255, 45, 203, 0.3)',
			},
			backgroundImage: {
				'gradient-neon': 'var(--gradient-neon)',
				'gradient-casino': 'var(--gradient-casino)',
				'gradient-card': 'var(--gradient-card)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'pulse-glow': {
					'0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 10px currentColor)' },
					'50%': { opacity: '0.8', filter: 'drop-shadow(0 0 20px currentColor)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'zoom-in': {
					'0%': { transform: 'scale(0.9)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'flip-x': {
					'0%': { transform: 'rotateY(0deg)' },
					'100%': { transform: 'rotateY(180deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'slide-up': 'slide-up 0.5s ease-out',
				'slide-down': 'slide-down 0.5s ease-out',
				'zoom-in': 'zoom-in 0.3s ease-out',
				'flip-x': 'flip-x 0.6s ease-in-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
