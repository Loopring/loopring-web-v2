import {
  CustomErrorWithCode,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_AUTO_CLOSE,
  SUBMIT_PANEL_CHECK,
  TradeBtnStatus,
  UIERROR_CODE,
  VaultRepayData,
} from '@loopring-web/common-resources'
import { AccountStep, SwitchData, useOpenModals } from '@loopring-web/component-lib'
import {
  store,
  useAccount,
  useSystem,
  useTokenMap,
  useTradeVault,
  useVaultLayer2,
  useVaultMap,
} from '../../../stores'
import { useTranslation } from 'react-i18next'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import { makeVaultRepay } from '../../help'
import { LoopringAPI } from '../../../api_wrapper'
import { useSubmitBtn } from '../../common'
import BigNumber from 'bignumber.js'
import { getTimestampDaysLater } from '../../../utils'
import { DAYS } from '../../../defs'
import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import { mapValues } from 'lodash'
export const useVaultRepay = <
  T extends IBData<I> & {
    borrowed: string
    max: string
  },
  V extends VaultRepayData<T>,
  I,
>() => {
  const {
    modals: { isShowVaultLoan },
    setShowAccount,
    setShowVaultLoan,
  } = useOpenModals()
  const { vaultAccountInfo, status: vaultAccountInfoStatus, updateVaultLayer2 } = useVaultLayer2()
  const { account } = useAccount()
  const { idIndex: erc20IdIndex } = useTokenMap()
  const { tokenMap: vaultTokenMap, idIndex: vaultIdIndex, coinMap: vaultCoinMap } = useVaultMap()
  const { t } = useTranslation()
  const { vaultRepayData, updateVaultRepay, resetVaultRepay } = useTradeVault()
  const { exchangeInfo, chainId } = useSystem()
  const [isLoading, setIsLoading] = React.useState(false)
  const [walletMap, setWalletMap] = React.useState(() => {
    return makeVaultRepay({ needFilterZero: true }).vaultAvaiable2Map
  })
  const [tradeData, setTradeData] = React.useState<T | undefined>(undefined)

  const calcSupportData = (tradeData: T) => {
    let supportData = {}
    if (tradeData?.belong) {
      const vaultToken = vaultTokenMap[tradeData.belong as any]
      const borrowed = tradeData.borrowed
      let minRepayVol = BigNumber.max(
        // orderAmounts.dust,
        //@ts-ignore
        vaultToken?.vaultTokenAmounts?.minLoanAmount,
      )
      let minRepayAmt = minRepayVol.div('1e' + vaultToken.decimals)
      const tradeValue = tradeData.tradeValue

      if (sdk.toBig(tradeData.borrowed).minus(tradeData.tradeValue).lt(minRepayAmt)) {
        minRepayVol = sdk
          .toBig(tradeData.borrowed)
          .times('1e' + vaultToken.decimals)
          .toString()
        minRepayAmt = sdk.toBig(tradeData.borrowed).toString()
      }

      supportData = {
        maxRepayAmount: borrowed,
        maxRepayStr: getValuePrecisionThousand(
          borrowed,
          // sdk.toBig(vaultToken.btradeAmount).div('1e' + vaultToken.decimals),
          vaultToken?.vaultTokenAmounts?.qtyStepScale,
          vaultToken?.vaultTokenAmounts?.qtyStepScale,
          undefined,
        ),
        minRepayAmount: minRepayAmt,
        minRepayStr: getValuePrecisionThousand(
          minRepayAmt,
          vaultToken?.vaultTokenAmounts?.qtyStepScale,
          vaultToken?.vaultTokenAmounts?.qtyStepScale,
          undefined,
        ),
        maxRepayVol: sdk
          .toBig(borrowed)
          .times('1e' + vaultToken.decimals)
          .toString(),
        minRepayVol: minRepayVol.toString(),
        repayVol: sdk
          .toBig(tradeValue ?? 0)
          .times('1e' + vaultToken.decimals)
          .toString(),
        repayAmtStr: getValuePrecisionThousand(
          tradeValue ?? 0,
          vaultToken?.vaultTokenAmounts?.qtyStepScale,
          vaultToken?.vaultTokenAmounts?.qtyStepScale,
          undefined,
        ),
        repayAmt: tradeValue ?? 0,
        coinInfoMap: vaultCoinMap,
      }
    }
    return {
      ...supportData,
    }
  }
  // useVaultSocket()
  const initData = () => {
    let vaultRepayData: any = {}
    let initSymbol = vaultIdIndex[vaultAccountInfo?.collateralInfo?.collateralTokenId ?? ''] ?? ''
    const walletMap = makeVaultRepay({ needFilterZero: true }).vaultAvaiable2Map ?? {}
    setWalletMap(walletMap)

    let walletInfo: any = walletMap[initSymbol.toString()]
    walletInfo = {
      ...walletInfo,
      belong: initSymbol.toString(),
      balance: walletInfo?.count ?? 0,
      tradeValue: undefined,
      max: BigNumber.min(walletInfo?.borrowed, walletInfo?.count) ?? 0,
    }
    vaultRepayData = {
      ...vaultRepayData,
      walletMap,
      coinMap: vaultCoinMap,
    }

    setTradeData({
      ...walletInfo,
    })

    updateVaultRepay({
      ...walletInfo,
      ...vaultRepayData,
      ...calcSupportData(walletInfo),
    })
  }
  React.useEffect(() => {
    if (isShowVaultLoan.isShow) {
      initData()
    } else {
      resetVaultRepay()
    }
  }, [isShowVaultLoan.isShow])
  const availableTradeCheck = React.useCallback(() => {
    const vaultRepayData = store.getState()._router_tradeVault.vaultRepayData
    if (
      !vaultRepayData?.tradeValue ||
      !vaultRepayData?.belong ||
      sdk.toBig(vaultRepayData?.tradeValue ?? 0).lte(0)
    ) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: '' }
    } else if (sdk.toBig(vaultRepayData?.tradeValue ?? 0).lt(vaultRepayData.minRepayAmount)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultRepayMini|${vaultRepayData.minRepayStr} ${vaultRepayData.belong.slice(2)}`,
      }
    } else if (sdk.toBig(vaultRepayData.tradeValue ?? 0).gt(vaultRepayData.balance ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultRepayNotEnough|${vaultRepayData.belong}`,
      }
    } else if (sdk.toBig(vaultRepayData.tradeValue ?? 0).gt(vaultRepayData.maxRepayAmount ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultRepayMax|${vaultRepayData.maxRepayStr} ${vaultRepayData.belong}`,
      }
    } else {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
    }
  }, [
    vaultAccountInfoStatus,
    vaultTokenMap,
    vaultRepayData,
    vaultRepayData.belong,
    vaultRepayData.tradeValue,
    vaultRepayData.balance,
    vaultRepayData.maxRepayAmount,
    vaultRepayData.minRepayAmount,
  ])
  const handlePanelEvent = React.useCallback(
    async (data: SwitchData<T>) => {
      let vaultRepayData = store.getState()._router_tradeVault.vaultRepayData
      return new Promise<void>((res: any) => {
        if (data.to === 'button') {
          const walletMap = makeVaultRepay({ needFilterZero: true }).vaultAvaiable2Map ?? {}
          setWalletMap(walletMap)
          if (walletMap && data?.tradeData?.belong) {
            let walletInfo: any = walletMap[data?.tradeData?.belong as string]
            walletInfo = {
              ...walletInfo,
              balance: walletInfo ? walletInfo.count : 0,
              tradeValue: data.tradeData?.tradeValue,
              max: BigNumber.min(walletInfo.borrowed, walletInfo.count),
            }
            setTradeData(walletInfo)
            vaultRepayData = {
              ...vaultRepayData,
              ...walletInfo,
              ...calcSupportData(walletInfo),
              walletMap,
              tradeData: walletInfo,
            }
            updateVaultRepay({
              ...vaultRepayData,
            })
          } else {
            updateVaultRepay({
              belong: undefined,
              tradeValue: undefined,
              balance: undefined,
            })
          }
        }
        res()
      })
    },
    [tradeData, account.readyState],
  )

  const processRequest = async (request?: sdk.VaultRepayRequestV3WithPatch['request']) => {
    const account = store.getState().account
    const vaultRepayData = store.getState()._router_tradeVault.vaultRepayData
    const vaultToken = vaultTokenMap[vaultRepayData.belong]
    const erc20Symbol = vaultRepayData.belong.slice(2)

    try {
      if ((request || vaultRepayData.request) && LoopringAPI.vaultAPI) {
        let response = await LoopringAPI.vaultAPI?.submitVaultRepay(
          {
            // @ts-ignore
            request: request ?? vaultRepayData.request,
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

        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        } else {
          setShowVaultLoan({ isShow: false })
          setIsLoading(false)
          updateVaultLayer2({})
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
            [sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED].includes(
              response2?.raw_data?.operation?.status,
            )
          ) {
            status = 'labelSuccessfully'
          } else {
            status = 'labelPending'
          }
          setShowAccount({
            isShow: store.getState().modals.isShowAccount.isShow,
            step:
              status == 'labelSuccessfully'
                ? AccountStep.VaultRepay_Success
                : AccountStep.VaultRepay_In_Progress,
            info: {
              status: t(status),
              amount: sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED
                ? vaultRepayData.repayAmtStr
                : 0,
              sum: vaultRepayData.repayAmtStr,
              symbol: erc20Symbol,
              vSymbol: vaultToken.symbol,
              time: response2?.raw_data?.order?.createdAt,
            },
          })
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
          updateVaultLayer2({})
          if (
            store.getState().modals.isShowAccount.isShow &&
            [AccountStep.VaultRepay_Success, AccountStep.VaultRepay_In_Progress].includes(
              store.getState().modals.isShowAccount.step,
            )
          ) {
            setShowAccount({ isShow: false })
          }
        }
      } else {
        throw new Error('api not ready')
      }
      setIsLoading(false)
    } catch (e) {
      const code =
        (e as any)?.message === sdk.VaultOperationStatus.VAULT_STATUS_FAILED
          ? UIERROR_CODE.ERROR_ORDER_FAILED
          : (e as sdk.RESULT_INFO)?.code ?? UIERROR_CODE.UNKNOWN
      const error = new CustomErrorWithCode({
        code,
        message: (e as sdk.RESULT_INFO)?.message,
        ...SDK_ERROR_MAP_TO_UI[code],
      })
      setIsLoading(false)
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultRepay_Failed,
        info: {
          status: t('labelFailed'),
          amount: EmptyValueTag,
          sum: vaultRepayData.repayAmtStr,
          symbol: erc20Symbol,
          vSymbol: vaultToken.symbol,
          time: Date.now(),
          error,
        },
      })
    }
  }

  const submitCallback = async () => {
    const vaultRepayData = store.getState()._router_tradeVault.vaultRepayData
    const erc20Symbol = vaultRepayData.belong.slice(2)
    try {
      if (
        vaultRepayData &&
        exchangeInfo &&
        vaultRepayData.belong &&
        LoopringAPI.vaultAPI &&
        LoopringAPI.userAPI &&
        vaultAccountInfo &&
        sdk.toBig(vaultRepayData?.repayVol).gte(vaultRepayData.minRepayVol ?? 0) &&
        sdk.toBig(vaultRepayData?.maxRepayAmount).lte(vaultRepayData.maxRepayVol ?? 0)
      ) {
        setIsLoading(true)
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultRepay_In_Progress,
          info: {
            status: t('labelPending'),
            amount: EmptyValueTag,
            sum: vaultRepayData.repayAmtStr,
            symbol: erc20Symbol,
            vSymbol: vaultRepayData.belong,
            time: Date.now(),
          },
        })
        const tokenInfo = vaultTokenMap[vaultRepayData.belong]
        const [{ broker }, { offchainId }] = await Promise.all([
          LoopringAPI.userAPI?.getAvailableBroker({
            type: 4,
          }),
          LoopringAPI.userAPI?.getNextStorageId(
            {
              accountId: account.accountId,
              sellTokenId: tokenInfo.vaultTokenId,
            },
            account.apiKey,
          ),
        ])
        const vaultRepayRequest = {
          exchange: exchangeInfo.exchangeAddress,
          payerAddr: account.accAddress,
          payerId: account.accountId,
          payeeId: 0,
          payeeAddr: broker,
          storageId: offchainId,
          token: {
            tokenId: tokenInfo.vaultTokenId,
            volume: vaultRepayData?.repayVol,
          },
          maxFee: {
            tokenId: tokenInfo.vaultTokenId,
            volume: '0', // TEST: fee.toString(),
          },
          validUntil: getTimestampDaysLater(DAYS),
          memo: '',
        }

        updateVaultRepay({
          ...vaultRepayData,
          request: vaultRepayRequest,
        })
        processRequest(vaultRepayRequest)
      }
    } catch (e) {
      setIsLoading(false)
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultRepay_Failed,
        error: {
          ...(e as any),
        },
      })
    }
  }

  const { btnStatus, onBtnClick, btnLabel } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback,
  })
  return {
    handlePanelEvent,
    vaultRepayBtnStatus: btnStatus,
    vaultRepayBtnI18nKey: btnLabel,
    onVaultRepayClick: onBtnClick,
    walletMap: mapValues(walletMap, (value, key) => {
      return {
        ...value,
        erc20Symbol: key.slice(2),
        belongAlice: key.slice(2),
      }
    }) as unknown as any,
    coinMap: mapValues(vaultCoinMap, (value) => {
      return {
        ...value,
        erc20Symbol: value?.simpleName.slice(2),
        belongAlice: value?.simpleName.slice(2),
      }
    }),
    tradeData: { 
      ...vaultRepayData.tradeData,
      erc20Symbol: vaultRepayData.tradeData?.belong.slice(2),
      belongAlice: vaultRepayData.tradeData?.belong.slice(2),

    },
    vaultRepayData: {
      ...vaultRepayData,
      erc20Symbol: vaultRepayData.tradeData?.belong.slice(2),
      belongAlice: vaultRepayData.tradeData?.belong.slice(2),
      tradeData: {
        ...vaultRepayData?.tradeData,
        erc20Symbol: vaultRepayData.tradeData?.belong.slice(2),
        belongAlice: vaultRepayData.tradeData?.belong.slice(2),
      }
    } as unknown as V,
    tokenInfo: vaultTokenMap[vaultRepayData?.belong],
    tokenProps: {
      decimalsLimit: vaultTokenMap[vaultRepayData?.belong]?.vaultTokenAmounts?.qtyStepScale,
      allowDecimals: vaultTokenMap[vaultRepayData?.tradeData?.belong]?.vaultTokenAmounts
        ?.qtyStepScale
        ? true
        : false,
    },
  }
}
