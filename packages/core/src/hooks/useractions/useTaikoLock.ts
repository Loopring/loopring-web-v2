import React, { useEffect, useState } from 'react'
import {
  AccountStep,
  ToastType,
  useOpenModals,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import {
  Account,
  AccountStatus,
  CustomErrorWithCode,
  DeFiSideCalcData,
  FeeInfo,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  L1L2_NAME_DEFINED,
  LIVE_FEE_TIMES,
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
  DAYS,
  erc20ABI,
  fiatNumberDisplay,
  getStateFnState,
  getTimestampDaysLater,
  isNumberStr,
  numberFormat,
  numberFormatThousandthPlace,
  resetlrTAIKOIfNeeded,
  strNumDecimalPlacesLessThan,
  taikoDepositABI,
  unlockAccount,
  useAccountModal,
  useChargeFees,
  useStakingMap,
  useUpdateAccount,
  useVaultBorrow,
  useWalletLayer2Socket,
} from '@loopring-web/core'
import _, { has, keys, last, set } from 'lodash'
import * as sdk from '@loopring-web/loopring-sdk'
import Web3 from 'web3'
import {
  LoopringAPI,
  store,
  useAccount,
  useSystem,
  useTokenMap,
  walletLayer2Service,
} from '../../index'
import { useTranslation } from 'react-i18next'
import { useTokenPrices, useTradeStake, useVaultLayer2, useVaultMap, useWalletLayer2, WalletLayer1Map, WalletLayer2Map } from '../../stores'
import Decimal from 'decimal.js'
import { BigNumber, Contract, ethers, providers, utils } from 'ethers'
import moment, { min } from 'moment'
import { useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { useDispatch } from 'react-redux'
import { useWalletInfo } from '../../stores/localStore/walletInfo'
import { red } from 'bn.js'

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
  const positionsInfo = await LoopringAPI?.defiAPI?.getTaikoFarmingPositionInfo(
    {
      accountId: info.accountId,
    }
  )
  const positions = positionsInfo?.data
  
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
  const { walletLayer2, updateWalletLayer2 } = useWalletLayer2()
  const [mintedLRTAIKO, setMintedLRTAIKO] = useState(undefined as string | undefined)
  const holdingTAIKO = walletLayer2 && walletLayer2['TAIKO'] 
    ? BigNumber.from(walletLayer2['TAIKO'].total).sub(walletLayer2['TAIKO'].locked).toString()
    : undefined

  
  const holdingLRTAIKO =
    walletLayer2 && walletLayer2['LRTAIKO']?.total && sellToken.decimals
      ? utils.formatUnits(
          BigNumber.from(walletLayer2['LRTAIKO'].total).sub(walletLayer2['LRTAIKO'].locked),
          sellToken.decimals,
        )
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
          refreshData()
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
    lockDuration: number
    stakeAt: number
    amount: string
  } | undefined>(undefined)
  

  const daysInputValid =
    Number.isInteger(Number(daysInput)) && Number(daysInput) >= 1 && Number(daysInput) <= 60
  const [stakeInfo, setStakeInfo] = React.useState(
    undefined as
      | undefined
      | {
          totalStaked: string
          stakingReceivedLocked: {
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
  const [realizedAndUnrealized, setRealizedAndUnrealized] = React.useState(
    undefined as
      | undefined
      | {
          redeemAmount: string
          realizedUSDT: string
          unrealizedTaiko: string
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

  const pendingDepositsMergeLocal = [
    ...(localPendingTx ? [
      {...localPendingTx, isLocal: true}
    ] : []),
    ...(pendingDeposits ? pendingDeposits.map(tx => ({...tx, isLocal: false})) : []),
  ]

  const firstLockingPos: { claimableTime: number } | undefined =
    stakeInfo?.stakingReceivedLocked && last(stakeInfo.stakingReceivedLocked)
      ? { claimableTime: last(stakeInfo.stakingReceivedLocked)!.claimableTime }
      : pendingDepositsMergeLocal.length > 0
      ? {
          claimableTime:
            last(pendingDepositsMergeLocal)!.lockDuration + last(pendingDepositsMergeLocal)!.stakeAt,
        }
      : undefined


  const hasNoLockingPos = !firstLockingPos

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
            if (account.accountId && account.accountId !== -1) {
              return resetlrTAIKOIfNeeded(account, defaultNetwork, exchangeInfo, 5)
            }
          })
          .then(() => {
            const oneDay = BigNumber.from('60').mul('60').mul('24')
            const duration =
              stakeInfo && !firstLockingPos
                ? BigNumber.from(daysInput).mul(oneDay)
                : firstLockingPos
                ? BigNumber.from(firstLockingPos.claimableTime)
                    .sub(Date.now())
                    .div('1000')
                    .div(oneDay)
                    .mul(oneDay)
                : undefined
            if (tradeStake && tradeStake.deFiSideCalcData && duration) {
              return depositTaikoWithDurationApprove({
                provider: new providers.Web3Provider(provider.walletProvider!),
                amount: BigNumber.from(tradeStake!.sellVol),
                duration: duration,
                taikoAddress: sellToken.address,
                from: account.accAddress,
                to: account.accAddress,
                chainId: defaultNetwork,
                approveToAddress: exchangeInfo!.depositAddress,
              }).then(() => {
                setTxSubmitModalState({
                  open: true,
                  status: 'depositing',
                })
                return depositTaikoWithDurationTx({
                  provider: new providers.Web3Provider(provider.walletProvider!),
                  amount: BigNumber.from(tradeStake!.sellVol),
                  duration: duration,
                  taikoAddress: sellToken.address,
                  from: account.accAddress,
                  to: account.accAddress,
                  chainId: defaultNetwork,
                  approveToAddress: exchangeInfo!.depositAddress,
                })
              })
            } else {
              throw new Error('depositTaikoWithDurationApprove error')
            }
          })
          .then((tx) => {
            setDaysInput('')
            setIsLoading(false)
            resetDefault(true)
            setLocalPendingTx({
              txHash: tx.hash,
              amount: tradeStake!.sellVol,
              stakeAt: Date.now(),
              lockDuration: firstLockingPos
                ? firstLockingPos.claimableTime - Date.now()
                : Number(daysInput) * 24 * 60 * 60 * 1000,
            })
            return tx.wait()
          })
          .then((txReceipt) => {
            const recursiveCheck = async (
              hash: string,
              env: { addr: string; chainId: sdk.ChainId },
            ) => {
              const account = store.getState().account
              const defaultNetwork = store.getState().settings.defaultNetwork

              if (
                env.addr.toLowerCase() !== account.accAddress.toLowerCase() ||
                defaultNetwork !== env.chainId
              ) {
                // stop if address, chain changed
                return
              }
              const accountId =
                account.accountId === -1 ? account._accountIdNotActive ?? -1 : account.accountId
              if (!accountId || accountId === -1) {
                accountServices.sendCheckAccount(account.accAddress)
                await sdk.sleep(10 * 1000)
                return recursiveCheck(hash, env)
              } else {
                const res = await LoopringAPI?.defiAPI?.getTaikoFarmingDepositDurationList({
                  accountId,
                  tokenId: sellToken.tokenId,
                  statuses: 'locked',
                  // @ts-ignore
                  txHashes: hash,
                })
                if (res?.data && res.data.length > 0) {
                  setTxSubmitModalState((state) => ({
                    ...state,
                    status: 'depositCompleted',
                  }))
                  return
                } else {
                  await sdk.sleep(10 * 1000)
                  return recursiveCheck(hash, env)
                }
              }
            }
            recursiveCheck(txReceipt.transactionHash, {
              addr: account.accAddress,
              chainId: defaultNetwork,
            })
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
  const [taikoFarmingAccountStatus, setTaikoFarmingAccountStatus] = useState(undefined as number | undefined)
  
  const chargeFee = useChargeFees({
    requestType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,

    amount: holdingTAIKO ? Number(holdingTAIKO) : 0,
    needAmountRefresh: true,
    tokenSymbol: sellToken.symbol,
  })
  
  const taikoFee = chargeFee?.chargeFeeTokenList?.find(fee => fee.belong === 'TAIKO')
  const taikoBalanceGreaterThanFee = holdingTAIKO && taikoFee
    ? BigNumber.from(holdingTAIKO).gt(taikoFee.__raw__.feeRaw)
    : undefined
  console.log('taikoBalanceGreaterThanFee', taikoBalanceGreaterThanFee)

  const settlementStatus: 'init' | 'minting' | 'notSettled' | 'settled' | 'noPosition' =
    taikoFarmingAccountStatus === undefined
      ? 'init'
      : (taikoFarmingAccountStatus === 1 || taikoFarmingAccountStatus === 2)
      ? 'minting'
      : taikoFarmingAccountStatus === 3
      ? 'notSettled'
      : taikoFarmingAccountStatus === 0 && taikoBalanceGreaterThanFee
      ? 'settled'
      : 'noPosition'

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
    } else if (stakeInfo && hasNoLockingPos && !daysInput) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: 'input days please',
      }
    } else if (stakeInfo && hasNoLockingPos && !daysInputValid) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: 'Days should be between 15 and 60',
      }
    } else if (
      firstLockingPos && firstLockingPos.claimableTime < Date.now()
    ) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: 'posiotions should be redeemed to lock again',
      }
    } else if (
      firstLockingPos && moment(firstLockingPos.claimableTime).diff(moment(), 'days') < 1
    ) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: 'Less than 1 day to unlcok, locking Disabled',
      }
    } else if (settlementStatus === 'notSettled') {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: 'Settlement is in progress',
      }
    } else if (settlementStatus === 'settled') {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: 'Plese reddem first',
      }
    } else {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' } // label: ''}
    }
  }, [tokenMap, coinSellSymbol, daysInput, stakeInfo, hasNoLockingPos, daysInputValid, settlementStatus, firstLockingPos])
  const checked = availableTradeCheck()
  const btnStatus = isLoading ? TradeBtnStatus.LOADING : checked.tradeBtnStatus

  const onBtnClick = onSubmitBtnClick
  const [stakingTotal, setStakingTotal] = React.useState<string | undefined>(undefined)

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
  const stakingAmountWithNoSymbol =
    stakingAmountRaw && sellToken
      ? numberFormatThousandthPlace(stakingAmountRaw, {
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
  const [mintRedeemModalState, setMintRedeemModalState] = React.useState({
    open: false,
    mint: {
      inputValue: '',
      warningChecked: false,
      availableToMint: '',
      minInputAmount: undefined as Decimal | undefined,
      maxInputAmount: undefined as Decimal | undefined,
    },
    redeemErrorMsg: undefined as string | undefined,
    status: 'notSignedIn' as 'notSignedIn' | 'signingIn' | 'signedIn' | 'minting' | 'redeeming' | 'redeemError',
  })


  


  useEffect(() => {
    if (defaultNetwork && ![sdk.ChainId.TAIKO, sdk.ChainId.TAIKOHEKLA].includes(defaultNetwork)) {
      new providers.Web3Provider(provider.walletProvider!).send('wallet_switchEthereumChain', [
        { chainId: sdk.toHex(sdk.ChainId.TAIKO) },
      ])
    }
  }, [defaultNetwork])

  
  const [previousLockRecord, setPreviousLockRecord] = useState({ status: 'init' } as
    | { status: 'init' }
    | { status: 'notFound' }
    | {
        TAIKOProfit: string 
        USDTProfit: string 
        redeemAmount: string 
        expirationTime: number
        status: 'found'
      })

  

  const refreshData = async () => {
    
    const account = store.getState().account
    const accountId =
      account.accountId === -1 ? account._accountIdNotActive ?? -1 : account.accountId
    if (!accountId || accountId === -1) {
      setStakeInfo({
        totalStaked: '0',
        stakingReceivedLocked: [],
      })
      // refresh account 
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
        accountId: accountId,
      })
      .then((res) => {
        const data = res.data
        setTaikoFarmingAccountStatus(res.account.status)
        const availableToMint = (data && data[0] && data[0].claimableTotal) ?? '0'
        const minClaimAmount = (data[0] as any).minClaimAmount as string
        const maxClaimAmount = (data[0] as any).maxClaimAmount as string
        setMintRedeemModalState((mintModalState) => ({
          ...mintModalState,
          mint: {
            ...mintModalState.mint,
            availableToMint: availableToMint,
            minInputAmount: new Decimal(utils.formatUnits(minClaimAmount, sellToken.decimals)),
            maxInputAmount: new Decimal(utils.formatUnits(maxClaimAmount, sellToken.decimals)),
          },
        }))
        
        setMintedLRTAIKO(utils.formatUnits(data[0].claimedTotal, sellToken.decimals))
        setStakingTotal(data[0].stakedTotal)
        
      })
    LoopringAPI?.defiAPI
      ?.getTaikoFarmingUserSummary({
        accountId: accountId,
        tokenId: sellToken.tokenId,
        statuses: 'received,locked',
      })
      .then((res) => {
        setStakeInfo({
          stakingReceivedLocked: res.staking,
          totalStaked: res.totalStaked,
        })
      })

    account.apiKey && LoopringAPI.defiAPI?.getTaikoFarmingTransactions(
      {
        accountId,
        tokenId: sellToken.tokenId,
        limit: 1,
        types: 'redeem',
      } as any,
      account.apiKey,
    ).then(res => {
      if (res.transactions.length === 0) {
        setPreviousLockRecord({ status: 'notFound' })
      } else if (res.transactions.length > 0){
        const record = res.transactions[0] as any
        setPreviousLockRecord({
          status: 'found',
          TAIKOProfit: record.amount ? record.amount : '0',
          USDTProfit: record.portalOfU ? record.portalOfU : '0',
          redeemAmount: record.amountOut ? record.amountOut : '0',
          expirationTime: record.lockDuration,
        })
      }
    })

    LoopringAPI?.defiAPI
      ?.getTaikoFarmingGetRedeem({
        accountId: accountId,
        tokenId: sellToken.tokenId,
      }, '')
      .then((res) => {
        setRealizedAndUnrealized({
          realizedUSDT: res.profitOfU,
          unrealizedTaiko: res.profit,
          redeemAmount: res.redeemAmount
        })
      })
  }
  const { vaultAccountInfo } = useVaultLayer2()
  const { tokenMap: vaultTokenMap } = useVaultMap()

  const clearState = () => {
    setStakingTotal(undefined)
    setStakeInfo(undefined)
    setMintRedeemModalState({
      open: false,
      mint: {
        inputValue: '',
        warningChecked: false,
        availableToMint: '',
        minInputAmount: undefined,
        maxInputAmount: undefined,
      },
      status: 'notSignedIn',
      redeemErrorMsg: undefined,
    })
    setLocalPendingTx(undefined)
    setPendingDeposits(undefined)
    setRealizedAndUnrealized(undefined)
    setPreviousLockRecord({ status: 'init' })
    chargeFee.handleFeeChange({
      belong: 'ETH',
      fee: 0,
      feeRaw: undefined,
    } as FeeInfo)
  }
  React.useEffect(() => {
    getStakingMap()
    walletLayer2Service.sendUserUpdate()
  }, [account.readyState])
  React.useEffect(() => {
    clearState()
    const timer = setInterval(() => {
      refreshData()
    }, 10 * 1000)
    refreshData()
    return () => {
      clearInterval(timer)
    }
  }, [account.accAddress, defaultNetwork, account.accountId, account._accountIdNotActive])

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
  // React.useEffect(() => {
  //   // if (walletLayer2Status === SagaStatus.UNSET) {
  //   //   chargeFee.
  //   // }
  //   // if (reddemAmount) {
  //   //   chargeFee.checkFeeIsEnough({
  //   //     isRequiredAPI: true,
  //   //     intervalTime: LIVE_FEE_TIMES,
  //   //     tokenSymbol: sellToken.symbol,
  //   //     requestType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
  //   //     needAmountRefresh: true,
  //   //     amount: Number(reddemAmount),
  //   //   })
  //   // }
  // }, [reddemAmount, sellToken.symbol])

  

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
  const availableToMintFormatted = mintRedeemModalState.mint.availableToMint
    ? utils.formatUnits(mintRedeemModalState.mint.availableToMint, sellToken.decimals)
    : undefined
  console.log('mintRedeemModalState', mintRedeemModalState)
  const isInputInvalid =
    mintRedeemModalState.mint.inputValue && mintRedeemModalState.mint.maxInputAmount && mintRedeemModalState.mint.minInputAmount &&
    (new Decimal(mintRedeemModalState.mint.inputValue).lessThan(mintRedeemModalState.mint.minInputAmount) ||
      new Decimal(mintRedeemModalState.mint.inputValue).greaterThan(Decimal.min(availableToMintFormatted ?? '0', mintRedeemModalState.mint.maxInputAmount)))

  const { goUpdateAccount } = useUpdateAccount()
  const [feeModalState, setFeeModalState] = useState({
    open: false,
  })
  // const expirationTime = stakeInfo && last(stakeInfo.stakingReceivedLocked) 
  //   ? last(stakeInfo.stakingReceivedLocked)?.claimableTime 
  //   : undefined
  

  
  // const expireStatus: 'expired' | 'notExpired' | 'noPosition' =
  //   taikoFarmingAccountStatus === 0 
  //     ? walletLayer2 && walletLayer2['TAIKO'] && new Decimal(walletLayer2['TAIKO'].total).gt(0) 
  //       ? 'expired' : 'noPosition'
  //     : 'notExpired'

  
      
  const redeemAmount =
    settlementStatus === 'settled' && previousLockRecord && previousLockRecord.status === 'found'
      ? previousLockRecord.redeemAmount
      : realizedAndUnrealized?.redeemAmount


  console.log('chargeFee output', chargeFee)

  console.log('reddemAmount', redeemAmount)

  console.log('settlementStatus', settlementStatus)
  console.log('settlementStatus previousLockRecord', previousLockRecord)
  
  const unrealizedTAIKOBN =
    settlementStatus === 'settled'
      ? previousLockRecord.status === 'found'
        ? BigNumber.from(previousLockRecord.TAIKOProfit)
        : undefined
      : realizedAndUnrealized && realizedAndUnrealized.unrealizedTaiko
      ? BigNumber.from(realizedAndUnrealized.unrealizedTaiko)
      : undefined

  const realizedUSDTBN =
    settlementStatus === 'settled'
      ? previousLockRecord.status === 'found'
        ? BigNumber.from(previousLockRecord.USDTProfit)
        : undefined
      : realizedAndUnrealized && realizedAndUnrealized.realizedUSDT
      ? BigNumber.from(realizedAndUnrealized.realizedUSDT)
      : undefined
    // expirationTime !== undefined
    //   ? expirationTime < Date.now()
    //     ? 'expired'
    //     : 'notExpired'
    //   : 'noPosition'

      // taikoFarmingAccountStatus
  
  const daysInputInfo = (stakeInfo && hasNoLockingPos) ? {
    value: daysInput,
    onInput: (input) => {
      if (Number.isInteger(Number(input)) || input === '') {
        setDaysInput(input)
      }
    },
    disabled: false,
    unlockTime: moment().add(Number(daysInput), 'days').format('YYYY-MM-DD')
  } : {
    value: firstLockingPos 
      ? Math.max(0, moment(firstLockingPos!.claimableTime).diff(moment(), 'days')).toString()
      : '',
    onInput: (input) => {
      if (Number.isInteger(Number(input)) || input === '') {
        setDaysInput(input)
      }
    },
    disabled: true,
    unlockTime: stakeInfo?.stakingReceivedLocked && last(stakeInfo!.stakingReceivedLocked)?.claimableTime
    ? moment(last(stakeInfo!.stakingReceivedLocked)!.claimableTime).format('YYYY-MM-DD')
    : ''
    
  }
  const { walletProvider } = useWeb3ModalProvider()
  const { checkHWAddr} = useWalletInfo()
  const accountReadyStateCheck = async (activatedCallBack: () => void) => {
    if (account.readyState === AccountStatus.ACTIVATED) {
      activatedCallBack()
    } else if (account.readyState === AccountStatus.LOCKED) {
      unlockAccount()
      setShowAccount({
        isShow: true,
        step: AccountStep.UpdateAccount_Approve_WaitForAuth,
      })
      
    } else if (account.readyState === AccountStatus.NOT_ACTIVE) {
      setMintRedeemModalState({
        ...mintRedeemModalState,
        open: true,
        status: 'notSignedIn',
      })
    }
  }
  const expirationTime =
    settlementStatus === 'settled'
      ? previousLockRecord && previousLockRecord.status === 'found'
        ? previousLockRecord.expirationTime
        : 0
      : stakeInfo
      ? last(stakeInfo.stakingReceivedLocked)?.claimableTime
      : 0
  const lrTaikoInUse =
    tokenMap &&
    tokenMap['LRTAIKO'] &&
    vaultAccountInfo?.collateralInfo?.collateralTokenId === tokenMap['LRTAIKO'].tokenId
  const output = {
    stakeWrapProps: {
      disabled: false,
      buttonDisabled: btnStatus !== TradeBtnStatus.AVAILABLE || !stakeInfo,
      // || (stakeInfo && hasNoLockingPos && (!daysInputValid || !daysInput)),
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
      showMultiplier: stakeInfo && hasNoLockingPos,
      onCheckBoxChange,
      lockTaikoPlaceholder: tradeStake?.deFiSideCalcData?.stakeViewInfo?.minSellAmount
        ? `≥ ${tradeStake?.deFiSideCalcData?.stakeViewInfo?.minSellAmount}`
        : '',
      daysInput: daysInputInfo,
      myPosition: {
        totalAmount: (() => {
          const amountBN =
            settlementStatus === 'settled'
              ? previousLockRecord &&
                previousLockRecord.status === 'found' &&
                previousLockRecord.redeemAmount
              : stakingTotal
          return amountBN
            ? numberFormatThousandthPlace(utils.formatUnits(amountBN, sellToken.decimals), {
                fixed: sellToken.precision,
                removeTrailingZero: true,
                fixedRound: Decimal.ROUND_DOWN,
              })
            : '--'
        })(),
        totalAmountInCurrency: stakingAmountInCurrency,
        positions:
          stakeInfo &&
          stakeInfo.stakingReceivedLocked.map((stake) => {
            const tokenInfo = tokenMap[coinSellSymbol]
            const lockingDays = Math.floor(
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
        expirationTime,
        totalAmountWithNoSymbol: stakingAmountWithNoSymbol,
        realizedUSDT: realizedUSDTBN
          ? numberFormatThousandthPlace(utils.formatUnits(realizedUSDTBN, 6), {
              fixed: 2,
              removeTrailingZero: true,
              fixedRound: Decimal.ROUND_DOWN,
            }) + ' USDT'
          : '--',
        unrealizedTAIKO: unrealizedTAIKOBN
          ? numberFormatThousandthPlace(utils.formatUnits(unrealizedTAIKOBN, sellToken.decimals), {
              fixed: sellToken.precision,
              removeTrailingZero: true,
              fixedRound: Decimal.ROUND_UP,
            }) + ' TAIKO'
          : '--',
        settlementStatus,
        showMyPosition: !(
          (taikoFarmingAccountStatus === undefined || taikoFarmingAccountStatus === 0) &&
          account.readyState !== AccountStatus.ACTIVATED
        ),
      },
      mintButton: {
        onClick: async () => {
          accountReadyStateCheck(() => {
            setMintRedeemModalState({
              ...mintRedeemModalState,
              open: true,
              status: 'minting',
            })
          })
        },
        disabled: !(
          settlementStatus === 'minting' &&
          expirationTime &&
          expirationTime > Date.now()
        ),
      },
      redeemButton: {
        onClick: () => {
          accountReadyStateCheck(() => {
            if (
              previousLockRecord &&
              previousLockRecord.status === 'found' &&
              previousLockRecord.redeemAmount &&
              ethers.BigNumber.from(previousLockRecord.redeemAmount).gt('0')
            ) {
              setMintRedeemModalState({
                ...mintRedeemModalState,
                open: true,
                status: 'redeeming',
              })
            } else if (lrTaikoInUse) {
              setMintRedeemModalState({
                ...mintRedeemModalState,
                open: true,
                status: 'redeeming',
              })
            } else {
              setMintRedeemModalState({
                ...mintRedeemModalState,
                open: true,
                status: 'redeemError',
                redeemErrorMsg: 'No TAIKO to Redeem',
              })
            }
          })
        },
        disabled: !(
          ['settled', 'notSettled', 'minting'].includes(settlementStatus) &&
          expirationTime &&
          expirationTime < Date.now()
        ),
      },
      taikoCoinJSON: coinJson['TAIKO'],
      mintRedeemModal: {
        redeem: {
          redeemAmount: holdingTAIKO
            ? numberFormatThousandthPlace(utils.formatUnits(holdingTAIKO, sellToken.decimals), {
                fixed: sellToken.precision,
                removeTrailingZero: true,
              }) +
              ' ' +
              sellToken.symbol
            : '--',
          lrTaikoInUse,
          lockedTaikoAmount:
            previousLockRecord && previousLockRecord.status === 'found'
              ? numberFormatThousandthPlace(
                  utils.formatUnits(
                    ethers.BigNumber.from(previousLockRecord.redeemAmount).sub(
                      previousLockRecord.TAIKOProfit,
                    ),
                    sellToken.decimals,
                  ),
                  {
                    fixed: sellToken.precision,
                    removeTrailingZero: true,
                  },
                ) + ' TAIKO'
              : '--',
          pnlAmount:
            holdingLRTAIKO && mintedLRTAIKO
              ? `${
                  new Decimal(holdingLRTAIKO).sub(mintedLRTAIKO).isPos() ? '+' : '-'
                }${numberFormatThousandthPlace(
                  new Decimal(holdingLRTAIKO).sub(mintedLRTAIKO).abs().toString(),
                  { fixed: sellToken.precision, removeTrailingZero: true },
                )}`
              : '--',
          onClickConfirm: async () => {
            Promise.resolve('')
              .then(async () => {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.Taiko_Farming_Redeem_In_Progress,
                  info: {
                    amount: numberFormatThousandthPlace(
                      utils.formatUnits(holdingTAIKO!, sellToken.decimals),
                      {
                        fixed: sellToken.precision,
                        removeTrailingZero: true,
                      },
                    ),
                  },
                })
                if (!exchangeInfo) {
                  throw new Error('No exchangeInfo')
                }
                const storageId = await LoopringAPI.userAPI?.getNextStorageId(
                  {
                    accountId: account.accountId,
                    sellTokenId: sellToken.tokenId,
                  },
                  account.apiKey,
                )
                if (!storageId) {
                  throw new Error('No storageId')
                }
                let isHWAddr = checkHWAddr(account.accAddress)
                const tokenVolume =
                  chargeFee.feeInfo.__raw__.tokenId === sellToken.tokenId
                    ? ethers.BigNumber.from(holdingTAIKO!)
                        .sub(chargeFee.feeInfo.__raw__.feeRaw)
                        .toString()
                    : holdingTAIKO!.toString()
                const request: sdk.OffChainWithdrawalRequestV3 = {
                  exchange: exchangeInfo.exchangeAddress,
                  owner: account.accAddress,
                  to: account.accAddress,
                  accountId: account.accountId,
                  storageId: storageId?.offchainId,
                  token: {
                    tokenId: sellToken.tokenId,
                    volume: tokenVolume,
                  },
                  maxFee: {
                    tokenId: chargeFee.feeInfo.__raw__.tokenId,
                    volume: chargeFee.feeInfo.__raw__.feeRaw,
                  },
                  fastWithdrawalMode: false,
                  extraData: '',
                  minGas: 0,
                  validUntil: getTimestampDaysLater(DAYS),
                }
                return LoopringAPI.userAPI?.submitOffchainWithdraw(
                  {
                    request: {
                      ...request,
                    },
                    web3: new Web3(walletProvider as any),
                    chainId: defaultNetwork,
                    walletType: sdk.ConnectorNames.Unknown,
                    eddsaKey: account.eddsaKey.sk,
                    apiKey: account.apiKey,
                    isHWAddr,
                  },
                  {
                    accountId: account.accountId,
                    counterFactualInfo: account.eddsaKey.counterFactualInfo,
                  },
                )
              })
              .then((res) => {
                if (res?.code) {
                  throw new Error(res.message)
                }
                setShowAccount({
                  isShow: true,
                  step: AccountStep.Taiko_Farming_Redeem_Success,
                  info: {
                    amount: numberFormatThousandthPlace(
                      utils.formatUnits(holdingTAIKO!, sellToken.decimals),
                      {
                        fixed: sellToken.precision,
                        removeTrailingZero: true,
                      },
                    ),
                    redeemAt: Date.now(),
                  },
                })
                updateWalletLayer2()
                setMintRedeemModalState((state) => ({
                  ...state,
                  open: false,
                }))
              })
              .catch((e) => {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.Taiko_Farming_Redeem_Failed,
                  error: e,
                })
              })
          },
          fee: chargeFee.feeInfo.fee + ' ' + chargeFee.feeInfo.belong,
          onClickFee: () => {
            setFeeModalState({
              ...feeModalState,
              open: true,
            })
          },
          readlizedUSDT: realizedUSDTBN
            ? numberFormatThousandthPlace(utils.formatUnits(realizedUSDTBN, 6), {
                fixed: 2,
                removeTrailingZero: true,
              }) + ' USDT'
            : '--',
          unrealizedTAIKO: unrealizedTAIKOBN
            ? numberFormatThousandthPlace(
                utils.formatUnits(unrealizedTAIKOBN, sellToken.decimals),
                { fixed: sellToken.precision, removeTrailingZero: true },
              ) + ' TAIKO'
            : '--',
        },
        onClickSignIn: async () => {
          setMintRedeemModalState({
            ...mintRedeemModalState,
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
              setMintRedeemModalState({
                ...mintRedeemModalState,
                status: 'signedIn',
              })
            })
            .catch(() => {
              setMintRedeemModalState({
                ...mintRedeemModalState,
                status: 'notSignedIn',
              })
            })
        },
        onClickMint: () => {
          setMintRedeemModalState({
            ...mintRedeemModalState,
            status: 'minting',
          })
        },
        open: mintRedeemModalState.open,
        onClose: () => {
          setMintRedeemModalState({
            ...mintRedeemModalState,
            open: false,
          })
        },
        onClickMax: () => {
          setMintRedeemModalState({
            ...mintRedeemModalState,
            mint: {
              ...mintRedeemModalState.mint,
              inputValue: utils.formatUnits(
                mintRedeemModalState.mint.availableToMint,
                sellToken.decimals,
              ),
            },
          })
        },
        mintWarningChecked: mintRedeemModalState.mint.warningChecked,
        // mintWarningText: t('labelTaikoFarmingMintWarningText'),
        onWarningCheckBoxChange: () => {
          setMintRedeemModalState({
            ...mintRedeemModalState,
            mint: {
              ...mintRedeemModalState.mint,
              warningChecked: !mintRedeemModalState.mint.warningChecked,
            },
          })
        },
        onConfirmBtnClicked: async () => {
          setShowAccount({
            isShow: true,
            step: AccountStep.Taiko_Farming_Mint_In_Progress,
            info: {
              symbol: 'lrTAIKO',
              amount: numberFormatThousandthPlace(mintRedeemModalState.mint.inputValue, {
                fixed: 18,
                removeTrailingZero: true,
              }),
              mintAt: Date.now(),
            },
          })

          const res = await submitTaikoFarmingMint({
            amount: utils.parseUnits(mintRedeemModalState.mint.inputValue, sellToken.decimals),
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
                          amount: numberFormatThousandthPlace(
                            mintRedeemModalState.mint.inputValue,
                            {
                              fixed: sellToken.precision,
                              removeTrailingZero: true,
                            },
                          ),
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
                          amount: numberFormatThousandthPlace(
                            mintRedeemModalState.mint.inputValue,
                            {
                              fixed: 18,
                              removeTrailingZero: true,
                            },
                          ),
                          mintAt: Date.now(),
                        },
                      })
                      setMintRedeemModalState({
                        ...mintRedeemModalState,
                        mint: {
                          ...mintRedeemModalState.mint,
                          inputValue: '',
                          warningChecked: false,
                        },
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
              refreshData()
            })
        },
        onInput: (input: string) => {
          if (
            (isNumberStr(input) && strNumDecimalPlacesLessThan(input, sellToken.precision + 1)) ||
            input === ''
          ) {
            setMintRedeemModalState({
              ...mintRedeemModalState,
              mint: {
                ...mintRedeemModalState.mint,
                inputValue: input,
              },
            })
          }
        },
        inputValue: mintRedeemModalState.mint.inputValue,
        confirmBtnDisabled:
          !isNumberStr(mintRedeemModalState.mint.inputValue) ||
          !mintRedeemModalState.mint.warningChecked ||
          !mintRedeemModalState.mint.availableToMint ||
          new Decimal(availableToMintFormatted!).eq('0') ||
          isInputInvalid
            ? true
            : false,
        confirmBtnWording:
          isInputInvalid || !mintRedeemModalState.mint.inputValue
            ? availableToMintFormatted &&
              mintRedeemModalState.mint.minInputAmount &&
              mintRedeemModalState.mint.maxInputAmount &&
              Decimal.min(mintRedeemModalState.mint.maxInputAmount, availableToMintFormatted).gte(
                mintRedeemModalState.mint.minInputAmount,
              )
              ? `Please input between ${mintRedeemModalState.mint.minInputAmount.toString()} - ${Decimal.min(
                  mintRedeemModalState.mint.maxInputAmount,
                  availableToMintFormatted,
                ).toString()}`
              : 'Invalid amount'
            : !mintRedeemModalState.mint.warningChecked
            ? 'Please check checkbox'
            : 'Confirm',
        tokenAvailableAmount: availableToMintFormatted ? availableToMintFormatted : '--',
        inputPlaceholder:
          mintRedeemModalState.mint.minInputAmount && mintRedeemModalState.mint.maxInputAmount
            ? availableToMintFormatted &&
              Decimal.min(mintRedeemModalState.mint.maxInputAmount, availableToMintFormatted).gte(
                mintRedeemModalState.mint.minInputAmount,
              )
              ? `${mintRedeemModalState.mint.minInputAmount.toString()} - ${Decimal.min(
                  mintRedeemModalState.mint.maxInputAmount,
                  availableToMintFormatted,
                ).toString()}`
              : `≥ ${mintRedeemModalState.mint.minInputAmount.toString()}`
            : '',
        status: mintRedeemModalState.status,
        redeemErrorMsg: mintRedeemModalState.redeemErrorMsg,
      },
      feeModal: {
        ...chargeFee,
        isFeeNotEnough: chargeFee.isFeeNotEnough.isFeeNotEnough,
        open: feeModalState.open,
        onClose: () => {
          setFeeModalState({
            ...feeModalState,
            open: false,
          })
        },
        onClickFee: () => {
          setFeeModalState({
            ...feeModalState,
            open: true,
          })
        },
        handleToggleChange: (fee) => {
          chargeFee.handleFeeChange(fee)
        },
        feeLoading: false,
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
      lrTAIKOTradeEarnSummary: mintedLRTAIKO &&
        holdingLRTAIKO && {
          holdingAmount: numberFormatThousandthPlace(holdingLRTAIKO, {
            fixed: sellToken.precision,
            removeTrailingZero: true,
          }),
          mintedAmount: numberFormatThousandthPlace(mintedLRTAIKO, {
            fixed: sellToken.precision,
            removeTrailingZero: true,
          }),
          pnl: `${
            new Decimal(holdingLRTAIKO).sub(mintedLRTAIKO).isPos() ? '+' : '-'
          }${numberFormatThousandthPlace(
            new Decimal(holdingLRTAIKO).sub(mintedLRTAIKO).abs().toString(),
            { fixed: sellToken.precision, removeTrailingZero: true },
          )} TAIKO`,
          // pnl: `--`,
        },
    },
  }
  console.log('output', output)
  return output
}
