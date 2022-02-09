import React from "react";
import { walletServices } from "./walletServices";
import { Commands, ErrorType, ProcessingType } from "./command";
import { provider } from "web3-core";
import { ChainId } from "@loopring-web/loopring-sdk";

export function useConnectHook({
  // handleChainChanged,
  handleConnect,
  handleAccountDisconnect,
  handleError,
  handleProcessing,
}: {
  handleProcessing?: (props: {
    type: keyof typeof ProcessingType;
    opts: any;
  }) => void;
  handleError?: (props: { type: keyof typeof ErrorType; opts?: any }) => void;
  // handleChainChanged?: (chainId: string) => void,
  handleConnect?: (prosp: {
    accounts: string;
    provider: provider;
    chainId: ChainId | "unknown";
  }) => void;
  handleAccountDisconnect?: () => void;
}) {
  const subject = React.useMemo(() => walletServices.onSocket(), []);
  React.useEffect(() => {
    const subscription = subject.subscribe(
      ({ data, status }: { status: keyof typeof Commands; data?: any }) => {
        switch (status) {
          case "Error":
            handleError ? handleError(data) : undefined;
            break;
          case "Processing":
            handleProcessing ? handleProcessing(data) : {};
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
            !!handleConnect
              ? handleConnect({ accounts, provider, chainId })
              : undefined;
            break;
          case "DisConnect":
            !!handleAccountDisconnect ? handleAccountDisconnect() : undefined;
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [subject]);
}
