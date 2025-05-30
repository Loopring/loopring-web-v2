import React from 'react'
import { AccountFull } from '@loopring-web/common-resources'

export enum WalletNotificationStatus {
  none = 'none',
  error = 'error',
  pending = 'pending',
  success = 'success',
}

export type WalletNotificationInterface = {
  // status: keyof typeof WalletNotificationStatus
  message: string
  handleClick?: (event: React.MouseEvent) => void
}

export type WalletConnectBtnProps = {
  NetWorkItems: JSX.Element | (() => JSX.Element)
  handleClick: (_e: React.MouseEvent) => void
  handleClickUnlock: (_e: React.MouseEvent) => void
  handleClickSignIn: (_e: React.MouseEvent) => void
  accountState: AccountFull
  isLayer1Only?: boolean
  isShowOnUnConnect: boolean
}
