import { IconType, PanelProps, WithdrawBase } from './BasicPanel'
import { sanitize } from 'dompurify'
import { useSettings } from '../../../stores'
import { L1L2_NAME_DEFINED, MapChainId } from '@loopring-web/common-resources'

// value symbol
export const Withdraw_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth'),
  }
  return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_First_Method_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelFirstSignDenied'),
  }
  return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelSignDenied'),
  }
  return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelL2toL1InProgress'),
  }
  return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_Success = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelL2toL1Success', {
      symbol: props.symbol,
      value: props.value,
      layer2: L1L2_NAME_DEFINED[network].layer2,
      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }),
  }
  return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_Failed = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelL2toL1Failed', {
      symbol: props.symbol,
      value: props.value,
      layer2: L1L2_NAME_DEFINED[network].layer2,
      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }),
  }
  return <WithdrawBase {...propsPatch} {...props} />
}

export const NFTWithdraw_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth'),
  }
  return <WithdrawBase {...propsPatch} {...props} />
}

export const NFTWithdraw_First_Method_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelFirstSignDenied'),
  }
  return <WithdrawBase {...propsPatch} {...props} />
}

export const NFTWithdraw_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelSignDenied'),
  }
  return <WithdrawBase {...propsPatch} {...props} />
}

export const NFTWithdraw_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelL2toL1InProgress'),
  }
  return <WithdrawBase {...propsPatch} {...props} />
}

export const NFTWithdraw_Success = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelL2toL1Success', {
      symbol: sanitize(props.symbol ?? 'NFT'),
      value: props.value,
      layer2: L1L2_NAME_DEFINED[network].layer2,
      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }),
  }
  return <WithdrawBase {...propsPatch} {...props} />
}

export const NFTWithdraw_Failed = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelL2toL1Failed', {
      symbol: sanitize(props.symbol ?? 'NFT'),
      value: props.value,
      layer2: L1L2_NAME_DEFINED[network].layer2,
      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }),
  }
  return <WithdrawBase {...propsPatch} {...props} />
}
