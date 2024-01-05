import React from 'react'

import * as sdk from '@loopring-web/loopring-sdk'

import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'

import {
  AccountStep,
  SwitchData,
  TransferProps,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  AddressError,
  CoinMap,
  CurrencyToTag,
  EmptyValueTag,
  EXCHANGE_TYPE,
  Explorer,
  FeeInfo,
  getValuePrecisionThousand,
  LIVE_FEE_TIMES,
  myLog,
  PriceTag,
  SagaStatus,
  SUBMIT_PANEL_AUTO_CLOSE,
  TRADE_TYPE,
  TradeNFT,
  UIERROR_CODE,
  WALLET_TYPE,
} from '@loopring-web/common-resources'

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
  useTokenPrices,
  useWalletLayer2,
  useWalletLayer2WithNFTSocket,
  volumeToCountAsBigNumber,
  walletLayer2Service,
} from '../../index'
import { useWalletInfo } from '../../stores/localStore/walletInfo'
import { useHistory, useLocation } from 'react-router-dom'
import { addressToExWalletMapFn, exWalletToAddressMapFn } from '@loopring-web/core'
import { useContacts } from '../../stores'
import Web3 from 'web3'

export const useNFTTransfer = <R extends TradeNFT<T, any>, T>() => {
  const {
    setShowAccount,
    setShowNFTTransfer,
    setShowNFTDetail,
    setShowEditContact,
    modals: {
      isShowNFTDetail,
      isShowNFTTransfer: {
        isShow,
        info,
        address: contactAddress,
        name: contactName,
        addressType: contactAddressType,
      },
    },
  } = useOpenModals()

  const { tokenMap, totalCoinMap } = useTokenMap()
  const { account, status: accountStatus } = useAccount()
  const { exchangeInfo, chainId, baseURL, forexMap } = useSystem()
  const { currency } = useSettings()
  const { tokenPrices } = useTokenPrices()
  const {
    contacts,
    updateContacts,
    errorMessage: contactsErrorMessage,
    status: contactStatus,
  } = useContacts()
  const { updateWalletLayer2 } = useWalletLayer2()

  const { nftTransferValue, updateNFTWithdrawData, updateNFTTransferData } =
    useModalData()


  const history = useHistory()
  const { search, pathname } = useLocation()
  const searchParams = new URLSearchParams(search)

  const [sureItsLayer2, setSureItsLayer2] = React.useState<WALLET_TYPE | EXCHANGE_TYPE | undefined>(
    undefined,
  )

  const [feeWithActive, setFeeWithActive] = React.useState(false)
  // const [chargeFeeTransferList, setChargeFeeTransferList] = React.useState([
  //   false,
  // ]);
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    resetIntervalTime,
    checkFeeIsEnough,
  } = useChargeFees({
    tokenAddress: nftTransferValue.tokenAddress,
    // requestType: sdk.OffchainNFTFeeReqType.NFT_TRANSFER,
    requestType: feeWithActive
      ? sdk.OffchainNFTFeeReqType.NFT_TRANSFER_AND_UPDATE_ACCOUNT
      : sdk.OffchainNFTFeeReqType.NFT_TRANSFER,
    updateData:
      // React.useCallback(
      ({ fee, requestType }) => {
        let _requestType = feeWithActive
          ? sdk.OffchainNFTFeeReqType.NFT_TRANSFER_AND_UPDATE_ACCOUNT
          : sdk.OffchainNFTFeeReqType.NFT_TRANSFER
        if (_requestType === requestType) {
          const nftTransferValue = store.getState()._router_modalData.nftTransferValue
          updateNFTTransferData({
            ...nftTransferValue,
            balance: sdk
              .toBig(nftTransferValue.total ?? 0)
              .minus(nftTransferValue.locked ?? 0)
              .toNumber(),
            fee,
          })
        }
      },
    //   [feeWithActive]
    // ),
  })

  const {
    chargeFeeTokenList: activeAccountFeeList,
    checkFeeIsEnough: checkActiveFeeIsEnough,
    // resetIntervalTime: resetActiveIntervalTime,
  } = useChargeFees({
    isActiveAccount: true,
    requestType: undefined as any,
  })
  const {
    address,
    realAddr,
    setAddress,
    addrStatus,
    isActiveAccount,
    isActiveAccountFee,
    isLoopringAddress,
    isAddressCheckLoading,
    isSameAddress,
    isContractAddress,
    loopringSmartWalletVersion,
    reCheck,
    isENSWrong,
    ens,
  } = useAddressCheck()

  React.useEffect(() => {
    if (loopringSmartWalletVersion?.isLoopringSmartWallet && sureItsLayer2 === undefined) {
      setSureItsLayer2(WALLET_TYPE.Loopring)
    }
  }, [loopringSmartWalletVersion?.isLoopringSmartWallet])

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus()
  const handleOnMemoChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nftTransferValue = store.getState()._router_modalData.nftTransferValue
      updateNFTTransferData({
        ...nftTransferValue,
        memo: e.target.value,
      })
    },
    [updateNFTTransferData],
  )
  const checkBtnStatus = React.useCallback(() => {
    const contact = contacts?.find((x) => x.contactAddress === realAddr)
    const ensHasCheck = (contact?.ens || ens) 
        ? !isENSWrong 
        : true
    if (
      tokenMap &&
      nftTransferValue.fee?.belong &&
      nftTransferValue?.tradeValue &&
      chargeFeeTokenList.length &&
      !isFeeNotEnough.isFeeNotEnough &&
      !isSameAddress &&
      ensHasCheck &&
      sureItsLayer2 &&
      sdk.toBig(nftTransferValue.tradeValue).gt(BIGO) &&
      sdk.toBig(nftTransferValue.tradeValue).lte(Number(nftTransferValue.balance) ?? 0) &&
      (addrStatus as AddressError) === AddressError.NoError &&
      realAddr
    ) {
      enableBtn()
      myLog('enableBtn')
      return
    }
    disableBtn()
  }, [
    tokenMap,
    nftTransferValue.fee?.belong,
    nftTransferValue.tradeValue,
    nftTransferValue.balance,
    chargeFeeTokenList.length,
    isFeeNotEnough?.isFeeNotEnough,
    isSameAddress,
    sureItsLayer2,
    addrStatus,
    realAddr,
    disableBtn,
    enableBtn,
    contacts,
  ])

  React.useEffect(() => {
    checkBtnStatus()
  }, [
    address,
    addrStatus,
    sureItsLayer2,
    isFeeNotEnough.isFeeNotEnough,
    isSameAddress,
    nftTransferValue.tradeValue,
    nftTransferValue.fee,
  ])
  const walletLayer2Callback = React.useCallback(() => {
    checkFeeIsEnough()
  }, [checkFeeIsEnough])

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
    // checkActiveFeeIsEnough({
    //   isRequiredAPI: true,
    //   // intervalTime: LIVE_FEE_TIMES,
    // });
    if (nftTransferValue.nftData) {
      updateNFTTransferData({
        balance: sdk
          .toBig(nftTransferValue.total ?? 0)
          .minus(nftTransferValue.locked ?? 0)
          .toNumber(),
        belong: nftTransferValue.name as any,
        tradeValue: undefined,
        fee: feeInfo,
        address: address ? address : '*',
      })
    } else {
      updateNFTTransferData({
        fee: feeInfo,
        belong: '',
        balance: 0,
        tradeValue: 0,
        address: '*',
      })
    }
    if (contactAddress) {
      setAddress(contactAddress)
    } else {
      setAddress('')
    }
  }, [
    info?.isRetry,
    contactsErrorMessage,
    checkFeeIsEnough,
    nftTransferValue.nftData,
    nftTransferValue.total,
    nftTransferValue.locked,
    nftTransferValue.name,
    contactAddress,
    updateContacts,
    updateNFTTransferData,
    feeInfo,
    address,
    setAddress,
  ])

  React.useEffect(() => {
    if (isShow || info?.isShowLocal) {
      updateWalletLayer2()
      resetDefault()
    } else {
      resetIntervalTime()
      checkActiveFeeIsEnough({
        isRequiredAPI: true,
        requestType: undefined as any,
      })
    }
    return () => {
      resetIntervalTime()
      setAddress('')
      checkActiveFeeIsEnough({
        isRequiredAPI: true,
        requestType: undefined as any,
      })
    }
  }, [isShow, info?.isShowLocal])

  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET && account.readyState === AccountStatus.ACTIVATED) {
      // myLog('useEffect nftTransferValue.address:', nftTransferValue.address)
      setAddress(nftTransferValue.address ? nftTransferValue.address : '')
    }
  }, [setAddress, nftTransferValue.address, accountStatus, account.readyState])

  const { checkHWAddr, updateHW } = useWalletInfo()

  const [lastRequest, setLastRequest] = React.useState<any>({})

  const processRequest = React.useCallback(
    async (request: sdk.OriginNFTTransferRequestV3, isNotHardwareWallet: boolean) => {
      const { apiKey, connectName, eddsaKey } = account
      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI && isAccActivated()) {
          let isHWAddr = checkHWAddr(account.accAddress)

          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true
          }

          setLastRequest({ request })

          const response = await LoopringAPI.userAPI?.submitNFTInTransfer(
            {
              request,
              web3: connectProvides.usedWeb3 as unknown as Web3,
              chainId: chainId !== sdk.ChainId.GOERLI ? sdk.ChainId.MAINNET : chainId,
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

          myLog('submitInternalTransfer:', response)

          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            throw response
          }
          setShowNFTTransfer({ isShow: false })
          // setIsConfirmTransfer(false);
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTTransfer_In_Progress,
          })
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTTransfer_Success,
            info: {
              symbol: nftTransferValue.name,
              hash:
                Explorer +
                `tx/${(response as sdk.TX_HASH_API)?.hash}-nftTransfer-${account.accountId}-${
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
            locked: (
              Number(isShowNFTDetail?.locked ?? 0) + Number(request?.token?.amount)
            ).toString(),
          })
          updateNFTWithdrawData({
            ...isShowNFTDetail,
            locked: (
              Number(isShowNFTDetail?.locked ?? 0) + Number(request?.token?.amount)
            ).toString(),
          })
          updateNFTTransferData({
            ...isShowNFTDetail,
            locked: (
              Number(isShowNFTDetail?.locked ?? 0) + Number(request?.token?.amount)
            ).toString(),
          })
          walletLayer2Service.sendUserUpdate()
          // resetNFTTransferData();
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step == AccountStep.NFTTransfer_Success
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
              step: AccountStep.NFTTransfer_First_Method_Denied,
              info: {
                symbol: nftTransferValue.name,
              },
            })
            break
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            setLastRequest({ request })
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTTransfer_User_Denied,
            })
            break
          default:
            if ([102024, 102025, 114001, 114002].includes((e as sdk.RESULT_INFO)?.code || 0)) {
              checkFeeIsEnough({
                isRequiredAPI: true,
                requestType: feeWithActive
                  ? sdk.OffchainNFTFeeReqType.NFT_TRANSFER_AND_UPDATE_ACCOUNT
                  : sdk.OffchainNFTFeeReqType.NFT_TRANSFER,
              })
            }
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTTransfer_Failed,
              info: {
                symbol: nftTransferValue.name,
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
      setShowNFTTransfer,
      setShowAccount,
      nftTransferValue.name,
      setShowNFTDetail,
      isShowNFTDetail,
      updateNFTWithdrawData,
      updateNFTTransferData,
      updateHW,
      searchParams,
      history,
      pathname,
      checkFeeIsEnough,
      feeWithActive,
    ],
  )

  const onTransferClick = React.useCallback(
    async (_nftTransferValue, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account
      const nftTransferValue = {
        ...store.getState()._router_modalData.nftTransferValue,
        // tradeValue: _nftTransferValue.tradeValue,
        // balance: _nftTransferValue.balance,
      }
      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        LoopringAPI.userAPI &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        nftTransferValue?.nftData &&
        nftTransferValue?.fee?.belong &&
        nftTransferValue?.fee?.feeRaw &&
        nftTransferValue.tradeValue &&
        nftTransferValue.tokenId &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTTransfer_WaitForAuth,
          })
          const feeToken = tokenMap[nftTransferValue.fee.belong]
          const feeRaw = nftTransferValue.fee.feeRaw ?? nftTransferValue.fee.__raw__?.feeRaw ?? 0
          const fee = sdk.toBig(feeRaw)
          const tradeValue = nftTransferValue.tradeValue ?? _nftTransferValue.tradeValue
          const balance = nftTransferValue.balance ?? _nftTransferValue.balance
          const isExceedBalance = sdk.toBig(tradeValue).gt(balance)

          if (isExceedBalance) {
            throw Error('overflow balance')
          }

          const storageId = await LoopringAPI.userAPI?.getNextStorageId(
            {
              accountId,
              sellTokenId: nftTransferValue.tokenId,
            },
            apiKey,
          )

          const req: sdk.OriginNFTTransferRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            fromAccountId: accountId,
            fromAddress: accAddress,
            toAccountId: 0,
            toAddress: realAddr ? realAddr : address,
            storageId: storageId?.offchainId,
            token: {
              tokenId: nftTransferValue.tokenId,
              nftData: nftTransferValue.nftData,
              amount: tradeValue.toString(),
            },
            payPayeeUpdateAccount: !isActiveAccountFee && feeWithActive,
            maxFee: {
              tokenId: feeToken.tokenId,
              amount: fee.toString(), // TEST: fee.toString(),
            },
            validUntil: getTimestampDaysLater(DAYS),
            memo: nftTransferValue.memo,
          }

          myLog('nftTransfer req:', req)

          processRequest(req, isFirstTime)
        } catch (e: any) {
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTTransfer_Failed,
            info: {
              symbol: nftTransferValue?.name,
            },
            error: {
              code: UIERROR_CODE.UNKNOWN,
              msg: e?.message,
            },
          })
        }
      } else {
        return
      }
    },
    [
      account,
      tokenMap,
      exchangeInfo,
      setShowAccount,
      realAddr,
      address,
      processRequest,
      isActiveAccountFee,
      feeWithActive,
    ],
  )
  // const activeFee = React.useMemo(() => {
  //   // return activeAccountFeeList?.find(
  //   //   (item: any) => item.belong == feeInfo.belong
  //   // );
  // }, [feeInfo, activeAccountFeeList]);
  const activeAccountPrice = React.useMemo(() => {
    if (
      realAddr !== '' &&
      !isActiveAccount &&
      activeAccountFeeList.length &&
      activeAccountFeeList[0] &&
      tokenPrices &&
      activeAccountFeeList[0].feeRaw
    ) {
      const feeInfo: FeeInfo = activeAccountFeeList[0]
      const feeU: any =
        volumeToCountAsBigNumber(feeInfo.belong, feeInfo.feeRaw ?? 0)?.times(
          tokenPrices[feeInfo.belong],
        ) ?? undefined
      return feeU && currency && forexMap[currency]
        ? '～' +
            PriceTag[CurrencyToTag[currency]] +
            getValuePrecisionThousand(
              // @ts-ignore
              feeU * forexMap[currency],
              2,
              2,
              2,
              true,
              { floor: true },
            )
        : EmptyValueTag
    } else {
      return
    }
    // return activeAccountFeeList?.find(
    //   (item: any) => item.belong == feeInfo.belong
    // );
  }, [realAddr, isActiveAccount, activeAccountFeeList, tokenPrices, currency, forexMap])
  const handlePanelEvent = React.useCallback(
    async (data: SwitchData<R>, _switchType: 'Tomenu' | 'Tobutton') => {
      return new Promise<void>((res: any) => {
        if (data.to === 'button') {
          if (data.tradeData.belong) {
            updateNFTTransferData({
              belong: data.tradeData.belong,
              tradeValue: data.tradeData?.tradeValue,
              balance: data.tradeData.balance,
              address: '*',
            })
          } else {
            updateNFTTransferData({
              belong: undefined,
              tradeValue: undefined,
              balance: undefined,
              address: '*',
            })
          }
        }

        res()
      })
    },
    [updateNFTTransferData],
  )

  React.useEffect(() => {
    if (realAddr !== '' && isActiveAccount === false) {
      checkActiveFeeIsEnough({
        isRequiredAPI: true,
        requestType: 'TRANSFER_ACTIVE',
      })
    }
  }, [isActiveAccount, realAddr])

  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTTransfer_WaitForAuth,
      })
      processRequest(lastRequest, !isHardwareRetry)
    },
    [lastRequest, processRequest, setShowAccount],
  )
  React.useEffect(() => {
    const { contacts } = store.getState().contacts
    const contact = contacts?.find(
      (x) => x.contactAddress?.toLowerCase() === realAddr?.toLowerCase(),
    )
    if (isShow === false) {
      setSureItsLayer2(undefined)
    } else if (contact?.addressType !== undefined) {
      const found = contact.addressType ? addressToExWalletMapFn(contact.addressType) : undefined
      setSureItsLayer2(found)
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
  const nftTransferProps: TransferProps<R, T> = {
    handleOnMemoChange,
    memo: nftTransferValue.memo ?? '',
    type: TRADE_TYPE.NFT,
    addressDefault: address,
    realAddr,
    lastFailed: store.getState().modals.isShowAccount.info?.lastFailed === LAST_STEP.nftTransfer,
    handleSureItsLayer2: (sure: WALLET_TYPE | EXCHANGE_TYPE) => {
      const found = exWalletToAddressMapFn(sure)!
      const contact = contacts?.find((x) => x.contactAddress === realAddr)
      if (!account.isContractAddress && contact) {
        LoopringAPI.contactAPI?.updateContact(
          {
            ...contact,
            isHebao: !!(account.isContractAddress || account.isCFAddress),
            accountId: account.accountId,
            addressType: found,
          },
          account.apiKey,
        )
        updateContacts()
      }
      setSureItsLayer2(sure)
    },
    // isConfirmTransfer,
    sureItsLayer2,
    tradeData: { ...nftTransferValue } as unknown as R,
    coinMap: totalCoinMap as CoinMap<T>,
    walletMap: {},
    transferBtnStatus: btnStatus,
    onTransferClick,
    handleFeeChange,
    addrStatus,
    feeInfo,
    chargeFeeTokenList,
    activeAccountPrice,
    // activeAccountFeeList,
    // chargeFeeTransferList,
    isFeeNotEnough,
    handlePanelEvent,
    isLoopringAddress,
    baseURL,
    getIPFSString,
    isSameAddress,
    isAddressCheckLoading,
    handleOnAddressChange: (value: any) => {
      checkActiveFeeIsEnough({
        isRequiredAPI: true,
        requestType: undefined as any,
      })
      setAddress((state) => {
        if (state !== value || '') {
          // flag = true;
          setFeeWithActive((state) => {
            if (state !== false) {
              checkFeeIsEnough({
                isRequiredAPI: true,
                requestType: sdk.OffchainFeeReqType.TRANSFER,
              })
            }
            return false
          })
        }
        return value || ''
      })
    },
    feeWithActive,
    isActiveAccount,
    isActiveAccountFee,
    handleOnFeeWithActive: (value: boolean) => {
      setFeeWithActive(value)
      if (value && !isActiveAccountFee) {
        checkFeeIsEnough({
          isRequiredAPI: true,
          requestType: sdk.OffchainNFTFeeReqType.NFT_TRANSFER_AND_UPDATE_ACCOUNT,
        })
      } else {
        checkFeeIsEnough({
          isRequiredAPI: true,
          requestType: sdk.OffchainNFTFeeReqType.NFT_TRANSFER,
        })
      }
    },
    isSmartContractAddress: isContractAddress,
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
  }
  // const cancelNFTTransfer = () => {
  //   resetDefault();
  // };
  return {
    nftTransferProps,
    retryBtn,
    // cancelNFTTransfer,
  }
}
