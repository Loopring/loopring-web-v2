import React from 'react'

import {
  GuardianToolBarComponentsMap,
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
  const accountState = React.useMemo(() => {
    return { account }
  }, [account])

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

  const [headerToolBarData, setHeaderToolBarData] = React.useState<
    typeof headerGuardianToolBarData
  >(() => {
    headerGuardianToolBarData[GuardianToolBarComponentsMap.Notification] = {
      ...headerGuardianToolBarData[GuardianToolBarComponentsMap.Notification],
    }
    // headerGuardianToolBarData[GuardianToolBarComponentsMap.TestNet] = {
    //   ...headerGuardianToolBarData[GuardianToolBarComponentsMap.TestNet],
    //   onTestOpen: (isTestNet: boolean) => {
    //     const chainId = store.getState().system.chainId;
    //     updateSystem({ chainId });
    //   },
    //   isShow: (chainId as any) === ChainIdExtends["TAIKO"],
    // };
    headerGuardianToolBarData[GuardianToolBarComponentsMap.WalletConnect] = {
      ...headerGuardianToolBarData[GuardianToolBarComponentsMap.WalletConnect],
      accountState,
      isLayer1Only: true,
      NetWorkItems,
      handleClick: onWalletBtnConnect,
    }
    return headerGuardianToolBarData
  })
  React.useEffect(() => {
    setHeaderToolBarData((headerToolBarData) => {
      // myLog("isTestNet", isTaikoTest, chainId);
      // headerToolBarData[GuardianToolBarComponentsMap.TestNet] = {
      //   ...headerToolBarData[GuardianToolBarComponentsMap.TestNet],
      //   // isShow: (chainId as any) == ChainIdExtends["TAIKO"],
      // };
      return headerToolBarData
    })
  }, [chainId])

  React.useEffect(() => {
    if (accountStatus && accountStatus === 'UNSET') {
      setHeaderToolBarData((headerToolBarData) => {
        headerToolBarData[GuardianToolBarComponentsMap.WalletConnect] = {
          ...headerToolBarData[GuardianToolBarComponentsMap.WalletConnect],
          isLayer1Only: true,
          accountState,
          NetWorkItems,
          handleClick: onWalletBtnConnect,
        }
        return headerToolBarData
      })
    }
    // forceUpdate()
  }, [accountStatus, account.readyState])
  const { notifyMap } = useNotify()

  return {
    headerToolBarData,
    headerMenuLandingData,
    account,
    notifyMap,
    onkeypress,
  }
}
