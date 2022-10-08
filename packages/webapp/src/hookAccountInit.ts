import React from "react";
import { AccountStatus, SagaStatus } from "@loopring-web/common-resources";
import {
  useWalletLayer1,
  useWalletLayer2,
  useAccount,
  useUserRewards,
  useConnect,
  useWalletLayer2NFT,
  useWalletL2NFTCollection,
  useWalletL2Collection,
} from "@loopring-web/core";

export function useAccountInit({ state }: { state: keyof typeof SagaStatus }) {
  useConnect({ state });
  const {
    updateWalletLayer1,
    status: walletLayer1Status,
    statusUnset: wallet1statusUnset,
  } = useWalletLayer1();
  const {
    updateWalletLayer2NFT,
    status: wallet2statusNFTStatus,
    statusUnset: wallet2statusNFTUnset,
  } = useWalletLayer2NFT();
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
  const {
    updateWalletL2Collection,
    status: walletL2CollectionStatus,
    statusUnset: walletL2CollectionstatusUnset,
  } = useWalletL2Collection();

  const {
    updateWalletL2NFTCollection,
    status: walletL2NFTCollectionStatus,
    statusUnset: walletL2NFTCollectionstatusUnset,
  } = useWalletL2NFTCollection();
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
            updateWalletLayer2NFT({ page: 1, collection: undefined });
            updateWalletL2NFTCollection({ page: 1 });
            updateWalletL2Collection({ page: 1 });
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
        break;
      default:
        break;
    }
  }, [walletLayer2Status]);
  React.useEffect(() => {
    switch (walletL2CollectionStatus) {
      case SagaStatus.ERROR:
        walletL2CollectionstatusUnset();
        break;
      case SagaStatus.DONE:
        walletL2CollectionstatusUnset();
        break;
      default:
        break;
    }
  }, [walletL2CollectionStatus]);
  React.useEffect(() => {
    switch (walletL2NFTCollectionStatus) {
      case SagaStatus.ERROR:
        walletL2NFTCollectionstatusUnset();
        break;
      case SagaStatus.DONE:
        walletL2NFTCollectionstatusUnset();
        break;
      default:
        break;
    }
  }, [walletL2NFTCollectionStatus]);
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
        console.log("Network ERROR::", "ammpoolAPI getAmmPoolUserRewards");
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
