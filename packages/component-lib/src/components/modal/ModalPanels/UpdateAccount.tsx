import { TFunction } from 'react-i18next'
import { BasicPanel, IconType, PanelProps, UpdateAccountBase } from './BasicPanel'
import { Box, Typography } from '@mui/material'
import { AnimationArrow, Button, useSettings } from '../../../index'
import { AccountBasePanel, AccountBaseProps } from './index'
import { DepositRecorder } from './DepositRecorder'
import { AccountHashInfo, L1L2_NAME_DEFINED, MapChainId } from '@loopring-web/common-resources'

export const UpdateAccount = ({
  t,
  goUpdateAccount,
  ...props
}: { t: TFunction } & AccountBaseProps & {
    goUpdateAccount?: () => void
    clearDepositHash: () => void
    chainInfos: AccountHashInfo
  }) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  return (
    <Box
      flex={1}
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
    >
      <Box
        display={'flex'}
        flex={1}
        marginBottom={5}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <AccountBasePanel {...props} t={t} />
      </Box>
      <Box
        display={'flex'}
        marginTop={2}
        alignSelf={'stretch'}
        paddingX={5}
        flexDirection={'column'}
        alignItems={'center'}
      >
        <Typography variant={'body2'}>
          {t('labelActivatedAccountDeposit', {
            layer2: L1L2_NAME_DEFINED[network].layer2,
          })}
        </Typography>
        <AnimationArrow className={'arrowCta'} />
        <Button
          variant={'contained'}
          fullWidth
          size={'medium'}
          onClick={() => {
            if (goUpdateAccount) {
              goUpdateAccount()
            }
          }}
        >
          {t('labelActivateAccount')}
        </Button>
      </Box>
      <Box
        display={'flex'}
        marginX={0}
        marginTop={3}
        marginBottom={0}
        alignSelf={'stretch'}
        paddingX={5}
        padding={0}
      >
        <DepositRecorder {...props} clear={props.clearDepositHash} t={t} />
      </Box>
    </Box>
  )
}

// symbol
export const UpdateAccount_Approve_WaitForAuth = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth', {
      layer2: L1L2_NAME_DEFINED[network].layer2,
      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }),
  }
  return <UpdateAccountBase {...props} {...propsPatch} />
}

export const UpdateAccount_First_Method_Denied = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelFirstSignDenied', {
      layer2: L1L2_NAME_DEFINED[network].layer2,
      loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }),
  }
  return <UpdateAccountBase {...propsPatch} {...props} />
}

export const UpdateAccount_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelSignDenied'),
  }
  return <UpdateAccountBase {...propsPatch} {...props} />
}

// symbol
export const UpdateAccount_Success = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const describe1 = props.t(
    props.patch?.isReset ? 'labelResetAccountSuccess' : 'labelUpdateAccountSuccess',
    {
      layer2: L1L2_NAME_DEFINED[network].layer2,
      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    },
  )
  const describe2 = (
    <Box display={'flex'} marginTop={0} alignItems={'flex-center'}>
      <Typography
        marginX={3}
        whiteSpace={'pre-line'}
        variant={'h5'}
        textAlign={'center'}
        color={'textPrimary'}
        component={'div'}
        marginTop={0}
        alignSelf={'flex-center'}
        paddingX={1}
      >
        {props.t(
          props.patch?.isReset ? 'labelResetAccountSuccess2' : 'labelUpdateAccountSuccess2',
          {
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          },
        )}
      </Typography>
    </Box>
  )
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1,
    describe2,
  }
  return <UpdateAccountBase {...propsPatch} {...props} />
}

// value symbol
export const UpdateAccount_Failed = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelUpdateAccountFailed', {
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
    }),
  }
  return <UpdateAccountBase {...propsPatch} {...props} />
}

export const UpdateAccount_SmartWallet_NotSupported_Alert = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: <Typography >Currently, only EOA wallets are supported.
      <br/>
      Loopring Smart Wallet support is coming soon.
      <br/>
      Stay tuned for updates!
    </Typography>,
  }
  return <BasicPanel {...propsPatch} {...props} title={undefined}/>
}
