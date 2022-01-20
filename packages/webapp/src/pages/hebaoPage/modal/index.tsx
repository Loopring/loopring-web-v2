import { WithTranslation, withTranslation } from "react-i18next";
import {
  HebaoStep,
  ModalHebao,
  LockAccount_Failed,
  LockAccount_Success,
  LockAccount_User_Denied,
  LockAccount_WaitForAuth,
  Approve_Failed,
  Approve_Success,
  Approve_User_Denied,
  Approve_WaitForAuth,
  Reject_Failed,
  Reject_Success,
  Reject_User_Denied,
  Reject_WaitForAuth,
} from "@loopring-web/component-lib";
import React from "react";

export const ModalLock = withTranslation("common")(
  ({
    onClose,
    onBack,
    open,
    step,
    t,
    options,
    handleOpenModal,
    ...rest
  }: {
    open: boolean;
    step: HebaoStep;
    handleOpenModal: (props: { step: HebaoStep; options?: any }) => void;
    onBack?: () => void;
    options: any;
    onClose: {
      bivarianceHack(
        event: {},
        reason: "backdropClick" | "escapeKeyDown"
      ): void;
    }["bivarianceHack"];
  } & WithTranslation) => {
    const backToLockAccountBtnInfo = React.useMemo(() => {
      const _options = options;
      return {
        btnTxt: "labelRetry",
        callback: () => {
          handleOpenModal({ step: HebaoStep.LockAccount_WaitForAuth });
          if (_options && _options.lockRetry && _options.lockRetryParams) {
            _options.lockRetry(_options.lockRetryParams);
          }
        },
      };
    }, [handleOpenModal, options]);
    const backToRejectBtnInfo = React.useMemo(() => {
      const _options = options;
      return {
        btnTxt: "labelRetry",
        callback: () => {
          handleOpenModal({ step: HebaoStep.Reject_WaitForAuth });
          if (_options && _options.lockRetry && _options.lockRetryParams) {
            _options.lockRetry(_options.lockRetryParams);
          }
        },
      };
    }, [handleOpenModal, options]);
    const backToApproveBtnInfo = React.useMemo(() => {
      const _options = options;
      return {
        btnTxt: "labelRetry",
        callback: () => {
          handleOpenModal({ step: HebaoStep.Approve_WaitForAuth });
          if (_options && _options.lockRetry && _options.lockRetryParams) {
            _options.lockRetry(_options.lockRetryParams);
          }
        },
      };
    }, [handleOpenModal, options]);

    const closeBtnInfo = React.useMemo(() => {
      return {
        btnTxt: "labelClose",
        callback: (e: any) => {
          if (onClose) {
            onClose(e, "escapeKeyDown");
          }
        },
      };
    }, [onClose]);

    const accountList = React.useMemo(() => {
      return Object.values({
        [HebaoStep.LockAccount_WaitForAuth]: {
          view: (
            <LockAccount_WaitForAuth
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [HebaoStep.LockAccount_User_Denied]: {
          view: (
            <LockAccount_User_Denied
              btnInfo={backToLockAccountBtnInfo}
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [HebaoStep.LockAccount_Success]: {
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
        [HebaoStep.LockAccount_Failed]: {
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
        [HebaoStep.Approve_WaitForAuth]: {
          view: (
            <Approve_WaitForAuth
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [HebaoStep.Approve_User_Denied]: {
          view: (
            <Approve_User_Denied
              btnInfo={backToApproveBtnInfo}
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [HebaoStep.Approve_Success]: {
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
        [HebaoStep.Approve_Failed]: {
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

        [HebaoStep.Reject_WaitForAuth]: {
          view: (
            <Reject_WaitForAuth
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [HebaoStep.Reject_User_Denied]: {
          view: (
            <Reject_User_Denied
              btnInfo={backToRejectBtnInfo}
              {...{
                ...rest,
                t,
              }}
            />
          ),
        },
        [HebaoStep.Reject_Success]: {
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
        [HebaoStep.Reject_Failed]: {
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
      });
    }, []);

    return (
      <>
        <ModalHebao
          open={open}
          onClose={onClose}
          panelList={accountList}
          onBack={onBack}
          step={step ?? HebaoStep.LockAccount_WaitForAuth}
        />
      </>
    );
  }
);
