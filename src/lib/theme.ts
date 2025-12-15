import type { MantineThemeOverride } from "@mantine/core"
import { createTheme, DEFAULT_THEME } from "@mantine/core";
import { notoSansMono, notoSansTC } from "./font";

const theme: MantineThemeOverride = createTheme({
  primaryColor: 'pink',
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
})

export default theme