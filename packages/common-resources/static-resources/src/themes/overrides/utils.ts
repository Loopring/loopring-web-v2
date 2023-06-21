import { ColorDarkDefault, ColorLightDefault } from '../css/color-lib'
import { fontDefault } from '../css/global'
import { ThemeKeys } from '../interface'
import { IsMobile } from '../../utils'

const isMobile = IsMobile.any()
export const unit = isMobile ? 4 : 8
export const pxToRem = (px: any, oneRemPx = 10) => `${px / oneRemPx}rem`
export const borderFunc = (themeMode: ThemeKeys) => {
  const colorBase = themeMode === 'dark' ? ColorDarkDefault : ColorLightDefault
  const borderColor = {
    default: colorBase.border,
    primary: colorBase.secondary,
    selected: colorBase.secondaryPressed,
    focus: colorBase.borderHover,
  }
  return {
    defaultBorder: `1px solid ${borderColor.default}`,
    defaultRadius: `${unit / 2}px`,
    FontDefault: fontDefault,
    defaultFrame: ({
      d_W = 1,
      d_R = 1,
      c_key = 'primary',
    }: {
      d_W?: number
      d_R?: number
      c_key?: 'primary' | 'selected' | 'focus' | string
    }) => {
      let color
      switch (c_key) {
        case 'primary':
        case 'selected':
        case 'focus':
          color = borderColor[c_key]
          break
        default:
          color = c_key
      }
      return `
        border: ${d_W}px solid ${color};
        border-radius: ${d_R * unit}px;
       `
    },
    borderConfig: ({
      d_W = 1,
      c_key = 'primary',
    }: {
      d_W?: number
      c_key?: 'primary' | 'selected' | 'focus' | string
    }) => {
      let color
      switch (c_key) {
        case 'primary':
        case 'selected':
        case 'focus':
          color = borderColor[c_key]
          break
        default:
          color = c_key
      }
      return `${d_W}px solid ${color}`
    },
  }
}
