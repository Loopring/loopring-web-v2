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
import React from 'react'
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
} from '@loopring-web/component-lib'
import { useTranslation, Trans } from 'react-i18next'
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
import { useTheme } from '@emotion/react'
import { useVaultMarket } from '../HomePanel/hook'
import { useHistory } from 'react-router'
import {
  CollateralDetailsModal,
  DebtModal,
  DustCollectorModal,
  DustCollectorUnAvailableModal,
  LeverageModal,
  MaximumCreditModal,
} from '../DashBoardPanel/modals'
import { utils } from 'ethers'
import Decimal from 'decimal.js'
import { keys } from 'lodash'
import { marginLevelTypeToColor } from '@loopring-web/component-lib/src/components/tradePanel/components/VaultWrap/utils'
import { marginLevelType } from '@loopring-web/core/src/hooks/useractions/vault/utils'

const useVaultDashboard = ({
  vaultAccountInfo: _vaultAccountInfo,
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}) => {
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
    showMarginLevelAlert,
    collateralToken,
    hideLeverage,
    assetPanelProps

  }
}

export const VaultDashBoardPanel = ({
  vaultAccountInfo: _vaultAccountInfo,
  closeShowLeverage,
  showLeverage,
}: {
  vaultAccountInfo: VaultAccountInfoStatus
  closeShowLeverage: () => void
  showLeverage: { show: boolean; closeAfterChange: boolean }
}) => {
  const {
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
    showMarginLevelAlert,
    collateralToken,
    hideLeverage,
    assetPanelProps
  } = useVaultDashboard({ vaultAccountInfo: _vaultAccountInfo })

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <Container
        maxWidth='lg'
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <ViewAccountTemplate
          activeViewTemplate={
            <>
              {showMarginLevelAlert && (
                <Box
                  paddingY={1}
                  paddingX={2.5}
                  borderRadius={'8px'}
                  bgcolor={hexToRGB(theme.colorBase.error, 0.2)}
                  display={'flex'}
                  marginTop={3}
                >
                  <WarningIcon2
                    color={'error'}
                    style={{
                      width: '24px',
                      height: '24px',
                    }}
                  />
                  <Typography marginLeft={0.5}>{t('labelVaultMarginLevelAlert')}</Typography>
                </Box>
              )}
              <Grid container spacing={3} marginTop={showMarginLevelAlert ? -1 : 3}>
                <Grid item sm={9} xs={12} flex={1} display={'flex'}>
                  <Box
                    border={'var(--color-border) 1px solid'}
                    borderRadius={1.5}
                    flex={1}
                    display={'flex'}
                    flexDirection={'column'}
                    padding={2}
                    paddingBottom={1.5}
                    justifyContent={'space-between'}
                  >
                    <Box
                      display={'flex'}
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'start'}
                    >
                      <Box>
                        <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                          {t('labelVaultTotalBalance')}
                        </Typography>
                        <Typography
                          component={'span'}
                          display={'flex'}
                          alignItems={'center'}
                          justifyContent={'flex-start'}
                          marginTop={1}
                        >
                          <Typography component={'span'} variant={'h1'}>
                            {!hideAssets &&
                              !sdk.toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0).eq('0') &&
                              priceTag}
                          </Typography>
                          {!hideAssets ? (
                            <Typography component={'span'} variant={'h1'}>
                              {vaultAccountInfo?.totalBalanceOfUsdt &&
                              !sdk.toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0).eq('0')
                                ? getValuePrecisionThousand(
                                    sdk
                                      .toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0)
                                      .times(forexMap[currency] ?? 0),
                                    2,
                                    2,
                                    2,
                                    true,
                                    { floor: true },
                                  )
                                : EmptyValueTag}
                            </Typography>
                          ) : (
                            <Typography component={'span'} variant={'h1'}>
                              {HiddenTag}
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                      <Box display={'inline-flex'} flexDirection={'row'} alignItems={'center'}>
                        <Typography
                          component={'span'}
                          variant={'body1'}
                          paddingRight={1}
                          display={'inline-flex'}
                          color={'textSecondary'}
                        >
                          {t('labelVaultOpenDate')}
                        </Typography>
                        <Typography component={'span'} variant={'body1'} color={'textPrimary'}>
                          {vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING
                            ? moment(new Date(vaultAccountInfo?.openDate)).format(
                                YEAR_DAY_MINUTE_FORMAT,
                              )
                            : EmptyValueTag}
                        </Typography>
                      </Box>
                    </Box>
                    {positionOpend ? (
                      <Box
                        display={'flex'}
                        flexWrap={'nowrap'}
                        flexDirection={'row'}
                        justifyContent={'space-between'}
                      >
                        <Box>
                          <Tooltip
                            title={
                              <Box>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips')}
                                </Typography>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips2')}
                                </Typography>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips3')}
                                </Typography>
                                <Typography
                                  color={'var(--color-success)'}
                                  marginBottom={1}
                                  variant={'body2'}
                                >
                                  {t('labelVaultMarginLevelTooltips4')}
                                </Typography>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips5')}
                                </Typography>
                                <Typography
                                  color={'var(--color-warning)'}
                                  marginBottom={1}
                                  variant={'body2'}
                                >
                                  {t('labelVaultMarginLevelTooltips6')}
                                </Typography>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips7')}
                                </Typography>
                                <Typography
                                  color={'var(--color-error)'}
                                  marginBottom={1}
                                  variant={'body2'}
                                >
                                  {t('labelVaultMarginLevelTooltips8')}
                                </Typography>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips9')}
                                </Typography>
                                <Typography
                                  color={'var(--color-text-primary)'}
                                  marginBottom={1}
                                  variant={'body2'}
                                >
                                  {t('labelVaultMarginLevelTooltips10')}
                                </Typography>
                                <Typography marginBottom={1} variant={'body2'}>
                                  {t('labelVaultMarginLevelTooltips11')}
                                </Typography>
                              </Box>
                            }
                            placement={'right'}
                          >
                            <Typography
                              component={'h4'}
                              variant={'body1'}
                              color={'textSecondary'}
                              display={'flex'}
                              alignItems={'center'}
                            >
                              {t('labelVaultMarginLevel')}
                              <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
                            </Typography>
                          </Tooltip>
                          {(() => {
                            const item = vaultAccountInfo?.marginLevel ?? '0'
                            return (
                              <>
                                {vaultAccountInfo?.marginLevel ? (
                                  <Typography
                                    component={'span'}
                                    display={'inline-flex'}
                                    alignItems={'center'}
                                    marginTop={1}
                                    variant={'body1'}
                                    color={marginLevelTypeToColor(marginLevelType(item))}
                                  >
                                    <MarginLevelIcon sx={{ marginRight: 1 / 2 }} />
                                    {item}
                                  </Typography>
                                ) : (
                                  <Typography
                                    component={'span'}
                                    display={'inline-flex'}
                                    alignItems={'center'}
                                    marginTop={1}
                                    variant={'body1'}
                                    color={'textSecondary'}
                                  >
                                    <MarginLevelIcon sx={{ marginRight: 1 / 2 }} />
                                    {EmptyValueTag}
                                  </Typography>
                                )}
                              </>
                            )
                          })()}
                        </Box>
                        <Box>
                          <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                            {t('labelVaultTotalCollateral')}
                          </Typography>
                          <Typography
                            component={'span'}
                            marginTop={1}
                            display={'inline-flex'}
                            variant={'body1'}
                            color={'textPrimary'}
                            alignItems={'center'}
                          >
                            {vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING
                              ? hideAssets
                                ? HiddenTag
                                : PriceTag[CurrencyToTag[currency]] +
                                  getValuePrecisionThousand(
                                    Number(vaultAccountInfo?.totalCollateralOfUsdt ?? 0) *
                                      (forexMap[currency] ?? 0),
                                    2,
                                    2,
                                    2,
                                    false,
                                    { isFait: true, floor: true },
                                  )
                              : EmptyValueTag}
                            <Typography
                              variant={'body2'}
                              sx={{ cursor: 'pointer' }}
                              color={'var(--color-primary)'}
                              marginLeft={1}
                              component={'span'}
                              onClick={() => {
                                setLocalState({
                                  ...localState,
                                  modalStatus: 'collateralDetails',
                                })
                              }}
                            >
                              {t('labelVaultDetail')}
                            </Typography>
                          </Typography>
                        </Box>
                        <Box>
                          <Tooltip
                            title={t('labelVaultTotalDebtTooltips').toString()}
                            placement={'top'}
                          >
                            <Typography
                              component={'h4'}
                              variant={'body1'}
                              color={'textSecondary'}
                              display={'flex'}
                              alignItems={'center'}
                            >
                              {t('labelVaultTotalDebt')}
                              <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
                            </Typography>
                          </Tooltip>
                          <Typography
                            component={'span'}
                            marginTop={1}
                            display={'inline-flex'}
                            variant={'body1'}
                            color={'textPrimary'}
                            alignItems={'center'}
                          >
                            {vaultAccountInfo?.accountStatus === sdk.VaultAccountStatus.IN_STAKING
                              ? hideAssets
                                ? HiddenTag
                                : PriceTag[CurrencyToTag[currency]] +
                                  getValuePrecisionThousand(
                                    Number(vaultAccountInfo?.totalDebtOfUsdt ?? 0) *
                                      (forexMap[currency] ?? 0),
                                    2,
                                    2,
                                    2,
                                    false,
                                    { isFait: true, floor: true },
                                  )
                              : EmptyValueTag}
                            <Typography
                              variant={'body2'}
                              sx={{ cursor: 'pointer' }}
                              color={'var(--color-primary)'}
                              marginLeft={1}
                              component={'span'}
                              onClick={() => {
                                setLocalState({
                                  ...localState,
                                  modalStatus: 'debt',
                                })
                              }}
                            >
                              {t('labelVaultDetail')}
                            </Typography>
                          </Typography>
                        </Box>
                        {!hideLeverage && (
                          <Box position={'relative'} width={'120px'}>
                            <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                              {t('labelVaultLeverage')}
                            </Typography>
                            <Typography
                              component={'span'}
                              marginTop={1}
                              display={'inline-flex'}
                              variant={'body1'}
                              color={'textPrimary'}
                              alignItems={'center'}
                            >
                              {vaultAccountInfo?.leverage
                                ? `${vaultAccountInfo?.leverage}x`
                                : EmptyValueTag}
                              <Typography
                                variant={'body2'}
                                sx={{ cursor: 'pointer' }}
                                color={'var(--color-primary)'}
                                marginLeft={1}
                                component={'span'}
                                onClick={() => {
                                  setLocalState({
                                    ...localState,
                                    modalStatus: 'leverage',
                                  })
                                }}
                              >
                                {t('labelVaultDetail')}
                              </Typography>
                            </Typography>
                            <Typography
                              marginTop={0.5}
                              width={'200px'}
                              color={'var(--color-text-secondary)'}
                              variant={'body2'}
                            >
                              {t('labelVaultMaximumCredit')}:{' '}
                              {(vaultAccountInfo as any)?.maxCredit &&
                              getValueInCurrency((vaultAccountInfo as any)?.maxCredit)
                                ? fiatNumberDisplay(
                                    getValueInCurrency((vaultAccountInfo as any)?.maxCredit),
                                    currency,
                                  )
                                : EmptyValueTag}
                            </Typography>
                          </Box>
                        )}
                        <Box>
                          <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                            {t('labelVaultProfit')}
                          </Typography>
                          <Typography
                            component={'span'}
                            display={'flex'}
                            marginTop={1}
                            variant={'body1'}
                            color={'textPrimary'}
                          >
                            {(() => {
                              const profit =
                                (vaultAccountInfo as any)?.accountType === 0
                                  ? sdk
                                      .toBig(vaultAccountInfo?.totalEquityOfUsdt ?? 0)
                                      .minus(vaultAccountInfo?.totalCollateralOfUsdt ?? 0)
                                  : sdk
                                      .toBig(vaultAccountInfo?.totalBalanceOfUsdt ?? 0)
                                      .minus(vaultAccountInfo?.totalDebtOfUsdt ?? 0)
                              const colorsId = upColor === UpColor.green ? [0, 1] : [1, 0]
                              const colorIs = profit.gte(0) ? colorsId[0] : colorsId[1]
                              return (
                                <>
                                  {vaultAccountInfo?.accountStatus ===
                                  sdk.VaultAccountStatus.IN_STAKING ? (
                                    <>
                                      <Typography
                                        component={'span'}
                                        display={'flex'}
                                        variant={'body1'}
                                        color={'textPrimary'}
                                      >
                                        {hideAssets
                                          ? HiddenTag
                                          : PriceTag[CurrencyToTag[currency]] +
                                            getValuePrecisionThousand(
                                              profit.times(forexMap[currency] ?? 0).toString(),
                                              2,
                                              2,
                                              2,
                                              false,
                                              {
                                                isFait: false,
                                                floor: true,
                                              },
                                            )}
                                      </Typography>
                                      <Typography
                                        component={'span'}
                                        display={'flex'}
                                        variant={'body1'}
                                        marginLeft={1 / 2}
                                        color={colors[colorIs]}
                                      >
                                        {getValuePrecisionThousand(
                                          profit
                                            ?.div(
                                              Number(vaultAccountInfo?.totalCollateralOfUsdt)
                                                ? vaultAccountInfo?.totalCollateralOfUsdt
                                                : 1,
                                            )
                                            .times(100) ?? 0,
                                          2,
                                          2,
                                          2,
                                          false,
                                          {
                                            isFait: false,
                                            floor: true,
                                          },
                                        )}
                                        %
                                      </Typography>
                                    </>
                                  ) : (
                                    EmptyValueTag
                                  )}
                                </>
                              )
                            })()}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Button
                          sx={{ minWidth: 'var(--walletconnect-width)' }}
                          onClick={_vaultAccountInfo.onJoinPop}
                          variant={'contained'}
                        >
                          {t('labelVaultJoinBtn')}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid item sm={3} xs={12}>
                  <Box
                    border={'var(--color-border) 1px solid'}
                    borderRadius={1.5}
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'stretch'}
                    paddingY={3}
                  >
                    <MenuBtnStyled
                      variant={'outlined'}
                      size={'large'}
                      className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
                      fullWidth
                      endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
                      onClick={(_e) => {
                        onActionBtnClick(VaultAction.VaultLoan)
                      }}
                    >
                      <Typography
                        component={'span'}
                        variant={'inherit'}
                        color={'inherit'}
                        display={'inline-flex'}
                        alignItems={'center'}
                        lineHeight={'1.2em'}
                        sx={{
                          textIndent: 0,
                          textAlign: 'left',
                        }}
                      >
                        <Box
                          marginRight={1}
                          component={'img'}
                          src={`${SoursURL}svg/vault_loan_${theme.mode}.svg`}
                        />
                        {t('labelVaultLoanBtn')}
                      </Typography>
                    </MenuBtnStyled>
                    <MenuBtnStyled
                      variant={'outlined'}
                      size={'large'}
                      className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
                      fullWidth
                      endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
                      onClick={(_e) => {
                        onActionBtnClick(VaultAction.VaultJoin)
                      }}
                    >
                      <Typography
                        component={'span'}
                        variant={'inherit'}
                        color={'inherit'}
                        display={'inline-flex'}
                        alignItems={'center'}
                        lineHeight={'1.2em'}
                        sx={{
                          textIndent: 0,
                          textAlign: 'left',
                        }}
                      >
                        <Box
                          marginRight={1}
                          component={'img'}
                          src={`${SoursURL}svg/vault_margin_${theme.mode}.svg`}
                        />
                        {t('labelVaultCollateralManagement')}
                      </Typography>
                    </MenuBtnStyled>
                    <MenuBtnStyled
                      variant={'outlined'}
                      size={'large'}
                      className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
                      fullWidth
                      endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
                      onClick={(_e) => {
                        onActionBtnClick(VaultAction.VaultSwap)
                      }}
                    >
                      <Typography
                        component={'span'}
                        variant={'inherit'}
                        color={'inherit'}
                        display={'inline-flex'}
                        alignItems={'center'}
                        lineHeight={'1.2em'}
                        sx={{
                          textIndent: 0,
                          textAlign: 'left',
                        }}
                      >
                        <Box
                          marginRight={1}
                          component={'img'}
                          src={`${SoursURL}svg/vault_trade_${theme.mode}.svg`}
                        />
                        {t('labelVaultTradeBtn')}
                      </Typography>
                    </MenuBtnStyled>
                    <MenuBtnStyled
                      variant={'outlined'}
                      size={'large'}
                      className={`vaultBtn  ${isMobile ? 'isMobile' : ''}`}
                      fullWidth
                      endIcon={<ConvertToIcon fontSize={'medium'} color={'inherit'} />}
                      onClick={(_e) => {
                        onActionBtnClick(VaultAction.VaultExit)
                      }}
                    >
                      <Typography
                        component={'span'}
                        variant={'inherit'}
                        color={'inherit'}
                        display={'inline-flex'}
                        alignItems={'center'}
                        lineHeight={'1.2em'}
                        sx={{
                          textIndent: 0,
                          textAlign: 'left',
                        }}
                      >
                        <Box
                          marginRight={1}
                          component={'img'}
                          src={`${SoursURL}svg/vault_close_${theme.mode}.svg`}
                        ></Box>
                        {t('labelVaultRedeemBtn')}
                      </Typography>
                    </MenuBtnStyled>
                  </Box>
                </Grid>
              </Grid>
              <Box
                flex={1}
                display={'flex'}
                flexDirection={'column'}
                border={'var(--color-border) 1px solid'}
                borderRadius={1.5}
                marginY={3}
                paddingY={2}
              >
                <VaultAssetsTable
                  {...assetPanelProps}
                  onRowClick={(index, row) => {
                    // @ts-ignore
                    marketProps.onRowClick(index, {
                      // @ts-ignore
                      ...vaultTokenMap[row.name],
                      // @ts-ignore
                      cmcTokenId: vaultTickerMap[row.erc20Symbol].tokenId,
                      ...vaultTickerMap[row.erc20Symbol],
                    })
                  }}
                  onClickDustCollector={() => {
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
                  }}
                  showFilter
                />
              </Box>
              <Modal
                open={showNoVaultAccount && !isShowVaultJoin?.isShow}
                onClose={onBtnClose}
                sx={{ zIndex: 1000 }}
              >
                <Box
                  height={'100%'}
                  display={'flex'}
                  justifyContent={'center'}
                  alignItems={'center'}
                >
                  <Box
                    padding={5}
                    bgcolor={'var(--color-box)'}
                    width={'var(--modal-width)'}
                    borderRadius={1}
                    display={'flex'}
                    alignItems={'center'}
                    flexDirection={'column'}
                    position={'relative'}
                  >
                    <ModalCloseButtonPosition right={2} top={2} t={t} onClose={onBtnClose} />
                    <ViewAccountTemplate
                      className={'inModal'}
                      activeViewTemplate={
                        <>
                          <Typography marginBottom={3} variant={'h4'}>
                            {t(btnProps.title)}
                          </Typography>
                          <Typography
                            whiteSpace={'pre-line'}
                            component={'span'}
                            variant={'body1'}
                            color={'textSecondary'}
                            marginBottom={3}
                            textAlign={'left'}
                            width={'100%'}
                          >
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
                          </Typography>
                          <>{dialogBtn}</>
                        </>
                      }
                    />
                  </Box>
                </Box>
              </Modal>

              <Modal
                open={detail?.isShow && !isShowVaultJoin?.isShow}
                onClose={() => setShowDetail({ isShow: false })}
              >
                <SwitchPanelStyled width={'var(--modal-width)'}>
                  <ModalCloseButton
                    t={t}
                    onClose={(_e: any) => setShowDetail({ isShow: false } as any)}
                  />
                  <Box
                    display={'flex'}
                    flexDirection={'column'}
                    alignItems={'flex-start'}
                    alignSelf={'stretch'}
                    justifyContent={'stretch'}
                    marginTop={-5}
                  >
                    <Typography
                      display={'flex'}
                      flexDirection={'row'}
                      component={'header'}
                      alignItems={'center'}
                      height={'var(--toolbar-row-height)'}
                      paddingX={3}
                    >
                      {detail?.detail?.tokenInfo.erc20Symbol ?? detail?.detail?.tokenInfo.symbol}
                    </Typography>
                    <Divider style={{ marginTop: '-1px', width: '100%' }} />
                    <Box
                      maxHeight={'60vh'}
                      overflow={'scroll'}
                      flex={1}
                      display={'flex'}
                      flexDirection={'column'}
                    >
                      {vaultAccountInfo &&
                        walletMap &&
                        ([sdk.VaultAccountStatus.IN_STAKING].includes(
                          vaultAccountInfo?.accountStatus,
                        ) ||
                          activeInfo?.hash) && (
                          <>
                            <Box
                              display='flex'
                              flexDirection={'column'}
                              alignItems={'center'}
                              alignSelf={'center'}
                              justifyContent={'center'}
                              margin={4}
                            >
                              <Typography variant={'h2'} component={'h4'} color={'inherit'}>
                                {!hideAssets
                                  ? walletMap[detail?.detail?.tokenInfo.symbol!]?.count
                                    ? getValuePrecisionThousand(
                                        walletMap[detail?.detail?.tokenInfo.symbol!]?.count ?? 0,
                                        vaultTokenMap[detail?.detail?.tokenInfo.symbol!].precision,
                                        vaultTokenMap[detail?.detail?.tokenInfo.symbol!].precision,
                                        undefined,
                                        false,
                                        {
                                          isFait: false,
                                          floor: true,
                                        },
                                      )
                                    : '0.00'
                                  : HiddenTag}
                              </Typography>
                              <Typography
                                variant={'body1'}
                                color={'textSecondary'}
                                component={'span'}
                              >
                                {!hideAssets
                                  ? walletMap[detail?.detail?.tokenInfo.symbol!]?.count
                                    ? PriceTag[CurrencyToTag[currency]] +
                                      getValuePrecisionThousand(
                                        sdk
                                          .toBig(
                                            walletMap[detail?.detail?.tokenInfo.symbol!]!.count,
                                          )
                                          .times(
                                            tokenPrices?.[detail?.detail?.tokenInfo.symbol!] || 0,
                                          )
                                          .times(forexMap[currency] ?? 0),
                                        2,
                                        2,
                                        2,
                                        false,
                                        {
                                          isFait: false,
                                          floor: true,
                                        },
                                      )
                                    : PriceTag[CurrencyToTag[currency]] + '0.00'
                                  : HiddenTag}
                              </Typography>
                              <Box marginTop={2} display={'flex'} flexDirection={'row'}>
                                <Box
                                  display={'flex'}
                                  flexDirection={'column'}
                                  marginRight={5}
                                  alignItems={'center'}
                                >
                                  <IconButton
                                    sx={{
                                      height: 'var(--svg-size-huge) !important',
                                      width: 'var(--svg-size-huge) !important',
                                      border: 'solid 0.5px var(--color-border)',
                                    }}
                                    size={'large'}
                                    onClick={() => {
                                      history.push(
                                        `${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}/${VaultAction.VaultLoan}?symbol=${detail?.detail?.tokenInfo.symbol}`,
                                      )
                                    }}
                                  >
                                    <Box
                                      component={'img'}
                                      src={`${SoursURL}svg/vault_loan_${theme.mode}.svg`}
                                    />
                                  </IconButton>
                                  <Typography
                                    marginTop={1 / 2}
                                    component={'span'}
                                    variant={'body2'}
                                    color={'textSecondary'}
                                    display={'inline-flex'}
                                    alignItems={'center'}
                                    textAlign={'center'}
                                    sx={{
                                      textIndent: 0,
                                      textAlign: 'center',
                                    }}
                                  >
                                    {t('labelVaultLoanBtn')}
                                  </Typography>
                                </Box>
                                <Box
                                  display={'flex'}
                                  flexDirection={'column'}
                                  alignItems={'center'}
                                >
                                  <IconButton
                                    sx={{
                                      height: 'var(--svg-size-huge) !important',
                                      width: 'var(--svg-size-huge) !important',
                                      border: 'solid 0.5px var(--color-border)',
                                    }}
                                    size={'large'}
                                    onClick={() => {
                                      history.push(
                                        `${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}/${VaultAction.VaultSwap}?symbol=${detail?.detail?.tokenInfo.symbol}`,
                                      )
                                    }}
                                  >
                                    <Box
                                      component={'img'}
                                      src={`${SoursURL}svg/vault_trade_${theme.mode}.svg`}
                                    />
                                  </IconButton>
                                  <Typography
                                    component={'span'}
                                    variant={'body2'}
                                    display={'inline-flex'}
                                    textAlign={'center'}
                                    alignItems={'center'}
                                    color={'textSecondary'}
                                    marginTop={1 / 2}
                                    sx={{
                                      textIndent: 0,
                                      textAlign: 'center',
                                    }}
                                  >
                                    {t('labelVaultTradeSimpleBtn')}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            <Divider style={{ marginTop: '-1px', width: '100%' }} />
                          </>
                        )}
                      <Box padding={3} flex={1} display={'flex'} flexDirection={'column'}>
                        <MarketDetail
                          etherscanBaseUrl={etherscanBaseUrl}
                          isShow={detail.isShow}
                          forexMap={forexMap}
                          isLoading={detail.isLoading}
                          {...{ ...detail?.detail }}
                        />
                      </Box>
                    </Box>
                    {!(
                      (vaultAccountInfo &&
                        [sdk.VaultAccountStatus.IN_STAKING].includes(
                          vaultAccountInfo?.accountStatus,
                        )) ||
                      activeInfo?.hash
                    ) && (
                      <>
                        <Divider style={{ marginTop: '-1px', width: '100%' }} />
                        <Box
                          padding={3}
                          paddingY={1}
                          display={'flex'}
                          flexDirection={'column'}
                          alignItems={'flex-end'}
                          alignSelf={'stretch'}
                          justifyContent={'stretch'}
                        >
                          <MyButton
                            size={'medium'}
                            onClick={() => {
                              setShowDetail({ isShow: false })
                              _vaultAccountInfo.onJoinPop({})
                            }}
                            loading={'false'}
                            variant={'contained'}
                            sx={{ minWidth: 'var(--walletconnect-width)' }}
                            disabled={
                              _vaultAccountInfo.joinBtnStatus === TradeBtnStatus.DISABLED ||
                              _vaultAccountInfo.joinBtnStatus === TradeBtnStatus.LOADING
                            }
                          >
                            {_vaultAccountInfo.joinBtnLabel}
                          </MyButton>
                        </Box>
                      </>
                    )}
                  </Box>
                </SwitchPanelStyled>
              </Modal>
              <CollateralDetailsModal
                open={localState.modalStatus === 'collateralDetails' && !showLeverage.show}
                onClose={() => {
                  setLocalState({
                    ...localState,
                    modalStatus: 'noModal',
                  })
                }}
                onClickMaxCredit={() => {
                  setLocalState({
                    ...localState,
                    modalStatus: 'collateralDetailsMaxCredit',
                  })
                }}
                collateralTokens={
                  collateralTokens?.map((collateralToken) => {
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
                        getValueInCurrency(
                          new Decimal(tokenPrices['LV' + tokenSymbol]).mul(amount).toString(),
                        )
                          ? fiatNumberDisplay(
                              getValueInCurrency(
                                new Decimal(tokenPrices['LV' + tokenSymbol]).mul(amount).toString(),
                              ),
                              currency,
                            )
                          : EmptyValueTag,
                    }
                  }) ?? []
                }
                maxCredit={
                  (vaultAccountInfo as any)?.maxCredit &&
                  getValueInCurrency((vaultAccountInfo as any)?.maxCredit)
                    ? numberFormatThousandthPlace(
                        getValueInCurrency((vaultAccountInfo as any)?.maxCredit),
                        {
                          fixed: 2,
                          currency,
                        },
                      )
                    : EmptyValueTag
                }
                totalCollateral={
                  vaultAccountInfo?.totalCollateralOfUsdt &&
                  getValueInCurrency(vaultAccountInfo?.totalCollateralOfUsdt)
                    ? numberFormatThousandthPlace(
                        getValueInCurrency(vaultAccountInfo?.totalCollateralOfUsdt),
                        {
                          fixed: 2,
                          currency,
                        },
                      )
                    : EmptyValueTag
                }
                coinJSON={
                  vaultAccountInfo?.collateralInfo &&
                  coinJson[idIndex[vaultAccountInfo.collateralInfo.collateralTokenId]]
                }
              />
              <MaximumCreditModal
                open={
                  localState.modalStatus === 'leverageMaxCredit' ||
                  (localState.modalStatus === 'collateralDetailsMaxCredit' && !showLeverage.show)
                }
                onClose={() => {
                  setLocalState({
                    ...localState,
                    modalStatus: 'noModal',
                  })
                }}
                onClickBack={() => {
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
                }}
                collateralFactors={
                  tokenFactors?.map((tokenFactor) => {
                    return {
                      name: tokenFactor.symbol,
                      collateralFactor: numberFormat(tokenFactor.factor, { fixed: 1 }),
                    }
                  }) ?? []
                }
                maxLeverage={maxLeverage ?? EmptyValueTag}
              />

              <LeverageModal
                isLoading={localState.leverageLoading}
                open={
                  localState.modalStatus === 'leverage' ||
                  (showLeverage.show && localState.modalStatus !== 'leverageMaxCredit')
                }
                onClose={() => {
                  closeShowLeverage()
                  setLocalState({
                    ...localState,
                    modalStatus: 'noModal',
                  })
                }}
                onClickMaxCredit={() => {
                  setLocalState({
                    ...localState,
                    modalStatus: 'leverageMaxCredit',
                  })
                }}
                maxLeverage={maxLeverage ? Number(maxLeverage) : 0}
                onClickReduce={async () => {
                  if (!vaultAccountInfo?.leverage) return
                  await changeLeverage(Number(vaultAccountInfo?.leverage) - 1)
                  if (showLeverage.show && showLeverage.closeAfterChange) {
                    closeShowLeverage()
                  }
                }}
                onClickAdd={async () => {
                  if (!vaultAccountInfo?.leverage) return
                  await changeLeverage(Number(vaultAccountInfo?.leverage) + 1)
                  if (showLeverage.show && showLeverage.closeAfterChange) {
                    closeShowLeverage()
                  }
                }}
                onClickLeverage={async (leverage) => {
                  await changeLeverage(leverage)
                  if (showLeverage.show && showLeverage.closeAfterChange) {
                    closeShowLeverage()
                  }
                }}
                currentLeverage={
                  vaultAccountInfo?.leverage ? Number(vaultAccountInfo?.leverage) : 0
                }
                maximumCredit={
                  (vaultAccountInfo as any)?.maxCredit &&
                  getValueInCurrency((vaultAccountInfo as any)?.maxCredit)
                    ? fiatNumberDisplay(
                        getValueInCurrency((vaultAccountInfo as any)?.maxCredit),
                        currency,
                      )
                    : EmptyValueTag
                }
                borrowed={
                  vaultAccountInfo?.totalBorrowedOfUsdt &&
                  getValueInCurrency(vaultAccountInfo?.totalBorrowedOfUsdt)
                    ? fiatNumberDisplay(
                        getValueInCurrency(vaultAccountInfo?.totalBorrowedOfUsdt),
                        currency,
                      )
                    : EmptyValueTag
                }
                borrowAvailable={
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
                    : EmptyValueTag
                }
              />
              <DebtModal
                open={localState.modalStatus === 'debt' && !showLeverage.show}
                onClose={() => {
                  setLocalState({
                    ...localState,
                    modalStatus: 'noModal',
                  })
                }}
                borrowedVaultTokens={vaultAccountInfo?.userAssets
                  ?.filter((asset) => new Decimal(asset.borrowed).greaterThan('0'))
                  .map((asset) => {
                    const vaultSymbol = vaultIdIndex[
                      asset.tokenId as unknown as number
                    ] as unknown as string
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
                  })}
                totalDebt={
                  vaultAccountInfo?.totalDebtOfUsdt &&
                  getValueInCurrency(vaultAccountInfo?.totalDebtOfUsdt)
                    ? fiatNumberDisplay(
                        getValueInCurrency(vaultAccountInfo?.totalDebtOfUsdt),
                        currency,
                      )
                    : EmptyValueTag
                }
                totalFundingFee={
                  vaultAccountInfo?.totalInterestOfUsdt &&
                  getValueInCurrency(vaultAccountInfo?.totalInterestOfUsdt)
                    ? fiatNumberDisplay(
                        getValueInCurrency(vaultAccountInfo?.totalInterestOfUsdt),
                        currency,
                      )
                    : EmptyValueTag
                }
                totalBorrowed={
                  vaultAccountInfo?.totalBorrowedOfUsdt &&
                  getValueInCurrency(vaultAccountInfo?.totalBorrowedOfUsdt)
                    ? fiatNumberDisplay(
                        getValueInCurrency(vaultAccountInfo?.totalBorrowedOfUsdt),
                        currency,
                      )
                    : EmptyValueTag
                }
              />
              <DustCollectorModal
                converting={converting}
                open={localState.modalStatus === 'dustCollector' && !showLeverage.show}
                onClose={() => {
                  setLocalState({
                    ...localState,
                    modalStatus: 'noModal',
                    unselectedDustSymbol: [],
                  })
                }}
                dusts={dusts}
                onClickConvert={() => {
                  convert()
                }}
                convertBtnDisabled={
                  (dusts?.find((dust) => dust.checked) ? false : true) || converting
                }
                totalValueInCurrency={totalDustsInCurrency}
                totalValueInUSDT={totalDustsInUSDT ?? EmptyValueTag}
                onClickRecords={() => {
                  history.push('/l2assets/history/VaultRecords')
                }}
              />
              <DustCollectorUnAvailableModal
                open={localState.modalStatus === 'dustCollectorUnavailable' && !showLeverage.show}
                onClose={() => {
                  setLocalState({
                    ...localState,
                    modalStatus: 'noModal',
                  })
                }}
              />
            </>
          }
        />
      </Container>
    </Box>
  )
}
