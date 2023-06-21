export type PanelContent<T extends string> = {
  key: T
  element: JSX.Element
  toolBarItem: JSX.Element | undefined
}
export type SwitchPanelProps<T extends string> = {
  // swipedBy: T,
  index: number
  // defaultIndex: number,
  panelList: Array<PanelContent<T>>
  size?: string
  className?: string
  // onChangeIndex?: (index: number,data:any) => void,
  // onTransitionEnd?: () => void,
  _height?: number | string
  _width?: number | string
  scrollDisabled?: boolean
}
