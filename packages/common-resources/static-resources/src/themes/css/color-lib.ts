export const ColorDarkDefault = Object.freeze({
    // primary: '#1C42FF',
    primary: '#3B5AF4',
    primaryLight: '#1C96FF',
    primaryDark: '#0426CC',
    primaryHover: '#4F6AF5',
    secondary: '#F0B90B',
    secondaryLight: '#F0B90B',
    secondaryDark: '#F3A008',
    success: '#00BBA8',
    error: '#FF5677',
    warning: '#F2994A',
    textPrimary: "#FFFFFF",
    textPrimaryLight: "#E6EEFF",
    textSecondary: "#A1A7BB",
    // textDisable: "#282C48",
    textDisable: "#A1A7BB",
    textHint: "rgba(255, 255, 255, 0.38)",
    // backgroundGlobal: 'linear-gradient(0deg, rgba(20, 23, 44, 0.8), rgba(20, 23, 44, 0.68)), linear-gradient(106.98deg, rgba(32, 51, 143, 1) -0.48%, rgba(15, 30, 100, 1) 52.64%,  rgba(114, 44, 115, 1) 100.5%)',
    backgroundGlobal: '#171828',
    // backgroundBox: 'rgba(0,0,0,.44)',  //#191C30
    backgroundBox: '#2D2F4B',  //#191C30
    // backgroundHeader: '#070a21',
    backgroundHeader: '#2D2F4B',
    backgroundSecondary: '#0D1746', //'#1F2126',
    backgroundHover: 'rgba(235, 238, 255, 0.1)',
    backgroundDisabled: '#3D4064',
    // blur: 'rgba(255,255,255,.1)',
    blur: '#A1A7BB',
    borderColor: '#585A82',
    // outline: 'rgba(235, 238, 255, 0.1)',
    outline: '#282C48',
    focus: "rgba(235, 238, 255, 0.6)",
    vipBgColor: "rgba(255, 242, 202, 0.2)",
    shadowBox: "0px 4px 38px rgba(0, 0, 0, 0.16)",
    background: () => {
        return {
            default: ColorDarkDefault.backgroundBox,
            bg: ColorDarkDefault.backgroundGlobal,
            active: ColorDarkDefault.textSecondary,
            secondary: ColorDarkDefault.backgroundSecondary,
            outline: ColorDarkDefault.outline,
            backDrop: ColorDarkDefault.blur,
            hover: ColorDarkDefault.backgroundHover,
            disabled: ColorDarkDefault.backgroundDisabled,
        }
    },
    border: () => {
        return {
            default: ColorDarkDefault.borderColor,
            selected: ColorDarkDefault.primaryLight,//'#1C96FF',
            blur: ColorDarkDefault.blur,//ColorDarkDefault.textDisable
            focus: ColorDarkDefault.focus,
        }
    }
})
export const ColorLightDefault = Object.freeze({...ColorDarkDefault})
export type ColorBaseInterface = typeof ColorDarkDefault


