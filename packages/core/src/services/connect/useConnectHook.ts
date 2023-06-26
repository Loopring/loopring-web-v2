import React from "react";
import { provider } from "web3-core";
import { ChainId } from "@loopring-web/loopring-sdk";
import {
  Commands,
  ErrorType,
  ProcessingType,
  walletServices,
} from "@loopring-web/web3-provider";

export function useConnectHook({
  // handleChainChanged,
  handleConnect,
  handleAccountDisconnect,
  handleError,
  handleProcessing,
}: {
  handleProcessing?: (props: { type: ProcessingType; opts: any }) => void;
  handleError?: (props: {
    type: keyof typeof ErrorType;
    errorObj: any;
  }) => void;
  // handleChainChanged?: (chainId: string) => void,
  handleConnect?: (prosp: {
    accounts: string;
    provider: provider;
    chainId: ChainId | "unknown";
  }) => void;
  handleAccountDisconnect?: (props: { reason?: string; code?: number }) => void;
}) {
  const subject = React.useMemo(() => walletServices.onSocket(), []);
  React.useEffect(() => {
    const subscription = subject.subscribe(
      ({ data, status }: { status: keyof typeof Commands; data?: any }) => {
        switch (status) {
          case "Error":
            if (handleError) {
              handleError(data);
            }
            break;
          case "Processing":
            if (handleProcessing) {
              handleProcessing(data);
            }
            break;
          // case 'ChangeNetwork':
          //     // {chainId} = data ? data : {chainId: undefined};
          //     handleChainChanged ? handleChainChanged(data.chainId) : undefined;
          //     break
          case "ConnectWallet": // provider, accounts, chainId, networkId
            const { accounts, provider, chainId } = data
              ? data
              : {
                  accounts: undefined,
                  provider: undefined,
                  chainId: 1,
                };
            if (handleConnect) {
              handleConnect({ accounts, provider, chainId });
            }
            break;
          case "DisConnect":
            if (handleAccountDisconnect) {
              handleAccountDisconnect(data);
            }
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [subject]);
}
