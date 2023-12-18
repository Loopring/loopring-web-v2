import {
  Account,
  ButtonComponentsMap,
  HeaderMenuItemInterface,
  NOTIFICATIONHEADER,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

export interface HeaderToolBarInterface {
  buttonComponent: number
  args?: any
}
export interface HeaderProps<R, N = sdk.UserNotification> {
  headerToolBarData: { [key in ButtonComponentsMap]: R }
  headerMenuData: HeaderMenuItemInterface[]
  notification?: NOTIFICATIONHEADER<N>
  account?: Account
  chainId: sdk.ChainId
  allowTrade: {
    register: { enable: boolean; reason?: string }
    order: { enable: boolean; reason?: string }
    joinAmm: { enable: boolean; reason?: string }
    dAppTrade: { enable: boolean; reason?: string }
    raw_data: { enable: boolean; reason?: string }
  }
  isMobile: boolean
  isWrap?: boolean
  selected: string
  className?: string
  isLandPage?: boolean
  toolBarMap?: typeof ButtonComponentsMap
  transparent?: boolean
  landBtn?: JSX.Element
}
