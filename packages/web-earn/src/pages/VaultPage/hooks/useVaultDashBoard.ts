import {
  Box,
  Container,
  Typography,
  Grid,
  Modal,
  Tooltip,
  Button,
  Divider,
  IconButton,
} from '@mui/material'
import React, { ReactNode } from 'react'
import {
  ConvertToIcon,
  CloseOutIcon,
  LoadIcon,
  MarginIcon,
  MarginLevelIcon,
  VaultTradeIcon,
  PriceTag,
  CurrencyToTag,
  HiddenTag,
  getValuePrecisionThousand,
  EmptyValueTag,
  YEAR_DAY_MINUTE_FORMAT,
  VaultAction,
  L1L2_NAME_DEFINED,
  MapChainId,
  UpColor,
  Info2Icon,
  SoursURL,
  RouterPath,
  VaultKey,
  TradeBtnStatus,
  VaultLoanType,
  SUBMIT_PANEL_CHECK,
  SUBMIT_PANEL_AUTO_CLOSE,
  WarningIcon2,
  hexToRGB,
  ForexMap,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  MarketDetail,
  MenuBtnStyled,
  ModalCloseButton,
  ModalCloseButtonPosition,
  SwitchPanelStyled,
  useOpenModals,
  useSettings,
  VaultAssetsTable,
  Button as MyButton,
  AccountStep,
  useToggle,
  ModalStatePlayLoad,
} from '@loopring-web/component-lib'
import { useTranslation, Trans, TFunction } from 'react-i18next'
import {
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
  useSystem,
  useTokenMap,
  useTokenPrices,
  useVaultLayer2,
  useVaultMap,
  useVaultTicker,
  VaultAccountInfoStatus,
  ViewAccountTemplate,
} from '@loopring-web/core'
import { useGetVaultAssets } from '../hooks/useGetVaultAssets'
import moment from 'moment'
import { Theme, useTheme } from '@emotion/react'
import { useVaultMarket } from '../HomePanel/hook'
import { useHistory } from 'react-router'
import {
  CollateralDetailsModal,
  DebtModal,
  DustCollectorModal,
  DustCollectorUnAvailableModal,
  LeverageModal,
  MaximumCreditModal,
} from '../components/modals'
import { utils } from 'ethers'
import Decimal from 'decimal.js'
import { keys } from 'lodash'
import { marginLevelTypeToColor } from '@loopring-web/component-lib/src/components/tradePanel/components/VaultWrap/utils'
import { marginLevelType } from '@loopring-web/core/src/hooks/useractions/vault/utils'
import { VaultDashBoardPanelUIProps } from '../interface'

export const useVaultDashboard = ({
  vaultAccountInfo: _vaultAccountInfo,
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}): VaultDashBoardPanelUIProps => {
  const { vaultAccountInfo, activeInfo, tokenFactors, maxLeverage, collateralTokens } =
    _vaultAccountInfo
  const { t } = useTranslation()

  const { forexMap, etherscanBaseUrl, getValueInCurrency, exchangeInfo } = useSystem()
  const {
    isMobile,
    currency,
    hideL2Assets: hideAssets,
    upColor,
    defaultNetwork,
    coinJson,
  } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const {
    modals: { isShowVaultJoin },
    setShowAccount,
    setShowVaultLoan,
  } = useOpenModals()
  const priceTag = PriceTag[CurrencyToTag[currency]]
  const {
    onActionBtnClick,
    dialogBtn,
    showNoVaultAccount,
    setShowNoVaultAccount,
    whichBtn,
    btnProps,
    onBtnClose,
    positionOpend,
    onClcikOpenPosition,
    ...assetPanelProps
  } = useGetVaultAssets({ vaultAccountInfo: _vaultAccountInfo })
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
      | 'dustCollectorUnavailable',
    unselectedDustSymbol: [] as string[],
    leverageLoading: false,
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

  return {
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
    setShowVaultLoan,
    priceTag,
    onActionBtnClick,
    dialogBtn,
    showNoVaultAccount,
    setShowNoVaultAccount,
    whichBtn,
    btnProps,
    onBtnClose,
    positionOpend,
    onClcikOpenPosition,
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
    _vaultAccountInfo: _vaultAccountInfo
  }
}