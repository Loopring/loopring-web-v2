import {
  IconType,
  PanelProps,
  VaultBorrowBase,
  VaultDustCollectorBase,
  VaultExitBase,
  VaultJoinBase,
  VaultRepayBase,
  VaultTradeBase,
} from './BasicPanel'
import { Box, Tooltip, Typography } from '@mui/material'
import {
  AlertIcon,
  EmptyValueTag,
  ErrorIcon,
  hexToRGB,
  Info2Icon,
  TokenType,
  YEAR_DAY_MINUTE_FORMAT,
} from '@loopring-web/common-resources'
import moment from 'moment/moment'
import React from 'react'
import { useSettings } from '../../../stores'
import { useTheme } from '@emotion/react'
import { CoinIcons } from '../../tableList'
import { useTranslation } from 'react-i18next'
import { SpaceBetweenBox } from '../../../components/basic-lib'

const TradeDes2 = (props: PanelProps) => {
  const { isMobile, coinJson } = useSettings()
  const theme = useTheme()
  const {
    percentage,
    status,
    feeStr: amountFee,
    buyStr: amountBuy,
    sellStr: amountSell,
    sellToken: sellSymbol,
    buyToken: buySymbol,
    price,
    time,
    placedAmount,
    executedAmount,
    executedRate,
    convertedAmount,
    fromSymbol,
    toSymbol,
  } = props?.info ?? {}
  const {t} = useTranslation()
  return (
    <>
      <Box
        justifySelf={'stretch'}
        display={'flex'}
        flexDirection={'column'}
        minWidth={'var(--modal-min-width)'}
        justifyContent={'center'}
        marginTop={2}
        paddingX={isMobile ? 1 : 0}
      >
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultType')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {props.t('labelVaultSwap')}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultStatus')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {props.t('labelVaultTradeStatus', {
              status,
              percentage: percentage ? `(${percentage}%)` : '',
            })}
          </Typography>
        </Typography>

        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography
            display={'flex'}
            alignItems={'center'}
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-secondary)'}
          >
            {t('labelVaultPlacedAmount')}
            <Tooltip title={<>{t('labelVaultPlacedAmountTip')}</>}>
              <Typography marginLeft={0.5} display={'flex'} alignItems={'center'}>
                <Info2Icon fontSize={'medium'} htmlColor={'var(--color-text-third)'} />
              </Typography>
            </Tooltip>
          </Typography>
          <Typography
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-primary)'}
          >
            <CoinIcons
              size='small'
              type={TokenType.vault}
              tokenIcon={[coinJson[sellSymbol], undefined]}
            />{' '}
            {placedAmount}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography
            display={'flex'}
            alignItems={'center'}
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-secondary)'}
          >
            {t('labelVaultExecutedAmount')}
            <Tooltip title={<>{t('labelVaultExecutedAmountTip')}</>}>
              <Typography marginLeft={0.5} display={'flex'} alignItems={'center'}>
                <Info2Icon fontSize={'medium'} htmlColor={'var(--color-text-third)'} />
              </Typography>
            </Tooltip>
          </Typography>
          <Typography
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-primary)'}
          >
            {executedAmount !== EmptyValueTag && (
              <CoinIcons
                size='small'
                type={TokenType.vault}
                tokenIcon={[coinJson[sellSymbol], undefined]}
              />
            )}{' '}
            {executedAmount}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {t('labelVaultExecutedRate')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {executedRate}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography
            display={'flex'}
            alignItems={'center'}
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-secondary)'}
          >
            {t('labelVaultConvertedAmount')}
            <Tooltip title={<>{t('labelVaultConvertedAmountTip')}</>}>
              <Typography marginLeft={0.5} display={'flex'} alignItems={'center'}>
                <Info2Icon fontSize={'medium'} htmlColor={'var(--color-text-third)'} />
              </Typography>
            </Tooltip>
          </Typography>
          <Typography
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-primary)'}
          >
            {convertedAmount !== EmptyValueTag && (
              <CoinIcons
                size='small'
                type={TokenType.vault}
                tokenIcon={[coinJson[buySymbol], undefined]}
              />
            )}{' '}
            {convertedAmount}
          </Typography>
        </Typography>

        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultPrice')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {price}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultFee')}
          </Typography>
          <Typography
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-primary)'}
            display={'inline-flex'}
            alignItems={'center'}
          >
            {amountFee ? (
              <>
                <CoinIcons
                  size='small'
                  type={TokenType.vault}
                  tokenIcon={[coinJson[buySymbol], undefined]}
                />
                {amountFee + ' ' + buySymbol}
              </>
            ) : (
              EmptyValueTag
            )}
          </Typography>
        </Typography>

        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultTime')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {moment(time).format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
      </Box>
      <>
        {props.isPending && (
          <Typography
            marginTop={2}
            variant={'body1'}
            component={'span'}
            padding={1}
            display={'inline-flex'}
            width={`calc(100% - ${9 * theme.unit}px)`}
            bgcolor={hexToRGB(theme.colorBase.warning, 0.2)}
            borderRadius={2}
            color={'var(--color-text-primary)'}
          >
            <AlertIcon color={'warning'} sx={{ marginRight: 1 / 2 }} />
            {props.t('labelVaultPendingDes')}
          </Typography>
        )}
      </>
    </>
  )
}
export const VaultTrade_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelVaultTradeSuccess', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: props.info && <TradeDes2 {...props} />,
  }
  return <VaultTradeBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultTrade_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelVaultTradeFailed', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: (
      <>
        {props.info && <TradeDes2 {...props} />}
        {props?.error && props.error?.message && (
          <Typography variant={'body1'} component={'span'} color={'warning'}>
            {props.error?.message}
          </Typography>
        )}
      </>
    ),
  }
  return <VaultTradeBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultTrade_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelVaultTradeInProgress', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: props.info && <TradeDes2 {...props} isPending={true} />,
  }
  return <VaultTradeBase showTitle={true} {...propsPatch} {...props} />
}
const JoinDes2 = (props: PanelProps) => {
  const { isMobile, coinJson } = useSettings()
  const theme = useTheme()

  const { symbol, vSymbol, sum, status, type, time } = props?.info ?? {}
  return (
    <>
      <Box
        justifySelf={'stretch'}
        display={'flex'}
        flexDirection={'column'}
        minWidth={'var(--modal-min-width)'}
        justifyContent={'center'}
        marginTop={2}
        paddingX={isMobile ? 1 : 0}
      >
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultType')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {type}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultStatus')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {props.t(`labelVaultJoinStatus`, {
              status,
              percentage: '',
            })}
          </Typography>
        </Typography>

        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultAmount')}
          </Typography>
          <Typography
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-primary)'}
            display={'inline-flex'}
            alignItems={'center'}
          >
            <CoinIcons
              size='small'
              type={TokenType.single}
              tokenIcon={[coinJson[symbol], undefined]}
            />
            {sum + ' ' + symbol}
          </Typography>
        </Typography>
        {/*<Typography*/}
        {/*  display={'inline-flex'}*/}
        {/*  justifyContent={'space-between'}*/}
        {/*  marginTop={2}*/}
        {/*  component={'span'}*/}
        {/*>*/}
        {/*  <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>*/}
        {/*    {props.t('labelVaultReceive')}*/}
        {/*  </Typography>*/}
        {/*  <Typography*/}
        {/*    variant={'body1'}*/}
        {/*    component={'span'}*/}
        {/*    color={'var(--color-text-primary)'}*/}
        {/*    display={'inline-flex'}*/}
        {/*    alignItems={'center'}*/}
        {/*  >*/}
        {/*    <CoinIcons*/}
        {/*      size='small'*/}
        {/*      type={TokenType.vault}*/}
        {/*      tokenIcon={[coinJson[symbol], undefined]}*/}
        {/*    />*/}
        {/*    {sum + ' ' + symbol}*/}
        {/*  </Typography>*/}
        {/*</Typography>*/}

        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultTime')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {moment(time).format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
      </Box>
      <>
        {props.isPending && (
          <Typography
            marginTop={2}
            variant={'body1'}
            component={'span'}
            padding={1}
            display={'inline-flex'}
            width={`calc(100% - ${9 * theme.unit}px)`}
            bgcolor={hexToRGB(theme.colorBase.warning, 0.2)}
            borderRadius={2}
            color={'var(--color-text-primary)'}
          >
            <AlertIcon color={'warning'} sx={{ marginRight: 1 / 2 }} />
            {props.t('labelVaultPendingDes')}
          </Typography>
        )}
      </>
    </>
  )
}
export const VaultJoin_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelVaultJoinSuccess', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: props.info && <JoinDes2 {...props} />,
  }
  return <VaultJoinBase title={props.info?.title} {...propsPatch} {...props} />
}
export const VaultJoin_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelVaultJoinFailed', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: (
      <>
        {props.info && <JoinDes2 {...props} />}
        {props?.error && props.error?.message && (
          <Typography
            width={'var(--modal-min-width)'}
            variant={'body1'}
            component={'span'}
            color={'warning'}
          >
            {props.error?.message}
          </Typography>
        )}
      </>
    ),
  }
  return <VaultJoinBase title={props.info?.title} {...propsPatch} {...props} />
}
export const VaultJoin_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelVaultJoinInProgress', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: props.info && <JoinDes2 {...props} isPending={true} />,
  }
  return <VaultJoinBase title={props.info?.title} {...propsPatch} {...props} />
}
export const RedeemDes2 = (
  props: PanelProps & {
    isPending?: boolean
    isNoWrap?: boolean
    isForcedLiqudation: boolean
  },
) => {
  const { isMobile, coinJson } = useSettings()
  const theme = useTheme()
  const { usdValue, usdDebt, usdEquity, profitPercent, profit, time, status, isForcedLiqudation } = props?.info ?? {}
  const detail = React.useMemo(() => {
    return (
      <>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultExitType')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {isForcedLiqudation
              ? props.t('labelVaultExitTypeForcedLiquidation')
              : props.t('labelVaultExitTypeClose')}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultExitStatusLabel')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {props.t('labelVaultExitStatus', { status })}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultExitTotalBalance')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {usdValue}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultExitTotalDebt')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {usdDebt}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultExitTotalEquity')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {usdEquity}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultExitProfit')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {profit}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultExitProfitPercentage')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {profitPercent}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          order={10}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultTime')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {moment(time).format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
      </>
    )
  }, [usdValue, usdDebt, usdEquity, time, isMobile])
  return props.isNoWrap ? (
    <>{detail}</>
  ) : (
    <>
      <Box
        flexDirection={'column'}
        display={'flex'}
        alignItems={'stretch'}
        justifyContent={'space-between'}
        marginTop={2}
        marginX={4}
        borderRadius={1 / 2}
        paddingY={1}
        paddingX={isMobile ? 1 : 2}
        minWidth={'var(--modal-min-width)'}
        width={`calc(100% - 64px)`}
        sx={{
          background: 'var(--field-opacity)',
        }}
      >
        {detail}
      </Box>
      {props.isPending && (
        <Typography
          marginTop={2}
          variant={'body1'}
          component={'span'}
          padding={1}
          display={'inline-flex'}
          width={`calc(100% - ${9 * theme.unit}px)`}
          bgcolor={hexToRGB(theme.colorBase.warning, 0.2)}
          borderRadius={2}
          color={'var(--color-text-primary)'}
        >
          <AlertIcon color={'warning'} sx={{ marginRight: 1 / 2 }} />
          {props.t('labelVaultPendingDes')}
        </Typography>
      )}
    </>
  )
}
export const VaultRedeem_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelVaultRedeemSuccess', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: props.info && <RedeemDes2 {...props} />,
  }
  return <VaultExitBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultRedeem_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelVaultRedeemFailed', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: (
      <>
        {props.info && <RedeemDes2 {...props} />}
        {props?.error && props.error?.message && (
          <Typography
            width={'var(--modal-min-width)'}
            variant={'body1'}
            component={'span'}
            color={'warning'}
          >
            {props.error?.message}
          </Typography>
        )}
      </>
    ),
  }
  return <VaultExitBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultRedeem_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelVaultRedeemInProgress', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: props.info && <RedeemDes2 {...props} isPending={true} />,
  }
  return <VaultExitBase showTitle={true} {...propsPatch} {...props} />
}

export const BorrowDes2 = (
  props: PanelProps & {
    isPending?: boolean
  },
) => {
  const { isMobile, coinJson } = useSettings()
  const theme = useTheme()
  const { sum, status, symbol, time } = props?.info ?? {}
  return (
    <>
      <Box
        justifySelf={'stretch'}
        display={'flex'}
        flexDirection={'column'}
        minWidth={'var(--modal-min-width)'}
        justifyContent={'center'}
        marginTop={2}
        paddingX={isMobile ? 1 : 0}
      >
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultBorrowTypeLabel')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {props.t('labelVaultBorrow')}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultBorrowStatusLabel')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {props.t('labelVaultBorrowStatus', { status })}
          </Typography>
        </Typography>

        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultBorrowAmountLabel')}
          </Typography>
          <Typography
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-primary)'}
            display={'inline-flex'}
            alignItems={'center'}
          >
            <CoinIcons
              size='small'
              type={TokenType.vault}
              tokenIcon={[coinJson[symbol], undefined]}
            />
            {sum + ' ' + symbol}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultTime')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {moment(time ? time : new Date()).format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
      </Box>
      <>
        {props.isPending && (
          <Typography
            marginTop={2}
            variant={'body1'}
            component={'span'}
            padding={1}
            display={'inline-flex'}
            width={`calc(100% - ${9 * theme.unit}px)`}
            bgcolor={hexToRGB(theme.colorBase.warning, 0.2)}
            borderRadius={2}
            color={'var(--color-text-primary)'}
          >
            <AlertIcon color={'warning'} sx={{ marginRight: 1 / 2 }} />
            {props.t('labelVaultPendingDes')}
          </Typography>
        )}
      </>
    </>
  )
}

export const VaultBorrow_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelVaultBorrowSuccess', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: props.info && <BorrowDes2 {...props} />,
  }
  return <VaultBorrowBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultBorrow_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelVaultBorrowFailed', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: (
      <>
        {props.info && <BorrowDes2 {...props} />}{' '}
        {props?.error && props.error?.message && (
          <Typography
            width={'var(--modal-min-width)'}
            variant={'body1'}
            component={'span'}
            color={'warning'}
          >
            {props.error?.message}
          </Typography>
        )}
      </>
    ),
  }
  return <VaultBorrowBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultBorrow_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelVaultBorrowInProgress', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: props.info && <BorrowDes2 {...props} isPending={true} />,
  }
  return <VaultBorrowBase showTitle={true} {...propsPatch} {...props} />
}
export const RepayDes2 = (
  props: PanelProps & {
    isPending?: boolean
  },
) => {
  const { isMobile, coinJson } = useSettings()
  const theme = useTheme()
  const { status, sum, vSymbol, symbol, time } = props
  // const { usdValue, usdDebt, usdEquity, forexMap } = props?.info ?? {}
  return (
    <>
      <Box
        justifySelf={'stretch'}
        display={'flex'}
        flexDirection={'column'}
        minWidth={'var(--modal-min-width)'}
        justifyContent={'center'}
        marginTop={2}
        paddingX={isMobile ? 1 : 0}
      >
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultRepayTypeLabel')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {props.t('labelVaultRepayType')}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultRepayStatusLabel')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {props.t('labelVaultRepayStatus', { status })}
          </Typography>
        </Typography>

        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultRepayTotalBalance')}
          </Typography>
          <Typography
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-primary)'}
            display={'inline-flex'}
            alignItems={'center'}
          >
            <CoinIcons
              size='small'
              type={TokenType.vault}
              tokenIcon={[coinJson[symbol!], undefined]}
            />
            {sum + ' ' + symbol}
          </Typography>
        </Typography>

        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultTime')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {moment(time).format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
      </Box>
      {props.isPending && (
        <Typography
          marginTop={2}
          variant={'body1'}
          component={'span'}
          padding={1}
          display={'inline-flex'}
          width={`calc(100% - ${9 * theme.unit}px)`}
          bgcolor={hexToRGB(theme.colorBase.warning, 0.2)}
          borderRadius={2}
          color={'var(--color-text-primary)'}
        >
          <AlertIcon color={'warning'} sx={{ marginRight: 1 / 2 }} />
          {props.t('labelVaultPendingDes')}
        </Typography>
      )}
    </>
  )
}

export const VaultRepay_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelVaultRepaySuccess', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: props.info && <RepayDes2 {...props} />,
  }
  return <VaultRepayBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultRepay_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelVaultRepayFailed', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: (
      <>
        {props.info && <RepayDes2 {...props} />}
        {props?.error && props.error?.message && (
          <Typography
            width={'var(--modal-min-width)'}
            variant={'body1'}
            component={'span'}
            color={'warning'}
            marginTop={2}
          >
            {props.error?.message}
          </Typography>
        )}
      </>
    ),
  }
  return <VaultRepayBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultRepay_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelVaultRepayInProgress', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: props.info && <RepayDes2 {...props} isPending={true} />,
  }
  return <VaultRepayBase showTitle={true} {...propsPatch} {...props} />
}

const DustCollectorDes = (
  props: PanelProps & {
    isPending?: boolean
  },
) => {
  const theme = useTheme()
  const { status, totalValueInCurrency, convertedInUSDT, repaymentInUSDT, time, dusts } = props
  const { t } = useTranslation()
  return (
    <>
      <Box
        justifySelf={'stretch'}
        display={'flex'}
        flexDirection={'column'}
        width={'100%'}
        justifyContent={'center'}
        marginTop={2}
        paddingX={3}
      >
        <Typography textAlign={'center'} variant='h4'>{repaymentInUSDT ? (repaymentInUSDT + ' USDT') : '--'} </Typography>
        <Typography textAlign={'center'} mt={1} mb={2} color={'var(--color-text-third)'}>{totalValueInCurrency} </Typography>
        <Box
          borderRadius={'8px'}
          bgcolor={'var(--color-box-secondary)'}
          paddingX={2.5}
          paddingY={1}
        >
          {status === 'success' && (
            <SpaceBetweenBox
              leftNode={<Typography color={'var(--color-text-third)'}>{t('labelVaultRepayment')}</Typography>}
              rightNode={<Typography>{repaymentInUSDT ? (repaymentInUSDT + ' USDT') : '--'} </Typography>}
              marginBottom={2}
            />
          )}
          <SpaceBetweenBox
            leftNode={<Typography color={'var(--color-text-third)'}>{t('labelVaultTime')}</Typography>}
            rightNode={<Typography>{moment(time).format(YEAR_DAY_MINUTE_FORMAT)}</Typography>}
          />
        </Box>
        
        <Box marginBottom={2} mt={2}>
          {dusts && dusts.map((dust) => {
            return (
              <SpaceBetweenBox
                paddingY={1.5}
                paddingX={2}
                marginBottom={1}
                alignItems={'center'}
                key={dust.symbol}
                leftNode={
                  <Box alignItems={'center'} display={'flex'}>
                    <CoinIcons type={TokenType.vault} tokenIcon={[dust.coinJSON]} />
                    <Typography marginLeft={1}>{dust.symbol}</Typography>
                  </Box>
                }
                rightNode={
                  <Box display={'flex'} alignItems={'center'}>
                    <Box marginRight={1}>
                      <Typography textAlign={'right'}>{dust.amount}</Typography>
                      <Typography
                        color={'var(--color-text-secondary)'}
                        textAlign={'right'}
                        variant={'body2'}
                      >
                        {dust.valueInCurrency}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            )
          })}
        </Box>
        {status === 'failed' && (
          <Box
            borderRadius={'8px'}
            display={'flex'}
            alignItems={'center'}
            paddingX={2.5}
            paddingY={1.5}
            bgcolor={hexToRGB(theme.colorBase.error, 0.2)}
          >
            <ErrorIcon sx={{ color: 'var(--color-error)', marginRight: 1 / 2 }} />
            <Typography>{t('labelVaultErrorOccurred')}</Typography>
          </Box>
        )}
      </Box>
    </>
  )
}

export const VaultDustCollector_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelVaultRepaySuccess', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: props.info && <DustCollectorDes status={'success'} {...props} />,
  }
  return <VaultDustCollectorBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultDustCollector_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelVaultRepayFailed', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: (
      <>
        {props.info && <DustCollectorDes status={'failed'} {...props} />}
        {props?.error && props.error?.message && (
          <Typography
            width={'var(--modal-min-width)'}
            variant={'body1'}
            component={'span'}
            color={'warning'}
            marginTop={2}
          >
            {props.error?.message}
          </Typography>
        )}
      </>
    ),
  }
  return <VaultDustCollectorBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultDustCollector_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelVaultRepayInProgress', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: props.info && <DustCollectorDes status={'inProgress'} {...props} isPending={true} />,
  }
  return <VaultDustCollectorBase showTitle={true} {...propsPatch} {...props} />
}
