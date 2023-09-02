import React from 'react'

import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import { AccountStep, SwitchData, useOpenModals, WithdrawProps } from '@loopring-web/component-lib'
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
  myLog,
  SagaStatus,
  SUBMIT_PANEL_AUTO_CLOSE,
  TRADE_TYPE,
  UIERROR_CODE,
  WALLET_TYPE,
  WalletMap,
  WithdrawTypes,
} from '@loopring-web/common-resources'

import * as sdk from '@loopring-web/loopring-sdk'

import {
  BIGO,
  DAYS,
  getAllContacts,
  getTimestampDaysLater,
  isAccActivated,
  LAST_STEP,
  LoopringAPI,
  makeWalletLayer2,
  store,
  useAccount,
  useAddressCheckWithContacts,
  useBtnStatus,
  useChargeFees,
  useIsHebao,
  useModalData,
  useSystem,
  useTokenMap,
  useWalletLayer2Socket,
  walletLayer2Service,
} from '../../index'
import { useWalletInfo } from '../../stores/localStore/walletInfo'
import _ from 'lodash'
import { addressToExWalletMapFn, exWalletToAddressMapFn } from '@loopring-web/core'
import { useContacts } from '../../stores/contacts/hooks'
import { useTheme } from '@emotion/react'

export const useWithdraw = <R extends IBData<T>, T>() => {
  const {
    modals: {
      isShowWithdraw: {
        symbol,
        isShow,
        info,
        address: contactAddress,
        name: contactName,
        addressType: contactAddressType,
      },
    },
    setShowAccount,
    setShowWithdraw,
  } = useOpenModals()
  const { tokenMap, totalCoinMap, disableWithdrawList } = useTokenMap()
  const { account, status: accountStatus } = useAccount()
  const { exchangeInfo, chainId } = useSystem()

  const { withdrawValue, updateWithdrawData, resetWithdrawData } = useModalData()

  const [walletMap2, setWalletMap2] = React.useState(
    makeWalletLayer2({ needFilterZero: true, _isToL1: true }).walletMap ?? ({} as WalletMap<R>),
  )

  const [sureIsAllowAddress, setSureIsAllowAddress] = React.useState<
    WALLET_TYPE | EXCHANGE_TYPE | undefined
  >(undefined)

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
    tokenSymbol: withdrawValue.belong,
    updateData: ({ fee, amount }) => {
      const _withdrawValue = store.getState()._router_modalData.withdrawValue
      myLog(
        withdrawValue.withdrawType,
        _withdrawValue.withdrawType,
        withdrawValue.belong,
        _withdrawValue.belong,
        amount,
        _withdrawValue.tradeValue,
      )
      if (
        withdrawValue.withdrawType == _withdrawValue.withdrawType &&
        withdrawValue.belong == _withdrawValue.belong &&
        ((withdrawValue.withdrawType == sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL &&
          amount == _withdrawValue.tradeValue) ||
          withdrawValue.withdrawType == sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL)
      ) {
        updateWithdrawData({ ..._withdrawValue, fee })
      }
    },
  })

  const [withdrawTypes, setWithdrawTypes] = React.useState<Partial<WithdrawTypes>>(() => {
    return {
      // [sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL]: "Fast",
      [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: 'Standard',
    }
  })
  const { checkHWAddr, updateHW } = useWalletInfo()

  const [lastRequest, setLastRequest] = React.useState<any>({})

  const [withdrawI18nKey, setWithdrawI18nKey] = React.useState<string>()

  const {
    address,
    realAddr,
    isCFAddress,
    isContractAddress,
    setAddress,
    addrStatus,
    isLoopringAddress,
    isAddressCheckLoading,
    loopringSmartWalletVersion,
  } = useAddressCheckWithContacts(false)

  React.useEffect(() => {
    // setSureIsAllowAddress(undefined);
  }, [realAddr])

  const isNotAvailableAddress =
    // isCFAddress
    // ? "isCFAddress"
    // :
    isContractAddress && disableWithdrawList.includes(withdrawValue?.belong ?? '')
      ? `isContractAddress`
      : undefined

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
      // const withFeeEnough = isFeeSame
      //   ? tradeValue
      //       .plus(withdrawValue.fee?.feeRaw ?? 0)
      //       .lte(
      //         sdk
      //           .toBig(withdrawValue.balance ?? 0)
      //           .times("1e" + withdrawT.decimals)
      //       )
      //   : isEnough;
      if (
        tradeValue &&
        !exceedPoolLimit &&
        !isNotAvailableAddress &&
        chargeFeeTokenList.length &&
        !isFeeNotEnough.isFeeNotEnough &&
        withdrawValue.fee?.belong &&
        withdrawValue.fee?.feeRaw &&
        tradeValue.gt(BIGO) &&
        !isFeeNotEnough.isOnLoading &&
        withdrawValue.tradeValue &&
        realAddr &&
        isEnough &&
        (info?.isToMyself || sureIsAllowAddress) &&
        [AddressError.NoError, AddressError.IsNotLoopringContract].includes(addrStatus)
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
  }, [
    tokenMap,
    withdrawValue.belong,
    withdrawValue.tradeValue,
    withdrawValue.fee?.belong,
    withdrawValue.fee?.feeRaw,
    disableBtn,
    address,
    isFeeNotEnough.isOnLoading,
    isNotAvailableAddress,
    chargeFeeTokenList.length,
    isFeeNotEnough,
    realAddr,
    info?.isToMyself,
    sureIsAllowAddress,
    addrStatus,
    enableBtn,
  ])

  React.useEffect(() => {
    setWithdrawI18nKey(undefined)
    checkBtnStatus()
  }, [
    addrStatus,
    realAddr,
    isFeeNotEnough.isOnLoading,
    sureIsAllowAddress,
    isFeeNotEnough.isFeeNotEnough,
    withdrawValue?.withdrawType,
    withdrawValue?.fee,
    withdrawValue?.belong,
    withdrawValue?.tradeValue,
    isNotAvailableAddress,
  ])

  React.useEffect(() => {
    if (withdrawValue.belong && LoopringAPI.exchangeAPI && tokenMap) {
      const tokenInfo = tokenMap[withdrawValue.belong]
      LoopringAPI.exchangeAPI
        .getWithdrawalAgents({
          tokenId: tokenInfo.tokenId,
          amount: sdk.toBig(tokenInfo.orderAmounts.dust).toString(),
        })
        .then((respons) => {
          if (withdrawValue.belong && respons?.supportTokenMap[withdrawValue.belong]) {
            setWithdrawTypes({
              [sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL]: 'Fast',
              [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: 'Standard',
            })
          } else {
            updateWithdrawData({ ...withdrawValue, withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL})
            checkFeeIsEnough({ requestType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL, isRequiredAPI: true})
            setWithdrawTypes({
              [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: 'Standard',
            })
          }
        })

      // const agent = await ;
    }
  }, [withdrawValue.belong])

  const walletLayer2Callback = () => {
    const walletMap =
      makeWalletLayer2({ needFilterZero: true, _isToL1: true }).walletMap ?? ({} as WalletMap<R>)
    setWalletMap2(walletMap)
  }

  const resetDefault = React.useCallback(() => {
    if (info?.isRetry) {
      checkFeeIsEnough()
      return
    }

    if (symbol) {
      if (walletMap2) {
        updateWithdrawData({
          fee: feeInfo,
          belong: symbol as any,
          balance: walletMap2[symbol]?.count,
          tradeValue: undefined,
          address: info?.isToMyself ? account.accAddress : '*',
          withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
        })
      }
    } else {
      if (!withdrawValue.belong && walletMap2) {
        const keys = Reflect.ownKeys(walletMap2)
        for (let key in keys) {
          const keyVal = keys[key]
          const walletInfo = walletMap2[keyVal]
          if (sdk.toBig(walletInfo.count).gt(0)) {
            updateWithdrawData({
              fee: feeInfo,
              belong: keyVal as any,
              tradeValue: undefined,
              balance: walletInfo?.count,
              address: info?.isToMyself ? account.accAddress : '*',
              withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
            })
            break
          }
        }
      } else if (withdrawValue.belong && walletMap2) {
        const walletInfo = walletMap2[withdrawValue.belong]
        updateWithdrawData({
          fee: feeInfo,
          belong: withdrawValue.belong,
          tradeValue: undefined,
          balance: walletInfo?.count,
          address: info?.isToMyself ? account.accAddress : '*',
          withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
        })
      } else {
        updateWithdrawData({
          fee: feeInfo,
          belong: withdrawValue.belong,
          tradeValue: undefined,
          balance: undefined,
          address: info?.isToMyself ? account.accAddress : '*',
          withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
        })
      }
    }
    if (info?.isToMyself) {
      setAddress(account.accAddress)
    } else if (contactAddress) {
      setAddress(contactAddress)
    } else {
      setAddress('')
    }
  }, [
    account.accAddress,
    setAddress,
    info?.isToMyself,
    checkFeeIsEnough,
    symbol,
    walletMap2,
    updateWithdrawData,
    feeInfo,
    withdrawValue.belong,
    info?.isRetry,
    contactAddress,
  ])

  React.useEffect(() => {
    const account = store.getState().account
    if (
      isShow &&
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
      resetDefault()
    } else {
      resetIntervalTime()
    }
    return () => {
      resetIntervalTime()
      _checkFeeIsEnough.cancel()
    }
  }, [isShow, accountStatus])

  const _checkFeeIsEnough = _.debounce(() => {
    const { tradeValue: amount, withdrawType } = store.getState()._router_modalData.withdrawValue
    checkFeeIsEnough({
      isRequiredAPI: true,
      intervalTime: LIVE_FEE_TIMES,
      amount,
      requestType: withdrawType,
      needAmountRefresh: withdrawType == sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL,
    })
  }, globalSetup.wait)

  useWalletLayer2Socket({ walletLayer2Callback })

  const processRequest = React.useCallback(
    async (request: sdk.OffChainWithdrawalRequestV3, isNotHardwareWallet: boolean) => {
      const { apiKey, connectName, eddsaKey } = account

      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI && isAccActivated()) {
          let isHWAddr = checkHWAddr(account.accAddress)
          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true
          }

          myLog('withdraw processRequest:', isHWAddr, isNotHardwareWallet)

          const response = await LoopringAPI.userAPI.submitOffchainWithdraw(
            {
              request,
              web3: connectProvides.usedWeb3 as any,
              chainId: chainId === 'unknown' ? 1 : chainId,
              walletType: (ConnectProviders[ connectName ] ??
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

          myLog('submitOffchainWithdraw:', response)

          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            throw response
          }
          info?.onCloseCallBack && info?.onCloseCallBack()
          setShowWithdraw({ isShow: false, info })
          setShowAccount({
            isShow: true,
            step: AccountStep.Withdraw_In_Progress,
          })
          let hash = Explorer + `tx/${(response as sdk.TX_HASH_API)?.hash}-withdraw`

          setShowAccount({
            isShow: true,
            step: AccountStep.Withdraw_Success,
            info: {
              symbol: withdrawValue.belong,
              hash,
              isToMyself: info?.isToMyself,
            },
          })

          if (isHWAddr) {
            myLog('......try to set isHWAddr', isHWAddr)
            updateHW({ wallet: account.accAddress, isHWAddr })
          }
          resetWithdrawData()
          walletLayer2Service.sendUserUpdate()
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step == AccountStep.Withdraw_Success
          ) {
            setShowAccount({ isShow: false })
          }
        }
      } catch (e: any) {
        const code = sdk.checkErrorInfo(e, isNotHardwareWallet)
        myLog('checkErrorInfo', code, e)
        switch (code) {
          case sdk.ConnectorError.NOT_SUPPORT_ERROR:
            setLastRequest({ request })
            setShowAccount({
              isShow: true,
              step: AccountStep.Withdraw_First_Method_Denied,
            })
            break
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            setLastRequest({ request })
            setShowAccount({
              isShow: true,
              step: AccountStep.Withdraw_User_Denied,
            })
            break
          default:
            if ([102024, 102025, 114001, 114002].includes((e as sdk.RESULT_INFO)?.code || 0)) {
              checkFeeIsEnough({ isRequiredAPI: true })
            }
            setShowAccount({
              isShow: true,
              step: AccountStep.Withdraw_Failed,
              info: {
                symbol: withdrawValue.belong,
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
      withdrawValue,
      checkHWAddr,
      chainId,
      setShowAccount,
      resetWithdrawData,
      updateHW,
      checkFeeIsEnough,
    ],
  )

  const handleWithdraw = React.useCallback(
    async (inputValue: any, address, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account

      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        address &&
        LoopringAPI.userAPI &&
        withdrawValue?.fee?.belong &&
        withdrawValue.fee?.feeRaw &&
        eddsaKey?.sk &&
        (info?.isToMyself || sureIsAllowAddress)
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.Withdraw_WaitForAuth,
          })

          const withdrawToken = tokenMap[withdrawValue.belong as string]
          const feeToken = tokenMap[withdrawValue.fee.belong]

          // const fee = sdk.toBig(withdrawValue.fee?.feeRaw ?? 0);
          const feeRaw = withdrawValue.fee.feeRaw ?? withdrawValue.fee.__raw__?.feeRaw ?? 0
          const fee = sdk.toBig(feeRaw)
          const balance = sdk.toBig(inputValue.balance ?? 0).times('1e' + withdrawToken.decimals)
          const tradeValue = sdk
            .toBig(inputValue.tradeValue ?? 0)
            .times('1e' + withdrawToken.decimals)
          const isExceedBalance =
            feeToken.tokenId === withdrawToken.tokenId && tradeValue.plus(fee).gt(balance)
          const finalVol = isExceedBalance ? balance.minus(fee) : tradeValue
          const withdrawVol = finalVol.toFixed(0, 0)

          const storageId = await LoopringAPI.userAPI.getNextStorageId(
            {
              accountId: accountId,
              sellTokenId: withdrawToken.tokenId,
            },
            apiKey,
          )

          const request: sdk.OffChainWithdrawalRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            owner: accAddress,
            to: address,
            accountId: account.accountId,
            storageId: storageId?.offchainId,
            token: {
              tokenId: withdrawToken.tokenId,
              volume: withdrawVol,
            },
            maxFee: {
              tokenId: feeToken.tokenId,
              volume: fee.toString(), // TEST: fee.toString(),
            },
            fastWithdrawalMode:
              withdrawValue.withdrawType == sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL, // WithdrawType.Fast,
            extraData: '',
            minGas: 0,
            validUntil: getTimestampDaysLater(DAYS),
          }

          myLog('submitOffchainWithdraw:', request)

          processRequest(request, isFirstTime)
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
    [
      account,
      tokenMap,
      exchangeInfo,
      withdrawValue?.fee?.belong,
      withdrawValue?.fee?.feeRaw,
      withdrawValue?.fee?.__raw__?.feeRaw,
      withdrawValue?.belong,
      info,
      sureIsAllowAddress,
      setShowAccount,
      processRequest,
    ],
  )
  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTWithdraw_WaitForAuth,
      })
      processRequest(lastRequest, !isHardwareRetry)
    },
    [lastRequest, processRequest, setShowAccount],
  )
  const { isHebao } = useIsHebao()
  const {
    contacts,
    currentAccountId: cachedForAccountId,
    updateContacts,
    updateAccountId,
  } = useContacts()
  React.useEffect(() => {
    const addressType = contacts?.find((x) => x.address === realAddr)?.addressType
    if (isShow === false) {
      setSureIsAllowAddress(undefined)
    } else if (addressType !== undefined) {
      const found = addressType ? addressToExWalletMapFn(addressType) : undefined
      setSureIsAllowAddress(found)
    }
  }, [realAddr, isShow, contacts])

  const {
    account: { accountId, apiKey, accAddress },
  } = useAccount()
  const theme = useTheme()
  const loadContacts = React.useCallback(async () => {
    if (accountId === cachedForAccountId) return
    updateContacts(undefined)
    try {
      const allContacts = await getAllContacts(
        0,
        accountId,
        apiKey,
        accAddress,
        theme.colorBase.warning,
      )
      updateContacts(allContacts)
      updateAccountId(accountId)
    } catch (e) {
      updateContacts([])
    }
  }, [cachedForAccountId, apiKey, accountId, accAddress])
  React.useEffect(() => {
    loadContacts()
  }, [apiKey])
  const withdrawProps: WithdrawProps<any, any> = {
    type: TRADE_TYPE.TOKEN,
    isLoopringAddress,
    isAddressCheckLoading,
    isCFAddress,
    isToMyself: info?.isToMyself,
    isContractAddress,
    withdrawI18nKey,
    accAddr: account.accAddress,
    isNotAvailableAddress,
    addressDefault: address,
    realAddr,
    disableWithdrawList,
    tradeData: withdrawValue as any,
    coinMap: totalCoinMap as CoinMap<T>,
    walletMap: walletMap2 as WalletMap<any>,
    withdrawBtnStatus: btnStatus,
    withdrawType: withdrawValue.withdrawType,
    isFastWithdrawAmountLimit,
    withdrawTypes,
    sureIsAllowAddress,
    lastFailed: store.getState().modals.isShowAccount.info?.lastFailed === LAST_STEP.withdraw,
    handleSureIsAllowAddress: (value: WALLET_TYPE | EXCHANGE_TYPE) => {
      const found = exWalletToAddressMapFn(value)
      // const found = map.find(x => x[0] === value)![1]
      const contact = contacts?.find((x) => x.address === realAddr)
      if (isHebao !== undefined && contact) {
        LoopringAPI.contactAPI
          ?.updateContact(
            {
              contactAddress: realAddr,
              isHebao,
              accountId: account.accountId,
              addressType: found,
              contactName: contact.name,
            },
            account.apiKey,
          )
          .then(() => {
            updateContacts(
              contacts?.map((x) => {
                if (x.address === realAddr && found) {
                  return { ...x, addressType: found }
                } else {
                  return x
                }
              }),
            )
          })
      }
      setSureIsAllowAddress(value)
    },

    onWithdrawClick: () => {
      if (withdrawValue && withdrawValue.belong) {
        handleWithdraw(withdrawValue, realAddr ? realAddr : address)
      }
    },
    handleWithdrawTypeChange: (value) => {
      // setWithdrawType(value);
      const _withdrawValue = store.getState()._router_modalData.withdrawValue
      updateWithdrawData({
        ..._withdrawValue,
        withdrawType: value,
      })
      _checkFeeIsEnough.cancel()
      _checkFeeIsEnough()
    },
    handlePanelEvent: async (data: SwitchData<R>, _switchType: 'Tomenu' | 'Tobutton') => {
      Promise.resolve()

      if (data.to === 'button') {
        if (walletMap2 && data?.tradeData?.belong) {
          const walletInfo = walletMap2[data?.tradeData?.belong as string]
          updateWithdrawData({
            ...withdrawValue,
            belong: data.tradeData?.belong,
            tradeValue: data.tradeData?.tradeValue,
            balance: walletInfo?.count,
            address: '*',
          })
          _checkFeeIsEnough.cancel()
          _checkFeeIsEnough()
        } else {
          updateWithdrawData({
            withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
            belong: undefined,
            tradeValue: undefined,
            balance: undefined,
            address: '*',
          })
        }
      }
    },
    handleFeeChange,
    feeInfo,
    addrStatus,
    chargeFeeTokenList,
    isFeeNotEnough,
    handleOnAddressChange: (value: any) => {
      setAddress(value)
    },
    isFromContact: contactAddress ? true : false,
    contact: contactAddress
      ? {
          address: contactAddress,
          name: contactName!,
          addressType: contactAddressType!,
        }
      : undefined,
    loopringSmartWalletVersion,
    contacts,
  }

  return {
    withdrawProps,
    retryBtn,
  }
}
