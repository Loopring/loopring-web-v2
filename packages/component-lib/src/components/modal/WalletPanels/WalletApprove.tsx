import { Trans } from 'react-i18next'
import { BasicPanel, IconType, PanelProps } from '../ModalPanels/BasicPanel'

export const WalletApprove = (props: PanelProps) => {
  const propsPatch = {
    title: 'labelWalletApprove',
  }
  return <BasicPanel {...propsPatch} {...props} />
}
// symbol
export const Approve_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth'),
  }
  return <WalletApprove {...props} {...propsPatch} />
}

export const Approve_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: <Trans i18nKey={'labelSignDenied'} />,
  }
  return <WalletApprove {...propsPatch} {...props} />
}

// symbol
export const Approve_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: <Trans i18nKey={'labelApproveSuccess'} />,
  }
  return <WalletApprove {...propsPatch} {...props} />
}

// value symbol
export const Approve_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: <Trans i18nKey={'labelApproveFailed'} />,
  }
  return <WalletApprove {...propsPatch} {...props} />
}

export const HebaoReject = (props: PanelProps) => {
  const propsPatch = {
    title: 'labelWalletReject',
  }
  return <BasicPanel {...propsPatch} {...props} />
}

// symbol
export const Reject_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth'),
  }
  return <HebaoReject {...props} {...propsPatch} />
}

export const Reject_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: <Trans i18nKey={'labelSignDenied'} />,
  }
  return <HebaoReject {...propsPatch} {...props} />
}

// symbol
export const Reject_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: <Trans i18nKey={'labelRejectSuccess'} />,
  }
  return <HebaoReject {...propsPatch} {...props} />
}

// value symbol
export const Reject_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: <Trans i18nKey={'labelRejectFailed'} />,
  }
  return <HebaoReject {...propsPatch} {...props} />
}
