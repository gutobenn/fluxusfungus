module.exports = {
  purge: ['./components/**/*.js', './pages/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans:
          '-apple-system, "Helvetica Neue", "Segoe UI", Roboto, Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        mono: 'Consolas, "ConsolasRegular", "Courier New", monospace !important'
      },
      colors: {
        primary: '#E1C0AF',
        tomato: '#FF6347',
        gray1: 'rgba(235, 235, 235, 250)',
        brown1: '#302625'
      },
      spacing: {
        28: '7rem'
      },
      letterSpacing: {
        tighter: '-.04em'
      },
      lineHeight: {
        tight: 1.2,
        relaxed2: 1.75
      },
      fontSize: {
        '5xl': '2.5rem',
        '6xl': '2.75rem',
        '7xl': '4rem',
        '8xl': '6.25rem'
      },
      boxShadow: {
        small: '0 5px 10px rgba(0, 0, 0, 0.12)',
        medium: '0 8px 30px rgba(0, 0, 0, 0.12)'
      }
    }
  }
}
