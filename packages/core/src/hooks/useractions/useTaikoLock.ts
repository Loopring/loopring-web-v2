import React from 'react'
import {
  AccountStep,
  DeFiSideWrapProps,
  ToastType,
  useOpenModals,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  CustomErrorWithCode,
  DeFiSideCalcData,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_QUICK_AUTO_CLOSE,
  TradeBtnStatus,
  TradeStake,
} from '@loopring-web/common-resources'

import {
  calcSideStaking,
  fiatNumberDisplay,
  makeWalletLayer2,
  numberFormatThousandthPlace,
  numberStringListSum,
  useStakingMap,
  useSubmitBtn,
  useWalletLayer2Socket,
} from '@loopring-web/core'
import _ from 'lodash'

import * as sdk from '@loopring-web/loopring-sdk'

import {
  LoopringAPI,
  store,
  useAccount,
  useSystem,
  useTokenMap,
  walletLayer2Service,
} from '../../index'
import { useTranslation } from 'react-i18next'
import { useTokenPrices, useTradeStake } from '../../stores'
import { symbol } from 'prop-types'
import Decimal from 'decimal.js'
import { utils } from 'ethers'

export const useTaikoLock = <T extends IBData<I>, I, ACD extends DeFiSideCalcData<T>>({
  setToastOpen,
  symbol: coinSellSymbol,
}: {
  symbol: string
  setToastOpen: (props: { open: boolean; content: JSX.Element | string; type: ToastType }) => void
}) => {
  const { t } = useTranslation(['common'])
  const refreshRef = React.createRef()
  const [ isLoading, setIsLoading ] = React.useState(false)
  const [ taikoFarmingChecked, setTaikoFarmingChecked ] = React.useState(false)
  const onCheckBoxChange = React.useCallback(() => {
    setTaikoFarmingChecked(!taikoFarmingChecked)
  }, [taikoFarmingChecked])
  const { tokenMap } = useTokenMap()
  const { tokenPrices } = useTokenPrices()
  const { account } = useAccount()
  const { setShowAccount } = useOpenModals()
  const { status: stakingMapStatus, marketMap: stakingMap, getStakingMap } = useStakingMap()

  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals()
  const { tradeStake, updateTradeStake, resetTradeStake } = useTradeStake()
  const { exchangeInfo, allowTrade, getValueInCurrency } = useSystem()
  const { toggle } = useToggle()
  const { defaultNetwork, currency } = useSettings()
  const sellToken = tokenMap[coinSellSymbol]
  // const tokenId = tokenMap[coinSellSymbol].tokenId

  const handleOnchange = _.debounce(
    ({ tradeData, _tradeStake = {} }: { tradeData: T; _tradeStake?: Partial<TradeStake<T>> }) => {
      const tradeStake = store.getState()._router_tradeStake.tradeStake
      let _deFiSideCalcData: DeFiSideCalcData<T> = {
        ...tradeStake.deFiSideCalcData,
      } as unknown as DeFiSideCalcData<T>
      let _oldTradeStake = {
        ...tradeStake,
        ..._tradeStake,
      }
      //_.cloneDeep({ ...tradeStake, ..._tradeStake });
      myLog('defi handleOnchange', _oldTradeStake)

      if (tradeData && coinSellSymbol) {
        const inputValue = tradeData?.tradeValue?.toString() ?? '0'
        const tokenSell = tokenMap[coinSellSymbol]
        const { sellVol, deFiSideCalcData } = calcSideStaking({
          inputValue,
          isJoin: true,
          deFiSideCalcData: _deFiSideCalcData,
          tokenSell,
        })

        // @ts-ignore
        _deFiSideCalcData = {
          ...deFiSideCalcData,
          coinSell: {
            ...tradeData,
            tradeValue: tradeData?.tradeValue?.toString(),
          },
        }
        updateTradeStake({
          sellToken: tokenSell,
          sellVol,
          deFiSideCalcData: {
            ..._deFiSideCalcData,
          },
        })
      }
    },
    globalSetup.wait,
  )

  const resetDefault = React.useCallback(
    async (clearTrade: boolean = false) => {
      let walletMap: any = {}
      let deFiSideCalcDataInit: Partial<DeFiSideCalcData<any>> = {
        ...tradeStake.deFiSideCalcData,
        coinSell: {
          belong: coinSellSymbol,
          balance: undefined,
          tradeValue:
            tradeStake.deFiSideCalcData?.coinSell?.belong === coinSellSymbol
              ? tradeStake.deFiSideCalcData?.coinSell?.tradeValue
              : undefined,
        },
      }
      try {
        let item = stakingMap[coinSellSymbol]
        if (item && stakingMap) {
          deFiSideCalcDataInit.stakeViewInfo = { ...item }
        } else {
          throw new Error('no product')
        }

        if (account.readyState === AccountStatus.ACTIVATED) {
          if (clearTrade === true) {
            walletLayer2Service.sendUserUpdate()
          }
          walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap ?? {}

          deFiSideCalcDataInit.coinSell.balance = walletMap[coinSellSymbol]?.count
        }

        if (clearTrade || tradeStake.deFiSideCalcData?.coinSell?.tradeValue === undefined) {
          deFiSideCalcDataInit.coinSell.tradeValue = undefined
          updateTradeStake({
            sellVol: '0',
            sellToken: tokenMap[coinSellSymbol],
            deFiSideCalcData: {
              ...deFiSideCalcDataInit,
              coinSell: {
                ...deFiSideCalcDataInit.coinSell,
                tradeValue: undefined,
              },
            } as DeFiSideCalcData<T>,
          })
          myLog('resetDefault defi clearTrade', deFiSideCalcDataInit)
        } else {
          const tradeData = {
            ...deFiSideCalcDataInit.coinSell,
            tradeValue: tradeStake.deFiSideCalcData?.coinSell?.tradeValue ?? undefined,
          }
          handleOnchange({ tradeData })
        }
      } catch (error) {
        setToastOpen({
          open: true,
          type: ToastType.error,
          content: t(
            SDK_ERROR_MAP_TO_UI[(error as sdk.RESULT_INFO).code ?? 700001]?.messageKey ??
              (error as sdk.RESULT_INFO).message,
          ),
        })
      }
      setIsLoading(false)
    },
    [
      account.readyState,
      coinSellSymbol,
      handleOnchange,
      coinSellSymbol,
      tokenMap,
      tradeStake.deFiSideCalcData,
      updateTradeStake,
    ],
  )

  const walletLayer2Callback = React.useCallback(async () => {
    let tradeValue: any = undefined
    let deFiSideCalcDataInit: Partial<DeFiSideCalcData<any>> = {
      coinSell: {
        belong: coinSellSymbol,
        balance: undefined,
      },
      ...(tradeStake?.deFiSideCalcData ?? {}),
    }
    if (tradeStake.deFiSideCalcData) {
      tradeValue = tradeStake?.deFiSideCalcData?.coinSell?.tradeValue ?? undefined
    }
    if (deFiSideCalcDataInit?.coinSell?.belong) {
      let walletMap: any
      if (account.readyState === AccountStatus.ACTIVATED) {
        walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap
        deFiSideCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: walletMap[coinSellSymbol]?.count,
        }
      } else {
        deFiSideCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: undefined,
        }
      }
      const tradeData = {
        ...deFiSideCalcDataInit.coinSell,
        tradeValue,
      }
      myLog('resetDefault Defi walletLayer2Callback', tradeData)
      handleOnchange({ tradeData })
    }
  }, [account.readyState, coinSellSymbol, handleOnchange, tradeStake.deFiSideCalcData])

  useWalletLayer2Socket({ walletLayer2Callback })
  const sendRequest = React.useCallback(async () => {
    const tradeStake = store.getState()._router_tradeStake.tradeStake
    try {
      setIsLoading(true)
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        tradeStake.deFiSideCalcData?.coinSell &&
        tradeStake.sellToken?.tokenId !== undefined &&
        exchangeInfo
      ) {
        const request = {
          accountId: account.accountId,
          timestamp: Date.now(),
          token: {
            tokenId: tradeStake.sellToken?.tokenId,
            volume: tradeStake.sellVol,
          },
        }
        myLog('Stake Trade request:', request)

        const response = await LoopringAPI.defiAPI.sendStake(
          request,
          account.eddsaKey.sk,
          account.apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
          throw new CustomErrorWithCode(errorItem)
        } else {
          const response1 = await LoopringAPI.defiAPI.getStakeSummary(
            {
              accountId: account.accountId,
              hashes: response.hash,
              tokenId: tradeStake.sellToken.tokenId,
            },
            account.apiKey,
          )
          let item: any
          if ((response1 as sdk.RESULT_INFO).code || (response1 as sdk.RESULT_INFO).message) {
          } else {
            item = (response1 as any).list[0]
          }

          setShowAccount({
            isShow: true,
            step: AccountStep.Taiko_Farming_Lock_Success,
            info: {
              symbol: tradeStake.sellToken.symbol,
              amount: tradeStake.deFiSideCalcData.coinSell.tradeValue,
              daysDuration: Math.ceil(
                Number(tradeStake?.deFiSideCalcData?.stakeViewInfo?.rewardPeriod ?? 0) / 86400000,
              ),
              ...item,
            },
          })
          await sdk.sleep(SUBMIT_PANEL_QUICK_AUTO_CLOSE)
          walletLayer2Service.sendUserUpdate()
          updateStakingList()
        }
      } else {
        throw new Error('api not ready')
      }
    } catch (reason) {
      setToastOpen({
        open: true,
        type: ToastType.error,
        content:
          t('labelInvestFailed') + ' ' + (reason as CustomErrorWithCode)?.messageKey ??
          ` error: ${t((reason as CustomErrorWithCode)?.messageKey)}`,
      })
    } finally {
      resetDefault(true)
    }
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    exchangeInfo,
    resetDefault,
    setToastOpen,
    t,
  ])

  const onSubmitBtnClick = React.useCallback(async () => {
    // const tradeStake = store.getState().router_tradeStake.tradeStake;
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      tokenMap &&
      exchangeInfo &&
      account.eddsaKey?.sk
    ) {
      if (allowTrade && !allowTrade.defiInvest.enable) {
        setShowSupport({ isShow: true })
      } else if (toggle && !toggle['taikoFarming'].enable) {
        setShowTradeIsFrozen({ isShow: true, type: 'StakingInvest' })
      } else {
        sendRequest()
      }
    } else {
      return false
    }
  }, [
    account.readyState,
    account.eddsaKey?.sk,
    tokenMap,
    exchangeInfo,
    sendRequest,
    setToastOpen,
    t,
  ])
  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const account = store.getState().account
    const tradeStake = store.getState()._router_tradeStake.tradeStake
    myLog('tradeStake', tradeStake)
    if (account.readyState === AccountStatus.ACTIVATED) {
      if (tradeStake?.sellVol === undefined || sdk.toBig(tradeStake?.sellVol).lte(0)) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: 'labelEnterAmount',
        }
      } else if (
        sdk
          .toBig(tradeStake?.sellVol)
          .minus(tradeStake?.deFiSideCalcData?.stakeViewInfo?.minSellVol ?? 0)
          .lt(0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDefiMin| ${getValuePrecisionThousand(
            sdk.toBig(tradeStake?.deFiSideCalcData?.stakeViewInfo?.minSellAmount ?? 0),
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            false,
            { floor: false, isAbbreviate: true },
          )} ${coinSellSymbol}`,
        }
      } else if (
        sdk
          .toBig(tradeStake?.sellVol)
          .gt(tradeStake?.deFiSideCalcData?.stakeViewInfo?.maxSellVol ?? 0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDefiMax| ${getValuePrecisionThousand(
            sdk.toBig(tradeStake?.deFiSideCalcData?.stakeViewInfo?.maxSellAmount ?? 0),
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            false,
            { floor: false, isAbbreviate: true },
          )} ${coinSellSymbol}`,
        }
        // return {
        //   tradeBtnStatus: TradeBtnStatus.DISABLED,
        //   label: `labelDefiNoEnough| ${coinSellSymbol}`,
        // };
      } else if (
        tradeStake?.deFiSideCalcData?.coinSell?.tradeValue &&
        sdk
          .toBig(tradeStake.deFiSideCalcData.coinSell.tradeValue)
          .gt(tradeStake.deFiSideCalcData?.coinSell.balance ?? 0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelStakeNoEnough| ${coinSellSymbol}`,
        }
      } else if (
        !taikoFarmingChecked
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: 'labelTaikoFarmingNotChecked',
        }
      }else {
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' } // label: ''}
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
  }, [
    tradeStake?.deFiSideCalcData?.stakeViewInfo?.minSellVol,
    tradeStake.sellVol,
    tradeStake.sellToken,
    tradeStake.deFiSideCalcData,
    tokenMap,
    coinSellSymbol,
    taikoFarmingChecked
  ])
  const {
    btnStatus,
    onBtnClick,
    btnLabel: tradeMarketI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback: onSubmitBtnClick,
  })
  const [stakingList, setStakingList] = React.useState<sdk.STACKING_TRANSACTIONS[] | undefined>(undefined)
  
  const stakingAmountRaw = stakingList && sellToken
    ? utils.formatUnits(numberStringListSum(stakingList.map((item) => item.amount)), sellToken.decimals)
    : undefined
  const stakingAmount = stakingAmountRaw && sellToken
    ? numberFormatThousandthPlace(stakingAmountRaw, {tokenSymbol: sellToken.symbol, fixed: sellToken.precision, removeTrailingZero: true })
    : undefined

  const stakingAmountInCurrency = stakingAmountRaw && sellToken && tokenPrices[sellToken.symbol]
    ? fiatNumberDisplay(getValueInCurrency(new Decimal(stakingAmountRaw).mul(tokenPrices[sellToken.symbol]).toString()), currency) 
    : undefined
  const updateStakingList = () => {
    if (account.apiKey) {
      LoopringAPI?.defiAPI?.getStakeTransactions(
        {
          accountId: account.accountId,
          tokenId: sellToken.tokenId,
          start: 0,
          end: Date.now(),
          limit: 100,
          offset: 0,
        } as any,
        account.apiKey,
      ).then((res) => {
        setStakingList(res.list)
      })
    } else {
      setStakingList(undefined)
    }
  }
  React.useEffect(() => {
    getStakingMap()
    walletLayer2Service.sendUserUpdate()
    updateStakingList()
  }, [account.apiKey])
  React.useEffect(() => {
    const {
      _router_tradeStake: { tradeStake },
      invest: {
        stakingMap: { marketMap: stakingMap },
      },
    } = store.getState()

    if (
      stakingMapStatus === SagaStatus.UNSET &&
      stakingMap &&
      stakingMap[coinSellSymbol]?.symbol == coinSellSymbol &&
      !(tradeStake?.deFiSideCalcData?.coinSell?.belong == coinSellSymbol)
    ) {
      resetDefault(true)
    } else if (stakingMapStatus === SagaStatus.UNSET && stakingMap && !stakingMap[coinSellSymbol]) {
      // setToastOpen({
      //
      // })
    }
    return () => {
      resetTradeStake()
      handleOnchange.cancel()
    }
  }, [stakingMapStatus])

  const btnInfo = {
    label: tradeMarketI18nKey,
    params: {},
  }
  
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const btnLabel = React.useMemo(() => {
    if (btnInfo?.label) {
      const key = btnInfo?.label.split('|')
      return t(
        key[0],
        key && key[1]
          ? {
              arg: key[1],
              layer2: L1L2_NAME_DEFINED[network].layer2,
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }
          : {
              layer2: L1L2_NAME_DEFINED[network].layer2,
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            },
      )
    } else {
      return t(`labelInvestBtn`, {
        layer2: L1L2_NAME_DEFINED[network].layer2,
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [t, btnInfo])

  
  return {
    stakeWrapProps: {
      disabled: false,
      buttonDisabled: isLoading || (!taikoFarmingChecked && account.readyState === AccountStatus.ACTIVATED),
      btnInfo,
      isJoin: true,
      isLoading,
      switchStobEvent: (_isStoB: boolean | ((prevState: boolean) => boolean)) => {},
      onSubmitClick: onBtnClick as () => void,
      onChangeEvent: handleOnchange,
      deFiSideCalcData: {
        ...tradeStake.deFiSideCalcData,
      },
      minSellAmount: tradeStake?.deFiSideCalcData?.stakeViewInfo?.minSellAmount,
      maxSellAmount: tradeStake?.deFiSideCalcData?.stakeViewInfo?.maxSellAmount,
      tokenSell: {
        ...tokenMap[coinSellSymbol],
        decimals: tradeStake?.deFiSideCalcData?.stakeViewInfo?.decimals,
        precision: tradeStake?.deFiSideCalcData?.stakeViewInfo?.precision,
      },
      btnStatus,
      accStatus: account.readyState,
      btnLabel: btnLabel,
      lockedPosition: stakingList && stakingList.length > 0 ? {
        amount: stakingAmount,
        amountInCurrency: stakingAmountInCurrency,
        totalPoints: 'totalPoints todo',
        dailyEarn: 'dailyEarn todo',
        unlockDate: '2025-03-15 16:00',
      } : undefined,
      taikoFarmingChecked,
      onCheckBoxChange,
    } as unknown as DeFiSideWrapProps<T, I, ACD>
  }
}
