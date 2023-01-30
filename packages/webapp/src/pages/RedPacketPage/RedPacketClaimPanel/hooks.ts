import {
  RawDataRedPacketClaimItem,
  useOpenModals,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import {
  LoopringAPI,
  useAccount,
  useTokenMap,
  useTokenPrices,
  volumeToCountAsBigNumber,
} from "@loopring-web/core";
import React from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  ClaimToken,
  getValuePrecisionThousand,
  SDK_ERROR_MAP_TO_UI,
  TokenType,
} from "@loopring-web/common-resources";

export const useClaimRedPacket = <R extends RawDataRedPacketClaimItem>(
  setToastOpen: (props: any) => void
) => {
  const { t } = useTranslation(["error"]);

  const {
    account: { accountId, apiKey },
  } = useAccount();

  const [redPacketClaimList, setRedPacketClaimList] = React.useState<R[]>([]);
  const [redPacketClaimTotal, setRedPacketClaimTotal] = React.useState(0);
  const { idIndex, coinMap, tokenMap } = useTokenMap();
  const { tokenPrices } = useTokenPrices();
  const [showLoading, setShowLoading] = React.useState(true);
  const { modals, setShowClaimWithdraw } = useOpenModals();
  const getClaimRedPacket = React.useCallback(async () => {
    setShowLoading(true);
    if (LoopringAPI.luckTokenAPI && accountId && apiKey) {
      const response = await LoopringAPI.luckTokenAPI.getLuckTokenBalances(
        {
          accountId,
          tokens: Reflect.ownKeys(idIndex ?? {}).map((key) => Number(key)),
          // tokens: number[];
        },
        apiKey
      );
      if (
        (response as sdk.RESULT_INFO).code ||
        (response as sdk.RESULT_INFO).message
      ) {
        const errorItem =
          SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001];
        if (setToastOpen) {
          setToastOpen({
            open: true,
            type: "error",
            content:
              "error : " + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          });
        }
      } else {
        setRedPacketClaimTotal((response as any)?.totalNum);
        // @ts-ignore
        let result = (response as any)?.tokenBalance.reduce(
          (prev: R[], item: sdk.UserBalanceInfo & any) => {
            const token = tokenMap[idIndex[item.tokenId]];
            const tokenInfo = coinMap[token.symbol ?? ""];
            const amountStr = getValuePrecisionThousand(
              volumeToCountAsBigNumber(token.symbol, item.total),
              token.precision,
              token.precision,
              token.precision,
              false
            );

            const volume =
              volumeToCountAsBigNumber(token.symbol, item.total)
                ?.times(tokenPrices[token.symbol ?? ""])
                .toNumber() ?? 0;
            const _item: R = {
              token: { ...tokenInfo, type: TokenType.single } as any,
              amountStr,
              volume,
              rawData: item,
            } as R;
            prev.push(_item);
            return prev;
          },
          [] as R[]
        );

        setRedPacketClaimList(result);
      }
    }
    setShowLoading(false);
  }, [accountId, apiKey, t, idIndex]);
  const onItemClick = (item: ClaimToken) => {
    setShowClaimWithdraw({
      isShow: true,
      claimToken: {
        ...item,
      },
    });
  };

  return {
    onItemClick,
    redPacketClaimList,
    showLoading,
    redPacketClaimTotal,
    getClaimRedPacket,
  };
};
