module.exports = {
  content: ['./**/*.{tsx,jsx}', '**/use*.{ts,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Saveful-Regular'],
        'sans-italic': ['Saveful-Italic'],
        'sans-bold': ['Saveful-Bold'],
        'sans-bold-italic': ['Saveful-BoldItallic'],
        'sans-semibold': ['Saveful-SemiBold'],
        'sans-semibold-italic': ['Saveful-SemiBoldItalic'],
        mono: ['Courier New', 'monospace'],
      },
      borderRadius: {
        '2lg': '0.675rem',
        '2.5xl': '1.25rem',
      },
      boxShadow: {
        sm: '0px 0px 20px 0px rgba(161, 160, 166, 0.10)',
        lg: '0px -0.5px 0px 0px rgba(0, 0, 0, 0.30)',
      },
      colors: {
        black: '#1A1A1B',
        creme: {
          DEFAULT: '#FFFAF3',
          2: '#E8DAC8',
          3: '#F2E3CF',
        },
        chilli: '#FF623A',
        radish: '#FFCDF5',
        lemon: '#E9ED1F',
        mint: '#96F0B6',
        kale: '#3A7E52',
        blueberry: '#007EFF',
        middlegreen: '#40925B',
        eggplant: {
          DEFAULT: '#4B2176',
          light: '#AB84FF',
          vibrant: '#7E42FF',
        },
        orange: '#F99C46',
        midgray: '#575757',
        stone: '#6D6D72',
        white: '#FFFCF9',
        strokecream: '#EEE4D7',
        validation: '#DB2C00',
        qantas: '#E40000',
      },
      fontSize: {
        '1.5xl': '1.375rem',
        '2.5xl': '1.625rem',
        '3.5xl': '2rem',
        '4.5xl': '2.5rem',
      },
      letterSpacing: {
        widest: '0.0625rem',
      },
      lineHeight: {
        xtratight: '1.05',
        tightest: '1.1',
        tighter: '1.15',
      },
      spacing: {},
    },
  },
  plugins: [],
};
