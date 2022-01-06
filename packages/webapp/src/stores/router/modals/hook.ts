import { useDispatch, useSelector } from "react-redux";
import {
  resetActiveAccountData,
  resetDepositData,
  resetNFTDepositData,
  resetNFTTransferData,
  resetNFTWithdrawData,
  resetTransferData,
  resetWithdrawData,
  updateActiveAccountData,
  updateDepositData,
  updateNFTDepositData,
  updateNFTTransferData,
  updateNFTWithdrawData,
  updateTransferData,
  updateWithdrawData,
} from "./reducer";
import {
  ActiveAccountData,
  DepositData,
  LAST_STEP,
  ModalDataStatus,
  TransferData,
  WithdrawData,
} from "./interface";
import React from "react";
import { NFTWholeINFO, RequireOne } from "@loopring-web/common-resources";
import { RootState } from "stores";
import { NFTTokenInfo } from "@loopring-web/loopring-sdk";

export function useModalData(): {
  lastStep: LAST_STEP;
  activeAccountValue: ActiveAccountData;
  updateActiveAccountData: (
    activeAccountData: RequireOne<ActiveAccountData, never>
  ) => void;
  resetActiveAccountData: () => void;
  nftDepositValue: DepositData & Partial<NFTWholeINFO>;
  updateWithdrawData: (withdrawData: RequireOne<WithdrawData, never>) => void;
  updateNFTTransferData: (
    nftTransferData: RequireOne<TransferData & NFTWholeINFO, never>
  ) => void;
  resetTransferData: () => void;
  nftWithdrawValue: WithdrawData & Partial<NFTWholeINFO>;
  transferValue: TransferData;
  updateNFTDepositData: (
    nftDepositData: RequireOne<DepositData & NFTWholeINFO, never>
  ) => void;
  nftTransferValue: TransferData & Partial<NFTWholeINFO>;
  depositValue: DepositData;
  updateDepositData: (depositData: RequireOne<DepositData, never>) => void;
  resetNFTTransferData: () => void;
  updateTransferData: (transferData: RequireOne<TransferData, never>) => void;
  resetWithdrawData: () => void;
  withdrawValue: WithdrawData;
  resetNFTDepositData: () => void;
  resetDepositData: () => void;
  updateNFTWithdrawData: (
    nftWithdrawData: RequireOne<WithdrawData & NFTWholeINFO, never>
  ) => void;
  resetNFTWithdrawData: () => void;
} {
  const modalDataStatus: ModalDataStatus = useSelector(
    (state: RootState) => state._router_modalData
  );
  const dispatch = useDispatch();

  return {
    ...modalDataStatus,
    updateActiveAccountData: React.useCallback(
      (withdrawData: RequireOne<ActiveAccountData, never>) => {
        dispatch(updateActiveAccountData(withdrawData));
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
            NFTTokenInfo & { image: string; name: string; description: string },
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
            NFTTokenInfo & { image: string; name: string; description: string },
          never
        >
      ) => {
        dispatch(updateNFTTransferData(nftTransferData));
      },
      [dispatch]
    ),
    updateNFTDepositData: React.useCallback(
      (
        nftDepositData: RequireOne<
          DepositData &
            NFTTokenInfo & { image: string; name: string; description: string },
          never
        >
      ) => {
        dispatch(updateNFTDepositData(nftDepositData));
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
  };
}
