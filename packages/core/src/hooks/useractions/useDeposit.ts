import React from 'react'

import {
  AccountStep,
  DepositProps,
  SwitchData,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  AddressError,
  CoinMap,
  IBData,
  L1_UPDATE,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  SagaStatus,
  SUBMIT_PANEL_AUTO_CLOSE,
  TRADE_TYPE,
  UIERROR_CODE,
  WalletMap,
} from '@loopring-web/common-resources'
import { connectProvides } from '@loopring-web/web3-provider'

import * as sdk from '@loopring-web/loopring-sdk'
import {
  ActionResultCode,
  BIGO,
  callSwitchChain,
  DepositCommands,
  depositServices,
  LoopringAPI,
  store,
  useAccount,
  useAddressCheck,
  useAllowances,
  useBtnStatus,
  useModalData,
  useSystem,
  useTokenMap,
  useWalletLayer1,
  useWalletLayer2,
} from '../../index'
import { useTranslation } from 'react-i18next'
import { useOnChainInfo } from '../../stores/localStore/onchainHashInfo'
import Web3 from 'web3'

export const useDeposit = <
  T extends {
    toAddress?: string
    addressError?: { error: boolean; message?: string }
  } & IBData<I>,
  I,
>(
  isAllowInputToAddress = false,
  opts?: { token?: string | null; owner?: string | null },
) => {
  const subject = React.useMemo(() => depositServices.onSocket(), [])
  const { tokenMap, totalCoinMap } = useTokenMap()
  const { account, status: accountStatus, updateAccount } = useAccount()
  const { walletLayer1, updateWalletLayer1, status: walletLayer1Status } = useWalletLayer1()
  const { updateWalletLayer2 } = useWalletLayer2()
  const { updateDepositHash } = useOnChainInfo()
  const { t } = useTranslation('common')
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)
  const [isToAddressEditable, setIsToAddressEditable] = React.useState(false)
  const { exchangeInfo, chainId, gasPrice, allowTrade, baseURL, status: systemStatus, app } = useSystem()
  const { defaultNetwork } = useSettings()

  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const [toInputAddress, setToInputAddress] = React.useState<string>('')
  const {
    depositValue,
    updateDepositData,
    resetDepositData,
    activeAccountValue: { chargeFeeList },
  } = useModalData()
  const {
    // address: toAddress,
    realAddr: realToAddress,
    setAddress: setToAddress,
    addrStatus: toAddressStatus,
    isAddressCheckLoading: toIsAddressCheckLoading,
  } = useAddressCheck()

  React.useEffect(() => {
    const depositValue = store.getState()._router_modalData.depositValue
    handlePanelEvent(
      {
        to: 'button',
        tradeData: depositValue as any,
      },
      'Tobutton',
    )
  }, [realToAddress])

  const {
    modals: {
      isShowDeposit: { symbol, isShow },
    },
    setShowDeposit,
    setShowAccount,
  } = useOpenModals()

  React.useEffect(() => {
    if(!isShow) {
      const oldValue = store.getState()._router_modalData.depositValue
      let newValue = {
        ...oldValue,
        tradeValue: undefined
      }
      updateDepositData({ ...newValue })
    }
  }, [isShow])

  const {
    btnStatus,
    btnInfo,
    enableBtn,
    // setLoadingBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
  } = useBtnStatus()

  const { allowanceInfo } = useAllowances({
    owner: account.accAddress,
    symbol: depositValue.belong as string,
  })
  const isNewAccount = [AccountStatus.NO_ACCOUNT, AccountStatus.NOT_ACTIVE].includes(
    account.readyState as any,
  )
  const updateBtnStatus = React.useCallback(() => {
    resetBtnInfo()
    if (
      realToAddress &&
      (toAddressStatus as AddressError) === AddressError.NoError &&
      depositValue?.toAddress?.trim() !== '' &&
      depositValue.toAddress == realToAddress &&
      depositValue.belong === allowanceInfo?.tokenInfo.symbol &&
      depositValue?.tradeValue &&
      allowanceInfo &&
      sdk.toBig(walletLayer1?.ETH?.count ?? 0).gt(BIGO) &&
      sdk.toBig(depositValue?.tradeValue).gt(BIGO) &&
      sdk.toBig(depositValue?.tradeValue).lte(sdk.toBig(depositValue?.balance ?? ''))
    ) {
      myLog('walletLayer1?.ETH?.count', walletLayer1?.ETH?.count)

      const curValInWei = sdk
        .toBig(depositValue?.tradeValue)
        .times('1e' + allowanceInfo?.tokenInfo.decimals)
      if (allowanceInfo.needCheck && curValInWei.gt(allowanceInfo.allowance)) {
        myLog('!!---> set labelL1toL2NeedApprove!!!! belong:', depositValue.belong)
        setLabelAndParams('labelL1toL2NeedApprove', {
          symbol: depositValue.belong as string,
        })
      }

      // NewAccountCheck
      const index = chargeFeeList?.findIndex(({ belong }) => belong === depositValue.belong) ?? -1
      if (
        isAllowInputToAddress ||
        (isNewAccount && (index !== -1 || /dev|uat/gi.test(baseURL))) ||
        !isNewAccount
      ) {
        enableBtn()
        return
      }
    }
    myLog('try to disable deposit btn!')
    if (sdk.toBig(walletLayer1?.ETH?.count ?? 0).eq(BIGO)) {
      setLabelAndParams('labelNOETH', {})
    }
    disableBtn()
  }, [
    resetBtnInfo,
    isAllowInputToAddress,
    realToAddress,
    toAddressStatus,
    depositValue.toAddress,
    depositValue.belong,
    depositValue?.tradeValue,
    depositValue?.balance,
    allowanceInfo,
    walletLayer1?.ETH?.count,
    disableBtn,
    chargeFeeList,
    isNewAccount,
    setLabelAndParams,
    enableBtn,
    // account?.readyState,
    opts?.owner,
  ])

  React.useEffect(() => {
    updateBtnStatus()
  }, [
    depositValue?.belong,
    depositValue?.tradeValue,
    depositValue?.balance,
    depositValue.toAddress,
    allowanceInfo?.tokenInfo.symbol,
    toAddressStatus,
    realToAddress,
    toIsAddressCheckLoading,
    walletLayer1?.ETH?.count,
  ])

  const handlePanelEvent = React.useCallback(
    (data: SwitchData<Partial<T>>, _switchType: 'Tomenu' | 'Tobutton') => {
      const oldValue = store.getState()._router_modalData.depositValue
      let newValue = {
        ...oldValue,
      }
      if (data.to === 'button') {
        if (walletLayer1 && data?.tradeData?.belong) {
          const walletInfo = walletLayer1[data.tradeData.belong]
          newValue = {
            ...newValue,
            ...data.tradeData,
            balance: walletInfo?.count,
          }
        }
      }

      // myLog('DepositData', {...newValue, toAddress: realToAddress})
      updateDepositData({ ...newValue, toAddress: realToAddress })
      return Promise.resolve()
    },
    [setToAddress, updateDepositData, realToAddress, isToAddressEditable, walletLayer1],
  )
  const handleAddressChange = (value?: string) => {
    const toAddress = store.getState()._router_modalData.depositValue.toAddress
    if (isToAddressEditable == false && opts?.owner && opts.owner !== '') {
      value = opts.owner
    }
    const makeForceFresh = (state: string, value: string) => {
      if (value === state) {
        sdk.sleep(0).then(() => {
          setToAddress(state)
        })
        return ''
      } else {
        return value
      }
    }
    setToAddress((state) => {
      // myLog('address update setToAddress', state, value, realToAddress, toAddressStatus)
      if (
        value &&
        toIsAddressCheckLoading == false &&
        realToAddress &&
        realToAddress.startsWith('0x') &&
        [value, toAddress].includes(realToAddress)
      ) {
        return makeForceFresh(state, value)
      } else if (value !== undefined) {
        setToInputAddress(value)
        return makeForceFresh(state, value)
      } else if (toInputAddress !== '') {
        return makeForceFresh(state, toInputAddress)
      } else if (toIsAddressCheckLoading == false) {
        return makeForceFresh(state, state)
      } else {
        return state
      }
    })
  }
  const handleClear = React.useCallback(() => {
    if (isAllowInputToAddress && !isToAddressEditable) {
      return
    }
    handleAddressChange('')
  }, [isAllowInputToAddress, isToAddressEditable])

  const walletLayer1Callback = React.useCallback(() => {
    // const {
    //   _router_modalData: { depositValue },
    // } = store.getState()
    let updateData = {} // = { ...depositValue }
    if (nodeTimer.current !== -1) {
      clearTimeout(nodeTimer.current)
    }
    if (!depositValue.belong && walletLayer1) {
      const keys = Reflect.ownKeys(walletLayer1)
      updateData = {
        belong: 'ETH',
        tradeValue: undefined,
        balance: 0,
      }
      for (var key in keys) {
        const keyVal = keys[key] as any
        const walletInfo = walletLayer1[keyVal]
        if (sdk.toBig(walletInfo?.count ?? 0).gt(0)) {
          updateData = {
            // ...updateData,
            belong: keyVal as any,
            tradeValue: undefined,
            balance: walletInfo?.count,
          }
          break
        }
      }
    } else if (depositValue.belong && walletLayer1) {
      updateData = {
        // ...updateData,
        belong: depositValue.belong,
        balance: walletLayer1[depositValue.belong]?.count ?? 0,
      }
    }
    if (isAllowInputToAddress && !(opts?.owner && opts?.owner?.startsWith('0x'))) {
      setIsToAddressEditable(true)
    }
    handlePanelEvent(
      {
        to: 'button',
        tradeData: updateData as any,
      },
      'Tobutton',
    )
    handleAddressChange()
  }, [
    depositValue.belong,
    depositValue.tradeValue,
    opts?.token,
    opts?.owner,
    symbol,
    walletLayer1,
    isAllowInputToAddress,
    handlePanelEvent,
    account.accAddress,
    handleClear,
  ])

  React.useEffect(() => {
    const { walletLayer1 } = store.getState()
    if (walletLayer1Status == SagaStatus.UNSET) {
      if (
        walletLayer1.error
        // &&
        // ![AccountStatus.UN_CONNECT, AccountStatus.ERROR_NETWORK, 'unknown'].includes(
        //   account.readyState,
        // )
      ) {
        updateWalletLayer1()
      } else {
        walletLayer1Callback()
      }
    }
  }, [walletLayer1Status])

  const init = () => {
    if (chainId === defaultNetwork && baseURL) {
      let tradeData: any = {
        belong: opts?.token?.toUpperCase() ?? symbol,
        tradeValue: !isShow ? undefined : depositValue.tradeValue,
      }
      updateWalletLayer1()
      handleAddressChange()

      handlePanelEvent(
        {
          to: 'button',
          tradeData: {
            ...tradeData,
          } as any,
        },
        'Tobutton',
      )
    }
  }
  React.useEffect(() => {
    // myLog('accountStatus,LoopringAPI?.__chainId__', LoopringAPI?.__chainId__, accountStatus)
    if (accountStatus === SagaStatus.UNSET && systemStatus === SagaStatus.UNSET) {
      init()
      if (isShow || isAllowInputToAddress) {
        nodeTimer.current = setTimeout(() => {
          updateWalletLayer1()
        }, L1_UPDATE)
      }
    }
    return () => {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current)
      }
    }
  }, [accountStatus, isShow, isToAddressEditable, systemStatus])

  const handleDeposit = React.useCallback(
    async (inputValue: any) => {
      myLog('handleDeposit:', inputValue)
      const { readyState, connectName } = account
      let result = { code: ActionResultCode.NoError }
      const { toAddress } = store.getState()._router_modalData.depositValue
      try {
        if (
          readyState !== AccountStatus.UN_CONNECT &&
          inputValue.tradeValue &&
          tokenMap &&
          exchangeInfo?.exchangeAddress &&
          connectProvides.usedWeb3 &&
          LoopringAPI.exchangeAPI &&
          toAddress
        ) {
          const tokenInfo = tokenMap[inputValue.belong]
          const gasLimit = '0x' + parseInt(tokenInfo.gasAmounts.deposit).toString(16)
          const fee = 0
          const isMetaMask = true

          const realGasPrice = gasPrice ?? 30

          const _chainId = await connectProvides?.usedWeb3?.eth?.getChainId()
          //chainId === 'unknown' ? sdk.ChainId.MAINNET : chainId
          await callSwitchChain(_chainId)

          let nonce = 0

          let nonceInit = false

          if (allowanceInfo?.needCheck) {
            const curValInWei = sdk.toBig(inputValue.tradeValue).times('1e' + tokenInfo.decimals)

            if (curValInWei.gt(allowanceInfo.allowance)) {
              myLog(curValInWei, allowanceInfo.allowance, ' need approveMax!')

              setShowAccount({
                isShow: true,
                step: AccountStep.Deposit_Approve_WaitForAuth,
                info: {
                  isAllowInputToAddress,
                },
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
                  exchangeInfo?.depositAddress,
                  realGasPrice,
                  gasLimit,
                  _chainId,
                  '0x' + nonce.toString(16),
                  isMetaMask,
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
            step: AccountStep.Deposit_WaitForAuth,
            info: {
              to: isAllowInputToAddress ? realToAddress : null,
              isAllowInputToAddress,
            },
          })

          if (!nonceInit) {
            nonce = await sdk.getNonce(
              connectProvides.usedWeb3 as unknown as Web3,
              account.accAddress,
            )
          }

          myLog('before deposit:', chainId, connectName, isMetaMask)

          // const realChainId = chainId === 'unknown' ? 1 : chainId
          let response
          try {
            //response = { result: "xxxxxxxx" };
            response = await sdk.deposit(
              connectProvides.usedWeb3,
              account.accAddress,
              exchangeInfo.exchangeAddress,
              tokenInfo,
              inputValue.tradeValue,
              fee,
              realGasPrice,
              gasLimit,
              _chainId,
              '0x' + nonce.toString(16),
              isMetaMask,
              toAddress,
            )
          } catch (error) {
            if (error instanceof Error) {
              throw {
                ...error,
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

          myLog('response:', response)

          if (response) {
            // Close Deposit panel...
            setShowDeposit({ isShow: false })
            resetDepositData()
            updateWalletLayer1()
            setShowAccount({
              isShow: true,
              info: {
                to: isAllowInputToAddress ? realToAddress : null,
                symbol: tokenInfo.symbol,
                value: inputValue.tradeValue,
                hash: response.result,
                isAllowInputToAddress,
                isNewAccount,
              },
              step: AccountStep.Deposit_Submit,
            })
            updateDepositHash(response.result, account.accAddress, undefined, {
              symbol: tokenInfo.symbol,
              type: 'Deposit',
              value: inputValue.tradeValue,
            })
            await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
            if (
              store.getState().modals.isShowAccount.isShow &&
              store.getState().modals.isShowAccount.step == AccountStep.Deposit_Submit
            ) {
              setShowAccount({ isShow: false })
            }
            if (account.readyState === 'NO_ACCOUNT') {
              const timer = setInterval(() => {
                LoopringAPI.exchangeAPI?.getAccount({
                  owner: account.accAddress,
                }).then(acc => {
                  if (acc.accInfo.accountId > 0) {
                    updateAccount({ 
                      _accountIdNotActive : acc.accInfo.accountId,
                      readyState: 'NOT_ACTIVE',
                    })
                    updateWalletLayer2()
                    clearInterval(timer)
                  }
                })
              }, 5 * 1000);
            }
            
          } else {
            throw { code: UIERROR_CODE.ERROR_NO_RESPONSE }
          }
        } else {
          throw { code: UIERROR_CODE.DATA_NOT_READY }
        }
      } catch (e) {
        const { type, ..._error } = (e as any)?.message ? (e as any) : { type: '' }
        const error = LoopringAPI?.exchangeAPI?.genErr(_error as any) ?? {
          code: UIERROR_CODE.DATA_NOT_READY,
        }
        const code = sdk.checkErrorInfo(error, true)
        switch (code) {
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            if (type === 'ApproveToken') {
              setShowAccount({
                isShow: true,
                step: AccountStep.Deposit_Approve_Denied,
                info: {
                  isAllowInputToAddress,
                },
              })
            } else {
              setShowAccount({
                isShow: true,
                step: AccountStep.Deposit_Denied,
                info: {
                  isAllowInputToAddress,
                },
              })
            }
            break
          default:
            setShowAccount({
              isShow: true,
              step: AccountStep.Deposit_Failed,
              info: {
                isAllowInputToAddress,
              },
              error: {
                ..._error,
                ...error,
                code: (e as any)?.code ?? UIERROR_CODE.UNKNOWN,
              },
            })
            resetDepositData()
            break
        }
        updateWalletLayer1()
      }

      return result
    },
    [
      isNewAccount,
      account,
      tokenMap,
      exchangeInfo?.exchangeAddress,
      exchangeInfo?.depositAddress,
      isAllowInputToAddress,
      setShowAccount,
      gasPrice,
      chainId,
      allowanceInfo?.needCheck,
      allowanceInfo?.allowance,
      realToAddress,
      updateWalletLayer1,
      resetDepositData,
      updateDepositHash,
    ],
  )

  const onDepositClick = React.useCallback(async () => {
    // setLoadingBtn();
    const depositValue = store.getState()._router_modalData.depositValue
    myLog('onDepositClick depositValue:', depositValue)

    if (depositValue && depositValue.belong) {
      // enableBtn();
      await handleDeposit(depositValue as T)
    }
  }, [depositValue, handleDeposit])

  React.useEffect(() => {
    const subscription = subject.subscribe((props) => {
      myLog('subscription Deposit DepsitERC20')

      switch (props.status) {
        case DepositCommands.DepsitERC20:
          onDepositClick()
          break
        default:
          break
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [subject, accountStatus, systemStatus])

  const title =
    app === 'earn'
      ? 'labelDeposit'
      : account.readyState === AccountStatus.NO_ACCOUNT
      ? t('labelDepositTitleAndActive', { l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol })
      : t('labelDepositTitle', { l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol })
  const depositProps: DepositProps<T, I> = {
    btnInfo,
    isNewAccount,
    title,
    type: TRADE_TYPE.TOKEN,
    handleClear,
    allowTrade,
    isAllowInputToAddress,
    chargeFeeTokenList: chargeFeeList ?? [],
    tradeData: depositValue as T,
    coinMap: totalCoinMap as CoinMap<any>,
    walletMap: walletLayer1 as WalletMap<any>,
    depositBtnStatus: btnStatus,
    handlePanelEvent,
    handleAddressChange,
    onDepositClick,
    toAddressStatus,
    toIsAddressCheckLoading,
    toAddress: toInputAddress,
    realToAddress: depositValue.toAddress,
    isToAddressEditable,
  }
  console.log('depositProps', depositProps)

  return {
    depositProps,
  }
}
