import {
  Box,
  Typography,
  Button,
} from '@mui/material'

import React, { useEffect } from 'react'
import {
  PriceTag,
  CurrencyToTag,
  EmptyValueTag,
  VaultAction,
  L1L2_NAME_DEFINED,
  MapChainId,
  SoursURL,
  RouterPath,
  VaultKey,
  TradeBtnStatus,
  VaultLoanType,
  SUBMIT_PANEL_CHECK,
  SUBMIT_PANEL_AUTO_CLOSE,
  fnType,
  SagaStatus,
  AccountStatus,
  myLog,
  TokenType,
  globalSetup,
  MarketType,
  ToastType,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  useOpenModals,
  useSettings,
  AccountStep,
  useToggle,
  VaultDataAssetsItem,
  VaultAssetsTableProps,
  setShowWrongNetworkGuide,
  Button as MyButton,
  setHideSmallBalances,
} from '@loopring-web/component-lib'
import { Trans, useTranslation } from 'react-i18next'
import {
  accountReducer,
  accountStaticCallBack,
  DAYS,
  fiatNumberDisplay,
  getTimestampDaysLater,
  LoopringAPI,
  makeVaultLayer2,
  numberFormat,
  numberFormatThousandthPlace,
  numberStringListSum,
  store,
  useAccount,
  useVaultAccountInfo,
  useSystem,
  useTokenMap,
  useVaultLayer2,
  useVaultMap,
  useVaultTicker,
  useWalletLayer2,
  VaultAccountInfoStatus,
  WalletConnectL2Btn,
  // useVaultSwap,
  MAPFEEBIPS,
  vaultSwapDependAsync,
  useToast,
  toPercent,
  bipsToPercent,
} from '@loopring-web/core'
import { useTheme } from '@emotion/react'
import { useVaultMarket } from '../HomePanel/hook'
import { useHistory, useLocation, useRouteMatch } from 'react-router'
import { utils, BigNumber } from 'ethers'
import Decimal from 'decimal.js'
import _, { keys } from 'lodash'
import { CollateralDetailsModalProps, DebtModalProps, DustCollectorProps, DustCollectorUnAvailableModalProps, LeverageModalProps, MaximumCreditModalProps, VaultDashBoardPanelUIProps } from '../interface'
import { PositionItem, VaultPositionsTableProps } from '@loopring-web/component-lib/src/components/tableList/assetsTable/VaultPositionsTable'
import { AutoRepayModalProps, CloseConfirmModalProps, NoAccountHintModalProps, SettleConfirmModalProps, SmallOrderAlertProps, SupplyCollateralHintModalProps, VaultSwapModalProps } from '../components/modals'
import { useVaultSwap } from './useVaultSwap'
import { checkHasTokenNeedRepay, closePositionAndRepayIfNeeded, filterPositions, repayIfNeeded } from '../utils'
import { promiseAllSequently } from '@loopring-web/core/src/utils/promise'

const VaultPath = `${RouterPath.vault}/:item/:method?`

const parseVaultTokenStatus = (status: number) => ({
  show: status & 1,
  join: status & 2,
  exit: status & 4,
  loan: status & 8,
  repay: status & 16,
})

export const useGetVaultAssets = <R extends VaultDataAssetsItem>({
  onClickTrade,
  onClickRepay
}: {
  onClickTrade: (symbol: string) => void
  onClickRepay: (symbol: string) => void
  // onClickRepay: (symbol: string) => void
}): VaultAssetsTableProps<R> & {
  totalAsset: string
  [key: string]: any
  
} => {
  const _vaultAccountInfo = useVaultAccountInfo()
  let match: any = useRouteMatch(VaultPath)
  const history = useHistory()
  const { search, pathname } = useLocation()
  const searchParams = new URLSearchParams(search)
  const { t } = useTranslation(['common'])

  const {
    vaultAccountInfoStatus,
    vaultAccountInfo,
    activeInfo,
    onJoinPop,
    onSwapPop,
    onBorrowPop,
    onRedeemPop,
  } = _vaultAccountInfo
  const [assetsRawData, setAssetsRawData] = React.useState<R[]>([])
  const [totalAsset, setTotalAsset] = React.useState<string>(EmptyValueTag)
  const { account } = useAccount()
  const { allowTrade, forexMap } = useSystem()

  const {
    setShowNoVaultAccount,
    setShowVaultSwap,
    setShowVaultLoan,
    modals: {
      isShowNoVaultAccount: { isShow: showNoVaultAccount, whichBtn, ...btnProps },
    },
  } = useOpenModals()

  const { isMobile, defaultNetwork, hideL2Assets, hideSmallBalances, setHideSmallBalances } =
    useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const btnClickCallbackArray = {
    [fnType.ERROR_NETWORK]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: false }))
        store.dispatch(setShowWrongNetworkGuide({ isShow: true }))
      },
    ],
    [fnType.UN_CONNECT]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.NO_ACCOUNT]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.DEPOSITING]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.NOT_ACTIVE]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.LOCKED]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.ACTIVATED]: [
      (
        accountStatus: sdk.VaultAccountStatus,
        activeInfo: {
          hash: string
          isInActive: true
        },
        key: any,
      ) => {
        if (
          [sdk.VaultAccountStatus.IN_STAKING].includes(accountStatus as any) ||
          activeInfo?.hash
        ) {
          switch (key) {
            case VaultAction.VaultJoin:
              onJoinPop({})
              // setShowVaultJoin({ isShow: true, info: { isActiveAccount: false } })
              break
            case VaultAction.VaultExit:
              onRedeemPop({ isShow: true })
              break
            case VaultAction.VaultLoan:
              onBorrowPop({ isShow: true })
              break
            case VaultAction.VaultSwap:
              onSwapPop({})
              break
          }
        } else if (
          [sdk.VaultAccountStatus.IN_REDEEM].includes(vaultAccountInfo?.accountStatus as any)
        ) {
          
        } else {
          setShowNoVaultAccount({
            isShow: true,
            whichBtn: VaultAction.VaultJoin,
            des: 'labelJoinDesMessage',
            title: 'labelVaultJoinTitle',
          })
        }
      },
      [vaultAccountInfo?.accountStatus, activeInfo?.hash],
    ],
  }
  const onActionBtnClick = (props: string) => {
    accountStaticCallBack(btnClickCallbackArray, [props])
  }
  React.useEffect(() => {
    if (
      match?.params?.item == VaultKey.VAULT_DASHBOARD &&
      vaultAccountInfoStatus === SagaStatus.UNSET
    ) {
      const { vaultAccountInfo } = store.getState().vaultLayer2
      if (vaultAccountInfo?.accountStatus) {
        if ([sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus as any)) {
          if (match?.params?.method) {
            switch (match?.params?.method) {
              case VaultAction.VaultJoin:
                onJoinPop({})
                // setShowVaultJoin({ isShow: true, info: { isActiveAccount: false } })
                break
              case VaultAction.VaultExit:
                onRedeemPop({ isShow: true, symbol: searchParams.get('symbol') })
                break
              case VaultAction.VaultLoan:
                onBorrowPop({ isShow: true, symbol: searchParams.get('symbol') })
                break
              case VaultAction.VaultSwap:
                onSwapPop({ isShow: true, symbol: searchParams.get('symbol') })
                break
            }
            history.replace(`${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}`)
          }
        }
      } else {
        
      }
    }
  }, [vaultAccountInfoStatus, match?.params?.item, match?.params?.method])
  
  const { status: walletL2Status } = useWalletLayer2()
  const getAssetsRawData = () => {
    const {
      // vaultLayer2: { vaultAccountInfo },
      tokenMap: {
        // tokenMap: erc20TokenMap,
        idIndex: erc20IdIndex,
      },

      invest: {
        vaultMap: { tokenMap,  tokenPrices },
      },
    } = store.getState()
    const walletMap = makeVaultLayer2({ needFilterZero: false }).vaultLayer2Map ?? {}
    myLog('asdfhsjdhfjsd', tokenMap, walletMap)
    if (
      tokenMap &&
      !!Object.keys(tokenMap).length &&
      !!Object.keys(walletMap ?? {}).length
    ) {
      const data: Array<any> = Object.keys(tokenMap ?? {})
      .map((key, _index) => {
        let item: any
        let tokenInfo = {
          ...tokenMap[key],
          token: key,
          erc20Symbol: erc20IdIndex[tokenMap[key].tokenId],
        }
        const erc20Symbol = key.slice(2)
        if (walletMap && walletMap[key]) {
          tokenInfo = {
            ...tokenInfo,
            detail: walletMap[key],
            erc20Symbol: erc20IdIndex[tokenMap[key].tokenId],
          }
          const totalAmount = sdk.toBig(tokenInfo.detail?.asset ?? 0)
          const borrowedAmount = sdk.toBig(tokenInfo.detail?.borrowed ?? 0)

          const tokenValueDollar = totalAmount?.times(tokenPrices?.[tokenInfo.symbol] ?? 0)
          const tokenBorrowedValueDollar = borrowedAmount?.times(tokenPrices?.[tokenInfo.symbol] ?? 0)
          const isSmallBalance = tokenValueDollar.lt(1) 
            && tokenBorrowedValueDollar.lt(1)
          
          const minRepayAmount = utils.formatUnits(
            utils.parseUnits('1', tokenInfo.decimals - tokenInfo.vaultTokenAmounts.qtyStepScale),
            tokenInfo.decimals,
          )
          
          item = {
            token: {
              type: TokenType.vault,
              value: key,
              belongAlice: erc20Symbol,
            },
            amount: totalAmount?.toString(),
            available: tokenInfo?.detail?.count ?? 0,
            smallBalance: isSmallBalance,
            tokenValueDollar: tokenValueDollar.toString(),
            name: tokenInfo.token,
            erc20Symbol,
            debt:borrowedAmount.toString(),
            equity: numberFormat(tokenInfo.detail?.equity ?? '0', {
              fixed: tokenInfo.precision,
              removeTrailingZero: true,
              fixedRound: Decimal.ROUND_FLOOR,
            }),
            repayDisabled:
              borrowedAmount.isZero() ||
              totalAmount.isZero() ||
              totalAmount.lt(minRepayAmount) ||
              borrowedAmount.lt(minRepayAmount),
          }
        } else {
          item = {
            ...tokenInfo,
            token: {
              type: TokenType.vault,
              value: key,
              belongAlice: erc20Symbol,
            },
            amount: 0,
            available: 0,
            locked: 0,
            smallBalance: true,
            tokenValueDollar: 0,
            name: key,
            tokenValueYuan: 0,
            erc20Symbol,
            debt: '0',
            equity: '0',
            repayDisabled: true
          }
        }
        if (item) {
          let precision = tokenMap[item.token.value].precision
          return {
            ...item,
            precision: precision,

            // holding: '100-todo',
            // equity: '100-todo',
          }
        } else {
          return undefined
        }
      })
      .filter(token => {
        const status = tokenMap['LV' + token.erc20Symbol].vaultTokenAmounts.status as number
        return token && parseVaultTokenStatus(status).loan && parseVaultTokenStatus(status).repay
      }).sort((a, b) => {
        const deltaDollar = b.tokenValueDollar - a.tokenValueDollar
        const deltaAmount = sdk.toBig(b.amount).minus(a.amount).toNumber()
        const deltaName = b.token.value < a.token.value ? 1 : -1
        return deltaDollar !== 0 ? deltaDollar : deltaAmount !== 0 ? deltaAmount : deltaName
      })
      const totalAssets = data.reduce(
        (pre, item) => pre.plus(sdk.toBig(item.tokenValueDollar)),
        sdk.toBig(0),
      )
      setAssetsRawData(data)
      setTotalAsset(totalAssets.toString())
    } else {
      setAssetsRawData([])
      setTotalAsset(EmptyValueTag)
    }
  }
  const startWorker = _.debounce(getAssetsRawData, globalSetup.wait)
  React.useEffect(() => {
    if (
      showNoVaultAccount &&
      vaultAccountInfoStatus === SagaStatus.UNSET &&
      vaultAccountInfo?.accountStatus && walletL2Status === SagaStatus.UNSET &&
      whichBtn &&
      vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING
    ) {
      onActionBtnClick(whichBtn)
    }
    // enableBtn()
  }, [
    whichBtn,
    walletL2Status,
    vaultAccountInfo?.accountStatus,
    activeInfo,
    assetsRawData,
    // tokenPriceStatus,
  ])
  const walletLayer2Callback = React.useCallback(() => {
    startWorker()
  }, [])
  React.useEffect(() => {
    if (vaultAccountInfoStatus === SagaStatus.UNSET) {
      walletLayer2Callback()
    }
  }, [vaultAccountInfoStatus])
  const onRowClick = React.useCallback(
    ({ row }: { row: R }) => {
      
      if ([sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus ?? '')) {
        history.push('/portal/portalDashboard')
        onSwapPop({ symbol: row?.token?.value })
      } else {
        history.push('/portal')
        setShowNoVaultAccount({
          isShow: true,
          whichBtn: VaultAction.VaultJoin,
          des: 'labelJoinDesMessage',
          title: 'labelVaultJoinTitle',
        })
      }
    },
    [vaultAccountInfo?.accountStatus],
  )
  return {
    btnProps,
    onBtnClose: () => {
      setShowNoVaultAccount({ isShow: false, whichBtn: undefined })
    },
    forexMap,
    rawData: assetsRawData as R[],
    hideAssets: hideL2Assets,
    allowTrade,
    setHideSmallBalances,
    hideSmallBalances,
    showFilter: true,
    totalAsset,
    showNoVaultAccount,
    actionRow: ({ row }) => {
      return (
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onRowClick({ row })
          }}
        >
          {t('labelTrade')}
        </Button>
      )
    },
    onRowClick: (_, row) => {
      onRowClick({ row })
    },
    positionOpend: [sdk.VaultAccountStatus.IN_REDEEM, sdk.VaultAccountStatus.IN_STAKING]
      .includes(vaultAccountInfo?.accountStatus as any),
    onRowClickTrade: ({ row }: { row: R }) => {
      // debugger
      onClickTrade(row?.token?.value)
      // if ([sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus ?? '')) {
      //   history.push('/portal/portalDashboard')
      //   onSwapPop({ symbol: row?.token?.value })
      // } else {
      //   history.push('/portal/portalDashboard')

      //   // setstate
      //   // setShowNoVaultAccount({
      //   //   isShow: true,
      //   //   whichBtn: VaultAction.VaultJoin,
      //   //   des: 'labelJoinDesMessage',
      //   //   title: 'labelVaultJoinTitle',
      //   // })
      // }
    },
    onRowClickRepay: ({ row }: { row: R }) => {
      onClickRepay(row?.token?.value)
    },
    //   onClickRepay(row?.token?.value)
    //   // if ([sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus ?? '')) {
    //   //   history.push('/portal/portalDashboard')
    //   //   // todo repay
    //   // } else {
    //   //   history.push('/portal')
    //   //   setShowNoVaultAccount({
    //   //     isShow: true,
    //   //     whichBtn: VaultAction.VaultJoin,
    //   //     des: 'labelJoinDesMessage',
    //   //     title: 'labelVaultJoinTitle',
    //   //   })
    //   // }
    // },
    noMinHeight: true
  }
}



export const useVaultDashboard = ({
  showLeverage,
  closeShowLeverage,
}: {
  showLeverage: { show: boolean; closeAfterChange: boolean }
  closeShowLeverage: () => void
}): {
  vaultDashBoardPanelUIProps: Omit<VaultDashBoardPanelUIProps, 'showLeverage' | 'closeShowLeverage'> 
  dustCollectorUnAvailableModalProps: DustCollectorUnAvailableModalProps
  dustCollectorModalProps: DustCollectorProps
  debtModalProps: DebtModalProps
  leverageModalProps: LeverageModalProps
  maximumCreditModalProps: MaximumCreditModalProps
  collateralDetailsModalProps: CollateralDetailsModalProps
  noAccountHintModalProps: NoAccountHintModalProps
  // vaultSwapModalProps: VaultSwapModalProps
  // smallOrderAlertProps: SmallOrderAlertProps
  supplyCollateralHintModalProps: SupplyCollateralHintModalProps
  closeConfirmModalProps: CloseConfirmModalProps
  settleConfirmModalProps: SettleConfirmModalProps
  autoRepayModalProps: AutoRepayModalProps
} => {
  const _vaultAccountInfo = useVaultAccountInfo()
  
  const {
    vaultAccountInfo,
    activeInfo,
    tokenFactors,
    maxLeverage,
    collateralTokens,
    onSwapPop,
    onJoinPop,
    onRepayPop,
    onRedeemPop,
    joinBtnStatus,
    joinBtnLabel,
  } = _vaultAccountInfo
  const { t } = useTranslation()

  const {
    setShowNoVaultAccount,
    modals: {
      isShowNoVaultAccount: { isShow: showNoVaultAccount, ...btnProps },
      isShowVaultJoin,
      isShowVaultCloseConfirm
    },
    setShowAccount,
    setShowVaultSwap,
    setShowVaultCloseConfirm,
    setShowGlobalToast
  } = useOpenModals()

  const { forexMap, etherscanBaseUrl, getValueInCurrency, exchangeInfo } = useSystem()
  const {
    isMobile,
    currency,
    hideL2Assets: hideAssets,
    upColor,
    defaultNetwork,
    coinJson,
    setHideL2Assets,
    slippage,
    hideSmallBalances,
    setHideSmallBalances
  } = useSettings()
  const {setToastOpen, closeToast} =useToast()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const priceTag = PriceTag[CurrencyToTag[currency]]
 

  const colors = ['var(--color-success)', 'var(--color-error)', 'var(--color-warning)']
  const theme = useTheme()
  const tableRef = React.useRef<HTMLDivElement>()
  const { detail, setShowDetail, marketProps } = useVaultMarket({ tableRef })
  const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map ?? {}
  const {
    tokenMap: vaultTokenMap,
    tokenPrices,
    idIndex: vaultIdIndex,
    marketMap,
    marketArray,
  } = useVaultMap()
  const { tokenMap, idIndex } = useTokenMap()

  const history = useHistory()
  const { vaultTickerMap } = useVaultTicker()

  const [localState, setLocalState] = React.useState({
    modalStatus: 'noModal' as
      | 'noModal'
      | 'collateralDetails'
      | 'collateralDetailsMaxCredit'
      | 'leverage'
      | 'leverageMaxCredit'
      | 'debt'
      | 'dustCollector'
      | 'dustCollectorUnavailable'
      | 'supplyCollateralHint'
      | 'settleConfirm'
      | 'autoRepayConfirm',
    unselectedDustSymbol: [] as string[],
    leverageLoading: false,
    checkedAutoRepay: false,
    penaltyFeeBips: undefined as undefined | number,

  })
  const assetPanelProps = useGetVaultAssets({
    onClickTrade(symbol) {
      if (sdk.VaultAccountStatus.IN_STAKING === vaultAccountInfo?.accountStatus) {
        if (symbol === 'LVUSDT') {
          onSwapPop({ symbol: 'ETH'})
        } else {
          onSwapPop({ symbol: symbol.slice(2) })
        }
      } else {
        setLocalState({
          ...localState,
          modalStatus: 'supplyCollateralHint',
        })
      }
    },
    onClickRepay(symbol) {
      if (sdk.VaultAccountStatus.IN_STAKING === vaultAccountInfo?.accountStatus) {
        onRepayPop({ symbol: symbol.slice(2) })
      } else {
        setLocalState({
          ...localState,
          modalStatus: 'supplyCollateralHint',
        })
      }
    },
    // onClickTrade(symbol) {
    //   if (sdk.VaultAccountStatus.IN_STAKING === vaultAccountInfo?.accountStatus) {
    //     onRe({ symbol: symbol })
    //   } else {
    //     setLocalState({
    //       ...localState,
    //       modalStatus: 'supplyCollateralHint',
    //     })
    //   }
    // },
  })
  const { account } = useAccount()
  const { updateVaultLayer2 } = useVaultLayer2()
  const {
    toggle: { VaultDustCollector },
  } = useToggle()

  const changeLeverage = async (leverage: number) => {
    setLocalState({
      ...localState,
      leverageLoading: true,
    })
    const response = await LoopringAPI.vaultAPI
      ?.submitLeverage(
        {
          request: {
            accountId: account.accountId.toString(),
            leverage: leverage.toString(),
          },
          apiKey: account.apiKey,
        },
        '1',
      )
      .finally(() => {
        setTimeout(() => {
          setLocalState({
            ...localState,
            leverageLoading: false,
          })
        }, 500)
      })

    if ((response as any)?.resultInfo?.code) {
      if (response.resultInfo.message.includes('ERR_VAULT_LEVERAGE_TOO_LARGE')) {
        setShowAccount({
          isShow: true,
          step: AccountStep.General_Failed,
          info: {
            errorMessage: t('labelVaultChangeLeverageFailedTooSmall'),
            title: t('labelVaultChangeLeverageFailed'),
          },
        })
      } else {
        setShowAccount({
          isShow: true,
          step: AccountStep.General_Failed,
          info: {
            errorMessage: t('labelUnknown'),
            title: t('labelVaultChangeLeverageFailed'),
          },
        })
      }
      throw response
    }
    updateVaultLayer2({})
  }
  const dustsAssets = vaultAccountInfo?.userAssets?.filter((asset) => {
    const foundKey = keys(marketMap).find((key) => {
      const market = marketMap[key]
      // @ts-ignore
      return market.baseTokenId === asset.tokenId
    })
    const minimum = foundKey && marketMap[foundKey].minTradeAmount.base
    return (
      minimum &&
      new Decimal(asset.total).greaterThan('0') &&
      new Decimal(asset.total).lessThan(minimum)
    )
  })
  const dusts = dustsAssets?.map((asset) => {
    // @ts-ignore
    const token = vaultTokenMap[vaultIdIndex[asset.tokenId]]
    const vaultSymbol = token.symbol
    const originSymbol = vaultSymbol.slice(2)
    const checked = !localState.unselectedDustSymbol.includes(originSymbol)
    const price = tokenPrices[vaultSymbol]
    return {
      symbol: originSymbol,
      coinJSON: coinJson[originSymbol],
      amount: numberFormat(utils.formatUnits(asset.total, token.decimals), {
        fixed: token.precision,
        removeTrailingZero: true,
      }),
      checked,
      valueInCurrency:
        price &&
        getValueInCurrency(
          new Decimal(price).mul(utils.formatUnits(asset.total, token.decimals)).toString(),
        )
          ? fiatNumberDisplay(
              getValueInCurrency(
                new Decimal(price).mul(utils.formatUnits(asset.total, token.decimals)).toString(),
              ),
              currency,
            )
          : EmptyValueTag,
      onCheck() {
        if (checked) {
          setLocalState({
            ...localState,

            unselectedDustSymbol: localState.unselectedDustSymbol.concat(originSymbol),
          })
        } else {
          setLocalState({
            ...localState,
            unselectedDustSymbol: localState.unselectedDustSymbol.filter(
              (symbol) => symbol !== originSymbol,
            ),
          })
        }
      },
    }
  })
  const checkedDusts = dustsAssets?.filter((asset) => {
    const token = vaultTokenMap[vaultIdIndex[asset.tokenId!]]
    const vaultSymbol = token.symbol
    const originSymbol = vaultSymbol.slice(2)
    return !localState.unselectedDustSymbol.includes(originSymbol)
  })

  const totalDustsInUSDT = checkedDusts
    ? numberFormat(
        numberStringListSum(
          checkedDusts.map((asset) => {
            // @ts-ignore
            const token = vaultTokenMap[vaultIdIndex[asset.tokenId]]
            const vaultSymbol = token.symbol
            const price = tokenPrices[vaultSymbol]
            return new Decimal(price).mul(utils.formatUnits(asset.total, token.decimals)).toString()
          }),
        ),
        { fixed: 2, removeTrailingZero: true }, // 2 is USDT precision
      )
    : undefined
  const totalDustsInCurrency =
    totalDustsInUSDT && getValueInCurrency(totalDustsInUSDT)
      ? fiatNumberDisplay(getValueInCurrency(totalDustsInUSDT), currency)
      : EmptyValueTag

  const [converting, setConverting] = React.useState(false)
  const convert = async () => {
    if (!checkedDusts || !exchangeInfo) return
    setConverting(true)
    try {
      const { broker } = await LoopringAPI.userAPI?.getAvailableBroker({
        type: 4,
      })!
      const dustTransfers = await Promise.all(
        checkedDusts.map(async (asset) => {
          const tokenId = asset.tokenId as unknown as number
          const { offchainId } = await LoopringAPI.userAPI?.getNextStorageId(
            {
              accountId: account.accountId,
              sellTokenId: tokenId,
            },
            account.apiKey,
          )!
          return {
            exchange: exchangeInfo.exchangeAddress,
            payerAddr: account.accAddress,
            payerId: account.accountId,
            payeeId: 0,
            payeeAddr: broker,
            storageId: offchainId,
            token: {
              tokenId: tokenId,
              volume: asset.total,
            },
            maxFee: {
              tokenId: tokenId,
              volume: '0',
            },
            validUntil: getTimestampDaysLater(DAYS),
            memo: '',
          }
        }),
      )
      const dustList = checkedDusts.map((dust) => {
        const vaultToken = vaultTokenMap[vaultIdIndex[dust.tokenId!]]
        const price = tokenPrices[vaultToken.symbol]
        const originTokenSymbol = vaultToken.symbol.slice(2)
        return {
          symbol: originTokenSymbol,
          coinJSON: coinJson[originTokenSymbol],
          amount: numberFormat(utils.formatUnits(dust.total, vaultToken.decimals), {
            fixed: vaultToken.precision,
            removeTrailingZero: true,
          }),
          amountRaw: utils.formatUnits(dust.total, vaultToken.decimals),
          valueInCurrency:
            price &&
            getValueInCurrency(
              new Decimal(price).mul(utils.formatUnits(dust.total, vaultToken.decimals)).toString(),
            )
              ? fiatNumberDisplay(
                  getValueInCurrency(
                    new Decimal(price)
                      .mul(utils.formatUnits(dust.total, vaultToken.decimals))
                      .toString(),
                  ),
                  currency,
                )
              : undefined,
          valueInCurrencyRaw: price
            ? getValueInCurrency(
                new Decimal(price)
                  .mul(utils.formatUnits(dust.total, vaultToken.decimals))
                  .toString(),
              )
            : undefined,
        }
      })
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultDustCollector_In_Progress,
        info: {
          totalValueInCurrency: fiatNumberDisplay(
            numberStringListSum(dustList.map((dust) => dust.valueInCurrencyRaw ?? '0')),
            currency,
          ),
          convertedInUSDT: numberFormat(
            numberStringListSum(dustList.map((dust) => dust.valueInCurrencyRaw ?? '0')),
            { fixed: 2 },
          ),
          repaymentInUSDT: undefined,
          time: undefined,
          dusts: dustList.map((dust) => {
            return {
              symbol: dust.symbol,
              coinJSON: dust.coinJSON,
              amount: dust.amount,
              valueInCurrency: dust.valueInCurrency,
            }
          }),
        },
      })

      const response = await LoopringAPI.vaultAPI?.submitDustCollector(
        {
          dustTransfers: dustTransfers,
          apiKey: account.apiKey,
          accountId: account.accountId,
          eddsaKey: account.eddsaKey.sk,
        },
        '1',
      )
      if (
        (response as sdk.RESULT_INFO).code ||
        (response as sdk.RESULT_INFO).message ||
        !response
      ) {
        throw response
      }
      setLocalState({
        ...localState,
        modalStatus: 'noModal',
        unselectedDustSymbol: [],
      })
      updateVaultLayer2({})
      await sdk.sleep(SUBMIT_PANEL_CHECK)
      const response2 = await LoopringAPI?.vaultAPI?.getVaultGetOperationByHash(
        {
          accountId: account?.accountId?.toString(),
          hash: response.hash,
        },
        account.apiKey,
        '1',
      )
      if (response2?.raw_data?.operation?.status == sdk.VaultOperationStatus.VAULT_STATUS_FAILED) {
        throw sdk.VaultOperationStatus.VAULT_STATUS_FAILED
      }
      setConverting(false)

      const status =
        response2?.raw_data?.operation?.status === sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED
          ? 'success'
          : 'pending'

      setShowAccount({
        isShow: store.getState().modals.isShowAccount.isShow,
        step:
          status == 'success'
            ? AccountStep.VaultDustCollector_Success
            : AccountStep.VaultDustCollector_In_Progress,
        info: {
          totalValueInCurrency: fiatNumberDisplay(
            numberStringListSum(dustList.map((dust) => dust.valueInCurrencyRaw ?? '0')),
            currency,
          ),
          convertedInUSDT: numberFormat(
            numberStringListSum(dustList.map((dust) => dust.valueInCurrencyRaw ?? '0')),
            { fixed: 2 },
          ),
          repaymentInUSDT: numberFormat(utils.formatUnits(response2!.operation.amountOut, 6), {
            fixed: 2,
          }),
          time: response2?.operation.createdAt,
          dusts: dustList.map((dust) => {
            return {
              symbol: dust.symbol,
              coinJSON: dust.coinJSON,
              amount: dust.amount,
              valueInCurrency: dust.valueInCurrency,
            }
          }),
        },
      })
      await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
      updateVaultLayer2({})
    } finally {
      setConverting(false)
    }
  }

  const showMarginLevelAlert =
    vaultAccountInfo?.marginLevel && new Decimal(vaultAccountInfo.marginLevel).lessThan('1.15')

  const collateralToken =
    vaultAccountInfo &&
    vaultAccountInfo.collateralInfo &&
    tokenMap[idIndex[vaultAccountInfo.collateralInfo.collateralTokenId]]
      ? tokenFactors.find(
          (token) =>
            token.symbol ===
            tokenMap[idIndex[vaultAccountInfo.collateralInfo.collateralTokenId]].symbol,
        )
      : undefined

  const hideLeverage = (vaultAccountInfo as any)?.accountType === 0
  const [assetsTab, setAssetsTab] = React.useState('assetsView' as 'assetsView' | 'positionsView')
  const {vaultLayer2, status: vaultLayer2Status} = useVaultLayer2()
  const vaultPositionsTableProps: VaultPositionsTableProps = {
    rawData: filterPositions(vaultLayer2!, vaultTokenMap, tokenPrices)
    .map((symbol) => {
      const originSymbol = symbol.slice(2)
      const asset = vaultLayer2 ? vaultLayer2[symbol] : undefined
      const tokenInfo = vaultTokenMap?.[symbol]
      if (!asset || !tokenInfo) return undefined
      const position = new Decimal(
        utils.formatUnits(BigNumber.from(asset.netAsset).add(asset.interest), tokenInfo.decimals),
      )
      if (symbol === 'LVUSDT' || position.isZero())
        return undefined
      
      return {
        tokenPair: {
          coinJson: [coinJson[originSymbol], coinJson['USDT']],
          pair: `${originSymbol}/USDT`,
          leverage: vaultAccountInfo?.leverage + 'x',
          marginLevel: vaultAccountInfo?.marginLevel ?? '',
        },
        direction: position.isPos() ? 'long' : 'short' as 'long' | 'short',
        holding: numberFormatThousandthPlace(position.abs().toString(), {
          fixed: tokenInfo.precision,
          removeTrailingZero: true
        }),
        onClickTrade: () => {
          setShowVaultSwap({
            isShow: true,
            symbol: originSymbol
          })
        },
        onClickClose: () => {
          // setShowGlobalToast({
          //   isShow: true,
          //   info: {
          //     content: 'aaa',
          //     type: ToastType.error
          //   }
          // })
          // setToastOpenset({
          //   open: true,
          //   content: 'e.message',
          //   type: ToastType.error
          // })
          setShowVaultCloseConfirm({
            isShow: true,
            symbol: symbol
          })
          // closePosition(symbol)
          // .then(response2 => {
          //   if (response2?.operation.status === sdk.VaultOperationStatus.VAULT_STATUS_FAILED) {
          //     throw new Error('failed')
          //   }
            
          //   setShowGlobalToast({
          //     isShow: true,
          //     info: {
          //       content: 'Closed position successfully',
          //       type: ToastType.success
          //     }
          //   })
          // }).catch((e) => {
          //   setShowGlobalToast({
          //     isShow: true,
          //     info: {
          //       content: 'Close position failed',
          //       type: ToastType.error
          //     }
          //   })
          // }).finally(() => {
          //   updateVaultLayer2({})
          // })
        },
        valueInUSD: position.abs().mul(tokenPrices[symbol])
      }
    }),
    onRowClick: (index: number, row: PositionItem) => {},
    isLoading: false,
    hideAssets: hideAssets,
    showFilter: true,
    onClickDustCollector: () => {
      if (VaultDustCollector.enable) {
        setLocalState({
          ...localState,
          modalStatus: 'dustCollector',
        })
      } else {
        setLocalState({
          ...localState,
          modalStatus: 'dustCollectorUnavailable',
        })
      }
    },
    hideDustCollector: false,
    hideSmallBalances: hideSmallBalances,
    setHideSmallBalances: setHideSmallBalances,
  }

  
  const vaultDashBoardPanelUIProps = {
    vaultAccountInfo,
    activeInfo,
    tokenFactors,
    maxLeverage,
    collateralTokens,
    t,
    forexMap,
    etherscanBaseUrl,
    getValueInCurrency,
    exchangeInfo,
    isMobile,
    currency,
    hideAssets,
    upColor,
    defaultNetwork,
    coinJson,
    network,
    isShowVaultJoin,
    setShowAccount,
    // setShowVaultLoan,
    priceTag,
    // onActionBtnClick,
    showNoVaultAccount,
    setShowNoVaultAccount,
    btnProps,
    colors,
    theme,
    tableRef,
    detail,
    setShowDetail,
    marketProps,
    walletMap,
    vaultTokenMap,
    tokenPrices,
    vaultIdIndex,
    marketMap,
    marketArray,
    tokenMap,
    idIndex,
    history,
    vaultTickerMap,
    localState,
    setLocalState,
    account,
    updateVaultLayer2,
    VaultDustCollector,
    changeLeverage,
    dustsAssets,
    dusts,
    checkedDusts,
    totalDustsInUSDT,
    totalDustsInCurrency,
    converting,
    setConverting,
    convert,
    showMarginLevelAlert: showMarginLevelAlert ? true : false,
    collateralToken,
    hideLeverage,
    assetPanelProps,
    marginLevel: vaultAccountInfo?.marginLevel ?? '',
    _vaultAccountInfo: _vaultAccountInfo,
    onClickCollateralManagement: () => {
      onJoinPop({})
    },
    onClickSettle: () => {
      onRedeemPop({})
    },
    liquidationThreshold: '1.1',
    liquidationPenalty: localState.penaltyFeeBips
      ? toPercent(localState.penaltyFeeBips * 100, 2) 
      : '--',
    onClickPortalTrade: () => {
      if (vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING) {
        onSwapPop({})
      } else {
        setLocalState({
          ...localState,
          modalStatus: 'supplyCollateralHint',
        })
      }
    },
    assetsTab: assetsTab,
    onChangeAssetsTab: (tab: 'assetsView' | 'positionsView') => {
      setAssetsTab(tab)
    },
    onClickRecord: () => {
      history.push('/l2assets/history/VaultRecords')
    },
    vaultPositionsTableProps,
    onClickHideShowAssets: () => {
      setHideL2Assets(!hideAssets)
    },
    accountActive: vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING,
    totalEquity:
      vaultAccountInfo?.totalEquityOfUsdt && vaultAccountInfo?.totalCollateralOfUsdt
        ? fiatNumberDisplay(
            getValueInCurrency(
              new Decimal(vaultAccountInfo?.totalEquityOfUsdt)
                .add(vaultAccountInfo?.totalCollateralOfUsdt)
                .toString(),
            ),
            currency,
          )
        : EmptyValueTag,
    showSettleBtn: vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING,
    onClickBuy: (detail) => {
      const symbol = detail?.tokenInfo.symbol?.slice(2)
      setShowVaultSwap({
        isShow: true,
        symbol,
        isSell: false,
      })
    },
    onClickSell: (detail) => {
      const symbol = detail?.tokenInfo.symbol?.slice(2)
      setShowVaultSwap({
        isShow: true,
        symbol,
        isSell: true,
      })
    },
  }
  const noVaultAccountDialogBtn = (() => {
    switch (account.readyState) {
      case AccountStatus.UN_CONNECT:
      case AccountStatus.LOCKED:
      case AccountStatus.NO_ACCOUNT:
      case AccountStatus.NOT_ACTIVE:
        return <WalletConnectL2Btn />
      case AccountStatus.DEPOSITING:
        return (
          <Box
            flex={1}
            display={'flex'}
            justifyContent={'center'}
            flexDirection={'column'}
            alignItems={'center'}
          >
            <img
              className='loading-gif'
              alt={'loading'}
              width='60'
              src={`${SoursURL}images/loading-line.gif`}
            />
            <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
              {t('describeTitleOpenAccounting', {
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              })}
            </Typography>
          </Box>
        )
      case AccountStatus.ERROR_NETWORK:
        return (
          <Box
            flex={1}
            display={'flex'}
            justifyContent={'center'}
            flexDirection={'column'}
            alignItems={'center'}
          >
            <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
              {t('describeTitleOnErrorNetwork', {
                connectName: account.connectName,
              })}
            </Typography>
          </Box>
        )
      case AccountStatus.ACTIVATED:
        if (sdk.VaultAccountStatus.IN_REDEEM === vaultAccountInfo?.accountStatus) {
          return (
            <Box
              flex={1}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
              alignItems={'center'}
            >
              <img
                className='loading-gif'
                alt={'loading'}
                width='60'
                src={`${SoursURL}images/loading-line.gif`}
              />
            </Box>
          )
        } else if (
          [sdk.VaultAccountStatus.UNDEFINED, sdk.VaultAccountStatus.FREE].includes(
            (vaultAccountInfo?.accountStatus ?? '') as any,
          ) ||
          vaultAccountInfo == undefined ||
          vaultAccountInfo?.accountStatus == undefined
        ) {
          return (
            <MyButton
              size={'medium'}
              className={'vaultInProcessing'}
              onClick={() => {
                setShowNoVaultAccount({ isShow: false, whichBtn: undefined })
                onJoinPop(true)
              }}
              variant={'contained'}
              fullWidth={true}
              sx={{ minWidth: 'var(--walletconnect-width)' }}
              loading={(joinBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false') as any}
              disabled={
                joinBtnStatus === TradeBtnStatus.DISABLED ||
                joinBtnStatus === TradeBtnStatus.LOADING
              }
            >
              {joinBtnLabel}
            </MyButton>
          )
        } else if (
          activeInfo?.hash ||
          (vaultAccountInfo?.accountStatus &&
            sdk.VaultAccountStatus.IN_STAKING !== vaultAccountInfo?.accountStatus)
        ) {
          return (
            <Box
              flex={1}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
              alignItems={'center'}
            >
              <img
                className='loading-gif'
                alt={'loading'}
                width='60'
                src={`${SoursURL}images/loading-line.gif`}
              />
              <Typography marginY={3} variant={'body1'} textAlign={'center'}>
                {t('labelVaultAccountWait', {
                  l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                })}
              </Typography>
            </Box>
          )
        } else {
          return (
            <MyButton
              size={'medium'}
              className={'vaultInProcessing'}
              onClick={() => {
                setShowNoVaultAccount({ isShow: false, whichBtn: undefined })
              }}
              loading={'false'}
              variant={'contained'}
              fullWidth={true}
              sx={{ minWidth: 'var(--walletconnect-width)' }}
            >
              {t('labelVaultCloseBtn')}
            </MyButton>
          )
        }
      default:
        return <></>
    }
  })()
  React.useEffect(() => {
    if (!account.apiKey) return
    LoopringAPI.vaultAPI?.getVaultConfig(account.apiKey, '1').then((res) => {
      if (res && res.data.penaltyFeeBips !== undefined) {
        setLocalState((state) => ({
          ...state,
          penaltyFeeBips: res.data.penaltyFeeBips
        }))
      }
    })
  }, [account.apiKey])

  React.useEffect(() => {
    if (localState.checkedAutoRepay || vaultLayer2Status !== SagaStatus.UNSET) return
    
    const list = checkHasTokenNeedRepay()
    if (list.length > 0) {
      setLocalState((state) => ({
        ...state,
        modalStatus: 'autoRepayConfirm',
        checkedAutoRepay: true
      }))
    } else {
      setLocalState((state) => ({
        ...state,
        checkedAutoRepay: true
      }))
    }
  }, [vaultLayer2Status, localState.checkedAutoRepay])
  
  return {
    // vaultSwapModalProps: vaultSwapModalProps,
    vaultDashBoardPanelUIProps,
    dustCollectorUnAvailableModalProps: {
      open: localState.modalStatus === 'dustCollectorUnavailable' && !showLeverage.show,
      onClose: () => {
        setLocalState({
          ...localState,
          modalStatus: 'noModal',
        })
      },
    },
    dustCollectorModalProps: {
      open: localState.modalStatus === 'dustCollector' && !showLeverage.show,
      onClose: () => {
        setLocalState({
          ...localState,
          modalStatus: 'noModal',
          unselectedDustSymbol: [],
        })
      },
      converting,
      dusts,
      onClickConvert: convert,
      convertBtnDisabled: (dusts?.find((dust) => dust.checked) ? false : true) || converting,
      totalValueInCurrency: totalDustsInCurrency,
      totalValueInUSDT: totalDustsInUSDT ?? EmptyValueTag,
      onClickRecords: () => {
        history.push('/l2assets/history/VaultRecords')
      },
    },
    debtModalProps: {
      open: localState.modalStatus === 'debt' && !showLeverage.show,
      onClose: () => {
        setLocalState({
          ...localState,
          modalStatus: 'noModal',
        })
      },
      borrowedVaultTokens: vaultAccountInfo?.userAssets
        ?.filter((asset) => new Decimal(asset.borrowed).greaterThan('0'))
        .map((asset) => {
          const vaultSymbol = vaultIdIndex[asset.tokenId as unknown as number] as unknown as string
          const vaultToken = vaultTokenMap[vaultSymbol]
          const originSymbol = vaultSymbol.replace('LV', '')
          const price = tokenPrices[vaultSymbol]
          const borrowedAmount = vaultToken
            ? utils.formatUnits(asset.borrowed, vaultToken.decimals)
            : undefined
          return {
            symbol: vaultSymbol.slice(2),
            coinJSON: coinJson[originSymbol],
            amount: borrowedAmount
              ? numberFormat(borrowedAmount, {
                  fixed: vaultToken?.precision,
                  removeTrailingZero: true,
                })
              : EmptyValueTag,
            valueInCurrency:
              price &&
              borrowedAmount &&
              getValueInCurrency(new Decimal(price).mul(borrowedAmount).toString())
                ? fiatNumberDisplay(
                    getValueInCurrency(new Decimal(price).mul(borrowedAmount).toString()),
                    currency,
                  )
                : EmptyValueTag,
            onClick: () => {
              setShowVaultLoan({
                isShow: true,
                info: { symbol: vaultSymbol },
                type: VaultLoanType.Repay,
              })
            },
          }
        }),
      totalDebt:
        vaultAccountInfo?.totalDebtOfUsdt && getValueInCurrency(vaultAccountInfo?.totalDebtOfUsdt)
          ? fiatNumberDisplay(getValueInCurrency(vaultAccountInfo?.totalDebtOfUsdt), currency)
          : EmptyValueTag,
      totalFundingFee:
        vaultAccountInfo?.totalInterestOfUsdt &&
        getValueInCurrency(vaultAccountInfo?.totalInterestOfUsdt)
          ? fiatNumberDisplay(getValueInCurrency(vaultAccountInfo?.totalInterestOfUsdt), currency)
          : EmptyValueTag,
      totalBorrowed:
        vaultAccountInfo?.totalBorrowedOfUsdt &&
        getValueInCurrency(vaultAccountInfo?.totalBorrowedOfUsdt)
          ? fiatNumberDisplay(getValueInCurrency(vaultAccountInfo?.totalBorrowedOfUsdt), currency)
          : EmptyValueTag,
    },
    leverageModalProps: {
      isLoading: localState.leverageLoading,
      open:
        localState.modalStatus === 'leverage' ||
        (showLeverage.show && localState.modalStatus !== 'leverageMaxCredit'),
      onClose: () => {
        closeShowLeverage()
        setLocalState({
          ...localState,
          modalStatus: 'noModal',
        })
      },
      onClickMaxCredit: () => {
        setLocalState({
          ...localState,
          modalStatus: 'leverageMaxCredit',
        })
      },
      maxLeverage: maxLeverage ? Number(maxLeverage) : 0,
      onClickReduce: async () => {
        if (!vaultAccountInfo?.leverage) return
        await changeLeverage(Number(vaultAccountInfo?.leverage) - 1)
        if (showLeverage.show && showLeverage.closeAfterChange) {
          closeShowLeverage()
        }
      },
      onClickAdd: async () => {
        if (!vaultAccountInfo?.leverage) return
        await changeLeverage(Number(vaultAccountInfo?.leverage) + 1)
        if (showLeverage.show && showLeverage.closeAfterChange) {
          closeShowLeverage()
        }
      },
      onClickLeverage: async (leverage) => {
        await changeLeverage(leverage)
        if (showLeverage.show && showLeverage.closeAfterChange) {
          closeShowLeverage()
        }
      },
      currentLeverage: vaultAccountInfo?.leverage ? Number(vaultAccountInfo?.leverage) : 0,
      maximumCredit:
        (vaultAccountInfo as any)?.maxCredit &&
        getValueInCurrency((vaultAccountInfo as any)?.maxCredit)
          ? fiatNumberDisplay(getValueInCurrency((vaultAccountInfo as any)?.maxCredit), currency)
          : EmptyValueTag,
      borrowed:
        vaultAccountInfo?.totalBorrowedOfUsdt &&
        getValueInCurrency(vaultAccountInfo?.totalBorrowedOfUsdt)
          ? fiatNumberDisplay(getValueInCurrency(vaultAccountInfo?.totalBorrowedOfUsdt), currency)
          : EmptyValueTag,
      borrowAvailable:
        vaultAccountInfo &&
        collateralToken &&
        getValueInCurrency(
          new Decimal(vaultAccountInfo.totalEquityOfUsdt)
            .add(vaultAccountInfo.totalCollateralOfUsdt)
            .mul(vaultAccountInfo.leverage)
            .mul(collateralToken.factor)
            .minus(vaultAccountInfo.totalBorrowedOfUsdt)
            .toString(),
        )
          ? fiatNumberDisplay(
              getValueInCurrency(
                new Decimal(vaultAccountInfo.totalEquityOfUsdt)
                  .add(vaultAccountInfo.totalCollateralOfUsdt)
                  .mul(vaultAccountInfo.leverage)
                  .mul(collateralToken.factor)
                  .minus(vaultAccountInfo.totalBorrowedOfUsdt)
                  .toString(),
              ),
              currency,
            )
          : EmptyValueTag,
    },
    maximumCreditModalProps: {
      open:
        localState.modalStatus === 'leverageMaxCredit' ||
        (localState.modalStatus === 'collateralDetailsMaxCredit' && !showLeverage.show),
      onClose: () => {
        setLocalState({
          ...localState,
          modalStatus: 'noModal',
        })
      },
      onClickBack: () => {
        if (localState.modalStatus === 'collateralDetailsMaxCredit') {
          setLocalState({
            ...localState,
            modalStatus: 'collateralDetails',
          })
        } else if (localState.modalStatus === 'leverageMaxCredit') {
          setLocalState({
            ...localState,
            modalStatus: 'leverage',
          })
        }
      },
      collateralFactors:
        tokenFactors?.map((tokenFactor) => ({
          name: tokenFactor.symbol,
          collateralFactor: numberFormat(tokenFactor.factor, { fixed: 1 }),
        })) ?? [],
      maxLeverage: maxLeverage ?? EmptyValueTag,
    },
    collateralDetailsModalProps: {
      open: localState.modalStatus === 'collateralDetails' && !showLeverage.show,
      onClose: () => {
        setLocalState({
          ...localState,
          modalStatus: 'noModal',
        })
      },
      onClickMaxCredit: () => {
        setLocalState({
          ...localState,
          modalStatus: 'collateralDetailsMaxCredit',
        })
      },

      collateralTokens: (collateralTokens ?? []).map((collateralToken) => {
        const tokenSymbol = idIndex[collateralToken.collateralTokenId]
        const amount =
          collateralToken.collateralTokenAmount && tokenMap[tokenSymbol]
            ? utils.formatUnits(
                collateralToken.collateralTokenAmount,
                tokenMap[tokenSymbol].decimals,
              )
            : undefined
        return {
          name: tokenSymbol,
          amount: amount
            ? numberFormat(amount, {
                fixed: tokenMap[tokenSymbol].precision,
                removeTrailingZero: true,
              })
            : EmptyValueTag,
          logo: '',
          valueInCurrency:
            amount &&
            tokenPrices['LV' + tokenSymbol] &&
            forexMap &&
            forexMap[currency] &&
            getValueInCurrency(new Decimal(tokenPrices['LV' + tokenSymbol]).mul(amount).toString())
              ? fiatNumberDisplay(
                  getValueInCurrency(
                    new Decimal(tokenPrices['LV' + tokenSymbol]).mul(amount).toString(),
                  ),
                  currency,
                )
              : EmptyValueTag,
        }
      }),
      maxCredit:
        (vaultAccountInfo as any)?.maxCredit &&
        getValueInCurrency((vaultAccountInfo as any)?.maxCredit)
          ? numberFormatThousandthPlace(getValueInCurrency((vaultAccountInfo as any)?.maxCredit), {
              fixed: 2,
              currency,
            })
          : EmptyValueTag,
      totalCollateral:
        vaultAccountInfo?.totalCollateralOfUsdt &&
        getValueInCurrency(vaultAccountInfo?.totalCollateralOfUsdt)
          ? numberFormatThousandthPlace(
              getValueInCurrency(vaultAccountInfo?.totalCollateralOfUsdt),
              {
                fixed: 2,
                currency,
              },
            )
          : EmptyValueTag,
      coinJSON:
        vaultAccountInfo?.collateralInfo &&
        coinJson[idIndex[vaultAccountInfo.collateralInfo.collateralTokenId]],
    },
    noAccountHintModalProps: {
      open: showNoVaultAccount && !isShowVaultJoin?.isShow,
      onClose: () => setShowNoVaultAccount({ isShow: false, whichBtn: undefined }),
      title: t(btnProps.title),
      des: (
        <Trans
          i18nKey={btnProps.des}
          tOptions={{
            layer2: L1L2_NAME_DEFINED[network].layer2,
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          }}
        />
      ),
      dialogBtn: noVaultAccountDialogBtn,
    },
    // smallOrderAlertProps: smallOrderAlertProps,
    supplyCollateralHintModalProps: {
      open: localState.modalStatus === 'supplyCollateralHint',
      onClose: () => {
        setLocalState({ ...localState, modalStatus: 'noModal' })
      },
      onClickSupply: () => {
        setLocalState({ ...localState, modalStatus: 'noModal' })
        onJoinPop({})
      },
    },
    closeConfirmModalProps: {
      open: isShowVaultCloseConfirm.isShow,
      onClose: () => {
        setShowVaultCloseConfirm({ isShow: false, symbol: undefined })
      },
      onConfirm: async () => {
        const { symbol } = isShowVaultCloseConfirm
        setShowVaultCloseConfirm({ isShow: false, symbol: undefined })
        closePositionAndRepayIfNeeded(symbol!)
          .then(response2 => {
            if (response2?.operation.status === sdk.VaultOperationStatus.VAULT_STATUS_FAILED) {
              throw new Error('failed')
            }
            setShowGlobalToast({
              isShow: true,
              info: {
                content: 'Closed position successfully',
                type: ToastType.success
              }
            })
          }).catch((e) => {
            setShowGlobalToast({
              isShow: true,
              info: {
                content: 'Close position failed',
                type: ToastType.error
              }
            })
          }).finally(() => {
            
            updateVaultLayer2({})
          })

        // alert('onConfirm')
        // return 
        // const { symbol } = isShowVaultCloseConfirm
        // const vaultAsset = (vaultLayer2 && symbol) ?vaultLayer2[symbol]: undefined;
        // if (!symbol || !vaultAsset || !exchangeInfo || new Decimal(vaultAsset.netAsset).isZero()) return
        // setShowVaultCloseConfirm({ isShow: false, symbol: undefined })
        
        // const sellToken = new Decimal(vaultAsset.netAsset).isPos()
        //   ? vaultTokenMap[symbol]
        //   : vaultTokenMap['LVUSDT']
        // const buyToken = new Decimal(vaultAsset.netAsset).isPos()
        //   ? vaultTokenMap['LVUSDT']
        //   : vaultTokenMap[symbol]
        // const storageId = await LoopringAPI.userAPI?.getNextStorageId(
        //   {
        //     accountId: account.accountId,
        //     sellTokenId: sellToken?.vaultTokenId ?? 0,
        //   },
        //   account.apiKey,
        // )
        // const market = `${symbol}-LVUSDT`
        // const marketInfo=  marketMap[market] as sdk.VaultMarket
        // const { depth } = await vaultSwapDependAsync({
        //   market: (marketInfo as any).vaultMarket,
        //   tokenMap: vaultTokenMap,
        // })
        
        // const slippageReal = slippage === 'N' ? 0.1 : slippage
        // const output = sdk.calcDex({
        //   info: marketInfo,
        //   input: utils.formatUnits(vaultAsset.netAsset, vaultTokenMap[symbol].decimals),
        //   sell: sellToken.symbol,
        //   buy: buyToken.symbol,
        //   isAtoB: new Decimal(vaultAsset.netAsset).isPos(),
        //   marketArr: marketArray,
        //   tokenMap: vaultTokenMap,
        //   marketMap: marketMap as any,
        //   depth: depth!,
        //   feeBips: (marketInfo.feeBips ?? MAPFEEBIPS).toString(),
        //   slipBips: slippageReal.toString(),
        // })

        // const sellAmountBN = new Decimal(vaultAsset.netAsset).isPos()
        //   ?  vaultAsset.netAsset
        //   : utils.parseUnits(numberFormat(output!.amountS!, {fixed: sellToken.decimals}) , sellToken.decimals)
        // const buyAmountBN = new Decimal(vaultAsset.netAsset).isPos()
        //   ? utils.parseUnits(numberFormat(output!.amountB!, {fixed: buyToken.decimals}) , buyToken.decimals)
        //   : vaultAsset.netAsset 
        // const request: sdk.VaultOrderRequest = {
        //   exchange: exchangeInfo.exchangeAddress,
        //   storageId: storageId!.orderId,
        //   accountId: account.accountId,
        //   sellToken: {
        //     tokenId: sellToken?.vaultTokenId ?? 0,
        //     volume: sellAmountBN.toString(),
        //   },
        //   buyToken: {
        //     tokenId: buyToken?.vaultTokenId ?? 0,
        //     volume: buyAmountBN.toString(),
        //   },
        //   validUntil: getTimestampDaysLater(DAYS),
        //   maxFeeBips: MAPFEEBIPS,
        //   fillAmountBOrS: false,
        //   allOrNone: false,
        //   eddsaSignature: '',
        //   clientOrderId: '',
        //   orderType: sdk.OrderTypeResp.TakerOnly,
        //   fastMode: false,
        // }
        // const response1 = await LoopringAPI.vaultAPI?.submitVaultOrder(
        //   {
        //     request,
        //     privateKey: account.eddsaKey.sk,
        //     apiKey: account.apiKey,
        //   },
        //   '1',
        // )
        // await sdk.sleep(SUBMIT_PANEL_CHECK)
        // const response2: { hash: string } | any =
        //   await LoopringAPI.vaultAPI?.getVaultGetOperationByHash(
        //     {
        //       accountId: account.accountId as any,
        //       // @ts-ignore
        //       hash: response1.hash,
        //     },
        //     account.apiKey,
        //     '1',
        //   )
        // updateVaultLayer2({})
      },
    },
    settleConfirmModalProps: {
      open: localState.modalStatus === 'settleConfirm',
      onClose: () => {
        setLocalState({
          ...localState,
          modalStatus: 'noModal'
        })
      },
      onConfirm: async () => {

      },
    },
    autoRepayModalProps: {
      open: localState.modalStatus === 'autoRepayConfirm',
      onClose: () => {
        setLocalState({
          ...localState,
          modalStatus: 'noModal'
        })
      },
      onConfirm: async () => {
        const list = checkHasTokenNeedRepay()
        setLocalState({
          ...localState,
          modalStatus: 'noModal'
        })
        await promiseAllSequently(list.map((symbol) => {
          return () => repayIfNeeded(symbol).catch(() => {})
        }))
        updateVaultLayer2({})
      },
    },
  }
}