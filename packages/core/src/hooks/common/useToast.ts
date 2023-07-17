import React from 'react'
import { TOASTOPEN, ToastType, TOSTOBJECT } from '@loopring-web/component-lib'

export const useToast = (): TOSTOBJECT => {
  const [toastOpen, setToastOpen] = React.useState<TOASTOPEN>({
    open: false,
    content: '',
    type: ToastType.info,
  })

  const closeToast = React.useCallback(() => {
    setToastOpen({
      open: false,
      content: '',
      type: ToastType.info,
    })
  }, [setToastOpen])

  return {
    toastOpen,
    setToastOpen,
    closeToast,
  }
}
