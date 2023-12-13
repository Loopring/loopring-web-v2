import {
  DeFiCalcData,
  DeFiChgType,
  EmptyValueTag,
  ExchangeIcon,
  getValuePrecisionThousand,
  HelpIcon,
  IBData,
  Info2Icon,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  OrderListIcon,
  RecordTabIndex,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { DeFiWrapProps } from './Interface'
import { Trans, useTranslation } from 'react-i18next'
import React from 'react'
import { Box, Grid, Tooltip, Typography } from '@mui/material'
import { InputCoin } from '../../../basic-lib'
import { ButtonStyle, IconButtonStyled } from '../Styled'
import { CountDownIcon } from '../tool/Refresh'
import { useHistory } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import styled from '@emotion/styled'
import { useSettings } from '../../../../stores'
import { useTheme } from '@emotion/react'
import { toBig } from '@loopring-web/loopring-sdk'

const GridStyle = styled(Grid)`
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
  extraWithdrawFee,
  apr,
  ...rest
}: DeFiWrapProps<T, I, ACD>) => {
  // @ts-ignore
  const [, baseSymbol, _quoteSymbol] = market.match(/(\w+)-(\w+)/i)
  const coinSellRef = React.useRef()
  const coinBuyRef = React.useRef()
  const { t } = useTranslation()
  const theme = useTheme()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const history = useHistory()
  const _onSwitchStob = React.useCallback(
    (_event: any) => {
      if (typeof switchStobEvent === 'function') {
        switchStobEvent(!isStoB)
      }
    },
    [switchStobEvent, isStoB],
  )

  const showVal =
    deFiCalcData.coinSell?.belong && deFiCalcData.coinBuy?.belong && deFiCalcData?.AtoB

  const convertStr = React.useMemo(() => {
    return deFiCalcData.coinSell && deFiCalcData.coinBuy
      ? isStoB
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
    isStoB,
    t,
  ])

  const getDisabled = React.useMemo(() => {
    return disabled || deFiCalcData === undefined || deFiCalcData.AtoB === undefined
  }, [btnStatus, deFiCalcData, disabled])
  // myLog("DeFi DefiTrade btnStatus", btnStatus, btnInfo);

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
  const covertOnClick = React.useCallback(() => {
    onChangeEvent({
      tradeData: undefined,
      type: DeFiChgType.exchange,
    })
  }, [onChangeEvent])
  const propsSell = {
    label: t('tokenEnterPaymentToken'),
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
  const propsBuy = {
    label: t('tokenEnterReceiveToken'),
    // subLabel: t('tokenHave'),
    emptyText: t('tokenSelectToken'),
    placeholderText: '0.00',
    isShowCoinInfo: true,
    isShowCoinIcon: true,
    maxAllow: false,
    ...tokenBuyProps,
    // handleError,
    handleCountChange,
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

  const fee = isJoin
    ? deFiCalcData?.fee
      ? deFiCalcData?.fee + ` ${tokenBuy.symbol}`
      : EmptyValueTag
    : deFiCalcData?.fee
    ? getValuePrecisionThousand(
        toBig(extraWithdrawFee ?? '0').plus(deFiCalcData.fee),
        tokenBuy.precision,
        tokenBuy.precision,
        tokenBuy.precision,
        false,
        { floor: true },
      ) + ` ${tokenBuy.symbol}`
    : EmptyValueTag

  return (
    <Grid
      className={deFiCalcData ? '' : 'loading'}
      container
      direction={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      flex={1}
      height={'100%'}
    >
      <Grid
        item
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
                  setShowLeverageETHPopup({ show: true, confirmationNeeded: false })
              } else if (market === 'RETH-ETH') {
                setShowRETHStakePopup &&
                  setShowRETHStakePopup({ show: true, confirmationNeeded: false })
              } else if (market === 'WSTETH-ETH') {
                setShowWSTETHStakePopup &&
                  setShowWSTETHStakePopup({ show: true, confirmationNeeded: false })
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
      </Grid>
      <Grid
        item
        marginTop={3}
        paddingBottom={3}
        flexDirection={'column'}
        display={'flex'}
        alignSelf={'stretch'}
        alignItems={'stretch'}
        borderBottom={'1px solid var(--color-border)'}
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
        <Box alignSelf={'center'} marginY={1}>
          <IconButtonStyled
            size={'large'}
            onClick={covertOnClick}
            disabled={true}
            aria-label={t('tokenExchange')}
          >
            <ExchangeIcon fontSize={'large'} htmlColor={'var(--color-text-disable)'} />
          </IconButtonStyled>
        </Box>
        <InputCoinStyled
          ref={coinBuyRef}
          disabled={getDisabled}
          {...{
            ...propsBuy,
            name: 'coinBuy',
            isHideError: true,
            order: 'right',
            inputData: deFiCalcData ? deFiCalcData.coinBuy : ({} as any),
            coinMap: {},
            coinPrecision: tokenBuy && tokenBuy.precision,
          }}
        />
      </Grid>

      <Grid marginTop={3} item alignSelf={'stretch'}>
        <Grid container direction={'column'} spacing={1} alignItems={'stretch'}>
          <Grid item paddingBottom={3} sx={{ color: 'text.secondary' }}>
            {isLeverageETH && (
              <Grid
                container
                justifyContent={'space-between'}
                direction={'row'}
                alignItems={'center'}
                marginTop={1 / 2}
              >
                <Box display={'flex'} flexDirection={'row'}>
                  <Typography
                    marginRight={0.5}
                    component={'p'}
                    variant='body2'
                    color={'textSecondary'}
                  >
                    {t('labelAPR')}
                  </Typography>

                  <Tooltip title={t('labelLRCStakeAPRTooltips')}>
                    <span>
                      <Info2Icon />
                    </span>
                  </Tooltip>
                </Box>
                <Typography component={'p'} variant='body2' color={'textPrimary'}>
                  {apr ? `${apr}%` : EmptyValueTag}
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
              <Typography component={'p'} variant='body2' color={'textSecondary'}>
                {t('labelDefiRate')}
              </Typography>
              <Typography component={'p'} variant='body2' color={'textPrimary'}>
                {showVal ? convertStr : t('labelCalculating')}
              </Typography>
            </Grid>
            <Grid
              container
              justifyContent={'space-between'}
              direction={'row'}
              alignItems={'center'}
              marginTop={1 / 2}
            >
              <Typography component={'p'} variant='body2' color={'textSecondary'}>
                {t('labelTradingFee')}
              </Typography>
              <Typography component={'p'} variant='body2' color={'textPrimary'}>
                {fee}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
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
          </Grid>
          {confirmShowLimitBalance && (
            <GridStyle item>
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
                      Loopring rebalance pool can't satisfy your complete request. You can only
                      redeem {{ maxValue }} now. For the remaining investment, you can choose one of
                      the approaches
                    </Trans>
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'inherit'}
                    color={'inherit'}
                    marginTop={1}
                  >
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
            </GridStyle>
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}
