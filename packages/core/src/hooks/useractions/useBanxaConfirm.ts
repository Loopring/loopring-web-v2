import {
  AccountStatus,
  AddressError,
  BANXA_URLS,
  BanxaOrder,
  CoinMap,
  CustomErrorWithCode,
  Explorer,
  FeeInfo,
  IBData,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  TOAST_TIME,
  TRADE_TYPE,
  UIERROR_CODE,
  WALLET_TYPE,
  WalletMap,
} from '@loopring-web/common-resources'
import { store, useAccount, useModalData, useSystem, useTokenMap } from '../../stores'
import { AccountStep, useOpenModals } from '@loopring-web/component-lib'
import React from 'react'
import { makeWalletLayer2 } from '../help'
import {
  OffFaitCommon,
  offFaitService,
  useChargeFees,
  useWalletLayer2Socket,
  walletLayer2Service,
} from '../../services'
import { useBtnStatus } from '../common'
import * as sdk from '@loopring-web/loopring-sdk'
import { LoopringAPI } from '../../api_wrapper'
import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import { getTimestampDaysLater } from '../../utils'
import { DAYS } from '../../defs'
import { RAMP_SELL_PANEL } from './useVendor'
import { BalanceReason, banxaApiCall, BanxaCheck, banxaService } from '../../services'
import { ChainId } from '@loopring-web/loopring-sdk'
import _ from 'lodash'
import { useWalletInfo } from '../../stores/localStore/walletInfo'
import Web3 from 'web3'
import { isAccActivated } from './useCheckAccStatus'
import { useRouteMatch } from 'react-router-dom'
import { useLocation } from 'react-use'
import { merge } from 'rxjs'
import { useTranslation } from 'react-i18next'

export const useBanxaConfirm = <T extends IBData<I>, I, _C extends FeeInfo>({
  setSellPanel,
}: {
  sellPanel: RAMP_SELL_PANEL
  setSellPanel: (value: RAMP_SELL_PANEL) => void
}) => {
  const { t } = useTranslation()
  const match: any = useRouteMatch('/trade/fiat/:tab?')
  const { href } = useLocation()
  const search = href?.split('?')[1] ?? ''
  const searchParams = new URLSearchParams(search)
  const subject = React.useMemo(() => merge(banxaService.onSocket(), offFaitService.onSocket()), [])

  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)

  const { exchangeInfo, chainId } = useSystem()

  const {
    allowTrade: { raw_data },
  } = useSystem()
  const legalEnable = (raw_data as any)?.legal?.enable
  const { tokenMap, totalCoinMap } = useTokenMap()
  const {
    setShowAccount,
    modals: {
      isShowAccount: { info },
    },
  } = useOpenModals()
  const { account } = useAccount()
  const [balanceNotEnough, setBalanceNotEnough] = React.useState<{
    isEnough: boolean
    reason?: BalanceReason
  }>({ isEnough: false })
  const { offBanxaValue, updateOffBanxaData } = useModalData()
  const {
    processRequestBanxaTransfer: processRequest,
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
  } = useBanxaTransPost()
  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2({ needFilterZero: true }).walletMap ?? ({} as WalletMap<T>),
  )
  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap ?? {}
    setWalletMap(walletMap)
  }, [])

  useWalletLayer2Socket({ walletLayer2Callback })

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus()
  const { transferBanxaValue, updateTransferBanxaData } = useModalData()

  React.useEffect(() => {
    if (
      info?.transferBanxa === AccountStep.Transfer_BANXA_Failed &&
      info?.trigger == 'checkFeeIsEnough'
    ) {
      checkFeeIsEnough()
    }
  }, [info?.transferBanxa])
  const restTransfer = React.useCallback(() => {
    const {
      _router_modalData: { offBanxaValue },
    } = store.getState()
    if (offBanxaValue && offBanxaValue.id && offBanxaValue.status === 'waitingPayment') {
      const memo = `banxa-off:${offBanxaValue.id}`
      const walletMap = makeWalletLayer2({ needFilterZero: true })?.walletMap ?? {}
      setShowAccount({ isShow: false })
      checkFeeIsEnough({ isRequiredAPI: true })

      updateTransferBanxaData({
        belong: offBanxaValue.coin_code,
        tradeValue: offBanxaValue.coin_amount,
        balance: walletMap[offBanxaValue?.coin_code ?? '']?.count,
        address: offBanxaValue.wallet_address ?? '',
        memo,
        // fee: feeInfo,//transferBanxaValue.fee,
      })
      setSellPanel(RAMP_SELL_PANEL.BANXA_CONFIRM)
    } else {
      setSellPanel(RAMP_SELL_PANEL.LIST)
    }
  }, [offBanxaValue])

  const checkBtnStatus = React.useCallback(() => {
    const transferBanxaValue = store.getState()._router_modalData.transferBanxaValue
    const walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap ?? {}
    if (
      tokenMap &&
      chargeFeeTokenList.length &&
      isFeeNotEnough &&
      !isFeeNotEnough.isFeeNotEnough &&
      transferBanxaValue.belong &&
      tokenMap[transferBanxaValue.belong] &&
      transferBanxaValue.fee &&
      transferBanxaValue.fee.belong &&
      transferBanxaValue.address
    ) {
      const sellToken = tokenMap[transferBanxaValue.belong]
      const feeToken = tokenMap[transferBanxaValue.fee.belong]
      const feeRaw = transferBanxaValue.fee.feeRaw ?? transferBanxaValue.fee.__raw__?.feeRaw ?? 0
      const fee = sdk.toBig(feeRaw)

      const balance = sdk
        .toBig(walletMap[transferBanxaValue.belong]?.count ?? 0)
        .times('1e' + sellToken.decimals)
      myLog('transferBanxaValue balance', balance)

      const tradeValue = sdk
        .toBig(transferBanxaValue.tradeValue ?? 0)
        .times('1e' + sellToken.decimals)
      const isExceedBalance = tradeValue
        .plus(feeToken.tokenId === sellToken.tokenId ? fee : '0')
        .gt(balance)
      myLog('isExceedBalance', isExceedBalance, fee.toString(), tradeValue.toString())
      if (tradeValue && !isExceedBalance) {
        enableBtn()
        return
      } else {
        disableBtn()
        if (isExceedBalance && feeToken.tokenId === sellToken.tokenId) {
          setBalanceNotEnough({
            isEnough: true,
            reason: BalanceReason.FeeAndBalance,
          })
        } else if (isExceedBalance) {
          setBalanceNotEnough({
            isEnough: true,
            reason: BalanceReason.Balance,
          })
        }
      }
    }
    disableBtn()
  }, [
    chargeFeeTokenList.length,
    disableBtn,
    enableBtn,
    isFeeNotEnough.isFeeNotEnough,
    tokenMap,
    transferBanxaValue.address,
    transferBanxaValue.balance,
    transferBanxaValue.belong,
    transferBanxaValue.fee?.feeRaw,
    transferBanxaValue.tradeValue,
  ])

  React.useEffect(() => {
    const offBanxaValue = store.getState()._router_modalData.offBanxaValue
    if (
      match?.params?.tab?.toLowerCase() === 'sell'.toLowerCase() &&
      searchParams.get('orderId') &&
      searchParams.get('orderId')?.toLowerCase() == offBanxaValue?.id?.toLowerCase()
    ) {
      restTransfer()
    }
  }, [match.params?.tab, offBanxaValue?.id, searchParams.get('orderId')])

  React.useEffect(() => {
    checkBtnStatus()
  }, [chargeFeeTokenList, feeInfo?.belong, isFeeNotEnough?.isFeeNotEnough, transferBanxaValue])

  const onTransferClick = React.useCallback(
    async (isFirstTime: boolean = true) => {
      const { transferBanxaValue, offBanxaValue } = store.getState()._router_modalData

      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account
      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        LoopringAPI.userAPI &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        transferBanxaValue.address !== '*' &&
        transferBanxaValue.address &&
        transferBanxaValue?.fee &&
        offBanxaValue &&
        offBanxaValue.id &&
        offBanxaValue.wallet_address?.toLowerCase() === transferBanxaValue.address.toLowerCase() &&
        transferBanxaValue?.fee.belong &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_BANXA_WaitForAuth,
          })

          const sellToken = tokenMap[transferBanxaValue.belong as string]
          const feeToken = tokenMap[transferBanxaValue.fee.belong]
          const feeRaw =
            transferBanxaValue.fee.feeRaw ?? transferBanxaValue.fee.__raw__?.feeRaw ?? 0
          const fee = sdk.toBig(feeRaw)

          const tradeValue = sdk
            .toBig(transferBanxaValue.tradeValue ?? 0)
            .times('1e' + sellToken.decimals)
          const finalVol = tradeValue
          const transferVol = finalVol.toFixed(0, 0)

          const [storageId, { data }] = await Promise.all([
            LoopringAPI.userAPI?.getNextStorageId(
              {
                accountId,
                sellTokenId: sellToken.tokenId,
              },
              apiKey,
            ),
            banxaApiCall({
              chainId: chainId as ChainId,
              method: sdk.ReqMethod.GET,
              url: `/api/orders/${offBanxaValue.id}`,
              query: '',
              payload: {},
              account,
            }),
          ])
          if (data?.order?.status !== 'waitingPayment' || !data?.order?.wallet_address) {
            offFaitService.banxaCheckStatus({
              data: data?.order,
            })

            throw new CustomErrorWithCode({
              ...SDK_ERROR_MAP_TO_UI[UIERROR_CODE.ERROR_OFF_RAMP_EXPIRED],
              code: UIERROR_CODE.ERROR_OFF_RAMP_EXPIRED,
              message: 'Banxa Expired',
            })
            // throw new CustomError(ErrorMap.ERROR_OFF_RAMP_EXPIRED);
          }
          const req: sdk.OriginTransferRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            payerAddr: accAddress,
            payerId: accountId,
            payeeAddr: transferBanxaValue.address,
            payeeId: 0,
            storageId: storageId?.offchainId,
            token: {
              tokenId: sellToken.tokenId,
              volume: transferVol,
            },
            maxFee: {
              tokenId: feeToken.tokenId,
              volume: fee.toString(), // TEST: fee.toString(),
            },
            validUntil: getTimestampDaysLater(DAYS),
            memo: transferBanxaValue.memo,
          }

          myLog('transfer req:', req)

          processRequest(req, isFirstTime)
        } catch (e: any) {
          if (e?.code === UIERROR_CODE.ERROR_OFF_RAMP_EXPIRED) {
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_BANXA_Failed,
              error: {
                code: UIERROR_CODE.UNKNOWN,
                message: t(
                  e.code && e.messageKey
                    ? e.messageKey
                    : SDK_ERROR_MAP_TO_UI[UIERROR_CODE.UNKNOWN].messageKey,
                  { ns: 'error' },
                ),
              } as sdk.RESULT_INFO,
            })
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_BANXA_Failed,
              error: {
                code: UIERROR_CODE.UNKNOWN,
                message: e.message,
              } as sdk.RESULT_INFO,
            })
          }
          // transfer failed
        }
      } else {
        return
      }
    },
    [account, tokenMap, exchangeInfo, setShowAccount, processRequest],
  )

  const checkOrderStatus = _.debounce(async (_order: BanxaOrder) => {
    if (nodeTimer.current) {
      clearTimeout(nodeTimer.current as NodeJS.Timeout)
    }
    //@ts-ignore
    _order = {
      ..._order,
      // id: "54737597f1ae4daffd9ed5891cfa68dc",
    }
    myLog('banxa check Order ', _order.id)
    try {
      const {
        data: { order },
      } = await banxaApiCall({
        chainId: chainId as ChainId,
        method: sdk.ReqMethod.GET,
        url: `/api/orders/${_order.id}`,
        query: '',
        payload: {},
        account,
      })
      myLog('banxa check Order ', order)

      if (order.status === 'waitingPayment' && order.wallet_address && order.coin_code) {
        updateOffBanxaData({ order })
        banxaService.KYCDone()
        console.log('BANXA KYC Done BANXA order Info:', order)
      } else {
        setTimeout(() => {
          checkOrderStatus(order)
        }, 1000 * 15)
      }
    } catch (e) {
      if (_order && _order.id && _order.status && _order.status === 'pendingPayment') {
        setTimeout(() => {
          checkOrderStatus(_order)
        }, 1000 * 15)
      }
    }
  }, 100)

  React.useEffect(() => {
    const subscription = subject.subscribe((props) => {
      myLog('Banxa subscription ', props)
      switch (props.status) {
        case OffFaitCommon.OffFaitCancel:
          setSellPanel(RAMP_SELL_PANEL.LIST)
          clearTimeout(nodeTimer.current as NodeJS.Timeout)
          break
        case BanxaCheck.CheckOrderStatus:
          myLog('Banxa checkOrderStatus')
          // @ts-ignore
          checkOrderStatus(props.data.order)
          break
        case BanxaCheck.OrderHide:
          myLog('Banxa Order OrderHide')
          clearTimeout(nodeTimer.current as NodeJS.Timeout)
          break
        case BanxaCheck.OrderEnd:
          clearTimeout(nodeTimer.current as NodeJS.Timeout)
          setSellPanel(RAMP_SELL_PANEL.LIST)
          break
        case BanxaCheck.OrderShow:
          if (props.data?.reason == 'transferDone') {
            const {
              _router_modalData: { offBanxaValue },
            } = store.getState()
            setSellPanel(RAMP_SELL_PANEL.LIST)
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_BANXA_Confirm,
              info: {
                orderId: offBanxaValue?.id,
                hash: `${BANXA_URLS[chainId]}/status/${offBanxaValue?.id}`,
              },
            })
          }
          break
        default:
          break
      }
    })
    return () => {
      clearTimeout(nodeTimer.current as NodeJS.Timeout)
      subscription.unsubscribe()
    }
  }, [subject])

  React.useEffect(() => {
    if (
      info?.transferBanxa === AccountStep.Transfer_BANXA_Failed &&
      info?.trigger == 'checkFeeIsEnough'
    ) {
      checkFeeIsEnough()
    }
  }, [info?.transferBanxa])

  const banxaViewProps = React.useMemo(() => {
    const { address, memo, fee, __request__, ...tradeData } = transferBanxaValue

    return {
      type: TRADE_TYPE.TOKEN,
      disabled: !(legalEnable === true),
      addressDefault: address,
      realAddr: address,
      tradeData,
      coinMap: totalCoinMap as CoinMap<T>,
      transferBtnStatus: btnStatus,
      isLoopringAddress: true,
      isSameAddress: false,
      isAddressCheckLoading: WALLET_TYPE.Loopring,
      feeInfo,
      handleFeeChange,
      balanceNotEnough,
      chargeFeeTokenList,
      isFeeNotEnough,
      handleSureItsLayer2: () => undefined,
      sureItsLayer2: true,
      onTransferClick,
      handlePanelEvent: () => undefined,
      addrStatus: AddressError.NoError,
      memo,
      walletMap,
      handleOnMemoChange: () => undefined,
      handleOnAddressChange: () => undefined,
    } as any
  }, [
    balanceNotEnough,
    btnStatus,
    chargeFeeTokenList,
    feeInfo,
    handleFeeChange,
    isFeeNotEnough,
    legalEnable,
    onTransferClick,
    totalCoinMap,
    transferBanxaValue,
    walletMap,
  ])

  return { banxaViewProps, offBanxaValue }
}

export const useBanxaTransPost = () => {
  const { account } = useAccount()
  const { chainId } = useSystem()
  const { checkHWAddr, updateHW } = useWalletInfo()
  const { setShowAccount } = useOpenModals()
  const { offBanxaValue, updateTransferBanxaData } = useModalData()
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    // setIsFeeNotEnough,
  } = useChargeFees({
    requestType: sdk.OffchainFeeReqType.TRANSFER,
    updateData: ({ fee }) => {
      myLog('transferBanxaValue updateData', fee)
      const { transferBanxaValue } = store.getState()._router_modalData
      updateTransferBanxaData({ ...transferBanxaValue, fee })
    },
  })
  const processRequestBanxaTransfer = React.useCallback(
    async (request: sdk.OriginTransferRequestV3, isNotHardwareWallet: boolean) => {
      const { apiKey, connectName, eddsaKey } = account
      let response
      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI && isAccActivated()) {
          let isHWAddr = checkHWAddr(account.accAddress)
          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true
          }

          updateTransferBanxaData({ __request__: request })

          response = await LoopringAPI.userAPI.submitInternalTransfer(
            {
              request: _.cloneDeep(request),
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

          // myLog("Banxa submitInternalTransfer:", response);

          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            throw response
          }
          // setIsConfirmTransfer(false);
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_BANXA_In_Progress,
          })
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_BANXA_Success,
            info: {
              hash: Explorer + `tx/${(response as sdk.TX_HASH_API)?.hash}-transfer`,
            },
          })
          banxaService.TransferDone({ order: offBanxaValue as any })
          walletLayer2Service.sendUserUpdate()

          if (isHWAddr) {
            myLog('Banxa ......try to set isHWAddr', isHWAddr)
            updateHW({ wallet: account.accAddress, isHWAddr })
          }
          await sdk.sleep(TOAST_TIME)
        }
      } catch (e: any) {
        const code = sdk.checkErrorInfo(e, isNotHardwareWallet)
        switch (code) {
          case sdk.ConnectorError.NOT_SUPPORT_ERROR:
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_BANXA_First_Method_Denied,
            })
            break
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_BANXA_User_Denied,
            })
            break
          default:
            if ([102024, 102025, 114001, 114002].includes((e as sdk.RESULT_INFO)?.code || 0)) {
              checkFeeIsEnough({ isRequiredAPI: true })
            }
            myLog('Transfer BANXA error', e)
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_BANXA_Failed,
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
      try {
        if (
          response &&
          offBanxaValue &&
          (response as sdk.TX_HASH_API)?.hash &&
          offBanxaValue.wallet_address
        ) {
          banxaApiCall({
            chainId: chainId as ChainId,
            account,
            method: sdk.ReqMethod.POST,
            url: `/api/orders/${offBanxaValue.id}/confirm`,
            query: '',
            payload: {
              tx_hash: (response as sdk.TX_HASH_API)?.hash,
              source_address: account.accAddress,
              destination_address: offBanxaValue.wallet_address,
            },
          })
        }
      } catch (error) {
        console.error('Banxa confirm error', error)
      }
    },
    [
      account,
      chainId,
      checkHWAddr,
      setShowAccount,
      updateHW,
      offBanxaValue,
      updateTransferBanxaData,
    ],
  )
  return {
    processRequestBanxaTransfer,
    chargeFeeTokenList,
    isFeeNotEnough,
    // setIsFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
  }
}
