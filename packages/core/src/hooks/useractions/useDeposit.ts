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
import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'

import * as sdk from '@loopring-web/loopring-sdk'
import {
  ActionResultCode,
  BIGO,
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
} from '../../index'
import { useTranslation } from 'react-i18next'
import { useOnChainInfo } from '../../stores/localStore/onchainHashInfo'

export const useDeposit = <
  T extends {
    referAddress?: string
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
  const { account } = useAccount()
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)
  const [isToAddressEditable, setIsToAddressEditable] = React.useState(false)
  const { exchangeInfo, chainId, gasPrice, allowTrade, baseURL } = useSystem()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const {
    realAddr: realToAddress,
    setAddress: setToAddress,
    addrStatus: toAddressStatus,
    isAddressCheckLoading: toIsAddressCheckLoading,
  } = useAddressCheck()
  const {
    realAddr: realReferAddress,
    setAddress: setReferAddress,
    addrStatus: referStatus,
    isLoopringAddress: referIsLoopringAddress,
    isAddressCheckLoading: referIsAddressCheckLoading,
  } = useAddressCheck()

  const {
    depositValue,
    updateDepositData,
    resetDepositData,
    activeAccountValue: { chargeFeeList },
  } = useModalData()
  const {
    modals: {
      isShowDeposit: { symbol, isShow },
    },
    setShowDeposit,
    setShowAccount,
  } = useOpenModals()

  const { walletLayer1, updateWalletLayer1, status: walletLayer1Status } = useWalletLayer1()

  const { updateDepositHash } = useOnChainInfo()
  const { t } = useTranslation('common')
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
      (!isAllowInputToAddress || //toIsLoopringAddress &&
        (((realToAddress && (toAddressStatus as AddressError) === AddressError.NoError) ||
          (opts?.owner && opts?.owner.startsWith('0x') && !depositValue.addressError)) &&
          !!depositValue.toAddress &&
          depositValue.toAddress.trim() !== '')) &&
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
    async (data: SwitchData<Partial<T>>, _switchType: 'Tomenu' | 'Tobutton') => {
      const oldValue = store.getState()._router_modalData.depositValue

      let newValue = {
        ...oldValue,
      }
      if (data?.tradeData.hasOwnProperty('referAddress')) {
        newValue.referAddress = data?.tradeData.referAddress
        setReferAddress(newValue.referAddress ?? '')
      }
      if (data?.tradeData.hasOwnProperty('toAddress')) {
        newValue.toAddress = data?.tradeData.toAddress
        setToAddress(newValue.toAddress ?? '')
      }
      if (data?.tradeData.hasOwnProperty('addressError')) {
        newValue.addressError = data?.tradeData.addressError
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
      updateDepositData(newValue)
      return Promise.resolve()

      // return new Promise<void>((resolve) => {
      //
      //   resolve();
      // });
    },
    [setReferAddress, setToAddress, updateDepositData, walletLayer1],
  )
  const handleClear = React.useCallback(() => {
    if (isAllowInputToAddress && !isToAddressEditable) {
      return
    }
    handlePanelEvent(
      {
        to: 'button',
        tradeData: {
          referAddress: undefined,
          toAddress: undefined,
          addressError: undefined,
        } as T,
      },
      'Tobutton',
    )
  }, [handlePanelEvent, isAllowInputToAddress, isToAddressEditable])

  const walletLayer1Callback = React.useCallback(
    (isClean?: boolean) => {
      const _symbol = isClean ? opts?.token?.toUpperCase() ?? symbol : depositValue.belong
      const tradeValue = isClean ? undefined : depositValue.tradeValue
      let updateData = {}
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current)
      }
      nodeTimer.current = setTimeout(() => {
        if (store.getState().modals.isShowDeposit.isShow || isAllowInputToAddress) {
          updateWalletLayer1()
        }
      }, L1_UPDATE)
      if (_symbol && walletLayer1) {
        // updateDepositData();
        updateData = {
          belong: _symbol as any,
          balance: walletLayer1[_symbol]?.count ?? 0,
          tradeValue,
        }
      } else if (!depositValue.belong && walletLayer1) {
        const keys = Reflect.ownKeys(walletLayer1)
        for (var key in keys) {
          const keyVal = keys[key] as any
          const walletInfo = walletLayer1[keyVal]
          if (sdk.toBig(walletInfo?.count ?? 0).gt(0)) {
            // updateDepositData();
            updateData = {
              belong: keyVal as any,
              tradeValue: undefined,
              balance: walletInfo?.count,
            }
            break
          }
        }
      } else if (depositValue.belong && walletLayer1) {
        updateData = {
          belong: depositValue.belong,
          balance: walletLayer1[depositValue.belong]?.count ?? 0,
          tradeValue,
        }
      }

      if (isAllowInputToAddress) {
        if (opts?.owner) {
          updateData = {
            ...updateData,
            toAddress: opts?.owner?.toLowerCase(),
            addressError: undefined,
          } as T
          // setToAddress(opts?.owner?.toLowerCase());
          setIsToAddressEditable(false)
        } else {
          setIsToAddressEditable(true)
        }
      }
      handlePanelEvent(
        {
          to: 'button',
          tradeData: updateData,
        },
        'Tobutton',
      )
    },
    [
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
    ],
  )

  React.useEffect(() => {
    if (walletLayer1Status == SagaStatus.UNSET) {
      walletLayer1Callback()
    }
    return () => {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current)
      }
    }
  }, [walletLayer1Status])

  React.useEffect(() => {
    if (isShow || isAllowInputToAddress) {
      walletLayer1Callback(true)
      updateWalletLayer1()
    }
  }, [isShow, isAllowInputToAddress])

  const signRefer = React.useCallback(async () => {
    if (
      referIsLoopringAddress &&
      realReferAddress &&
      LoopringAPI.exchangeAPI &&
      LoopringAPI.userAPI &&
      exchangeInfo
    ) {
      try {
        const refAccount = await LoopringAPI.exchangeAPI.getAccount({
          owner: realReferAddress,
        })
        if (
          (refAccount &&
            ((refAccount as sdk.RESULT_INFO).code || (refAccount as sdk.RESULT_INFO).message)) ||
          (refAccount.accInfo && !refAccount.accInfo?.accountId)
        ) {
          return
        }
        // const referId = refAccount.accInfo?.accountId;
        let keySeed = sdk.GlobalAPI.KEY_MESSAGE.replace(
          '${exchangeAddress}',
          exchangeInfo.exchangeAddress,
        ).replace('${nonce}', '0')
        const eddsaKey = await sdk.generateKeyPair({
          web3: connectProvides.usedWeb3,
          address: account.accAddress,
          keySeed,
          walletType: (ConnectProviders[account.connectName] ??
            account.connectName) as unknown as sdk.ConnectorNames,
          chainId: chainId as any,
          accountId: account.accountId,
        })

        const response = await LoopringAPI.userAPI.SetReferrer(
          {
            address: account.accAddress,
            referrer: refAccount.accInfo.accountId,
            publicKeyX: eddsaKey.formatedPx,
            publicKeyY: eddsaKey.formatedPy,
          },
          eddsaKey.sk,
        )
        myLog('setRefer generateKeyPair!!! referId:', refAccount.accInfo.accountId, response)
      } catch (reason: any) {
        sdk.dumpError400(reason)
      }
    }
  }, [
    account.accAddress,
    account.accountId,
    account.connectName,
    chainId,
    exchangeInfo,
    realReferAddress,
    referIsLoopringAddress,
  ])

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
          const gasLimit = parseInt(tokenInfo.gasAmounts.deposit)
          const fee = 0
          const isMetaMask = true

          const realGasPrice = gasPrice ?? 30

          const _chainId = chainId === 'unknown' ? sdk.ChainId.MAINNET : chainId

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

              nonce = await sdk.getNonce(connectProvides.usedWeb3, account.accAddress)

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
                  nonce,
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
            nonce = await sdk.getNonce(connectProvides.usedWeb3, account.accAddress)
          }

          myLog('before deposit:', chainId, connectName, isMetaMask)

          const realChainId = chainId === 'unknown' ? 1 : chainId
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
              realChainId,
              nonce,
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
      signRefer,
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

  const handleAddressError = React.useCallback(() => {
    if (
      referStatus &&
      ((referStatus as AddressError) !== AddressError.NoError || !referIsLoopringAddress)
    ) {
      handlePanelEvent(
        {
          to: 'button',
          tradeData: {
            addressError: {
              error: true,
              message: !referIsLoopringAddress ? 'Not Loopring L2' : 'Invalid Address',
            },
          } as T,
        },
        'Tobutton',
      )
    } else if (toAddressStatus && (toAddressStatus as AddressError) !== AddressError.NoError) {
      handlePanelEvent(
        {
          to: 'button',
          tradeData: {
            addressError: {
              error: true,
              message: 'Invalid Address',
            },
          } as T,
        },
        'Tobutton',
      )
    } else {
      handlePanelEvent(
        {
          to: 'button',
          tradeData: {
            addressError: undefined,
          } as T,
        },
        'Tobutton',
      )
    }
  }, [referStatus, referIsLoopringAddress, toAddressStatus, handlePanelEvent])
  React.useEffect(() => {
    handleAddressError()
  }, [referStatus, toAddressStatus])
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
  }, [subject])

  const title =
    account.readyState === AccountStatus.NO_ACCOUNT
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
    onDepositClick,
    toAddressStatus,
    toIsAddressCheckLoading,
    // toIsLoopringAddress,
    realToAddress: depositValue.toAddress,
    referIsAddressCheckLoading,
    referIsLoopringAddress,
    realReferAddress,
    referStatus,
    isToAddressEditable,
  }

  return {
    depositProps,
  }
}
