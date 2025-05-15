import { WalletMap } from "@loopring-web/common-resources";
import { OffchainFeeInfo } from "@loopring-web/loopring-sdk";
import { ethers } from "ethers";
import { TokenMap } from "stores";

export const offchainFeeInfoToFeeInfo = (offchainFeeInfo: OffchainFeeInfo, tokenMap: TokenMap<{
  [key: string]: any;
}>, walletMap: WalletMap<string, any>) => {
  return {
    belong: offchainFeeInfo.token,
    fee: tokenMap[offchainFeeInfo.token] ? ethers.utils.formatUnits(offchainFeeInfo.fee, tokenMap[offchainFeeInfo.token].decimals) : '',
    feeRaw: offchainFeeInfo.fee,
    token: offchainFeeInfo.token,
    hasToken: !!offchainFeeInfo.token,
    count: walletMap[offchainFeeInfo.token]?.count,
    discount: offchainFeeInfo.discount ? offchainFeeInfo.discount : undefined,
    __raw__: {
      fastWithDraw: '',
      tokenId: tokenMap[offchainFeeInfo.token]?.tokenId,
      feeRaw: offchainFeeInfo.fee,
    }
  }
}