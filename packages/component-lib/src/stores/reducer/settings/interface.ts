import {
  CoinSource,
  CurrencyToTag,
  LanguageKeys,
  ThemeKeys,
  UpColor,
} from '@loopring-web/common-resources'
import { Layouts } from 'react-grid-layout'
import * as sdk from '@loopring-web/loopring-sdk'

export enum PlatFormType {
  mobile = 'mobile',
  desktop = 'desktop',
  tablet = 'tablet',
}

export type PlatFormKeys = keyof typeof PlatFormType

export interface SettingsState {
  themeMode: ThemeKeys
  language: LanguageKeys
  platform: PlatFormKeys
  currency: CurrencyToTag
  upColor: keyof typeof UpColor
  slippage: number | 'N'
  coinJson: {
    [key: string]: CoinSource
  }
  hideL2Assets: boolean
  hideL2Action: boolean
  hideInvestToken: boolean
  isMobile: boolean
  hideSmallBalances: boolean
  proLayout: Layouts
  stopLimitLayout: Layouts
  feeChargeOrder: string[]
  swapSecondConfirmation: boolean | undefined
  defaultNetwork: sdk.ChainId
  referralCode: string
  isDevToggle: boolean
  dualAuto: { auto: boolean; day: number | 'auto' }
  bTradeShowTutorial: boolean
}
