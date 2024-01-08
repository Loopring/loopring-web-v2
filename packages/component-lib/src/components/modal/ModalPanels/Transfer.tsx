import { IconType, PanelProps, TransferBase } from './BasicPanel'
import { sanitize } from 'dompurify'
import { useSettings } from '../../../stores'
import { L1L2_NAME_DEFINED, MapChainId } from '@loopring-web/common-resources'

// value symbol
export const Transfer_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth'),
  }
  return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_First_Method_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelFirstSignDenied'),
  }
  return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelSignDenied'),
  }
  return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelL2toL2InProgress'),
  }
  return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelL2toL2Success', {
      symbol: props.symbol,
      value: props.value,
    }),
  }
  return <TransferBase {...propsPatch} {...props} />
}

export const Transfer_banxa_confirm = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t('labelBanxaConfirmSubmit', { order: props.info.id }),
  }
  return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_Failed = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelL2toL2Failed', {
      symbol: props.symbol,
      value: props.value,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }),
  }
  return <TransferBase {...propsPatch} {...props} />
}

export const NFTTransfer_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth'),
  }
  return <TransferBase {...propsPatch} {...props} />
}

export const NFTTransfer_First_Method_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelFirstSignDenied'),
  }
  return <TransferBase {...propsPatch} {...props} />
}

export const NFTTransfer_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelSignDenied'),
  }
  return <TransferBase {...propsPatch} {...props} />
}

export const NFTTransfer_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelL2toL2InProgress'),
  }
  return <TransferBase {...propsPatch} {...props} />
}

export const NFTTransfer_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelL2toL2Success', {
      symbol: sanitize(props.symbol ?? 'NFT').toString(),
      value: props.value,
    }),
  }
  return <TransferBase {...propsPatch} {...props} />
}

export const NFTTransfer_Failed = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelL2toL2Failed', {
      symbol: sanitize(props.symbol ?? 'NFT').toString(),
      value: props.value,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }),
  }
  return <TransferBase {...propsPatch} {...props} />
}



export const NFTBurn_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth'),
    title: 'labelL2NFTBurnTitle',
  }
  return <TransferBase {...propsPatch} {...props} />
}

export const NFTBurn_First_Method_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelFirstSignDenied'),
    title: 'labelL2NFTBurnTitle',
  }
  return <TransferBase {...propsPatch} {...props} />
}

export const NFTBurn_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelSignDenied'),
    title: 'labelL2NFTBurnTitle',
  }
  return <TransferBase {...propsPatch} {...props} />
}

export const NFTBurn_In_Progress = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelL2toL2InProgress'),
    title: 'labelL2NFTBurnTitle',
  }
  return <TransferBase {...propsPatch} {...props} />
}

export const NFTBurn_Success = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t('labelL2NFTBurSuccess', {
      symbol: sanitize(props.symbol ?? 'NFT').toString(),
      value: props.value,
    }),
    title: 'labelL2NFTBurnTitle',
  }
  return <TransferBase {...propsPatch} {...props} />
}

export const NFTBurn_Failed = (props: PanelProps) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelL2toL2Failed', {
      symbol: sanitize(props.symbol ?? 'NFT').toString(),
      value: props.value,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }),
    title: 'labelL2NFTBurnTitle',
  }
  return <TransferBase {...propsPatch} {...props} />
}

