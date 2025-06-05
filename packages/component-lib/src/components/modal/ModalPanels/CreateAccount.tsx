import { CreateAccountBase, IconType, PanelProps } from './BasicPanel'
import { AlertIcon2, L1L2_NAME_DEFINED, MapChainId } from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'
import { Button, Checkbox, Modal, Box, Typography } from '@mui/material'
import { useState } from 'react'
import { Trans } from 'react-i18next'
import { useTheme } from '@emotion/react'
import { CheckBoxIcon, CheckedIcon } from '@loopring-web/common-resources'

// symbol
export const CreateAccount_Approve_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelTokenAccess', { symbol: props.symbol }),
  }
  return <CreateAccountBase {...props} {...propsPatch} />
}

// symbol
export const CreateAccount_Approve_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelFailedTokenAccess', { symbol: props.symbol }),
  }
  return <CreateAccountBase {...propsPatch} {...props} />
}

// symbol
export const CreateAccount_Approve_Submit = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t('labelSuccessTokenAccess', { symbol: props.symbol }),
  }
  return <CreateAccountBase {...propsPatch} {...props} />
}

// value symbol
export const CreateAccount_WaitForAuth = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelL1toL2WaitForAuth', {
      symbol: props.symbol,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
    }),
  }
  return <CreateAccountBase {...propsPatch} {...props} />
}

// value symbol
export const CreateAccount_Denied = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelCreateAccountDepositDenied', {
      layer2: L1L2_NAME_DEFINED[network].layer2,
      symbol: props.symbol,
    }),
  }
  return <CreateAccountBase {...propsPatch} {...props} />
}

// value symbol
export const CreateAccount_Failed = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelCreateAccountFailed', {
      layer2: L1L2_NAME_DEFINED[network].layer2,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      value: props.value,
      symbol: props.symbol,
    }),
  }
  return <CreateAccountBase {...propsPatch} {...props} />
}

// value symbol
export const CreateAccount_Submit = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t('labelCreateAccountSubmit', {
      layer2: L1L2_NAME_DEFINED[network].layer2,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      value: props.value,
      symbol: props.symbol,
      count: 30,
    }),
  }
  return <CreateAccountBase {...propsPatch} {...props} />
}

export const CreateAccount_EOA_Only_Alert = (props: {
  onClose: () => void
  onConfirm: () => void
}) => {
  const [acknowledged, setAcknowledged] = useState(false)
  const theme = useTheme()
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: 2,
        width: '90%',
        maxWidth: '480px',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 5, mt: 3 }}>
        <AlertIcon2
          className='custom-size'
          sx={{ fontSize: '88px' }}
          color={theme.colorBase.textPrimary}
        />
      </Box>

      <Box sx={{ color: 'var(--color-text-primary)', mb: 3 }}>
        <Typography>
          Please ensure that you are activating your Loopring account using an EOA (Externally Owned
          Account) wallet.
        </Typography>
        <Typography sx={{ color: 'var(--color-text-secondary)', mt: 4 }}>
          Currently, only EOA wallets are supported on the Loopring network. Smart contract wallets
          are not supported. <br />
          Depositing assets to a smart wallet on the Loopring network may result in permanent loss
          of those assets. Please exercise caution.
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Checkbox
                    
                    checkedIcon={<CheckedIcon />}
                    icon={<CheckBoxIcon />}
                    color='default'
                    sx={{ height: 16, width: 16, mr: 1}}
                    onChange={(_, checked) => {
                      setAcknowledged(checked)
                    }}
                  />
        <Typography sx={{ color: 'var(--color-text-primary)' }}>
          I acknowledge the risk and would like to proceed
        </Typography>
      </Box>

      <Button fullWidth variant='contained' onClick={props.onConfirm} disabled={!acknowledged}>
        Confirm
      </Button>
    </Box>
  )
}
