export const hexToRGB = (hex:string, alpha?:string|number)=> {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha!==undefined) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha.toString() + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

export const ColorDarkDefault = Object.freeze({
    primary: '#3B5AF4',
    primaryHover: '#627BF6',
    primaryPressed: '#293EAA',
    secondary: '#1890FF',
    secondaryHover: '#46A6FF',
    secondaryPressed: '#1064B2',
    success: '#00BBA8',
    warning: '#FBA95C',
    error: '#FF5677',
    textPrimary: '#FFFFFF',
    textSecondary: '#A4ABC1',
    textThird: '#687295',
    textButton:'#FFFFFF',
    textButtonSelect:'#FFFFFF',
    textDisable: `${hexToRGB('#ffffff', '0.25')}`,
    disable:'#404871',
    border: '#49527D',
    borderHover: '#828BA7',
    borderDark: '#393F64',
    divide: '#444C75',
    box: '#2D2F4B',
    boxSecondary: '#687295',
    boxHover:  `${hexToRGB('#ffffff', '0.03')}`,
    popBg: '#393F64',
    globalBg: '#1F2034',
    boxLinear: 'linear-gradient(194.79deg, #322C53 17.96%, #262B50 44.29%, #32314F 96.93%)',
    mask: `${hexToRGB('#000000', '0.68')}`,
    white: '#ffffff',
    dark: '#000000',
    opacity: `${hexToRGB('#000000', '0')}`,
    star:`#F0B90B`,
    /********************Case for provider*******************/
    shadow: ` 0px 4px 4px ${hexToRGB('#000000', '.25')}`,
    fieldOpacity:`${hexToRGB('#ffffff', '0.1')}`,
    providerBtn:`${hexToRGB('#ffffff', '0.1')}`,
    providerBtnHover:`${hexToRGB('#ffffff', '0.03')}`,
    buttonIcon:'#A4ABC1',
    // @ts-ignore
    // textMenu:this.textSecondary,
/********************Case for provider*******************/
})
export const ColorLightDefault = Object.freeze({...ColorDarkDefault,
    primary: '#3B5AF4',
    primaryHover: '#627BF6',
    primaryPressed: '#293EAA',
    secondary: '#1890FF',
    secondaryHover: '#46A6FF',
    secondaryPressed: '#1064B2',
    success: '#00BBA8',
    warning: '#FBA95C',
    error: '#FF5677',
    textPrimary: '#15162B',
    textSecondary: '#4E5395',
    textThird: '#A3A8CA',
    textButton:'#FFFFFF',
    textButtonSelect:'#1890FF',
    textDisable: `${hexToRGB('#000000', '0.25')}`,
    disable:'#F4F5F9',
    border: '#E9EAF2',
    borderHover: '#627BF6',
    borderDark: '#293EAA',
    divide: '#E9EAF2',
    box: '#FFFFFF',
    boxSecondary: '#A3A8CA',
    boxHover:  `${hexToRGB('#4E5395', '0.1')}`,
    popBg: '#FFFFFF',
    globalBg: '#F6F7FB',
    boxLinear: '#FFFFFF',
    mask: `${hexToRGB('#000000', '0.68')}`,
    white: '#ffffff',
    dark: '#000000',
    opacity: `${hexToRGB('#FFFFFF', '0')}`,
    star:`#F0B90B`,
    /********************Case for provider*******************/
    shadow: ` 0px 4px 4px ${hexToRGB('#000000', '.25')}`,
    fieldOpacity:`#EEF1FA`,
    providerBtn:`${hexToRGB('#15162B', '0.8')}`,
    providerBtnHover:`${hexToRGB('#15162B', '0.5')}`,
    buttonIcon:'#A3A8CA',
    //${hexToRGB('#4E5395', '0.1')}

    // textMenu:this.textButton,
    /********************Case for provider*******************/
})
export type ColorBaseInterface = typeof ColorDarkDefault

//provider
// primary: '#3B5AF4',
// primaryLight: '#1C96FF',
// primaryDark: '#0426CC',
// primaryHover: '#627BF6',
// secondary: '#F0B90B',
// secondaryLight: '#F0B90B',
// secondaryDark: '#F3A008',
// info: '#1890FF',
// infoHover: '#46A6FF',
// infoVisited: '#1064B2',
// success: '#00BBA8',
// error: '#FF5677',
// warning: '#F2994A',
// textPrimary: "#FFFFFF",
//textPrimaryLight: "#E6EEFF",
// textSecondary: "#A4ABC1",
// textDisable: "#A1A7BB",
// textHint: "rgba(255, 255, 255, 0.38)",
// textBtnDisabled: 'rgba(255, 255, 255, 0.25)',
// backgroundGlobal: '#1F2034',
// backgroundBox: '#2D2F4B',  //#191C30
// backgroundHeader: 'rgba(45, 47, 75, 0.5)',
// backgroundSecondary: '#0D1746', //'#1F2126',
// backgroundDisabled: '#404871',
// backDrop: 'rgba(0,0,0,.1)',
// blur: '#A1A7BB',
// borderColor: '#49527D',
// borderHover: '#393F64',
// borderInputHover: '#828BA7',
// backgroundField:'#212530',
// backgroundFieldOpacity:'rgba(255,255,255,.1)',
// backgroundInput: '#343754',
// backgroundInputOpacity:'rgba(255, 255, 255, .1)',
// backgroundSwapPanelLinear: 'linear-gradient(194.79deg, #322C53 17.96%, #262B50 44.29%, #32314F 96.93%)',
// backgroundMenuListHover: 'rgba(255, 255, 255, 0.03);',
// outline: '#282C48',
// focus: "rgba(235, 238, 255, 0.6)",
// vipBgColor: "rgba(255, 242, 202, 0.2)",
// shadowBox: "0px 4px 38px rgba(0, 0, 0, 0.16)",
// modalMask: 'rgba(0, 0, 0, 0.7)',
// dividerColor: 'rgba(255, 255, 255, 0.1)',
// checkboxDefault: '#687295',
// background: () => {
//      return {
//         // default: ColorDarkDefault.backgroundBox,
//         // bg: ColorDarkDefault.backgroundGlobal,
//         // popupBg1: ColorDarkDefault.backgroundSwapPanelLinear,
//         // popupBg2: ColorDarkDefault.backgroundSecondary,
//         // active: ColorDarkDefault.textSecondary,
//         // outline: ColorDarkDefault.outline,
//         // backDrop: ColorDarkDefault.backDrop,
//         // field:ColorDarkDefault.backgroundField,
//         // fieldOpacity: ColorDarkDefault.backgroundFieldOpacity,
//         // hover: ColorDarkDefault.backgroundFieldOpacity,
//         // disabled: ColorDarkDefault.backgroundDisabled,
//         // swap: ColorDarkDefault.backgroundSwapPanelLinear,
//         // header: ColorDarkDefault.backgroundHeader,
//     }
// },
// border: () => {
//     return {
//         default: ColorDarkDefault.borderColor,
//         selected: ColorDarkDefault.primaryLight,//'#1C96FF',
//         blur: ColorDarkDefault.blur,//ColorDarkDefault.textDisable
//         focus: ColorDarkDefault.focus,
//     }
// }



