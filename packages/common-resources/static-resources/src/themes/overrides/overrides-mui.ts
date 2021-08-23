import { borderFunc, pxToRem } from './utils';
import { ComponentsOverrides } from '@material-ui/core/';
import { fontDefault } from '../css/global';

const opacity = 1;
export const unit = 8;
export const radius = 4;
export const checkBoxSize = 18;
const hr = ({colorBase}: any) => {
    return {
        borderRadius: `${radius}px`,
        content: '\"\"',
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

export const MuiCheckbox = ({colorBase}: any): { styleOverrides: ComponentsOverrides['MuiCheckbox'] } => {

    return {
        styleOverrides: {
            root: {
                '&.MuiCheckbox-colorDefault': {
                    color: colorBase.textSecondary,
                },
                '&:hover': {
                    backgroundColor: 'inherit',
                    color: colorBase.textPrimary,
                },
                '&.Mui-checked': {
                    color: colorBase.textPrimary,
                },
            },
        }
    }
}
export const MuiCard = ({colorBase}: any) => {
    return {
        styleOverrides: {
            root: {
                backgroundColor: colorBase.box,
                padding: pxToRem(24),
            },
        }
    }
}

export const MuiCardContent = () => {
    return {
        styleOverrides: {
            root: {
                padding: pxToRem(8),
            }
        }
    }
}

export const MuiCardActions = () => {
    return {
        styleOverrides: {
            root: {
                padding: 0,
            }
        }
    }
}

export const MuiLink = ({colorBase}: any) => {
    return {
        styleOverrides: {
            root: {
                color: colorBase.secondary,
                '&:hover': {
                    color: colorBase.secondaryHover,
                },
                '&.Mui-selected': {
                    color: colorBase.secondaryPressed,
                }
            }
        }
    }
}

export const MuiTextField = (): { styleOverrides: ComponentsOverrides['MuiTextField'] } => {
    return {
        styleOverrides: {
            root: {
                '.MuiFormHelperText-root': {
                    marginLeft: 0,
                    marginRight: 0,
                    textAlign: 'right',
                }
            }
        }
    }
}


export const MuiModal = ({colorBase}: any) => {
    return {
        styleOverrides: {
            root: {
                color: colorBase.textPrimary,
                ' .MuiBackdrop-root': {
                    zIndex: -1,
                    backgroundColor: colorBase.mask,
                },
            }
        }
    }
}

export const MuiToolbar = () => {
    return {
        styleOverrides: {
            root: {height: 'var(--header-height)'}
        }
    }
}
export const MuiSwitch = ({colorBase}: any): { styleOverrides: ComponentsOverrides['MuiSwitch'] } => {
    const borderWidth = 2;
    const padding = borderWidth + 2;
    const width = pxToRem(46);
    const height = pxToRem(24);
    const size = pxToRem(16);
    // const gap =  (38 - (borderWidth + padding)*2);
    return {
        styleOverrides: {
            root: {
                width,
                height,
                padding: 0,
                margin: pxToRem(8),
                overflow: 'unset',
                '& .MuiIconButton-root': {
                    padding: pxToRem(padding),
                    height: 'auto',
                    width: 'auto'
                },
                '& .Mui-checked': {
                    color: colorBase.textPrimary,
                    // transform: `translateX(-${gap}px)`,
                    '& + .MuiSwitch-track.MuiSwitch-track': {
                        backgroundColor: 'transparent',
                        opacity: opacity,
                        borderWidth,
                        border: `solid ${colorBase.primary}`,
                    },
                    '& .MuiSwitch-thumb': {
                        backgroundColor: colorBase.primary,
                        opacity: opacity,
                    }
                },
                '& .MuiIconButton-root.Mui-disabled': {
                    '&.Mui-checked .MuiSwitch-thumb': {
                        backgroundColor: colorBase.primary,
                    },
                    '& + .MuiSwitch-track': {
                        backgroundColor: colorBase.divide,
                        border: 'none',
                        opacity: 0.6 * opacity,
                    },
                    '& .MuiSwitch-thumb': {
                        backgroundColor: colorBase.textSecondary,
                        opacity: .6 * opacity,
                    }
                }

            },
            colorPrimary: {},
            track: {
                borderRadius: 40,
                border: `solid ${colorBase.textSecondary}`,
                borderWidth,
                backgroundColor: 'transparent', //${colorBase.textSecondary},
                '&&': {
                    opacity: opacity,
                },
                //transition: theme.transitions.create(['background-color', 'border']),
                boxSizing: 'border-box',
            },

            thumb: {
                boxShadow: 'none',
                backgroundColor: colorBase.textSecondary, // this.palette.grey[400],
                width: size,
                height: size,
            },

        }
    }
}

export const MuiButton = ({colorBase}: any): { styleOverrides: ComponentsOverrides['MuiButton'] } => {
    return {
        styleOverrides: {
            root: {
                'textTransform': 'capitalize',
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
            },
            text: {
                color: colorBase.secondary,
                fontSize: '1.4rem',
                '&:hover': {
                    color: colorBase.secondaryHover,
                    backgroundColor: 'inherit',
                },
                '&:active': {
                    color: colorBase.secondaryPressed
                },
                '&:disabled': {
                    color: colorBase.disable
                },
                '& .MuiButton-endIcon,& .MuiButton-startIcon': {
                    color: colorBase.buttonIcon
                }
            },
            contained: {
                color: colorBase.textButton,
                height: pxToRem(40),
                fontSize: pxToRem(14),
                backgroundColor: colorBase.primary,
                '&:hover': {
                    backgroundColor: colorBase.primaryHover,
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
                fontSize: '1.6rem'
                //     '& $label': {
                //
                // },

            },
            outlinedSizeSmall: {
                height: pxToRem(24),
                fontSize: '1.2rem'
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
                '&.Mui-disabled': {
                    // backgroundColor: colorBase.defaultDisable,
                    color: colorBase.textDisable,
                    border: `1px dashed ${colorBase.textDisable}`,
                    // borderColor:
                    // backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='%23FFFFFF33' stroke-width='1' stroke-dasharray='4%25%2c 8%25' stroke-dashoffset='5' stroke-linecap='square'/%3e%3c/svg%3e")`
                },
            },
            // outlinedSecondary:{
            //     borderColor: colorBase.primaryLight,
            //     color: colorBase.primaryLight,
            //     '&:hover': {borderColor: colorBase.primary},
            // },
        }

    }
}


// @ts-ignore
export const MuiPopover = ({colorBase}: any): { styleOverrides: ComponentsOverrides['MuiPopover'] } => {
    return {
        styleOverrides: {}

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

export const MuiPaper = ({colorBase}: any): { styleOverrides: ComponentsOverrides['MuiPaper'] } => {
    return {
        styleOverrides: {
            root: {
                borderRadius: pxToRem(8),
                backgroundImage: 'none',
                backgroundColor: colorBase.popBg,
                '&.MuiPopover-paper': {
                    backgroundImage: 'none',
                    // backgroundColor: colorBase.popBg
                    // backgroundColor: colorBase.background().popupBg2,
                    // backgroundColor: colorBase.popBg,
                },
            }
        }

    }
}
export const MuiSvgIcon = () => {
    return {
        styleOverrides: {
            root: {
                height: 'var(--svg-size)',
                width: 'var(--svg-size)',
                // margin: '-4px',
                '&.MuiSvgIcon-fontSizeLarge': {
                    height: 'var(--svg-size-large)',
                    width: 'var(--svg-size-large)',
                    // margin: '-6px',
                },
                '&.tag': {
                    width: 'auto',
                    height: 'auto',
                }
            },

        }
    }
}
//@ts-ignore
export const MuiRadio = ({colorBase}: any) => {
    return {
        styleOverrides: {
            root: {
                ' svg': {
                    height: 'var(--svg-size)',
                    width: 'var(--svg-size)',
                }
            }
        }

    }
}


export const MuiInputLabel = ({colorBase}: any): { styleOverrides: ComponentsOverrides['MuiInputBase'] } => {
    return {
        styleOverrides: {
            root: {
                fontSize: '1.4rem',
                height: 20,
                transform: 'none',
                top: 0,
                left: 0,
                '&.Mui-focused': {
                    color: colorBase.textSecondary,
                },
                '&.Mui-disabled ': {
                    color: colorBase.textSecondary,
                }
            }
        }
    }
}
export const MuiInputBase = ({colorBase, themeMode}: any): { styleOverrides: ComponentsOverrides['MuiInputBase'] } => {
    return {
        styleOverrides: {
            root: {
                'label + &': {
                    marginTop: 24,
                },
                position: 'relative',
                fontSize: '1.4rem',
                backgroundColor: colorBase.box,
                border: borderFunc(themeMode).borderConfig({c_key: colorBase.border}),//`1px solid ${colorBase.border}`,
                borderRadius: 4,
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
                ' .MuiInputAdornment-root': {
                    pointerEvents: 'none',
                    color: 'inherit',
                },
                paddingRight: 0,
                '&:hover': {
                    border: borderFunc(themeMode).borderConfig({c_key: colorBase.borderHover}),//`1px solid ${colorBase.border}`,
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
                    color: 'var(--color-text-secondary)',
                    '&$focused': {
                        background: 'transparent',
                    },

                    ' svg': {
                        right: '.4rem',
                        top: 1,
                        position: 'absolute',
                        pointerEvents: 'none',
                        transition: 'fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                        color: 'var(--color-text-secondary)'
                    },
                    '&.MuiInputBase-root': {
                        minWidth: 'auto',
                        width: 'auto'
                    }
                },
                '&.MuiOutlinedInput-root': {
                    padding: '.3rem 2.4rem .3rem .8rem',
                    minWidth: 'auto',
                },
                ' .MuiOutlinedInput-input': {
                    padding: 0,
                    height: pxToRem(24),
                },
                ' .MuiSelect-outlined': {
                    // padding: '.3rem 2.4rem .3rem .8rem',
                    height: pxToRem(24),
                    lineHeight: pxToRem(24), minWidth: 'auto',

                },
            },

        }
    }
}


export const MuiIconButton = ({colorBase}: any): { styleOverrides: ComponentsOverrides['MuiIconButton'] } => {
    return {
        styleOverrides: {
            root: {
                height: 'var(--btn-icon-size)',
                width: 'var(--btn-icon-size)',
                ' svg': {
                    height: 'var(--svg-size-large)',
                    width: 'var(--svg-size-large)',
                    color: 'inherit',
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
                    }
                }
            },
            label: {
                width: 'auto'
            }
        }
    }
}

export const MuiToggleButton = ({colorBase}: any): { styleOverrides: ComponentsOverrides['MuiToggleButton'] } => {
    return {
        styleOverrides: {
            root: {
                '&.MuiToggleButton-sizeMedium':{
                    fontSize: '1.4rem'
                },
                height: pxToRem(28),
                // boxShadow: '0px 4px 62px rgba(0, 0, 0, 0.25)',
                borderRadius: '4px !important',
                marginRight: pxToRem(2),
                fontSize: '1.4rem',
                color: colorBase.textThird,
                border: 'none',
                textTransform: 'none',
                // borderColor: colorBase.border,
                '&&:not(:first-of-type), &&:not(:last-child)': {
                    // borderColor: colorBase.border,
                },
                backgroundColor: 'inherit',
                '&:hover': {
                    backgroundColor: 'inherit',
                    color: colorBase.textButton,
                    // borderColor: colorBase.textPrimary,
                    border: 'none',
                    '&:not(:last-child), &:not(:first-of-type)': {
                        // borderColor: colorBase.textPrimary,
                    },
                    '&.Mui-selected,&.Mui-selected': {
                        // borderColor: colorBase.primary,
                    }
                },
                '&.Mui-disabled': {
                    // backgroundColor: colorBase.defaultDisable,
                    color: colorBase.textDisable,
                    border: 'none'
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
            }
        }

    }
}
export const MuiButtonBase = {
    defaultProps: {
        disableRipple: true,
    },
}
export const MuiPaginationItem = ({colorBase}: any) => {
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
                '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    color: colorBase.secondary,
                    '&:hover': {
                        backgroundColor: colorBase.opacity,
                    }
                }


            },
            selected: {}
        }
    }
}
export const MuiFormLabel = ({colorBase}: any) => {
    return {
        styleOverrides: {
            root: {
                padding: '1.2rem 0',
                display: 'inline-block',
                position: 'relative',
                fontSize: '1.4rem',
                lineHeight: 1,
                height: '38px',
                boxSizing: 'border-box',
                '&.MuiInputLabel-shrink': {
                    transform: 'none'
                },
                '&$focused': {
                    color: colorBase.textSecondary,
                }
            },
        }


    }
}
export const MuiList = () => {
    return {
        styleOverrides: {
            root: {
                '&.MuiList-padding': {
                    padding: '0.8rem 0'
                }
            }
        }
    }
}
export const MuiListItem = ({colorBase}: any) => {
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
                    border: 'none',
                    '&:hover': {
                        color: colorBase.textButtonSelect,
                        border: 'none',
                    }
                },
                ' .MuiListItemAvatar-root': {
                    color: colorBase.buttonIcon// "var(--color-button-icon)"
                }
            },
        }
    }
}
export const MuiMenu = ({colorBase}: any) => {
    return {
        styleOverrides: {
            list: {
                backgroundColor: colorBase.popBg
            }
        }
    }
}
export const MuiMenuItem = ({colorBase, themeMode}: any) => {
    return {
        styleOverrides: {
            root: {
                height: pxToRem(32),
                borderLeft: borderFunc(themeMode).borderConfig({c_key: 'var(--opacity)'}), ////`1px solid transparent`,
                // borderLeftColor: 'transparent',
                paddingLeft: pxToRem(12),
                paddingRight: pxToRem(12),
                color: colorBase.textSecondary,
                // backgroundColor: `${colorBase.borderHover} !important`,
                '&:hover, &.Mui-selected:hover': {
                    // borderColor: colorBase.primaryLight,
                    backgroundColor: colorBase.boxHover,
                },
                '& .MuiListItemText-multiline': {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'space-between',
                    flexWrap: 'noWrap',
                    justifyContent: 'space-between',
                    '&.Mui-selected, &.Mui-selected.Mui-focusVisible': {
                        '&:after': {
                            display: 'none'
                        }
                    }
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
        }
    }
}
export const MuiTab = ({colorBase}: any): { styleOverrides: ComponentsOverrides['MuiTab'] } => {
    return {
        styleOverrides: {
            root: {
                fontWeight: 'normal',
                padding: `0 ${unit * 2}px`,
                maxWidth: 'initial',
                minWidth: 'auto !important',
                fontSize: fontDefault.h5,
                color: colorBase.textSecondary,
                '&:hover': {
                    backgroundColor: 'transparent',
                },
                '.MuiTab-wrapper': {
                    textTransform: 'capitalize',
                },
                '&.Mui-selected': {
                    color: colorBase.textPrimary,
                    '&:after': hr({colorBase}),
                },
                '&:focus-visible::after, &:active::after, &.Mui-selected:after': hr({colorBase}),
                '> div, > button': {
                    height: 'calc(100% - 2px)',
                    textTransform: 'capitalize'
                },
                '.MuiTabs-indicator': {
                    display: 'none',
                }
            },

        }
    }
}
export const MuiTabs = () => {
    return {
        styleOverrides: {
            root: {
                '& .MuiTabs-indicator': {
                    display: 'none',
                    background: 'red'
                }

            },

        }
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
                    'svg': {
                        height: `var(--header-menu-icon-size)`,
                        width: `var(--header-menu-icon-size)`,
                    }
                }
            },

        }
    }
}
export const MuiDivider = ({colorBase}: any) => {
    return {
        styleOverrides: {
            root: {
                borderColor: `${colorBase.dividerColor}`,
                // margin: `${unit / 4 * 5}px 0`,
            },

        }
    }
}

export const MuiAlert = ({colorBase}: any) => {
    return {
        styleOverrides: {
            root: {
                backgroundColor: colorBase.borderDark,
                height: `${unit * 10}px`,
                '.MuiAlertTitle-root': {
                    color: colorBase.textPrimary,
                    fontSize: pxToRem(16),
                }
            },
            
        }
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
                justifyContent: 'flex-end',
                alignItems: 'flex-start'
            },
        }
    }
}
