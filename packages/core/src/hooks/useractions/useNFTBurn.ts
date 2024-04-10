import React from 'react'

import * as sdk from '@loopring-web/loopring-sdk'
import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import {
  AccountStep,
  SwitchData,
  TransferProps,
  useOpenModals,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  CoinMap,
  Explorer,
  LIVE_FEE_TIMES,
  myLog, SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_AUTO_CLOSE,
  TRADE_TYPE,
  TradeNFT,
  UIERROR_CODE,
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
  useBtnStatus,
  useChargeFees,
  useModalData,
  useSystem,
  useTokenMap,
  useWalletLayer2,
  useWalletLayer2WithNFTSocket,
  walletLayer2Service,
} from '../../index'
import { useWalletInfo } from '../../stores/localStore/walletInfo'
import { useHistory, useLocation } from 'react-router-dom'
import { useContacts } from '../../stores'
import Web3 from 'web3'
import {useTranslation} from "react-i18next";

export const useNFTBurn = <R extends TradeNFT<T, any>, T>() => {
  const {
    setShowAccount,
    setShowNFTTransfer,
    setShowNFTDetail,
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
  const { t } = useTranslation()
  const { tokenMap, totalCoinMap } = useTokenMap()
  const { account } = useAccount()
  const { exchangeInfo, chainId, baseURL } = useSystem()
  const { updateWalletLayer2 } = useWalletLayer2()

  const { nftTransferValue, updateNFTWithdrawData, updateNFTTransferData } =
    useModalData()

  const history = useHistory()
  const { search, pathname } = useLocation()
  const searchParams = new URLSearchParams(search)
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
    requestType: sdk.OffchainNFTFeeReqType.NFT_TRANSFER,
    updateData:
      // React.useCallback(
      ({ fee, requestType }) => {
        let _requestType = sdk.OffchainNFTFeeReqType.NFT_TRANSFER
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
  const { btnStatus, enableBtn, disableBtn } = useBtnStatus()
  const checkBtnStatus = React.useCallback(() => {
    if (
      tokenMap &&
      nftTransferValue.fee?.belong &&
      nftTransferValue?.tradeValue &&
      chargeFeeTokenList.length &&
      !isFeeNotEnough.isFeeNotEnough &&
      sdk.toBig(nftTransferValue.tradeValue).gt(BIGO) &&
      sdk.toBig(nftTransferValue.tradeValue).lte(Number(nftTransferValue.balance) ?? 0)
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

    disableBtn,
    enableBtn,
  ])

  React.useEffect(() => {
    checkBtnStatus()
  }, [
    isFeeNotEnough.isFeeNotEnough,
    nftTransferValue.tradeValue,
    nftTransferValue.fee,
  ])
  const walletLayer2Callback = React.useCallback(() => {
    checkFeeIsEnough()
  }, [checkFeeIsEnough])
  const { contacts, updateContacts, errorMessage: contactsErrorMessage } = useContacts()

  useWalletLayer2WithNFTSocket({ walletLayer2Callback })

  const resetDefault = React.useCallback(() => {
    if (info?.isRetry) {
      checkFeeIsEnough()
      return
    }
    checkFeeIsEnough({ isRequiredAPI: true, intervalTime: LIVE_FEE_TIMES })
    if (nftTransferValue.nftData) {
      updateNFTTransferData({
        balance: sdk
          .toBig(nftTransferValue.total ?? 0)
          .minus(nftTransferValue.locked ?? 0)
          .toNumber(),
        belong: nftTransferValue.name as any,
        tradeValue: undefined,
        fee: feeInfo,
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
  ])

  React.useEffect(() => {
    if (isShow || info?.isBurn) {
      updateWalletLayer2()
      resetDefault()
    } else {
      resetIntervalTime()
    }
    return () => {
      resetIntervalTime()
    }
  }, [isShow, info?.isShowLocal])

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
              chainId: chainId !== sdk.ChainId.SEPOLIA ? sdk.ChainId.MAINNET : chainId,
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

          myLog('submitInternalTransfer:', response)

          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            throw response
          }
          setShowNFTTransfer({ isShow: false })
          // setIsConfirmTransfer(false);
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTBurn_In_Progress,
          })
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTBurn_Success,
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
            store.getState().modals.isShowAccount.step == AccountStep.NFTBurn_Success
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
              step: AccountStep.NFTBurn_First_Method_Denied,
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
              step: AccountStep.NFTBurn_User_Denied,
            })
            break
          default:
            if ([102024, 102025, 114001, 114002].includes((e as sdk.RESULT_INFO)?.code || 0)) {
              checkFeeIsEnough({
                isRequiredAPI: true,
                requestType: sdk.OffchainNFTFeeReqType.NFT_TRANSFER,
              })
            }
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTBurn_Failed,
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
            step: AccountStep.NFTBurn_WaitForAuth,
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
          const  {result:realAddr} = await LoopringAPI.nftAPI?.getUserNFTBurnAddress({accountId,tokenId:nftTransferValue.tokenId});
          if(!realAddr){
            throw {code:UIERROR_CODE.ERROR_ADDRESS_BURN_NFT}
          }
          const req: sdk.OriginNFTTransferRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            fromAccountId: accountId,
            fromAddress: accAddress,
            toAccountId: 0,
            toAddress: realAddr,
            storageId: storageId?.offchainId,
            token: {
              tokenId: nftTransferValue.tokenId,
              nftData: nftTransferValue.nftData,
              amount: tradeValue.toString(),
            },
            payPayeeUpdateAccount: false,
            maxFee: {
              tokenId: feeToken.tokenId,
              amount: fee.toString(), // TEST: fee.toString(),
            },
            validUntil: getTimestampDaysLater(DAYS),
            memo: 'Burn',
          }
          myLog('nftBurn req:', req)
          processRequest(req, isFirstTime)
        } catch (e: any) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(e)?.code ?? UIERROR_CODE.UNKNOWN]??  SDK_ERROR_MAP_TO_UI[UIERROR_CODE.UNKNOWN]
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTBurn_Failed,
            info: {
              symbol: nftTransferValue?.name,
            },
            error: {
              code:(e)?.code ?? UIERROR_CODE.UNKNOWN,
              message: t(errorItem.messageKey,{ ns: 'error' },),
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
      processRequest,
    ],
  )
  // const activeFee = React.useMemo(() => {
  //   // return activeAccountFeeList?.find(
  //   //   (item: any) => item.belong == feeInfo.belong
  //   // );
  // }, [feeInfo, activeAccountFeeList]);
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


  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTBurn_WaitForAuth,
      })
      processRequest(lastRequest, !isHardwareRetry)
    },
    [lastRequest, processRequest, setShowAccount],
  )

  const nftBurnProps: TransferProps<R, T> = {
    handleOnMemoChange:()=>{},
    memo: nftTransferValue.memo ?? '',
    type: TRADE_TYPE.NFT,
    lastFailed: store.getState().modals.isShowAccount.info?.lastFailed === LAST_STEP.nftTransfer,
    tradeData: { ...nftTransferValue } as unknown as R,
    coinMap: totalCoinMap as CoinMap<T>,
    walletMap: {},
    transferBtnStatus: btnStatus,
    transferI18nKey: t('labelL2NFTBurnBtn'),
    onTransferClick,
    handleFeeChange,
    feeInfo,
    chargeFeeTokenList,
    isFeeNotEnough,
    handlePanelEvent,
    baseURL,
    getIPFSString,
    isFromContact: contactAddress ? true : false,
    contact: contactAddress
      ? {
          address: contactAddress,
          name: contactName!,
          addressType: contactAddressType!,
        }
      : undefined,
    contacts,
  }  as unknown as TransferProps<R, T>

  return {
    nftBurnProps,
    retryBtn,
    // cancelNFTTransfer,
  }
}
