import { AccountStep, SwitchData, useOpenModals } from '@loopring-web/component-lib'
import {
  AccountStatus,
  CoinInfo,
  CoinMap,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  SUBMIT_PANEL_AUTO_CLOSE,
  SUBMIT_PANEL_CHECK,
  TRADE_TYPE,
  TradeBtnStatus,
  WalletMap,
  myLog,
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
  useL2CommonSocket,
  l2CommonService,
} from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  ConnectProviders,
  ConnectProvidersSignMap,
  connectProvides,
} from '@loopring-web/web3-provider'
import { useTranslation } from 'react-i18next'
import BigNumber from 'bignumber.js'
import { VaultAccountStatus } from '@loopring-web/loopring-sdk'
import { keys } from 'lodash'

const DATE_IN_TEN_YEARS = 2027988026

export const useVaultJoin = <T extends IBData<I>, I>() => {
  const { t } = useTranslation()
  const { tokenMap: vaultTokenMap, joinTokenMap, erc20Map, getVaultMap } = useVaultMap()
  const { tokenMap, coinMap, idIndex } = useTokenMap()
  const { status: vaultAccountInfoStatus, vaultAccountInfo, updateVaultLayer2 } = useVaultLayer2()
  const { exchangeInfo, chainId, baseURL } = useSystem()
  const { account } = useAccount()
  const { updateVaultJoin, vaultJoinData, resetVaultJoin } = useTradeVault()
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
    if (tradeData?.belong && walletAllowMap&& walletAllowMap[tradeData.belong as any]) {
      const vaultTokenSymbol = walletAllowMap[tradeData.belong as any]?.vaultToken
      const vaultTokenInfo = vaultTokenMap[vaultTokenSymbol]
      const ercToken = tokenMap[tradeData.belong]
      const minAmount =
        vaultAccountInfo?.accountStatus === VaultAccountStatus.IN_STAKING
          ? sdk
              .toBig('10')
              .exponentiatedBy(-1 * vaultTokenInfo?.vaultTokenAmounts?.qtyStepScale)
              .toString()
          : sdk
              .toBig(vaultTokenInfo?.vaultTokenAmounts?.minAmount)
              .div('1e' + vaultTokenInfo.decimals)
              .toString()
      supportData = {
        maxShowVal: getValuePrecisionThousand(
          sdk
            //@ts-ignore
            .toBig(vaultTokenInfo?.vaultTokenAmounts?.maxAmount ?? 0)
            .div('1e' + ercToken.decimals),
          vaultTokenInfo?.vaultTokenAmounts?.qtyStepScale,
          vaultTokenInfo?.vaultTokenAmounts?.qtyStepScale,
          undefined,
        ),

        minShowVal: getValuePrecisionThousand(
          minAmount,
          vaultTokenInfo?.vaultTokenAmounts?.qtyStepScale,
          vaultTokenInfo?.vaultTokenAmounts?.qtyStepScale,
          undefined,
        ),
        maxAmount: vaultTokenInfo?.vaultTokenAmounts?.maxAmount,
        minAmount: sdk.toBig(minAmount).times('1e' + vaultTokenInfo.decimals),
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
        label: `labelVaultJoinNotEnough|${vaultJoinData.belong}`,
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
          l2CommonService.sendUserUpdate()
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
            [
              sdk.VaultOperationStatus.VAULT_STATUS_EARNING,
              sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED,
            ].includes(response2?.raw_data?.operation?.status)
          ) {
            status = 'labelSuccessfully'
          } else {
            status = 'labelPending'
          }

          setShowAccount({
            isShow: store.getState().modals.isShowAccount.isShow,
            step:
              status == 'labelSuccessfully'
                ? AccountStep.VaultJoin_Success
                : AccountStep.VaultJoin_In_Progress,
            info: {
              title: isActiveAccount ? t('labelVaultJoinTitle') : t('labelVaultJoinMarginTitle'),
              type: isActiveAccount ? t('labelVaultJoin') : t('labelVaultMarginCall'),
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
        l2CommonService.sendUserUpdate()
        if (
          store.getState().modals.isShowAccount.isShow &&
          [AccountStep.VaultJoin_Success, AccountStep.VaultJoin_In_Progress].includes(
            store.getState().modals.isShowAccount.step,
          )
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
          type: isActiveAccount ? t('labelVaultJoin') : t('labelVaultMarginCall'),
          status: t('labelFailed'),
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
            type: isActiveAccount ? t('labelVaultJoin') : t('labelVaultMarginCall'),
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
        let number = 3
        //step 1: has rest balance     //loop three times for dust
        while (number--) {
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
              const tokenListIgnoreZero: any = []
              const promiseAllStorageId =
                response?.raw_data?.reduce((prev, item) => {
                  if (sdk.toBig(item?.total).gt(0)) {
                    tokenListIgnoreZero.push(item)
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
              if (tokenListIgnoreZero.length === 0) {
                break
              }
              const { broker } = await LoopringAPI.userAPI?.getAvailableBroker({
                type: 4,
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
                              tokenId: tokenListIgnoreZero[index].tokenId,
                              volume: tokenListIgnoreZero[index].total,
                            },
                            maxFee: {
                              tokenId: tokenListIgnoreZero[index].tokenId,
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
          validUntil: DATE_IN_TEN_YEARS, 
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
          type: isActiveAccount ? t('labelVaultJoin') : t('labelVaultMarginCall'),
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
    setShowVaultJoin,
    setShowAccount,
  } = useOpenModals()
  const makeWalletLayer2ForVault = () => {
    let walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap ?? {}
    Reflect.ownKeys(walletMap ?? {}).forEach((symbol) => {
      walletMap[symbol.toString()] = {
        ...walletMap[symbol.toString()],
        count: sdk
          .toBig((walletMap && walletMap[symbol.toString()]?.count) ?? 0)
          .toFixed(erc20Map[symbol]?.vaultTokenAmounts?.qtyStepScale, BigNumber.ROUND_DOWN),
      } as any
    })
    return walletMap
  }

  const walletAllowMap =
    joinTokenMap &&
    (keys(joinTokenMap)
      .filter((key) => {
        return joinTokenMap[key].vaultTokenAmounts.status & 2
      })
      .reduce((pre, cur) => {
        const value = joinTokenMap[cur]
        const symbolWithLV = cur.slice(2)
        return {
          ...pre,
          [symbolWithLV]: {
            vaultToken: cur,
            vaultId: value.vaultTokenId,
            name: symbolWithLV,
            simpleName: symbolWithLV,
          },
        }
      }, {}) as { name: string; simpleName: string; vaultToken: string; vaultId: number })

  const initData = () => {
    let vaultJoinData: any = {}
    let initSymbol = 'LRC'
    if (symbol) {
      initSymbol = symbol
    }
    let walletMap = makeWalletLayer2ForVault()
    let vaultMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map ?? {}
    vaultJoinData = {
      ...vaultJoinData,
      walletMap,
      vaultMap,
      coinMap: walletAllowMap,
    }
    let walletInfo,
      isActiveAccount =
        !vaultAccountInfo?.accountStatus ||
        [VaultAccountStatus.FREE, VaultAccountStatus.UNDEFINED].includes(
          vaultAccountInfo?.accountStatus,
        )

    if (
      account &&
      account.readyState === AccountStatus.ACTIVATED &&
      !isActiveAccount &&
      vaultAccountInfo?.collateralInfo?.collateralTokenId !== undefined
    ) {
      initSymbol = idIndex[vaultAccountInfo?.collateralInfo.collateralTokenId]
    } else if (account.readyState === AccountStatus.ACTIVATED && !symbol) {
      const key = Reflect.ownKeys(joinTokenMap).find((keyVal) => {
        const erc20Symbol = idIndex[joinTokenMap[keyVal.toString()]?.tokenId]
        const walletInfo = walletMap[erc20Symbol] ?? { count: 0 }
        if (sdk.toBig(walletInfo?.count ?? 0).gt(0)) {
          return true
        }
      })
      initSymbol = key ? idIndex[joinTokenMap[key.toString()]?.tokenId].toString() : initSymbol
    }
    walletInfo = {
      belong: initSymbol,
      balance: walletMap[initSymbol]?.count ?? 0,
      tradeValue: undefined,
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
    let walletMap = makeWalletLayer2ForVault()
    updateVaultJoin({
      ...vaultJoinData,
      walletMap,
      vaultLayer2Map: makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map,
    })
  }, [])

  const walletLayer2Callback = React.useCallback(() => {
    const vaultJoinData = store.getState()._router_tradeVault.vaultJoinData
    updateVaultJoin({
      ...vaultJoinData,
      walletMap: makeWalletLayer2ForVault(),
    })
  }, [])
  useL2CommonSocket({ walletLayer2Callback, vaultLayer2Callback })
  React.useEffect(() => {
    let time: any = -1
    if (isShow) {
      onRefreshData()
      initData()
      time = setTimeout(() => {
        if (refreshRef.current) {
          // @ts-ignore
          refreshRef.current.firstElementChild.click()
        }
      }, 500)
    } else {
      resetVaultJoin()
    }
    return () => {
      clearTimeout(time)
    }
  }, [isShow])
  const onRefreshData = React.useCallback(() => {
    myLog('useVaultSwap: onRefreshData')
    l2CommonService.sendUserUpdate()
    getVaultMap()
  }, [])
  const refreshRef = React.createRef()

  const handlePanelEvent = async (data: SwitchData<T>, _switchType: 'Tomenu' | 'Tobutton') => {
    const walletMap = makeWalletLayer2ForVault()
    const tokenSymbol = data.tradeData.belong
    let walletInfo: any = {
      ...walletMap[tokenSymbol],
      balance: walletMap[tokenSymbol]?.count ?? 0,
      tradeValue: data.tradeData?.tradeValue,
      belong: tokenSymbol
    }
    myLog('walletInfo', walletInfo)
    if (tokenSymbol) {
      updateVaultJoin({
        ...vaultJoinData,
        amount: sdk
          .toBig(walletInfo.tradeValue ?? 0)
          .times('1e' + tokenMap[tokenSymbol].decimals)
          .toString(),
        tradeData: walletInfo,
        ...walletInfo,
        ...calcSupportData(walletInfo),
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
    onRefreshData,
    refreshRef,
    walletMap: vaultJoinData.walletMap as WalletMap<any>,
    vaultJoinData,
    coinMap: isActiveAccount ? walletAllowMap : walletAllowCoin,
    tokenProps: {
      decimalsLimit: erc20Map[vaultJoinData?.tradeData?.belong]?.vaultTokenAmounts?.qtyStepScale,
      allowDecimals: erc20Map[vaultJoinData?.tradeData?.belong]?.vaultTokenAmounts?.qtyStepScale
        ? true
        : false,
    },
  }
}
