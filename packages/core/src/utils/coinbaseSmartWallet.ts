import { ChainId } from "@loopring-web/loopring-sdk"
import type { UserOperation } from 'permissionless';
import {  createPublicClient } from 'viem';
import { CHAIN_ID_TO_VIEW_CHAIN } from "@loopring-web/common-resources";
import { http } from 'viem';
import { isWalletACoinbaseSmartWallet } from '@coinbase/onchainkit/wallet';

export const isCoinbaseSmartWallet = async (accAddress: string | undefined, chainId: ChainId) => {   
  if (!accAddress) return false;
  const res = await isWalletACoinbaseSmartWallet({ client:createPublicClient({
    chain: CHAIN_ID_TO_VIEW_CHAIN.get(chainId),
    transport: http(),
  }), userOp: { sender: accAddress } as UserOperation<'v0.6'> })
  return res.isCoinbaseSmartWallet
}
