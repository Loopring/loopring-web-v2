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
  SUBMIT_PANEL_AUTO_CLOSE,
  SUBMIT_PANEL_CHECK,
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
import BigNumber from 'bignumber.js'

export const useVaultJoin = <T extends IBData<I>, I>() => {
  const { t } = useTranslation()
  const { tokenMap: vaultTokenMap, joinTokenMap, coinMap: vaultCoinMap, erc20Map } = useVaultMap()
  const { tokenMap, coinMap, idIndex } = useTokenMap()
  const { status: vaultAccountInfoStatus, vaultAccountInfo, updateVaultLayer2 } = useVaultLayer2()
  const { exchangeInfo, chainId, baseURL } = useSystem()
  const { account } = useAccount()
  const { updateVaultJoin, vaultJoinData } = useTradeVault()
  const [isLoading, setIsLoading] = React.useState(false)

  const isActiveAccount =
    [sdk.VaultAccountStatus.FREE, sdk.VaultAccountStatus.UNDEFINED].includes(
      vaultAccountInfo?.accountStatus ?? ('' as any),
    ) ||
    vaultAccountInfo == undefined ||
    vaultAccountInfo?.accountStatus == undefined
  const calcSupportData = (tradeData: T) => {
    let supportData = {}
    // const vaultJoinData = store.getState()._router_tradeVault.vaultJoinData
    if (tradeData?.belong) {
      const vaultTokenSymbol = walletAllowMap[tradeData.belong as any].vaultToken
      const vaultTokenInfo = vaultTokenMap[vaultTokenSymbol]
      const ercToken = tokenMap[tradeData.belong]
      // tradeData.belong
      supportData = {
        maxShowVal: getValuePrecisionThousand(
          sdk.toBig(vaultTokenInfo.btradeAmount).div('1e' + ercToken.decimals),
          vaultTokenInfo?.vaultTokenAmounts?.qtyStepScale,
          vaultTokenInfo?.vaultTokenAmounts?.qtyStepScale,
          undefined,
        ),

        minShowVal: getValuePrecisionThousand(
          sdk.toBig(vaultTokenInfo.vaultTokenAmounts.minAmount).div('1e' + vaultTokenInfo.decimals),
          vaultTokenInfo?.vaultTokenAmounts?.qtyStepScale,
          vaultTokenInfo?.vaultTokenAmounts?.qtyStepScale,
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
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultJoinSymbolNotSame|${vaultJoinData.belong}`,
      }
    } else if (sdk.toBig(vaultJoinData.amount).lt(vaultJoinData.minAmount)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultJoinMini|${vaultJoinData.minShowVal} ${vaultJoinData.belong}`,
      }
    } else if (sdk.toBig(vaultJoinData.tradeValue ?? 0).gt(vaultJoinData.balance ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultJoinNotEnough ${vaultJoinData.belong}`,
      }
    } else if (sdk.toBig(vaultJoinData.amount ?? 0).gt(vaultJoinData.maxAmount ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultJoinMax|${vaultJoinData.maxShowVal} ${vaultJoinData.belong}`,
      }
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
    const vaultJoinData = store.getState()._router_tradeVault.vaultJoinData ?? {}
    const ercToken = tokenMap[vaultJoinData?.belong?.toString() ?? '']
    try {
      if (LoopringAPI.vaultAPI && (request || vaultJoinData.request) && ercToken) {
        let response = await LoopringAPI.vaultAPI.submitVaultJoin({
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
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        } else {
          walletLayer2Service.sendUserUpdate()
          updateVaultLayer2(
            isActiveAccount
              ? {
                  activeInfo: {
                    hash: (response as any).hash,
                    isInActive: true,
                  },
                }
              : {},
          )
          setShowVaultJoin({ isShow: false })
          setIsLoading(false)
          await sdk.sleep(SUBMIT_PANEL_CHECK)
          const response2 = await LoopringAPI.vaultAPI.getVaultGetOperationByHash(
            {
              accountId: account?.accountId?.toString(),
              hash: (response as any).hash,
            },
            account.apiKey,
          )
          let status = ''
          if (
            response2?.raw_data?.operation?.status == sdk.VaultOperationStatus.VAULT_STATUS_FAILED
          ) {
            throw sdk.VaultOperationStatus.VAULT_STATUS_FAILED
          } else if (
            response2?.raw_data?.operation?.status !== sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED
          ) {
            status = 'labelPending'
          } else {
            status = 'labelFinished'
          }

          setShowAccount({
            isShow: true,
            step: AccountStep.VaultJoin_Success,
            info: {
              title: isActiveAccount ? t('labelVaultJoinTitle') : t('labelVaultJoinMarginTitle'),
              status: t(status),
              amount: sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED
                ? getValuePrecisionThousand(
                    vaultJoinData.tradeValue,
                    ercToken.precision,
                    ercToken.precision,
                    undefined,
                  )
                : 0,
              sum: getValuePrecisionThousand(
                vaultJoinData.tradeValue,
                ercToken.precision,
                ercToken.precision,
                undefined,
              ),
              symbol: ercToken.symbol,
              vSymbol: vaultJoinData.vaultSymbol,
              time: response2?.raw_data?.order?.createdAt,
            },
          })
        }

        await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
        walletLayer2Service.sendUserUpdate()
        updateVaultLayer2({})
        if (
          store.getState().modals.isShowAccount.isShow &&
          store.getState().modals.isShowAccount.step == AccountStep.VaultJoin_Success
        ) {
          setShowAccount({ isShow: false })
        }
      } else {
        throw new Error('api not ready')
      }
    } catch (e) {
      let error
      setIsLoading(false)
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
          symbol: ercToken.symbol,
          vSymbol: vaultJoinData.vaultSymbol,
          time: new Date(),
        },
        error,
      })
    }
  }

  const submitCallback = async () => {
    const vaultJoinData = store.getState()._router_tradeVault.vaultJoinData
    const ercToken = tokenMap[vaultJoinData?.belong ?? ''] ?? {}
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
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultJoin_In_Progress,
          info: {
            title: isActiveAccount ? t('labelVaultJoinTitle') : t('labelVaultJoinMarginTitle'),
            status: t('labelPending'),
            percentage: '0',
            amount: EmptyValueTag,
            sum: getValuePrecisionThousand(
              vaultJoinData.tradeValue,
              ercToken?.precision ?? 6,
              ercToken?.precision ?? 6,
              undefined,
            ),
            symbol: ercToken.symbol,
            vSymbol: vaultJoinData.vaultSymbol,
            time: Date.now(),
          },
        })
        //step 1: has rest balance
        if (isActiveAccount) {
          const response = await LoopringAPI.vaultAPI.getVaultBalance(
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
            const promiseAllStorageId =
              response?.raw_data?.reduce((prev, item) => {
                if (sdk.toBig(item?.total).gt(0)) {
                  prev.push(
                    //@ts-ignore
                    LoopringAPI.userAPI.getNextStorageId(
                      {
                        accountId: account.accountId,
                        sellTokenId: item.tokenId,
                      },
                      account.apiKey,
                    ),
                  )
                }
                return prev
              }, [] as Array<Promise<any>>) ?? []
            await Promise.all([...promiseAllStorageId]).then((result) => {
              return Promise.all(
                result.map((item, index) => {
                  return (
                    item &&
                    LoopringAPI.vaultAPI.sendVaultResetToken(
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

        //step 2: get a NFT
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
      setIsLoading(false)
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultJoin_Failed,
        info: {
          title: isActiveAccount ? t('labelVaultJoinTitle') : t('labelVaultJoinMarginTitle'),
          status: t('labelFailed'),
          percentage: '0',
          amount: EmptyValueTag,
          sum: EmptyValueTag,
          symbol: ercToken.symbol,
          vSymbol: vaultJoinData.vaultSymbol,
          time: new Date(),
        },
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
      isShowVaultJoin: { isShow, symbol },
      // isShowAccount: { info },
    },
    setShowAccount,
  } = useOpenModals()

  const walletAllowMap =
    (joinTokenMap &&
      Reflect.ownKeys(joinTokenMap).reduce((prev, key) => {
        const token = vaultTokenMap[key.toString()]
        const symbol = idIndex[token.tokenId]
        // as sdk.VaultToken
        return {
          ...prev,
          [symbol]: { ...coinMap[symbol], vaultToken: token.symbol, vaultId: token.vaultTokenId },
        }
      }, {} as CoinMap<CoinInfo<I> & { vaultToken: string; vaultId: number }>)) ??
    ({} as CoinMap<CoinInfo<I> & { vaultToken: string; vaultId: number }>)
  // const calc =
  const initData = () => {
    let vaultJoinData: any = {}
    let initSymbol = 'LRC'
    if (symbol) {
      initSymbol = symbol
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
    } else if (account.readyState === AccountStatus.ACTIVATED && !symbol) {
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
    updateVaultJoin({
      ...walletInfo,
      ...vaultJoinData,
      ...calcSupportData(walletInfo),
      tradeData: walletInfo,
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
      updateVaultLayer2({})
    }
  }, [isShow])
  const handlePanelEvent = async (data: SwitchData<T>, _switchType: 'Tomenu' | 'Tobutton') => {
    const walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap ?? {}
    const tokenSymbol = data.tradeData.belong
    let walletInfo: any = {
      ...walletMap[tokenSymbol],
      balance: (walletMap && walletMap[tokenSymbol]?.count) ?? 0,
      tradeValue: data.tradeData?.tradeValue
        ? sdk
            .toBig(data.tradeData?.tradeValue)
            .toFixed(
              erc20Map[data.tradeData.belong]?.tokenInfo?.vaultTokenAmounts?.qtyStepScale,
              BigNumber.ROUND_DOWN,
            )
        : data.tradeData?.tradeValue,
    }
    // debugger
    if (tokenSymbol) {
      updateVaultJoin({
        ...vaultJoinData,
        amount: sdk
          .toBig(walletInfo.tradeValue ?? 0)
          .times('1e' + tokenMap[tokenSymbol].decimals)
          .toString(),
        tradeData: walletInfo,
        ...calcSupportData(data.tradeData),
        ...walletInfo,
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
    tradeData: vaultJoinData.tradeData as unknown as T,
    handlePanelEvent,
    walletMap: vaultJoinData.walletMap as WalletMap<any>,
    vaultJoinData,
    coinMap: isActiveAccount ? walletAllowMap : walletAllowCoin,
    tokenProps: {
      decimalsLimit:
        erc20Map[vaultJoinData?.tradeData?.belong]?.tokenInfo?.vaultTokenAmounts?.qtyStepScale,
      allowDecimals: erc20Map[vaultJoinData?.tradeData?.belong]?.tokenInfo?.vaultTokenAmounts
        ?.qtyStepScale
        ? true
        : false,
    },
  }
}
