import { Trans, useTranslation } from 'react-i18next'
import { DepositBase, IconType, PanelProps } from './BasicPanel'
import { Box, Link, Typography } from '@mui/material'
import {
  getShortAddr,
  L1L2_NAME_DEFINED,
  LinkIcon,
  MapChainId,
} from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'
import { ChainId } from '@loopring-web/loopring-sdk'
import { useSystem } from '@loopring-web/core'

export const Deposit_Sign_WaitForRefer = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitingRefer'),
  }
  return <DepositBase {...props} {...propsPatch} />
}

export const Deposit_Approve_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelTokenAccess', { symbol: props.symbol }),
  }
  return <DepositBase {...props} {...propsPatch} />
}

export const Deposit_Approve_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelFailedTokenAccess', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <DepositBase {...propsPatch} {...props} />
}

export const Deposit_WaitForAuth = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const { app } = useSystem()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const isTaikoEarn = app === 'earn' && [ChainId.TAIKO, ChainId.TAIKOHEKLA].includes(defaultNetwork)
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: (
      <Typography variant='h5' width={'400px'}>
        {isTaikoEarn
          ? props.t('labelL1toL2WaitForAuthTaikoEarn', {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              symbol: props.symbol,
              value: props.value,
              to: props.to ?? '',
            })
          : props.t('labelL1toL2WaitForAuth', {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              symbol: props.symbol,
              value: props.value,
              to: props.to ?? '',
            })}
      </Typography>
    ),
  }
  return <DepositBase {...propsPatch} {...props} />
}

export const Deposit_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelL1toL2Denied', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <DepositBase {...propsPatch} {...props} />
}

export const Deposit_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelL1toL2Failed', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <DepositBase {...propsPatch} {...props} />
}

export const Deposit_Submit = (props: PanelProps) => {
  const { defaultNetwork, isMobile } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const { t } = useTranslation()
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: (
      <Link
        fontSize={'inherit'}
        whiteSpace={'break-spaces'}
        display={'inline-flex'}
        alignItems={'center'}
        style={{ wordBreak: 'break-all' }}
        target='_blank'
        rel='noopener noreferrer'
        href={`${props.etherscanBaseUrl}tx/${props?.hash ?? ''}`}
      >
        <Trans
          i18nKey={'labelL1toL2Submit'}
          tOptions={{
            symbol: props.symbol,
            value: props.value,
          }}
        >
          Add asset submitted.
          <LinkIcon color={'inherit'} fontSize={'medium'} />
        </Trans>
      </Link>
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
        <Typography color={'var(--color-warning)'} component={'span'}>
          {t('labelDepositWaiting')}
        </Typography>
        <Typography
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          component={'span'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {props.t('labelL1toL2TokenAmount')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {props.value + ' ' + props.symbol}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography component={'span'} variant={'body1'} color={'var(--color-text-secondary)'}>
            {props.t('labelL1toL2From')}
          </Typography>
          <Typography component={'span'} variant={'body1'} color={'var(--color-text-primary)'}>
            {'L1: ' + getShortAddr(props.account?.accAddress ?? '')}
          </Typography>
        </Typography>
        <Typography
          component={'span'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography component={'span'} variant={'body1'} color={'var(--color-text-secondary)'}>
            {props.t('labelL1toL2TO', {
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            })}
          </Typography>
          <Typography component={'span'} variant={'body1'} color={'var(--color-text-primary)'}>
            {props.to
              ? `${L1L2_NAME_DEFINED[network].l2Symbol}: ` + getShortAddr(props.to)
              : t('labelToMyL2', {
                  l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                  l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                  ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                })}
          </Typography>
        </Typography>
      </Box>
    ),
  }
  return <DepositBase {...propsPatch} {...props} />
}
