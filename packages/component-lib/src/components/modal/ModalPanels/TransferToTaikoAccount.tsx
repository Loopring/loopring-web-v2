import { IconType, PanelProps, TransferToTaikoBase } from './BasicPanel'
import { useSettings } from '../../../stores'
import { L1L2_NAME_DEFINED, MapChainId } from '@loopring-web/common-resources'

export const Transfer_To_Taiko_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth'),
  }
  return <TransferToTaikoBase {...propsPatch} {...props} />
}

export const Transfer_To_Taiko_First_Method_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelFirstSignDenied'),
  }
  return <TransferToTaikoBase {...propsPatch} {...props} />
}

export const Transfer_To_Taiko_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelSignDenied'),
  }
  return <TransferToTaikoBase {...propsPatch} {...props} />
}

export const Transfer_To_Taiko_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelL2toL2InProgress'),
  }
  return <TransferToTaikoBase {...propsPatch} {...props} />
}

export const Transfer_To_Taiko_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelL2toL2Success', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <TransferToTaikoBase {...propsPatch} {...props} />
}

export const Transfer_To_Taiko_banxa_confirm = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t('labelBanxaConfirmSubmit', { order: props.info.id }),
  }
  return <TransferToTaikoBase {...propsPatch} {...props} />
}

export const Transfer_To_Taiko_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: 'Send to Taiko Failed'
  }
  return <TransferToTaikoBase {...propsPatch} {...props} />
}
