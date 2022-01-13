import React from "react";
import { AccountStatus, SagaStatus } from "@loopring-web/common-resources";
import { useWalletLayer1 } from "./stores/walletLayer1";
import { useWalletLayer2 } from "./stores/walletLayer2";
import { useAccount } from "./stores/account";
import { useUserRewards } from "./stores/userRewards";
import { useConnect } from "./hookConnect";

export function useAccountInit({ state }: { state: keyof typeof SagaStatus }) {
  useConnect({ state });
  const {
    updateWalletLayer1,
    resetLayer1,
    status: walletLayer1Status,
    statusUnset: wallet1statusUnset,
  } = useWalletLayer1();
  const { getUserRewards, status: userRewardsStatus } = useUserRewards();
  const {
    updateWalletLayer2,
    resetLayer2,
    status: walletLayer2Status,
    statusUnset: wallet2statusUnset,
  } = useWalletLayer2();
  const { account, status: accountStatus } = useAccount();

  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET && state === SagaStatus.DONE) {
      switch (account.readyState) {
        case AccountStatus.UN_CONNECT:
        case AccountStatus.ERROR_NETWORK:
          break;
        case AccountStatus.DEPOSITING:
        case AccountStatus.NOT_ACTIVE:
          if (walletLayer1Status !== SagaStatus.PENDING) {
            updateWalletLayer1();
          }
          if (walletLayer2Status !== SagaStatus.PENDING) {
            updateWalletLayer2();
          }
          break;
        case AccountStatus.NO_ACCOUNT:
        case AccountStatus.LOCKED:
          if (walletLayer1Status !== SagaStatus.PENDING) {
            updateWalletLayer1();
          }
          break;
        case AccountStatus.ACTIVATED:
          getUserRewards();
          // }
          if (walletLayer1Status !== SagaStatus.PENDING) {
            updateWalletLayer1();
          }
          if (walletLayer2Status !== SagaStatus.PENDING) {
            updateWalletLayer2();
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
  React.useEffect(() => {
    switch (walletLayer2Status) {
      case SagaStatus.ERROR:
        wallet2statusUnset();
        break;
      case SagaStatus.DONE:
        wallet2statusUnset();
        //setWalletMap1(walletLayer1State.walletLayer1);
        break;
      default:
        break;
    }
  }, [walletLayer2Status]);
}
