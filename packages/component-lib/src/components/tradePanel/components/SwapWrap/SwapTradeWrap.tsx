import { SwapTradeData } from '../../Interface'
import { useTheme } from '@emotion/react'
import {
  AlertIcon,
  BtradeTradeCalcData,
  BtradeType,
  CoinInfo,
  CoinMap,
  defaultSlipage,
  EmptyValueTag,
  getValuePrecisionThousand,
  hexToRGB,
  IBData,
  Info2Icon,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  ReverseIcon,
  SwapExchangeIcon,
  SwapTradeCalcData,
  TradeBtnStatus,
  VaultTradeCalcData,
} from '@loopring-web/common-resources'
import { Trans, WithTranslation } from 'react-i18next'
import React from 'react'
import { Box, Grid, Tooltip, Typography, Link, Tab } from '@mui/material'
import { InputButton } from '../../../basic-lib'
import { SwapTradeProps } from './Interface'
import { useSettings } from '../../../../stores'
import { ButtonStyle, IconButtonStyled, TabsStyle } from '../Styled'
import { useHistory } from 'react-router-dom'
import styled from '@emotion/styled'

const GridStyle = styled(Grid)`
  .buyInput {
    margin-top: ${({ theme }) => 1 * theme.unit}px;
  }

  .iconChange {
    top: var(--input-height-swap);
    transform: translateY(-50%);
  }
`
export const SwapTradeWrap = <
  T extends IBData<I>,
  I,
  TCD extends BtradeTradeCalcData<I> | VaultTradeCalcData<I> | SwapTradeCalcData<I>,
>({
  t,
  onChangeEvent,
  isStob,
  switchStobEvent,
  tradeData,
  disabled,
  handleError,
  swapBtnStatus,
  onSwapClick,
  swapBtnI18nKey,
  tradeCalcData,
  tokenSellProps,
  tokenBuyProps,
  onCancelClick,
  BtnEle,
  ...rest
}: SwapTradeProps<T, I, TCD> & WithTranslation) => {
  const theme = useTheme()
  const sellRef = React.useRef()
  const buyRef = React.useRef()
  const history = useHistory()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const [_isStoB, setIsStoB] = React.useState(typeof isStob !== 'undefined' ? isStob : true)

  const buySymbol = (tradeCalcData as any)?.belongBuyAlice ?? tradeData?.buy?.belong
  const sellSymbol = (tradeCalcData as any)?.belongSellAlice ?? tradeData?.sell?.belong
  const _onSwitchStob = React.useCallback(
    (_event: any) => {
      setIsStoB(!_isStoB)
      if (typeof switchStobEvent === 'function') {
        switchStobEvent(!_isStoB)
      }
    },
    [switchStobEvent, _isStoB],
  )

  const getDisabled = React.useCallback(() => {
    return disabled || tradeCalcData === undefined || tradeCalcData.coinInfoMap === undefined
  }, [disabled, tradeCalcData])

  const handleOnClick = React.useCallback(
    (_event: React.MouseEvent, _name: string, ref: any) => {
      const focus: 'buy' | 'sell' = ref.current === buyRef.current ? 'buy' : 'sell'
      onChangeEvent(1, {
        tradeData,
        type: focus,
        to: 'menu',
      })
    },
    [tradeData, onChangeEvent],
  )
  const handleCountChange = React.useCallback(
    (ibData: IBData<I>, _name: string, _ref: any) => {
      const focus: 'buy' | 'sell' = _ref?.current === buyRef.current ? 'buy' : 'sell'
      if (tradeData[focus].tradeValue !== ibData.tradeValue) {
        onChangeEvent(0, {
          tradeData: { ...tradeData, [focus]: ibData },
          type: focus,
          to: 'button',
        })
      }
    },
    [tradeData, onChangeEvent],
  )
  const covertOnClick = React.useCallback(() => {
    onChangeEvent(0, {
      tradeData: {
        sell: tradeData.buy,
        buy: tradeData.sell,
      } as SwapTradeData<T>,
      type: 'exchange',
      to: 'button',
    })
  }, [tradeData, onChangeEvent])

  if (typeof handleError !== 'function') {
    handleError = ({ belong, balance, tradeValue }: any) => {
      if (balance < tradeValue || (tradeValue && !balance)) {
        const _error = {
          error: true,
          message: t('tokenNotEnough', { belong: belong }),
        }
        return _error
      }
      return { error: false, message: '' }
    }
  }
  const propsSell = {
    label: t('tokenEnterPaymentToken'),
    subLabel: t('tokenMax'),
    emptyText: t('tokenSelectToken'),
    placeholderText: '0.00',
    maxAllow: true,
    ...tokenSellProps,
    isShowCoinInfo: true,
    isShowCoinIcon: true,
    handleError,
    handleCountChange,
    handleOnClick,
    ...rest,
  } as any
  const propsBuy = {
    label: t('tokenEnterReceiveToken'),
    // subLabel: t('tokenHave'),
    emptyText: t('tokenSelectToken'),
    placeholderText: '0.00',
    maxAllow: false,
    ...tokenBuyProps,
    isShowCoinInfo: true,
    isShowCoinIcon: true,
    handleCountChange,
    handleOnClick,
    ...rest,
  } as any
  const label = React.useMemo(() => {
    myLog(swapBtnI18nKey, 'swapBtnI18nKey useMemo')
    const keyParams = {
      layer2: L1L2_NAME_DEFINED[network].layer2,
      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }
    if (swapBtnI18nKey) {
      const key = swapBtnI18nKey.split('|')
      if (key) {
        return t(
          key[0],
          key && key[1]
            ? {
                arg: key[1],
                ...keyParams,
              }
            : {
                ...keyParams,
              },
        )
      } else {
        return t(swapBtnI18nKey, {
          ...keyParams,
        })
      }
    } else {
      const label = (tradeCalcData as any)?.isBtrade
        ? `labelBtradeSwapBtn`
        : (tradeCalcData as any)?.isVault
        ? `labelVaultSwapBtn`
        : `swapBtn`
      return t(label, {
        ...keyParams,
      })
    }
  }, [t, swapBtnI18nKey, network, tradeCalcData])
  const showVal = buySymbol && sellSymbol && tradeCalcData?.StoB
  const isL2Swap = !((tradeCalcData as any)?.isBtrade || (tradeCalcData as any)?.isVault)
  const convertStr = _isStoB
    ? `1 ${sellSymbol} \u2248 ${
        tradeCalcData.StoB && tradeCalcData.StoB !== 'NaN' ? tradeCalcData.StoB : EmptyValueTag
      } ${buySymbol}`
    : `1 ${buySymbol} \u2248 ${
        tradeCalcData.BtoS && tradeCalcData.BtoS !== 'NaN' ? tradeCalcData.BtoS : EmptyValueTag
      } ${sellSymbol}`
  const priceImpactColor = (tradeCalcData as any)?.priceImpactColor
    ? (tradeCalcData as any).priceImpactColor
    : 'textPrimary'
  const priceImpact =
    (tradeCalcData as any)?.priceImpact !== undefined
      ? getValuePrecisionThousand(
          (tradeCalcData as any).priceImpact,
          undefined,
          undefined,
          2,
          true,
        ) + ' %'
      : EmptyValueTag

  const fee =
    tradeCalcData && tradeCalcData.fee
      ? `${tradeCalcData.fee} ${buySymbol}` //(parseFloat(tradeCalcData.fee) / 100).toString() + "%"
      : EmptyValueTag

  const userTakerRate =
    tradeCalcData && tradeCalcData.feeTakerRate
      ? (tradeCalcData.feeTakerRate / 100).toString()
      : EmptyValueTag
  const tradeCostMin =
    tradeCalcData && tradeCalcData.tradeCost
      ? `${tradeCalcData.tradeCost} ${buySymbol}` //(parseFloat(tradeCalcData.fee) / 100).toString() + "%"
      : EmptyValueTag

  const minimumConverted =
    tradeCalcData && tradeCalcData.minimumConverted
      ? `${tradeCalcData.minimumConverted}  ${buySymbol}`
      : EmptyValueTag
  const { isMobile } = useSettings()

  return (
    <GridStyle
      className={tradeCalcData ? 'trade-panel' : 'trade-panel loading'}
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      container
      direction={'column'}
      flexWrap={'nowrap'}
      justifyContent={'space-between'}
      flex={isMobile ? '1' : 'initial'}
      height={'100%'}
    >
      {(tradeCalcData as any)?.isBtrade && (
        <Box
          className={'tool-bar'}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Box component={'header'} width={'100%'}>
            <TabsStyle
              className={'trade-tabs swap'}
              variant={'fullWidth'}
              value={tradeData.btradeType}
              onChange={(_e, value) =>
                onChangeEvent(0, {
                  tradeData: {
                    ...tradeData,
                    btradeType: value,
                  } as SwapTradeData<T>,
                  type: (tradeCalcData as unknown as any)?.lastStepAt ?? 'sell',
                  to: 'button',
                })
              }
            >
              <Tab
                className={'trade-tab-quantity'}
                value={BtradeType.Quantity}
                label={t('labelBtrade' + BtradeType.Quantity)}
              />
              <Tab
                className={'trade-tab-speed'}
                value={BtradeType.Speed}
                label={t('labelBtrade' + BtradeType.Speed)}
              />
            </TabsStyle>
          </Box>
        </Box>
      )}
      <Grid
        item
        marginTop={!isL2Swap ? 1 : 3}
        display={'flex'}
        alignSelf={'stretch'}
        justifyContent={'flex-start'}
        alignItems={'stretch'}
        flexDirection={'column'}
        flexBasis={'initial'}
        position={'relative'}
      >
        <InputButton<any, I, CoinInfo<I>>
          ref={sellRef}
          disabled={getDisabled()}
          className={'swapWrap'}
          order={'left'}
          {...{
            ...propsSell,
            isHideError: true,
            inputData: tradeData ? tradeData.sell : ({} as any),
            coinMap:
              tradeCalcData && tradeCalcData.coinInfoMap
                ? tradeCalcData.coinInfoMap
                : ({} as CoinMap<I, CoinInfo<I>>),
          }}
        />
        <Box
          className={'iconChange'}
          alignSelf={'center'}
          marginY={1}
          position={'absolute'}
          zIndex={99}
          sx={{
            boxSizing: 'border-box',
            border: '3px solid var(--color-box)',
            background: 'var(--color-box-secondary)',
            borderRadius: '50%',
          }}
        >
          <IconButtonStyled
            size={'large'}
            sx={{
              height: 'var(--btn-icon-size-large) !important',
              width: 'var(--btn-icon-size-large) !important',
            }}
            onClick={covertOnClick}
            aria-label={t('tokenExchange')}
          >
            <SwapExchangeIcon fontSize={'large'} htmlColor={'var(--color-text-primary)'} />
          </IconButtonStyled>
        </Box>

        <InputButton<any, I, CoinInfo<I>>
          ref={buyRef}
          disabled={getDisabled()}
          className={'swapWrap buyInput'}
          order={'left'}
          {...{
            ...propsBuy,
            // maxAllow:false,
            isHideError: true,

            inputData: tradeData ? tradeData.buy : ({} as any),
            coinMap:
              tradeCalcData && tradeCalcData.coinInfoMap
                ? tradeCalcData.coinInfoMap
                : ({} as CoinMap<I, CoinInfo<I>>),
          }}
        />
        {!isL2Swap ? (
          <Typography
            variant={'body1'}
            display={'inline-flex'}
            alignItems={'center'}
            justifyContent={'space-between'}
            paddingTop={1}
            paddingBottom={2}
          >
            <Tooltip title={t('labelBtradeQuoteDes').toString()}>
              <Typography
                component={'span'}
                variant={'inherit'}
                alignItems={'center'}
                display={'inline-flex'}
                color={'textSecondary'}
              >
                <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                {t('labelBtradeQuote')}
              </Typography>
            </Tooltip>

            <Typography component={'span'} variant={'inherit'} color={'textPrimary'}>
              {tradeCalcData?.totalQuota
                ? tradeCalcData?.totalQuota + ' ' + sellSymbol
                : EmptyValueTag}
            </Typography>
          </Typography>
        ) : (
          <></>
        )}

        {(tradeCalcData as any)?.isVault && (tradeCalcData as any).step !== 'edit' && (
          <Box className={'cover'} onClick={onCancelClick} />
        )}
      </Grid>

      <Grid item display={'flex'} alignItems={'center'} justifyContent={'center'}>
        <Typography
          variant='body1'
          textAlign={'center'}
          lineHeight={'24px'}
          paddingY={2}
          display={'inline-flex'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          {showVal ? (
            <>
              {convertStr}
              <IconButtonStyled
                size={'small'}
                aria-label={t('tokenExchange')}
                onClick={_onSwitchStob}
                // style={{transform: 'rotate(90deg)'}}
              >
                <ReverseIcon />
              </IconButtonStyled>
            </>
          ) : (
            t('labelCalculating')
          )}
        </Typography>
      </Grid>

      {!isL2Swap ? (
        <>
          <Grid item paddingBottom={3} sx={{ color: 'text.secondary' }}>
            {(tradeCalcData as any)?.isVault && (
              <Grid
                container
                justifyContent={'space-between'}
                direction={'row'}
                alignItems={'center'}
                marginTop={1 / 2}
              >
                <Tooltip
                  title={t('labelTobeBorrowedtips', {
                    rate: userTakerRate,
                    value: tradeCostMin,
                  }).toString()}
                  placement={'top'}
                >
                  <Typography
                    component={'p'}
                    variant='body2'
                    color={'textSecondary'}
                    display={'inline-flex'}
                    alignItems={'center'}
                  >
                    <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                    {' ' + t('labelTobeBorrowed')}
                  </Typography>
                </Tooltip>
                <Typography component={'p'} variant='body2' color={'textPrimary'}>
                  {tradeCalcData && tradeCalcData.borrowVol
                    ? `${tradeCalcData.borrowStr} ${sellSymbol}` //(parseFloat(tradeCalcData.fee) / 100).toString() + "%"
                    : EmptyValueTag}
                </Typography>
              </Grid>
            )}
            <Grid
              container
              justifyContent={'space-between'}
              direction={'row'}
              alignItems={'center'}
              marginTop={1 / 2}
            >
              <Tooltip
                title={t('labelBtradeFeeTooltips', {
                  rate: userTakerRate,
                  value: tradeCostMin,
                }).toString()}
                placement={'top'}
              >
                <Typography
                  component={'p'}
                  variant='body2'
                  color={'textSecondary'}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  {' ' + t('labelTradingFeeEst')}
                </Typography>
              </Tooltip>
              <Typography component={'p'} variant='body2' color={'textPrimary'}>
                {fee}
              </Typography>
            </Grid>
            <Grid
              container
              justifyContent={'space-between'}
              direction={'row'}
              alignItems={'center'}
              marginTop={1 / 2}
            >
              <Tooltip title={t('labelSwapMinConvertedTooltip').toString()} placement={'top'}>
                <Typography
                  component={'p'}
                  variant='body2'
                  color={'textSecondary'}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  {t('labelSwapMinConverted')}
                </Typography>
              </Tooltip>
              <Typography component={'p'} variant='body2' color={'textPrimary'}>
                {minimumConverted}
              </Typography>
            </Grid>

            <Grid
              container
              justifyContent={'space-between'}
              direction={'row'}
              alignItems={'center'}
              height={24}
            >
              <Tooltip title={t('labelBtradeToleranceTooltips').toString()} placement={'top'}>
                <Typography
                  component={'p'}
                  variant='body2'
                  color={'textSecondary'}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  {' ' + t('swapTolerance')}
                </Typography>
              </Tooltip>

              <Typography component={'p'} variant='body2'>
                {tradeCalcData
                  ? (tradeData.slippage
                      ? tradeData.slippage
                      : tradeCalcData.slippage
                      ? tradeCalcData.slippage
                      : defaultSlipage) + '%'
                  : EmptyValueTag}
              </Typography>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Grid item paddingBottom={3} sx={{ color: 'text.secondary' }}>
            <Grid
              container
              justifyContent={'space-between'}
              direction={'row'}
              alignItems={'center'}
              marginTop={1 / 2}
            >
              <Tooltip
                title={t('labelSwapFeeTooltips', {
                  rate: userTakerRate,
                  value: tradeCostMin,
                }).toString()}
                placement={'top'}
              >
                <Typography
                  component={'p'}
                  variant='body2'
                  color={'textSecondary'}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  {' ' + t('labelTradingFeeEst')}
                </Typography>
              </Tooltip>
              <Typography component={'p'} variant='body2' color={'textPrimary'}>
                {fee}
              </Typography>
            </Grid>

            <Grid
              container
              justifyContent={'space-between'}
              direction={'row'}
              alignItems={'center'}
              marginTop={1 / 2}
            >
              <Tooltip title={t('labelSwapPriceImpactTooltips').toString()} placement={'top'}>
                <Typography
                  display={'inline-flex'}
                  component={'span'}
                  variant='body2'
                  color={'textSecondary'}
                  alignItems={'center'}
                >
                  <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  {' ' + t('swapPriceImpact')}
                </Typography>
              </Tooltip>
              <Typography component={'p'} color={priceImpactColor} variant='body2'>
                {priceImpact}
              </Typography>
            </Grid>
            <Grid
              container
              justifyContent={'space-between'}
              direction={'row'}
              alignItems={'center'}
              marginTop={1 / 2}
            >
              <Tooltip title={t('labelSwapMinConvertedTooltip').toString()} placement={'top'}>
                <Typography
                  component={'p'}
                  variant='body2'
                  color={'textSecondary'}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  {t('labelSwapMinConverted')}
                </Typography>
              </Tooltip>
              <Typography component={'p'} variant='body2' color={'textPrimary'}>
                {minimumConverted}
              </Typography>
            </Grid>
            <Grid
              container
              justifyContent={'space-between'}
              direction={'row'}
              alignItems={'center'}
              height={24}
            >
              <Tooltip title={t('labelSwapToleranceTooltips').toString()} placement={'top'}>
                <Typography
                  component={'p'}
                  variant='body2'
                  color={'textSecondary'}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  {' ' + t('swapTolerance')}
                </Typography>
              </Tooltip>

              <Typography component={'p'} variant='body2'>
                {tradeCalcData
                  ? (tradeData.slippage
                      ? tradeData.slippage
                      : tradeCalcData.slippage
                      ? tradeCalcData.slippage
                      : defaultSlipage) + '%'
                  : EmptyValueTag}
              </Typography>
            </Grid>
          </Grid>
        </>
      )}

      <Grid item alignSelf={'stretch'}>
        {(tradeCalcData as any)?.isVault && BtnEle ? (
          <>
            {(tradeCalcData as any)?.showHasBorrow && (
              <Typography
                marginY={1}
                width={'100%'}
                variant={'body1'}
                component={'span'}
                padding={1}
                display={'inline-flex'}
                bgcolor={hexToRGB(theme.colorBase.warning, 0.2)}
                borderRadius={2}
                color={'var(--color-text-button)'}
              >
                <AlertIcon color={'warning'} sx={{ marginRight: 1 / 2 }} />
                {t('labelVaultActiveLoanAlert')}
              </Typography>
            )}
            {BtnEle}
          </>
        ) : (
          <ButtonStyle
            variant={'contained'}
            size={'large'}
            color={'primary'}
            onClick={() => {
              onSwapClick()
            }}
            loading={!getDisabled() && swapBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
            disabled={
              getDisabled() ||
              swapBtnStatus === TradeBtnStatus.DISABLED ||
              swapBtnStatus === TradeBtnStatus.LOADING
            }
            fullWidth={true}
          >
            {label}
          </ButtonStyle>
        )}
      </Grid>
      {isL2Swap && (tradeCalcData as any)?.isShowBtradeAllow && (
        <Grid
          item
          marginTop={3}
          display={'flex'}
          alignSelf={'stretch'}
          justifyContent={'flex-start'}
          alignItems={'stretch'}
          flexDirection={'column'}
          flexBasis={'initial'}
        >
          <Typography
            variant={'body2'}
            color={'textSecondary'}
            borderRadius={1}
            paddingY={2}
            paddingX={1}
          >
            <Trans
              i18nKey={'labelGoBtradeSwap'}
              components={{
                a: (
                  <Link
                    onClick={() => {
                      history.push('/trade/btrade/' + sellSymbol + '-' + buySymbol)
                    }}
                    target='_blank'
                    rel='noopener noreferrer'
                    variant={'inherit'}
                    color={'primary'}
                  />
                ),
              }}
            >
              Swapping on the DEX will result in a large Price Impact (loss of assets). We recommend
              using the <a>Block Trade</a> option to help minimize potential losses.
            </Trans>
          </Typography>
        </Grid>
      )}
    </GridStyle>
  )
}
