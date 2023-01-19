import { useTranslation } from "react-i18next";
import {
  LoopringAPI,
  useAccount,
  useTokenMap,
  volumeToCountAsBigNumber,
} from "@loopring-web/core";
import React from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  CoinInfo,
  getShortAddr,
  getValuePrecisionThousand,
  SDK_ERROR_MAP_TO_UI,
  TokenType,
} from "@loopring-web/common-resources";
import {
  RawDataRedPacketReceivesItem,
  RawDataRedPacketRecordsItem,
  RedPacketViewStep,
  useOpenModals,
} from "@loopring-web/component-lib";

export const useMyRedPacketRecordTransaction = <
  R extends RawDataRedPacketRecordsItem
>(
  setToastOpen: (props: any) => void
) => {
  const { t } = useTranslation(["error"]);

  const {
    account: { accountId, apiKey },
  } = useAccount();

  const [myRedPacketRecordList, setMyRedPacketRecordList] = React.useState<R[]>(
    []
  );
  const { setShowRedPacket } = useOpenModals();

  const { idIndex, coinMap, tokenMap } = useTokenMap();
  const [myRedPacketRecordTotal, setMyRedPacketRecordTotal] = React.useState(0);
  const [showLoading, setShowLoading] = React.useState(true);

  const getMyRedPacketRecordTxList = React.useCallback(
    async ({ offset, limit }: any) => {
      setShowLoading(true);
      if (LoopringAPI.luckTokenAPI && accountId) {
        if (apiKey) {
          const response =
            await LoopringAPI.luckTokenAPI.getLuckTokenLuckyTokens(
              {
                senderId: accountId,
                scopes: "0,1",
                statuses: `0,1,2,3,4`,
                official: false,
              } as any,
              apiKey
            );
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            const errorItem =
              SDK_ERROR_MAP_TO_UI[
                (response as sdk.RESULT_INFO)?.code ?? 700001
              ];
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
            setMyRedPacketRecordTotal((response as any)?.totalNum);
            // @ts-ignore
            let result = (response as any)?.list.reduce(
              (
                prev: RawDataRedPacketRecordsItem[],
                item: sdk.LuckyTokenItemForReceive
              ) => {
                const token = tokenMap[idIndex[item.tokenId]];
                const tokenInfo = coinMap[token.symbol ?? ""];
                // const type = coinMap[idIndex[item.tokenId] ?? ""];
                const totalAmount = getValuePrecisionThousand(
                  volumeToCountAsBigNumber(
                    token.symbol,
                    item.tokenAmount.totalAmount
                  ),
                  token.precision,
                  token.precision,
                  token.precision,
                  false
                );
                const remainAmount = getValuePrecisionThousand(
                  volumeToCountAsBigNumber(
                    token.symbol,
                    item.tokenAmount.remainAmount
                  ),
                  token.precision,
                  token.precision,
                  token.precision,
                  false
                );

                prev.push({
                  token: {
                    ...tokenInfo,
                    name: token.name,
                    type: TokenType.single,
                  } as any,
                  type: item.type, //sdk.LuckyTokenItemStatus
                  status: item.status,
                  validSince: item.validSince,
                  validUntil: item.validSince,
                  totalCount: item.tokenAmount.totalCount,
                  remainCount: item.tokenAmount.remainCount,
                  totalAmount,
                  remainAmount,
                  createdAt: item.createdAt,
                  rawData: item,
                });
                return prev;
              },
              [] as RawDataRedPacketRecordsItem[]
            );

            setMyRedPacketRecordList(result);
          }
        }
      }
      setShowLoading(false);
    },
    [accountId, apiKey, setToastOpen, t, idIndex]
  );
  const onItemClick = (item: sdk.LuckyTokenItemForReceive) => {
    setShowRedPacket({
      isShow: true,
      info: {
        ...item,
        hash: item.hash,
      },
      step: RedPacketViewStep.QRCodePanel,
    });
  };

  return {
    // page,
    onItemClick,
    myRedPacketRecordList,
    showLoading,
    getMyRedPacketRecordTxList,
    myRedPacketRecordTotal,
    // pagination,
    // updateTickersUI,
  };
};

export const useMyRedPacketReceiveTransaction = <
  R extends RawDataRedPacketReceivesItem
>(
  setToastOpen: (props: any) => void
) => {
  const { t } = useTranslation(["error"]);

  const {
    account: { accountId, apiKey, accAddress },
  } = useAccount();

  const [redPacketReceiveList, setRedPacketReceiveList] = React.useState<R[]>(
    []
  );
  const { setShowRedPacket } = useOpenModals();

  const { idIndex, coinMap, tokenMap } = useTokenMap();
  const [redPacketReceiveTotal, setRedPacketReceiveTotal] = React.useState(0);
  const [showLoading, setShowLoading] = React.useState(true);

  const getRedPacketReceiveList = React.useCallback(
    async ({ offset, limit }: any) => {
      setShowLoading(true);
      if (LoopringAPI.luckTokenAPI && accountId) {
        if (apiKey) {
          const response =
            await LoopringAPI.luckTokenAPI.getLuckTokenClaimHistory(
              {
                offset,
                limit,
              } as any,
              apiKey
            );
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            const errorItem =
              SDK_ERROR_MAP_TO_UI[
                (response as sdk.RESULT_INFO)?.code ?? 700001
              ];
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
            setRedPacketReceiveTotal((response as any)?.totalNum);
            // @ts-ignore
            let result = (response as any)?.list.reduce(
              (prev: R[], item: sdk.LuckTokenHistory) => {
                // @ts-ignore
                const { luckyToken, claim: myClaim } = item;
                const token = tokenMap[idIndex[luckyToken.tokenId]];
                const tokenInfo = coinMap[token.symbol ?? ""];

                const amount = getValuePrecisionThousand(
                  volumeToCountAsBigNumber(
                    token.symbol,
                    myClaim?.amount ?? 0
                    // luckyToken.tokenAmount.totalAmount
                  ),
                  token.precision,
                  token.precision,
                  token.precision,
                  false
                );
                // const remainAmount = getValuePrecisionThousand(
                //   volumeToCountAsBigNumber(
                //     token.symbol,
                //     item.luckyToken.remainAmount
                //   ),
                //   token.precision,
                //   token.precision,
                //   token.precision,
                //   false
                // );

                prev.push();
                return [
                  ...prev,
                  {
                    token: {
                      ...tokenInfo,
                      name: token.name,
                      type: TokenType.single,
                    } as any,
                    amount,
                    type: luckyToken.type, //sdk.LuckyTokenItemStatus
                    status: luckyToken.status,
                    claimAt: myClaim?.createdAt,
                    sender: luckyToken?.sender?.ens
                      ? luckyToken?.sender?.ens
                      : getShortAddr(luckyToken?.sender?.address),
                    rawData: item,
                    // validSince: luckyToken.validSince,
                    // validUntil: luckyToken.validSince,
                    // totalCount: luckyToken.tokenAmount.totalCount,
                    // remainCount: luckyToken.tokenAmount.remainCount,
                    // totalAmount,
                    // remainAmount,
                    // createdAt: item.createdAt,
                    // rawData: item,
                  },
                ];
              },
              [] as R[]
            );

            setRedPacketReceiveList(result);
          }
        }
      }
      setShowLoading(false);
    },
    [accountId, apiKey, setToastOpen, t, idIndex]
  );

  const onItemClick = (item: sdk.LuckTokenHistory) => {
    setShowRedPacket({
      isShow: true,
      info: {
        ...item.luckyToken,
        hash: item.hash,
      },
      step: RedPacketViewStep.DetailPanel,
    });
  };
  return {
    onItemClick,
    redPacketReceiveList,
    showLoading,
    getRedPacketReceiveList,
    redPacketReceiveTotal,
  };
};
