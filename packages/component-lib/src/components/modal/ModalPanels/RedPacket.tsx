import { IconType, PanelProps, RedPacketBase, RedPacketOpenBase } from './BasicPanel'
import { sanitize } from 'dompurify'
import * as sdk from '@loopring-web/loopring-sdk'

// value symbol
export const RedPacketSend_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth'),
  }
  return <RedPacketBase {...propsPatch} {...props} />
}

// value symbol
export const RedPacketSend_First_Method_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelFirstSignDenied'),
  }
  return <RedPacketBase {...propsPatch} {...props} />
}

// value symbol
export const RedPacketSend_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelSignDenied'),
  }
  return <RedPacketBase {...propsPatch} {...props} />
}

// value symbol
export const RedPacketSend_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelRedPacketSendInProgress'),
  }
  return <RedPacketBase {...propsPatch} {...props} />
}

// value symbol
export const RedPacketSend_Success = (props: PanelProps) => {
  let propsPatch: any = {
    iconType: IconType.DoneIcon,
  }
  if (props.info.scope === sdk.LuckyTokenViewType.TARGET) {
    propsPatch = {
      ...propsPatch,
      title: 'labelSendRedPacketTitleExclusive',
      describe1: props.t('labelRedPacketSendSuccess', {
        symbol: props.symbol,
        value: props.value,
      }),
    }
  } else {
    propsPatch = {
      ...propsPatch,
      title: 'labelSendRedPacketTitlePublic',
      describe1: props.t('labelRedPacketSendSuccess', {
        symbol: props.symbol,
        value: props.value,
      }),
      btnInfo: props?.info?.shared
        ? {
            btnTxt: 'labelShareQRCode',
            callback: props.info.shared,
          }
        : props.btnInfo,
    }
  }

  return <RedPacketBase {...{ ...props, ...propsPatch }} />
}

// value symbol
export const RedPacketSend_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelRedPacketSendFailed', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <RedPacketBase {...propsPatch} {...props} />
}

export const NFTRedPacketSend_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth'),
  }
  return <RedPacketBase {...propsPatch} {...props} />
}

export const NFTRedPacketSend_First_Method_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelFirstSignDenied'),
  }
  return <RedPacketBase {...propsPatch} {...props} />
}

export const NFTRedPacketSend_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelSignDenied'),
  }
  return <RedPacketBase {...propsPatch} {...props} />
}

export const NFTRedPacketSend_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelRedPacketSendInProgress'),
  }
  return <RedPacketBase {...propsPatch} {...props} />
}

export const NFTRedPacketSend_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelRedPacketSendSuccess', {
      symbol: sanitize(props.symbol ?? 'NFT').toString(),
      value: props.value,
    }),
  }
  return <RedPacketBase {...propsPatch} {...props} />
}

export const NFTRedPacketSend_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelRedPacketSendFailed', {
      symbol: sanitize(props.symbol ?? 'NFT').toString(),
      value: props.value,
    }),
  }
  return <RedPacketBase {...propsPatch} {...props} />
}

export const RedPacketOpen_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    btnInfo: undefined,
    title: '',
  }

  return <RedPacketOpenBase {...propsPatch} {...props} />
}

export const RedPacketOpen_Failed = (props: PanelProps) => {
  const propsPatch = {
    title: '',
    iconType: IconType.FailedIcon,
    describe1: props.t('labelRedPacketOpenFailed'),
  }
  return <RedPacketOpenBase {...propsPatch} {...props} />
}

export const RedPacketOpen_Claim_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    btnInfo: undefined,
    title: '',
  }
  return <RedPacketOpenBase {...propsPatch} {...props} />
}

export const RedPacketSend_Claim_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelRedPacketClaimSuccess'),
  }
  return <RedPacketOpenBase {...propsPatch} {...props} />
}

export const RedPacketOpen_Claim_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelRedPacketOpenFailed'),
  }
  return <RedPacketOpenBase {...propsPatch} {...props} />
}
