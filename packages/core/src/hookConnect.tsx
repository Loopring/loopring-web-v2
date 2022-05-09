import React from "react";
import {
  setShowAccount,
  useOpenModals,
  WalletConnectStep,
} from "@loopring-web/component-lib";
import { ErrorType, ProcessingType } from "@loopring-web/web3-provider";
import { myLog, SagaStatus } from "@loopring-web/common-resources";
import { ChainId, RESULT_INFO, sleep } from "@loopring-web/loopring-sdk";

import { accountReducer, useAccount } from "./stores/account";
import { useSystem } from "./stores/system";
import { networkUpdate } from "./services/account/networkUpdate";
import { checkAccount } from "./services/account/checkAccount";
import { REFRESH_RATE } from "./defs";
import { resetLayer12Data } from "./services/account/resetAccount";
import { store } from "./index";
import { useModalData } from "./stores/router";
import { useConnectHook } from "./services/connect/useConnectHook";

export function useConnect(_props: { state: keyof typeof SagaStatus }) {
  const {
    account,
    shouldShow,
    resetAccount,
    statusUnset: statusAccountUnset,
    setShouldShow,
    status: accountStatus,
  } = useAccount();
  // const {updateWalletLayer2, resetLayer2} = useWalletLayer2()

  const { resetWithdrawData, resetTransferData, resetDepositData } =
    useModalData();

  const { updateSystem } = useSystem();
  const { setShowConnect } = useOpenModals();
  const [stateAccount, setStateAccount] =
    React.useState<keyof typeof SagaStatus>("DONE");
  React.useEffect(() => {
    if (
      stateAccount === SagaStatus.PENDING &&
      accountStatus === SagaStatus.DONE
    ) {
      setStateAccount("DONE");
      statusAccountUnset();
    }
  }, [stateAccount, accountStatus]);
  const handleConnect = React.useCallback(
    async ({
      accounts,
      chainId,
    }: {
      accounts: string;
      provider: any;
      chainId: ChainId | "unknown";
    }) => {
      const accAddress = accounts[0];
      myLog("After connect >>,network part start: step1 networkUpdate");
      const networkFlag = networkUpdate({ chainId });
      myLog("After connect >>,network part done: step2 check account");

      if (networkFlag) {
        resetLayer12Data();
        checkAccount(accAddress, chainId !== "unknown" ? chainId : undefined);
      }

      resetWithdrawData();
      resetTransferData();
      resetDepositData();

      setShouldShow(false);
      setShowConnect({
        isShow: !!shouldShow ?? false,
        step: WalletConnectStep.SuccessConnect,
      });
      await sleep(REFRESH_RATE);
      setShowConnect({ isShow: false, step: WalletConnectStep.SuccessConnect });
    },
    [
      resetWithdrawData,
      resetTransferData,
      resetDepositData,
      setShouldShow,
      setShowConnect,
      shouldShow,
    ]
  );

  const handleAccountDisconnect = React.useCallback(async () => {
    myLog("account:", account);
    resetAccount({ shouldUpdateProvider: true });
    setStateAccount(SagaStatus.PENDING);
    resetLayer12Data();

    resetWithdrawData();
    resetTransferData();
    resetDepositData();
    // await sleep(REFRESH_RATE)
  }, [
    account,
    resetAccount,
    resetDepositData,
    resetTransferData,
    resetWithdrawData,
  ]);

  const handleProcessing = React.useCallback(
    ({ opts }: { type: ProcessingType; opts: any }) => {
      const { qrCodeUrl } = opts;
      if (qrCodeUrl) {
        store.dispatch(accountReducer.updateAccountStatus({ qrCodeUrl }));
        setShowConnect({
          isShow: true,
          step: WalletConnectStep.WalletConnectQRCode,
        });
      }
    },
    [setShowConnect]
  );

  const handleError = React.useCallback(
    (props: { type: keyof typeof ErrorType; opts?: any }) => {
      const chainId =
        account._chainId === ChainId.MAINNET ||
        account._chainId === ChainId.GOERLI
          ? account._chainId
          : ChainId.MAINNET;

      myLog("---> shouldShow:", shouldShow);

      if (store.getState().system.chainId !== chainId) {
        myLog("try to updateSystem...");
        updateSystem({ chainId });
      }

      if (!!account.accAddress) {
        myLog("try to resetAccount...");
        resetAccount();
      }

      statusAccountUnset();

      setShowAccount({ isShow: false });
      setShowConnect({
        isShow: true,
        step: WalletConnectStep.FailedConnect,
        error: {
          ...props.opts.error,
          // code: UIERROR_CODE.PROVIDER_ERROR,
          // message: props.opts.error,
          // ...props.errorObj,
        } as RESULT_INFO,
      });
    },
    [
      account._chainId,
      account.accAddress,
      shouldShow,
      statusAccountUnset,
      setShowConnect,
      updateSystem,
      resetAccount,
    ]
  );

  useConnectHook({
    handleAccountDisconnect,
    handleProcessing,
    handleError,
    handleConnect,
  });
}
