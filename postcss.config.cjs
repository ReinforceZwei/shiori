module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
        'mantine-breakpoint-xxl': '100em',
        'mantine-breakpoint-fhd': '120em',
        'mantine-breakpoint-qhd': '150em',
        'mantine-breakpoint-uhd': '180em',
        'mantine-breakpoint-uw': '215em',
      },
    },
  },
};