import React from 'react'

import { AccountStep, NFTDepositProps, useOpenModals } from '@loopring-web/component-lib'
import {
  AccountStatus,
  CoinMap,
  DEAULT_NFTID_STRING,
  ErrorMap,
  ErrorType,
  globalSetup,
  IPFS_LOOPRING_SITE,
  myLog,
  SUBMIT_PANEL_AUTO_CLOSE,
  TradeNFT,
  UIERROR_CODE,
  WalletMap,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  useModalData,
  useSystem,
  useTokenMap,
  useAccount,
  useWalletLayer1,
  ActionResultCode,
  LoopringAPI,
  store,
  useBtnStatus,
  getIPFSString,
  depositServices,
  DepositCommands,
  BIGO,
} from '../../index'

import { connectProvides } from '@loopring-web/web3-provider'

import _ from 'lodash'
import { useOnChainInfo } from '../../stores/localStore/onchainHashInfo'
import { useHistory } from 'react-router-dom'

export const useNFTDeposit = <T extends TradeNFT<I, any>, I>(): {
  nftDepositProps: NFTDepositProps<T, I>
} => {
  const subject = React.useMemo(() => depositServices.onSocket(), [])

  const { tokenMap, totalCoinMap } = useTokenMap()
  const { account } = useAccount()
  const { exchangeInfo, chainId, gasPrice, baseURL } = useSystem()
  const [isNFTCheckLoading, setIsNFTCheckLoading] = React.useState(false)
  const { nftDepositValue, updateNFTDepositData, resetNFTDepositData } = useModalData()
  const { walletLayer1, updateWalletLayer1 } = useWalletLayer1()
  const { updateDepositHash } = useOnChainInfo()
  const history = useHistory()

  const {
    btnStatus,
    btnInfo,
    enableBtn,
    disableBtn,
    setLoadingBtn,
    setLabelAndParams,
    resetBtnInfo,
  } = useBtnStatus()

  const { setShowAccount, setShowNFTDeposit } = useOpenModals()

  const debounceCheck = _.debounce(
    async (data) => {
      const web3: any = connectProvides.usedWeb3
      if (LoopringAPI.nftAPI && exchangeInfo && web3) {
        setIsNFTCheckLoading(true)
        let [balance, meta, isApproved] = await Promise.all([
          LoopringAPI.nftAPI.getNFTBalance({
            account: account.accAddress,
            nftId: data.nftId,
            nftType: data.nftType as unknown as sdk.NFTType,
            web3,
            tokenAddress: data.tokenAddress,
          }),
          LoopringAPI.nftAPI.getContractNFTMeta(
            {
              _id: data.nftId,
              nftId: data.nftId,
              nftType: data.nftType as unknown as sdk.NFTType,
              web3,
              tokenAddress: data.tokenAddress,
            },
            IPFS_LOOPRING_SITE as any,
          ),
          LoopringAPI.nftAPI.isApprovedForAll({
            web3,
            from: account.accAddress,
            exchangeAddress: exchangeInfo.exchangeAddress,
            tokenAddress: data.tokenAddress,
            nftType: data.nftType as unknown as sdk.NFTType,
          }),
        ]).finally(() => {
          setIsNFTCheckLoading(() => false)
        })
        myLog('setIsNFTCheckLoading done', balance, meta, isApproved)

        const shouldUpdate = {
          ...data,
          nftId: data.nftId,
          name: meta.name ?? 'unknown NFT',
          image: meta?.image ?? '',
          description: meta.description ?? '',
          balance: Number(balance.count ?? 0),
          isApproved,
        }
        myLog('debounceCheck', shouldUpdate)
        updateNFTDepositData(shouldUpdate)
      }
    },
    globalSetup.wait,
    { trailing: true },
  )
  {
  }
  const handleOnNFTDataChange = async (data: T) => {
    const web3 = connectProvides.usedWeb3
    const nftDepositValue = store.getState()._router_modalData.nftDepositValue
    let shouldUpdate: any = {
      nftType: nftDepositValue.nftType ?? 0,
    }
    if (data.hasOwnProperty('tokenAddress')) {
      shouldUpdate = {
        ...shouldUpdate,
        tokenAddress: data.tokenAddress,
      }
    }
    if (data.hasOwnProperty('nftIdView') && web3) {
      let _nftId = nftDepositValue.nftId
      if (
        (data.nftId !== '' && (!data.nftIdView || !data.nftIdView?.trim())) ||
        (data.nftIdView && data.nftIdView.toLowerCase().startsWith('0x'))
      ) {
        _nftId = data.nftIdView ?? ''
      } else if (data.nftIdView !== undefined) {
        try {
          if (data.nftIdView === '') {
            _nftId = ''
            shouldUpdate.balance = ''
            shouldUpdate.tradeValue = undefined
          } else {
            _nftId = web3.utils.toHex(sdk.toBN(data.nftIdView) as any).replace('0x', '')
            const prev = DEAULT_NFTID_STRING.substring(
              0,
              DEAULT_NFTID_STRING.length - _nftId.toString().length,
            )
            _nftId = prev + _nftId.toString()
          }
        } catch (error: any) {
          const errorView: ErrorType = ErrorMap.NTF_ID_ENCODE_ERROR
          updateBtnStatus({ errorView, ...(error as any) })
          return
        }
      }
      shouldUpdate = {
        ...shouldUpdate,
        nftIdView: data.nftIdView,
        nftId: _nftId,
      }
    }
    if (data.hasOwnProperty('nftType')) {
      shouldUpdate = {
        ...shouldUpdate,
        nftType: data.nftType,
      }
    }
    if (data.hasOwnProperty('tradeValue')) {
      shouldUpdate = {
        ...shouldUpdate,
        tradeValue: data.tradeValue,
      }
    }
    if (
      (shouldUpdate.tokenAddress && shouldUpdate.tokenAddress !== nftDepositValue.tokenAddress) ||
      (shouldUpdate.nftIdView && shouldUpdate.nftIdView != nftDepositValue.nftIdView) ||
      (shouldUpdate.nftType !== undefined && shouldUpdate.nftType != nftDepositValue.nftType)
    ) {
      myLog('debounceCheck', debounceCheck)
      const obj = { ...nftDepositValue, ...shouldUpdate }
      if (
        obj.tokenAddress &&
        obj.nftId !== undefined &&
        obj.nftId !== '' &&
        obj.nftType !== undefined
      ) {
        debounceCheck(obj)
      }
    } else if (
      nftDepositValue.balance !== 0 &&
      (!nftDepositValue.tokenAddress ||
        !nftDepositValue.nftIdView ||
        nftDepositValue.nftType === undefined)
    ) {
      shouldUpdate = {
        ...shouldUpdate,
        description: '',
        image: '',
        name: '',
        balance: 0,
        isApproved: undefined,
      }
    }

    myLog('nftDepositValue', nftDepositValue, shouldUpdate)

    updateNFTDepositData({
      ...nftDepositValue,
      ...shouldUpdate,
    })
  }

  const onNFTDepositClick = React.useCallback(async () => {
    let result = { code: ActionResultCode.NoError }
    const nftDepositValue = store.getState()._router_modalData.nftDepositValue
    setLoadingBtn()

    try {
      if (
        account.readyState !== AccountStatus.UN_CONNECT &&
        nftDepositValue.tradeValue &&
        nftDepositValue.tokenAddress &&
        nftDepositValue.nftId &&
        tokenMap &&
        exchangeInfo?.exchangeAddress &&
        connectProvides.usedWeb3 &&
        LoopringAPI.nftAPI
      ) {
        const web3: any = connectProvides.usedWeb3;
        const gasLimit = undefined //parseInt(NFTGasAmounts.deposit) ?? undefined;
        const realGasPrice = gasPrice ?? 30
        enableBtn()
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTDeposit_WaitForAuth,
        })
        let nonce = (await sdk.getNonce(connectProvides.usedWeb3 as any, account.accAddress)) ?? 0
        if (!nftDepositValue.isApproved) {
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTDeposit_Approve_WaitForAuth,
          })
          try {
            await LoopringAPI.nftAPI.approveNFT({
              web3,
              from: account.accAddress,
              depositAddress: exchangeInfo?.exchangeAddress,
              tokenAddress: nftDepositValue.tokenAddress,
              nftId: nftDepositValue.nftId,
              gasPrice: realGasPrice,
              gasLimit,
              chainId: chainId as sdk.ChainId,
              nonce,
              nftType: nftDepositValue.nftType as unknown as sdk.NFTType,
              sendByMetaMask: true,
            })
          } catch (error: any) {
            if (error instanceof Error) {
              throw {
                // Pull all enumerable properties, supporting properties on custom Errors
                ...error,
                // Explicitly pull Error's non-enumerable properties
                message: error.message,
                stack: error.stack,
                type: 'ApproveToken',
              }
            } else {
              throw {
                ...(error as any),
                type: 'ApproveToken',
              }
            }
          }
          nonce += 1
        } else {
          myLog('NFT is Approved ALL at History')
        }
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTDeposit_WaitForAuth,
        })

        try {
          const response = await LoopringAPI.nftAPI.depositNFT({
            web3,
            from: account.accAddress,
            exchangeAddress: exchangeInfo?.exchangeAddress,
            tokenAddress: nftDepositValue.tokenAddress,
            nftId: nftDepositValue.nftId,
            amount: nftDepositValue.tradeValue,
            gasPrice: realGasPrice,
            gasLimit,
            chainId: chainId as sdk.ChainId,
            nonce,
            nftType: nftDepositValue.nftType as unknown as sdk.NFTType,
            sendByMetaMask: true,
          })
          handleOnNFTDataChange({ nftIdView: '', tokenAddress: '' } as T)
          updateWalletLayer1()
          resetNFTDepositData()
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTDeposit_Submit,
            info: {
              symbol: nftDepositValue?.name,
              value: nftDepositValue.tradeValue,
              hash: response.result,
            },
          })
          updateDepositHash(response.result, account.accAddress, undefined, {
            symbol: nftDepositValue.name,
            type: 'Deposit NFT',
            value: nftDepositValue.tradeValue,
          })
          myLog('response:', response)

          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step == AccountStep.NFTDeposit_Submit
          ) {
            setShowAccount({ isShow: false })
            history.push('/nft/assetsNFT')
          }
        } catch (error) {
          if (error instanceof Error) {
            throw {
              // Pull all enumerable properties, supporting properties on custom Errors
              ...error,
              // Explicitly pull Error's non-enumerable properties
              message: error.message,
              stack: error.stack,
              type: 'Deposit',
            }
          } else {
            throw {
              ...(error as any),
              type: 'Deposit',
            }
          }
        }
      } else {
        throw { code: UIERROR_CODE.DATA_NOT_READY }
      }
    } catch (e) {
      //deposit failed
      enableBtn()
      const { type, ..._error } = (e as any).message ? (e as any) : { type: '' }
      const error = LoopringAPI?.exchangeAPI?.genErr(_error as any) ?? {
        code: UIERROR_CODE.DATA_NOT_READY,
      }
      const code = sdk.checkErrorInfo(error, true)
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTDeposit_Approve_Denied,
      })
      myLog('---- deposit NFT ERROR reason:', _error?.message, code)

      switch (code) {
        case sdk.ConnectorError.USER_DENIED:
        case sdk.ConnectorError.USER_DENIED_2:
          if (type === 'ApproveToken') {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTDeposit_Approve_Denied,
            })
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTDeposit_Denied,
              info: {
                symbol: nftDepositValue?.name,
              },
            })
          }
          break
        default:
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTDeposit_Failed,
            info: {
              symbol: nftDepositValue?.name,
            },
            error: {
              ..._error,
              ...error,
              code: (e as any)?.code ?? UIERROR_CODE.UNKNOWN,
            },
          })
          break
      }
      updateWalletLayer1()
    }

    return result
  }, [
    account.accAddress,
    account.readyState,
    chainId,
    exchangeInfo?.exchangeAddress,
    gasPrice,
    nftDepositValue.isApproved,
    nftDepositValue.name,
    nftDepositValue.nftId,
    nftDepositValue.nftType,
    nftDepositValue.tokenAddress,
    nftDepositValue.tradeValue,
    resetNFTDepositData,
    setShowAccount,
    setShowNFTDeposit,
    tokenMap,
    updateDepositHash,
  ])

  const nftDepositProps: NFTDepositProps<T, I> = {
    handleOnNFTDataChange,
    getIPFSString,
    onNFTDepositClick,
    walletMap: walletLayer1 as WalletMap<any>,
    coinMap: totalCoinMap as CoinMap<any>,
    tradeData: nftDepositValue as T,
    nftDepositBtnStatus: btnStatus,
    isNFTCheckLoading,
    baseURL,
    btnInfo,
  }

  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo()
      myLog('updateBtnStatus', nftDepositValue)
      if (
        !error &&
        walletLayer1 &&
        nftDepositValue &&
        nftDepositValue.balance &&
        nftDepositValue.tradeValue &&
        sdk.toBig(walletLayer1?.ETH?.count ?? 0).gt(BIGO) &&
        sdk.toBig(nftDepositValue.tradeValue).gt(sdk.toBig(0)) &&
        sdk.toBig(nftDepositValue.tradeValue).lte(sdk.toBig(nftDepositValue?.balance ?? ''))
      ) {
        myLog('try to enable nftDeposit btn!', walletLayer1?.ETH?.count)
        enableBtn()
        if (!nftDepositValue.isApproved) {
          myLog('!!---> set labelNFTDepositNeedApprove!!!! belong:', nftDepositValue.tokenAddress)
          setLabelAndParams('labelNFTDepositNeedApprove', {
            symbol: nftDepositValue.name ?? 'unknown NFT',
          })
        }
      } else {
        if (sdk.toBig(walletLayer1?.ETH?.count ?? 0).eq(BIGO)) {
          setLabelAndParams('labelNOETH', {})
        }
        myLog('try to disable nftDeposit btn!')
        disableBtn()
      }
    },
    [resetBtnInfo, nftDepositValue, walletLayer1, enableBtn, setLabelAndParams, disableBtn],
  )
  React.useEffect(() => {
    updateBtnStatus()
  }, [
    nftDepositValue?.tokenAddress,
    nftDepositValue?.nftId,
    nftDepositValue?.nftType,
    nftDepositValue?.tradeValue,
    nftDepositValue?.balance,
    walletLayer1?.ETH?.count,
  ])
  React.useEffect(() => {
    updateWalletLayer1()
    const subscription = subject.subscribe((props) => {
      myLog('subscription Deposit DepsitNFT')
      switch (props.status) {
        case DepositCommands.DepsitNFT:
          onNFTDepositClick()
          break
        default:
          break
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [subject])
  return {
    nftDepositProps,
  }
}
