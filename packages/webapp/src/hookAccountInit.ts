import React from "react";
import { AccountStatus, SagaStatus } from "@loopring-web/common-resources";
import {
  useWalletLayer1,
  useWalletLayer2,
  useAccount,
  useUserRewards,
  useConnect,
  useWalletLayer2NFT,
} from "@loopring-web/core";

export function useAccountInit({ state }: { state: keyof typeof SagaStatus }) {
  useConnect({ state });
  const {
    updateWalletLayer1,
    status: walletLayer1Status,
    statusUnset: wallet1statusUnset,
  } = useWalletLayer1();
  const { status: wallet2statusNFTStatus, statusUnset: wallet2statusNFTUnset } =
    useWalletLayer2NFT();
  const {
    getUserRewards,
    status: userRewardsStatus,
    statusUnset: userRewardsUnset,
  } = useUserRewards();
  const {
    updateWalletLayer2,
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
        case AccountStatus.LOCKED:
        case AccountStatus.NO_ACCOUNT:
          if (walletLayer1Status !== SagaStatus.PENDING) {
            updateWalletLayer1();
          }
          if (walletLayer2Status !== SagaStatus.PENDING) {
            updateWalletLayer2();
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
  React.useEffect(() => {
    switch (wallet2statusNFTStatus) {
      case SagaStatus.ERROR:
        wallet2statusNFTUnset();
        break;
      case SagaStatus.DONE:
        wallet2statusNFTUnset();
        break;
      default:
        break;
    }
  }, [wallet2statusNFTStatus]);
  React.useEffect(() => {
    switch (userRewardsStatus) {
      case SagaStatus.ERROR:
        console.log("ERROR", "get userRewards");
        userRewardsUnset();
        break;
      case SagaStatus.DONE:
        userRewardsUnset();
        break;
      default:
        break;
    }
  }, [userRewardsStatus]);
}
