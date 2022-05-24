import { useDispatch, useSelector } from "react-redux";
import {
  resetActiveAccountData,
  resetDepositData,
  resetNFTDeployData,
  resetNFTDepositData,
  resetNFTMintAdvanceData,
  resetNFTMintData,
  resetNFTTransferData,
  resetNFTWithdrawData,
  resetTransferData,
  resetWithdrawData,
  updateActiveAccountData,
  updateDepositData,
  updateNFTDeployData,
  updateNFTDepositData,
  updateNFTMintAdvanceData,
  updateNFTMintData,
  updateNFTTransferData,
  updateNFTWithdrawData,
  updateTransferData,
  updateWithdrawData,
} from "./reducer";
import {
  ActiveAccountData,
  DepositData,
  LAST_STEP,
  MintData,
  ModalDataStatus,
  NFT_MINT_VALUE,
  TransferData,
  WithdrawData,
} from "./interface";
import React from "react";
import {
  NFTWholeINFO,
  RequireOne,
  TradeNFT,
} from "@loopring-web/common-resources";
import { RootState } from "../../index";
import * as sdk from "@loopring-web/loopring-sdk";

export function useModalData(): {
  lastStep: LAST_STEP;
  activeAccountValue: ActiveAccountData;
  updateActiveAccountData: (
    activeAccountData: RequireOne<ActiveAccountData, never>
  ) => void;
  resetActiveAccountData: () => void;
  nftDepositValue: TradeNFT<any>;
  updateWithdrawData: (withdrawData: RequireOne<WithdrawData, never>) => void;
  updateNFTTransferData: (
    nftTransferData: RequireOne<TransferData & TradeNFT<any>, never>
  ) => void;
  resetTransferData: () => void;
  nftWithdrawValue: WithdrawData & Partial<TradeNFT<any>>;
  transferValue: TransferData;
  updateNFTDepositData: (
    nftDepositData: RequireOne<TradeNFT<any>, never>
  ) => void;
  nftTransferValue: TransferData & Partial<TradeNFT<any>>;
  depositValue: DepositData;
  updateDepositData: (depositData: RequireOne<DepositData, never>) => void;
  resetNFTTransferData: () => void;
  updateTransferData: (transferData: RequireOne<TransferData, never>) => void;
  resetWithdrawData: () => void;
  withdrawValue: WithdrawData;
  resetNFTDepositData: () => void;
  resetDepositData: () => void;
  updateNFTWithdrawData: (
    nftWithdrawData: RequireOne<WithdrawData & TradeNFT<any>, never>
  ) => void;
  resetNFTWithdrawData: () => void;
  nftMintAdvanceValue: TradeNFT<any>;
  updateNFTMintAdvanceData: (
    nftMintData: RequireOne<MintData & NFTWholeINFO, never>
  ) => void;
  resetNFTMintAdvanceData: () => void;
  nftMintValue: NFT_MINT_VALUE<any>;
  updateNFTMintData: (nftMintData: NFT_MINT_VALUE<any>) => void;
  resetNFTMintData: () => void;
  nftDeployValue: TradeNFT<any> & { broker: string };
  updateNFTDeployData: (
    nftDeployData: Partial<TradeNFT<any> & { broker: string }>
  ) => void;
  resetNFTDeployData: () => void;
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
      (nftDepositData: TradeNFT<any>) => {
        dispatch(updateNFTDepositData(nftDepositData));
      },
      [dispatch]
    ),
    updateNFTDeployData: React.useCallback(
      (nftDeployData: Partial<TradeNFT<any> & { broker: string }>) => {
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
    updateNFTMintAdvanceData: React.useCallback(
      (nftMintData: TradeNFT<any>) => {
        dispatch(updateNFTMintAdvanceData(nftMintData));
      },
      [dispatch]
    ),
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
