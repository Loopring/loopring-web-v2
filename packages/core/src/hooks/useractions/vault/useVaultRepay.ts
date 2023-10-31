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
export const useVaultRepay = <
  T extends IBData<I> & {
    borrowed: string
    max: string
  },
  V extends VaultRepayData<T>,
  I,
>() => {
  const {
    modals: { istShowVaultLoan },
    setShowAccount,
    setShowVaultLoan,
  } = useOpenModals()
  const { vaultAccountInfo, status: vaultAccountInfoStatus, updateVaultLayer2 } = useVaultLayer2()
  const { account } = useAccount()
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
      const orderAmounts = vaultToken.orderAmounts
      const minRepayVol = BigNumber.max(orderAmounts.dust, orderAmounts?.minimum)
      const minRepayAmt = minRepayVol.div('1e' + vaultToken.decimals)
      const tradeVaule = tradeData.tradeValue

      supportData = {
        maxRepayAmount: borrowed,
        maxRepayStr: getValuePrecisionThousand(
          borrowed,
          // sdk.toBig(vaultToken.btradeAmount).div('1e' + vaultToken.decimals),
          vaultToken.precision,
          vaultToken.precision,
          undefined,
        ),
        minRepayAmount: minRepayAmt,
        minRepayStr: getValuePrecisionThousand(
          minRepayAmt,
          // sdk.toBig(vaultToken.btradeAmount).div('1e' + vaultToken.decimals),
          vaultToken.precision,
          vaultToken.precision,
          undefined,
        ),
        maxRepayVol: sdk
          .toBig(borrowed)
          .times('1e' + vaultToken.decimals)
          .toString(),
        minRepayVol: minRepayVol.toString(),
        repayVol: sdk
          .toBig(tradeVaule ?? 0)
          .times('1e' + vaultToken.decimals)
          .toString(),
        repayAmtStr: getValuePrecisionThousand(
          tradeVaule ?? 0,
          vaultToken.precision,
          vaultToken.precision,
          undefined,
        ),
        repayAmt: tradeVaule ?? 0,
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
    if (istShowVaultLoan.isShow) {
      initData()
    } else {
      resetVaultRepay()
    }
  }, [istShowVaultLoan.isShow])
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
        label: `labelVaultRepayMini|${vaultRepayData.minRepayStr} ${vaultRepayData.belong}`,
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
            response2?.raw_data?.operation?.status !== sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED
          ) {
            status = 'labelPending'
          } else {
            status = 'labelFinished'
          }

          const amount = getValuePrecisionThousand(
            sdk.toBig(response2?.raw_data?.order?.fillAmountS).div('1e' + vaultToken.decimals),
            vaultToken.precision,
            vaultToken.precision,
            undefined,
          )
          setShowAccount({
            isShow: true,
            step: AccountStep.VaultRepay_Success,
            info: {
              status: t(status),
              amount,
              sum: vaultRepayData.repayAmtStr,
              vSymbol: vaultToken.symbol,
              time: response2?.raw_data?.order?.createdAt,
            },
          })
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
          updateVaultLayer2({})
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step == AccountStep.VaultRepay_Success
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
          vSymbol: vaultToken.symbol,
          time: Date.now(),
          error,
        },
      })
    }
  }

  const submitCallback = async () => {
    const vaultRepayData = store.getState()._router_tradeVault.vaultRepayData

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
    walletMap: walletMap as unknown as any,
    coinMap: vaultCoinMap,
    tradeData: { ...vaultRepayData.tradeData },
    vaultRepayData: vaultRepayData as unknown as V,
    tokenInfo: vaultTokenMap[vaultRepayData?.belong],
  }
}
