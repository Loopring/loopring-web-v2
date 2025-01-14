import { Trans } from 'react-i18next'
import { IconType, PanelProps, UnlockAccountBase } from './BasicPanel'
import { Box, Link, Typography } from '@mui/material'
import { WalletType } from '@loopring-web/loopring-sdk'
import { FEED_BACK_LINK } from '@loopring-web/common-resources'
import { TextareaAutosizeStyled } from '../../basic-lib'
import React from 'react'
import { DropdownIconStyled } from '../../tradePanel'
import { TransErrorHelp } from '../../block'

// symbol
export const UnlockAccount_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth'),
  }
  return <UnlockAccountBase {...props} {...propsPatch} />
}

export const UnlockAccount_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: <Trans i18nKey={'labelSignDenied'} />,
  }
  return <UnlockAccountBase {...propsPatch} {...props} />
}

// symbol
export const UnlockAccount_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: <Trans i18nKey={'labelUnlockAccountSuccess'} />,
  }
  return <UnlockAccountBase {...propsPatch} {...props} />
}

export const UnlockAccount_Failed = ({
  error,
  errorOptions,
  t,
  ...props
}: PanelProps & { walletType?: WalletType; resetAccount: () => void }) => {
  const isContractOrInCounterFactual =
    props.walletType && (props.walletType.isContract || props.walletType.isInCounterFactualStatus)
  const showDropdown =
    error?.code === 500000 || isContractOrInCounterFactual
  const [dropdownStatus, setDropdownStatus] = React.useState<'up' | 'down'>('down')
  const propsPatch = {
    ...props,
    iconType: IconType.FailedIcon,
    describe1: (
      <>
        {error ? (
          <Box display={'flex'} flexDirection={'column'}>
            <Typography
              color={'var(--color-error)'}
              component={'span'}
              variant={'inherit'}
              display={'inline-flex'}
              onClick={() => setDropdownStatus((prev) => (prev === 'up' ? 'down' : 'up'))}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <TransErrorHelp error={error} options={errorOptions} />
              {showDropdown && <DropdownIconStyled status={dropdownStatus} fontSize={'medium'} />}
            </Typography>
            {isContractOrInCounterFactual && (
              <Typography color={'textSecondary'} paddingLeft={2}>
                <Trans i18nKey={'labelConnectUsSimple'} ns={'error'}>
                  Please
                  <Link target='_blank' rel='noopener noreferrer' href={FEED_BACK_LINK}>
                    contact us
                  </Link>
                  .
                </Trans>
              </Typography>
            )}
          </Box>
        ) : (
          <Trans i18nKey={'labelUnlockAccountFailed'} />
        )}
        {showDropdown &&
          dropdownStatus === 'up' &&
          (isContractOrInCounterFactual ? (
            <TextareaAutosizeStyled
              aria-label='Error Description'
              minRows={5}
              style={{ maxHeight: '90px', overflow: 'scroll' }}
              disabled={true}
              value={`${JSON.stringify(error)}}`}
            />
          ) : (
            <Typography marginTop={1} variant={'body2'}>

              {t('labelUnlockErrorSupport1')} <br/>
              {t('labelUnlockErrorSupport2')}
            </Typography>
          ))}
      </>
    ),
  }
  return <UnlockAccountBase {...{ ...propsPatch, t }} />
}
