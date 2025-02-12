import { Trans } from 'react-i18next'
import { IconType, PanelProps, UnlockAccountBase } from './BasicPanel'
import { Box, Button, Link, Typography } from '@mui/material'
import { WalletType } from '@loopring-web/loopring-sdk'
import { FEED_BACK_LINK } from '@loopring-web/common-resources'
import { TextareaAutosizeStyled } from '../../basic-lib'
import React from 'react'
import { DropdownIconStyled } from '../../tradePanel'
import { TransErrorHelp } from '../../block'
import { Checkbox } from '@mui/material'
import { CheckBoxIcon, CheckedIcon } from '@loopring-web/common-resources'

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
  onClickReset,
  ...props
}: PanelProps & { walletType?: WalletType; onClickReset: () => void }) => {
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
            <Box>
              <Typography textAlign={'left'} variant={'body2'}>
                {t('labelUnlockErrorLine1Part1')}
                <Link onClick={onClickReset}>{t('labelUnlockErrorLine1Part2')}</Link>
                {t('labelUnlockErrorLine1Part3')}
              </Typography>
              <Typography
                textAlign={'left'}
                onClick={props.resetAccount}
                marginTop={1}
                variant={'body2'}
              >
                {t('labelUnlockErrorLine2Part1')}
                <Link onClick={onClickReset}>{t('labelUnlockErrorLine2Part2')}</Link>
              </Typography>
            </Box>
          ))}
      </>
    ),
  }
  return <UnlockAccountBase {...{ ...propsPatch, t }} />
}

export const UnlockAccount_Reset_Key_Confirm = ({
  t,
  resetAccount
}: PanelProps & { walletType?: WalletType; resetAccount: () => void }) => {
  const [checked, setChecked] = React.useState(false)
  return (
    <Box>
      <Typography textAlign={'center'} mt={3} variant={'h3'}>
        {t('labelUpdateAccount')}
      </Typography>
      <Box padding={4} mt={0}>
        <Typography textAlign={'left'} color={'var(--color-text-secondary)'}>
          Please read the following caveats carefully before resetting your EDDSA key:
          <br />
          <br />
          • If you have any unsettled Dual Investment portfolios, your account will be locked until
          they are settled.
          <br />
          • If you have an existing Portal position, you will not be able to reset your L2 on your
          own.
          <br />• If you are unsure about the sequence of this operation, please contact us at
          support@loopring.io and provide your wallet details for assistance.
          <br />• If you have any pending limit orders, they will be canceled because they are associated with the old L2 keypair.
        </Typography>

        <Typography
          textAlign={'left'}
          color={checked ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'}
          my={3}
        >
          <Checkbox
            checked={checked}
            checkedIcon={<CheckedIcon />}
            icon={<CheckBoxIcon />}
            color='default'
            sx={{ height: 16, width: 16, mr: 0.5 }}
            onChange={() => {
              setChecked(!checked)
            }}
          />
          I have read the caveats and still want to reset the EDDSA key on my own.
        </Typography>

        <Button variant={'contained'} disabled={!checked} fullWidth onClick={resetAccount}>
          Reset EDDSA Key
        </Button>
      </Box>
    </Box>
  )
}
