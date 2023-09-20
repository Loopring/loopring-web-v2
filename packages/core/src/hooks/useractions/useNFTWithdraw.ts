import React from 'react'
import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import { AccountStep, SwitchData, useOpenModals, WithdrawProps } from '@loopring-web/component-lib'
import {
  AccountStatus,
  AddressError,
  CoinMap,
  EXCHANGE_TYPE,
  Explorer,
  LIVE_FEE_TIMES,
  myLog,
  SUBMIT_PANEL_AUTO_CLOSE,
  TRADE_TYPE,
  TradeNFT,
  UIERROR_CODE,
  WALLET_TYPE,
} from '@loopring-web/common-resources'

import * as sdk from '@loopring-web/loopring-sdk'

import {
  BIGO,
  DAYS,
  getIPFSString,
  getTimestampDaysLater,
  isAccActivated,
  LAST_STEP,
  LoopringAPI,
  store,
  useAccount,
  useAddressCheck,
  useBtnStatus,
  useChargeFees,
  useModalData,
  useSystem,
  useTokenMap,
  useWalletLayer2NFT,
  useWalletLayer2WithNFTSocket,
  walletLayer2Service,
} from '../../index'
import { useWalletInfo } from '../../stores/localStore/walletInfo'
import { useHistory, useLocation } from 'react-router-dom'
import { addressToExWalletMapFn, exWalletToAddressMapFn } from '@loopring-web/core'
import { useContacts } from '../../stores'
import Web3 from 'web3';

export const useNFTWithdraw = <R extends TradeNFT<any, any>, T>() => {
  const {
    modals: {
      isShowNFTDetail,
      isShowNFTWithdraw: { isShow, info, address: contactAddress },
    },
    setShowNFTWithdraw,
    setShowNFTDetail,
    setShowAccount,
  } = useOpenModals()

  const { tokenMap, totalCoinMap, disableWithdrawList } = useTokenMap()
  const { account } = useAccount()
  const { exchangeInfo, chainId, baseURL } = useSystem()
  const { page, updateWalletLayer2NFT } = useWalletLayer2NFT()
  const history = useHistory()
  const { search, pathname } = useLocation()
  const searchParams = new URLSearchParams(search)

  const { nftWithdrawValue, updateNFTTransferData, updateNFTWithdrawData, resetNFTWithdrawData } =
    useModalData()
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    resetIntervalTime,
    checkFeeIsEnough,
  } = useChargeFees({
    requestType: sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL,
    tokenAddress: nftWithdrawValue.tokenAddress,
    deployInWithdraw:
      nftWithdrawValue.isCounterFactualNFT && nftWithdrawValue.deploymentStatus === 'NOT_DEPLOYED',
    updateData: ({ fee }) => {
      const nftWithdrawValue = store.getState()._router_modalData.nftWithdrawValue
      updateNFTWithdrawData({
        ...nftWithdrawValue,
        balance: sdk
          .toBig(nftWithdrawValue.total ?? 0)
          .minus(nftWithdrawValue.locked ?? 0)
          .toNumber(),
        fee,
      })
    },
  })

  const { checkHWAddr, updateHW } = useWalletInfo()
  const [sureIsAllowAddress, setSureIsAllowAddress] = React.useState<
    EXCHANGE_TYPE | WALLET_TYPE | undefined
  >(undefined)
  const [lastRequest, setLastRequest] = React.useState<any>({})

  const {
    address,
    realAddr,
    setAddress,
    addrStatus,
    isCFAddress,
    isContract1XAddress,
    isAddressCheckLoading,
    loopringSmartWalletVersion
  } = useAddressCheck()

  React.useEffect(() => {
    if (loopringSmartWalletVersion?.isLoopringSmartWallet && sureIsAllowAddress === undefined) {
      setSureIsAllowAddress(WALLET_TYPE.Loopring)
    }
  }, [loopringSmartWalletVersion?.isLoopringSmartWallet])

  const isNotAvailableAddress = isContract1XAddress ? 'isContract1XAddress' : undefined
  const { btnStatus, enableBtn, disableBtn } = useBtnStatus()
  const checkBtnStatus = React.useCallback(() => {
    if (
      tokenMap &&
      nftWithdrawValue?.fee?.belong &&
      nftWithdrawValue.fee?.feeRaw &&
      nftWithdrawValue?.tradeValue &&
      sdk.toBig(nftWithdrawValue.tradeValue).gt(BIGO) &&
      sdk.toBig(nftWithdrawValue.tradeValue).lte(Number(nftWithdrawValue.balance) ?? 0) &&
      (addrStatus as AddressError) === AddressError.NoError &&
      !isFeeNotEnough.isFeeNotEnough &&
      !isNotAvailableAddress &&
      (info?.isToMyself || sureIsAllowAddress) &&
      realAddr
    ) {
      enableBtn()
      myLog('enableBtn')
      return
    }
    disableBtn()
  }, [
    tokenMap,
    nftWithdrawValue.fee?.belong,
    nftWithdrawValue.fee?.feeRaw,
    nftWithdrawValue.tradeValue,
    nftWithdrawValue.balance,
    addrStatus,
    isFeeNotEnough,
    isNotAvailableAddress,
    info?.isToMyself,
    sureIsAllowAddress,
    realAddr,
    disableBtn,
    enableBtn,
  ])

  React.useEffect(() => {
    checkBtnStatus()
  }, [
    address,
    addrStatus,
    isFeeNotEnough.isFeeNotEnough,
    nftWithdrawValue.fee,
    nftWithdrawValue.tradeValue,
    isNotAvailableAddress,
    sureIsAllowAddress,
  ])
  const {updateContacts, contacts, errorMessage: contactsErrorMessage} = useContacts()

  const walletLayer2Callback = React.useCallback(() => {
    checkFeeIsEnough()
  }, [])
  useWalletLayer2WithNFTSocket({ walletLayer2Callback })
  const resetDefault = React.useCallback(() => {
    if (info?.isRetry) {
      checkFeeIsEnough()
      return
    }
    if (contactsErrorMessage) {
      updateContacts()
    }
    checkFeeIsEnough({ isRequiredAPI: true, intervalTime: LIVE_FEE_TIMES })
    if (nftWithdrawValue.nftData) {
      updateNFTWithdrawData({
        // ...nftWithdrawValue,
        balance: sdk
          .toBig(nftWithdrawValue.total ?? 0)
          .minus(nftWithdrawValue.locked ?? 0)
          .toNumber(),
        belong: nftWithdrawValue.name,
        tradeValue: undefined,
        fee: feeInfo,
        address: info?.isToMyself ? account.accAddress : '*',
      })
    } else {
      updateNFTWithdrawData({
        fee: feeInfo,
        belong: '',
        balance: 0,
        tradeValue: undefined,
        address: info?.isToMyself ? account.accAddress : '*',
      })
    }
    if (info?.isToMyself) {
      setAddress(account.accAddress)
    } else if (contactAddress) {
      setAddress(contactAddress)
    } else {
      setAddress('')
    }
  }, [
    checkFeeIsEnough,
    nftWithdrawValue,
    info?.isRetry,
    info?.isToMyself,
    updateNFTWithdrawData,
    feeInfo,
    account.accAddress,
    setAddress,
    contactAddress,
    contactsErrorMessage,
  ])

  React.useEffect(() => {
    if (isShow || info?.isShowLocal) {
      resetDefault()
    } else {
      resetIntervalTime()
    }
    return () => {
      resetIntervalTime()
    }
  }, [isShow, info?.isShowLocal])

  const processRequest = React.useCallback(
    async (request: sdk.NFTWithdrawRequestV3, isNotHardwareWallet: boolean) => {
      const { apiKey, connectName, eddsaKey } = account

      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI && isAccActivated()) {
          let isHWAddr = checkHWAddr(account.accAddress)

          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true
          }

          myLog('nftWithdraw processRequest:', isHWAddr, isNotHardwareWallet)
          const response = await LoopringAPI.userAPI.submitNFTWithdraw(
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
          setShowNFTWithdraw({ isShow: false })

          setShowAccount({
            isShow: true,
            step: AccountStep.NFTWithdraw_In_Progress,
          })
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTWithdraw_Success,
            info: {
              symbol: nftWithdrawValue.name,
              hash:
                Explorer +
                `tx/${(response as sdk.TX_HASH_API)?.hash}-nftWithdraw${account.accountId}-${
                  request.token.tokenId
                }-${request.storageId}`,
            },
          })
          if (isHWAddr) {
            myLog('......try to set isHWAddr', isHWAddr)
            updateHW({ wallet: account.accAddress, isHWAddr })
          }

          setShowNFTDetail({
            ...isShowNFTDetail,
            deploymentStatus:
              isShowNFTDetail.deploymentStatus === sdk.DEPLOYMENT_STATUS.NOT_DEPLOYED
                ? sdk.DEPLOYMENT_STATUS.DEPLOYING
                : isShowNFTDetail.deploymentStatus,
            locked: (
              Number(isShowNFTDetail?.locked ?? 0) + Number(request?.token?.amount)
            ).toString(),
          })
          updateNFTWithdrawData({
            ...isShowNFTDetail,
            deploymentStatus:
              isShowNFTDetail.deploymentStatus === sdk.DEPLOYMENT_STATUS.NOT_DEPLOYED
                ? sdk.DEPLOYMENT_STATUS.DEPLOYING
                : isShowNFTDetail.deploymentStatus,

            locked: (
              Number(isShowNFTDetail?.locked ?? 0) + Number(request?.token?.amount)
            ).toString(),
          })
          updateNFTTransferData({
            ...isShowNFTDetail,
            deploymentStatus:
              isShowNFTDetail.deploymentStatus === sdk.DEPLOYMENT_STATUS.NOT_DEPLOYED
                ? sdk.DEPLOYMENT_STATUS.DEPLOYING
                : isShowNFTDetail.deploymentStatus,
            locked: (
              Number(isShowNFTDetail?.locked ?? 0) + Number(request?.token?.amount)
            ).toString(),
          })
          walletLayer2Service.sendUserUpdate()
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step == AccountStep.NFTWithdraw_Success
          ) {
            setShowAccount({ isShow: false })
            searchParams.delete('detail')
            history.push(pathname + '?' + searchParams.toString())
          }
        }
      } catch (e: any) {
        const code = sdk.checkErrorInfo(e, isNotHardwareWallet)
        switch (code) {
          case sdk.ConnectorError.NOT_SUPPORT_ERROR:
            setLastRequest({ request })
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTWithdraw_First_Method_Denied,
              info: {
                symbol: nftWithdrawValue.name,
              },
            })
            break
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            setLastRequest({ request })
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTWithdraw_User_Denied,
              info: {
                symbol: nftWithdrawValue.name,
              },
            })
            break
          default:
            if ([102024, 102025, 114001, 114002].includes((e as sdk.RESULT_INFO)?.code || 0)) {
              checkFeeIsEnough({ isRequiredAPI: true })
            }
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTWithdraw_Failed,
              info: {
                symbol: nftWithdrawValue.name,
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
      nftWithdrawValue.name,
      checkFeeIsEnough,
      updateWalletLayer2NFT,
      page,
      setShowNFTDetail,
      resetNFTWithdrawData,
      updateHW,
    ],
  )

  const handleNFTWithdraw = React.useCallback(
    async (_nftWithdrawToken: any, address, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account
      const nftWithdrawToken = {
        ...store.getState()._router_modalData.nftWithdrawValue,
        ..._nftWithdrawToken,
      }
      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        address &&
        LoopringAPI.userAPI &&
        nftWithdrawValue.fee?.belong &&
        nftWithdrawValue?.fee?.feeRaw &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTWithdraw_WaitForAuth,
          })

          const feeToken = tokenMap[nftWithdrawValue.fee.belong]
          const feeRaw = nftWithdrawValue.fee.feeRaw ?? nftWithdrawValue.fee.__raw__?.feeRaw ?? 0
          const fee = sdk.toBig(feeRaw)
          // const fee = sdk.toBig(nftWithdrawValue.fee.__raw__?.feeRaw ?? 0);
          const tradeValue = nftWithdrawToken.tradeValue

          const storageId = await LoopringAPI.userAPI.getNextStorageId(
            {
              accountId: accountId,
              sellTokenId: nftWithdrawToken.tokenId,
            },
            apiKey,
          )

          const request: sdk.NFTWithdrawRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            owner: accAddress,
            to: address,
            accountId: account.accountId,
            storageId: storageId?.offchainId,
            token: {
              tokenId: nftWithdrawToken.tokenId,
              nftData: nftWithdrawToken.nftData,
              amount: tradeValue.toString(),
            },
            maxFee: {
              tokenId: feeToken.tokenId,
              amount: fee.toString(), // TEST: fee.toString(),
            },
            // fastWithdrawalMode: nftWithdrawType2 === WithdrawType.Fast,
            extraData: '',
            minGas: 0,
            validUntil: getTimestampDaysLater(DAYS),
          }

          myLog('submitNFTWithdraw:', request)

          processRequest(request, isFirstTime)
        } catch (e: any) {
          sdk.dumpError400(e)
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTWithdraw_Failed,
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
      nftWithdrawValue.fee?.belong,
      nftWithdrawValue.fee?.__raw__,
      nftWithdrawValue.fee?.feeRaw,
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
  React.useEffect(() => {
    const addressType = contacts?.find((x) => x.contactAddress === realAddr)?.addressType
    if (!isShow) {
      setSureIsAllowAddress(undefined)
    } else if (addressType !== undefined) {
      const found = addressType ? addressToExWalletMapFn(addressType) : undefined
      setSureIsAllowAddress(found)
    }
  }, [realAddr, isShow, contacts])
  const nftWithdrawProps: WithdrawProps<any, any> = {
    handleOnAddressChange: (value: any) => {
      setAddress(value)
    },
    sureIsAllowAddress,
    handleSureIsAllowAddress: (value) => {
      const found = exWalletToAddressMapFn(value)
      // const found = map.find(x => x[0] === value)![1]
      const contact = contacts?.find((x) => x.contactAddress === realAddr)
      if (!account?.isContractAddress && contact) {
        LoopringAPI.contactAPI
          ?.updateContact(
            {
              contactAddress: realAddr,
              isHebao: !!(account.isContractAddress || account.isCFAddress),
              accountId: account.accountId,
              addressType: found,
              contactName: contact.contactName,
            },
            account.apiKey,
          )
          .then(() => {
            updateContacts()
          })
      }
      setSureIsAllowAddress(value)
    },
    type: TRADE_TYPE.NFT,
    addressDefault: address,
    accAddr: account.accAddress,
    isNotAvailableAddress,
    realAddr,
    isToMyself: info?.isToMyself,
    disableWithdrawList,
    tradeData: nftWithdrawValue as any,
    coinMap: totalCoinMap as CoinMap<T>,
    walletMap: {},
    isCFAddress,
    getIPFSString,
    baseURL,
    lastFailed: store.getState().modals.isShowAccount.info?.lastFailed === LAST_STEP.nftWithdraw,
    isContractAddress: isContract1XAddress,
    isAddressCheckLoading,
    addrStatus,
    withdrawBtnStatus: btnStatus,
    withdrawType: sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL,
    withdrawTypes: {
      [sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL]: 'Standard',
    } as any,
    onWithdrawClick: (tradeData: R) => {
      if (nftWithdrawValue && nftWithdrawValue.tradeValue) {
        handleNFTWithdraw(tradeData, realAddr ? realAddr : address)
      }
    },
    handleWithdrawTypeChange: () => {
    },
    handlePanelEvent: async (data: SwitchData<R>) => {
      return new Promise((res: any) => {
        if (data.to === 'button') {
          if (data.tradeData.belong) {
            updateNFTWithdrawData({
              belong: data.tradeData.belong,
              tradeValue: data.tradeData?.tradeValue,
              balance: data.tradeData.balance,
              address: info?.isToMyself ? account.accAddress : '*',
            })
          } else {
            updateNFTWithdrawData({
              belong: undefined,
              tradeValue: undefined,
              balance: undefined,
              address: info?.isToMyself ? account.accAddress : '*',
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
    isLoopringAddress: true,
    contacts,
    loopringSmartWalletVersion
  } as unknown as WithdrawProps<any, any>

  return {
    nftWithdrawProps,
    retryBtn,
  }
}
