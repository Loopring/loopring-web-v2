import { useDispatch, useSelector } from "react-redux";
import {
  resetActiveAccountData,
  resetDepositData,
  resetNFTDeployData,
  resetNFTDepositData,
  resetNFTMintAdvanceData,
  resetCollectionAdvanceData,
  resetCollectionData,
  resetNFTMintData,
  resetNFTTransferData,
  resetNFTWithdrawData,
  resetTransferData,
  resetWithdrawData,
  resetForceWithdrawData,
  updateActiveAccountData,
  updateDepositData,
  updateNFTDeployData,
  updateNFTDepositData,
  updateNFTMintAdvanceData,
  updateCollectionAdvanceData,
  updateCollectionData,
  updateNFTMintData,
  updateNFTTransferData,
  updateNFTWithdrawData,
  updateTransferData,
  updateWithdrawData,
  updateForceWithdrawData,
} from "./reducer";
import {
  ActiveAccountData,
  DepositData,
  ForceWithdrawData,
  LAST_STEP,
  ModalDataStatus,
  NFT_MINT_VALUE,
  TransferData,
  WithdrawData,
} from "./interface";
import React from "react";
import {
  CollectionMeta,
  NFTWholeINFO,
  RequireOne,
  TradeNFT,
} from "@loopring-web/common-resources";
import { RootState } from "../../index";
import * as sdk from "@loopring-web/loopring-sdk";

export function useModalData(): {
  lastStep: LAST_STEP;
  updateWithdrawData: (withdrawData: RequireOne<WithdrawData, never>) => void;
  updateNFTTransferData: (
    nftTransferData: RequireOne<
      TransferData &
        sdk.NFTTokenInfo & { image: string; name: string; description: string },
      never
    >
  ) => void;
  resetTransferData: () => void;
  nftWithdrawValue: WithdrawData &
    Partial<sdk.NFTTokenInfo & sdk.UserNFTBalanceInfo & NFTWholeINFO>;
  collectionAdvanceValue: Partial<CollectionMeta>;
  resetNFTMintData: (tokenAddress?: string) => void;
  resetCollectionAdvanceData: () => void;
  resetNFTDeployData: () => void;
  nftTransferValue: TransferData &
    Partial<sdk.NFTTokenInfo & sdk.UserNFTBalanceInfo & NFTWholeINFO>;
  nftDeployValue: TradeNFT<any, any> & { broker: string };
  updateNFTMintAdvanceData: (nftMintData: TradeNFT<any, any>) => void;
  updateDepositData: (depositData: RequireOne<DepositData, never>) => void;
  resetNFTMintAdvanceData: () => void;
  updateCollectionAdvanceData: (
    collectionAdvanceDate: Partial<CollectionMeta>
  ) => void;
  updateTransferData: (transferData: RequireOne<TransferData, never>) => void;
  resetWithdrawData: () => void;
  updateForceWithdrawData: (
    forceWithdrawData: Partial<ForceWithdrawData>
  ) => void;
  resetDepositData: () => void;
  updateNFTWithdrawData: (
    nftWithdrawData: RequireOne<
      WithdrawData &
        sdk.NFTTokenInfo & { image: string; name: string; description: string },
      never
    >
  ) => void;
  resetActiveAccountData: () => void;
  updateCollectionData: (collectionDate: Partial<CollectionMeta>) => void;
  collectionValue: Partial<CollectionMeta>;
  nftDepositValue: TradeNFT<any, any>;
  updateActiveAccountData: (
    activeAccountData: RequireOne<ActiveAccountData, never>
  ) => void;
  updateNFTDeployData: (
    nftDeployData: Partial<TradeNFT<any, any> & { broker: string }>
  ) => void;
  activeAccountValue: ActiveAccountData;
  nftMintValue: NFT_MINT_VALUE<any>;
  transferValue: TransferData;
  resetForceWithdrawData: () => void;
  resetCollectionData: () => void;
  updateNFTDepositData: (nftDepositData: TradeNFT<any, any>) => void;
  depositValue: DepositData;
  resetNFTTransferData: () => void;
  nftMintAdvanceValue: TradeNFT<any, any>;
  withdrawValue: WithdrawData;
  resetNFTDepositData: () => void;
  forceWithdrawValue: ForceWithdrawData;
  resetNFTWithdrawData: () => void;
  updateNFTMintData: (nftMintData: NFT_MINT_VALUE<any>) => void;
} {
  const modalDataStatus: ModalDataStatus = useSelector(
    (state: RootState) => state._router_modalData
  );
  const dispatch = useDispatch();

  return {
    ...modalDataStatus,
    updateActiveAccountData: React.useCallback(
      (activeAccountData: RequireOne<ActiveAccountData, never>) => {
        dispatch(updateActiveAccountData(activeAccountData));
      },
      [dispatch]
    ),
    updateWithdrawData: React.useCallback(
      (withdrawData: RequireOne<WithdrawData, never>) => {
        dispatch(updateWithdrawData(withdrawData));
      },
      [dispatch]
    ),
    updateTransferData: React.useCallback(
      (transferData: RequireOne<TransferData, never>) => {
        dispatch(updateTransferData(transferData));
      },
      [dispatch]
    ),
    updateDepositData: React.useCallback(
      (depositData: RequireOne<DepositData, never>) => {
        dispatch(updateDepositData(depositData));
      },
      [dispatch]
    ),
    updateNFTWithdrawData: React.useCallback(
      (
        nftWithdrawData: RequireOne<
          WithdrawData &
            sdk.NFTTokenInfo & {
              image: string;
              name: string;
              description: string;
            },
          never
        >
      ) => {
        dispatch(updateNFTWithdrawData(nftWithdrawData));
      },
      [dispatch]
    ),
    updateNFTTransferData: React.useCallback(
      (
        nftTransferData: RequireOne<
          TransferData &
            sdk.NFTTokenInfo & {
              image: string;
              name: string;
              description: string;
            },
          never
        >
      ) => {
        dispatch(updateNFTTransferData(nftTransferData));
      },
      [dispatch]
    ),
    updateNFTDepositData: React.useCallback(
      (nftDepositData: TradeNFT<any, any>) => {
        dispatch(updateNFTDepositData(nftDepositData));
      },
      [dispatch]
    ),
    updateNFTDeployData: React.useCallback(
      (nftDeployData: Partial<TradeNFT<any, any> & { broker: string }>) => {
        dispatch(updateNFTDeployData(nftDeployData));
      },
      [dispatch]
    ),
    updateNFTMintData: React.useCallback(
      (nftMintData: NFT_MINT_VALUE<any>) => {
        dispatch(updateNFTMintData(nftMintData));
      },
      [dispatch]
    ),
    updateCollectionAdvanceData: React.useCallback(
      (collectionAdvanceDate: Partial<CollectionMeta>) => {
        dispatch(updateCollectionAdvanceData(collectionAdvanceDate));
      },
      [dispatch]
    ),
    updateCollectionData: React.useCallback(
      (collectionDate: Partial<CollectionMeta>) => {
        dispatch(updateCollectionData(collectionDate));
      },
      [dispatch]
    ),
    updateNFTMintAdvanceData: React.useCallback(
      (nftMintData: TradeNFT<any, any>) => {
        dispatch(updateNFTMintAdvanceData(nftMintData));
      },
      [dispatch]
    ),
    updateForceWithdrawData: React.useCallback(
      (forceWithdrawData: Partial<ForceWithdrawData>) => {
        dispatch(updateForceWithdrawData(forceWithdrawData));
      },
      [dispatch]
    ),
    resetForceWithdrawData: React.useCallback(() => {
      dispatch(resetForceWithdrawData(undefined));
    }, [dispatch]),
    resetWithdrawData: React.useCallback(() => {
      dispatch(resetWithdrawData(undefined));
    }, [dispatch]),
    resetTransferData: React.useCallback(() => {
      dispatch(resetTransferData(undefined));
    }, [dispatch]),
    resetDepositData: React.useCallback(() => {
      dispatch(resetDepositData(undefined));
    }, [dispatch]),
    resetNFTWithdrawData: React.useCallback(() => {
      dispatch(resetNFTWithdrawData(undefined));
    }, [dispatch]),
    resetNFTTransferData: React.useCallback(() => {
      dispatch(resetNFTTransferData(undefined));
    }, [dispatch]),
    resetNFTDepositData: React.useCallback(() => {
      dispatch(resetNFTDepositData(undefined));
    }, [dispatch]),
    resetActiveAccountData: React.useCallback(() => {
      dispatch(resetActiveAccountData(undefined));
    }, [dispatch]),
    resetNFTMintAdvanceData: React.useCallback(() => {
      dispatch(resetNFTMintAdvanceData(undefined));
    }, [dispatch]),
    resetCollectionAdvanceData: React.useCallback(() => {
      dispatch(resetCollectionAdvanceData(undefined));
    }, [dispatch]),
    resetCollectionData: React.useCallback(() => {
      dispatch(resetCollectionData(undefined));
    }, [dispatch]),
    resetNFTMintData: React.useCallback(
      (tokenAddress?: string) => {
        dispatch(resetNFTMintData(tokenAddress ? { tokenAddress } : undefined));
      },
      [dispatch]
    ),
    resetNFTDeployData: React.useCallback(() => {
      dispatch(resetNFTDeployData(undefined));
    }, [dispatch]),
  };
}
