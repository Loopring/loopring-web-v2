import { borderFunc, pxToRem, unit } from './utils'
import { ComponentsOverrides } from '@mui/material'
import { fontDefault } from '../css/global'
import { myLog } from '../../utils'

export const radius = 4
export const checkBoxSize = 18
export const hr = ({ colorBase }: any) => {
  return {
    borderRadius: `${radius}px`,
    content: '""',
    margin: `0 ${2 * unit}px`,
    // margin: `0 ${unit}px`,
    display: 'block',
    height: `2px`,
    backgroundColor: colorBase.primary,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  }
}

export const MuiCheckbox = ({
  colorBase,
}: any): { styleOverrides: ComponentsOverrides['MuiCheckbox'] } => {
  return {
    styleOverrides: {
      root: {
        '&.MuiCheckbox-colorDefault': {
          color: colorBase.textSecondary,
        },
        '&:hover': {
          backgroundColor: 'inherit',
          color: colorBase.textButtonSelect,
        },
        '&.Mui-checked': {
          color: colorBase.textButtonSelect,
          '&:hover': {
            color: colorBase.textButtonSelect,
          },
        },
        ' .MuiSvgIcon-fontSizeMedium ': {
          // fontSize: fontDefault.h5
          height: fontDefault.h5,
          width: fontDefault.h5,
        },
      },
    },
  }
}
export const MuiCard = ({ colorBase }: any) => {
  return {
    styleOverrides: {
      root: {
        backgroundColor: colorBase.box,
        padding: pxToRem(24),
      },
    },
  }
}

export const MuiCardContent = () => {
  return {
    styleOverrides: {
      root: {
        padding: pxToRem(8),
      },
    },
  }
}

export const MuiCardActions = () => {
  return {
    styleOverrides: {
      root: {
        padding: 0,
      },
    },
  }
}

export const MuiLink = ({ colorBase }: any) => {
  return {
    styleOverrides: {
      root: {
        color: colorBase.secondary,
        textDecoration: 'none',
        '&:hover': {
          color: colorBase.secondaryHover,
        },
        '&.Mui-selected': {
          color: colorBase.secondaryPressed,
        },
      },
    },
  }
}

export const MuiTextField = ({
  colorBase,
}: any): {
  styleOverrides: ComponentsOverrides['MuiTextField']
} => {
  return {
    styleOverrides: {
      root: {
        '.MuiFormHelperText-root': {
          marginLeft: 0,
          marginRight: 0,
          textAlign: 'right',
          whiteSpace: 'pre-line',
        },
        ' .MuiFormLabel-root': {
          color: colorBase.textThird,
          '&.Mui-focused': {
            color: colorBase.textSecondary,
          },
        },
      },
    },
  }
}

// export const MuiFormLabel = ({colorBase}: any): { styleOverrides: ComponentsOverrides['MuiFormLabel'] } => {
//     return {
//         styleOverrides: {
//             root: {
//
//                 // '.MuiFormLabel-root':{
//                 //
//                 // }
//             }
//         }
//     }
// }

export const MuiModal = ({ colorBase }: any) => {
  return {
    styleOverrides: {
      root: {
        color: colorBase.textPrimary,
        ' .MuiBackdrop-root': {
          zIndex: -1,
          backgroundColor: colorBase.mask,
        },
      },
    },
  }
}

export const MuiToolbar = () => {
  return {
    styleOverrides: {
      root: { height: 'var(--header-height)' },
    },
  }
}

// @ts-ignore
export const MuiSwitch = (): {
  styleOverrides: ComponentsOverrides['MuiSwitch']
} => {
  return { styleOverrides: {} }
}

export const MuiButton = ({
  colorBase,
}: any): { styleOverrides: ComponentsOverrides['MuiButton'] } => {
  return {
    styleOverrides: {
      root: {
        textTransform: 'capitalize',
        '&:not($sizeLarge):not($sizeSmall) $label': {
          fontSize: '1.4rem',

          // font: 'normal normal 700 0.875rem/1.6875rem Open Sans',
          // color: 'green'
        },
        fontFamily: 'Roboto',
        fontSize: pxToRem(14),
        borderRadius: pxToRem(4),
        fontWeight: 'normal',
        paddingLeft: pxToRem(12),
        paddingRight: pxToRem(12),
        // '&.MuiButton-contained':{
        //
        // }
      },
      text: {
        color: colorBase.secondary,
        fontSize: '1.6rem',
        '&:hover': {
          'svg, &': {
            color: colorBase.secondaryHover,
          },
          backgroundColor: 'inherit',
        },
        '&:active': {
          color: colorBase.secondaryPressed,
        },
        '&:disabled': {
          color: colorBase.disable,
        },
        '& .MuiButton-endIcon,& .MuiButton-startIcon': {
          color: colorBase.buttonIcon,
        },
        '&.MuiButton-sizeSmall': {
          fontSize: '1.4rem',
        },
      },
      contained: {
        color: colorBase.textButton,
        height: pxToRem(40),
        fontSize: pxToRem(14),
        boxShadow: 'initial',
        '&:hover': {
          boxShadow: 'initial',
          '&:before': {
            background: colorBase.primaryHover,
            content: "''",
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
        },
        '&.Mui-disabled': {
          backgroundColor: colorBase.defaultDisable,
          color: colorBase.textDisable,
        },
      },
      sizeLarge: {
        height: pxToRem(48),
        fontSize: '2.0rem',
        fontWeight: 'normal',
        //     '& .MuiButton-label': {
        //
        // }
      },
      sizeSmall: {
        height: pxToRem(32),
        fontSize: '1.6rem',
        //     '& $label': {
        //
        // },
      },
      outlinedSizeSmall: {
        height: pxToRem(24),
        fontSize: '1.2rem',
      },
      outlined: {
        height: pxToRem(32),
        // boxShadow: '0px 4px 62px rgba(0, 0, 0, 0.25)',
        fontSize: '1.4rem',
        fontWeight: 'normal',
        color: colorBase.textSecondary,
        borderColor: colorBase.border,
        backgroundColor: colorBase.box,
        '&:hover': {
          color: colorBase.textPrimary,
          borderColor: colorBase.textPrimary,
          backgroundColor: colorBase.box,
        },
        '&.MuiContained-sizeMedium': {
          height: pxToRem(40),
          fontSize: pxToRem(14),
        },
        '&.Mui-disabled': {
          // backgroundColor: colorBase.defaultDisable,
          color: colorBase.textDisable,
          border: `1px dashed ${colorBase.textDisable}`,
          // borderColor:
          // backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='%23FFFFFF33' stroke-width='1' stroke-dasharray='4%25%2c 8%25' stroke-dashoffset='5' stroke-linecap='square'/%3e%3c/svg%3e")`
        },
      },
    },
  }
}

// @ts-ignore
export const MuiPopover = (): {
  styleOverrides: ComponentsOverrides['MuiPopover']
} => {
  return {
    styleOverrides: {},
  }
}
// export const MuiBackdrop = ({colorBase}: any) => {
//     return {
//         styleOverrides: {
//             root: {
//                 zIndex: -1,
//
//             }
//         }
//     }
// }

export const MuiPaper = ({
  colorBase,
}: any): { styleOverrides: ComponentsOverrides['MuiPaper'] } => {
  return {
    styleOverrides: {
      root: {
        borderRadius: pxToRem(8),
        backgroundImage: 'none',
        backgroundColor: colorBase.popBg,
        border: `.5px solid ${colorBase.border}`,
        '&.MuiPopover-paper': {
          backgroundImage: 'none',
          boxShadow: colorBase.shadowHover,
        },
      },
    },
  }
}
export const MuiSvgIcon = () => {
  return {
    styleOverrides: {
      root: {
        // margin: '-4px',
        '&.MuiSvgIcon-fontSizeSmall': {
          height: 'var(--svg-size)',
          width: 'var(--svg-size)',
        },
        '&.MuiSvgIcon-fontSizeLarge': {
          height: 'var(--svg-size-large)',
          width: 'var(--svg-size-large)',
          // margin: '-6px',
        },
        '&.MuiSvgIcon-fontSizeMedium': {
          height: 'var(--svg-size-medium)',
          width: 'var(--svg-size-medium)',
          // margin: '-6px',
        },
        '&.tag': {
          width: 'auto',
          height: 'auto',
        },
      },
    },
  }
}
//@ts-ignore
export const MuiRadio = () => {
  return {
    styleOverrides: {
      root: {
        ' svg': {
          height: 'var(--svg-size)',
          width: 'var(--svg-size)',
        },
      },
    },
  }
}

export const MuiInputLabel = ({
  colorBase,
}: any): { styleOverrides: ComponentsOverrides['MuiInputLabel'] } => {
  return {
    styleOverrides: {
      root: {
        fontSize: fontDefault.body1,
        height: 20,
        color: colorBase.textThird,
        transform: 'none',
        top: 0,
        left: 0,
        right: 0,
        '&.Mui-focused': {
          color: colorBase.textSecondary,
        },
        '&.Mui-disabled ': {
          color: colorBase.textSecondary,
        },
      },
    },
  }
}
export const MuiInputBase = ({
  colorBase,
  themeMode,
  ...rest
}: any): { styleOverrides: ComponentsOverrides['MuiInputBase'] } => {
  myLog('size', rest)
  return {
    styleOverrides: {
      root: {
        'label + &': {
          marginTop: 24,
        },
        position: 'relative',
        fontSize: '1.4rem',
        backgroundColor: colorBase.box,
        border: borderFunc(themeMode).borderConfig({ c_key: colorBase.border }), //`1px solid ${colorBase.border}`,
        borderRadius: 4,
        boxSizing: 'border-box',
        height: pxToRem(32),
        '&.MuiInputBase-sizeSmall': {
          height: pxToRem(32),
        },
        '&:not(.MuiFormControl-fullWidth)': {
          // width: 'var(--btn-min-width)',
          minWidth: 'var(--btn-min-width)',
          // maxWidth: 'var(--btn-max-width)',
        },
        '& .MuiListItemText-multiline': {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'noWrap',
          justifyContent: 'space-between',
          margin: 0,
          height: 'inherit',
        },
        '& fieldset': {
          display: 'none',
        },
        ' .MuiInputAdornment-root, .MuiSelect-iconOutlined': {
          color: colorBase.textThird,
        },
        '.search .MuiInputAdornment-root': {
          pointerEvents: 'none',
        },
        paddingRight: 0,
        '&:hover': {
          border: borderFunc(themeMode).borderConfig({
            c_key: colorBase.borderHover,
          }), //`1px solid ${colorBase.border}`,
        },
        '&:disabled': {
          backgroundColor: colorBase.defaultDisable,
          borderColor: colorBase.defaultDisable,
          color: colorBase.textBtnDisabled,
        },
        '.MuiSelect-iconOpen': {
          transform: 'rotate(180deg)',
        },
        ' .MuiSelect-select': {
          padding: 0,
          border: 'transparent',
          backgroundColor: 'transparent',
          color: 'var(--color-text-primary)',
          '&:focus': {
            background: 'transparent',
          },

          ' svg': {
            right: '.4rem',
            top: '50%',
            transform: 'translateY(-50%)',
            position: 'absolute',
            transition: 'fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            // color: 'var(--color-text-secondary)'
          },
          '&.MuiInputBase-root': {
            minWidth: 'auto',
            width: 'auto',
          },
        },

        '&.MuiOutlinedInput-root': {
          padding: '.3rem .3rem .3rem .8rem',
          minWidth: 'auto',
        },
        '.text-address &.MuiOutlinedInput-root': {
          paddingRight: '2em',
        },
        ' .MuiOutlinedInput-input': {
          padding: 0,
          height: 'calc(3.2rem - .6rem)',
        },
        ' .MuiSelect-outlined': {
          height: 'calc(3.2rem - .6rem)',
          lineHeight: 'calc(3.2rem - .6rem)',
          minWidth: 'auto',
        },
        ' .MuiSelect-icon': {
          color: colorBase.textThird,
        },
      },
    },
  }
}

export const MuiIconButton = ({
  colorBase,
}: any): { styleOverrides: ComponentsOverrides['MuiIconButton'] } => {
  return {
    styleOverrides: {
      root: {
        color: 'inherit',
        height: 'var(--btn-icon-size-medium)',
        width: 'var(--btn-icon-size-medium)',
        ' svg': {
          height: 'var(--svg-size-medium)',
          width: 'var(--svg-size-medium)',
        },
        '&.MuiIconButton-sizeLarge': {
          height: 'var(--btn-icon-size)',
          width: 'var(--btn-icon-size)',
          ' svg': {
            height: 'var(--svg-size-large)',
            width: 'var(--svg-size-large)',
          },
        },
        '&.MuiIconButton-sizeMedium': {
          height: 'var(--btn-icon-size-medium)',
          width: 'var(--btn-icon-size-medium)',
          ' svg': {
            height: 'var(--svg-size-medium)',
            width: 'var(--svg-size-medium)',
          },
        },
        '&.MuiIconButton-sizeSmall': {
          height: 'var(--btn-icon-size-small)',
          width: 'var(--btn-icon-size-small)',
          ' svg': {
            height: 'var(--svg-size)',
            width: 'var(--svg-size)',
          },
        },
        '&.MuiIconButton-colorInherit': {
          color: colorBase.textSecondary,
          '&:hover': {
            color: colorBase.textPrimary,
          },
        },
      },
      // label: {
      //     width: 'auto'
      // }
    },
  }
}

export const MuiToggleButton = ({
  colorBase,
}: any): { styleOverrides: ComponentsOverrides['MuiToggleButton'] } => {
  return {
    styleOverrides: {
      root: {
        '&.MuiToggleButton-sizeMedium': {
          fontSize: '1.4rem',
          minWidth: pxToRem(51),
        },
        height: pxToRem(28),
        // boxShadow: '0px 4px 62px rgba(0, 0, 0, 0.25)',
        borderRadius: '4px !important',
        marginRight: pxToRem(2),
        fontSize: '1.4rem',
        color: colorBase.textSecondary,
        border: 'none',
        textTransform: 'none',
        // borderColor: colorBase.border,
        '&&:not(:first-of-type), &&:not(:last-child)': {
          // borderColor: colorBase.border,
        },
        backgroundColor: 'inherit',
        '&:hover': {
          backgroundColor: 'inherit',
          // color: colorBase.textButton,
          color: colorBase.textPrimary,
          // borderColor: colorBase.textPrimary,
          border: 'none',
          '&:not(:last-child), &:not(:first-of-type)': {
            // borderColor: colorBase.textPrimary,
          },
          '&.Mui-selected,&.Mui-selected': {
            // borderColor: colorBase.primary,
          },
        },
        '&.Mui-disabled': {
          // backgroundColor: colorBase.defaultDisable,
          color: colorBase.textDisable,
          border: 'none',
          // border: '1px dashed',
          // borderColor: colorBase.border
          // backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='%23FFFFFF33' stroke-width='1' stroke-dasharray='4%25%2c 8%25' stroke-dashoffset='5' stroke-linecap='square'/%3e%3c/svg%3e")`
        },
        '&&.Mui-selected, &&.Mui-selected + &.Mui-selected': {
          color: colorBase.textButton,
          backgroundColor: colorBase.primary,
          // border: 'none'
          // border: borderFunc(themeMode).borderConfig({c_key: rgba(colorBase.primary, 0.5)})
        },
      },
    },
  }
}
export const MuiButtonBase = {
  defaultProps: {
    disableRipple: true,
  },
}
export const MuiPaginationItem = ({ colorBase }: any) => {
  return {
    styleOverrides: {
      root: {
        fontSize: '1.4rem',
        color: colorBase.textSecondary,
        borderRadius: '4px',
      },
      icon: {
        fontSize: '2rem',
      },
      textPrimary: {
        '&:hover': {
          backgroundColor: colorBase.boxHover,
          color: colorBase.textButtonSelect,
        },
        '&.Mui-selected': {
          backgroundColor: 'transparent',
          color: colorBase.textButtonSelect,
          '&:hover': {
            backgroundColor: colorBase.boxHover,
            color: colorBase.textButtonSelect,
          },
        },
      },
      selected: {},
    },
  }
}
export const MuiFormLabel = ({
  colorBase,
}: any): { styleOverrides: ComponentsOverrides['MuiFormLabel'] } => {
  return {
    styleOverrides: {
      root: {
        color: colorBase.textSecondary,
        lineHeight: 1,
        boxSizing: 'border-box',
        '&.MuiInputLabel-shrink': {
          transform: 'none',
        },
        '&.Mui-focused': {
          color: colorBase.textSecondary,
        },
      },
    },
  }
}
export const MuiBreadcrumbs = (): {
  styleOverrides: ComponentsOverrides['MuiBreadcrumbs']
} => {
  return {
    styleOverrides: {
      root: {
        ' .MuiLink-root': {
          textDecoration: 'none',
        },
      },
    },
  }
}
export const MuiList = () => {
  return {
    styleOverrides: {
      root: {
        '&.MuiList-padding': {
          padding: '0.8rem 0',
        },
      },
    },
  }
}
export const MuiListItem = ({ colorBase }: any) => {
  return {
    styleOverrides: {
      root: {
        height: pxToRem(32),
        paddingLeft: pxToRem(20),
        paddingRight: pxToRem(20),
        color: colorBase.textSecondary,
        '&:hover': {
          color: colorBase.textButtonSelect,
          background: colorBase.boxHover,
        },
        '&.Mui-selected, &.Mui-focusVisible': {
          backgroundColor: 'transparent',
          color: colorBase.textButtonSelect,
          // " .MuiTypography-body1":{
          //     color: colorBase.textButtonSelect,
          // },
          '&:hover': {
            color: colorBase.textButtonSelect,
            // " .MuiTypography-body1":{
            //     color: colorBase.textButtonSelect,
            // },
          },
        },
        ' .MuiListItemAvatar-root': {
          color: colorBase.buttonIcon, // "var(--color-button-icon)"
        },
      },
    },
  }
}
export const MuiMenu = ({ colorBase }: any) => {
  return {
    styleOverrides: {
      root: {
        ' .MuiBackdrop-root': {
          opacity: '0 !important',
        },
      },
      list: {
        backgroundColor: colorBase.popBg,
      },
    },
  }
}
export const MuiMenuItem = ({ colorBase, themeMode }: any) => {
  return {
    styleOverrides: {
      root: {
        height: pxToRem(32),
        borderLeft: borderFunc(themeMode).borderConfig({
          c_key: 'var(--opacity)',
        }), ////`1px solid transparent`,
        // borderLeftColor: 'transparent',
        paddingLeft: pxToRem(12),
        paddingRight: pxToRem(12),
        color: colorBase.textSecondary,
        '&.Mui-selected, &.Mui-selected.Mui-focusVisible': {
          background: colorBase.boxHover,
          color: colorBase.textButtonSelect,
          // " .MuiTypography-body1":{
          //     color: colorBase.textButtonSelect,
          // },
        },

        // backgroundColor: `${colorBase.borderHover} !important`,
        '&:hover, &.Mui-selected:hover': {
          // background:'inherit',
          // color: colorBase.textPrimary,
          // borderColor: colorBase.primaryLight,
          background: colorBase.boxHover,
        },
        '& .MuiListItemText-multiline': {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'space-between',
          flexWrap: 'noWrap',
          justifyContent: 'space-between',
          '&.Mui-selected, &.Mui-selected.Mui-focusVisible': {
            '&:after': {
              display: 'none',
            },
          },
        },
        // '&.Mui-selected, &.Mui-selected.Mui-focusVisible': {
        //     // backgroundColor: 'transparent',
        //     background: 'none',
        //     color: colorBase.textPrimary,
        //     // '&:after': {
        //     //     fontSize: '1.6rem',
        //     //     height: '1em',
        //     //     width: '1em',
        //     //     right: '1em',
        //     //     position: 'absolute',
        //     //     display: 'block',
        //     //     content: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 13' fill='` + encodeURIComponent(colorBase.primaryLight) + `'><path fillRule='evenodd' clipRule='evenodd' d='M17.7071 0.292893C18.0976 0.683417 18.0976 1.31658 17.7071 1.70711L6.70711 12.7071C6.31658 13.0976 5.68342 13.0976 5.29289 12.7071L0.292893 7.70711C-0.0976311 7.31658 -0.0976311 6.68342 0.292893 6.29289C0.683417 5.90237 1.31658 5.90237 1.70711 6.29289L6 10.5858L11.1464 5.43934L16.2929 0.292893C16.6834 -0.0976311 17.3166 -0.0976311 17.7071 0.292893Z' /></svg>\")`
        //     // }
        // },
      },
    },
  }
}
export const MuiTab = ({ colorBase }: any): { styleOverrides: ComponentsOverrides['MuiTab'] } => {
  return {
    styleOverrides: {
      root: {
        fontWeight: 'normal',
        padding: `${unit * 2}px`,
        maxWidth: 'initial',
        minWidth: 'auto !important',
        fontSize: fontDefault.h5,
        color: colorBase.textSecondary,
        '&:hover': {
          backgroundColor: 'transparent',
        },
        '&.MuiTab-root': {
          textTransform: 'capitalize',
        },
        '&.Mui-selected': {
          color: colorBase.textPrimary,
          '&:after': hr({ colorBase }),
        },
        '&:focus-visible::after, &:active::after, &.Mui-selected:after': hr({
          colorBase,
        }),
        '&MuiTab-fullWidth.:focus-visible::after, &.MuiTab-fullWidth:active::after, &.MuiTab-fullWidth.Mui-selected:after':
          {
            margin: 0,
          },
        '> div, > button': {
          height: 'calc(100% - 2px)',
          textTransform: 'capitalize',
        },
        '.MuiTabs-indicator': {
          display: 'none',
        },
        '.MuiTabs-small &.MuiTab-root': {
          fontSize: fontDefault.body1,
          padding: `${unit}px`,
          minHeight: `36px`,
        },
      },
    },
  }
}
export const MuiTabs = () => {
  return {
    styleOverrides: {
      root: {
        '& .MuiTabs-indicator': {
          display: 'none',
          background: 'red',
        },
        '& .MuiTabs-small': {
          minHeight: '28px',
          height: '28px',
          fontSize: '',
        },
      },
    },
  }
}
export const MuiListItemAvatar = () => {
  return {
    styleOverrides: {
      root: {
        minWidth: 'auto',
        marginRight: `${unit}px`,
        '.MuiAvatar-root': {
          height: `var(--list-menu-coin-size)`,
          width: `var(--list-menu-coin-size)`,
          svg: {
            height: `var(--header-menu-icon-size)`,
            width: `var(--header-menu-icon-size)`,
          },
        },
      },
    },
  }
}
export const MuiDivider = ({ colorBase }: any) => {
  return {
    styleOverrides: {
      root: {
        borderColor: `${colorBase.divide}`,
        // margin: `${unit / 4 * 5}px 0`,
      },
    },
  }
}

export const MuiAlert = ({ colorBase }: any) => {
  return {
    styleOverrides: {
      root: {
        // backgroundColor: colorBase.borderDark,
        // backgroundColor: 'var(--color-pop-bg)',
        backgroundColor: colorBase.popBg,
        height: `auto`,
        '.MuiAlertTitle-root': {
          color: colorBase.textPrimary,
          fontSize: pxToRem(16),
        },
      },
    },
  }
}

export const MuiDialogTitle = ({ colorBase }: any) => {
  return {
    styleOverrides: {
      root: {
        '&.MuiDialogTitle-root': {
          color: colorBase.textPrimary,
          fontSize: pxToRem(16),
          padding: `${2 * unit}px`,
        },
      },
    },
  }
}
export const MuiDialog = ({ colorBase }: any) => {
  return {
    styleOverrides: {
      root: {
        ' .MuiPaper-root': {
          background: colorBase.box,
          borderRadius: pxToRem(4),
        },
        ' .MuiDialogContent-root': {
          padding: `0 ${2 * unit}px ${2 * unit}px ${2 * unit}px`,
        },
        ' .MuiDialogActions-root': {
          padding: `0 ${2 * unit}px ${2 * unit}px ${2 * unit}px`,
        },
      },
    },
  }
}

export const MuiSnackbar = () => {
  return {
    styleOverrides: {
      root: {
        '@media (min-width: 600px)': {
          top: `${unit * 10}px`,
          right: `${unit * 2}px`,
        },
        top: `${unit * 10}px`,
        right: `${unit * 2}px`,
        width: 'auto',
        minHeight: `${unit * 10}px`,
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        pointerEvents: 'none' as any,
      },
    },
  }
}

export const MuiLinearProgress = ({ colorBase }: any) => {
  return {
    styleOverrides: {
      root: {
        height: '0.8rem',
      },
      barColorPrimary: {
        backgroundColor: colorBase.star,
        borderRadius: '28px',
      },
      determinate: {
        backgroundColor: colorBase.borderHover,
        borderRadius: '28px',
      },
    },
  }
}

export const MuiTooltip = ({
  colorBase,
}: any): { styleOverrides: ComponentsOverrides['MuiTooltip'] } => {
  return {
    styleOverrides: {
      tooltip: {
        fontSize: fontDefault.body2,
        fontWeight: 400,
        color: colorBase.textSecondary,
        background: colorBase.popBg,
        boxShadow: colorBase.shadowHover,
        lineHeight: '1.5em',
      },
      // root: {
      //   fontSize: fontDefault.body1,
      //   color: colorBase.textSecondary,
      // },
    },
  }
}
