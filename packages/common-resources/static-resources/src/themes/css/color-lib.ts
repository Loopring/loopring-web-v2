export const hexToRGB = (hex: string, alpha?: string | number) => {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16)

  if (alpha !== undefined) {
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha.toString() + ')'
  } else {
    return 'rgb(' + r + ', ' + g + ', ' + b + ')'
  }
}
export const ColorBlack = {
  dark: '#000000',
  dark900: '#141414',
  dark800: '#1F1F1F',
  dark700: '#262626',
  dark600: '#434343',
  dark500: '#595959',
  dark400: '#8C8C8C',
  light400: '#BFBFBF',
  light500: '#D9D9D9',
  light600: '#EBEBEB',
  light700: '#F0F0F0',
  light800: '#F5F5F5',
  light900: '#FAFAFA',
  light: '#FFFFFF',
}

export const ColorDarkDefault = Object.freeze({
  primary: '#4169FF',
  primaryHover: `${hexToRGB('#ffffff', '0.2')}`,
  primaryPressed: '#2D49B2',
  secondary: '#1890FF',
  secondaryHover: '#46A6FF',
  secondaryPressed: '#1064B2',
  disable: '#343754',
  success: '#00BBA8',
  warning: '#FBA95C',
  error: '#FF5677',
  textPrimary: '#FFFFFF',
  textSecondary: '#A4ABC1',
  textThird: '#687295',
  textButton: '#FFFFFF',
  textButtonSelect: '#FFFFFF',
  textDisable: `${hexToRGB('#ffffff', '0.25')}`,
  border: '#49527D',
  borderHover: '#A1ABC9',
  borderDark: '#6C738A',
  borderSelect: '#FFFFFF',
  borderDisable: '#383C5C',
  borderDisable2: '#2D2F4B',
  tag: '#6787FF',
  box: '#2D2F4B',
  boxHover: `${hexToRGB('#ffffff', '0.05')}`,
  popBg: '#393F64',

  boxLinear: 'linear-gradient(194.79deg, #322C53 17.96%, #262B50 44.29%, #32314F 96.93%)',
  globalBg: '#1F2034',
  globalBgOpacity: `${hexToRGB('#1F2034', '0.5')}`,
  fieldOpacity: `${hexToRGB('#ffffff', '0.1')}`,
  divide: '#444C75',
  boxSecondary: '#687295',
  mask: `${hexToRGB('#000000', '0.68')}`,
  tableHeaderBg: '#393f64',
  star: `#F0B90B`,
  logo: '#FFFFFF',
  /********************CSS special button *******************/
  buttonPot: '#FFFFFF',
  buttonIcon: '#A4ABC1',

  /********************CSS shadow *******************/
  shadow: ` 0px 4px 4px ${hexToRGB('#000000', '.25')}`,
  shadowHeader: `0px 4px 8px  ${hexToRGB('#000000', '.15')}`,
  shadow2: `0px -4px 8px ${hexToRGB('#000000', '.15')}`,
  shadowHover: `0px 10px 20px  ${hexToRGB('#000000', '.45')}`,
  shadow3: `0px 10px 20px ${hexToRGB('#000000', '.15')}`,

  /********************Case for provider*******************/
  white: '#ffffff',
  dark: '#000000',
  opacity: `${hexToRGB('#000000', '0')}`,
  providerBtn: `${hexToRGB('#ffffff', '0.1')}`,
  providerBtnHover: `${hexToRGB('#ffffff', '0.03')}`,
  providerApprove: `${hexToRGB('#ffffff', '0.03')}`,
  boxNFTLabel: `${hexToRGB('#000000', '0.48')}`,
  boxNFTBtn: `${hexToRGB('#000000', '0.28')}`,

  redPacket1: `linear-gradient(96.56deg, #FFD596 1.14%, #FFD390 46.4%, #FDBD6A 98.91%)`,
  redPacket0: `linear-gradient(95.9deg, #FC7A5A 0.7%, #FF6151 99.3%);`,
  redPacket1Disabled: `${hexToRGB('#F6F7FB', '0.5')}`,
  redPacketText1: '#A25402',
  redPacketText0: '#FFF7B1',
  redPacketBorder: '1px dashed rgba(255, 255, 255, 0.2)',
})

export const ColorLightDefault = Object.freeze({
  ...ColorDarkDefault,
  primary: '#3B5AF4',
  primaryHover: `${hexToRGB('#ffffff', '0.2')}`,
  primaryPressed: '#293EAA',
  secondary: '#1890FF',
  secondaryHover: '#46A6FF',
  secondaryPressed: '#1064B2',
  disable: '#F4F5F9',
  success: '#00BBA8',
  warning: '#FBA95C',
  error: '#FF5677',
  textPrimary: '#15162B',
  textSecondary: '#4E5395',
  textThird: '#A3A8CA',
  textButton: '#FFFFFF',
  textButtonSelect: '#3B5AF4',
  textDisable: `${hexToRGB('#000000', '0.25')}`,
  border: '#E9EAF2',
  borderHover: '#627BF6',
  borderDark: '#293EAA',
  borderSelect: '#3B5AF4',
  borderDisable: '#E9EAF2',
  borderDisable2: '#FFFFFF',
  tag: '#6787FF',
  box: '#FFFFFF',
  boxHover: `${hexToRGB('#3B5AF4', '0.05')}`,
  popBg: '#FFFFFF',

  boxLinear: '#FFFFFF',
  globalBg: '#F6F7FB',
  globalBgOpacity: `${hexToRGB('#F6F7FB', '0.5')}`,
  fieldOpacity: '#EEF1FA',
  divide: '#E9EAF2',
  boxSecondary: '#A3A8CA',
  mask: `${hexToRGB('#000000', '0.68')}`,
  tableHeaderBg: '#F6F7FB',
  star: `#F0B90B`,
  logo: '#3B5AF4',
  /********************CSS special buttonr*******************/
  buttonPot: '#FFFFFF',
  buttonIcon: '#15162B',

  /********************CSS shadow *******************/
  shadow: `0px 10px 20px ${hexToRGB('#5781EC', '0.08')}`,
  shadowHeader: `0px 4px 8px ${hexToRGB('#5766EC', '0.1')}`,
  shadow2: `0px -4px 8px ${hexToRGB('#5766EC', '0.1')}`,
  shadowHover: `0px 10px 20px  ${hexToRGB('#5781EC', '0.25')}`,
  shadow3: `0px 10px 20px  ${hexToRGB('#5781EC', '0.1')}`,

  /********************Case for provider*******************/
  white: '#ffffff',
  dark: '#000000',
  opacity: `${hexToRGB('#FFFFFF', '0')}`,
  providerBtn: `${hexToRGB('#3B5AF4', '0.1')}`,
  providerBtnHover: `${hexToRGB('#3B5AF4', '0.15')}`,
  providerApprove: `#F6F7FB`,
  boxNFTLabel: `${hexToRGB('#ffffff', '0.58')}`,
  boxNFTBtn: `${hexToRGB('#000000', '0.28')}`,

  redPacket1: `linear-gradient(96.56deg, #FFD596 1.14%, #FFD390 46.4%, #FDBD6A 98.91%)`,
  redPacket0: `linear-gradient(95.9deg, #FC7A5A 0.7%, #FF6151 99.3%);`,
  redPacket1Disabled: `${hexToRGB('#F6F7FB', '0.5')}`,
  redPacketText1: '#A25402',
  redPacketText0: '#FFF7B1',
  redPacketBorder: '1px dashed rgba(255, 255, 255, 0.2)',
})

export type ColorBaseInterface = typeof ColorDarkDefault
