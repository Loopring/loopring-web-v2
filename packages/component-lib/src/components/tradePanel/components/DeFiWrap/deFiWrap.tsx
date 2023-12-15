import {
  BackIcon,
  DeFiCalcData,
  DeFiChgType,
  EmptyValueTag,
  getValuePrecisionThousand,
  HelpIcon,
  IBData,
  Info2Icon,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  OrderListIcon,
  RecordTabIndex,
  ReverseIcon,
  TokenType,
  TradeBtnStatus,
  UpColor,
} from '@loopring-web/common-resources'
import { DeFiWrapProps } from './Interface'
import { Trans, useTranslation } from 'react-i18next'
import React from 'react'
import { Box, Divider, Grid, Tooltip, Typography } from '@mui/material'
import { Button, InputCoin } from '../../../basic-lib'
import { ButtonStyle, IconButtonStyled } from '../Styled'
import { CountDownIcon } from '../tool/Refresh'
import { useHistory } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import styled from '@emotion/styled'
import { useSettings } from '../../../../stores'
import { useTheme } from '@emotion/react'
import { CoinIcons } from '../../../tableList'

const BoxStyle = styled(Box)`
  ul {
    list-style: disc;
    padding-left: ${({ theme }) => theme.unit}px;
  }
`
const InputCoinStyled = styled(InputCoin)`
  &&& .coinInput-wrap {
    background-color: var(--color-global-bg);
    border: 1px solid var(--color-border);
  }
`

export const DeFiWrap = <T extends IBData<I>, I, ACD extends DeFiCalcData<T>>({
  disabled,
  isJoin,
  isStoB,
  btnInfo,
  refreshRef,
  onRefreshData,
  onSubmitClick,
  onConfirm,
  type,
  confirmShowLimitBalance,
  switchStobEvent,
  onChangeEvent,
  handleError,
  deFiCalcData,
  accStatus,
  tokenSell,
  tokenBuy,
  isLoading,
  btnStatus,
  tokenSellProps,
  tokenBuyProps,
  maxSellVol,
  maxBuyVol,
  market,
  title,
  setShowRETHStakePopup,
  setShowWSTETHStakePopup,
  setShowLeverageETHPopup,
  isLeverageETH,
  apr,
  onAprDetail,
  ...rest
}: DeFiWrapProps<T, I, ACD>) => {
  // @ts-ignore
  const [, baseSymbol, _quoteSymbol] = market.match(/(\w+)-(\w+)/i)
  const coinSellRef = React.useRef()
  const { t } = useTranslation()
  const theme = useTheme()
  const { defaultNetwork, coinJson } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const history = useHistory()
  const [_isStoB, setIsStoB] = React.useState(isStoB ?? true)
  const { upColor } = useSettings()
  const colorRight =
    upColor === UpColor.green
      ? ['var(--color-success)', 'var(--color-error)']
      : ['var(--color-error)', 'var(--color-success)']
  const showVal =
    deFiCalcData.coinSell?.belong && deFiCalcData.coinBuy?.belong && deFiCalcData?.AtoB

  const convertStr = React.useMemo(() => {
    return deFiCalcData.coinSell && deFiCalcData.coinBuy
      ? _isStoB
        ? `1 ${deFiCalcData.coinSell.belong} \u2248 ${
            // @ts-ignore
            // eslint-disable-next-line eqeqeq
            deFiCalcData?.AtoB && deFiCalcData?.AtoB !== 'NaN'
              ? getValuePrecisionThousand(
                  deFiCalcData?.AtoB,
                  tokenBuy.precision,
                  tokenBuy.precision,
                  tokenBuy.precision,
                  false,
                  { floor: true },
                )
              : EmptyValueTag
          } ${deFiCalcData.coinBuy.belong}`
        : `1 ${deFiCalcData.coinBuy.belong}  \u2248 ${
            // @ts-ignore
            deFiCalcData.BtoA && deFiCalcData?.BtoA !== 'NaN'
              ? getValuePrecisionThousand(
                  deFiCalcData?.BtoA,
                  tokenSell.precision,
                  tokenSell.precision,
                  tokenSell.precision,
                  false,
                  { floor: true },
                )
              : EmptyValueTag
          } ${deFiCalcData.coinSell.belong}`
      : t('labelCalculating')
  }, [
    deFiCalcData?.AtoB,
    deFiCalcData.BtoA,
    deFiCalcData.coinBuy,
    deFiCalcData.coinSell,
    _isStoB,
    t,
  ])

  const getDisabled = React.useMemo(() => {
    return disabled || deFiCalcData === undefined || deFiCalcData.AtoB === undefined
  }, [btnStatus, deFiCalcData, disabled])

  const handleCountChange = React.useCallback(
    (ibData: T, _name: string, _ref: any) => {
      const focus: DeFiChgType =
        _ref?.current === coinSellRef.current ? DeFiChgType.coinSell : DeFiChgType.coinBuy

      if (deFiCalcData[focus].tradeValue !== ibData.tradeValue) {
        myLog('defi handleCountChange', _name, ibData)

        onChangeEvent({
          tradeData: { ...ibData },
          type: focus,
        })
      }
    },
    [deFiCalcData, onChangeEvent],
  )
  const propsSell = {
    label: t('labelETHStakingEnterPaymentToken'),
    subLabel: t('tokenMax'),
    emptyText: t('tokenSelectToken'),
    placeholderText: '0.00',
    isShowCoinInfo: true,
    isShowCoinIcon: true,
    maxAllow: true,
    ...tokenSellProps,
    handleError: handleError as any,
    handleCountChange: handleCountChange as any,
    ...rest,
  } as any
  const label = React.useMemo(() => {
    if (btnInfo?.label) {
      const key = btnInfo?.label.split('|')
      return t(
        key[0],
        key && key[1]
          ? {
              arg: key[1],
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }
          : {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            },
      )
    } else {
      return isJoin
        ? t(`labelInvestBtn`, {
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          })
        : t(`labelRedeemBtn`, {
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          })
    }
  }, [isJoin, t, btnInfo])

  const maxValue =
    tokenBuy &&
    tokenBuy.symbol &&
    maxBuyVol &&
    `${getValuePrecisionThousand(
      new BigNumber(maxBuyVol ?? 0).div('1e' + tokenBuy.decimals),
      tokenBuy.precision,
      tokenBuy.precision,
      tokenBuy.precision,
      false,
      { floor: true },
    )} ${tokenBuy.symbol}`

  const fee = deFiCalcData?.fee ? deFiCalcData?.fee + ` ${tokenBuy.symbol}` : EmptyValueTag

  return (
    <Box
      className={deFiCalcData ? '' : 'loading'}
      flexDirection={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      display={'flex'}
      flex={1}
      height={'100%'}
    >
      <Box
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        flexDirection={'row'}
        width={'100%'}
        className={'MuiToolbar-root'}
      >
        <Typography
          height={'100%'}
          display={'inline-flex'}
          variant={'h5'}
          alignItems={'center'}
          alignSelf={'center'}
        >
          {title}
          <HelpIcon
            fontSize={'large'}
            color={'inherit'}
            sx={{ marginLeft: 1, cursor: 'pointer' }}
            onClick={() => {
              if (isLeverageETH) {
                setShowLeverageETHPopup &&
                  setShowLeverageETHPopup({ isShow: true, confirmationNeeded: false })
              } else if (market === 'RETH-ETH') {
                setShowRETHStakePopup &&
                  setShowRETHStakePopup({ isShow: true, confirmationNeeded: false })
              } else if (market === 'WSTETH-ETH') {
                setShowWSTETHStakePopup &&
                  setShowWSTETHStakePopup({ isShow: true, confirmationNeeded: false })
              }
            }}
          />
        </Typography>
        <Box alignSelf={'flex-end'} display={'flex'}>
          <CountDownIcon onRefreshData={onRefreshData} ref={refreshRef} />
          <Typography display={'inline-block'} marginLeft={2}>
            <IconButtonStyled
              onClick={() => {
                if (isLeverageETH) {
                  history.push('/l2assets/history/leverageETHRecords')
                } else {
                  history.push(`/l2assets/history/${RecordTabIndex.DefiRecords}?market=${market}`)
                }
              }}
              sx={{ backgroundColor: 'var(--field-opacity)' }}
              className={'switch outlined'}
              aria-label='to Transaction'
              size={'large'}
            >
              <OrderListIcon fill={theme.colorBase.logo} fontSize={'large'} />
            </IconButtonStyled>
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ width: '100%', marginY: 1 }} />
      <Box
        flexDirection={'column'}
        display={'flex'}
        alignSelf={'stretch'}
        alignItems={'stretch'}
        // borderBottom={'1px solid var(--color-border)'}
      >
        <InputCoinStyled
          ref={coinSellRef}
          disabled={getDisabled}
          {...{
            ...propsSell,
            name: 'coinSell',
            isHideError: true,
            order: 'right',
            inputData: deFiCalcData ? deFiCalcData.coinSell : ({} as any),
            coinMap: {},
            coinPrecision: tokenSell && tokenSell.precision,
          }}
        />
      </Box>
      <Divider sx={{ width: '100%', marginY: 3 }} />
      <Grid container spacing={1} alignItems={'stretch'} flex={1}>
        <Grid
          item
          xs={12}
          direction={'row'}
          display={'flex'}
          marginBottom={1}
          justifyContent={'space-between'}
        >
          <Typography component={'p'} variant='body2' color={'textSecondary'}>
            {t('labelReceiveToken')}
          </Typography>
          <Typography
            component={'p'}
            variant='body2'
            color={'textPrimary'}
            alignItems={'center'}
            display={'inline-flex'}
          >
            {deFiCalcData?.coinBuy?.tradeValue ? (
              <>
                <CoinIcons
                  size={'small'}
                  type={TokenType.single}
                  tokenIcon={[coinJson[deFiCalcData.coinBuy.belong]]}
                />
                <span style={{ marginRight: 1 / 2 }}>
                  {deFiCalcData.coinBuy.tradeValue + ' ' + deFiCalcData.coinBuy.belong}
                </span>
              </>
            ) : (
              EmptyValueTag
            )}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          direction={'row'}
          display={'flex'}
          marginBottom={1}
          justifyContent={'space-between'}
        >
          <Box display={'flex'} flexDirection={'row'}>
            <Tooltip title={t('labelLRCStakeAPRTooltips')}>
              <Typography
                component={'p'}
                variant='body2'
                color={'textSecondary'}
                display={'inline-flex'}
                alignItems={'center'}
              >
                {t('labelAPR')}
                <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
              </Typography>
            </Tooltip>
          </Box>
          <Button
            variant={'text'}
            size={'small'}
            onClick={() => onAprDetail()}
            sx={{
              padding: 0,
              justifyContent: 'right',
              color: apr?.toString().charAt(0) == '-' ? colorRight[1] : colorRight[0],
            }}
            endIcon={
              <BackIcon fontSize={'small'} sx={{ transform: 'rotate(180deg)' }} color={'inherit'} />
            }
          >
            {apr ? `${(apr.toString().charAt(0) == '-' ? '' : '+') + apr + '%'}` : EmptyValueTag}
          </Button>
        </Grid>
        <Grid
          item
          xs={12}
          direction={'row'}
          display={'flex'}
          marginBottom={1}
          justifyContent={'space-between'}
        >
          <Typography component={'p'} variant='body2' color={'textSecondary'}>
            {t('labelDefiRate')}
          </Typography>
          <Typography component={'p'} variant='body2' color={'textPrimary'}>
            {showVal ? convertStr : t('labelCalculating')}
            <IconButtonStyled
              size={'small'}
              aria-label={t('tokenExchange')}
              onClick={() => setIsStoB(!_isStoB)}
            >
              <ReverseIcon />
            </IconButtonStyled>
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          direction={'row'}
          display={'flex'}
          marginBottom={1}
          justifyContent={'space-between'}
        >
          <Typography component={'p'} variant='body2' color={'textSecondary'}>
            {t('labelDefiDuration')}
          </Typography>
          <Typography component={'p'} variant='body2' color={'textPrimary'}>
            {t('labelFlexible')}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          direction={'row'}
          display={'flex'}
          marginBottom={1}
          justifyContent={'space-between'}
        >
          <Tooltip title={t('labelTradingFeeTooltips')}>
            <Typography
              component={'p'}
              variant='body2'
              color={'textSecondary'}
              display={'inline-flex'}
              alignItems={'center'}
            >
              {t('labelTradingFee')}
              <Info2Icon color={'inherit'} sx={{ marginLeft: 1 / 2 }} />
            </Typography>
          </Tooltip>

          <Typography component={'p'} variant='body2' color={'textPrimary'}>
            {fee}
          </Typography>
        </Grid>
      </Grid>

      <Box
        marginTop={3}
        alignSelf={'stretch'}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'stretch'}
      >
        <ButtonStyle
          fullWidth
          variant={'contained'}
          size={'medium'}
          color={'primary'}
          onClick={() => {
            onSubmitClick()
          }}
          loading={!getDisabled && btnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
          disabled={
            getDisabled ||
            btnStatus === TradeBtnStatus.LOADING ||
            btnStatus === TradeBtnStatus.DISABLED
          }
        >
          {label}
        </ButtonStyle>
        {confirmShowLimitBalance && (
          <BoxStyle display={'flex'} flexDirection={'column'}>
            {isJoin ? (
              <Typography
                variant={'body1'}
                component={'p'}
                display={'flex'}
                marginTop={1}
                flexDirection={'column'}
                color={'var(--color-warning)'}
              >
                <Trans i18nKey={'labelDefiMaxBalanceJoin'} tOptions={{ maxValue }}>
                  The quota is almost sold out and can't fulfil your complete order. You can only
                  subscribe {{ maxValue }} now. Loopring will setup the pool soon, please revisit
                  for subscription later.
                </Trans>
              </Typography>
            ) : (
              <Typography
                variant={'body1'}
                component={'p'}
                display={'flex'}
                marginTop={1}
                flexDirection={'column'}
                color={'var(--color-warning)'}
              >
                <Typography component={'span'} variant={'inherit'} color={'inherit'}>
                  <Trans i18nKey={'labelDefiMaxBalanceLeverage'} tOptions={{ maxValue }}>
                    Loopring rebalance pool can't satisfy your complete request. You can only redeem{' '}
                    {{ maxValue }} now. For the remaining investment, you can choose one of the
                    approaches
                  </Trans>
                </Typography>
                <Typography component={'span'} variant={'inherit'} color={'inherit'} marginTop={1}>
                  <ul>
                    {isLeverageETH ? (
                      <Trans
                        i18nKey={'labelDefiMaxBalance1Leverage'}
                        components={{ li: <li /> }}
                        tOptions={{
                          symbol: baseSymbol,
                          type,
                          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                        }}
                      >
                        <li>Wait some time for Loopring to seto for redeem</li>
                      </Trans>
                    ) : (
                      <Trans
                        i18nKey={'labelDefiMaxBalance1'}
                        components={{ li: <li /> }}
                        tOptions={{
                          symbol: baseSymbol,
                          type,
                          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                        }}
                      >
                        <li>Withdraw wstETH to L1 and trade through CRV or LIDO directly</li>
                        <li>Wait some time for Loopring to seto for redeem</li>
                      </Trans>
                    )}
                  </ul>
                </Typography>
              </Typography>
            )}
          </BoxStyle>
        )}
      </Box>
    </Box>
  )
}
