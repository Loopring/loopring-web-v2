import { PopoverOrigin } from '@mui/material'
import { OneOf } from '@loopring-web/common-resources'

import * as React from 'react'
import { PopupState as InjectedProps } from 'material-ui-popup-state/core'

export enum PopoverType {
  hover = 'hover',
  click = 'click',
}

type HorizonLeft = {
  left: number
}

type HorizonRight = {
  right: number
}

// export type PopoverProps = MuiPopoverProps & {
//     arrowHorizon?: OneOf<[HorizonLeft, HorizonRight]>;
// }
export type PopoverWrapProps = {
  type: keyof typeof PopoverType
  // children: React.ReactNode;
  className: string
  popupId: string
  children?: JSX.Element | undefined | React.ReactElement
  popoverContent: React.ReactNode
  // popoverStyle?: React.CSSProperties;
  anchorOrigin?: PopoverOrigin
  transformOrigin?: PopoverOrigin
  // popoverTop?: number;
  handleStateChange?: (state: boolean) => void
  // variant: Variant
  parentPopupState?: InjectedProps | null | undefined
  disableAutoFocus?: boolean | null
  arrowHorizon?: OneOf<[HorizonLeft, HorizonRight]>
}
