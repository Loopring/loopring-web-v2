import * as sdk from "@loopring-web/loopring-sdk";
import { RawDataRedPacketDetailItem } from "@loopring-web/component-lib";
import {
  getShortAddr,
  getValuePrecisionThousand,
} from "@loopring-web/common-resources";
import { volumeToCountAsBigNumber } from "./volumeToCount";
import { store } from "../../stores";
import { TokenInfo } from "@loopring-web/loopring-sdk";

export const getUserReceiveList = (
  claimList: sdk.LuckTokenClaim[],
  tokenInfo: TokenInfo
): RawDataRedPacketDetailItem[] => {
  // const {idIndex,tokenMap} = store.getState().tokenMap
  const { accountId } = store.getState().account;
  let _max = 0,
    _index = 0;
  const list = claimList.reduce((prev, item, index) => {
    const amountStr =
      getValuePrecisionThousand(
        volumeToCountAsBigNumber(tokenInfo.symbol, item.amount),
        tokenInfo.precision,
        tokenInfo.precision,
        undefined,
        false,
        {
          floor: false,
          // isTrade: true,
        }
      ) +
      " " +
      tokenInfo.symbol;
    if (sdk.toBig(item.amount).gte(_max)) {
      _max = item.amount;
      _index = index;
    }
    const redPacketDetailItem = {
      accountStr: item.claimer?.ens
        ? item.claimer.ens
        : getShortAddr(item.claimer?.address ?? ""),
      isSelf: accountId === item.claimer.accountId,
      amountStr,
      createdAt: item.createdAt,
      rawData: item,
    };
    return [...prev, redPacketDetailItem];
  }, [] as RawDataRedPacketDetailItem[]);
  list[_index].isMax = true;
  return list;
};
