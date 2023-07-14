import { ExportAccountBase, IconType, PanelProps } from './BasicPanel'

// symbol
export const ExportAccount_Approve_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t('labelWaitForAuth'),
  }
  return <ExportAccountBase {...props} {...propsPatch} />
}

export const ExportAccount_User_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t('labelSignDenied'),
  }
  return <ExportAccountBase {...propsPatch} {...props} />
}

// symbol
export const ExportAccount_Success = (props: PanelProps) => {
  const describe1 = props.t('labelExportAccountSuccess')
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1,
  }
  return <ExportAccountBase {...propsPatch} {...props} />
}

// value symbol
export const ExportAccount_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t('labelExportAccountFailed'),
  }
  return <ExportAccountBase {...propsPatch} {...props} />
}
