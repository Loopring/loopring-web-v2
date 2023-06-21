import { Trans, useTranslation } from 'react-i18next'
import { BasicPanel, IconType, PanelProps } from '../ModalPanels/BasicPanel'
import { Box, Typography } from '@mui/material'

export const LockWallet = (props: PanelProps) => {
  const propsPatch = {
    title: 'labelLockWallet',
  }
  return <BasicPanel {...propsPatch} {...props} />
}
// symbol
export const LockAccount_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth'),
  }
  return <LockWallet {...props} {...propsPatch} />
}

export const LockAccount_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: <Trans i18nKey={'labelSignDenied'}></Trans>,
  }
  return <LockWallet {...propsPatch} {...props} />
}

// symbol
export const LockAccount_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: <Trans i18nKey={'labelLockAccountSuccess'}></Trans>,
  }
  return <LockWallet {...propsPatch} {...props} />
}

// value symbol
export const LockAccount_Failed = (props: PanelProps & any) => {
  const { t } = useTranslation('common')
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: (
      <Box>
        <Typography component={'p'}>{t('labelLockAccountFailed')}</Typography>
        <Typography>{props?.error}</Typography>
      </Box>
    ),
  }
  return <LockWallet {...propsPatch} {...props} />
}
