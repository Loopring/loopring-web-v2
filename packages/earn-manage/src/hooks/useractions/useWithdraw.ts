import React from 'react'
import Web3 from 'web3'
import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import {
  AccountStep,
  SwitchData,
  useOpenModals,
  useSettings,
  WithdrawProps,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  AddressError,
  CoinMap,
  EXCHANGE_TYPE,
  Explorer,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  LIVE_FEE_TIMES,
  MapChainId,
  myLog,
  SagaStatus,
  SUBMIT_PANEL_AUTO_CLOSE,
  TRADE_TYPE,
  UIERROR_CODE,
  WALLET_TYPE,
  WalletMap,
  WithdrawType,
  WithdrawTypes,
} from '@loopring-web/common-resources'

import * as sdk from '@loopring-web/loopring-sdk'

import {
  BIGO,
  DAYS,
  getTimestampDaysLater,
  isAccActivated,
  LAST_STEP,
  LoopringAPI,
  makeWalletLayer2,
  store,
  useAccount,
  useAddressCheck,
  useBtnStatus,
  useChargeFees,
  useContacts,
  useModalData,
  useSystem,
  useTokenMap,
  useWalletLayer2Socket,
  walletLayer2Service,
  walletInfo,
} from '@loopring-web/core'
import _ from 'lodash'
import { addressToExWalletMapFn, exWalletToAddressMapFn } from '@loopring-web/core'
import { AccountStepExtends } from '../../modal/AccountL1Modal/interface'
import * as configDefault from '../../config/dualConfig.json'
import { makeWalletInContract } from '../common'

export const useWithdraw = <R extends IBData<T>, T>({ setShowWithdraw, isShowWithdraw }) => {
  const { isShow, info } = isShowWithdraw
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const { setShowAccount } = useOpenModals()
  const { tokenMap, totalCoinMap } = useTokenMap()
  const { account, status: accountStatus } = useAccount()
  const { exchangeInfo } = useSystem()
  const { withdrawValue, updateWithdrawData, resetWithdrawData } = useModalData()

  const [walletMap2] = React.useState(makeWalletInContract())

  const [isFastWithdrawAmountLimit, setIsFastWithdrawAmountLimit] = React.useState<boolean>(false)
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    resetIntervalTime,
  } = useChargeFees({
    requestType: withdrawValue.withdrawType,
    amount: withdrawValue.tradeValue,
    needAmountRefresh:
      withdrawValue.withdrawType == sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL,
    tokenSymbol: store.getState()._router_modalData.withdrawValue?.belong,
    updateData: ({ fee, amount, tokenSymbol }) => {
      const _withdrawValue = store.getState()._router_modalData.withdrawValue
      myLog(
        withdrawValue.withdrawType,
        _withdrawValue.withdrawType,
        withdrawValue.belong,
        _withdrawValue.belong,
        amount,
        _withdrawValue.tradeValue,
        tokenSymbol,
      )
      if (
        withdrawValue.withdrawType == _withdrawValue.withdrawType &&
        _withdrawValue.belong === tokenSymbol &&
        ((withdrawValue.withdrawType == sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL &&
          amount == _withdrawValue.tradeValue) ||
          withdrawValue.withdrawType == sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL)
      ) {
        updateWithdrawData({ ..._withdrawValue, fee })
      }
    },
  })

  const [withdrawI18nKey, setWithdrawI18nKey] = React.useState<string>()

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus()

  const checkBtnStatus = React.useCallback(() => {
    const withdrawValue = store.getState()._router_modalData.withdrawValue
    if (tokenMap && withdrawValue.belong && tokenMap[withdrawValue.belong]) {
      const withdrawT = tokenMap[withdrawValue.belong]
      const tradeValue = sdk.toBig(withdrawValue.tradeValue ?? 0).times('1e' + withdrawT.decimals)
      const exceedPoolLimit =
        withdrawValue.withdrawType == sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL &&
        tradeValue.gt(0) &&
        withdrawT.fastWithdrawLimit &&
        tradeValue.gte(withdrawT.fastWithdrawLimit)
      // const isFeeSame = withdrawValue.fee?.belong === withdrawValue.belong;
      const isEnough = tradeValue.lte(
        sdk.toBig(withdrawValue.balance ?? 0).times('1e' + withdrawT.decimals),
      )

      if (
        tradeValue &&
        !exceedPoolLimit &&
        chargeFeeTokenList.length &&
        tradeValue.gt(BIGO) &&
        withdrawValue.tradeValue &&
        isEnough
      ) {
        enableBtn()
        setIsFastWithdrawAmountLimit(false)
        return
      }
      if (exceedPoolLimit) {
        const amt = getValuePrecisionThousand(
          sdk.toBig(withdrawT.fastWithdrawLimit ?? 0).div('1e' + withdrawT.decimals),
          withdrawT.precision,
          withdrawT.precision,
          withdrawT.precision,
          false,
          { floor: true },
        ).toString()

        setWithdrawI18nKey(`labelL2toL1BtnExceed|${amt}`)
        setIsFastWithdrawAmountLimit(true)
        return
      }
      // else if (isFeeSame && !withFeeEnough) {
      //   setWithdrawI18nKey(`labelL2toL1BtnExceedWithFee`);
      // }
      setIsFastWithdrawAmountLimit(false)
    }
    disableBtn()
  }, [tokenMap, withdrawValue.belong, withdrawValue.tradeValue, disableBtn, enableBtn])

  React.useEffect(() => {
    setWithdrawI18nKey(undefined)
    checkBtnStatus()
  }, [withdrawValue?.belong, withdrawValue?.tradeValue])

  const _checkFeeIsEnough = _.debounce(
    () => {
      const {
        tradeValue: amount,
        withdrawType,
        belong,
      } = store.getState()._router_modalData.withdrawValue
      checkFeeIsEnough({
        isRequiredAPI: true,
        intervalTime: LIVE_FEE_TIMES,
        amount,
        tokenSymbol: belong,
        requestType: withdrawType,
        needAmountRefresh: withdrawType == sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL,
      })
    },
    globalSetup.wait,
    { leading: true, trailing: true },
  )

  // useWalletLayer2Socket({ walletLayer2Callback })
  const handlePanelEvent = async (data: SwitchData<R>, _switchType: 'Tomenu' | 'Tobutton') => {
    if (data.to === 'button') {
      if (walletMap2 && data?.tradeData?.belong) {
        const walletInfo = walletMap2[data?.tradeData?.belong as string]
        updateWithdrawData({
          ...withdrawValue,
          belong: data.tradeData?.belong,
          tradeValue: data.tradeData?.tradeValue,
          balance: walletInfo?.count,
        })
        // _checkFeeIsEnough.cancel()
        _checkFeeIsEnough()
      } else {
        updateWithdrawData({
          fee: undefined,
          withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
          belong: undefined,
          tradeValue: undefined,
          balance: undefined,
        })
      }
    }
  }

  const handleWithdraw = React.useCallback(
    async (inputValue: any) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account

      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStepExtends.withdraw_sign,
          })
          const gas = ''
          const withdrawToken = tokenMap[withdrawValue.belong as string]
          const balance = sdk.toBig(inputValue.balance ?? 0).times('1e' + withdrawToken.decimals)
          const tradeValue = sdk
            .toBig(inputValue.tradeValue ?? 0)
            .times('1e' + withdrawToken.decimals)
          const isExceedBalance = tradeValue.plus(gas).gt(balance)
          const finalVol = isExceedBalance ? balance.minus(gas) : tradeValue

          // myLog('submitOffchainWithdraw:', request)

          if (
            connectProvides.usedWeb3 &&
            LoopringAPI.userAPI &&
            isAccActivated() &&
            withdrawValue?.fee?.belong
          ) {
            //TODO wrire contract

            // if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            //   throw response
            // }
            setShowWithdraw({ isShow: false })
            setShowAccount({
              isShow: true,
              step: AccountStepExtends.withdraw_Processing,
            })

            setShowAccount({
              isShow: true,
              step: AccountStepExtends.withdraw_Processing,
            })

            resetWithdrawData()
            walletLayer2Service.sendUserUpdate()
            await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
            if (
              store.getState().modals.isShowAccount.isShow &&
              store.getState().modals.isShowAccount.step == AccountStepExtends.withdraw_Processing
            ) {
              setShowAccount({ isShow: false })
            }
          }
        } catch (e: any) {
          sdk.dumpError400(e)
          setShowAccount({
            isShow: true,
            step: AccountStep.Withdraw_Failed,
            error: {
              code: UIERROR_CODE.UNKNOWN,
              msg: e?.message,
            },
          })
        }

        return true
      } else {
        return false
      }
    },
    [account, tokenMap, exchangeInfo, withdrawValue?.belong, setShowAccount],
  )

  React.useEffect(() => {
    const initSymbol = configDefault[network].GasSymbol ?? 'ETH'
    const account = store.getState().account
    if (isShow) {
      handlePanelEvent(
        {
          to: 'button',
          tradeData: {
            belong: (info?.symbol ?? initSymbol) as any,
            tradeValue: undefined,
            balance: 0,
            // count:
          } as any,
        },
        'Tobutton',
      )
    }
  }, [isShow, accountStatus])

  const withdrawProps: WithdrawProps<any, any> = {
    type: TRADE_TYPE.TOKEN,
    withdrawI18nKey,
    tradeData: withdrawValue as any,
    coinMap: totalCoinMap as CoinMap<T>,
    walletMap: makeWalletInContract(),
    withdrawBtnStatus: btnStatus,
    lastFailed: store.getState().modals.isShowAccount.info?.lastFailed === LAST_STEP.withdraw,
    onWithdrawClick: handleWithdraw,
    handlePanelEvent,
    feeInfo,
    title: 'withdraw',
  }

  return {
    ...withdrawProps,
  }
}
