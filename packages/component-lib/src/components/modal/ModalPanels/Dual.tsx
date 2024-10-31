import { AmmBase, BtradeBase, DualBase, IconType, PanelProps, TaikoFarmingMintBase, TaikoFarmingStakeBase } from './BasicPanel'
import { Box, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material'
import { useSettings } from '../../../stores'
import {
  ConvertToIcon,
  EmptyValueTag,
  Info2Icon,
  YEAR_DAY_MINUTE_FORMAT,
} from '@loopring-web/common-resources'
import moment from 'moment'
import { CoinIcon } from '../../basic-lib'

// value symbol
export const Dual_Success = (props: PanelProps) => {
  const { isMobile } = useSettings()
  const propsPatch = {
    iconType: IconType.PendingIcon,
    describe1: (
      <Typography variant={'h5'} color={'var(--color-primary)'} component={'span'}>
        {props.t('labelDualProcessing', {
          symbol: props.symbol,
          value: props.value,
        })}
      </Typography>
    ),
    describe2: (
      <Typography
        justifySelf={'stretch'}
        display={'flex'}
        flexDirection={'column'}
        minWidth={'var(--modal-min-width)'}
        justifyContent={'center'}
        marginTop={2}
        paddingX={isMobile ? 1 : 5}
        whiteSpace={'pre-line'}
        color={'textSecondary'}
        component={'span'}
      >
        {props.t('labelDualProcessingDes')}
      </Typography>
    ),
  }
  return <DualBase showTitle={false} {...propsPatch} {...props} />
}

// value symbol
export const Dual_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelDualFailed', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <DualBase showTitle={true} {...propsPatch} {...props} />
}

export const Staking_Success = (props: PanelProps) => {
  const { isMobile } = useSettings()
  const { info } = props
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: (
      <Typography variant={'h5'} color={'var(--color-primary)'} component={'span'}>
        {props.t('labelStakingSuccess', {
          symbol: info.symbol,
        })}
      </Typography>
    ),
    describe2: (
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
            {props.t('labelDeFiSideAmount')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info.amount + ' ' + info.symbol}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelDeFiSideProduct')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.productId ?? EmptyValueTag}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelDeFiSideSubscribeTime')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {moment(new Date(info.stakeAt))
              // .utc()
              // .startOf("days")
              .format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelDeFiSideLockDuration')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info.daysDuration
              ? '≥ ' + info.daysDuration + ' ' + props.t('labelDay')
              : EmptyValueTag}
          </Typography>
        </Typography>
      </Box>
    ),
  }
  return <DualBase showTitle={false} {...propsPatch} {...props} />
}
export const Staking_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelStakingFailed', {
      symbol: props.info?.symbol,
    }),
  }
  return <DualBase showTitle={true} {...propsPatch} {...props} />
}

export const Staking_Redeem_Success = (props: PanelProps) => {
  const { isMobile } = useSettings()
  const { info } = props
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: (
      <Typography variant={'h5'} color={'var(--color-primary)'}>
        {props.t('labelStakingRedeemSuccess', {
          symbol: info?.symbol,
        })}
      </Typography>
    ),
    describe2: (
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
            {props.t('labelDefiStakingRedeem')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info.amount + ' ' + info.symbol}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelStakingRedeemRemaining')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info.remainAmount && info.remainAmount != '0'
              ? info.remainAmount + ' ' + info.symbol
              : EmptyValueTag}
          </Typography>
        </Typography>

        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelDeFiSideProduct')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.productId ?? EmptyValueTag}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelStakingRedeemDate')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {moment(new Date())
              // .utc()
              // .startOf("days")
              .format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
      </Box>
    ),
  }
  return <DualBase showTitle={false} {...propsPatch} {...props} />
}

export const Staking_Redeem_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelStakingFailed', {
      symbol: props.info?.symbol,
    }),
  }
  return <DualBase showTitle={true} {...propsPatch} {...props} />
}

export const BtradeDetail = (props: any) => {
  const { isMobile } = useSettings()
  const { info } = props
  const { t } = props
  return info?.buyToken && info?.sellToken ? (
    <Box
      justifySelf={'stretch'}
      display={'flex'}
      flexDirection={'column'}
      minWidth={'var(--modal-min-width)'}
      justifyContent={'center'}
      marginTop={0}
      paddingX={isMobile ? 1 : 5}
      alignSelf={'stretch'}
    >
      <Box display={'flex'} flexDirection={'column'} marginTop={2}>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography
            display={'flex'}
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-secondary)'}
          >
            {t("labelBtradePlacedAmount")}
            <Tooltip title={<>{t("labelBtradePlacedAmountTip")}</>}>
              <Typography marginLeft={0.5} display={'flex'} alignItems={'center'}>
                <Info2Icon fontSize={'medium'} htmlColor={'var(--color-text-third)'} />
              </Typography>
            </Tooltip>
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.placedAmount}
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
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-secondary)'}
          >
            {t("labelBtradeExecutedAmount")}
            <Tooltip title={<>{t("labelBtradeExecutedAmountTip")}</>}>
              <Typography marginLeft={0.5} display={'flex'} alignItems={'center'}>
                <Info2Icon fontSize={'medium'} htmlColor={'var(--color-text-third)'} />
              </Typography>
            </Tooltip>
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.executedAmount}
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
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-secondary)'}
          >
            {t("labelBtradeExecutedRate")}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.executedRate}
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
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-secondary)'}
          >
            {t("labelBtradeConvertedAmount")}
            <Tooltip title={<>{t("labelBtradeConvertedAmountTip")}</>}>
              <Typography marginLeft={0.5} display={'flex'} alignItems={'center'}>
                <Info2Icon fontSize={'medium'} htmlColor={'var(--color-text-third)'} />
              </Typography>
            </Tooltip>
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.convertedAmount}
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
            variant={'body1'}
            component={'span'}
            color={'var(--color-text-secondary)'}
          >
            {t("labelBtradeSettledAmount")}
            <Tooltip title={<>{t("labelBtradeSettledAmountTip")}</>}>
              <Typography marginLeft={0.5} display={'flex'} alignItems={'center'}>
                <Info2Icon fontSize={'medium'} htmlColor={'var(--color-text-third)'} />
              </Typography>
            </Tooltip>
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.settledAmount}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelPrice')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.convertStr}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelFee')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.feeStr ? info?.feeStr + ' ' + info.buyToken.symbol : EmptyValueTag}
          </Typography>
        </Typography>
        {info?.time && (
          <Typography
            component={'span'}
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
          >
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {props.t('labelBtradeTime')}
            </Typography>
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
              {moment(new Date(info.time)).format(YEAR_DAY_MINUTE_FORMAT)}
            </Typography>
          </Typography>
        )}
      </Box>
    </Box>
  ) : (
    <></>
  )
}

export const BtradeSwap_Delivering = (props: PanelProps) => {
  const { t } = props
  const { isMobile } = useSettings()

  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: (
      <Box
        paddingX={isMobile ? 1 : 5}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
      >
        <Typography color={'var(--color-text-primary)'} variant={'h5'} component={'span'}>
          {t('labelBtradeSwapDelivering')}
        </Typography>
        <Typography
          color={'var(--color-text-secondary)'}
          marginTop={2}
          component={'span'}
          whiteSpace={'pre-line'}
          sx={{ wordBreak: 'break-word' }}
        >
          {t('labelBtradeSwapDeliverDes')}
        </Typography>
      </Box>
    ),
    describe2: <BtradeDetail {...props} />,
  }
  return <BtradeBase {...propsPatch} {...props} />
}
export const BtradeSwap_Pending = (props: PanelProps) => {
  const { t } = props
  const propsPatch = {
    iconType: IconType.PendingIcon,
    describe1: (
      <Typography color={'var(--color-text-primary)'} variant={'h5'} component={'span'}>
        {t('labelBtradeSwapPending')}
      </Typography>
    ),
    describe2: <BtradeDetail {...props} />,
  }
  return <BtradeBase {...propsPatch} {...props} />
}

export const BtradeSwap_Settled = (props: PanelProps) => {
  const { t } = props
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: (
      <Typography color={'var(--color-text-primary)'} variant={'h5'} component={'span'}>
        {t('labelBtradeSwapSettled')}
      </Typography>
    ),
    describe2: <BtradeDetail {...props} />,
  }
  return <BtradeBase {...propsPatch} {...props} />
}

export const BtradeSwap_Failed = (props: PanelProps) => {
  const { t } = props
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: (
      <Typography color={'var(--color-text-primary)'} variant={'h5'} component={'span'}>
        {t('labelBtradeSwapFailed')}
      </Typography>
    ),
    describe2: <BtradeDetail {...props} />,
  }
  return <BtradeBase {...propsPatch} {...props} />
}

export const AMM_Pending = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.PendingIcon,
    // describe1: (
    //   <Typography
    //     color={"var(--color-text-primary)"}
    //     variant={"h5"}
    //     component={"span"}
    //   >
    //     {t("labelAMMPending")}
    //   </Typography>
    // ),
  }
  return <AmmBase {...{ ...props, ...propsPatch }} />
}

export const Taiko_Farming_Lock_Success = (props: PanelProps) => {
  const { isMobile } = useSettings()
  const { info } = props
  const propsPatch = {
    iconType: IconType.DoneIcon,
    title: props.t('labelTaikoFarming'),
    describe1: (
      <Typography variant={'h5'} color={'var(--color-primary)'} component={'span'}>
        {props.t('labelTaikoFarmingLockSuccess')}
      </Typography>
    ),
    describe2: (
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
            {props.t('labelDeFiSideAmount')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.amount + ' ' + info?.symbol}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelDeFiSideSubscribeTime')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.stakeAt && moment(new Date(info.stakeAt))
              // .utc()
              // .startOf("days")
              .format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
      </Box>
    ),
  }
  return <DualBase showTitle={false} {...propsPatch} {...props} />
}
export const Taiko_Farming_Lock_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelStakingFailed', {
      symbol: props.info?.symbol,
    }),
  }
  return <DualBase showTitle={true} {...propsPatch} {...props} />
}

export const Taiko_Farming_Redeem_Success = (props: PanelProps) => {
  const { isMobile } = useSettings()
  const { info } = props
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: (
      <Typography variant={'h5'} color={'var(--color-primary)'}>
        {props.t('labelStakingRedeemSuccess', {
          symbol: info?.symbol,
        })}
      </Typography>
    ),
    describe2: (
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
            {props.t('labelDefiStakingRedeem')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.amount + ' ' + info?.symbol}
          </Typography>
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelStakingRedeemRemaining')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.remainAmount && info?.remainAmount != '0'
              ? info?.remainAmount + ' ' + info?.symbol
              : EmptyValueTag}
          </Typography>
        </Typography>

        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelDeFiSideProduct')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.productId ?? EmptyValueTag}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelStakingRedeemDate')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {moment(new Date())
              // .utc()
              // .startOf("days")
              .format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
      </Box>
    ),
  }
  return <TaikoFarmingStakeBase showTitle={false} {...propsPatch} {...props} />
}

export const Taiko_Farming_Redeem_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelStakingFailed', {
      symbol: props.info?.symbol,
    }),
  }
  return <TaikoFarmingStakeBase showTitle={true} {...propsPatch} {...props} />
}

export const Taiko_Farming_Mint_Success = (props: PanelProps) => {
  const { isMobile } = useSettings()
  const { info } = props
  const propsPatch = {
    iconType: IconType.DoneIcon,
    title: props.t('Mint lrTAIKO'),
    describe1: (
      <Typography variant={'h5'} color={'var(--color-text-primary)'} component={'span'}>
        {/* {props.t('labelTaikoFarmingMintSuccess')} */}
        Successful
      </Typography>
    ),
    describe2: (
      <Box
        justifySelf={'stretch'}
        display={'flex'}
        flexDirection={'column'}
        minWidth={'var(--modal-min-width)'}
        justifyContent={'center'}
        marginTop={2}
        paddingX={isMobile ? 1 : 3}
      >
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            Time
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.amount + ' ' + info?.symbol}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelDeFiSideSubscribeTime')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.mintAt && moment(new Date(info.mintAt)).format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>

        <Typography mt={3}>
          You can freely use lrTAIKO across all trading and earning options within Loopring DeFi.{' '}
        </Typography>
        <Typography
          component={'p'}
          onClick={() => window.open('/#/portal/portalHome', '_blank')}
          sx={{ cursor: 'pointer' }}
          color={'var(--color-primary)'}
          mt={1}
        >{`Visit Portal to use lrTAIKO as collateral to earn >`}</Typography>
      </Box>
    ),
  }
  return <TaikoFarmingMintBase showTitle={false} {...propsPatch} {...props} />
}

export const Taiko_Farming_Mint_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('Mint Failed'),
  }
  return <TaikoFarmingMintBase showTitle={true} {...propsPatch} {...props} />
}

export const Taiko_Farming_Mint_In_Progress = (props: PanelProps) => {
  const { isMobile } = useSettings()
  const { info } = props
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelVaultRepayInProgress', {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: (
      <Box
        justifySelf={'stretch'}
        display={'flex'}
        flexDirection={'column'}
        minWidth={'var(--modal-min-width)'}
        justifyContent={'center'}
        marginTop={2}
        paddingX={isMobile ? 1 : 3}
      >
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            Time
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.amount + ' ' + info?.symbol}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelDeFiSideSubscribeTime')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {info?.mintAt && moment(new Date(info.mintAt)).format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>

      </Box>
    ),
  }
  return <TaikoFarmingMintBase showTitle={true} {...propsPatch} {...props} />
}