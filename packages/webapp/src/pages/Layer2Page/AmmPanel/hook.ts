import React from "react";
import { AmmSideTypes, RawDataAmmItem } from "@loopring-web/component-lib";
import { LoopringAPI } from "api_wrapper";
import { AmmTxType } from "@loopring-web/loopring-sdk";
import { volumeToCount } from "hooks/help";
import { useAccount } from "stores/account";
import { useTokenMap } from "stores/token";

export function useGetAmmRecord() {
  const [ammRecordList, setAmmRecordList] = React.useState<RawDataAmmItem[]>(
    []
  );
  const [showLoading, setShowLoading] = React.useState(true);
  const {
    account: { accountId, apiKey },
  } = useAccount();
  const { tokenMap } = useTokenMap();

  const getTokenName = React.useCallback(
    (tokenId?: number) => {
      if (tokenMap) {
        const keys = Object.keys(tokenMap);
        const values = Object.values(tokenMap);
        const index = values.findIndex((o) => o.tokenId === tokenId);
        if (index > -1) {
          return keys[index];
        }
        return "";
      }
      return "";
    },
    [tokenMap]
  );

  const getAmmpoolList = React.useCallback(async () => {
    if (LoopringAPI.ammpoolAPI && accountId && apiKey) {
      const ammpool = await LoopringAPI.ammpoolAPI.getUserAmmPoolTxs(
        {
          accountId,
        },
        apiKey
      );
      if (ammpool && ammpool.userAmmPoolTxs) {
        const result = ammpool.userAmmPoolTxs.map((o) => ({
          side:
            o.txType === AmmTxType.JOIN ? AmmSideTypes.Join : AmmSideTypes.Exit,
          amount: {
            from: {
              key: getTokenName(o.poolTokens[0]?.tokenId),
              value: String(
                volumeToCount(
                  getTokenName(o.poolTokens[0]?.tokenId),
                  o.poolTokens[0]?.actualAmount
                )
              ),
            },
            to: {
              key: getTokenName(o.poolTokens[1]?.tokenId),
              value: String(
                volumeToCount(
                  getTokenName(o.poolTokens[1]?.tokenId),
                  o.poolTokens[1]?.actualAmount
                )
              ),
            },
          },
          lpTokenAmount: String(
            volumeToCount(
              getTokenName(o.lpToken?.tokenId),
              o.lpToken?.actualAmount
            )
          ),
          fee: {
            key: getTokenName(o.poolTokens[1]?.tokenId),
            value: volumeToCount(
              getTokenName(o.poolTokens[1]?.tokenId),
              o.poolTokens[1]?.feeAmount
            )?.toFixed(6),
          },
          time: o.updatedAt,
        }));
        setAmmRecordList(result);
        setShowLoading(false);
      }
    }
  }, [accountId, apiKey, getTokenName]);

  React.useEffect(() => {
    getAmmpoolList();
  }, [getAmmpoolList]);

  return {
    ammRecordList,
    showLoading,
  };
}
