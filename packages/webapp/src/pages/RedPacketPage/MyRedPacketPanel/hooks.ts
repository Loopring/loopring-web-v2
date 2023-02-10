import { useTranslation } from "react-i18next";
import {
  amountStrCallback,
  amountStrNFTCallback,
  LoopringAPI,
  useAccount,
  useTokenMap,
  volumeToCountAsBigNumber,
} from "@loopring-web/core";
import React from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  getShortAddr,
  getValuePrecisionThousand,
  SDK_ERROR_MAP_TO_UI,
  TabTokenTypeIndex,
  TokenType,
} from "@loopring-web/common-resources";
import {
  RawDataRedPacketReceivesItem,
  RawDataRedPacketRecordsItem,
  RedPacketViewStep,
  useOpenModals,
} from "@loopring-web/component-lib";
import { useRouteMatch } from "react-router-dom";

export const useMyRedPacketRecordTransaction = <
  R extends RawDataRedPacketRecordsItem
>({
  setToastOpen,
  tabType,
}: {
  setToastOpen: (props: any) => void;
  tabType: TabTokenTypeIndex;
}) => {
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
  // let match: any = useRouteMatch("/redPacket/records/?:item/?:type");
  React.useEffect(() => {
    getMyRedPacketRecordTxList({ offset: 0 });
  }, [tabType]);
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
                modes: "0,1",
                partitions: "0,1",
                statuses: "0,1,2,3,4",
                official: false,
                offset,
                limit,
                isNft: tabType === "NFT" ? true : false,
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
                // const type = coinMap[idIndex[item.tokenId] ?? ""];
                let remainAmount, totalAmount, tokenInfo;
                if (item.isNft) {
                  tokenInfo = {
                    ...item.nftTokenInfo,
                    type: TokenType.nft,
                    // icon:
                  };
                  totalAmount = amountStrNFTCallback(
                    item.nftTokenInfo as any,
                    item.tokenAmount.totalAmount ?? 0
                  ).amount;
                  remainAmount = amountStrNFTCallback(
                    item.nftTokenInfo as any,
                    item.tokenAmount.remainAmount ?? 0
                  ).amount;
                } else {
                  const token = tokenMap[idIndex[item.tokenId]];
                  tokenInfo = {
                    ...coinMap[token.symbol ?? ""],
                    name: token?.name,
                    type: TokenType.single,
                  };
                  totalAmount = amountStrCallback(
                    tokenMap,
                    idIndex,
                    item.tokenId,
                    item.tokenAmount.totalAmount ?? 0
                  ).amount;
                  remainAmount = amountStrCallback(
                    tokenMap,
                    idIndex,
                    item.tokenId,
                    item.tokenAmount.remainAmount ?? 0
                  ).amount;
                }

                prev.push({
                  token: {
                    ...tokenInfo,
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
    [accountId, apiKey, setToastOpen, t, idIndex, tabType]
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
>({
  setToastOpen,
  tabType,
}: {
  setToastOpen: (props: any) => void;
  tabType: TabTokenTypeIndex;
}) => {
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
  // let match: any = useRouteMatch("/redPacket/records/?:item/?:type");
  let match: any = useRouteMatch("/redPacket/records/?:item/?:type");

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
                isNft: tabType === "NFT" ? true : false,
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

                let amount, tokenInfo;
                if (luckyToken.isNft) {
                  amount = amountStrNFTCallback(
                    luckyToken.nftTokenInfo as any,
                    myClaim?.amount?.toString() ?? 0
                  ).amount;
                  tokenInfo = {
                    ...luckyToken.nftTokenInfo,
                    type: TokenType.nft,
                  };
                } else {
                  const token = tokenMap[idIndex[luckyToken.tokenId]];
                  tokenInfo = {
                    ...coinMap[token.symbol ?? ""],
                    name: token.name,
                    type: TokenType.single,
                  };
                  amount = amountStrCallback(
                    tokenMap,
                    idIndex,
                    luckyToken.tokenId,
                    myClaim?.amount?.toString() ?? 0
                  ).amount;
                }

                prev.push();
                return [
                  ...prev,
                  {
                    token: {
                      ...tokenInfo,
                    } as any,
                    amount,
                    type: luckyToken.type, //sdk.LuckyTokenItemStatus
                    status: luckyToken.status,
                    claimAt: myClaim?.createdAt,
                    sender: luckyToken?.sender?.ens
                      ? luckyToken?.sender?.ens
                      : getShortAddr(luckyToken?.sender?.address),
                    rawData: item,
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
    [accountId, apiKey, setToastOpen, t, idIndex, tabType]
  );

  React.useEffect(() => {
    getRedPacketReceiveList({ offset: 0 });
  }, [tabType]);
  const onItemClick = (item: sdk.LuckTokenHistory) => {
    setShowRedPacket({
      isShow: true,
      info: {
        ...item.luckyToken,
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
