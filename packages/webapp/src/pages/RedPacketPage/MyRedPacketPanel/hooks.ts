import { useTranslation } from "react-i18next";
import {
  amountStrCallback,
  amountStrNFTCallback,
  LoopringAPI,
  useAccount,
  useTokenMap,
} from "@loopring-web/core";
import React from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  getShortAddr,
  SDK_ERROR_MAP_TO_UI,
  TokenType,
} from "@loopring-web/common-resources";
import {
  RawDataRedPacketReceivesItem,
  RawDataRedPacketRecordsItem,
  RedPacketViewStep,
  setShowAccount,
  useOpenModals,
} from "@loopring-web/component-lib";

export const useMyRedPacketRecordTransaction = <
  R extends RawDataRedPacketRecordsItem
>({
  setToastOpen,
}: // tabType,
{
  setToastOpen: (props: any) => void;
  // tabType: TabTokenTypeIndex;
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

  const getMyRedPacketRecordTxList = React.useCallback(
    async ({ offset, limit, filter }: any) => {
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
                ...filter,
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
                  validUntil: item.validUntil,
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
>({
  setToastOpen,
}: // tabType,
{
  setToastOpen: (props: any) => void;
  // tabType: TabTokenTypeIndex;
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

  const getRedPacketReceiveList = React.useCallback(
    async ({ offset, limit, filter }: any) => {
      setShowLoading(true);
      if (LoopringAPI.luckTokenAPI && accountId) {
        if (apiKey) {
          const response =
            await LoopringAPI.luckTokenAPI.getLuckTokenClaimHistory(
              {
                offset,
                limit,
                ...filter,
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
    [accountId, apiKey, setToastOpen, t, idIndex]
  );

  const onItemClick = (item: sdk.LuckTokenHistory) => {
    setShowRedPacket({
      isShow: true,
      step: RedPacketViewStep.DetailPanel,
      info: {
        ...item.luckyToken,
      },
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

export const useMyRedPacketBlindBoxReceiveTransaction = <
  R extends RawDataRedPacketReceivesItem
>({
  setToastOpen,
}: // tabType,
{
  setToastOpen: (props: any) => void;
  // tabType: TabTokenTypeIndex;
}) => {
  const { t } = useTranslation(["error"]);

  const {
    account: { accountId, apiKey, accAddress, eddsaKey },
  } = useAccount();

  const [redPacketReceiveList, setRedPacketReceiveList] = React.useState<R[]>(
    []
  );
  const { setShowRedPacket } = useOpenModals();

  const { idIndex, coinMap, tokenMap } = useTokenMap();
  const [redPacketReceiveTotal, setRedPacketReceiveTotal] = React.useState(0);
  const [showLoading, setShowLoading] = React.useState(true);
  // let match: any = useRouteMatch("/redPacket/records/?:item/?:type");

  const getRedPacketReceiveList = React.useCallback(
    async ({ offset, limit, filter }: any) => {
      setShowLoading(true);
      if (LoopringAPI.luckTokenAPI && accountId) {
        if (apiKey) {
          const response =
            await LoopringAPI.luckTokenAPI.getLuckTokenClaimedBlindBox(
              {
                offset,
                limit,
                ...filter,
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
            // debugger

            let result = (response as any)?.list.map(
              (item: sdk.LuckyTokenBlindBoxItemReceive) => {
                // @ts-ignore
                const { luckyToken, claim: myClaim } = item;
                
                return {
                  // token: {
                  //   ...tokenInfo,
                  // } as any,
                  // amount,
                  type: luckyToken.type, //sdk.LuckyTokenItemStatus
                  status: luckyToken.status,
                  claimAt: myClaim?.createdAt,
                  sender: luckyToken?.sender?.ens
                    ? luckyToken?.sender?.ens
                    : getShortAddr(luckyToken?.sender?.address),
                  rawData: item,
                };
              }
            );

            setRedPacketReceiveList(result);
          }
        }
      }
      setShowLoading(false);
    },
    [accountId, apiKey, setToastOpen, t, idIndex]
  );

  const onItemClick = async (item: sdk.LuckyTokenBlindBoxItemReceive) => {
    // debugger
    // if (item.luckyToken.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
    if (item.luckyToken.validUntil > Date.now()) {
      // return <>Start time: {moment(row.rawData.luckyToken.validSince).format('YYYY.MM.DD HH:MM')}</>
    } else if (item.claim.status === sdk.BlindBoxStatus.OPENED) {
      // LoopringAPI.luckTokenAPI?.getLuckTokenDetail({hash: item.luckyToken})
      setShowRedPacket({
        isShow: true,
        step: RedPacketViewStep.BlindBoxDetail,
        info: {
          ...item.luckyToken

          // hash: item.luckyToken.hash,
          // sender: item.luckyToken.sender,
          // type: item.luckyToken.type,
          // type: item.luckyToken.info.memo,
          // ...item.luckyToken,
          // ..._info,
        },
      });
    } else if (item.claim.status === sdk.BlindBoxStatus.EXPIRED) { 
      // setShowRedPacket({
      //       isShow: true,
      //       step: RedPacketViewStep.BlindBoxDetail,
      //       info: {
      //         ...item.luckyToken,
      //         // ..._info,
      //       },
      //     });
    } else if (item.claim.status === sdk.BlindBoxStatus.NOT_OPENED) { 
      // item.
      let response =
          await LoopringAPI.luckTokenAPI?.sendLuckTokenClaimLuckyToken({
              request: {
                hash: item.luckyToken.hash,
                claimer: accAddress,
              },
              eddsaKey: eddsaKey.sk,
              apiKey: apiKey,
            } as any);
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            throw response;
          }
          // const response2 = await LoopringAPI.luckTokenAPI!.getBlindBoxDetail({
          //   hash: _info.hash,
          // }, account.apiKey)
          // debugger
          // setShowAccount({
          //   isShow: false,
          // });
          setShowRedPacket({
            isShow: true,
            step: RedPacketViewStep.BlindBoxDetail,
            info: {
              ...item.luckyToken,
              // ..._info,
            },
          });
      
      // await LoopringAPI.luckTokenAPI?.sendLuckTokenClaimBlindBox({

      // })
      
      
      // setShowRedPacket({
      //   isShow: true,
      //   step: RedPacketViewStep.BlindBoxDetail,
      //   info: {
      //     ...item.luckyToken,
      //   },
      // });

      // return <Button onClick={() => onItemClick(row.rawData)} variant={"outlined"}>Open</Button>
    }
    
    // } else {
    //   setShowRedPacket({
    //     isShow: true,
    //     step: RedPacketViewStep.DetailPanel,
    //     info: {
    //       ...item.luckyToken,
    //     },
    //   });
    // }
  };
  return {
    onItemClick,
    redPacketReceiveList,
    showLoading,
    getRedPacketReceiveList,
    redPacketReceiveTotal,
  };
};
