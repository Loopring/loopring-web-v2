import { AvatarProps, Theme } from '@mui/material'
import { ColorBaseInterface } from './css/color-lib'

export enum ThemeType {
  dark = 'dark',
  light = 'light',
}

declare module '@mui/material/TextField' {
  interface TextFieldPropsSizeOverrides {
    large: true
  }
}
export type ThemeKeys = keyof typeof ThemeType
export type LoopringTheme = Theme & {
  colorBase: ColorBaseInterface
  fontDefault: {
    h1: string
    h2: string
    h3: string
    h4: string
    h5: string
    h6: string
    body1: string
    body2: string
  }
  unit: number
  mode: ThemeKeys
  border: {
    defaultBorder: string
    defaultRadius: string
    defaultFrame: (props: {
      d_W?: number
      d_R?: number
      c_key?: 'primary' | 'selected' | 'blur' | 'focus' | string
    }) => string
    borderConfig: (props: {
      d_W?: number
      c_key?: 'primary' | 'selected' | 'blur' | 'focus' | string
    }) => string
  }
}
export type AvatarCoinProps = AvatarProps & {
  imgx: number
  imgy: number
  imgh?: number
  imgw?: number
  imgheight: number
  imgwidth: number
  size?: number
}

declare module '@emotion/react' {
  export interface Theme extends LoopringTheme {}
}
