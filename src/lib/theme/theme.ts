import type { MantineColorsTuple, MantineThemeOverride } from "@mantine/core"
import { createTheme, DEFAULT_THEME } from "@mantine/core";
import { notoSansMono, notoSansTC } from "./font";

// Shiori theme color
export const mintGreen: MantineColorsTuple = [
  "#ecfaeb",
  "#dfefdd",
  "#c0dcbe",
  "#9fc89b",
  "#83b77e",
  "#78b072",
  "#67a761",
  "#569250",
  "#4a8245",
  "#3b7137"
];

export const roseRed: MantineColorsTuple = [
  '#ffecf0',
  '#f9d8de',
  '#ecaeba',
  '#e18293',
  '#d75d73',
  '#d2465e',
  '#d03954',
  '#c72e4a',
  '#a5233c',
  '#921833'
];

const theme: MantineThemeOverride = createTheme({
  primaryColor: 'mintGreen',
  fontFamily: `${notoSansTC.style.fontFamily}, ${DEFAULT_THEME.fontFamily}`,
  fontFamilyMonospace: `${notoSansMono.style.fontFamily}, ${DEFAULT_THEME.fontFamilyMonospace}`,
  breakpoints: {
    xs: '36em',    // 576px
    sm: '48em',    // 768px
    md: '62em',    // 992px
    lg: '75em',    // 1200px
    xl: '88em',    // 1408px
    xxl: '100em',  // 1600px - Wide desktop
    fhd: '120em',  // 1920px - Full HD
    qhd: '150em',  // 2400px - QHD ultrawide
    uhd: '180em',  // 2880px - 4K ultrawide
    uw: '215em',   // 3440px - 21:9 ultrawide
  },
  colors: {
    mintGreen,
    roseRed,
  },
})

export default theme