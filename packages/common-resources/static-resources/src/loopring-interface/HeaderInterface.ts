export enum HeaderMenuTabStatus {
  hidden = 'hidden',
  disabled = 'disabled',
  default = 'default',
}

export interface HeaderMenuItemInterface {
  label: {
    icon?: any
    id: string
    style?: any
    description?: string
    i18nKey: string
  }
  handleListKeyDown?: (props?: any) => void
  child?: Array<HeaderMenuItemInterface> | { [key: string]: Array<HeaderMenuItemInterface> }
  router?: { path: string; [key: string]: any; pathName?: string }
  status?: keyof typeof HeaderMenuTabStatus
  extender?: JSX.Element | undefined
}
