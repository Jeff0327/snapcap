import type {Config} from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                'jalnan': ['jalnan', 'sans-serif'],
                'Nanum': ['Nanum', 'sans-serif'],
                'GongGothic': ['GongGothic', 'sans-serif'],
            },
            animation: {
                fadeIn: 'fadeIn 1s ease-in-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': {opacity: '0'},
                    '100%': {opacity: '1'},
                },
            },
        },
    },
    plugins: [],
}

export default config