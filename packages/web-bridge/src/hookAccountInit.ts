import React from "react";
import { AccountStatus, SagaStatus } from "@loopring-web/common-resources";
import { useWalletLayer1, useAccount, useConnect } from "@loopring-web/core";

export function useAccountInit({ state }: { state: keyof typeof SagaStatus }) {
  useConnect({ state });
  const {
    updateWalletLayer1,
    status: walletLayer1Status,
    statusUnset: wallet1statusUnset,
  } = useWalletLayer1();
  const { account, status: accountStatus } = useAccount();

  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET && state === SagaStatus.DONE) {
      switch (account.readyState) {
        case AccountStatus.UN_CONNECT:
        case AccountStatus.ERROR_NETWORK:
          break;
        case AccountStatus.DEPOSITING:
        case AccountStatus.NOT_ACTIVE:
        default:
          if (walletLayer1Status !== SagaStatus.PENDING) {
            updateWalletLayer1();
          }
          break;
      }
    }
  }, [accountStatus, state, account.readyState]);
  React.useEffect(() => {
    switch (walletLayer1Status) {
      case SagaStatus.ERROR:
        wallet1statusUnset();
        break;
      case SagaStatus.DONE:
        wallet1statusUnset();
        break;
      default:
        break;
    }
  }, [walletLayer1Status]);
}
