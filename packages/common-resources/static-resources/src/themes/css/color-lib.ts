export const ColorDarkDefault = Object.freeze({
    primary: '#3B5AF4',
    primaryLight: '#1C96FF',
    primaryDark: '#0426CC',
    primaryHover: '#627BF6',
    secondary: '#F0B90B',
    secondaryLight: '#F0B90B',
    secondaryDark: '#F3A008',
    info: '#1890FF',
    infoHover: '#46A6FF',
    infoVisited: '#1064B2',
    success: '#00BBA8',
    error: '#FF5677',
    warning: '#F2994A',
    textPrimary: "#FFFFFF",
    textPrimaryLight: "#E6EEFF",
    textSecondary: "#A4ABC1",
    textDisable: "#A1A7BB",
    textHint: "rgba(255, 255, 255, 0.38)",
    textBtnDisabled: 'rgba(255, 255, 255, 0.25)',
    backgroundGlobal: '#1F2034',
    backgroundBox: '#2D2F4B',  //#191C30
    backgroundHeader: 'rgba(45, 47, 75, 0.5)',
    backgroundSecondary: '#0D1746', //'#1F2126',
    backgroundDisabled: '#404871',
    backDrop: 'rgba(0,0,0,.1)',
    blur: '#A1A7BB',
    borderColor: '#49527D',
    borderHover: '#393F64',
    backgroundField:'#212530',
    backgroundFieldOpacity:'rgba(255,255,255,.1)',
    backgroundInput: '#343754',
    backgroundInputOpacity:'rgba(255, 255, 255, .1)',
    backgroundSwapPanelLinear: 'linear-gradient(194.79deg, #322C53 17.96%, #262B50 44.29%, #32314F 96.93%)',
    outline: '#282C48',
    focus: "rgba(235, 238, 255, 0.6)",
    vipBgColor: "rgba(255, 242, 202, 0.2)",
    shadowBox: "0px 4px 38px rgba(0, 0, 0, 0.16)",
    modalMask: 'rgba(0, 0, 0, 0.7)',
    dividerColor: 'rgba(255, 255, 255, 0.1)',
    checkboxDefault: '#687295',
    background: () => {
        return {
            default: ColorDarkDefault.backgroundBox,
            bg: ColorDarkDefault.backgroundGlobal,
            active: ColorDarkDefault.textSecondary,
            secondary: ColorDarkDefault.backgroundSecondary,
            outline: ColorDarkDefault.outline,
            backDrop: ColorDarkDefault.backDrop,
            field:ColorDarkDefault.backgroundField,
            fieldOpacity: ColorDarkDefault.backgroundFieldOpacity,
            hover: ColorDarkDefault.backgroundFieldOpacity,
            disabled: ColorDarkDefault.backgroundDisabled,
            swap: ColorDarkDefault.backgroundSwapPanelLinear,
            header: ColorDarkDefault.backgroundHeader,
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


