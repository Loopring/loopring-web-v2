import { CreateAccountBase, IconType, PanelProps } from './BasicPanel'
import { L1L2_NAME_DEFINED, MapChainId } from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'

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
