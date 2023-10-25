import {
  IconType,
  PanelProps,
  VaultBorrowBase,
  VaultExitBase,
  VaultJoinBase,
  VaultRepayBase,
  VaultTradeBase,
} from './BasicPanel'
import { Box, Typography } from '@mui/material'
import { YEAR_DAY_MINUTE_FORMAT } from '@loopring-web/common-resources'
import moment from 'moment/moment'
import { useSettings } from '../../../stores'

const TradeDes2 = (props: PanelProps) => {
  const { isMobile } = useSettings()
  const { percentage, symbol, amount, vSymbol, sum, time } = props?.info ?? {}
  return (
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
          {props.t('labelVaultTypeOpenPosition')}
        </Typography>
      </Typography>
      <Typography
        display={'inline-flex'}
        justifyContent={'space-between'}
        marginTop={2}
        component={'span'}
      >
        <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
          {props.t('labelVaultTradeStatus')}
        </Typography>
        <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
          {props.t('labelVaultTradeStatus', { percentage })}
        </Typography>
      </Typography>

      <Typography
        display={'inline-flex'}
        justifyContent={'space-between'}
        marginTop={2}
        component={'span'}
      >
        <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
          {props.t('labelVaultCollateral')}
        </Typography>
        <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
          <>
            {amount}
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              /{sum}
            </Typography>
            {symbol}
          </>
        </Typography>
      </Typography>
      <Typography
        component={'span'}
        display={'inline-flex'}
        justifyContent={'space-between'}
        marginTop={2}
      >
        <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
          {props.t('labelVaultReceive')}
        </Typography>
        <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
          <>
            {amount}
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              /{sum}
            </Typography>
            {vSymbol}
          </>
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
  )
}
export const VaultTrade_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
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
    describe2: props.info && <TradeDes2 {...props} />,
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
    describe2: props.info && <TradeDes2 {...props} />,
  }
  return <VaultTradeBase showTitle={true} {...propsPatch} {...props} />
}
const JoinDes2 = (props: PanelProps) => {
  const { isMobile } = useSettings()
  const { percentage, symbol, vSymbol, sum, amount, status, time } = props?.info ?? {}
  return (
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
          {props.t('labelVaultTypeOpenPosition')}
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
          {props.t(`labelVaultJoinStatus${status}`, { percentage })}
        </Typography>
      </Typography>

      <Typography
        display={'inline-flex'}
        justifyContent={'space-between'}
        marginTop={2}
        component={'span'}
      >
        <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
          {props.t('labelVaultCollateral')}
        </Typography>
        <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
          <>
            {amount}
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              /{sum}
            </Typography>
            {symbol}
          </>
        </Typography>
      </Typography>
      <Typography
        component={'span'}
        display={'inline-flex'}
        justifyContent={'space-between'}
        marginTop={2}
      >
        <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
          {props.t('labelVaultReceive')}
        </Typography>
        <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
          <>
            {amount}
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              /{sum}
            </Typography>
            {vSymbol}
          </>
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
  )
}
export const VaultJoin_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
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
    //TODO
    describe2: (
      <>
        {props.info && <JoinDes2 {...props} />} {props.error && props.error?.message}
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
    describe2: props.info && <JoinDes2 {...props} />,
  }
  return <VaultJoinBase title={props.info?.title} {...propsPatch} {...props} />
}
const RedeemDes2 = (
  props: PanelProps & {
    isPending?: boolean
  },
) => {
  const { isMobile } = useSettings()
  const { usdValue, usdDebt, usdEquity, forexMap, time } = props?.info ?? {}
  return forexMap ? (
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
            {props.t('labelVaultExitType')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {props.t('labelVaultExitTypeClose')}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelVaultExitStatus')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {props.t('labelVaultExitStatusPending')}
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
            {props.t('labelVaultTime')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {moment(time).format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
      </Box>
      {props.isPending && (
        <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
          {props.t('labelVaultExitPendingDes')}
        </Typography>
      )}
    </>
  ) : (
    <></>
  )
}
export const VaultRedeem_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
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
    describe2: props.info && <RedeemDes2 {...props} />,
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
  const { isMobile } = useSettings()
  const { amount, sum, status, symbol, time } = props?.info ?? {}
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
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {amount}/{sum} {symbol}
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
    </>
  )
}

export const VaultBorrow_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
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
        {props.info && <BorrowDes2 {...props} />} {props.error && props.error?.message}
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
  const { isMobile } = useSettings()
  const { status, amount, sum, vSymbol, time } = props
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
            {props.t('labelVaultRepayStatus')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {props.t('labelVaultRepayStatusLabel', { status })}
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
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            <>
              {amount}
              <Typography
                variant={'body1'}
                component={'span'}
                color={'var(--color-text-secondary)'}
              >
                /{sum}
              </Typography>
              {vSymbol}
            </>
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
        <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
          {props.t('labelVaultExitPendingDes')}
        </Typography>
      )}
    </>
  )
}

export const VaultRepay_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
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
    describe2: props.info && <RepayDes2 {...props} />,
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
