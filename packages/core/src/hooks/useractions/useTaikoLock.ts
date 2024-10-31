import React from 'react'
import {
  AccountStep,
  DeFiSideWrapProps,
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
  calcSideStaking,
  fiatNumberDisplay,
  getTimestampDaysLater,
  isNumberStr,
  makeWalletLayer2,
  numberFormat,
  numberFormatThousandthPlace,
  numberStringListSum,
  useStakingMap,
  useSubmitBtn,
  useWalletLayer2Socket,
} from '@loopring-web/core'
import _, { isNumber } from 'lodash'

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
import { useTokenPrices, useTradeStake } from '../../stores'
import { symbol } from 'prop-types'
import Decimal from 'decimal.js'
import { BigNumber, Contract, providers, utils } from 'ethers'
import moment from 'moment'
import { on } from 'events'

// providers
const depositContractABI = [
  {
    inputs: [{ internalType: 'address', name: '_exchange', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'from', type: 'address' },
      { indexed: false, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'address', name: 'token', type: 'address' },
      { indexed: false, internalType: 'uint96', name: 'amount', type: 'uint96' },
      { indexed: false, internalType: 'uint256', name: 'duration', type: 'uint256' },
    ],
    name: 'Deposited',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'address', name: 'tokenAddress', type: 'address' },
      { internalType: 'uint96', name: 'amount', type: 'uint96' },
      { internalType: 'uint256', name: 'duration', type: 'uint256' },
      { internalType: 'bytes', name: 'extraData', type: 'bytes' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'exchange',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
]
const depositContractAddr = '0x40aCCf1a13f4960AC00800Dd6A4afE82509C2fD2'

const depositTaikoWithDuration = async (
  provider: providers.Web3Provider,
  amount: BigNumber,
  duration: BigNumber,
) => {
  const contract = new Contract(depositContractAddr, depositContractABI, provider)
  const tx = await contract.deposit(amount, duration)
  return tx.wait()
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
  const claimedTotal = positions && positions[0] && positions[0].claimedTotal
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
  const { setShowAccount } = useOpenModals()
  const { status: stakingMapStatus, marketMap: stakingMap, getStakingMap } = useStakingMap()

  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals()
  const { tradeStake, updateTradeStake, resetTradeStake } = useTradeStake()
  const { exchangeInfo, allowTrade, getValueInCurrency } = useSystem()
  const { toggle } = useToggle()
  const { defaultNetwork, currency, coinJson } = useSettings()
  const sellToken = tokenMap[coinSellSymbol]
  const taikoFarmingPrecision = 2
  // const tokenId = tokenMap[coinSellSymbol].tokenId

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
      //_.cloneDeep({ ...tradeStake, ..._tradeStake });
      myLog('defi handleOnchange', _oldTradeStake)

      if (tradeData && coinSellSymbol) {
        const inputValue = tradeData?.tradeValue?.toString() ?? ''
        // ? numberFormat(tradeData?.tradeValue?.toString(), {
        //     fixed: taikoFarmingPrecision
        //   })
        // : ''

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
      let walletMap: any = {}
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
          deFiSideCalcDataInit.stakeViewInfo = { ...item }
        } else {
          throw new Error('no product')
        }

        if (account.readyState === AccountStatus.ACTIVATED) {
          if (clearTrade === true) {
            walletLayer2Service.sendUserUpdate()
          }
          walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap ?? {}

          deFiSideCalcDataInit.coinSell.balance = walletMap[coinSellSymbol]?.count
            ? numberFormat(walletMap[coinSellSymbol]?.count, {
                fixed: taikoFarmingPrecision,
                removeTrailingZero: true,
              })
            : undefined
        }

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

  const walletLayer2Callback = React.useCallback(async () => {
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
      let walletMap: any
      if (account.readyState === AccountStatus.ACTIVATED) {
        walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap
        deFiSideCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: numberFormat(walletMap[coinSellSymbol]?.count, {
            fixed: taikoFarmingPrecision,
            removeTrailingZero: true,
          }),
        }
      } else {
        deFiSideCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: undefined,
        }
      }
      const tradeData = {
        ...deFiSideCalcDataInit.coinSell,
        tradeValue,
      }
      myLog('resetDefault Defi walletLayer2Callback', tradeData)
      handleOnchange({ tradeData })
    }
  }, [account.readyState, coinSellSymbol, handleOnchange, tradeStake.deFiSideCalcData])

  useWalletLayer2Socket({ walletLayer2Callback })
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

  const onSubmitBtnClick = React.useCallback(async () => {
    // const tradeStake = store.getState().router_tradeStake.tradeStake;
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      tokenMap &&
      exchangeInfo &&
      account.eddsaKey?.sk
    ) {
      if (allowTrade && !allowTrade.defiInvest.enable) {
        setShowSupport({ isShow: true })
      } else if (toggle && !toggle['taikoFarming'].enable) {
        setShowTradeIsFrozen({ isShow: true, type: 'StakingInvest' })
      } else {
        sendRequest()
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
    t,
  ])

  const [daysInput, setDaysInput] = React.useState('')
  const daysInputValid = Number.isInteger(Number(daysInput)) && Number(daysInput) >= 15

  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const account = store.getState().account
    const tradeStake = store.getState()._router_tradeStake.tradeStake
    myLog('tradeStake', tradeStake)
    if (account.readyState === AccountStatus.ACTIVATED) {
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
        // return {
        //   tradeBtnStatus: TradeBtnStatus.DISABLED,
        //   label: `labelDefiNoEnough| ${coinSellSymbol}`,
        // };
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
          label: 'days is not valid',
        }
      } else {
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' } // label: ''}
      }
    }
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
  const {
    btnStatus,
    onBtnClick,
    btnLabel: tradeMarketI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback: onSubmitBtnClick,
  })
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
    new Decimal(stakingAmountRaw).mul(tokenPrices[sellToken.symbol]).toString() &&
    getValueInCurrency(new Decimal(stakingAmountRaw).mul(tokenPrices[sellToken.symbol]).toString())
      ? fiatNumberDisplay(
          getValueInCurrency(
            new Decimal(stakingAmountRaw).mul(tokenPrices[sellToken.symbol]).toString(),
          ),
          currency,
        )
      : undefined

  // const res =

  // const { exchangeInfo }= useSystem()
  const [mintModalState, setMintModalState] = React.useState({
    open: false,
    inputValue: '',
    warningChecked: false,
    availableToMint: '',
  })

  const updateStakingState = async () => {
    if (account.readyState === AccountStatus.ACTIVATED && account.apiKey) {
      // const a = await submitTaikoFarmingMint({
      //   accountId: account.accountId,
      //   apiKey: account.apiKey,
      //   exchangeAddress: exchangeInfo!.exchangeAddress,
      //   preOrderHash: '',
      //   tokenId: sellToken.tokenId,
      //   eddsaSk: account.eddsaKey.sk
      // })

      // setShowAccount({
      //   isShow: true,
      //   step: AccountStep.Taiko_Farming_Mint_Success,
      //   info: {
      //     symbol: 'ETH',
      //     amount: '100',
      //     mintAt: 1
      //   },
      // })
      // setShowAccount({
      //   isShow: true,
      //   step: AccountStep.Taiko_Farming_Mint_Failed,
      //   info: {
      //     error: {
      //       msg: 'error'
      //     },
      //   },
      // })

      // const preOrderHash = ''
      // const storageId  = await LoopringAPI?.userAPI?.getNextStorageId(
      //   {
      //     accountId: account.accountId,
      //     sellTokenId: sellToken.tokenId,
      //   },
      //   account.apiKey,
      // )

      // const avaiableNFT =await LoopringAPI?.defiAPI?.getTaikoFarmingAvailableNft({
      //   accountId: account.accountId
      // }, account.apiKey)
      // const position = await LoopringAPI?.defiAPI?.getTaikoFarmingPositionInfo({
      //   accountId: account.accountId
      // }, account.apiKey)
      // position
      // debugger
      // .then((avaiableNFT) => {

      // }).catch((res) => {
      //   // debugger
      // })

      // const taikoFarmingSubmit: sdk.TaikoFarmingSubmitRequest = {
      //   exchange: exchangeInfo!.exchangeAddress,
      //   accountId: account.accountId,
      //   storageId: storageId!.orderId,
      //   sellToken: {
      //     tokenId: sellToken.tokenId,
      //     amount: utils.parseUnits('10', 18).toString(),
      //   },
      //   buyToken: {
      //     tokenId: avaiableNFT!.tokenId,
      //     nftData: avaiableNFT!.nftData,
      //     amount: '1',
      //   },
      //   allOrNone: false,
      //   fillAmountBOrS: true,
      //   validUntil: getTimestampDaysLater(365 * 10),
      //   maxFeeBips: 100,
      //   preOrderHash: preOrderHash
      // }
      // debugger
      // LoopringAPI?.defiAPI?.submitTaikoFarmingClaim({
      //   request:taikoFarmingSubmit,
      //   apiKey: account.apiKey,
      //   eddsaKey: account.eddsaKey.sk,
      // }).then((res) => {
      //   debugger
      // }).catch((res) => {
      //   debugger
      // })

      LoopringAPI?.defiAPI
        ?.getTaikoFarmingPositionInfo(
          {
            accountId: account.accountId,
          },
          account.apiKey,
        )
        .then((res) => {
          const availableToMint = (res && res[0] && res[0].claimableTotal) ?? '0'
          
          setMintModalState({
            ...mintModalState,
            availableToMint: availableToMint,
          })
        })
      LoopringAPI?.defiAPI
        ?.getTaikoFarmingUserSummary(
          {
            accountId: account.accountId,
            tokenId: sellToken.tokenId,
          },
          account.apiKey,
        )
        .then((res) => {
          setStakeInfo({
            staking: res.staking,
            totalStaked: res.totalStaked,
          })
        })
      // LoopringAPI?.defiAPI?.getTaikoFarmingTransactions({
      //   accountId: account.accountId,
      //   tokenId: sellToken.tokenId,
      // }, account.apiKey).then((res) => {
      //   res
      //   debugger
      // }).catch(e => {
      //   debugger
      // })
      // LoopringAPI?.defiAPI?.getStakeSummary({
      //   accountId: account.accountId,
      //   tokenId: sellToken.tokenId,
      // }, account.apiKey).then((res) => {
      //   const resData = res as {
      //     raw_data: unknown;
      //     totalNum: number;
      //     totalStaked: string;
      //     totalStakedRewards: string;
      //     totalLastDayPendingRewards: string;
      //     totalClaimableRewards: string;
      //     list: sdk.StakeInfoOrigin[];
      //   }
      //   setStakingTotal(resData.totalStaked)
      // })
    } else {
      setStakingTotal(undefined)
      setStakeInfo(undefined)
      setMintModalState({
        open: false,
        inputValue: '',
        warningChecked: false,
        availableToMint: '',
      })
    }
  }
  React.useEffect(() => {
    getStakingMap()
    walletLayer2Service.sendUserUpdate()
    updateStakingState()
  }, [account.apiKey])
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
      // setToastOpen({
      //
      // })
    }
    return () => {
      resetTradeStake()
      handleOnchange.cancel()
    }
  }, [stakingMapStatus])

  const btnInfo = {
    label: tradeMarketI18nKey,
    params: {},
  }

  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const btnLabel = React.useMemo(() => {
    if (btnInfo?.label) {
      const key = btnInfo?.label.split('|')
      return t(
        key[0],
        key && key[1]
          ? {
              arg: key[1],
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
    } else {
      return t(`labelInvestBtn`, {
        layer2: L1L2_NAME_DEFINED[network].layer2,
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [t, btnInfo])

  // const isMintInputValid = mintModalState.inputValue ?
  const availableToMintFormatted = mintModalState.availableToMint
    ? utils.formatUnits(mintModalState.availableToMint, sellToken.decimals)
    : undefined
  return {
    stakeWrapProps: {
      disabled: false,
      buttonDisabled:
        account.readyState === AccountStatus.ACTIVATED &&
        (isLoading || !daysInput || !daysInputValid),
      btnInfo,
      isJoin: true,
      isLoading,
      switchStobEvent: (_isStoB: boolean | ((prevState: boolean) => boolean)) => {},
      onSubmitClick: onBtnClick as () => void,
      onChangeEvent: handleOnchange,
      deFiSideCalcData: {
        ...tradeStake.deFiSideCalcData,
      },
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
      daysInput: {
        value: daysInput,
        onInput: (input) => {
          if (Number.isInteger(Number(input)) || input === '') {
            setDaysInput(input)
          }
        },
      },
      myPosition: stakeInfo
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
          setMintModalState({
            ...mintModalState,
            open: true,
          })
        },
        disabled: false,
      },
      taikoCoinJSON: coinJson['TAIKO'],
      mintModal: {
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
              symbol: sellToken.symbol,
              amount: numberFormatThousandthPlace(mintModalState.inputValue, {
                fixed: sellToken.precision,
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
              setShowAccount({
                isShow: true,
                step: AccountStep.Taiko_Farming_Mint_Success,
                info: {
                  symbol: sellToken.symbol,
                  amount: numberFormatThousandthPlace(mintModalState.inputValue, {
                    fixed: sellToken.precision,
                    removeTrailingZero: true,
                  }),
                  mintAt: Date.now(),
                },
              })
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
          if (isNumberStr(input) || input === '') {
            setMintModalState({
              ...mintModalState,
              inputValue: input,
            })
          }
        },
        inputValue: mintModalState.inputValue,
        // disable confirm button if:
        // 1. input value is not a valid number
        // 2. warning checkbox is not checked
        // 3. available to mint is 0
        // 4. input value is larger than available to mint
        confirmBtnDisabled:
          !isNumberStr(mintModalState.inputValue) ||
          !mintModalState.warningChecked ||
          !mintModalState.availableToMint ||
          new Decimal(availableToMintFormatted!).eq('0') ||
          !(
            availableToMintFormatted &&
            new Decimal(availableToMintFormatted).greaterThanOrEqualTo(mintModalState.inputValue)
          ),
        tokenAvailableAmount: availableToMintFormatted
          ? availableToMintFormatted
          : '--',
      },
    },
  }
}
