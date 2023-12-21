import { createTheme } from '@mui/material'
import { ColorDarkDefault, ColorLightDefault } from '../css/color-lib'
import { borderFunc, unit } from './utils'
import {
  MuiAlert,
  MuiBreadcrumbs,
  MuiButton,
  MuiButtonBase,
  MuiCard,
  MuiCardActions,
  MuiCardContent,
  MuiCheckbox,
  MuiDialog,
  MuiDialogTitle,
  MuiDivider,
  MuiFormLabel,
  MuiIconButton,
  MuiInputBase,
  MuiInputLabel,
  MuiLinearProgress,
  MuiLink,
  MuiList,
  MuiListItem,
  MuiListItemAvatar,
  MuiMenu,
  MuiMenuItem,
  MuiModal,
  MuiPaginationItem,
  MuiPaper,
  MuiPopover,
  MuiRadio,
  MuiSnackbar,
  MuiSvgIcon,
  MuiSwitch,
  MuiTab,
  MuiTabs,
  MuiTextField,
  MuiToggleButton,
  MuiToolbar,
  MuiTooltip,
  MuiBadge,
  radius,
} from './overrides-mui'
import { MuPickDate } from './overrides-date-pick'
import { fontDefault } from '../css/global'
import { LoopringTheme, ThemeKeys } from '../interface'

export { unit }
export const getTheme = (themeMode: ThemeKeys, _isMobile = false): LoopringTheme => {
  const colorBase: typeof ColorDarkDefault = (
    themeMode === 'dark' ? ColorDarkDefault : ColorLightDefault
  ) as typeof ColorDarkDefault
  const theme = createTheme({
    spacing: unit,
    palette: {
      mode: themeMode,
      primary: {
        light: colorBase.primary,
        main: colorBase.primary,
        dark: colorBase.primary,
        contrastText: themeMode === 'dark' ? '#fff' : '#000',
      },
      secondary: {
        light: colorBase.secondary,
        main: colorBase.secondary,
        dark: colorBase.secondary,
        contrastText: themeMode === 'dark' ? '#fff' : '#000',
        // light:
      },
      contrastThreshold: 3,
      tonalOffset: 0.2,
      background: {
        paper: colorBase.box,
        default: colorBase.globalBg,
      },
      text: {
        primary: colorBase.textPrimary,
        secondary: colorBase.textSecondary,
        disabled: colorBase.textDisable,
        //hint: colorBase.textHint,
      },
      // divider: "rgba(0, 0, 0, 0.12)",
      common: { black: '#000', white: '#fff' },
      action: {
        hoverOpacity: 0.05,
        hover: colorBase.secondaryHover,
        selected: colorBase.secondaryPressed,
        // disabledBackground: "rgba(0, 0, 0, 0.12)",
        disabled: colorBase.textDisable,
        active: colorBase.secondaryPressed,
      },
      warning: {
        main: colorBase.warning,
      },
      success: {
        main: colorBase.success,
      },
      error: {
        main: colorBase.error,
        dark: colorBase.error,
        contrastText: themeMode === 'dark' ? '#fff' : '#000',
      },
    },
    typography: {
      // fontFamily: `DINCondensed, Helvetica, Arial, "华文细黑", "Microsoft YaHei", "微软雅黑", SimSun, "宋体", Heiti, "黑体", sans-serif`,
      fontFamily: 'Roboto',
      fontSize: 14,
      h1: {
        fontSize: fontDefault.h1,
        lineHeight: '4.6rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: fontDefault.h2,
        lineHeight: '3.8rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: fontDefault.h3,
        lineHeight: '3.2rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: fontDefault.h4,
        lineHeight: '2.8rem',
        fontWeight: 400,
      },
      h5: {
        fontSize: fontDefault.h5,
        lineHeight: '2.4rem',
        fontWeight: 400,
        margin: 0,
      },
      h6: {
        fontSize: fontDefault.h6,
        margin: 0,
      },
      subtitle1: {
        fontSize: 16,
        lineHeight: '2.4rem',
        fontWeight: 500,
      },
      button: {
        fontSize: 20,
        color: colorBase.textButton,
        fontWeight: 400,
      },
      body1: {
        fontSize: fontDefault.body1,
        color: colorBase.textPrimary,
        fontWeight: 400,
      },
      body2: {
        fontSize: 12,
        color: colorBase.textSecondary,
      },
    },
    // shadows:,
    components: {
      MuiCard: MuiCard({ colorBase }),
      MuiCardContent: MuiCardContent(),
      MuiCardActions: MuiCardActions(),
      MuiCheckbox: MuiCheckbox({ colorBase }),
      MuiLink: MuiLink({ colorBase }),
      MuiModal: MuiModal({ colorBase }),
      // MuiBackdrop:MuiBackdrop({colorBase}),
      MuiPopover: MuiPopover(),
      MuiToolbar: MuiToolbar(),
      MuiSvgIcon: MuiSvgIcon(),
      MuiTabs: MuiTabs(),
      MuiTab: MuiTab({ colorBase }),
      MuiButtonBase: MuiButtonBase,
      MuiRadio: MuiRadio(),
      MuiBadge: MuiBadge,
      MuiButton: MuiButton({ colorBase, themeMode }),
      MuiToggleButton: MuiToggleButton({ colorBase }),
      // MuiToggleButtonGroup: MuiToggleButtonGroup({colorBase}),
      MuiSwitch: MuiSwitch(),
      MuiIconButton: MuiIconButton({ colorBase }),
      MuiPaginationItem: MuiPaginationItem({ colorBase }),
      MuiTextField: MuiTextField({ colorBase }),
      MuiBreadcrumbs: MuiBreadcrumbs(),
      MuiFormLabel: MuiFormLabel({ colorBase }),
      MuiInputBase: MuiInputBase({ colorBase, themeMode }),
      MuiMenu: MuiMenu({ colorBase }),
      MuiMenuItem: MuiMenuItem({ colorBase, themeMode }),
      MuiList: MuiList(),
      MuiListItem: MuiListItem({ colorBase }),
      MuiListItemAvatar: MuiListItemAvatar(),
      MuiInputLabel: MuiInputLabel({ colorBase }),
      // MuiPopover: MuiPopover({colorBase, themeMode}),
      MuiPaper: MuiPaper({ colorBase, themeMode }),
      MuiDivider: MuiDivider({ colorBase }),
      MuiAlert: MuiAlert({ colorBase }),
      MuiSnackbar: MuiSnackbar(),
      MuiDialogTitle: MuiDialogTitle({ colorBase }),
      MuiDialog: MuiDialog({ colorBase }),
      MuiLinearProgress: MuiLinearProgress({ colorBase }),
      MuiTooltip: MuiTooltip({ colorBase }),
      ...MuPickDate({ colorBase, themeMode }),
    },
    shape: { borderRadius: radius },
  })
  return {
    ...theme,
    ...{
      unit,
      mode: themeMode,
      border: borderFunc(themeMode),
      fontDefault,
      colorBase: themeMode === 'dark' ? ColorDarkDefault : ColorLightDefault,
    },
  } as LoopringTheme
}
