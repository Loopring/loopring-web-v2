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

export const GrayBlack = {
  gray100: '#EBEEF5',
  gray200: '#A2A9B8',
  gray300: '#6C717A',
  gray400: '#5E6470',
  gray500: '#4A505C',
  gray600: '#393E47',
  gray700: '#31353D',
  gray800: '#25282E',
  gray900: '#25282E',
  gray1000: '#31353D',
}

export const GrayLight = {
  gray100: '#1A2947',
  gray200: '#5D667A',
  gray300: '#AFB7C7',
  gray400: '#BCC1CC',
  gray500: '#E1E6F0',
  gray600: '#EBEFF7',
  gray700: '#F5F7FC',
  gray800: '#FFFFFF',
  gray900: '#F5F7FC',
  gray1000: '#FFFFFF',
}

export const ColorDarkDefault = Object.freeze({
  primary: '#446EFF',
  primaryHover: `${hexToRGB(GrayBlack.gray200, '0.2')}`,
  primaryPressed: '#2D49B2',
  secondary: '#1890FF',
  secondaryHover: '#46A6FF',
  secondaryPressed: '#1064B2',
  disable: '#343754',
  success: '#00BBA8',
  warning: '#FBA95C',
  error: '#FF5677',
  textPrimary: GrayBlack.gray100,
  textSecondary: GrayBlack.gray200,
  textThird: GrayBlack.gray300,
  textButton: GrayBlack.gray100,
  textButtonSelect: GrayBlack.gray100,
  textDisable: `${hexToRGB(GrayBlack.gray100, '0.45')}`,
  border: GrayBlack.gray500,
  borderHover: GrayBlack.gray100,
  borderDark: GrayBlack.gray400,
  borderSelect: GrayBlack.gray100,
  borderDisable: GrayBlack.gray300,
  borderDisable2: GrayBlack.gray200,
  tag: '#6787FF',
  popBg: GrayBlack.gray700, //ColorBlack.dark800,
  box: GrayBlack.gray1000, //"#2D2F4B",
  boxSecondary: GrayBlack.gray800,
  boxHover: `${hexToRGB(GrayBlack.gray100, '0.05')}`,
  boxLinear: GrayBlack.gray1000,
  globalBg: GrayBlack.gray900, // "#1F2034",
  globalBgOpacity: `${hexToRGB('#1F2034', '0.5')}`,
  fieldOpacity: GrayBlack.gray900,
  divide: GrayBlack.gray300,
  boxEnhance:`${hexToRGB(GrayBlack.gray100, '0.1')}`,
  mask: `${hexToRGB(GrayBlack.gray700, '0.68')}`,
  tableHeaderBg: '#393f64',
  star: `#F0B90B`,
  logo: GrayBlack.gray100,
  /********************CSS special button *******************/
  buttonPot: GrayBlack.gray100,
  buttonIcon: GrayBlack.gray200,
  buttonInactive: GrayBlack.gray700,

  /********************CSS shadow *******************/
  shadow: ` 0px 4px 4px ${hexToRGB(GrayBlack.gray600, '.25')}`,
  shadowHeader: `0px 4px 8px  ${hexToRGB(GrayBlack.gray600, '.15')}`,
  shadow2: `0px -4px 8px ${hexToRGB(GrayBlack.gray600, '.15')}`,
  shadowHover: `0px 10px 20px  ${hexToRGB(GrayBlack.gray600, '.45')}`,
  shadow3: `0px 10px 20px ${hexToRGB(GrayBlack.gray600, '.15')}`,

  /********************Case for provider*******************/
  white: GrayBlack.gray100,
  dark: GrayBlack.gray700,
  opacity: `${hexToRGB(GrayBlack.gray700, '0')}`,
  providerBtn: `${hexToRGB(GrayBlack.gray100, '0.1')}`,
  providerBtnHover: `${hexToRGB(GrayBlack.gray100, '0.03')}`,
  providerApprove: `${hexToRGB(GrayBlack.gray100, '0.03')}`,
  boxNFTLabel: `${hexToRGB(GrayBlack.gray700, '0.48')}`,
  boxNFTBtn: `${hexToRGB(GrayBlack.gray700, '0.28')}`,

  redPacket1: `linear-gradient(96.56deg, #FFD596 1.14%, #FFD390 46.4%, #FDBD6A 98.91%)`,
  redPacket0: `linear-gradient(95.9deg, #FC7A5A 0.7%, #FF6151 99.3%);`,
  redPacket1Disabled: `${hexToRGB(GrayBlack.gray400, '0.5')}`,
  redPacketText1: '#A25402',
  redPacketText0: '#FFF7B1',
  redPacketBorder: `1px dashed ${hexToRGB(GrayBlack.gray100, '0.2')}`,
})

export const ColorLightDefault = Object.freeze({
  ...ColorDarkDefault,
  primary: '#446EFF',
  primaryHover: `${hexToRGB(GrayLight.gray100, '0.2')}`,
  primaryPressed: '#293EAA',
  secondary: '#1890FF',
  secondaryHover: '#46A6FF',
  secondaryPressed: '#1064B2',
  disable: '#F4F5F9',
  success: '#00BBA8',
  warning: '#FBA95C',
  error: '#FF5677',
  textPrimary: GrayLight.gray100,
  textSecondary: GrayLight.gray200,
  textThird: GrayLight.gray300,
  textButton: GrayLight.gray600,
  textButtonSelect: '#446EFF',
  textDisable: `${hexToRGB(GrayLight.gray100, '0.25')}`,
  border: GrayLight.gray500,
  borderHover: GrayLight.gray100,
  borderDark: GrayLight.gray400,
  borderSelect: GrayLight.gray100,
  borderDisable: GrayLight.gray300,
  borderDisable2: GrayLight.gray200,
  tag: '#6787FF',
  box: GrayLight.gray1000,
  boxHover: GrayLight.gray700,
  popBg: GrayLight.gray800,

  boxLinear: GrayLight.gray1000,
  globalBg: GrayLight.gray900,
  globalBgOpacity: `${hexToRGB(GrayLight.gray500, '0.5')}`,
  fieldOpacity: GrayLight.gray700,
  divide: GrayLight.gray400,
  boxEnhance:GrayLight.gray400,
  boxSecondary: GrayLight.gray700,
  mask: `${hexToRGB(GrayBlack.gray700, '0.68')}`,
  tableHeaderBg: GrayLight.gray600,
  star: `#F0B90B`,
  logo: '#446EFF',
  /********************CSS special buttonr*******************/
  buttonPot: GrayBlack.gray100,
  buttonIcon: '#15162B',
  buttonInactive: GrayLight.gray700,
  // box-shadow: 0px 4px 20px 0px #1D20231A;

  /********************CSS shadow *******************/
  shadow: `0px 4px 20px 0px #1D20231A`,
  shadowHeader: `0px 4px 8px ${hexToRGB('#5766EC', '0.1')}`,
  shadow2: `0px -4px 8px ${hexToRGB('#5766EC', '0.1')}`,
  shadowHover: `0px 10px 20px  ${hexToRGB('#5781EC', '0.25')}`,
  shadow3: `0px 10px 20px  ${hexToRGB('#5781EC', '0.1')}`,

  /********************Case for provider*******************/
  white: GrayBlack.gray100,
  dark: GrayBlack.gray700,
  opacity: `${hexToRGB(GrayBlack.gray100, '0')}`,
  providerBtn: `${hexToRGB('#446EFF', '0.1')}`,
  providerBtnHover: `${hexToRGB('#446EFF', '0.15')}`,
  providerApprove: `#F6F7FB`,
  boxNFTLabel: `${hexToRGB(GrayBlack.gray100, '0.58')}`,
  boxNFTBtn: `${hexToRGB(GrayBlack.gray700, '0.28')}`,

  redPacket1: `linear-gradient(96.56deg, #FFD596 1.14%, #FFD390 46.4%, #FDBD6A 98.91%)`,
  redPacket0: `linear-gradient(95.9deg, #FC7A5A 0.7%, #FF6151 99.3%);`,
  redPacket1Disabled: `${hexToRGB(GrayLight.gray500, '0.5')}`,
  redPacketText1: '#A25402',
  redPacketText0: '#FFF7B1',
  redPacketBorder: `1px dashed ${hexToRGB(GrayBlack.gray100, '0.2')}`,
})

export type ColorBaseInterface = typeof ColorDarkDefault
