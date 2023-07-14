import { ForceWithdrawBase, IconType, PanelProps } from './BasicPanel'
import { L1L2_NAME_DEFINED, MapChainId, NFTWholeINFO } from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'

export const ForceWithdraw_WaitForAuth = (props: PanelProps & Partial<NFTWholeINFO>) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelForceWithdrawWaitForAuth', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <ForceWithdrawBase {...propsPatch} {...props} />
}

export const ForceWithdraw_Denied = (props: PanelProps & Partial<NFTWholeINFO>) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelForceWithdrawDenied', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <ForceWithdrawBase {...propsPatch} {...props} />
}

export const ForceWithdraw_First_Method_Denied = (props: PanelProps & Partial<NFTWholeINFO>) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelFirstSignDenied', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <ForceWithdrawBase {...propsPatch} {...props} />
}

export const ForceWithdraw_In_Progress = (props: PanelProps & Partial<NFTWholeINFO>) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelForceWithdrawInProgress', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <ForceWithdrawBase {...propsPatch} {...props} />
}

export const ForceWithdraw_Failed = (props: PanelProps & Partial<NFTWholeINFO>) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelForceWithdrawFailed', {
      symbol: props.symbol,
      value: props.value,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }),
  }
  return <ForceWithdrawBase {...propsPatch} {...props} />
}

export const ForceWithdraw_Submit = (props: PanelProps & Partial<NFTWholeINFO>) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t('labelForceWithdrawSubmit', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <ForceWithdrawBase {...propsPatch} {...props} />
}
