import { IconType, PanelProps, VaultExitBase, VaultJoinBase, VaultTradeBase } from './BasicPanel'

export const VaultTrade_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t('labelVaultTradeSuccess', {
      symbol: props.symbol,
      value: props.value,
    }),
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
  }
  return <VaultTradeBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultJoin_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t('labelVaultJoinSuccess', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <VaultJoinBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultJoin_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelVaultJoinFailed', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <VaultJoinBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultJoin_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelVaultJoinInProgress', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <VaultJoinBase showTitle={true} {...propsPatch} {...props} />
}
export const VaultRedeem_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelVaultRedeemSuccess', {
      symbol: props.symbol,
      value: props.value,
    }),
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
  }
  return <VaultExitBase showTitle={true} {...propsPatch} {...props} />
}
