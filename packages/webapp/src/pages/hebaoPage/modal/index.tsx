import { WithTranslation, withTranslation } from "react-i18next";
import {
  HebaoStep,
  ModalHebao,
  LockAccount_Failed,
  LockAccount_Success,
  LockAccount_User_Denied,
  LockAccount_WaitForAuth,
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
    }, [options]);
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
