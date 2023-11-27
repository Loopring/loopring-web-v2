import { Layouts } from 'react-grid-layout'

export enum LayoutConfig {
  basicLayout,
  layout1,
  layout2,
}

export const MarketRowHeight = 20

export enum BreakPoint {
  xlg = 'xlg',
  lg = 'lg',
  md = 'md',
  sm = 'sm',
  xs = 'xs',
  xxs = 'xxs',
}

export type ConfigLayout<P = typeof BreakPoint> = {
  breakpoints: { [key in keyof P]: number }
  cols: { [key in keyof P]: number }
  layouts: {
    [key in keyof P]: Array<{
      i: string
      x: number
      y: number
      w: number
      h: number
      minW: number
      minH: number
    }>
  }
}
const basicLayout: ConfigLayout = {
  breakpoints: { xlg: 1920, lg: 1600, md: 1200, sm: 960, xs: 768, xxs: 320 },
  cols: { xlg: 24, lg: 24, md: 24, sm: 12, xs: 12, xxs: 6 },
  layouts: {
    xlg: [
      { i: 'toolbar', x: 0, y: 0, w: 24, h: 9, minW: 24, minH: 9 },
      { i: 'walletInfo', x: 0, y: 10, w: 4, h: 28, minW: 4, minH: 26 },
      { i: 'spot', x: 0, y: 14, w: 4, h: 115, minW: 4, minH: 70 },
      { i: 'market', x: 4, y: 10, w: 4, h: 88, minW: 4, minH: 58 },
      { i: 'chart', x: 8, y: 10, w: 12, h: 88, minW: 6, minH: 32 },
      { i: 'market2', x: 20, y: 10, w: 4, h: 88, minW: 4, minH: 36 },
      { i: 'orderTable', x: 4, y: 64, w: 20, h: 55, minW: 6, minH: 36 },
    ],
    lg: [
      { i: 'toolbar', x: 0, y: 0, w: 24, h: 9, minW: 24, minH: 9 },
      { i: 'walletInfo', x: 0, y: 10, w: 4, h: 28, minW: 4, minH: 26 },
      { i: 'spot', x: 0, y: 26, w: 4, h: 89, minW: 4, minH: 70 },
      { i: 'market', x: 4, y: 10, w: 4, h: 73, minW: 4, minH: 58 },
      { i: 'chart', x: 8, y: 10, w: 12, h: 73, minW: 6, minH: 32 },
      { i: 'market2', x: 20, y: 10, w: 4, h: 73, minW: 4, minH: 58 },
      { i: 'orderTable', x: 4, y: 64, w: 20, h: 44, minW: 6, minH: 36 },
    ],
    md: [
      { i: 'toolbar', x: 0, y: 0, w: 24, h: 9, minW: 24, minH: 9 },
      { i: 'walletInfo', x: 0, y: 10, w: 5, h: 28, minW: 4, minH: 26 },
      { i: 'spot', x: 0, y: 9, w: 5, h: 68, minW: 4, minH: 68 },
      { i: 'market', x: 5, y: 10, w: 5, h: 58, minW: 4, minH: 58 },
      { i: 'market2', x: 0, y: 0, w: 0, h: 0, minW: 0, minH: 0 },
      { i: 'chart', x: 10, y: 10, w: 14, h: 58, minW: 6, minH: 32 },
      { i: 'orderTable', x: 5, y: 64, w: 19, h: 38, minW: 6, minH: 36 },
    ],
    sm: [
      { i: 'toolbar', x: 0, y: 0, w: 12, h: 9, minW: 12, minH: 9 },
      { i: 'walletInfo', x: 0, y: 10, w: 3, h: 28, minW: 3, minH: 22 },
      { i: 'spot', x: 0, y: 14, w: 3, h: 66, minW: 3, minH: 66 },
      { i: 'market', x: 3, y: 10, w: 3, h: 58, minW: 3, minH: 58 },
      { i: 'market2', x: 0, y: 0, w: 0, h: 0, minW: 0, minH: 0 },
      { i: 'chart', x: 6, y: 10, w: 6, h: 58, minW: 6, minH: 32 },
      { i: 'orderTable', x: 3, y: 64, w: 9, h: 36, minW: 6, minH: 36 },
    ],
    xs: [
      { i: 'toolbar', w: 12, h: 17, x: 0, y: 0, minW: 6, minH: 9 },
      { i: 'walletInfo', w: 4, h: 48, x: 0, y: 121, minW: 3, minH: 22 },
      { i: 'spot', w: 4, h: 104, x: 0, y: 17, minW: 3, minH: 54 },
      { i: 'market', w: 4, h: 151, x: 4, y: 17, minW: 3, minH: 58 },
      { i: 'market2', w: 4, x: 8, y: 17, h: 151, minW: 3, minH: 58 },
      { i: 'chart', w: 12, h: 80, x: 0, y: 239, minW: 3, minH: 32 },
      { i: 'orderTable', w: 12, h: 71, x: 0, y: 168, minW: 5, minH: 36 },
    ],
    xxs: [
      { i: 'toolbar', x: 0, y: 0, w: 6, h: 14, minW: 6, minH: 9 },
      { i: 'walletInfo', x: 0, y: 63, w: 3, h: 51, minW: 3, minH: 22 },
      { i: 'spot', x: 0, y: 9, w: 3, h: 103, minW: 3, minH: 54 },
      { i: 'market', x: 3, y: 9, w: 3, h: 154, minW: 3, minH: 58 },
      { i: 'market2', x: 0, y: 0, w: 0, h: 0, minW: 0, minH: 0 },
      { i: 'chart', x: 3, y: 125, w: 6, h: 80, minW: 3, minH: 32 },
      { i: 'orderTable', x: 0, y: 88, w: 6, h: 80, minW: 5, minH: 36 },
    ],
  },
}

const stopLimitLayout: ConfigLayout = {
  breakpoints: { xlg: 1920, lg: 1600, md: 1200, sm: 960, xs: 768, xxs: 320 },
  cols: { xlg: 24, lg: 24, md: 24, sm: 12, xs: 12, xxs: 6 },
  layouts: {
    xlg: [
      { i: 'toolbar', x: 0, y: 0, w: 24, h: 9, minW: 24, minH: 9 },
      { i: 'spot', x: 0, y: 10, w: 4, h: 143, minW: 4, minH: 70 },
      { i: 'markdown', x: 4, y: 10, w: 8, h: 88, minW: 4, minH: 20 },
      { i: 'chart', x: 12, y: 10, w: 12, h: 88, minW: 6, minH: 32 },
      { i: 'orderTable', x: 4, y: 64, w: 20, h: 55, minW: 6, minH: 36 },
    ],
    lg: [
      { w: 24, h: 9, x: 0, y: 0, i: 'toolbar', minW: 24, minH: 9 },
      { w: 5, h: 79, x: 0, y: 9, i: 'spot', minW: 4, minH: 68 },
      { w: 7, h: 44, x: 5, y: 9, i: 'markdown', minW: 4, minH: 20 },
      { w: 12, h: 44, x: 11, y: 9, i: 'chart', minW: 6, minH: 32 },
      { w: 19, h: 36, x: 5, y: 53, i: 'orderTable', minW: 6, minH: 36 },
    ],
    md: [
      { i: 'toolbar', x: 0, y: 0, w: 24, h: 9, minW: 24, minH: 9 },
      { i: 'spot', x: 0, y: 10, w: 5, h: 81, minW: 4, minH: 68 },
      { i: 'markdown', x: 5, y: 10, w: 7, h: 44, minW: 4, minH: 20 },
      { i: 'chart', x: 12, y: 10, w: 12, h: 44, minW: 6, minH: 32 },
      { i: 'orderTable', x: 5, y: 53, w: 19, h: 37, minW: 6, minH: 32 },
    ],
    sm: [
      { i: 'toolbar', x: 0, y: 0, w: 12, h: 9, minW: 12, minH: 9 },
      // { i: "walletInfo", x: 0, y: 10, w: 3, h: 28, minW: 3, minH: 22 },
      { i: 'spot', x: 0, y: 10, w: 3, h: 94, minW: 3, minH: 66 },
      { i: 'markdown', x: 3, y: 10, w: 3, h: 58, minW: 3, minH: 20 },
      // { i: "market2", x: 0, y: 0, w: 0, h: 0, minW: 0, minH: 0 },
      { i: 'chart', x: 6, y: 10, w: 6, h: 58, minW: 6, minH: 32 },
      { i: 'orderTable', x: 3, y: 64, w: 9, h: 36, minW: 6, minH: 36 },
    ],
    xs: [
      { i: 'toolbar', w: 12, h: 17, x: 0, y: 0, minW: 6, minH: 9 },
      { i: 'spot', w: 3, h: 72, x: 0, y: 17, minW: 3, minH: 54 },
      { i: 'markdown', w: 3, h: 72, x: 3, y: 17, minW: 3, minH: 20 },
      { i: 'chart', w: 6, h: 72, x: 6, y: 17, minW: 3, minH: 32 },
      { i: 'orderTable', w: 12, h: 71, x: 0, y: 89, minW: 5, minH: 36 },
    ],
    xxs: [
      { i: 'toolbar', w: 6, h: 14, x: 0, y: 0, minW: 6, minH: 9 },
      { i: 'spot', w: 3, h: 73, x: 0, y: 14, minW: 3, minH: 54 },
      { i: 'markdown', w: 3, h: 73, x: 3, y: 14, minW: 3, minH: 58 },
      { i: 'chart', w: 6, h: 80, x: 0, y: 167, minW: 3, minH: 32 },
      { i: 'orderTable', w: 6, h: 80, x: 0, y: 87, minW: 5, minH: 36 },
    ],
  },
}

export const layoutConfigs: Array<ConfigLayout> = [basicLayout]
export const stopLimitLayoutConfigs: Array<ConfigLayout> = [stopLimitLayout]

export type LayoutConfigInfo = {
  currentBreakpoint: BreakPoint
  mounted: boolean
  layouts: Layouts
  compactType: 'vertical' | 'horizontal' | null | undefined
}
