import React, { useCallback, useState } from "react";
import { useAccount } from "stores/account/hook";
import {
  RawDataTransactionItem,
  TransactionStatus,
  TransactionTradeTypes,
} from "@loopring-web/component-lib";
import { volumeToCount, volumeToCountAsBigNumber } from "hooks/help";
import { LoopringAPI } from "api_wrapper";
import { myLog } from "@loopring-web/common-resources";

export function useGetTxs() {
  myLog("..........----------------useGetTxs");

  const {
    account: { accountId, apiKey },
  } = useAccount();

  const [txs, setTxs] = useState<RawDataTransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getTxnStatus = (status: string) =>
    status === ""
      ? TransactionStatus.processing
      : status === "processed"
      ? TransactionStatus.processed
      : status === "processing"
      ? TransactionStatus.processing
      : status === "received"
      ? TransactionStatus.received
      : TransactionStatus.failed;

  const getUserTxnList = useCallback(async () => {
    if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
      const userTxnList = await Promise.all([
        LoopringAPI.userAPI.getUserTransferList(
          {
            accountId,
          },
          apiKey
        ),
        LoopringAPI.userAPI.getUserDepositHistory(
          {
            accountId,
          },
          apiKey
        ),
        LoopringAPI.userAPI.getUserOnchainWithdrawalHistory(
          {
            accountId,
          },
          apiKey
        ),
      ]);
      const userTransferMapped = userTxnList[0].userTransfers?.map((o) => ({
        side: TransactionTradeTypes.transfer,
        // token: o.symbol,
        // from: o.senderAddress,
        // to: o.receiverAddress,
        amount: {
          unit: o.symbol || "",
          value: Number(volumeToCount(o.symbol, o.amount)),
        },
        fee: {
          unit: o.feeTokenSymbol || "",
          value: Number(
            volumeToCountAsBigNumber(o.feeTokenSymbol, o.feeAmount || 0)
          ),
        },
        memo: o.memo || "",
        time: o.timestamp,
        txnHash: o.hash,
        status: getTxnStatus(o.status),
        // tradeType: TransactionTradeTypes.transfer
      }));

      myLog("userTransferMapped:", userTransferMapped);

      const userDepositMapped = userTxnList[1].userDepositHistory?.map((o) => ({
        side: TransactionTradeTypes.deposit,
        symbol: o.symbol,
        amount: {
          unit: o.symbol || "",
          value: Number(volumeToCount(o.symbol, o.amount)),
        },
        fee: {
          unit: "",
          value: 0,
        },
        memo: "",
        time: o.timestamp,
        txnHash: o.txHash,
        status: getTxnStatus(o.status),
        // tradeType: TransactionTradeTypes.deposit
      }));

      myLog("userDepositMapped:", userDepositMapped);

      const userWithdrawMapped =
        userTxnList[2].userOnchainWithdrawalHistory?.map(
          (o) =>
            ({
              ...o,
              side: TransactionTradeTypes.withdraw,
              // token: o.symbol,
              // from: 'My Loopring',
              // to: o.distributeHash,
              amount: {
                unit: o.symbol || "",
                value: Number(volumeToCount(o.symbol, o.amount)),
              },
              fee: {
                unit: o.feeTokenSymbol || "",
                value: Number(
                  volumeToCount(o.feeTokenSymbol, o.feeAmount || 0)?.toFixed(6)
                ),
              },
              memo: "",
              time: o.timestamp,
              txnHash: o.txHash,
              status: getTxnStatus(o.status),
              // tradeType: TransactionTradeTypes.withdraw
            } as RawDataTransactionItem)
        );
      const mappingList = [
        ...(userTransferMapped ?? []),
        ...(userDepositMapped ?? []),
        ...(userWithdrawMapped ?? []),
      ] as RawDataTransactionItem[];
      // @ts-ignore
      const sortedMappingList = mappingList.sort((a, b) => b.time - a.time);
      setTxs(sortedMappingList as RawDataTransactionItem[]);
      setIsLoading(false);
    }
  }, [accountId, apiKey]);

  React.useEffect(() => {
    getUserTxnList();
  }, []);

  return {
    txs,
    isLoading,
  };
}
