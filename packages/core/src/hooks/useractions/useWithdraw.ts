import React from 'react'
import Web3 from 'web3'
import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import { AccountStep, SwitchData, useOpenModals, useSettings, WithdrawProps } from '@loopring-web/component-lib'
import {
  AccountStatus,
  AddressError,
  CoinMap,
  EXCHANGE_TYPE,
  Explorer,
  FeeInfo,
  getValuePrecisionThousand,
  IBData,
  MapChainId,
  myLog,
  SagaStatus,
  SUBMIT_PANEL_AUTO_CLOSE,
  TRADE_TYPE,
  TradeBtnStatus,
  UIERROR_CODE,
  WALLET_TYPE,
  WalletMap,
  WITHDRAW_TOKEN_FILTER_LIST,
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
  TokenMap,
  useAccount,
  useAddressCheck,
  useContacts,
  useDebouncedCallback,
  useModalData,
  useSystem,
  useTokenMap,
  useTokenPrices,
  useWalletLayer2Socket,
  walletLayer2Service,
  fiatNumberDisplaySafe,
} from '../../index'
import { useWalletInfo } from '../../stores/localStore/walletInfo'
import _, { values, omit } from 'lodash'
import { addressToExWalletMapFn, exWalletToAddressMapFn } from '@loopring-web/core'
import { useGetSet } from 'react-use'
import { ethers } from 'ethers'
import Decimal from 'decimal.js'
import { useWeb3ModalProvider } from '@web3modal/ethers5/react'

const offchainFeeInfoToFeeInfo = (offchainFeeInfo: sdk.OffchainFeeInfo, tokenMap: TokenMap<{
  [key: string]: any;
}>, walletMap: WalletMap<string, any>) => {
  return {
    belong: offchainFeeInfo.token,
    fee: ethers.utils.formatUnits(offchainFeeInfo.fee, tokenMap[offchainFeeInfo.token].decimals),
    feeRaw: offchainFeeInfo.fee,
    token: offchainFeeInfo.token,
    hasToken: !!offchainFeeInfo.token,
    count: walletMap[offchainFeeInfo.token]?.count,
    discount: offchainFeeInfo.discount,
    __raw__: {
      fastWithDraw: '',
      tokenId: tokenMap[offchainFeeInfo.token].tokenId,
      feeRaw: offchainFeeInfo.fee,
    }
  }
}

export const useWithdraw = <R extends IBData<T>, T>() => {
  const {
    modals: {
      isShowWithdraw: { symbol, isShow, info, address: contactAddress },
    },
    setShowAccount,
    setShowWithdraw,
    setShowEditContact,
  } = useOpenModals()
  const { tokenMap, totalCoinMap, disableWithdrawList, idIndex } = useTokenMap()
  const { tokenPrices } = useTokenPrices()
  const { currency } = useSettings()
  const { account, status: accountStatus } = useAccount()
  const { exchangeInfo, chainId, getValueInCurrency,  } = useSystem()
  
  const {
    contacts,
    errorMessage: contactsErrorMessage,
    updateContacts,
    status: contactStatus,
  } = useContacts()
  const { withdrawValue, updateWithdrawData, resetWithdrawData } = useModalData()
  const [walletMap2, setWalletMap2] = React.useState(
    makeWalletLayer2({ needFilterZero: true, _isToL1: true }).walletMap ?? ({} as WalletMap<R>),
  )

  const [sureIsAllowAddress, setSureIsAllowAddress] = React.useState<
    WALLET_TYPE | EXCHANGE_TYPE | undefined
  >(undefined)



  const [getState, setState] = useGetSet({
    fee: {
      chargeFeeTokenListNormal: [] as sdk.OffchainFeeInfo[],
      chargeFeeTokenListFast: [] as sdk.OffchainFeeInfo[],
      isOnLoading: false,
      symbol: undefined as string | undefined, 
    },
    withdrawMode: {
      fastInfo: undefined as undefined | {
        fee: string
        time: string
        
      },
      maxFastWithdrawAmountBN: undefined as undefined | string,
      normalInfo: undefined as undefined | {
        fee: string
        time: string
      },
      fastModeTokens: [] as string[],
      mode: 'fast' as 'fast' | 'normal',
    }
  })
  const state = getState()
  const { fee: { symbol: feeSymbol, chargeFeeTokenListFast, chargeFeeTokenListNormal }, withdrawMode } = state
  const withdrawToken = tokenMap[withdrawValue.belong as string]
  const tradeValueBN = withdrawToken && withdrawValue.tradeValue
    ? ethers.utils.parseUnits(withdrawValue.tradeValue.toString(), withdrawToken.decimals)
    : ethers.BigNumber.from('0')
  const fastWithdrawOverflow = state.withdrawMode.maxFastWithdrawAmountBN && tradeValueBN 
    ? tradeValueBN.gte(state.withdrawMode.maxFastWithdrawAmountBN)
    : undefined
  const fastModeSupportted = withdrawMode.fastModeTokens.includes(withdrawValue.belong as string)
  const isFastMode =
    fastWithdrawOverflow === false && fastModeSupportted ? withdrawMode.mode === 'fast' : false
  const chargeFeeTokenList = isFastMode 
    ? chargeFeeTokenListFast 
    : chargeFeeTokenListNormal
  const feeInfo = feeSymbol 
    ? chargeFeeTokenList.find((f) => f.token === feeSymbol)
    : chargeFeeTokenList[0]
    
  const feeInfo2 = feeInfo && walletMap2 && tokenMap 
    ? offchainFeeInfoToFeeInfo(feeInfo, tokenMap, walletMap2 as any)
    : undefined;
  
  const isFeeNotEnough = {
    isFeeNotEnough:
      feeInfo2 && feeInfo2.fee && feeInfo2.count
        ? new Decimal(feeInfo2.fee).gt(feeInfo2.count)
        : false,
    isOnLoading: getState().fee.isOnLoading,
  }
  console.log('isFeeNotEnough', feeInfo2, isFeeNotEnough)
  const handleFeeChange = (feeInfo: FeeInfo) => {
    setState({
      ...getState(),
      fee: {
        ...getState().fee,
        symbol: feeInfo.token,
      },
    })
  }

  const { checkHWAddr, updateHW } = useWalletInfo()

  const [lastRequest, setLastRequest] = React.useState<any>({})
  

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
    reCheck,
    isENSWrong,
    ens,
  } = useAddressCheck(false)

  React.useEffect(() => {
    if (loopringSmartWalletVersion?.isLoopringSmartWallet && sureIsAllowAddress === undefined) {
      setSureIsAllowAddress(WALLET_TYPE.Loopring)
    }
  }, [loopringSmartWalletVersion?.isLoopringSmartWallet])

  const isNotAvailableAddress =
    // isCFAddress
    // ? "isCFAddress"
    // :
    isContractAddress && disableWithdrawList.includes(withdrawValue?.belong ?? '')
      ? `isContractAddress`
      : undefined
      
  const checkBtnStatus = () => {
    const withdrawValue = store.getState()._router_modalData.withdrawValue
    if (tokenMap && withdrawValue.belong && tokenMap[withdrawValue.belong]) {
      const withdrawT = tokenMap[withdrawValue.belong]
      const tradeValue = sdk.toBig(withdrawValue.tradeValue ?? 0).times('1e' + withdrawT.decimals)
      const exceedPoolLimit =
        withdrawValue.withdrawType == sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL &&
        tradeValue.gt(0) &&
        withdrawT.fastWithdrawLimit &&
        tradeValue.gte(withdrawT.fastWithdrawLimit)
      const isEnough = tradeValue.lte(
        sdk.toBig(withdrawValue.balance ?? 0).times('1e' + withdrawT.decimals),
      )
      
      const contact = contacts?.find((x) => x.contactAddress === realAddr)
      const ensHasCheck = (contact?.ens || ens) 
        ? !isENSWrong 
        : true

      if (exceedPoolLimit) {
        const amt = getValuePrecisionThousand(
          sdk.toBig(withdrawT.fastWithdrawLimit ?? 0).div('1e' + withdrawT.decimals),
          withdrawT.precision,
          withdrawT.precision,
          withdrawT.precision,
          false,
          { floor: true },
        ).toString()
        return {
          label: `labelL2toL1BtnExceed|${amt}`,
          enable: false,
          isFastWithdrawAmountLimit: true,
        }
      } else if (realAddr && withdrawValue.tradeValue && sureIsAllowAddress === undefined) {
        return {
          label: 'Please input address type',
          enable: false,
          isFastWithdrawAmountLimit: false,
        }
      }
      if (
        tradeValue &&
        !exceedPoolLimit &&
        !isNotAvailableAddress &&
        chargeFeeTokenList.length &&
        !isFeeNotEnough.isFeeNotEnough &&
        feeInfo2?.belong &&
        feeInfo2?.feeRaw &&
        tradeValue.gt(BIGO) &&
        !isFeeNotEnough.isOnLoading &&
        withdrawValue.tradeValue &&
        realAddr &&
        isEnough &&
        ensHasCheck &&
        (info?.isToMyself || sureIsAllowAddress) &&
        [AddressError.NoError, AddressError.IsNotLoopringContract].includes(addrStatus)
      ) {
        return {
          enable: true,
          isFastWithdrawAmountLimit: false,
          label: undefined
        }
      }
      
    } 
    return {
      label: undefined,
      enable: false,
      isFastWithdrawAmountLimit: false
    }
  }
  const checkResult = checkBtnStatus()
  const btnStatus: TradeBtnStatus = checkResult.enable
    ? TradeBtnStatus.AVAILABLE 
    : TradeBtnStatus.DISABLED
  const withdrawI18nKey = checkResult.label
  const isFastWithdrawAmountLimit=checkResult.isFastWithdrawAmountLimit


  const walletLayer2Callback = () => {
    const walletMap =
      makeWalletLayer2({ needFilterZero: true, _isToL1: true }).walletMap ?? ({} as WalletMap<R>)
    setWalletMap2(
      WITHDRAW_TOKEN_FILTER_LIST.reduce((pre, cur) => {
        return omit(pre, cur) as WalletMap<R>
      }, walletMap),
    )
  }

  const resetDefault = React.useCallback(() => {
    if (info?.isRetry) {
      return
    }
    if (contactsErrorMessage) {
      updateContacts()
    }
    if (symbol) {
      if (walletMap2) {
        updateWithdrawData({
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
        let objInit = {
          belong: 'LRC',
          tradeValue: undefined,
          balance: 0,
          address: info?.isToMyself ? account.accAddress : '*',
          withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL as WithdrawType,
        }
        for (let key in keys) {
          const keyVal = keys[key]
          const walletInfo = walletMap2[keyVal]
          if (sdk.toBig(walletInfo.count).gt(0)) {
            objInit = {
              belong: keyVal as any,
              tradeValue: undefined,
              balance: walletInfo?.count,
              address: info?.isToMyself ? account.accAddress : '*',
              withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
            }
            break
          }
        }
        updateWithdrawData(objInit as any)
      } else if (withdrawValue.belong && walletMap2) {
        const walletInfo = walletMap2[withdrawValue.belong]
        updateWithdrawData({
          belong: withdrawValue.belong,
          tradeValue: undefined,
          balance: walletInfo?.count,
          address: info?.isToMyself ? account.accAddress : '*',
          withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
        })
      } else {
        updateWithdrawData({
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
    symbol,
    walletMap2,
    updateWithdrawData,
    feeInfo,
    withdrawValue.belong,
    info?.isRetry,
    contactAddress,
  ])

  const getConfig = async () => {
    const globalState = store.getState()
    const network = MapChainId[globalState.settings.defaultNetwork]
    const config = await LoopringAPI.rabbitWithdrawAPI!.getConfig()
    const networkL2TokenIds = JSON.parse(config.config).networkL2TokenIds[network]
    const networkL1Tokens = JSON.parse(config.config).networkL1Tokens[network]
    const fastModeSupportedTokens = networkL2TokenIds
      .map((id: number) => {
        return idIndex[id]
      })
      .filter((symbol) => {
        return networkL1Tokens[symbol]
      })
    setState((state) => ({
      ...state,
      withdrawMode: {
        ...state.withdrawMode,
        fastModeTokens: fastModeSupportedTokens,
      },
    }))
  }

  const refreshFee = async () => {
    setState((state) => ({
      ...state,
      fee: {
        ...state.fee,
        isOnLoading: true,
      },
    }))
    try {
      const globalState = store.getState()
      const account = globalState.account
      const network = MapChainId[globalState.settings.defaultNetwork]
      const symbol = globalState._router_modalData.withdrawValue.belong as string
      const withdrawValue = globalState._router_modalData.withdrawValue.tradeValue
        ? globalState._router_modalData.withdrawValue.tradeValue.toString()
        : '0'
      const withdrawToken = symbol
        ? tokenMap[symbol]
        : undefined

      const feeResNormal = await LoopringAPI.userAPI?.getOffchainFeeAmt(
        {
          accountId: account.accountId,
          requestType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
          tokenSymbol: symbol,
          amount: ethers.utils.parseUnits(withdrawValue ? withdrawValue : '0', withdrawToken?.decimals).toString(),
        },
        account.apiKey,
      )
      const feeResFast = await LoopringAPI.userAPI?.getUserCrossChainFee(
        {
          receiveFeeNetwork: network,
          requestType: sdk.OffchainFeeReqType.RABBIT_OFFCHAIN_WITHDRAWAL,
          calFeeNetwork: network,
          tokenSymbol: symbol,
          amount: ethers.utils.parseUnits(withdrawValue ? withdrawValue : '0', withdrawToken?.decimals).toString(),
        },
        account.apiKey,
      )
      withdrawToken && LoopringAPI.rabbitWithdrawAPI?.getNetworkWithdrawalAgents({
        tokenId: withdrawToken.tokenId,
        network: network,
        amount: '0'
      }).then(res => {
        const amounts = res.map(agent => {
          return new Decimal(agent.totalAmount).sub(agent.freezeAmount).toString()
        })
        const sorted = amounts.concat('0').sort((a, b) => ethers.BigNumber.from(b).gte(a) ? 1 : -1)
        const amount = sorted[0] ? sorted[0] : '0'
        setState((state) => ({
          ...state,
          withdrawMode: {
            ...state.withdrawMode,
            maxFastWithdrawAmountBN: amount,
          }
        }))
      })
      const chargeFeeTokenListNormal = feeResNormal?.fees ? values(feeResNormal.fees) : []
      const chargeFeeTokenListFast = feeResFast?.fees ?? []
      setState((state) => ({
        ...state,
        fee: {
          ...state.fee,
          chargeFeeTokenListNormal,
          chargeFeeTokenListFast,
        }
      }))
    } finally {
      setState((state) => ({
        ...state,
        fee: {
          ...state.fee,
          isOnLoading: false,
        },
      }))
    }
  }

  const debouncedRefresshFee = useDebouncedCallback(refreshFee, 100)

  const onChangeWithdrawMode = (mode: 'fast' | 'normal') => {
    setState((state) => ({
      ...state,
      withdrawMode: {
        ...state.withdrawMode,
        mode,
      },
    }))
    refreshFee()
  }

  React.useEffect(() => {
    const account = store.getState().account
    var refreshTimer: NodeJS.Timeout | undefined = undefined
    if (
      isShow &&
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
      getConfig()
      resetDefault()
      refreshTimer = setInterval(() => {
        refreshFee()
      }, 20 * 1000)
      refreshFee()
    } 
    return () => {
      setAddress('')
      refreshTimer && clearInterval(refreshTimer)
    }
  }, [isShow, accountStatus])


  useWalletLayer2Socket({ walletLayer2Callback })

  const processRequest = React.useCallback(
    async (request: sdk.OffChainWithdrawalRequestV3, isNotHardwareWallet: boolean) => {
      const { apiKey, connectName, eddsaKey } = account
      const withdrawValue = store.getState()._router_modalData.withdrawValue

      try {
        if (
          connectProvides.usedWeb3 &&
          LoopringAPI.userAPI &&
          isAccActivated() &&
          feeInfo2?.belong
        ) {
          let isHWAddr = checkHWAddr(account.accAddress)
          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true
          }
          myLog('withdraw processRequest:', isHWAddr, isNotHardwareWallet)
          const feeToken = tokenMap[feeInfo2.belong]
          const feeRaw = feeInfo2.feeRaw ?? 0
          const fee = sdk.toBig(feeRaw)
          const response = await LoopringAPI.userAPI.submitOffchainWithdraw(
            {
              request: {
                ...request,
                maxFee: {
                  tokenId: feeToken?.tokenId ?? request.maxFee.tokenId,
                  volume: fee?.toString() ?? request.maxFee.volume, // TEST: fee.toString(),
                },
              },
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
    ],
  )

  const { walletProvider } = useWeb3ModalProvider()

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
        feeInfo2?.belong &&
        feeInfo2?.feeRaw &&
        eddsaKey?.sk &&
        (info?.isToMyself || sureIsAllowAddress)
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.Withdraw_WaitForAuth,
          })

          const withdrawToken = tokenMap[withdrawValue.belong as string]
          const feeToken = tokenMap[feeInfo2.belong]

          // const fee = sdk.toBig(withdrawValue.fee?.feeRaw ?? 0);
          const feeRaw = feeInfo2.feeRaw ?? 0
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
      feeInfo2?.belong,
      feeInfo2?.feeRaw,
      info,
      sureIsAllowAddress,
      setShowAccount,
      processRequest,
    ],
  )
  
  const handleRabbitWithdraw = async (inputValue: any, toAddress: string) => {
    const { readyState, eddsaKey } = account
    const ok =
      readyState === AccountStatus.ACTIVATED &&
      tokenMap &&
      exchangeInfo &&
      connectProvides.usedWeb3 &&
      LoopringAPI.userAPI &&
      feeInfo2?.belong &&
      feeInfo2?.feeRaw &&
      eddsaKey?.sk &&
      (info?.isToMyself || sureIsAllowAddress) &&
      toAddress
    if (!ok) return false

    try {
      setShowAccount({
        isShow: true,
        step: AccountStep.Withdraw_WaitForAuth,
      })
      const withdrawToken = tokenMap[withdrawValue.belong as string]
      const feeToken = tokenMap[feeInfo2.belong]
      const feeRaw = feeInfo2!.feeRaw ?? 0
      const fee = sdk.toBig(feeRaw)
      const balance = sdk.toBig(inputValue.balance ?? 0).times('1e' + withdrawToken.decimals)
      const tradeValue = sdk.toBig(inputValue.tradeValue ?? 0).times('1e' + withdrawToken.decimals)
      const isExceedBalance =
        feeToken.tokenId === withdrawToken.tokenId && tradeValue.plus(fee).gt(balance)
      const finalVol = isExceedBalance ? balance.minus(fee) : tradeValue
      const withdrawVol = finalVol.toFixed(0, 0)
      const network = MapChainId[chainId]
      const config = await LoopringAPI.rabbitWithdrawAPI!.getConfig()
      const configiJSON = JSON.parse(config.config)
      const storageId = await LoopringAPI.userAPI?.getNextStorageId(
        {
          accountId: account.accountId,
          sellTokenId: withdrawToken.tokenId,
        },
        account.apiKey,
      )
      const agentId = configiJSON.networkL2AgentAccountIds[network]
      const agentAddr = configiJSON.networkL2AgentAddresses[network]
      const exchange = configiJSON.networkExchanges[network]

      const request: sdk.RabbitWithdrawRequest = {
        fromNetwork: network,
        toNetwork: network,
        toAddress: toAddress,
        transfer: {
          exchange: exchange,
          payerId: account.accountId,
          payerAddr: account.accAddress,
          payeeId: agentId,
          payeeAddr: agentAddr,
          token: {
            tokenId: withdrawToken.tokenId,
            volume: withdrawVol,
          },
          maxFee: {
            // @ts-ignore
            tokenId: feeToken.tokenId,
            volume: feeRaw
          },
          storageId: storageId!.offchainId,
          validUntil: getTimestampDaysLater(DAYS),
        },
      }

      // console.log('fastWithdraw_request', request)
      // localStorage.setItem('fastWithdraw_request', JSON.stringify(request))
      debugger
      const provider = new ethers.providers.Web3Provider(walletProvider as any)

      const response = await LoopringAPI.rabbitWithdrawAPI?.submitRabitWithdraw(request, {
        exchangeAddr: exchange,
        signer: provider.getSigner(),
        eddsaSignKey: account.eddsaKey.sk,
        chainId: chainId as number,
      })
      if ((response as any).resultInfo && (response as any).resultInfo.code > 0) {
        throw (response as any).resultInfo
      } else {
        info?.onCloseCallBack && info?.onCloseCallBack()
        setShowWithdraw({
          isShow: false,
          contactName: info?.contactName,
        })
        setShowAccount({
          isShow: true,
          step: AccountStep.Withdraw_In_Progress,
        })

        let hash = Explorer + `tx/${(response as sdk.TX_HASH_API)?.hash}-withdraw` // todo

        setShowAccount({
          isShow: true,
          step: AccountStep.Withdraw_Success,
          info: {
            symbol: withdrawValue.belong,
            hash,
            isToMyself: info?.isToMyself,
          },
        })

        resetWithdrawData()
        walletLayer2Service.sendUserUpdate()
        await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
        if (
          store.getState().modals.isShowAccount.isShow &&
          store.getState().modals.isShowAccount.step === AccountStep.Withdraw_Success
        ) {
          setShowAccount({ isShow: false })
        }
      }
    } catch (e: any) {
      const code = sdk.checkErrorInfo(e, true)
      myLog('checkErrorInfo', code, e)
      switch (code) {
        case sdk.ConnectorError.NOT_SUPPORT_ERROR:
          setShowAccount({
            isShow: true,
            step: AccountStep.Withdraw_First_Method_Denied,
          })
          break
        case sdk.ConnectorError.USER_DENIED:
        case sdk.ConnectorError.USER_DENIED_2:
          setShowAccount({
            isShow: true,
            step: AccountStep.Withdraw_User_Denied,
          })
          break
        default:
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
      
  }
  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTWithdraw_WaitForAuth,
      })
      if (isFastMode) {
        return
      } else {
        processRequest(lastRequest, !isHardwareRetry)
      }
    },
    [lastRequest, processRequest, setShowAccount, isFastMode],
  )

  React.useEffect(() => {
    const { contacts } = store.getState().contacts
    const contact = contacts?.find(
      (x) => x.contactAddress?.toLowerCase() === realAddr?.toLowerCase(),
    )
    if (isShow === false) {
      setSureIsAllowAddress(undefined)
    } else if (contact?.addressType !== undefined) {
      const found = contact.addressType ? addressToExWalletMapFn(contact.addressType) : undefined
      setSureIsAllowAddress(found)
    }
    if (
      isShow &&
      contactStatus == SagaStatus.UNSET &&
      contact &&
      realAddr?.toLowerCase() == contact?.contactAddress?.toLowerCase()
    ) {
      reCheck()
    }
  }, [realAddr, isShow, contactStatus])

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
    withdrawType: withdrawValue.withdrawType as any,
    isFastWithdrawAmountLimit,
    sureIsAllowAddress,
    lastFailed: store.getState().modals.isShowAccount.info?.lastFailed === LAST_STEP.withdraw,
    handleSureIsAllowAddress: (value: WALLET_TYPE | EXCHANGE_TYPE) => {
      const found = exWalletToAddressMapFn(value)
      // const found = map.find(x => x[0] === value)![1]
      const contact = contacts?.find((x) => x.contactAddress === realAddr)
      if (!account?.isContractAddress && contact) {
        LoopringAPI.contactAPI
          ?.updateContact(
            {
              ...contact,
              isHebao: !!(account.isContractAddress || account.isCFAddress),
              accountId: account.accountId,
              addressType: found,
            },
            account.apiKey,
          )
          .then(() => {
            updateContacts()
          })
      }
      setSureIsAllowAddress(value)
    },

    onWithdrawClick: () => {
      if (withdrawValue && withdrawValue.belong) {
        return isFastMode
          ? handleRabbitWithdraw(withdrawValue, realAddr ? realAddr : address)
          : handleWithdraw(withdrawValue, realAddr ? realAddr : address)
      }
    },
    handleWithdrawTypeChange: (value) => {
      // setWithdrawType(value);
      const _withdrawValue = store.getState()._router_modalData.withdrawValue
      updateWithdrawData({
        ..._withdrawValue,
        withdrawType: value as any,
      })
    },
    handlePanelEvent: async (data: SwitchData<R>, _switchType: 'Tomenu' | 'Tobutton') => {
      if (data.to === 'button') {
        if (walletMap2 && data?.tradeData?.belong) {
          debouncedRefresshFee()
          const walletInfo = walletMap2[data?.tradeData?.belong as string]
          updateWithdrawData({
            ...withdrawValue,
            belong: data.tradeData?.belong,
            tradeValue: data.tradeData?.tradeValue,
            balance: walletInfo?.count,
            address: '*',
          })
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
    feeInfo: feeInfo2,
    addrStatus,
    chargeFeeTokenList: chargeFeeTokenList.map(feeInfo => {
      return feeInfo && walletMap2 && tokenMap
      ? offchainFeeInfoToFeeInfo(feeInfo, tokenMap, walletMap2 as any)
      : undefined
    }).filter(feeInfo => feeInfo !== undefined),
    isFeeNotEnough,
    handleOnAddressChange: (value: any) => {
      setAddress(value)
    },
    isFromContact: contactAddress ? true : false,
    contact: contactAddress
      ? contacts?.find((x) => x.contactAddress === contactAddress)
      : undefined,
    loopringSmartWalletVersion,
    contacts,
    isENSWrong,
    geUpdateContact: () => {
      if (isENSWrong) {
        const contact = contacts?.find((x) => x.contactAddress === realAddr)
        setShowEditContact({
          isShow: true,
          info: {
            ...contact,
            isENSWrong,
          },
        })
      }
    },
    ens,
    withdrawMode: (() => {
      const state = getState()
      const feeSymbol = state.fee.symbol ?? 'ETH'
      const feeFast = state.fee.chargeFeeTokenListFast.find((item) => item.token === feeSymbol)
      const feeNormal = state.fee.chargeFeeTokenListNormal.find((item) => item.token === feeSymbol)
      const feeTokenInfo = tokenMap[feeSymbol]

      const feeFastInCurrency =
        feeTokenInfo && feeFast && tokenPrices  
          ? fiatNumberDisplaySafe(
              getValueInCurrency(
                new Decimal(ethers.utils.formatUnits(feeFast.fee, feeTokenInfo.decimals))
                  .mul(tokenPrices[feeSymbol])
                  .toFixed(2),
              ),
              currency,
            )
          : undefined
      const feeNormalInCurrency =
        feeTokenInfo && feeNormal && tokenPrices
          ? fiatNumberDisplaySafe(
              getValueInCurrency(
                new Decimal(ethers.utils.formatUnits(feeNormal.fee, feeTokenInfo.decimals))
                  .mul(tokenPrices[feeSymbol])
                  .toFixed(2),
              ),
              currency,
            )
          : undefined
      // const withdrawToken = tokenMap[withdrawValue.belong as string]
      // const tradeValueBN = withdrawToken && withdrawValue.tradeValue
      //   ? ethers.utils.parseUnits(withdrawValue.tradeValue.toString(), withdrawToken.decimals)
      //   : undefined
      
      return {
        mode: isFastMode ? 'fast' : 'normal',
        showFastMode: fastModeSupportted,
        fastMode: {
          fee: feeFastInCurrency ? '~' + feeFastInCurrency : '--',
          time: '~3 minutes',
        },
        fastMaxAlert: {
          show: fastWithdrawOverflow === true,
          message:
            state.withdrawMode.maxFastWithdrawAmountBN &&
            withdrawToken &&
            `Max ${ethers.utils.formatUnits(
              state.withdrawMode.maxFastWithdrawAmountBN,
              withdrawToken.decimals,
            )} ${withdrawToken?.symbol}`,
        },
        normalMode: {
          fee: feeNormalInCurrency ? '~' + feeNormalInCurrency : '--',
          time: '~25 minutes',
        },
        onChange: onChangeWithdrawMode,
      }
    })(),
  }
  console.log('withdrawProps', getState(), withdrawValue, withdrawProps)

  return {
    withdrawProps,
    retryBtn,
  }
}
