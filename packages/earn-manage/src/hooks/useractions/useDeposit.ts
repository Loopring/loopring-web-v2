import {
  useTokenMap,
  useAccount,
  useSystem,
  useModalData,
  useWalletLayer1,
  useBtnStatus,
  onchainHashInfo,
  LoopringAPI,
  store,
  callSwitchChain,
  useAllowances,
  BIGO,
} from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'

import { SwitchData, useOpenModals, useSettings } from '@loopring-web/component-lib'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { connectProvides } from '@loopring-web/web3-provider'
import Web3 from 'web3'
import {
  AccountStatus,
  SUBMIT_PANEL_AUTO_CLOSE,
  myLog,
  UIERROR_CODE,
  TRADE_TYPE,
  WalletMap,
  CoinMap,
  ErrorType,
  IBData,
  MapChainId,
} from '@loopring-web/common-resources'
import { AccountStepExtends } from '../../modal/AccountL1Modal/interface'
import _ from 'lodash'
import * as configDefault from '../../config/dualConfig.json'
import { makeWalletL1 } from '../common'

type DepositProps<T> = {}
export const useDeposit = <T extends IBData<string>>({ setShowDeposit, isShowDeposit }: any) => {
  const { tokenMap, totalCoinMap } = useTokenMap()
  const { account } = useAccount()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const { exchangeInfo, chainId, gasPrice, baseURL } = useSystem()
  const { depositValue, updateDepositData, resetDepositData } = useModalData()
  const { walletLayer1, updateWalletLayer1 } = useWalletLayer1()
  const { updateDepositHash } = onchainHashInfo.useOnChainInfo()
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
  const { setShowAccount } = useOpenModals()
  const { allowanceInfo } = useAllowances({
    owner: account.accAddress,
    symbol: depositValue.belong as string,
  })
  const handlePanelEvent = React.useCallback(
    (data: SwitchData<Partial<T>>, _switchType: 'Tomenu' | 'Tobutton') => {
      const oldValue = store.getState()._router_modalData.depositValue
      let newValue = {
        ...oldValue,
      }
      if (data.to === 'button') {
        if (walletLayer1 && data?.tradeData?.belong) {
          const walletInfo = walletLayer1[data.tradeData.belong]
          const tradeData = {
            ...data.tradeData,
            balance: walletInfo?.count,
          }
          newValue = {
            ...newValue,
            ...tradeData,
            tradeData,
          }
        }
      }
      updateDepositData({ ...newValue })
      return Promise.resolve()
    },
    [updateDepositData, walletLayer1],
  )
  const onDepositClick = React.useCallback(async () => {
    const web3 = connectProvides.usedWeb3
    const depositValue = store.getState()._router_modalData.depositValue
    setLoadingBtn()

    try {
      if (
        account.readyState !== AccountStatus.UN_CONNECT &&
        depositValue.tradeValue &&
        depositValue &&
        tokenMap
      ) {
        const tokenInfo = tokenMap[depositValue.belong ?? '']
        const web3 = connectProvides.usedWeb3 as unknown as Web3
        const gasLimit = parseInt(tokenInfo.gasAmounts.deposit)
        const realGasPrice = gasPrice ?? 30

        setShowAccount({
          isShow: true,
          step: AccountStepExtends.Deposit_sign,
        })

        const _chainId = await connectProvides?.usedWeb3?.eth?.getChainId()
        await callSwitchChain(_chainId as any)

        let nonce = 0

        let nonceInit = false

        if (allowanceInfo?.needCheck) {
          const curValInWei = sdk.toBig(depositValue.tradeValue).times('1e' + tokenInfo.decimals)

          if (curValInWei.gt(allowanceInfo.allowance)) {
            myLog(curValInWei, allowanceInfo.allowance, ' need approveMax!')

            setShowAccount({
              isShow: true,
              step: AccountStepExtends.Deposit_sign,
            })

            nonce = await sdk.getNonce(
              connectProvides.usedWeb3 as unknown as Web3,
              account.accAddress,
            )

            nonceInit = true

            try {
              await sdk.approveMax(
                connectProvides.usedWeb3,
                account.accAddress,
                tokenInfo.address,
                //TODO
                '0x', //contact address
                // exchangeInfo?.depositAddress,
                realGasPrice,
                gasLimit,
                _chainId,
                nonce,
              )
              nonce += 1
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
          } else {
            myLog("allowance is enough! don't need approveMax!")
          }
        }

        setShowAccount({
          isShow: true,
          step: AccountStepExtends.Deposit_sign,
        })

        try {
          //TODO write contract
          const response = { result: '' }
          // handleOnDataChange({ nftIdView: '', tokenAddress: '' } as T)
          updateWalletLayer1()
          resetDepositData()
          setShowAccount({
            isShow: true,
            step: AccountStepExtends.Deposit_Processing,
          })
          updateDepositHash(response?.result, account.accAddress, undefined, {
            symbol: depositValue.belong,
            type: 'Deposit',
            value: depositValue.tradeValue,
          })
          myLog('response:', response)

          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step == AccountStepExtends.Deposit_Processing
          ) {
            setShowAccount({ isShow: false })
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
        step: AccountStepExtends.Deposit_failed,
      })
      myLog('---- deposit NFT ERROR reason:', _error?.message, code)

      switch (code) {
        case sdk.ConnectorError.USER_DENIED:
        case sdk.ConnectorError.USER_DENIED_2:
          if (type === 'ApproveToken') {
            setShowAccount({
              isShow: true,
              step: AccountStepExtends.Deposit_failed,
            })
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStepExtends.Deposit_failed,
            })
          }
          break
        default:
          setShowAccount({
            isShow: true,
            step: AccountStepExtends.Deposit_failed,
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

    return
  }, [
    account.accAddress,
    account.readyState,
    chainId,
    exchangeInfo?.exchangeAddress,
    gasPrice,

    setShowAccount,
    tokenMap,
    updateDepositHash,
  ])

  const depositProps: DepositProps<T> = {
    type: TRADE_TYPE.TOKEN,
    handlePanelEvent,
    onDepositClick,
    walletMap: makeWalletL1(),
    coinMap: totalCoinMap as CoinMap<any>,
    tradeData: depositValue as T,
    btnStatus: btnStatus,
    baseURL,
    btnInfo,
  }

  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo()
      myLog('updateBtnStatus', depositValue)
      if (
        !error &&
        walletLayer1 &&
        depositValue &&
        depositValue.balance &&
        depositValue.tradeValue &&
        configDefault[network].GasSymbol &&
        walletLayer1 &&
        sdk.toBig(walletLayer1[configDefault[network].GasSymbol]?.count ?? 0).gt(BIGO) &&
        sdk.toBig(depositValue.tradeValue).gt(sdk.toBig(0)) &&
        sdk.toBig(depositValue.tradeValue).lte(sdk.toBig(depositValue?.balance ?? ''))
      ) {
        myLog('try to enable deposit btn!', walletLayer1[configDefault[network].GasSymbol]?.count)
        enableBtn()
      } else {
        if (sdk.toBig(walletLayer1?.ETH?.count ?? 0).eq(BIGO)) {
          setLabelAndParams('labelNOETH', {})
        }
        myLog('try to disable deposit btn!')
        disableBtn()
      }
    },
    [resetBtnInfo, depositValue, walletLayer1, enableBtn, setLabelAndParams, disableBtn],
  )
  React.useEffect(() => {
    const initSymbol = configDefault[network].GasSymbol ?? 'ETH'
    if (isShowDeposit?.isShow) {
      handlePanelEvent(
        {
          to: 'button',
          tradeData: {
            belong: (isShowDeposit?.info?.symbol ?? initSymbol) as any,
            tradeValue: undefined,
            balance: 0,
            // count:
          },
        },
        'Tobutton',
      )
    } else {
      resetDepositData()
    }
  }, [isShowDeposit?.isShow])
  React.useEffect(() => {
    updateBtnStatus()
  }, [depositValue.belong, depositValue.tradeValue, network, configDefault[network]?.GasSymbol])

  return {
    ...depositProps,
  }
}
