import {
  AccountStep,
  setShowVaultJoin,
  SwitchData,
  useOpenModals,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  CoinInfo,
  CoinMap,
  CustomErrorWithCode,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  TRADE_TYPE,
  TradeBtnStatus,
  UIERROR_CODE,
  WalletMap,
} from '@loopring-web/common-resources'
import React from 'react'
import {
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
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
  useWalletLayer2Socket,
  walletLayer2Service,
} from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  ConnectProviders,
  ConnectProvidersSignMap,
  connectProvides,
} from '@loopring-web/web3-provider'
import { useTranslation } from 'react-i18next'

export const useVaultJoin = <T extends IBData<I>, I>() => {
  const { t } = useTranslation()
  const { tokenMap: vaultTokenMap, joinTokenMap, coinMap: vaultCoinMap } = useVaultMap()
  const { tokenMap, coinMap, idIndex } = useTokenMap()
  const { status: vaultAccountInfoStatus, vaultAccountInfo, updateVaultLayer2 } = useVaultLayer2()
  const { exchangeInfo, chainId, baseURL } = useSystem()
  const { account } = useAccount()
  const { updateVaultJoin, vaultJoinData } = useTradeVault()
  const [isLoading, setIsLoading] = React.useState(false)
  const [tradeData, setTradeData] = React.useState<T>({
    belong: undefined,
    balance: undefined,
    tradeValue: undefined,
  } as unknown as T)
  const isActiveAccount = [sdk.VaultAccountStatus.FREE, sdk.VaultAccountStatus.UNDEFINED].includes(
    vaultAccountInfo?.accountStatus ?? ('' as any),
  )
  const calcSupportData = (tradeData: T) => {
    let supportData = {}
    // const vaultJoinData = store.getState()._router_tradeVault.vaultJoinData
    if (tradeData.belong) {
      const vaultTokenSymbol = walletAllowMap[tradeData.belong as any].vaultToken
      const vaultTokenInfo = vaultTokenMap[vaultTokenSymbol]
      const ercToken = tokenMap[tradeData.belong]
      // tradeData.belong
      supportData = {
        maxShowVal: getValuePrecisionThousand(
          sdk.toBig(vaultTokenInfo.btradeAmount).div('1e' + ercToken.decimals),
          ercToken.precision,
          ercToken.precision,
          undefined,
        ),

        minShowVal: getValuePrecisionThousand(
          sdk.toBig(vaultTokenInfo.vaultTokenAmounts.minAmount).div('1e' + vaultTokenInfo.decimals),
          ercToken.precision,
          ercToken.precision,
          undefined,
        ),
        maxAmount: vaultTokenInfo.btradeAmount,
        minAmount: vaultTokenInfo.vaultTokenAmounts.minAmount,
        vaultSymbol: vaultTokenSymbol,
        vaultTokenInfo,
      }
    }
    return {
      ...supportData,
    }
  }
  const availableTradeCheck = React.useCallback(() => {
    const vaultAccountInfoSymbol =
      idIndex[vaultAccountInfo?.collateralInfo?.collateralTokenId ?? ''] ?? ''
    const vaultJoinData = store.getState()._router_tradeVault.vaultJoinData
    if (!vaultJoinData?.amount && sdk.toBig(vaultJoinData?.amount ?? 0).lte(0)) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: '' }
    } else if (
      !isActiveAccount &&
      vaultAccountInfoSymbol &&
      vaultJoinData.belong !== vaultAccountInfoSymbol
    ) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: 'labelVaultJoinMax' }
    } else if (sdk.toBig(vaultJoinData.amount).lte(vaultJoinData.minAmount)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultJoinMini|${vaultJoinData.minShowVal} ${vaultJoinData.belong}`,
      }
    } else if (sdk.toBig(vaultJoinData.tradeValue ?? 0).gte(vaultJoinData.balance ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultJoinNotEnough ${vaultJoinData.belong}`,
      }
    } else if (sdk.toBig(vaultJoinData.amount ?? 0).gte(vaultJoinData.maxAmount ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultJoinMax|${vaultJoinData.maxShowVal} ${vaultJoinData.belong}`,
      }
    } else if (sdk.toBig(vaultJoinData.amount ?? 0).gte(vaultJoinData.maxAmount ?? 0)) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: 'labelVaultJoinMax' }
    } else {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
    }
  }, [
    vaultAccountInfoStatus,
    tokenMap,
    vaultJoinData,
    vaultJoinData.tradeValue,
    vaultJoinData.balance,
    vaultJoinData.amount,
    vaultJoinData.maxAmount,
    vaultJoinData.minAmount,
    vaultJoinData.belong,
  ])
  const processRequest = async (request?: sdk.VaultJoinRequest) => {
    // const { apiKey, connectName, eddsaKey } = account
    const vaultJoinData = store.getState()._router_tradeVault.vaultJoinData
    const ercToken = tokenMap[vaultJoinData.belong]
    try {
      if (request || (vaultJoinData.request && LoopringAPI.vaultAPI)) {
        let response = LoopringAPI.vaultAPI.submitVaultJoin({
          // @ts-ignore
          request: request ?? vaultJoinData.request,
          eddsaKey: account.eddsaKey.sk,
          apiKey: account.apiKey,
          web3: connectProvides.usedWeb3 as any,
          chainId: chainId === 'unknown' ? 1 : chainId,
          walletType: (ConnectProvidersSignMap[account.connectName] ??
            account.connectName) as unknown as sdk.ConnectorNames,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        }
        walletLayer2Service.sendUserUpdate()
        // vaultJoinData.request

        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw new CustomErrorWithCode({
            code: (response as sdk.RESULT_INFO).code,
            message: (response as sdk.RESULT_INFO).message,
            ...SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? UIERROR_CODE.UNKNOWN],
          })
        } else {
          setShowAccount({
            isShow: true,
            step: AccountStep.VaultJoin_In_Progress,
            info: {
              title: isActiveAccount ? t('labelVaultJoinTitle') : t('labelVaultJoinMarginTitle'),
              status: 'Pending',
              percentage: '0',
              amount: EmptyValueTag,
              sum: getValuePrecisionThousand(
                vaultJoinData.tradeValue,
                ercToken.precision,
                ercToken.precision,
                undefined,
              ),
              symbol: ercToken,
              vSymbol: vaultJoinData.vaultSymbol,
            },
          })
          // Success
          // Failed

          sdk.sleep(1000).then(() => updateVaultLayer2())
          const response2 = await LoopringAPI.vaultAPI.getVaultGetOperationByHash({
            accountId: account.accountId,
            hash: (response as any).hash,
          })
          if ((response2 as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          } else {
            response2.status
            updateVaultLayer2
          }
          // 171504
          //TODO
          setShowAccount({
            isShow: true,
            step: AccountStep.VaultJoin_Success,
            info: {
              title: isActiveAccount ? t('labelVaultJoinTitle') : t('labelVaultJoinMarginTitle'),
              status: 'Pending',
              percentage: '0',
              amount: EmptyValueTag,
              sum: getValuePrecisionThousand(
                vaultJoinData.tradeValue,
                ercToken.precision,
                ercToken.precision,
                undefined,
              ),
              symbol: ercToken,
              vSymbol: vaultJoinData.vaultSymbol,
            },
          })
          sdk.sleep(1000).then(() => updateVaultLayer2())
          setShowVaultJoin({
            isShow: false,
          })
        }
      } else {
        throw 'no data'
      }
    } catch (e) {
      //TODO
      const error = {
        message: e.message,
      }
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultJoin_Failed,
        info: {
          title: isActiveAccount ? t('labelVaultJoinTitle') : t('labelVaultJoinMarginTitle'),
          status: 'Failed',
          percentage: '0',
          amount: EmptyValueTag,
          sum: getValuePrecisionThousand(
            vaultJoinData.tradeValue,
            ercToken.precision,
            ercToken.precision,
            undefined,
          ),
          symbol: ercToken,
          vSymbol: vaultJoinData.vaultSymbol,
        },
        error,
      })
    }
  }

  const submitCallback = async () => {
    const vaultJoinData = store.getState()._router_tradeVault.vaultJoinData
    const ercToken = tokenMap[vaultJoinData.belong]
    try {
      if (
        vaultJoinData &&
        exchangeInfo &&
        vaultJoinData.belong &&
        LoopringAPI.vaultAPI &&
        LoopringAPI.userAPI &&
        vaultAccountInfo &&
        sdk.toBig(vaultJoinData.amount).gte(vaultJoinData.minAmount ?? 0) &&
        sdk.toBig(vaultJoinData.amount).lte(vaultJoinData.maxAmount ?? 0)
      ) {
        setIsLoading(true)

        //TODO: step 1: has rest balance  //vaultLayer2 l2 balance
        if (isActiveAccount) {
          const response = await LoopringAPI.vaultAPI?.getVaultBalance(
            {
              accountId: account.accountId,
              tokens: '',
            },
            account.apiKey,
          )

          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            throw response
          } else if (response.raw_data?.length) {
            const { broker } = await LoopringAPI.userAPI?.getAvailableBroker({
              type: 4,
            })
            const promiseAllStorageId = response?.raw_data?.map((item) => {
              return LoopringAPI.userAPI?.getNextStorageId(
                {
                  accountId: account.accountId,
                  sellTokenId: item.tokenId,
                },
                account.apiKey,
              )
            })
            await Promise.all([...promiseAllStorageId]).then((result) => {
              return Promise.all(
                result.map((item, index) => {
                  return (
                    item &&
                    LoopringAPI.vaultAPI?.sendVaultResetToken(
                      {
                        request: {
                          exchange: exchangeInfo.exchangeAddress,
                          payerAddr: account.accAddress,
                          payerId: account.accountId,
                          payeeId: 0,
                          payeeAddr: broker,
                          storageId: item.offchainId,
                          token: {
                            tokenId: response?.raw_data[index].tokenId,
                            volume: response?.raw_data[index].total,
                          },
                          maxFee: {
                            tokenId: response?.raw_data[index].tokenId,
                            volume: '0', // TEST: fee.toString(),
                          },
                          validUntil: getTimestampDaysLater(DAYS),
                          memo: '',
                        } as any,
                        web3: connectProvides.usedWeb3 as any,
                        chainId: chainId !== sdk.ChainId.GOERLI ? sdk.ChainId.MAINNET : chainId,
                        walletType: (ConnectProviders[account.connectName] ??
                          account.connectName) as unknown as sdk.ConnectorNames,
                        eddsaKey: account.eddsaKey.sk,
                        apiKey: account.apiKey,
                      },
                      {
                        accountId: account.accountId,
                        counterFactualInfo: account.eddsaKey.counterFactualInfo,
                      },
                    )
                  )
                }),
              )
            })
          }
        }

        //TODO: step 2: get a NFT
        const [avaiableNFT, storageId] = await Promise.all([
          isActiveAccount
            ? LoopringAPI.vaultAPI
                .getVaultGetAvailableNFT(
                  {
                    accountId: account.accountId,
                  },
                  account.apiKey,
                )
                .then((avaiableNFT) => {
                  if (
                    avaiableNFT &&
                    ((avaiableNFT as sdk.RESULT_INFO).code ||
                      (avaiableNFT as sdk.RESULT_INFO).message)
                  ) {
                    throw avaiableNFT
                  }
                  return {
                    ...avaiableNFT.raw_data,
                  }
                })
            : Promise.resolve({
                ...vaultAccountInfo.collateralInfo,
                tokenId: vaultAccountInfo?.collateralInfo?.nftTokenId,
              }),
          LoopringAPI.userAPI.getNextStorageId(
            {
              accountId: account.accountId,
              sellTokenId: tokenMap[vaultJoinData.belong].tokenId,
            },
            account.apiKey,
          ),
        ])

        if (
          storageId &&
          ((storageId as sdk.RESULT_INFO).code || (storageId as sdk.RESULT_INFO).message)
        ) {
          throw storageId
        }
        const amount = sdk
          .toBig(vaultJoinData.amount)
          .plus(isActiveAccount ? 0 : vaultAccountInfo?.collateralInfo?.collateralTokenAmount ?? 0)
        const takerOrder: sdk.VaultJoinRequest = {
          exchange: exchangeInfo.exchangeAddress,
          accountId: account.accountId,
          storageId: storageId.orderId,
          sellToken: {
            tokenId: tokenMap[vaultJoinData.belong].tokenId,
            amount: amount.toString(),
          },
          buyToken: {
            //@ts-ignore
            tokenId: avaiableNFT.tokenId,
            //@ts-ignore
            nftData: avaiableNFT.nftData,
            amount: '1',
          },
          allOrNone: false,
          fillAmountBOrS: true,
          validUntil: getTimestampDaysLater(DAYS),
          maxFeeBips: 100,
          joinHash: isActiveAccount ? '' : (avaiableNFT as any)?.orderHash,
        }
        updateVaultJoin({
          ...vaultJoinData,
          __request__: takerOrder,
          request: takerOrder,
        })
        processRequest(takerOrder)
      }
    } catch (e) {
      //TODO: catch
      setIsLoading(false)
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultJoin_Failed,
        // info: {
        //   title: isActiveAccount ? t('labelVaultJoinTitle') : t('labelVaultJoinMarginTitle'),
        //   status: 'Failed',
        //   percentage: '0',
        //   amount: EmptyValueTag,
        //   sum: getValuePrecisionThousand(
        //     vaultJoinData.tradeValue,
        //     ercToken.precision,
        //     ercToken.precision,
        //     undefined,
        //   ),
        //   symbol: ercToken,
        //   vSymbol: vaultJoinData.vaultSymbol,
        // },
        error: {
          ...(e as any),
        },
      })
    }
  }

  const {
    btnStatus,
    onBtnClick,
    btnLabel,
    // btnStyle: tradeLimitBtnStyle,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback,
  })
  const {
    modals: {
      isShowVaultJoin: { isShow, info },
      // isShowAccount: { info },
    },
    setShowAccount,
  } = useOpenModals()

  const walletAllowMap =
    (joinTokenMap &&
      Reflect.ownKeys(joinTokenMap).reduce((previousValue, key) => {
        const token = vaultTokenMap[key.toString()]
        const symbol = idIndex[token.tokenId]
        // as sdk.VaultToken
        return {
          ...previousValue,
          [symbol]: { ...coinMap[symbol], vaultToken: token.symbol, vaultId: token.vaultTokenId },
        }
      }, {} as CoinMap<CoinInfo<I> & { vaultToken: string; vaultId: number }>)) ??
    ({} as CoinMap<CoinInfo<I> & { vaultToken: string; vaultId: number }>)
  // const calc =
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
    let walletInfo,
      isActiveAccount = false

    if (
      account &&
      account.readyState === AccountStatus.ACTIVATED &&
      !isActiveAccount &&
      vaultAccountInfo?.collateralInfo?.collateralTokenId
    ) {
      initSymbol = idIndex[vaultAccountInfo?.collateralInfo.collateralTokenId]
    } else if (account.readyState === AccountStatus.ACTIVATED && !info?.symbol) {
      const key = Reflect.ownKeys(vaultCoinMap).find((keyVal) => {
        const walletInfo = walletMap[keyVal.toString()] ?? { count: 0 }
        if (sdk.toBig(walletInfo?.count ?? 0).gt(0)) {
          return true
        }
      })
      initSymbol = key ? key.toString() : initSymbol
    }
    walletInfo = {
      belong: initSymbol,
      balance: (walletMap && walletMap[initSymbol.toString()]?.count) ?? 0,
      tradeValue: undefined,
    }
    vaultJoinData = {
      ...vaultJoinData,
      walletInfo,
    }
    // const =
    setTradeData({
      ...walletInfo,
    })
    updateVaultJoin({
      ...walletInfo,
      ...vaultJoinData,
      ...calcSupportData(walletInfo),
    })
  }
  const vaultLayer2Callback = React.useCallback(() => {
    const vaultJoinData = store.getState()._router_tradeVault.vaultJoinData
    const walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap ?? {}
    // setWalletMap(walletMap as WalletMap<T>)
    updateVaultJoin({
      ...vaultJoinData,
      walletMap,
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
      walletLayer2Service.sendUserUpdate()
      updateVaultLayer2()
    }
  }, [isShow])
  const handlePanelEvent = async (props: SwitchData<T>, _switchType: 'Tomenu' | 'Tobutton') => {
    setTradeData(props.tradeData as T)
    const tokenSymbol = props.tradeData.belong
    // debugger
    if (tokenSymbol) {
      // const supportData = calcSupportData(props.tradeData)
      updateVaultJoin({
        ...vaultJoinData,
        amount: sdk
          .toBig(props.tradeData.tradeValue ?? 0)
          .times('1e' + tokenMap[tokenSymbol].decimals)
          .toString(),
        ...calcSupportData(props.tradeData),
        ...props.tradeData,
        // walletMap: makeWalletLayer2({ needFilterZero: true }).walletMap ?? {},
      })
    }
  }
  const walletAllowCoin = React.useMemo(() => {
    const vaultTokenSymbol = idIndex[vaultAccountInfo?.collateralInfo?.collateralTokenId ?? '']
    return { [vaultTokenSymbol]: coinMap[vaultTokenSymbol] }
  }, [vaultAccountInfo?.collateralInfo])
  // btnStatus, enableBtn, disableBtn
  return {
    handleError: undefined,
    type: TRADE_TYPE.TOKEN,
    baseURL,
    btnI18nKey: btnLabel,
    btnStatus,
    isActiveAccount,
    disabled: false,
    onSubmitClick: (_data: T) => onBtnClick(),
    propsExtends: {},
    tradeData: tradeData as unknown as T,
    handlePanelEvent,
    walletMap: vaultJoinData.walletMap as WalletMap<any>,
    vaultJoinData,
    coinMap: isActiveAccount ? walletAllowMap : walletAllowCoin,
  }
}
