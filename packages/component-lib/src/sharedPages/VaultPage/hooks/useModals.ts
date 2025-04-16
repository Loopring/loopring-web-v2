
import {
  ToastType,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  useOpenModals,
} from '@loopring-web/component-lib'
import {
  useVaultLayer2,
} from '@loopring-web/core'
import _ from 'lodash'
import { closePositionAndRepayIfNeeded } from '../utils'
import { CloseConfirmModalProps } from '../components/modals'

export const useModals = (): { closeConfirmModalProps: CloseConfirmModalProps } => {
  const { updateVaultLayer2 } = useVaultLayer2()
  const {
    modals: {
      isShowVaultCloseConfirm,
    },
    setShowVaultCloseConfirm,
    setShowGlobalToast,
  } = useOpenModals()
  return {
    closeConfirmModalProps: {
      open: isShowVaultCloseConfirm.isShow,
      onClose: () => {
        setShowVaultCloseConfirm({ isShow: false, symbol: undefined })
      },
      onConfirm: async () => {
        const { symbol } = isShowVaultCloseConfirm
        setShowVaultCloseConfirm({ isShow: false, symbol: undefined })
        closePositionAndRepayIfNeeded(symbol!)
          .then((response2) => {
            if (response2?.operation.status === sdk.VaultOperationStatus.VAULT_STATUS_FAILED) {
              throw new Error('failed')
            }
            setShowGlobalToast({
              isShow: true,
              info: {
                content: 'Closed position successfully',
                type: ToastType.success,
              },
            })
          })
          .catch(() => {
            setShowGlobalToast({
              isShow: true,
              info: {
                content: 'Close position failed',
                type: ToastType.error,
              },
            })
          })
          .finally(() => {
            updateVaultLayer2({})
          })
      },
    },
  }
}