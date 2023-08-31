import { SwitchData, useOpenModals, VaultJoinProps, walletMap } from '@loopring-web/component-lib'
import {
  AccountStatus,
  CoinKey,
  CoinMap,
  IBData,
  myLog,
  SagaStatus,
  TRADE_TYPE,
  TradeBtnStatus,
  WalletMap,
} from '@loopring-web/common-resources'
import React from 'react'
import {
  makeVaultLayer2,
  makeWalletLayer2,
  store,
  useAccount,
  useSubmitBtn,
  useSystem,
  useTokenMap,
  useTradeVault,
  useVaultLayer2,
  useVaultMap,
  useWalletLayer2,
  useWalletLayer2Socket,
} from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'

export const useVaultJoin = <T extends IBData<I>, I, V>() => {
  const { tokenMap: vaultTokenMap, coinMap: vaultCoinMap } = useVaultMap()
  const { tokenMap, coinMap, idIndex } = useTokenMap()
  const { status: vaultAccountInfoStatus, updateVaultLayer2 } = useVaultLayer2()
  // const { status: walletLayer2Status } = useWalletLayer2()

  const {
    account: { readyState },
  } = useAccount()
  const [isLoading, setIsLoading] = React.useState(false)
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)
  const { updateVaultJoin, vaultJoinData } = useTradeVault()

  const { baseURL } = useSystem()

  const [tradeData, setTradeData] = React.useState({
    belong: undefined,
    balance: undefined,
    tradeValue: undefined,
  })
  const { updateWalletLayer2 } = useWalletLayer2()
  // const { btnStatus, enableBtn, disableBtn } = useSubmitBtn()
  const availableTradeCheck = React.useCallback(() => {
    const claimValue = store.getState()._router_modalData.claimValue
    if (tokenMap) {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
    }
    return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: '' }
  }, [
    vaultAccountInfoStatus,
    // chargeFeeTokenList.length,
    // disableBtn,
    // enableBtn,
    // isFeeNotEnough.isFeeNotEnough,
    tokenMap,
    // claimValue?.balance,
    // claimValue?.belong,
    // claimValue?.fee?.feeRaw,
    // claimValue?.tradeValue,
  ])
  const submitCallback = () => {}
  const {
    btnStatus,
    onBtnClick,
    btnLabel,
    // btnStyle: tradeLimitBtnStyle,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading: isLoading,
    submitCallback: () => {},
  })
  const {
    modals: {
      isShowVaultJoin: { isShow, info },
    },
  } = useOpenModals()

  const walletAllowMap =
    (vaultTokenMap &&
      Reflect.ownKeys(vaultTokenMap).reduce((previousValue, key) => {
        const symbol = idIndex[vaultTokenMap[key.toString()].tokenId]
        return { ...previousValue, symbol: coinMap[symbol] }
      }, {} as CoinMap<I>)) ??
    {}

  // if (symbol && walletMap) {
  //   myLog('resetDefault symbol:', symbol)
  //   updateTransferData({
  //     fee: feeInfo,
  //     belong: symbol as any,
  //     balance: walletMap[symbol]?.count,
  //     tradeValue: undefined,
  //     address: '*',
  //     memo: '',
  //   })
  // } else {
  //   if (!transferValue.belong && walletMap) {
  //
  //   } else if (transferValue.belong && walletMap) {
  //     const walletInfo = walletMap[transferValue.belong]
  //
  //   } else {
  //
  //   }
  // }
  const initData = () => {
    let vaultJoinData: any = {}
    let initSymbol = 'LRC'
    if (info?.symbol) {
      initSymbol = info?.symbol
    }
    let walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap ?? {}
    let vaultMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map ?? {}

    vaultJoinData = {
      ...vaultJoinData,
      walletMap,
      vaultMap,
      coinMap: walletAllowMap,
    }
    let walletInfo
    if (readyState === AccountStatus.ACTIVATED && !info?.symbol) {
      const key = Reflect.ownKeys(vaultCoinMap).find((keyVal) => {
        const walletInfo = walletMap[keyVal.toString()] ?? { count: 0 }
        if (sdk.toBig(walletInfo?.count ?? 0).gt(0)) {
          return true
        }
      })
      initSymbol = key ? key.toString() : initSymbol
    }
    walletInfo = walletMap[initSymbol] ?? {
      balance: 0,
      belong: initSymbol,
    }
    vaultJoinData = {
      ...vaultJoinData,
      balance: walletInfo?.count,
      tradeValue: undefined,
    }
    setTradeData({
      ...walletInfo,
      tradeValue: undefined,
    })
    updateVaultJoin(vaultJoinData)
  }
  const vaultLayer2Callback = React.useCallback(() => {
    const vaultJoinData = store.getState()._router_tradeVault.vaultJoinData
    const walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap ?? {}
    // setWalletMap(walletMap as WalletMap<T>)
    updateVaultJoin({
      ...vaultJoinData,

      // walletMap: makeWalletLayer2({ needFilterZero: true }).walletMap ?? {},
      vaultLayer2Map: makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map,
    })
  }, [])

  React.useEffect(() => {
    if (vaultAccountInfoStatus === SagaStatus.UNSET) {
      vaultLayer2Callback()
    }
  }, [vaultAccountInfoStatus])
  const walletLayer2Callback = React.useCallback(() => {
    const vaultJoinData = store.getState()._router_tradeVault.vaultJoinData
    updateVaultJoin({
      ...vaultJoinData,
      walletMap: makeWalletLayer2({ needFilterZero: true }).walletMap ?? {},
    })
  }, [])
  useWalletLayer2Socket({ walletLayer2Callback })

  React.useEffect(() => {
    if (isShow) {
      initData()
      updateWalletLayer2()
      updateVaultLayer2()
    }
  }, [isShow])
  const handlePanelEvent = async (props: SwitchData<T>, switchType: 'Tomenu' | 'Tobutton') => {}
  // btnStatus, enableBtn, disableBtn
  return {
    handleError: undefined,
    type: TRADE_TYPE.TOKEN,
    baseURL,
    btnI18nKey: btnLabel,
    btnStatus,
    disabled: false,
    onSubmitClick: (_data: T) => onBtnClick(),
    propsExtends: {},
    tradeData: tradeData as unknown as T,
    handlePanelEvent,
    walletMap: vaultJoinData.walletMap as WalletMap<any>,
    vaultJoinData,
    coinMap: walletAllowMap,
  }
}
