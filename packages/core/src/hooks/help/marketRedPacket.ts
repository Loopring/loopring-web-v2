import * as sdk from "@loopring-web/loopring-sdk";
import { RawDataRedPacketDetailItem } from "@loopring-web/component-lib";
import {
  getShortAddr,
  getValuePrecisionThousand,
} from "@loopring-web/common-resources";
import { volumeToCountAsBigNumber } from "./volumeToCount";
import { store } from "../../stores";

export const getUserReceiveList = (
  claimList: sdk.LuckTokenClaim[],
  tokenInfo: sdk.TokenInfo,
  champion?: {
    accountId: number;
    address: string;
    ens: string;
    amount: string | number;
  }
): { list: RawDataRedPacketDetailItem[] } => {
  const { accountId } = store.getState().account;
  const list: RawDataRedPacketDetailItem[] = claimList.reduce((prev, item) => {
    const amountStr =
      getValuePrecisionThousand(
        volumeToCountAsBigNumber(tokenInfo.symbol, item.amount),
        tokenInfo.precision,
        tokenInfo.precision,
        undefined,
        false,
        {
          floor: false,
        }
      ) +
      " " +
      tokenInfo.symbol;

    const redPacketDetailItem: RawDataRedPacketDetailItem = {
      accountStr: item.claimer?.ens
        ? item.claimer.ens
        : getShortAddr(item.claimer?.address ?? ""),
      isSelf: accountId === item.claimer.accountId,
      amountStr,
      helper: (item.helper?.address
        ? item.helper?.ens
          ? item.helper.ens
          : getShortAddr(item.helper.address.toString())
        : ""
      ).toString(),
      createdAt: item.createdAt,
      isMax: champion?.accountId === item.claimer.accountId && champion.amount === item.amount,
      rawData: item,
    };
    return [...prev, redPacketDetailItem];
  }, [] as RawDataRedPacketDetailItem[]);

  return { list };
};
export const getUserNFTReceiveList = (
  claimList: sdk.LuckTokenClaim[],
  _nftInfo: sdk.UserNFTBalanceInfo,
  champion?: {
    accountId: number;
    address: string;
    ens: string;
    amount: string | number;
  }
): { list: RawDataRedPacketDetailItem[] } => {
  // const {idIndex,tokenMap} = store.getState().tokenMap
  const { accountId } = store.getState().account;
  // let _max = 0,
  //   _index = -1;
  const list: RawDataRedPacketDetailItem[] = claimList.reduce((prev, item) => {
    // _nftInfo?.metadata?.base?.name ?? "NFT";
    const amountStr =
      getValuePrecisionThousand(item.amount, 0, 0, undefined, false, {
        floor: false,
        // isTrade: true,
      }) +
      " " +
      "NFT";
    // if (sdk.toBig(item.amount).gte(_max)) {
    //   _max = item.amount;
    //   _index = index;
    // }
    const redPacketDetailItem: RawDataRedPacketDetailItem = {
      accountStr: item.claimer?.ens
        ? item.claimer.ens
        : getShortAddr(item.claimer?.address ?? ""),
      isSelf: accountId === item.claimer.accountId,
      amountStr,
      helper: (item.referrer?.address
        ? item.referrer?.ens
          ? item.referrer.ens
          : getShortAddr(item.referrer.address.toString())
        : ""
      ).toString(),
      createdAt: item.createdAt,
      isMax: champion?.amount == item.amount,
      rawData: item,
    };
    return [...prev, redPacketDetailItem];
  }, [] as RawDataRedPacketDetailItem[]);

  return { list };
};
export const amountStrCallback = (
  tokenMap: any,
  idIndex: any,
  tokenId: any,
  tokenAmount: string
) => {
  const tokenInfo = tokenMap[idIndex[tokenId] ?? ""];

  if (tokenInfo && tokenAmount) {
    const symbol = tokenInfo.symbol;
    const amount = getValuePrecisionThousand(
      volumeToCountAsBigNumber(symbol, tokenAmount),
      tokenInfo.precision,
      tokenInfo.precision,
      undefined,
      false,
      {
        floor: false,
        // isTrade: true,
      }
    );
    return {
      amountStr: amount + " " + symbol,
      amount,
    };
  }
  return {};

  // tokenMap[]
};
export const amountStrNFTCallback = (
  nftInfo: sdk.UserNFTBalanceInfo,
  tokenAmount: string
) => {
  if (nftInfo && tokenAmount) {
    const symbol = "NFT(s)"; // nftInfo?.metadata?.base?.name ?? "NFT";
    const amount = getValuePrecisionThousand(
      tokenAmount,
      0,
      0,
      undefined,
      false,
      {
        floor: false,
        // isTrade: true,
      }
    );
    return {
      amountStr: amount + " " + symbol,
      amount,
    };
  }
  return {};
  // tokenMap[]
};

export const makeViewCard = (luckToken: sdk.LuckyTokenItemForReceive) => {
  const {
    account,
    localStore: { redPacketHistory },
    tokenMap: { idIndex, tokenMap },
    system: { chainId },
  } = store.getState();
  let claim: string | undefined = undefined;
  if (
    redPacketHistory[chainId] &&
    redPacketHistory[chainId][account.accAddress] &&
    redPacketHistory[chainId][account.accAddress][luckToken.hash]
  ) {
    claim = redPacketHistory[chainId][account.accAddress][luckToken.hash].claim;
  }
  const tokenInfo = tokenMap[idIndex[luckToken.tokenId] ?? ""];

  return {
    chainId,
    account,
    amountStr: luckToken.isNft
      ? amountStrNFTCallback(
          luckToken.nftTokenInfo as any,
          luckToken.tokenAmount.totalAmount
        ).amount
      : amountStrCallback(
          tokenMap,
          idIndex,
          luckToken.tokenId,
          luckToken.tokenAmount.totalAmount
        ).amountStr,
    myAmountStr:
      claim &&
      (luckToken.isNft
        ? amountStrNFTCallback(luckToken.nftTokenInfo as any, claim).amountStr
        : amountStrCallback(tokenMap, idIndex, luckToken.tokenId, claim)
            .amountStr),
    tokenInfo,
    claim,
  };
};
