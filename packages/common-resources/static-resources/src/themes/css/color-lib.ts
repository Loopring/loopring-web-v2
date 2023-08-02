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
  primaryHover: `${hexToRGB(ColorBlack.light, '0.2')}`,
  primaryPressed: '#2D49B2',
  secondary: '#1890FF',
  secondaryHover: '#46A6FF',
  secondaryPressed: '#1064B2',
  disable: '#343754',
  success: '#00BBA8',
  warning: '#FBA95C',
  error: '#FF5677',
  textPrimary: ColorBlack.light,
  textSecondary: ColorBlack.light500,
  textThird: ColorBlack.dark400,
  textButton: ColorBlack.light,
  textButtonSelect: ColorBlack.light,
  textDisable: `${hexToRGB(ColorBlack.light, '0.45')}`,
  border: ColorBlack.dark700,
  borderHover: ColorBlack.light,
  borderDark: ColorBlack.dark400,
  borderSelect: ColorBlack.light,
  borderDisable: '#383C5C',
  borderDisable2: '#2D2F4B',
  tag: '#6787FF',
  box: ColorBlack.dark, //"#2D2F4B",
  boxHover: `${hexToRGB(ColorBlack.light, '0.05')}`,
  popBg: ColorBlack.dark800, //ColorBlack.dark800,

  boxLinear: `linear-gradient(194.79deg, ${ColorBlack.dark} 17.96%, ${ColorBlack.dark900} 44.29%, ${ColorBlack.dark800} 96.93%)`,
  globalBg: ColorBlack.dark900, // "#1F2034",
  globalBgOpacity: `${hexToRGB('#1F2034', '0.5')}`,
  fieldOpacity: `${hexToRGB(ColorBlack.light, '0.1')}`,
  divide: ColorBlack.dark500,
  boxSecondary: ColorBlack.dark900,
  mask: `${hexToRGB(ColorBlack.dark, '0.68')}`,
  tableHeaderBg: '#393f64',
  star: `#F0B90B`,
  logo: ColorBlack.light,
  /********************CSS special button *******************/
  buttonPot: ColorBlack.light,
  buttonIcon: ColorBlack.light800,
  buttonInactive: ColorBlack.dark800,

  /********************CSS shadow *******************/
  shadow: ` 0px 4px 4px ${hexToRGB(ColorBlack.dark700, '.25')}`,
  shadowHeader: `0px 4px 8px  ${hexToRGB(ColorBlack.dark700, '.15')}`,
  shadow2: `0px -4px 8px ${hexToRGB(ColorBlack.dark700, '.15')}`,
  shadowHover: `0px 10px 20px  ${hexToRGB(ColorBlack.dark700, '.45')}`,
  shadow3: `0px 10px 20px ${hexToRGB(ColorBlack.dark700, '.15')}`,

  /********************Case for provider*******************/
  white: ColorBlack.light,
  dark: ColorBlack.dark,
  opacity: `${hexToRGB(ColorBlack.dark, '0')}`,
  providerBtn: `${hexToRGB(ColorBlack.light, '0.1')}`,
  providerBtnHover: `${hexToRGB(ColorBlack.light, '0.03')}`,
  providerApprove: `${hexToRGB(ColorBlack.light, '0.03')}`,
  boxNFTLabel: `${hexToRGB(ColorBlack.dark, '0.48')}`,
  boxNFTBtn: `${hexToRGB(ColorBlack.dark, '0.28')}`,

  redPacket1: `linear-gradient(96.56deg, #FFD596 1.14%, #FFD390 46.4%, #FDBD6A 98.91%)`,
  redPacket0: `linear-gradient(95.9deg, #FC7A5A 0.7%, #FF6151 99.3%);`,
  redPacket1Disabled: `${hexToRGB(ColorBlack.light700, '0.5')}`,
  redPacketText1: '#A25402',
  redPacketText0: '#FFF7B1',
  redPacketBorder: `1px dashed ${hexToRGB(ColorBlack.light, '0.2')}`,
})

export const ColorLightDefault = Object.freeze({
  ...ColorDarkDefault,
  primary: '#3B5AF4',
  primaryHover: `${hexToRGB(ColorBlack.light, '0.2')}`,
  primaryPressed: '#293EAA',
  secondary: '#1890FF',
  secondaryHover: '#46A6FF',
  secondaryPressed: '#1064B2',
  disable: '#F4F5F9',
  success: '#00BBA8',
  warning: '#FBA95C',
  error: '#FF5677',
  textPrimary: '#15162B',
  textSecondary: `${hexToRGB('#15162B', '0.50')}`,
  textThird: '#A3A8CA',
  textButton: ColorBlack.light,
  textButtonSelect: '#3B5AF4',
  textDisable: `${hexToRGB(ColorBlack.dark, '0.25')}`,
  border: ColorBlack.light600,
  borderHover: '#627BF6',
  borderDark: '#293EAA',
  borderSelect: '#3B5AF4',
  borderDisable: '#E9EAF2',
  borderDisable2: ColorBlack.light,
  tag: '#6787FF',
  box: ColorBlack.light900,
  boxHover: '#FFFFFF',
  popBg: ColorBlack.light,

  boxLinear: ColorBlack.light,
  globalBg: ColorBlack.light700,
  globalBgOpacity: `${hexToRGB(ColorBlack.light700, '0.5')}`,
  fieldOpacity: ColorBlack.light600,
  divide: '#E9EAF2',
  boxSecondary: ColorBlack.light,
  mask: `${hexToRGB(ColorBlack.dark, '0.68')}`,
  tableHeaderBg: ColorBlack.light700,
  star: `#F0B90B`,
  logo: '#3B5AF4',
  /********************CSS special buttonr*******************/
  buttonPot: ColorBlack.light,
  buttonIcon: '#15162B',
  buttonInactive: ColorBlack.light800,
  // box-shadow: 0px 4px 20px 0px #1D20231A;

  /********************CSS shadow *******************/
  shadow: `0px 4px 20px 0px #1D20231A`,
  shadowHeader: `0px 4px 8px ${hexToRGB('#5766EC', '0.1')}`,
  shadow2: `0px -4px 8px ${hexToRGB('#5766EC', '0.1')}`,
  shadowHover: `0px 10px 20px  ${hexToRGB('#5781EC', '0.25')}`,
  shadow3: `0px 10px 20px  ${hexToRGB('#5781EC', '0.1')}`,

  /********************Case for provider*******************/
  white: ColorBlack.light,
  dark: ColorBlack.dark,
  opacity: `${hexToRGB(ColorBlack.light, '0')}`,
  providerBtn: `${hexToRGB('#3B5AF4', '0.1')}`,
  providerBtnHover: `${hexToRGB('#3B5AF4', '0.15')}`,
  providerApprove: `#F6F7FB`,
  boxNFTLabel: `${hexToRGB(ColorBlack.light, '0.58')}`,
  boxNFTBtn: `${hexToRGB(ColorBlack.dark, '0.28')}`,

  redPacket1: `linear-gradient(96.56deg, #FFD596 1.14%, #FFD390 46.4%, #FDBD6A 98.91%)`,
  redPacket0: `linear-gradient(95.9deg, #FC7A5A 0.7%, #FF6151 99.3%);`,
  redPacket1Disabled: `${hexToRGB(ColorBlack.light700, '0.5')}`,
  redPacketText1: '#A25402',
  redPacketText0: '#FFF7B1',
  redPacketBorder: `1px dashed ${hexToRGB(ColorBlack.light, '0.2')}`,
})

export type ColorBaseInterface = typeof ColorDarkDefault
