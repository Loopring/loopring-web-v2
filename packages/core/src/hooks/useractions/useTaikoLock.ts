import React, { useEffect, useState } from 'react'
import {
  AccountStep,
  ToastType,
  useOpenModals,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  CustomErrorWithCode,
  DeFiSideCalcData,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_QUICK_AUTO_CLOSE,
  TradeBtnStatus,
  TradeStake,
} from '@loopring-web/common-resources'

import {
  accountServices,
  calcSideStaking,
  erc20ABI,
  fiatNumberDisplay,
  getStateFnState,
  getTimestampDaysLater,
  isNumberStr,
  numberFormat,
  numberFormatThousandthPlace,
  strNumDecimalPlacesLessThan,
  taikoDepositABI,
  unlockAccount,
  useStakingMap,
  useUpdateAccount,
  useWalletLayer2Socket,
} from '@loopring-web/core'
import _ from 'lodash'

import * as sdk from '@loopring-web/loopring-sdk'

import {
  LoopringAPI,
  store,
  useAccount,
  useSystem,
  useTokenMap,
  walletLayer2Service,
} from '../../index'
import { useTranslation } from 'react-i18next'
import { useTokenPrices, useTradeStake, useWalletLayer2, WalletLayer1Map } from '../../stores'
import Decimal from 'decimal.js'
import { BigNumber, Contract, providers, utils } from 'ethers'
import moment from 'moment'
import { useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { updateAccountStatus } from '../../stores/account/reducer'
import { useDispatch } from 'react-redux'

const depositContractAddrTAIKOHEKLA = '0x40aCCf1a13f4960AC00800Dd6A4afE82509C2fD2'
const depositContractAddrTAIKO = '0xaD32A362645Ac9139CFb5Ba3A2A46fC4c378812B'

const depositTaikoWithDurationApprove = async (input: {
  provider: providers.Web3Provider
  amount: BigNumber
  duration: BigNumber
  taikoAddress: string
  from: string
  to: string
  chainId: sdk.ChainId
  approveToAddress: string
}) => {
  const { provider, amount, duration, taikoAddress, from, to, chainId, approveToAddress } = input
  const signer = provider.getSigner()
  const tokenContract = new Contract(taikoAddress, erc20ABI, signer)
  const allowance = await tokenContract.allowance(from, approveToAddress)
  if (allowance.lt(amount)) {
    const approveTx = await tokenContract.approve(approveToAddress, amount)
    await approveTx.wait()
  }
}
const depositTaikoWithDuration = async (input: {
  provider: providers.Web3Provider
  amount: BigNumber
  duration: BigNumber
  taikoAddress: string
  from: string
  to: string
  chainId: sdk.ChainId
  approveToAddress: string
}) => {
  const { provider, amount, duration, taikoAddress, from, to, chainId, approveToAddress } = input
  const depositContractAddr =
    chainId === sdk.ChainId.TAIKO ? depositContractAddrTAIKO : depositContractAddrTAIKOHEKLA
  const signer = provider.getSigner()
  const contract = new Contract(depositContractAddr, taikoDepositABI, signer)
  const tx = await contract.deposit(from, to, taikoAddress, amount, duration, '0x')
  return tx.wait()
}
const depositTaikoWithDurationTx = async (input: {
  provider: providers.Web3Provider
  amount: BigNumber
  duration: BigNumber
  taikoAddress: string
  from: string
  to: string
  chainId: sdk.ChainId
  approveToAddress: string
}) => {
  const { provider, amount, duration, taikoAddress, from, to, chainId, approveToAddress } = input
  const depositContractAddr =
    chainId === sdk.ChainId.TAIKO ? depositContractAddrTAIKO : depositContractAddrTAIKOHEKLA
  const signer = provider.getSigner()
  const contract = new Contract(depositContractAddr, taikoDepositABI, signer)
  return contract.functions['deposit'](from, to, taikoAddress, amount, duration, '0x') 
  // return tx.wait()
}

const submitTaikoFarmingMint = async (info: {
  amount: BigNumber
  accountId: number
  apiKey: string
  exchangeAddress: string
  tokenId: number
  eddsaSk: string
}) => {
  const storageId = await LoopringAPI?.userAPI?.getNextStorageId(
    {
      accountId: info.accountId,
      sellTokenId: info.tokenId,
    },
    info.apiKey,
  )
  const avaiableNFT = await LoopringAPI?.defiAPI?.getTaikoFarmingAvailableNft(
    {
      accountId: info.accountId,
    },
    info.apiKey,
  )
  const positions = await LoopringAPI?.defiAPI?.getTaikoFarmingPositionInfo(
    {
      accountId: info.accountId,
    },
    info.apiKey,
  )
  const claimedTotal =
    positions && positions[0] && positions[0].claimedTotal
      ? BigNumber.from(positions[0].claimedTotal)
      : BigNumber.from('0')
  const preorderHash =
    positions && positions?.length > 0 ? ((positions[0] as any).orderHash as string) : ''
  const taikoFarmingSubmit: sdk.TaikoFarmingSubmitRequest = {
    exchange: info.exchangeAddress,
    accountId: info.accountId,
    storageId: storageId!.orderId,
    sellToken: {
      tokenId: info.tokenId,
      amount: claimedTotal.add(info.amount).toString(),
    },
    buyToken: {
      tokenId: avaiableNFT!.tokenId,
      nftData: avaiableNFT!.nftData,
      amount: '1',
    },
    allOrNone: false,
    fillAmountBOrS: true,
    validUntil: getTimestampDaysLater(365 * 10),
    maxFeeBips: 100,
    preOrderHash: preorderHash,
  }
  return LoopringAPI?.defiAPI?.submitTaikoFarmingClaim({
    request: taikoFarmingSubmit,
    apiKey: info.apiKey,
    eddsaKey: info.eddsaSk,
  })
}

export const useTaikoLock = <T extends IBData<I>, I>({
  setToastOpen,
  symbol: coinSellSymbol,
}: {
  symbol: string
  setToastOpen: (props: { open: boolean; content: JSX.Element | string; type: ToastType }) => void
}) => {
  const { t } = useTranslation(['common'])
  const refreshRef = React.createRef()
  const [isLoading, setIsLoading] = React.useState(false)
  const [taikoFarmingChecked, setTaikoFarmingChecked] = React.useState(false)
  const onCheckBoxChange = React.useCallback(() => {
    setTaikoFarmingChecked(!taikoFarmingChecked)
  }, [taikoFarmingChecked])
  const { tokenMap } = useTokenMap()
  const { tokenPrices } = useTokenPrices()
  const { account } = useAccount()
  const dispatch = useDispatch()
  const { setShowAccount } = useOpenModals()
  const { status: stakingMapStatus, marketMap: stakingMap, getStakingMap } = useStakingMap()

  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals()
  const { tradeStake, updateTradeStake, resetTradeStake } = useTradeStake()
  const { exchangeInfo, allowTrade, getValueInCurrency } = useSystem()
  const { toggle } = useToggle()
  const { defaultNetwork, currency, coinJson } = useSettings()
  const sellToken = tokenMap[coinSellSymbol]
  const taikoFarmingPrecision = 2
  const { walletLayer2 } = useWalletLayer2()
  const [mintedLRTAIKO, setMintedLRTAIKO] = useState(undefined as string | undefined)
  
  const holdingLRTAIKO = walletLayer2 && walletLayer2['LRTAIKO']?.total && sellToken.decimals
    ? utils.formatUnits(walletLayer2['LRTAIKO'].total, sellToken.decimals) 
    : undefined
  console.log('walletLayer2', holdingLRTAIKO) 

  const handleOnchange = _.debounce(
    ({ tradeData, _tradeStake = {} }: { tradeData: T; _tradeStake?: Partial<TradeStake<T>> }) => {
      const tradeStake = store.getState()._router_tradeStake.tradeStake
      let _deFiSideCalcData: DeFiSideCalcData<T> = {
        ...tradeStake.deFiSideCalcData,
      } as unknown as DeFiSideCalcData<T>
      let _oldTradeStake = {
        ...tradeStake,
        ..._tradeStake,
      }
      myLog('defi handleOnchange', _oldTradeStake)

      if (tradeData && coinSellSymbol) {
        const inputValue = tradeData?.tradeValue?.toString() ?? ''

        const tokenSell = tokenMap[coinSellSymbol]
        const { sellVol, deFiSideCalcData } = calcSideStaking({
          inputValue,
          isJoin: true,
          deFiSideCalcData: _deFiSideCalcData,
          tokenSell,
        })

        // @ts-ignore
        _deFiSideCalcData = {
          ...deFiSideCalcData,
          coinSell: {
            ...tradeData,
            tradeValue: inputValue,
          },
          stakeViewInfo: {
            ...deFiSideCalcData.stakeViewInfo,
          }
        }
        updateTradeStake({
          sellToken: tokenSell,
          sellVol,
          deFiSideCalcData: {
            ..._deFiSideCalcData,
          },
        })
      }
    },
    globalSetup.wait,
  )

  const resetDefault = React.useCallback(
    async (clearTrade: boolean = false) => {
      let deFiSideCalcDataInit: Partial<DeFiSideCalcData<any>> = {
        ...tradeStake.deFiSideCalcData,
        coinSell: {
          belong: coinSellSymbol,
          balance: undefined,
          tradeValue:
            tradeStake.deFiSideCalcData?.coinSell?.belong === coinSellSymbol
              ? tradeStake.deFiSideCalcData?.coinSell?.tradeValue
              : undefined,
        },
      }
      try {
        let item = stakingMap[coinSellSymbol]
        if (item && stakingMap) {
          deFiSideCalcDataInit.stakeViewInfo = { 
            ...item,
            // minSellAmount: '1',
            // minSellVol: utils.parseEther('1').toString(),
          }
        } else {
          throw new Error('no product')
        }

        // if (account.readyState === AccountStatus.ACTIVATED) {
        if (clearTrade === true) {
          walletLayer2Service.sendUserUpdate()
        }
        const walletLayer1 = store.getState().walletLayer1.walletLayer1 as WalletLayer1Map<any>

        deFiSideCalcDataInit.coinSell.balance = walletLayer1[coinSellSymbol]?.count
          ? numberFormat(walletLayer1[coinSellSymbol]?.count, {
              fixed: taikoFarmingPrecision,
              removeTrailingZero: true,
            })
          : undefined

        if (clearTrade || tradeStake.deFiSideCalcData?.coinSell?.tradeValue === undefined) {
          deFiSideCalcDataInit.coinSell.tradeValue = undefined
          updateTradeStake({
            sellVol: '0',
            sellToken: tokenMap[coinSellSymbol],
            deFiSideCalcData: {
              ...deFiSideCalcDataInit,
              coinSell: {
                ...deFiSideCalcDataInit.coinSell,
                tradeValue: undefined,
              },
            } as DeFiSideCalcData<T>,
          })
          myLog('resetDefault defi clearTrade', deFiSideCalcDataInit)
        } else {
          const tradeData = {
            ...deFiSideCalcDataInit.coinSell,
            tradeValue: tradeStake.deFiSideCalcData?.coinSell?.tradeValue ?? undefined,
          }
          handleOnchange({ tradeData })
        }
      } catch (error) {
        setToastOpen({
          open: true,
          type: ToastType.error,
          content: t(
            SDK_ERROR_MAP_TO_UI[(error as sdk.RESULT_INFO).code ?? 700001]?.messageKey ??
              (error as sdk.RESULT_INFO).message,
          ),
        })
      }
      setIsLoading(false)
      setDaysInput('')
    },
    [
      account.readyState,
      coinSellSymbol,
      handleOnchange,
      coinSellSymbol,
      tokenMap,
      tradeStake.deFiSideCalcData,
      updateTradeStake,
    ],
  )

  const walletLayer1Callback = React.useCallback(async () => {
    let tradeValue: any = undefined
    let deFiSideCalcDataInit: Partial<DeFiSideCalcData<any>> = {
      coinSell: {
        belong: coinSellSymbol,
        balance: undefined,
      },
      ...(tradeStake?.deFiSideCalcData ?? {}),
    }
    if (tradeStake.deFiSideCalcData) {
      tradeValue = tradeStake?.deFiSideCalcData?.coinSell?.tradeValue ?? undefined
    }
    if (deFiSideCalcDataInit?.coinSell?.belong) {
      const walletLayer1 = store.getState().walletLayer1.walletLayer1 as WalletLayer1Map<any>

      deFiSideCalcDataInit.coinSell = {
        belong: coinSellSymbol,
        balance: numberFormat(walletLayer1[coinSellSymbol]?.count, {
          fixed: taikoFarmingPrecision,
          removeTrailingZero: true,
        }),
      }
      const tradeData = {
        ...deFiSideCalcDataInit.coinSell,
        tradeValue,
      }
      myLog('resetDefault Defi walletLayer2Callback', tradeData)
      handleOnchange({ tradeData })
    }
  }, [account.readyState, coinSellSymbol, handleOnchange, tradeStake.deFiSideCalcData])

  useWalletLayer2Socket({ walletLayer1Callback })
  // useWalletLayer({ walletLayer1Callback })
  const sendRequest = React.useCallback(async () => {
    const tradeStake = store.getState()._router_tradeStake.tradeStake
    try {
      setIsLoading(true)
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        tradeStake.deFiSideCalcData?.coinSell &&
        tradeStake.sellToken?.tokenId !== undefined &&
        exchangeInfo
      ) {
        const request = {
          accountId: account.accountId,
          timestamp: Date.now(),
          token: {
            tokenId: tradeStake.sellToken?.tokenId,
            volume: tradeStake.sellVol,
          },
        }
        myLog('Stake Trade request:', request)

        const response = await LoopringAPI.defiAPI.sendStake(
          request,
          account.eddsaKey.sk,
          account.apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
          throw new CustomErrorWithCode(errorItem)
        } else {
          const response1 = await LoopringAPI.defiAPI.getStakeSummary(
            {
              accountId: account.accountId,
              hashes: response.hash,
              tokenId: tradeStake.sellToken.tokenId,
            },
            account.apiKey,
          )
          let item: any
          if ((response1 as sdk.RESULT_INFO).code || (response1 as sdk.RESULT_INFO).message) {
          } else {
            item = (response1 as any).list[0]
          }

          setShowAccount({
            isShow: true,
            step: AccountStep.Taiko_Farming_Lock_Success,
            info: {
              symbol: tradeStake.sellToken.symbol,
              amount: tradeStake.deFiSideCalcData.coinSell.tradeValue,
              daysDuration: Math.ceil(
                Number(tradeStake?.deFiSideCalcData?.stakeViewInfo?.rewardPeriod ?? 0) / 86400000,
              ),
              ...item,
            },
          })
          await sdk.sleep(SUBMIT_PANEL_QUICK_AUTO_CLOSE)
          walletLayer2Service.sendUserUpdate()
          updateStakingState()
        }
      } else {
        throw new Error('api not ready')
      }
    } catch (reason) {
      setToastOpen({
        open: true,
        type: ToastType.error,
        content:
          t('labelInvestFailed') + ' ' + (reason as CustomErrorWithCode)?.messageKey ??
          ` error: ${t((reason as CustomErrorWithCode)?.messageKey)}`,
      })
    } finally {
      resetDefault(true)
    }
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    exchangeInfo,
    resetDefault,
    setToastOpen,
    t,
  ])
  const provider = useWeb3ModalProvider()
  const [daysInput, setDaysInput] = React.useState('')
  const [txSubmitModalState, setTxSubmitModalState] = React.useState({
    open: false,
    status: 'init' as 'init' | 'tokenApproving' |  'depositing' | 'depositCompleted',
  })
  const [pendingTxsModalOpen, setPendingTxsModalOpen] = React.useState(false)
  const [localPendingTx, setLocalPendingTx] = useState<{
    txHash: string
    amount: string
  } | undefined>(undefined)
  const onSubmitBtnClick = React.useCallback(async () => {
    if (tokenMap && exchangeInfo) {
      if (allowTrade && !allowTrade.defiInvest.enable) {
        setShowSupport({ isShow: true })
      } else if (toggle && !toggle['taikoFarming'].enable) {
        setShowTradeIsFrozen({ isShow: true, type: 'StakingInvest' })
      } else {
        new Promise((res) => {
          setIsLoading(true)
          setTxSubmitModalState({
            open: true,
            status: 'tokenApproving',
          })
          res(null)
        })
          .then(() => {
            if (tradeStake && tradeStake.deFiSideCalcData) {
              return depositTaikoWithDurationApprove({
                provider: new providers.Web3Provider(provider.walletProvider!),
                amount: BigNumber.from(tradeStake!.sellVol),
                duration: BigNumber.from(daysInput).mul('60').mul('60').mul('24'),
                taikoAddress: sellToken.address,
                from: account.accAddress,
                to: account.accAddress,
                chainId: defaultNetwork,
                approveToAddress: exchangeInfo!.depositAddress,
              })
            } else {
              throw {}
            }
          })
          .then(() => {
            setTxSubmitModalState({
              open: true,
              status: 'depositing',
            })
            return depositTaikoWithDurationTx({
              provider: new providers.Web3Provider(provider.walletProvider!),
              amount: BigNumber.from(tradeStake!.sellVol),
              duration: BigNumber.from(daysInput).mul('60').mul('60').mul('24'),
              taikoAddress: sellToken.address,
              from: account.accAddress,
              to: account.accAddress,
              chainId: defaultNetwork,
              approveToAddress: exchangeInfo!.depositAddress,
            })
          })
          .then((tx) => {
            
            setDaysInput('')
            setIsLoading(false)
            resetDefault(true)
            setLocalPendingTx({
              txHash: tx.hash,
              amount: tradeStake!.sellVol,
            })
            return tx.wait()
          }).then((txReceipt) => {
            const recursiveCheck = async (hash: string, env: {addr: string, chainId: sdk.ChainId}) => {
              const account = store.getState().account
              const defaultNetwork = store.getState().settings.defaultNetwork
              if (env.addr !== account.accAddress || defaultNetwork !== env.chainId) {
                // stop if address, chain changed
                return
              }
              const accountId =
                account.accountId === -1 ? account._accountIdNotActive ?? -1 : account.accountId

              return LoopringAPI?.defiAPI
                ?.getTaikoFarmingDepositDurationList({
                  accountId,
                  tokenId: sellToken.tokenId,
                  statuses: 'locked',
                  // @ts-ignore
                  txHashes: hash,
                })
                .then((res) => {
                  if (res.data && res.data.length > 0) {
                    setTxSubmitModalState(state => ({
                      ...state,
                      status: 'depositCompleted',
                    }))
                  } else {
                    return sdk.sleep(10 * 1000).then(() => recursiveCheck(hash, env))
                  }
                })
            }
            recursiveCheck(txReceipt.transactionHash, { addr: account.accAddress, chainId: defaultNetwork} )
          })
          .catch((e) => {
            setTxSubmitModalState({
              open: false,
              status: 'init',
            })
            setShowAccount({
              isShow: true,
              step: AccountStep.Taiko_Farming_Lock_Failed,
              info: {
                error: {
                  msg: e.toString(),
                },
              },
            })
          })
          .finally(() => {
            resetDefault(true)
          })
      }
    } else {
      return false
    }
  }, [
    account.readyState,
    account.eddsaKey?.sk,
    tokenMap,
    exchangeInfo,
    sendRequest,
    setToastOpen,
    daysInput,
    tradeStake,
    tradeStake.deFiSideCalcData,
    t,
  ])

  const daysInputValid =
    Number.isInteger(Number(daysInput)) && Number(daysInput) >= 15 && Number(daysInput) <= 60

  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const account = store.getState().account
    const tradeStake = store.getState()._router_tradeStake.tradeStake
    myLog('tradeStake', tradeStake)

    if (tradeStake?.sellVol === undefined || sdk.toBig(tradeStake?.sellVol).lte(0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: 'labelEnterAmount',
      }
    } else if (
      sdk
        .toBig(tradeStake?.sellVol)
        .minus(tradeStake?.deFiSideCalcData?.stakeViewInfo?.minSellVol ?? 0)
        .lt(0)
    ) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelDefiMin| ${getValuePrecisionThousand(
          sdk.toBig(tradeStake?.deFiSideCalcData?.stakeViewInfo?.minSellAmount ?? 0),
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          false,
          { floor: false, isAbbreviate: true },
        )} ${coinSellSymbol}`,
      }
    } else if (
      sdk
        .toBig(tradeStake?.sellVol)
        .gt(tradeStake?.deFiSideCalcData?.stakeViewInfo?.maxSellVol ?? 0)
    ) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelDefiMax| ${getValuePrecisionThousand(
          sdk.toBig(tradeStake?.deFiSideCalcData?.stakeViewInfo?.maxSellAmount ?? 0),
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          false,
          { floor: false, isAbbreviate: true },
        )} ${coinSellSymbol}`,
      }
    } else if (
      tradeStake?.deFiSideCalcData?.coinSell?.tradeValue &&
      sdk
        .toBig(tradeStake.deFiSideCalcData.coinSell.tradeValue)
        .gt(tradeStake.deFiSideCalcData?.coinSell.balance ?? 0)
    ) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelStakeNoEnough| ${coinSellSymbol}`,
      }
    } else if (!daysInput) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: 'input days please',
      }
    } else if (!daysInputValid) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: 'Days should be between 15 and 60',
      }
    } else {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' } // label: ''}
    }
    // }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
  }, [
    tradeStake?.deFiSideCalcData?.stakeViewInfo?.minSellVol,
    tradeStake.sellVol,
    tradeStake.sellToken,
    tradeStake.deFiSideCalcData,
    tokenMap,
    coinSellSymbol,
    taikoFarmingChecked,
    daysInput,
  ])
  const checked = availableTradeCheck()
  const btnStatus = isLoading ? TradeBtnStatus.LOADING : checked.tradeBtnStatus

  const onBtnClick = onSubmitBtnClick
  const [stakingTotal, setStakingTotal] = React.useState<string | undefined>(undefined)

  const [stakeInfo, setStakeInfo] = React.useState(
    undefined as
      | undefined
      | {
          totalStaked: string
          staking: {
            accountId: number
            tokenId: number
            stakeAt: number
            initialAmount: string
            remainAmount: string
            totalRewards: string
            productId: string
            hash: string
            status: string
            createdAt: number
            updatedAt: number
            claimableTime: number
            lastDayPendingRewards: string
            apr: string
          }[]
        },
  )
  const [pendingDeposits, setPendingDeposits] = React.useState(
    undefined as
      | undefined
      | {
          accountId: number
          tokenId: number
          stakeAt: number
          txHash: string
          eventIndex: number
          lockDuration: number
          hash: string
          status: string
          createdAt: number
          updatedAt: number
        }[],
  )
  

  const stakingAmountRaw =
    stakeInfo && sellToken
      ? utils.formatUnits(stakeInfo.totalStaked, sellToken.decimals)
      : undefined
  const stakingAmount =
    stakingAmountRaw && sellToken
      ? numberFormatThousandthPlace(stakingAmountRaw, {
          tokenSymbol: sellToken.symbol,
          fixed: sellToken.precision,
          removeTrailingZero: true,
        })
      : undefined

  const stakingAmountInCurrency =
    stakingAmountRaw &&
    sellToken &&
    tokenPrices[sellToken.symbol] &&
    getValueInCurrency(new Decimal(stakingAmountRaw).mul(tokenPrices[sellToken.symbol]).toString())
      ? fiatNumberDisplay(
          getValueInCurrency(
            new Decimal(stakingAmountRaw).mul(tokenPrices[sellToken.symbol]).toString(),
          ),
          currency,
        )
      : undefined

  const [mintModalState, setMintModalState] = React.useState({
    open: false,
    inputValue: '',
    warningChecked: false,
    availableToMint: '',
    status: 'notSignedIn' as 'notSignedIn' | 'signingIn' | 'signedIn' | 'minting',
    minInputAmount: undefined as Decimal | undefined,
    maxInputAmount: undefined as Decimal | undefined,
  })

  useEffect(() => {
    if (defaultNetwork && ![sdk.ChainId.TAIKO, sdk.ChainId.TAIKOHEKLA].includes(defaultNetwork)) {
      new providers.Web3Provider(provider.walletProvider!).send('wallet_switchEthereumChain', [
        { chainId: sdk.toHex(sdk.ChainId.TAIKO) },
      ])
    }
  }, [defaultNetwork])

  const updateStakingState = async () => {
    const account = store.getState().account
    const accountId =
      account.accountId === -1 ? account._accountIdNotActive ?? -1 : account.accountId
    if (!accountId || accountId === -1) {
      accountServices.sendCheckAccount(account.accAddress)
      return
    }
    LoopringAPI?.defiAPI
      ?.getTaikoFarmingDepositDurationList({
        accountId,
        tokenId: sellToken.tokenId,
        statuses: 'received',
      })
      .then((res) => {
        getStateFnState(setLocalPendingTx).then(localPendingTx => {
          const found = res.data.find((item) => {
            return item.txHash === localPendingTx?.txHash
          })
          if (found) {
            setLocalPendingTx(undefined)
          }
          setPendingDeposits(res.data)
        })
      })
    LoopringAPI?.defiAPI
      ?.getTaikoFarmingPositionInfo({
        accountId,
      })
      .then((res) => {
        const availableToMint = (res && res[0] && res[0].claimableTotal) ?? '0'
        const minClaimAmount = (res[0] as any).minClaimAmount as string
        const maxClaimAmount = (res[0] as any).maxClaimAmount as string
        setMintModalState((mintModalState) => ({
          ...mintModalState,
          availableToMint: availableToMint,
          minInputAmount: new Decimal(utils.formatUnits(minClaimAmount, sellToken.decimals)) ,
          maxInputAmount: new Decimal(utils.formatUnits(maxClaimAmount, sellToken.decimals)) ,
        }))
        
        setMintedLRTAIKO(utils.formatUnits(res[0].claimedTotal, sellToken.decimals))
      })
    LoopringAPI?.defiAPI
      ?.getTaikoFarmingUserSummary({
        accountId: accountId,
        tokenId: sellToken.tokenId,
      })
      .then((res) => {
        setStakeInfo({
          staking: res.staking,
          totalStaked: res.totalStaked,
        })
      })
  }
  const clearState = () => {
    setStakingTotal(undefined)
    setStakeInfo(undefined)
    setMintModalState({
      open: false,
      inputValue: '',
      warningChecked: false,
      availableToMint: '',
      status: 'notSignedIn',
      maxInputAmount: undefined,
      minInputAmount: undefined,
    })
    setLocalPendingTx(undefined)
    setPendingDeposits(undefined)
  }
  React.useEffect(() => {
    getStakingMap()
    walletLayer2Service.sendUserUpdate()
  }, [account.readyState])
  React.useEffect(() => {
    const timer = setInterval(() => {
      updateStakingState()
    }, 10 * 1000)
    updateStakingState()
    return () => {
      clearInterval(timer)
    }
  }, [])
  React.useEffect(() => {
    const {
      _router_tradeStake: { tradeStake },
      invest: {
        stakingMap: { marketMap: stakingMap },
      },
    } = store.getState()

    if (
      stakingMapStatus === SagaStatus.UNSET &&
      stakingMap &&
      stakingMap[coinSellSymbol]?.symbol == coinSellSymbol &&
      !(tradeStake?.deFiSideCalcData?.coinSell?.belong == coinSellSymbol)
    ) {
      resetDefault(true)
    } else if (stakingMapStatus === SagaStatus.UNSET && stakingMap && !stakingMap[coinSellSymbol]) {
    }
    return () => {
      resetTradeStake()
      handleOnchange.cancel()
    }
  }, [stakingMapStatus])

  React.useEffect(() => {
    clearState()
  }, [account.accAddress, defaultNetwork])

  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const btnLabel =
    checked.tradeBtnStatus === TradeBtnStatus.DISABLED
      ? t(
          checked.label.split('|')[0],
          checked.label.split('|') && checked.label.split('|')[1]
            ? {
                arg: checked.label.split('|')[1],
                layer2: L1L2_NAME_DEFINED[network].layer2,
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              }
            : {
                layer2: L1L2_NAME_DEFINED[network].layer2,
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              },
        )
      : t('labelLockTAIKO')
  const availableToMintFormatted = mintModalState.availableToMint
    ? utils.formatUnits(mintModalState.availableToMint, sellToken.decimals)
    : undefined
  const isInputInvalid =
    mintModalState.inputValue && mintModalState.maxInputAmount && mintModalState.minInputAmount &&
    (new Decimal(mintModalState.inputValue).lessThan(mintModalState.minInputAmount) ||
      new Decimal(mintModalState.inputValue).greaterThan(Decimal.min(availableToMintFormatted ?? '0', mintModalState.maxInputAmount)))

  const { goUpdateAccount } = useUpdateAccount()
  
  // const localPendingTx = {
  //   txHash: 'aaa',
  //   amount: utils.parseUnits('1000.1', sellToken.decimals).toString(),
  //   createdAt: Date.now(),
  //   isLocal: true
  // } as {
  //   txHash: string
  //   amount: string
  //   isLocal: boolean
  //   createdAt: number
  // } | undefined

  const pendingDepositsMergeLocal = [
    ...(localPendingTx ? [
      {...localPendingTx, isLocal: true}
    ] : []),
    ...(pendingDeposits ? pendingDeposits.map(tx => ({...tx, isLocal: false})) : []),
  ]
  
  const output = {
    stakeWrapProps: {
      disabled: false,
      buttonDisabled:
        // account.readyState === AccountStatus.ACTIVATED &&
        isLoading || !daysInput || !daysInputValid,
      // btnInfo,
      isJoin: true,
      isLoading,
      switchStobEvent: (_isStoB: boolean | ((prevState: boolean) => boolean)) => {},
      onSubmitClick: onBtnClick as () => void,
      onChangeEvent: handleOnchange,
      deFiSideCalcData: tradeStake.deFiSideCalcData,
      minSellAmount: tradeStake?.deFiSideCalcData?.stakeViewInfo?.minSellAmount,
      maxSellAmount: tradeStake?.deFiSideCalcData?.stakeViewInfo?.maxSellAmount,
      tokenSell: {
        ...tokenMap[coinSellSymbol],
        decimals: tradeStake?.deFiSideCalcData?.stakeViewInfo?.decimals,
        precision: tradeStake?.deFiSideCalcData?.stakeViewInfo?.precision,
      },
      btnStatus,
      accStatus: account.readyState,
      btnLabel: btnLabel,
      lockedPosition:
        stakingTotal && new Decimal(stakingTotal).gt(0)
          ? {
              amount: stakingAmount,
              amountInCurrency: stakingAmountInCurrency,
              trailblazerBooster: '60x',
            }
          : undefined,
      taikoFarmingChecked,
      onCheckBoxChange,
      lockTaikoPlaceholder: tradeStake?.deFiSideCalcData?.stakeViewInfo?.minSellAmount
        ? `≥ ${tradeStake?.deFiSideCalcData?.stakeViewInfo?.minSellAmount}`
        : '',
      daysInput: {
        value: daysInput,
        onInput: (input) => {
          if (Number.isInteger(Number(input)) || input === '') {
            setDaysInput(input)
          }
        },
      },
      myPosition:
        stakeInfo && stakingAmountRaw && new Decimal(stakingAmountRaw).gt('0')
          ? {
              totalAmount: stakingAmount,
              totalAmountInCurrency: stakingAmountInCurrency,
              positions: stakeInfo.staking.map((stake) => {
                const tokenInfo = tokenMap[coinSellSymbol]
                const lockingDays = Math.ceil(
                  (stake.claimableTime - stake.stakeAt) / (1000 * 60 * 60 * 24),
                )

                return {
                  amount: numberFormatThousandthPlace(
                    utils.formatUnits(stake.initialAmount, tokenInfo.decimals),
                    {
                      fixed: tokenInfo.precision,
                      removeTrailingZero: true,
                    },
                  ),
                  unlocked: stake.status !== 'locked',
                  lockingDays,
                  unlockTime: stake.claimableTime
                    ? moment(stake.claimableTime).format('YYYY-MM-DD')
                    : '',
                  multiplier: lockingDays + 'x',
                }
              }),
            }
          : undefined,
      mintButton: {
        onClick: () => {
          if (account.readyState === AccountStatus.ACTIVATED) {
            setMintModalState({
              ...mintModalState,
              open: true,
              status: 'minting',
            })
          } else if (account.readyState === AccountStatus.LOCKED) {
            unlockAccount()
            setShowAccount({
              isShow: true,
              step: AccountStep.UpdateAccount_Approve_WaitForAuth,
            })
          } else if (account.readyState === AccountStatus.NOT_ACTIVE) {
            setMintModalState({
              ...mintModalState,
              open: true,
              status: 'notSignedIn',
            })
          }
        },
        disabled: false,
      },
      taikoCoinJSON: coinJson['TAIKO'],
      mintModal: {
        onClickSignIn: async () => {
          setMintModalState({
            ...mintModalState,
            status: 'signingIn',
          })
          const feeInfo = await LoopringAPI?.globalAPI?.getActiveFeeInfo({
            accountId: account._accountIdNotActive,
          })
          const { userBalances } = await LoopringAPI?.globalAPI?.getUserBalanceForFee({
            accountId: account._accountIdNotActive!,
            tokens: '',
          })
          const found = Object.keys(feeInfo.fees).find((key) => {
            const fee = feeInfo.fees[key].fee
            const foundBalance = userBalances[feeInfo.fees[key].tokenId]
            return (
              (foundBalance && sdk.toBig(foundBalance.total).gte(fee)) || sdk.toBig(fee).eq('0')
            )
          })
          await goUpdateAccount({
            isFirstTime: true,
            isReset: false,
            // @ts-ignore
            feeInfo: {
              token: feeInfo.fees[found!].fee,
              belong: found!,
              fee: feeInfo.fees[found!].fee,
              feeRaw: feeInfo.fees[found!].fee,
            },
          })
            .then(() => {
              setMintModalState({
                ...mintModalState,
                status: 'signedIn',
              })
            })
            .catch(() => {
              setMintModalState({
                ...mintModalState,
                status: 'notSignedIn',
              })
            })
        },
        onClickMint: () => {
          setMintModalState({
            ...mintModalState,
            status: 'minting',
          })
        },
        open: mintModalState.open,
        onClose: () => {
          setMintModalState({
            ...mintModalState,
            open: false,
          })
        },
        onClickMax: () => {
          setMintModalState({
            ...mintModalState,
            inputValue: utils.formatUnits(mintModalState.availableToMint, sellToken.decimals),
          })
        },
        mintWarningChecked: mintModalState.warningChecked,
        // mintWarningText: t('labelTaikoFarmingMintWarningText'),
        onWarningCheckBoxChange: () => {
          setMintModalState({
            ...mintModalState,
            warningChecked: !mintModalState.warningChecked,
          })
        },
        onConfirmBtnClicked: async () => {
          setShowAccount({
            isShow: true,
            step: AccountStep.Taiko_Farming_Mint_In_Progress,
            info: {
              symbol: 'lrTAIKO',
              amount: numberFormatThousandthPlace(mintModalState.inputValue, {
                fixed: 18,
                removeTrailingZero: true,
              }),
              mintAt: Date.now(),
            },
          })

          const res = await submitTaikoFarmingMint({
            amount: utils.parseUnits(mintModalState.inputValue, sellToken.decimals),
            accountId: account.accountId,
            apiKey: account.apiKey,
            exchangeAddress: exchangeInfo!.exchangeAddress,
            tokenId: sellToken.tokenId,
            eddsaSk: account.eddsaKey.sk,
          })
            .then((res) => {
              const checkStatus = (hash: string) => {
                return LoopringAPI.defiAPI
                  ?.getTaikoFarmingTransactionByHash(
                    {
                      accountId: account.accountId,
                      hash: res!.hash,
                    },
                    account.apiKey,
                  )
                  .then(async (res2) => {
                    if (res2!.operation.status === 7) {
                      throw {
                        msg: 'error',
                      }
                    } else if (res2.operation.status < 7) {
                      setShowAccount({
                        isShow: true,
                        step: AccountStep.Taiko_Farming_Mint_In_Progress,
                        info: {
                          symbol: sellToken.symbol,
                          amount: numberFormatThousandthPlace(mintModalState.inputValue, {
                            fixed: sellToken.precision,
                            removeTrailingZero: true,
                          }),
                        },
                      })
                      await sdk.sleep(5 * 1000)
                      if (
                        store.getState().modals.isShowAccount.isShow &&
                        store.getState().modals.isShowAccount.step ===
                          AccountStep.Taiko_Farming_Mint_In_Progress
                      ) {
                        return checkStatus(hash)
                      }
                    } else {
                      setShowAccount({
                        isShow: true,
                        step: AccountStep.Taiko_Farming_Mint_Success,
                        info: {
                          symbol: 'lrTAIKO',
                          amount: numberFormatThousandthPlace(mintModalState.inputValue, {
                            fixed: 18,
                            removeTrailingZero: true,
                          }),
                          mintAt: Date.now(),
                        },
                      })
                      setMintModalState({
                        ...mintModalState,
                        inputValue: '',
                        warningChecked: false,
                      })
                    }
                  })
              }
              return checkStatus(res!.hash)
            })
            .catch((e) => {
              setShowAccount({
                isShow: true,
                step: AccountStep.Taiko_Farming_Mint_Failed,
                info: {
                  error: e,
                },
              })
            })
            .finally(() => {
              updateStakingState()
            })
        },
        onInput: (input: string) => {
          if (
            (isNumberStr(input) && strNumDecimalPlacesLessThan(input, sellToken.precision + 1)) ||
            input === ''
          ) {
            setMintModalState({
              ...mintModalState,
              inputValue: input,
            })
          }
        },
        inputValue: mintModalState.inputValue,
        confirmBtnDisabled:
          !isNumberStr(mintModalState.inputValue) ||
          !mintModalState.warningChecked ||
          !mintModalState.availableToMint ||
          new Decimal(availableToMintFormatted!).eq('0') ||
          isInputInvalid,
        confirmBtnWording:
          isInputInvalid || !mintModalState.inputValue
            ? availableToMintFormatted &&
              mintModalState.minInputAmount &&
              mintModalState.maxInputAmount &&
              Decimal.min(mintModalState.maxInputAmount, availableToMintFormatted).gte(mintModalState.minInputAmount)
              ? `Please input between ${mintModalState.minInputAmount.toString()} - ${Decimal.min(mintModalState.maxInputAmount, availableToMintFormatted).toString()}`
              : 'Invalid amount'
            : !mintModalState.warningChecked
            ? 'Please check checkbox'
            : 'Confirm',
        tokenAvailableAmount: availableToMintFormatted ? availableToMintFormatted : '--',
        inputPlaceholder:
          mintModalState.minInputAmount && mintModalState.maxInputAmount
            ? availableToMintFormatted &&
              Decimal.min(mintModalState.maxInputAmount, availableToMintFormatted).gte(
                mintModalState.minInputAmount,
              )
              ? `${mintModalState.minInputAmount.toString()} - ${Decimal.min(
                  mintModalState.maxInputAmount,
                  availableToMintFormatted,
                ).toString()}`
              : `≥ ${mintModalState.minInputAmount.toString()}`
            : '',
        status: mintModalState.status,
      },
      txSubmitModal: {
        open: txSubmitModalState.open,
        onClose: () => {
          setTxSubmitModalState({
            open: false,
            status: 'init',
          })
        },
        status: txSubmitModalState.status,
      },
      hasPendingDeposits: pendingDepositsMergeLocal && pendingDepositsMergeLocal.length > 0,
      onClickPendingDeposits: () => {
        setPendingTxsModalOpen(true)
      },
      pendingTxsModal: {
        open: pendingTxsModalOpen,
        onClose: () => {
          setPendingTxsModalOpen(false)
        },
        pendingTxs: pendingDepositsMergeLocal?.map((tx) => {
          return {
            hash: tx.txHash,
            amount: numberFormatThousandthPlace(
              utils.formatUnits((tx as any).amount as string, sellToken.decimals),
              {
                fixed: sellToken.precision,
                removeTrailingZero: true,
              },
            ),
            symbol: sellToken.symbol,
            isLocal: tx.isLocal,
          }
        }),
        onClickLocking: () => {
          setTxSubmitModalState({
            open: true,
            status: 'depositing',
          })
        },
      },
      lrTAIKOTradeEarnSummary: mintedLRTAIKO && holdingLRTAIKO && {
        holdingAmount: numberFormatThousandthPlace(holdingLRTAIKO, { fixed: sellToken.precision, removeTrailingZero: true }),
        mintedAmount: numberFormatThousandthPlace(mintedLRTAIKO, { fixed: sellToken.precision, removeTrailingZero: true }),
        pnl: `${new Decimal(holdingLRTAIKO).sub(mintedLRTAIKO).isPos() ? '+' : '-'}${
          numberFormatThousandthPlace(new Decimal(holdingLRTAIKO).sub(mintedLRTAIKO).abs().toString(), {fixed: sellToken.precision, removeTrailingZero: true}) 
        }`,
      }
    },
  }
  return output
}
