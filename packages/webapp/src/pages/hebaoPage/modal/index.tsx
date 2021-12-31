import { WithTranslation, withTranslation } from "react-i18next";
import {
  HebaoStep,
  ModalHebao,
  LockAccount_Failed,
  LockAccount_Success,
  LockAccount_User_Denied,
  LockAccount_WaitForAuth,
  Approve_WaitForAuth,
  Approve_User_Denied,
  Approve_Success,
  Approve_Failed,
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
    const backToLockCallback = () => {
      handleOpenModal({ step: HebaoStep.LockAccount_WaitForAuth });
      if (options && options.lockRetry && options.lockRetryParams) {
        options.lockRetry(options.lockRetryParams);
      }
    };
    const backToLockAccountBtnInfo = React.useMemo(() => {
      return {
        btnTxt: "labelRetry",
        callback: backToLockCallback,
      };
    }, [options, backToLockCallback]);
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
              btnInfo={backToLockAccountBtnInfo}
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
