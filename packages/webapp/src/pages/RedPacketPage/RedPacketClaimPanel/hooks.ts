import { RawDataRedPacketClaimItem } from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { LoopringAPI, useAccount, useTokenMap } from "@loopring-web/core";
import React from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import { SDK_ERROR_MAP_TO_UI } from "@loopring-web/common-resources";

export const useClaimRedPacket = <R extends RawDataRedPacketClaimItem>(
  setToastOpen: (props: any) => void
) =>
  // setToastOpen: (props: any) => void
  {
    const { t } = useTranslation(["error"]);

    const {
      account: { accountId, apiKey },
    } = useAccount();

    const [redPacketClaimList, setRedPacketClaimList] = React.useState<R[]>([]);
    const [redPacketClaimTotal, setRedPacketClaimTotal] = React.useState(0);
    const { idIndex } = useTokenMap();

    // const [pagination, setDualPagination] = React.useState<{
    //   pageSize: number;
    //   total: number;
    // }>({
    //   pageSize: Limit,
    //   total: 0,
    // });
    const [showLoading, setShowLoading] = React.useState(true);

    const getClaimRedPacket = React.useCallback(
      async ({ showOfficial, offset }: any) => {
        setShowLoading(true);
        if (LoopringAPI.luckTokenAPI && accountId && apiKey) {
          const response = await LoopringAPI.luckTokenAPI.getLuckTokenSummary(
            // {
            //   senderId: accountId,
            //   scopes: sdk.LuckyTokenViewType,
            //   statuses: `0,1,2,3,4`,
            //   official: false,
            // } as any,
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
            setRedPacketClaimTotal((response as any)?.totalNum);

            // @ts-ignore
            let result = (response as any)?.list.reduce(
              (prev: R[], item: sdk.LuckyTokenItemForReceive) => {
                prev.push(item);
                return prev;
              },
              [] as R[]
            );

            setRedPacketClaimList(result);
          }
        }
        setShowLoading(false);
      },
      [accountId, apiKey, t, idIndex]
    );
    const onItemClick = () => {};

    return {
      onItemClick,
      redPacketClaimList,
      showLoading,
      redPacketClaimTotal,
      getClaimRedPacket,
    };
  };
