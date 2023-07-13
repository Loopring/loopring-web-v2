import React from 'react'
import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import {
  AccountStep,
  ForceWithdrawProps,
  SwitchData,
  TransactionTradeViews,
  useOpenModals,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  CoinMap,
  IBData,
  myLog,
  UIERROR_CODE,
  WalletMap,
  LIVE_FEE_TIMES,
  SUBMIT_PANEL_AUTO_CLOSE,
  TRADE_TYPE,
} from '@loopring-web/common-resources'
import {
  LAST_STEP,
  updateForceWithdrawData as updateForceWithdrawDataStore,
} from '@loopring-web/core'

import * as sdk from '@loopring-web/loopring-sdk'

import {
  useTokenMap,
  useAccount,
  BIGO,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  store,
  useAddressCheck,
  useBtnStatus,
  walletLayer2Service,
  useModalData,
  isAccActivated,
  useChargeFees,
  useSystem,
  WalletMapExtend,
  WalletLayer2Map,
} from '../../index'
import { useWalletInfo } from '../../stores/localStore/walletInfo'
import { useHistory, useRouteMatch } from 'react-router-dom'
import Web3 from 'web3'

export const useForceWithdraw = <R extends IBData<T>, T>() => {
  const { tokenMap, totalCoinMap, idIndex } = useTokenMap()
  const { account } = useAccount()
  const { exchangeInfo, chainId } = useSystem()
  const { setShowAccount } = useOpenModals()
  const history = useHistory()
  const match = useRouteMatch('/layer2/:forceWithdraw')
  const { forceWithdrawValue, updateForceWithdrawData, resetForceWithdrawData } = useModalData()
  const {
    modals: { isShowAccount },
  } = useOpenModals()
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    resetIntervalTime,
  } = useChargeFees({
    requestType: sdk.OffchainFeeReqType.FORCE_WITHDRAWAL,
    updateData: ({ fee }) => {
      const { forceWithdrawValue } = store.getState()._router_modalData
      store.dispatch(updateForceWithdrawDataStore({ ...forceWithdrawValue, fee }))
    },
  })

  const { checkHWAddr, updateHW } = useWalletInfo()
  // const [forceWithDrawAccount, setForceWithDrawAccount] =
  //   React.useState<by>();

  const [walletItsMap, setWalletItsMap] = React.useState<WalletMap<T>>({})

  const {
    address,
    realAddr,
    setAddress,
    checkAddAccountId,
    addrStatus,
    isLoopringAddress,
    isActiveAccount,
    isAddressCheckLoading,
  } = useAddressCheck()

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus()

  const checkBtnStatus = React.useCallback(() => {
    if (
      tokenMap &&
      forceWithdrawValue?.fee?.belong &&
      forceWithdrawValue.fee?.feeRaw &&
      forceWithdrawValue.belong &&
      forceWithdrawValue.balance &&
      !!forceWithdrawValue?.withdrawAddress &&
      !isFeeNotEnough.isFeeNotEnough
    ) {
      enableBtn()
      myLog('enableBtn')
      return
    }
    disableBtn()
  }, [
    tokenMap,
    forceWithdrawValue.fee?.belong,
    forceWithdrawValue.fee?.feeRaw,
    forceWithdrawValue.belong,
    forceWithdrawValue.balance,
    forceWithdrawValue?.withdrawAddress,
    isFeeNotEnough.isFeeNotEnough,
    disableBtn,
    enableBtn,
  ])

  React.useEffect(() => {
    checkBtnStatus()
  }, [
    address,
    addrStatus,
    isFeeNotEnough.isFeeNotEnough,
    forceWithdrawValue.fee?.belong,
    forceWithdrawValue.fee?.feeRaw,
    forceWithdrawValue.belong,
    isLoopringAddress,
    isActiveAccount,
  ])

  const walletLayer2Callback = React.useCallback(async () => {
    if (
      LoopringAPI.userAPI &&
      realAddr &&
      checkAddAccountId &&
      isLoopringAddress &&
      !isActiveAccount
    ) {
      const { userBalances } = await LoopringAPI.userAPI?.getUserBalances(
        { accountId: checkAddAccountId, tokens: '' },
        account.apiKey,
      )
      let walletMap: WalletMap<T> = {}
      if (userBalances) {
        const walletLayer2 = Reflect.ownKeys(userBalances).reduce((prev, item) => {
          // @ts-ignore
          return { ...prev, [idIndex[item]]: userBalances[Number(item)] }
        }, {} as WalletLayer2Map<R>)
        walletMap = Reflect.ownKeys(walletLayer2).reduce((prev, item) => {
          const {
            total,
            locked,
            // pending: { withdraw },
          } = walletLayer2[item as string]
          const countBig = sdk.toBig(total).minus(sdk.toBig(locked))

          if (countBig.eq(BIGO)) {
            return prev
          }

          return {
            ...prev,
            [item]: {
              belong: item,
              count: sdk.fromWEI(tokenMap, item, countBig.toString()),
              detail: walletLayer2[item as string],
            },
          }
        }, {} as WalletMapExtend<T>)
      }
      const key = Reflect.ownKeys(walletMap).length ? Reflect.ownKeys(walletMap)[0] : undefined
      const _value = key ? walletMap[key] : undefined
      updateForceWithdrawData({
        withdrawAddress: realAddr,
        belong: _value?.belong ?? '',
        tradeValue: _value?.count,
        balance: _value?.count,
      })
      setWalletItsMap({ ...walletMap })
    } else {
      setWalletItsMap({})
    }
  }, [
    account.apiKey,
    checkAddAccountId,
    idIndex,
    isActiveAccount,
    isLoopringAddress,
    realAddr,
    tokenMap,
    updateForceWithdrawData,
  ])

  React.useEffect(() => {
    if (checkAddAccountId && isLoopringAddress && !isActiveAccount && !!realAddr) {
      walletLayer2Callback()
    } else {
      setWalletItsMap({})
      updateForceWithdrawData({
        withdrawAddress: '',
        belong: '',
        tradeValue: undefined,
        balance: undefined,
      })
    }
  }, [isLoopringAddress, isActiveAccount, checkAddAccountId, realAddr])
  // useWalletLayer2Socket({ walletLayer2Callback });
  const resetDefault = React.useCallback(() => {
    checkFeeIsEnough({ isRequiredAPI: true, intervalTime: LIVE_FEE_TIMES })
    resetForceWithdrawData()
    setWalletItsMap({})
    setAddress('')
  }, [checkFeeIsEnough, resetForceWithdrawData, setAddress])

  React.useEffect(() => {
    // @ts-ignore
    if (match?.params?.forcewithdraw?.toLowerCase() === 'forcewithdraw') {
      resetDefault()
    } else {
      resetIntervalTime()
    }
    return () => {
      resetIntervalTime()
    }
  }, [match?.params])

  const processRequest = React.useCallback(
    async (request: sdk.OriginForcesWithdrawalsV3, isNotHardwareWallet: boolean) => {
      const { apiKey, connectName, eddsaKey } = account

      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI && isAccActivated()) {
          let isHWAddr = checkHWAddr(account.accAddress)

          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true
          }

          myLog('force Withdraw processRequest:', isHWAddr, isNotHardwareWallet)
          const response = await LoopringAPI.userAPI.submitForceWithdrawals(
            {
              request,
              web3: connectProvides.usedWeb3 as unknown as Web3,
              chainId: chainId === 'unknown' ? 1 : chainId,
              walletType: (ConnectProviders[connectName] ??
                connectName) as unknown as sdk.ConnectorNames,
              eddsaKey: eddsaKey.sk,
              apiKey,
              isHWAddr,
            },
            {
              accountId: account.accountId,
              counterFactualInfo: eddsaKey.counterFactualInfo,
            },
          )
          myLog('submitNFTWithdraw:', response)

          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            throw response
          }
          setShowAccount({
            isShow: true,
            step: AccountStep.ForceWithdraw_In_Progress,
          })
          setShowAccount({
            isShow: true,
            step: AccountStep.ForceWithdraw_Submit,
            info: {
              symbol: forceWithdrawValue.belong,
            },
          })
          if (isHWAddr) {
            myLog('......try to set isHWAddr', isHWAddr)
            updateHW({ wallet: account.accAddress, isHWAddr })
          }
          walletLayer2Service.sendUserUpdate()
          resetDefault()
          history.push(
            `/l2assets/history/${RecordTabIndex.Transactions}?types=${TransactionTradeViews.forceWithdraw}`,
          )
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step == AccountStep.ForceWithdraw_Submit
          ) {
            setShowAccount({ isShow: false })
          }
        }
      } catch (e: any) {
        const code = sdk.checkErrorInfo(e, isNotHardwareWallet)
        switch (code) {
          case sdk.ConnectorError.NOT_SUPPORT_ERROR:
            setShowAccount({
              isShow: true,
              step: AccountStep.ForceWithdraw_First_Method_Denied,
              info: {
                symbol: forceWithdrawValue.belong,
              },
            })
            break
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            setShowAccount({
              isShow: true,
              step: AccountStep.ForceWithdraw_Denied,
              info: {
                symbol: forceWithdrawValue.belong,
              },
            })
            break
          default:
            if ([102024, 102025, 114001, 114002].includes((e as sdk.RESULT_INFO)?.code || 0)) {
              checkFeeIsEnough({ isRequiredAPI: true })
            }
            setShowAccount({
              isShow: true,
              step: AccountStep.ForceWithdraw_Failed,
              info: {
                symbol: forceWithdrawValue.belong,
              },
              error: {
                code: UIERROR_CODE.UNKNOWN,
                msg: e?.message,
                ...(e instanceof Error
                  ? {
                      message: e?.message,
                      stack: e?.stack,
                    }
                  : e ?? {}),
              },
            })
            break
        }
      }
    },
    [
      account,
      checkHWAddr,
      chainId,
      setShowAccount,
      forceWithdrawValue.belong,
      checkFeeIsEnough,
      resetDefault,
      updateHW,
    ],
  )

  const handleForceWithdraw = React.useCallback(
    async (_inputValue: R, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account
      const forceWithdrawValue = store.getState()._router_modalData.forceWithdrawValue

      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        LoopringAPI.userAPI &&
        exchangeInfo &&
        forceWithdrawValue?.fee?.belong &&
        forceWithdrawValue.fee?.feeRaw &&
        forceWithdrawValue?.belong &&
        forceWithdrawValue?.withdrawAddress &&
        !isFeeNotEnough.isFeeNotEnough &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.ForceWithdraw_WaitForAuth,
          })

          const feeToken = tokenMap[forceWithdrawValue.fee.belong]
          const feeRaw =
            forceWithdrawValue.fee.feeRaw ?? forceWithdrawValue.fee.__raw__?.feeRaw ?? 0
          const fee = sdk.toBig(feeRaw)
          // const fee = sdk.toBig(forceWithdrawValue.fee.__raw__?.feeRaw ?? 0);

          const storageId = await LoopringAPI.userAPI?.getNextStorageId(
            {
              accountId,
              sellTokenId: Number(feeToken.tokenId),
            },
            apiKey,
          )
          const { broker } = await LoopringAPI.userAPI?.getAvailableBroker({
            type: 1,
          })

          const request: sdk.OriginForcesWithdrawalsV3 = {
            transfer: {
              exchange: exchangeInfo.exchangeAddress,
              payerAddr: accAddress,
              payerId: accountId,
              payeeAddr: broker,
              storageId: storageId.offchainId,
              token: {
                tokenId: feeToken.tokenId,
                volume: fee.toFixed(), // TEST: fee.toString(),
              },
              validUntil: getTimestampDaysLater(DAYS),
            },
            requesterAddress: accAddress,
            tokenId: tokenMap[forceWithdrawValue.belong].tokenId,
            withdrawAddress: forceWithdrawValue.withdrawAddress ?? realAddr,
          }

          myLog('ForcesWithdrawals request:', request)

          processRequest(request, isFirstTime)
        } catch (e: any) {
          sdk.dumpError400(e)
          setShowAccount({
            isShow: true,
            step: AccountStep.ForceWithdraw_Failed,
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
    [
      account,
      tokenMap,
      exchangeInfo,
      isFeeNotEnough.isFeeNotEnough,
      setShowAccount,
      realAddr,
      processRequest,
    ],
  )

  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.ForceWithdraw_WaitForAuth,
      })
      handleForceWithdraw(
        {
          belong: forceWithdrawValue.belong,
          balance: forceWithdrawValue.balance,
          tradeValue: forceWithdrawValue.tradeValue,
        } as R,
        !isHardwareRetry,
      )
    },
    [forceWithdrawValue, handleForceWithdraw, setShowAccount],
  )
  // myLog("walletItsMap", walletItsMap);
  // @ts-ignore
  const forceWithdrawProps: ForceWithdrawProps<any, any> = React.useMemo(() => {
    return {
      disabled: false,
      // onChangeEvent: undefined,
      type: TRADE_TYPE.TOKEN,
      addressDefault: address,
      handleOnAddressChange: (value: any) => {
        setAddress(value)
        updateForceWithdrawData({
          belong: '',
          tradeValue: undefined,
          balance: undefined,
        })
      },
      lastFailed: isShowAccount?.info?.lastFailed === LAST_STEP.forceWithdraw,
      isActiveAccount,
      isNotAvailableAddress: !(isLoopringAddress && !isActiveAccount),
      realAddr,
      isAddressCheckLoading,
      isLoopringAddress,
      tradeData: forceWithdrawValue as any,
      coinMap: totalCoinMap as CoinMap<T>,
      walletMap: walletItsMap,
      addrStatus,
      withdrawBtnStatus: btnStatus,
      onWithdrawClick: handleForceWithdraw,
      handlePanelEvent: async (data: SwitchData<R>) => {
        return new Promise((res: any) => {
          if (data.to === 'button') {
            if (data.tradeData.belong) {
              const walletInfo = walletItsMap[data.tradeData.belong]

              updateForceWithdrawData({
                ...forceWithdrawValue,
                belong: data.tradeData.belong,
                tradeValue: walletInfo?.count, //data.tradeData?.tradeValue,
                balance: walletInfo?.count,
                // withdrawAddress: realAddr,
              })
            } else {
              updateForceWithdrawData({
                belong: '',
                tradeValue: undefined,
                balance: undefined,
                // withdrawAddress: realAddr,
              })
            }
          }
          res()
        })
      },
      handleFeeChange,
      feeInfo,
      chargeFeeTokenList,
      isFeeNotEnough,
    }
  }, [
    addrStatus,
    address,
    btnStatus,
    isShowAccount,
    chargeFeeTokenList,
    feeInfo,
    isShowAccount?.info?.lastFailed,
    forceWithdrawValue,
    handleFeeChange,
    handleForceWithdraw,
    isActiveAccount,
    isAddressCheckLoading,
    isFeeNotEnough,
    isLoopringAddress,
    realAddr,
    setAddress,
    totalCoinMap,
    updateForceWithdrawData,
    walletItsMap,
  ]) // as ForceWithdrawProps<any, any>;

  return {
    forceWithdrawProps,
    retryBtn,
  }
}

// ErrorCode.ERR_REST_ACCOUNT_NOT_EXIST, //104003
//   message =s"payer hasn't completed opening an payerAccount, payerAccount id
//
// ErrorCode.ERR_ACCOUNT_FREEZED, //121001
//   message = "payer is freeze"
//
//
// ErrorCode.ERR_INVALID_ARGUMENT, //100001
//   "payer address and payer id is not match"
//
// ErrorCode.ERR_INVALID_SIGNATURE, //100206
//   "inner transfer eddsa sig invalid"
//
// ErrorCode.ERR_WALLET_BALANCE_NOT_ENOUGH, //109143
//   s"balance of ${transfer.tokenId} in payerAccount ${transfer.payerId} is not enough"
//
// ErrorCode.ERR_NO_ACCOUNT, //113001
//   s"withdraw address payerAccount info not found ${targetAccount.error}"
