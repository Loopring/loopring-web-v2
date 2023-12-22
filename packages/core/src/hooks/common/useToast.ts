import React from 'react'
import { TOASTOPEN, ToastType, TOSTOBJECT } from '@loopring-web/component-lib'

export const useToast = (): TOSTOBJECT => {
  const [toastOpen, setToastOpen] = React.useState<TOASTOPEN>({
    open: false,
    content: '',
    type: ToastType.info,
  })

  const closeToast = React.useCallback(() => {
    setToastOpen((state) => {
      return {
        ...state,
        content: '',
        open: false,
      }
    })
  }, [setToastOpen])

  return {
    toastOpen,
    setToastOpen,
    closeToast,
  }
}
