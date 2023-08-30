import { SwitchData, useOpenModals, VaultJoinProps, walletMap } from '@loopring-web/component-lib'
import {
  CoinKey,
  CoinMap,
  IBData,
  TRADE_TYPE,
  TradeBtnStatus,
  WalletMap,
} from '@loopring-web/common-resources'
import React from 'react'
import {
  makeWalletLayer2,
  store,
  useBtnStatus,
  useSubmitBtn,
  useSystem,
  useTokenMap,
  useTradeVault,
  useVaultLayer2,
  useVaultMap,
  useWalletLayer2,
  useWalletLayer2Socket,
} from '@loopring-web/core'

export const useVaultJoin = <T extends IBData<I>, I, V>() => {
  const { tokensMap: vaultTokenMap, coinMap: vaultCoinMap } = useVaultMap()
  const { tokenMap, coinMap, idIndex } = useTokenMap()
  const { vaultAccountInfo, vaultLayer2 } = useVaultLayer2()
  const [walletMap, setWalletMap] = React.useState<WalletMap<T>>(
    (makeWalletLayer2({ needFilterZero: true }).walletMap ?? {}) as WalletMap<T>,
  )
  const [isLoading, setIsLoading] = React.useState(false)
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)

  const { updateTradeVault, vaultJoinData } = useTradeVault()

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
    if (
      tokenMap
      //&&
      // chargeFeeTokenList.length &&
      // isFeeNotEnough &&
      // !isFeeNotEnough.isFeeNotEnough &&
      // claimValue.belong &&
      // claimValue.tradeValue &&
      // claimValue.fee &&
      // claimValue.fee.belong
    ) {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
    }
    return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: '' }
  }, [
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

  // React.useEffect(() => {
  //   checkBtnStatus()
  // }, [])

  const initData = () => {
    let initSymbol = 'LRC'
    if (info?.symbol) {
      initSymbol = info?.symbol
    }
  }
  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap ?? {}
    setWalletMap(walletMap as WalletMap<T>)
  }, [])
  useWalletLayer2Socket({ walletLayer2Callback })
  const getFilteredCoinMap = () => {
    return Reflect.ownKeys(vaultTokenMap).reduce((previousValue, key) => {
      const symbol = idIndex[vaultTokenMap[key.toString()].tokenId]
      return { ...previousValue, symbol: coinMap[symbol] }
    }, {} as CoinMap<I>)
  }
  React.useEffect(() => {
    if (isShow) {
      initData()
      updateWalletLayer2()
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
    walletMap: walletMap as WalletMap<any>,
    vaultJoinData,
    // vaultAccountData,
    coinMap: getFilteredCoinMap(),
  }
}
