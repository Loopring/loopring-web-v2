import { WithTranslation, withTranslation } from 'react-i18next'
import {
  Approve_Failed,
  Approve_Success,
  Approve_User_Denied,
  Approve_WaitForAuth,
  GuardianStep,
  LockAccount_Failed,
  LockAccount_Success,
  LockAccount_User_Denied,
  LockAccount_WaitForAuth,
  ModalWallet,
  Reject_Failed,
  Reject_Success,
  Reject_User_Denied,
  Reject_WaitForAuth,
} from '@loopring-web/component-lib'
import React from 'react'
import { useSystem } from '@loopring-web/core'

export const ModalLock = withTranslation('common')(
  ({
    onClose,
    onBack,
    open,
    step,
    t,
    options,
    handleOpenModal,
    setOpenHebao,
    ...rest
  }: {
    open: boolean
    step: GuardianStep
    handleOpenModal: (props: { step: GuardianStep; options?: any }) => void
    onBack?: () => void
    options: any
    setOpenHebao: (state: any) => void
    onClose: {
      bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void
    }['bivarianceHack']
  } & WithTranslation) => {
    const { etherscanBaseUrl } = useSystem()
    const backToLockAccountBtnInfo = React.useMemo(() => {
      return {
        btnTxt: 'labelRetry',
        callback: () => {
          setOpenHebao(({ options }) => {
            if (options && options.lockRetry && options.lockRetryParams) {
              options.lockRetry(options.lockRetryParams)
            }
            return { step: GuardianStep.LockAccount_WaitForAuth }
          })
        },
      }
    }, [])
    const backToRejectBtnInfo = React.useMemo(() => {
      return {
        btnTxt: 'labelRetry',
        callback: () => {
          setOpenHebao(({ options }) => {
            if (options && options.lockRetry && options.lockRetryParams) {
              options.lockRetry(options.lockRetryParams)
            }
            return { step: GuardianStep.Reject_WaitForAuth }
          })
        },
      }
    }, [])
    const backToApproveBtnInfo = React.useMemo(() => {
      return {
        btnTxt: 'labelRetry',
        callback: () => {
          setOpenHebao(({ options }) => {
            if (options && options.lockRetry && options.lockRetryParams) {
              options.lockRetry(options.lockRetryParams)
            }
            return { step: GuardianStep.Approve_WaitForAuth }
          })
        },
      }
    }, [])

    const closeBtnInfo = React.useMemo(() => {
      return {
        btnTxt: 'labelClose',
        callback: (e: any) => {
          if (onClose) {
            onClose(e, 'escapeKeyDown')
          }
        },
      }
    }, [onClose])

    const accountList = React.useMemo(() => {
      return Object.values({
        [GuardianStep.LockAccount_WaitForAuth]: {
          view: (
            <LockAccount_WaitForAuth
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [GuardianStep.LockAccount_User_Denied]: {
          view: (
            <LockAccount_User_Denied
              btnInfo={backToLockAccountBtnInfo as any}
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [GuardianStep.LockAccount_Success]: {
          view: (
            <LockAccount_Success
              btnInfo={closeBtnInfo}
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [GuardianStep.LockAccount_Failed]: {
          view: (
            <LockAccount_Failed
              btnInfo={closeBtnInfo}
              {...{
                ...rest,
                ...options,
                t,
              }}
            />
          ),
        },
        [GuardianStep.Approve_WaitForAuth]: {
          view: (
            <Approve_WaitForAuth
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [GuardianStep.Approve_User_Denied]: {
          view: (
            <Approve_User_Denied
              btnInfo={backToApproveBtnInfo as any}
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [GuardianStep.Approve_Success]: {
          view: (
            <Approve_Success
              btnInfo={closeBtnInfo}
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [GuardianStep.Approve_Failed]: {
          view: (
            <Approve_Failed
              btnInfo={closeBtnInfo}
              {...{
                ...rest,
                ...options,
                t,
              }}
            />
          ),
        },

        [GuardianStep.Reject_WaitForAuth]: {
          view: (
            <Reject_WaitForAuth
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [GuardianStep.Reject_User_Denied]: {
          view: (
            <Reject_User_Denied
              btnInfo={backToRejectBtnInfo as any}
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [GuardianStep.Reject_Success]: {
          view: (
            <Reject_Success
              btnInfo={closeBtnInfo}
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [GuardianStep.Reject_Failed]: {
          view: (
            <Reject_Failed
              btnInfo={closeBtnInfo}
              {...{
                ...rest,
                ...options,
                t,
              }}
            />
          ),
        },
      })
    }, [])

    return (
      <>
        <ModalWallet
          open={open}
          onClose={onClose}
          panelList={accountList}
          onBack={onBack}
          step={step ?? GuardianStep.LockAccount_WaitForAuth}
          etherscanBaseUrl={etherscanBaseUrl}
        />
      </>
    )
  },
)
