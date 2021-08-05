import { borderFunc } from './utils';
import { ColorDarkDefault } from '../css/color-lib';
import { radius } from './overrides-mui';
import { fontDefault } from "../css/global";
import { ThemeKeys } from '../interface';

export const MuPickDate = ({colorBase, themeMode}: { colorBase: typeof ColorDarkDefault, themeMode: ThemeKeys }) => {
    return {
        MuiPickersBasePicker: {
            styleOverrides: {
                root: {
                    width: `var(--datePicker-width)`,
                    background: colorBase.backgroundBox,
                    boxShadow: colorBase.shadowBox,
                    borderRadius: radius * 2 + 'px',
                    // border: borderFunc(themeMode).borderConfig({c_key: 'blur'}),
                    border: `1px solid ${colorBase.backgroundInputOpacity}`,
                    '& svg': {
                        fontSize: '2rem',
                        color: colorBase.textSecondary
                    },
                    '& .MuiPickersCalendar-weekDayLabel': {
                        fontSize: '1rem',
                    },
                    '& .MuiPickersArrowSwitcher-root .MuiIconButton-edgeEnd': {
                        position: 'relative',
                        padding: 3,
                    }
                },

            }
        },
        MuiPicker: {
            styleOverrides: {
                root: {
                    width: `var(--datePicker-width)`,
                    background: colorBase.backgroundBox,
                    boxShadow: colorBase.shadowBox,
                    borderRadius: radius * 2 + 'px',
                    border: borderFunc(themeMode).borderConfig({c_key: 'blur'}),
                    '& svg': {
                        fontSize: '2rem',
                        color: colorBase.textSecondary
                    },
                    '& .MuiPickersCalendar-weekDayLabel': {
                        fontSize: '1rem',
                    },
                    '& .MuiPickersArrowSwitcher-root .MuiIconButton-edgeEnd': {
                        position: 'relative',
                        padding: 3,
                    }
                },

            }
        },
        MuiDateRangePickerViewDesktop: {
            styleOverrides: {
                root: {
                    '& svg': {
                        fontSize: '2rem',
                        color: colorBase.textSecondary
                    },
                    background: colorBase.backgroundBox,
                    boxShadow: colorBase.shadowBox,
                    borderRadius: radius * 2 + 'px',
                    // border: borderFunc(themeMode).borderConfig({c_key: 'blur'}),
                    border: `1px solid ${colorBase.backgroundInputOpacity}`,
                    fontSize: 1.6,
                    "& .MuiDateRangePickerViewDesktop-rangeCalendarContainer:not(:last-child)": {
                        borderColor: colorBase.border().blur,
                    },
                    "& .MuiPickersArrowSwitcher-root": {
                        border: borderFunc(themeMode).borderConfig({c_key: "rgba(0,0,0,0)"}),
                        borderBottomColor: colorBase.border().blur,
                        boxSizing: "border-box",
                        height: 52,
                        minHeight: 52,
                        maxHeight: 52,
                        margin: 0,
                        marginBottom: 0,
                        '& .MuiIconButton-root': {
                            color: colorBase.textSecondary
                        },
                        '& .MuiTypography-subtitle1,& .MuiTypography-subtitle2': {
                            fontSize: '1.4rem'
                        },

                    },
                    '& .MuiPickersCalendar-weekDayLabel': {
                        fontSize: '1rem',
                    },
                    '& .MuiDateRangePickerDay-rangeIntervalPreview,& .MuiDateRangePickerDay-rangeIntervalDayPreview': {
                        borderWidth: 0,
                    },
                    "& .MuiDateRangePickerDay-day": {
                        transform: 'none',
                    },
                    '& .MuiDateRangePickerViewDesktop-calendar': {
                        width: `var(--datePicker-width)`,
                        minHeight: `var(--datePicker-height)`,
                        marginBottom: '.8rem',
                    },
                    "& .MuiDateRangePickerDay-dayOutsideRangeInterval:hover": {
                        borderColor: 'transparent'
                    },

                }
            }
        },
        MuiPickersDesktopDateRangeCalendar: {
            styleOverrides: {
                root: {
                    '& svg': {
                        fontSize: '2rem',
                        color: colorBase.textSecondary
                    },
                    background:  colorBase.background().default,
                    boxShadow: colorBase.shadowBox,
                    borderRadius: radius * 2 + 'px',
                    border: borderFunc(themeMode).borderConfig({c_key: 'blur'}),
                    fontSize: 1.6,
                    "& .MuiTypography-subtitle1": {
                        fontSize: fontDefault.h4
                    },
                    "& .MuiPickersDesktopDateRangeCalendar-rangeCalendarContainer:not(:last-child)": {
                        borderColor: colorBase.border().blur,
                    },
                    "& .MuiPickersArrowSwitcher-root": {
                        border: borderFunc(themeMode).borderConfig({c_key: "rgba(0,0,0,0)"}),
                        borderBottomColor: colorBase.border().blur,
                        boxSizing: "border-box",
                        height: 52,
                        minHeight: 52,
                        maxHeight: 52,
                        margin: 0,
                        marginBottom: 0,
                        '& .MuiIconButton-root': {
                            color: colorBase.textSecondary
                        },
                        '& .MuiTypography-subtitle1,& .MuiTypography-subtitle2': {
                            fontSize: '1.4rem'
                        },

                    },
                    '& .MuiPickersCalendar-weekDayLabel': {
                        fontSize: '1rem',
                    },
                    '& .MuiPickersDateRangeDay-rangeIntervalPreview,& .MuiPickersDateRangeDay-rangeIntervalDayPreview': {
                        borderWidth: 0,
                    },
                    "& .MuiPickersDateRangeDay-day": {
                        transform: 'none',
                    },
                    '& .MuiPickersDesktopDateRangeCalendar-calendar': {
                        width: `var(--datePicker-width)`,
                        minHeight: `var(--datePicker-height)`,
                        marginBottom: '.8rem',
                    },
                    "& .MuiPickersDateRangeDay-dayOutsideRangeInterval:hover": {
                        borderColor: 'transparent'
                    }

                }
            }
        },
        MuiPickersDateRangeDay: {
            styleOverrides: {
                root: {
                    "&.MuiPickersDateRangeDay-rangeIntervalDayHighlight:last-child, &.MuiPickersDateRangeDay-rangeIntervalDayHighlightEnd": {
                        borderTopRightRadius: radius * 2 + 'px',
                        borderBottomRightRadius: radius * 2 + 'px',
                    },
                    '&.MuiPickersDateRangeDay-rangeIntervalDayHighlight:first-of-type, &.MuiPickersDateRangeDay-rangeIntervalDayHighlightStart': {
                        borderTopLeftRadius: radius * 2 + 'px',
                        borderBottomLeftRadius: radius * 2 + 'px',
                    },
                    '& .MuiPickersDay-root:focus.Mui-selected': {
                        backgroundColor: colorBase.primaryLight,
                    },
                    '& .MuiPickersDay-root:focus.Mui-selected,& .MuiPickersDay-root.Mui-selected,& .MuiPickersDay-root': {
                        '&:hover': {
                            borderColor: 'transparent'
                        }
                    }
                }
            }
        },
        MuiDateRangePickerDay: {
            styleOverrides: {
                root: {
                    '&.MuiDateRangePickerDay-rangeIntervalDayHighlight:last-child, &.MuiDateRangePickerDay-rangeIntervalDayHighlightEnd': {
                        borderTopRightRadius: radius * 2 + 'px',
                        borderBottomRightRadius: radius * 2 + 'px',
                    },
                    '&.MuiDateRangePickerDay-rangeIntervalDayHighlight:first-of-type, &.MuiDateRangePickerDay-rangeIntervalDayHighlightStart': {
                        borderTopLeftRadius: radius * 2 + 'px',
                        borderBottomLeftRadius: radius * 2 + 'px',
                    },
                    '& .MuiPickersDay-root:focus.Mui-selected': {
                        backgroundColor: colorBase.primaryLight,
                    }
                }
            }
        },
        MuiPickersToolbarButton: {
            styleOverrides: {
                root: {
                    fontSize: 1.6,
                }
            }
        },
        MuiPickersToolbar: {
            root: {},
        },
        MuiPickersDay: {
            styleOverrides: {
                root: {
                    '&&': {
                        fontSize: '1.4rem',
                        borderRadius: radius * 2 + 'px',
                        border: borderFunc(themeMode).borderConfig({c_key: "rgba(0,0,0,0)"}),
                    },

                    "&.Mui-selected,&:focus.Mui-selected ": {
                        backgroundColor: colorBase.primaryLight,
                        color: colorBase.textPrimaryLight,

                    },
                    "&.Mui-disabled": {
                        //backgroundColor: colorBase.primaryLight,
                        color: colorBase.textHint,

                    },
                    "&.MuiPickersDay-today": {
                        "&:not(.Mui-selected)": {
                            backgroundColor: 'transparent',
                            color: colorBase.primaryLight,
                            borderColor: 'transparent'
                        },

                        // borderColor: colorBase.primaryLight,
                        "&.Mui-selected": {
                            //backgroundColor: colorBase.primaryLight,
                            color: colorBase.textPrimary,
                            backgroundColor: colorBase.primaryLight,

                        },
                    },

                    "&:hover.Mui-selected, &:hover": {
                        backgroundColor: colorBase.background().field,
                    }


                }
            }
        },
        MuiPickersCalendar: {
            styleOverrides: {
                root: {
                    minHeight: `var(--datePicker-height)`,
                    marginBottom: '.8rem',
                }
            }
        },
        MuiPickersCalendarHeader: {
            styleOverrides: {
                root: {
                    '&&': {
                        border: borderFunc(themeMode).borderConfig({c_key: "rgba(0,0,0,0)"}),
                        borderBottomColor: colorBase.backgroundInputOpacity,
                        boxSizing: "border-box",
                        height: 52,
                        minHeight: 52,
                        maxHeight: 52,
                        margin: 0,
                        marginBottom: 0,
                        // margin:0,
                    },
                    '& .MuiButtonBase': {
                        color: colorBase.textSecondary
                    },
                    '& .MuiTypography-subtitle1': {
                        fontSize: fontDefault.h4
                    }
                }
            }
        },
        MuiPickersYear: {
            styleOverrides: {
                root: {
                    '&&': {
                        fontSize: '1.4rem'
                    },
                    '&& .MuiPickersYear-yearButton': {
                        color: colorBase.textSecondary,
                        fontSize: '1.4rem',
                        "&.Mui-selected": {
                            backgroundColor: colorBase.primaryLight,
                            color: colorBase.textPrimaryLight,
                            borderRadius: radius * 2 + 'px',
                        }
                    }
                }
            }
        },
        MuiPickersModalDialog: {
            dialogAction: {},
        },
    }
}


