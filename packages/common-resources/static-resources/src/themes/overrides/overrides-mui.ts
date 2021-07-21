import { borderFunc, pxToRem } from './utils';
import {  ComponentsOverrides } from '@material-ui/core/';
import { rgba } from 'polished';
import { fontDefault } from '../css/global';

const opacity = 1;
export const unit = 8;
export const radius = 4;
export const checboxSize = 18;
const hr = ({colorBase}: any) => {
    return {
        borderRadius: `${radius}px`,
        content: '\"\"',
        margin: `0 ${unit}px`,
        display: 'block',
        height: '4px',
        backgroundColor: colorBase.primaryLight,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    }
}

export const MuiCheckbox = ({colorBase}: any): { styleOverrides: ComponentsOverrides['MuiCheckbox'] } => {
    const width = pxToRem(checboxSize);
    const height = pxToRem(checboxSize);
    return {
        styleOverrides: {
            root: {
                height: pxToRem(32),
                ' svg': {
                    width,
                    height
                },
                '&.MuiCheckbox-colorDefault': {
                    color: colorBase.textPrimary,
                },


            }
        }
    }
}
export const MuiCard = ({colorBase}: any) => {
    return {
        styleOverrides: {
            root: {
                backgroundColor: colorBase.background().default
            }
        }
    }
}

export const MuiLink = ({colorBase}: any) => {
    return {
        styleOverrides: {
            root: {
                color: colorBase.primaryLight
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
                    backgroundColor: colorBase.background().backDrop,
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
    const borderWidth = 3.5;
    const width = pxToRem(56);
    const height = pxToRem(34);
    const size = pxToRem(22);
    const gap = (34 - 22) / 2;
    return {
        styleOverrides: {
            root: {
                width,
                height,
                padding: 0,
                margin: pxToRem(8),
                overflow: 'unset',
                '& .MuiIconButton-root': {
                    padding: pxToRem(gap),
                    height: 'auto',
                    width: 'auto'
                },
                '& .Mui-checked': {
                    color: colorBase.textPrimary,
                    transform: `translateX(calc(${width} - ${size} - ${pxToRem(2 * gap)}))`,
                    '& + .MuiSwitch-track.MuiSwitch-track': {
                        backgroundColor: 'transparent',
                        opacity: opacity,
                        borderWidth,
                        border: `solid ${colorBase.primaryLight}`,
                    },
                    '& .MuiSwitch-thumb': {
                        backgroundColor: colorBase.primaryLight,
                        opacity: opacity,
                    }
                },
                '& .MuiIconButton-root.Mui-disabled': {
                    '&.Mui-checked .MuiSwitch-thumb': {
                        backgroundColor: colorBase.primaryLight,
                    },
                    '& + .MuiSwitch-track': {
                        backgroundColor: colorBase.border().blur,
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
                borderRadius: pxToRem(4),
                fontWeight: 'normal',
                paddingLeft: pxToRem(12),
                paddingRight: pxToRem(12)
            },
            contained: {
                '&:hover': {
                    // backgroundColor: colorBase.hoverSecondary,
                },
                height: pxToRem(44),
                fontSize: '1.6rem',
                '&.Mui-disabled': {
                    backgroundColor: colorBase.border().blur,
                    color: colorBase.textSecondary,
                    // backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='%23FFFFFF33' stroke-width='1' stroke-dasharray='4%25%2c 8%25' stroke-dashoffset='5' stroke-linecap='square'/%3e%3c/svg%3e")`

                },
            },
            sizeLarge: {
                height: pxToRem(52),
                fontSize: '1.6rem',
                fontWeight: 'normal',
                //     '& .MuiButton-label': {
                //
                // }
            },
            sizeSmall: {
                height: pxToRem(32),
                fontSize: '1.4rem'
                //     '& $label': {
                //
                // },

            },
            outlinedSizeSmall: {
                height: pxToRem(28),
                fontSize: '1.4rem'
            },
            outlined: {
                height: pxToRem(32),
                // boxShadow: '0px 4px 62px rgba(0, 0, 0, 0.25)',
                fontSize: '1.4rem',
                fontWeight: 'normal',
                color: colorBase.textPrimary,
                borderColor: colorBase.border().blur,
                backgroundColor: colorBase.background().outline,
                '&:hover': {borderColor: colorBase.textPrimary},
                '&.Mui-disabled': {
                    backgroundColor: colorBase.border().blur,
                    color: colorBase.textSecondary,
                    border: 0,
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='%23FFFFFF33' stroke-width='1' stroke-dasharray='4%25%2c 8%25' stroke-dashoffset='5' stroke-linecap='square'/%3e%3c/svg%3e")`
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
                backgroundColor: colorBase.background().secondary,
                '&.MuiPopover-paper': {
                    backgroundImage: 'none',
                    backgroundColor: colorBase.background().secondary,
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
                margin: '-4px',
                '&.MuiSvgIcon-fontSizeLarge': {
                    height: 'var(--svg-size-large)',
                    width: 'var(--svg-size-large)',
                    margin: '-6px',
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


export const MuiIconButton = {
    styleOverrides: {
        root: {
            height: 'var(--btn-icon-size)',
            width: 'var(--btn-icon-size)',
            ' svg': {
                height: 'var(--svg-size-large)',
                width: 'var(--svg-size-large)',
            },
            '&.MuiIconButton-sizeSmall': {
                height: 'var(--btn-icon-size-small)',
                width: 'var(--btn-icon-size-small)',
                ' svg': {
                    height: 'var(--svg-size)',
                    width: 'var(--svg-size)',
                },
            },
            // margin: 0,
            // display: 'flex',
            // justifyContent: 'center',
            // justifyItems: 'center',
            // alignItems: 'center'
        },
        label: {
            width: 'auto'
        }

    },
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
export const MuiInputBase = ({colorBase}: any): { styleOverrides: ComponentsOverrides['MuiInputBase'] } => {
    return {
        styleOverrides: {
            root: {
                'label + &': {
                    marginTop: 24,
                },
                position: 'relative',
                // border: `1px solid ${colorBase.border().blur}`,
                fontSize: '1.4rem',
                backgroundColor: colorBase.background().outline,
                borderRadius: 4,
                '&:not(.MuiFormControl-fullWidth)': {
                    // width: 'var(--btn-min-width)',
                    minWidth: 'var(--btn-min-width)',
                    // maxWidth: 'var(--btn-max-width)',
                },
                '& .MuiListItemText-multiline': {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'space-between',
                    flexWrap: 'noWrap',
                    justifyContent: 'space-between',
                    margin: 0,
                },
                '& fieldset': {
                    display: 'none',
                },
                '& svg': {
                    pointerEvents: 'none',
                },
                paddingRight: 0
                // padding: '10px 12px',

                // transition: theme.transitions.create([
                //                 //     'border-color',
                //                 //     'background-color',
                //                 //     'box-shadow',
                //                 // ]),
            },
            input: {
                padding: '.6rem 2.4rem .6rem .8rem',
                height: pxToRem(24),
                lineHeight: pxToRem(24),
                ' .MuiTypography-root': {
                    height: pxToRem(24),
                    lineHeight: pxToRem(24),
                }
                //
                // lineHeight: 24px;
            },

        }
    }
}
export const MuiToggleButton = ({colorBase, themeMode}: any) => {
    return {
        styleOverrides: {
            root: {
                '&.MuiToggleButton-sizeSmall': {
                    height: pxToRem(24),
                    fontSize: '1.2rem'
                },
                height: pxToRem(28),
                boxShadow: '0px 4px 62px rgba(0, 0, 0, 0.25)',
                borderRadius: '4px !important',
                margin: '0 8px',
                fontSize: '1.4rem',
                color: colorBase.textPrimary,
                borderColor: colorBase.border().blur,
                '&&:not(:first-of-type), &&:not(:last-child)': {
                    borderColor: colorBase.border().blur,
                },
                backgroundColor: colorBase.background().outline,
                '&:hover': {
                    borderColor: colorBase.textPrimary,
                    '&:not(:last-child), &:not(:first-of-type)': {
                        borderColor: colorBase.textPrimary,
                    },
                    '&.Mui-selected,&.Mui-selected': {
                        borderColor: colorBase.primaryLight,
                    }
                },
                '&.Mui-disabled': {
                    backgroundColor: colorBase.border().blur,
                    color: colorBase.textSecondary,
                    border: 0,
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='4' ry='4' stroke='%23FFFFFF33' stroke-width='1' stroke-dasharray='4%25%2c 8%25' stroke-dashoffset='5' stroke-linecap='square'/%3e%3c/svg%3e")`
                },
                '&&.Mui-selected, &&.Mui-selected + &.Mui-selected': {
                    color: colorBase.primaryLight,
                    backgroundColor: rgba(colorBase.primaryLight, 0.1),
                    border: borderFunc(themeMode).borderConfig({c_key: rgba(colorBase.primaryDark, 0.5)})
                }
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
                    color: colorBase.primaryLight,
                    '&:hover': {
                        backgroundColor: colorBase.background().hover,
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
export const MuiListItem = ({colorBase}: any) => {
    return {
        styleOverrides: {
            root: {
                height: pxToRem(32),
                borderLeft: '1px solid',
                borderColor: 'transparent',
                paddingLeft: pxToRem(20),
                paddingRight: pxToRem(20),
                '&:hover, &.Mui-selected:hover': {
                    borderColor: colorBase.primaryLight,
                    backgroundColor: colorBase.background().hover,
                },
                '&.Mui-selected, &.Mui-selected.Mui-focusVisible': {
                    backgroundColor: 'transparent',
                    color: colorBase.primaryLight,
                }
            },
        }
    }
}
export const MuiMenuItem = ({colorBase}: any) => {
    return {
        styleOverrides: {
            root: {
                height: pxToRem(32),
                borderLeft: '1px solid',
                borderLeftColor: 'transparent',
                paddingLeft: pxToRem(12),
                paddingRight: pxToRem(12),
                '&:hover, &.Mui-selected:hover': {
                    borderColor: colorBase.primaryLight,
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
                '&.Mui-selected, &.Mui-selected.Mui-focusVisible': {
                    backgroundColor: 'transparent',
                    color: colorBase.primaryLight,
                    '&:after': {
                        fontSize: '1.6rem',
                        height: '1em',
                        width: '1em',
                        right: '1em',
                        position: 'absolute',
                        display: 'block',
                        content: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 13' fill='` + encodeURIComponent(colorBase.primaryLight) + `'><path fill-rule='evenodd' clip-rule='evenodd' d='M17.7071 0.292893C18.0976 0.683417 18.0976 1.31658 17.7071 1.70711L6.70711 12.7071C6.31658 13.0976 5.68342 13.0976 5.29289 12.7071L0.292893 7.70711C-0.0976311 7.31658 -0.0976311 6.68342 0.292893 6.29289C0.683417 5.90237 1.31658 5.90237 1.70711 6.29289L6 10.5858L11.1464 5.43934L16.2929 0.292893C16.6834 -0.0976311 17.3166 -0.0976311 17.7071 0.292893Z' /></svg>\")`
                    }
                }
            },
        }
    }
}
export const MuiTab = ({colorBase}: any) => {
    return {
        styleOverrides: {

            root: {
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
export const MuiDivider = ({colorBase}: any) => {
    return {
        styleOverrides: {
            root: {
                borderColor: `${colorBase.border().blur}`,
                margin: `${unit / 2 * 5}px 0`,
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
