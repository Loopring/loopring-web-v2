import React from 'react'

import {
  ButtonComponentsMap,
  headerGuardianToolBarData,
  headerMenuLandingData,
  myLog,
} from '@loopring-web/common-resources'

import {
  accountStaticCallBack,
  btnConnectL1kMap,
  useAccount,
  useNotify,
  useSelectNetwork,
  useSystem,
} from '@loopring-web/core'

import { useOpenModals } from '@loopring-web/component-lib'

export const useHeader = () => {
  const accountTotal = useAccount()
  const { account, setShouldShow, status: accountStatus } = accountTotal
  const { chainId } = useSystem()
  const accountState = { account } 

  const onkeypress = (e: KeyboardEvent) => {
    if (e.altKey && e.shiftKey && e.code == 'KeyX') {
      console.log(e.altKey && e.shiftKey && e.code && e.timeStamp)
    }
  }
  const onWalletBtnConnect = React.useCallback(async () => {
    myLog(`onWalletBtnConnect click: ${account.readyState}`)
    accountStaticCallBack(btnConnectL1kMap, [])
  }, [account, setShouldShow, btnConnectL1kMap])
  const { NetWorkItems } = useSelectNetwork({ className: 'header' })

  
  const headerToolBarData = {
    [ButtonComponentsMap.Notification]: headerGuardianToolBarData[ButtonComponentsMap.Notification],
    [ButtonComponentsMap.WalletConnect]: {
      ...headerGuardianToolBarData[ButtonComponentsMap.WalletConnect],
      accountState,
      isLayer1Only: true,
      NetWorkItems,
      handleClick: onWalletBtnConnect,
    }

  }
  const { notifyMap } = useNotify()

  return {
    headerToolBarData,
    headerMenuLandingData,
    account,
    notifyMap,
    onkeypress,
  }
}
