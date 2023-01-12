import React from "react";
import { LoopringAPI } from "../../api_wrapper";
import {
  AccountStep,
  RedPacketViewStep,
  useOpenModals,
} from "@loopring-web/component-lib";
import * as sdk from "@loopring-web/loopring-sdk";
import { useAccount } from "../../stores";
import {
  CustomError,
  ErrorMap,
  UIERROR_CODE,
} from "@loopring-web/common-resources";

export const useRedPacketScanQrcodeSuccess = () => {
  const {
    setShowAccount,
    setShowRedPacket,
    // modals: { isShowAccount },
  } = useOpenModals();
  const {
    account: { apiKey },
  } = useAccount();
  const [redPacketInfo, setRedPacketInfo] =
    React.useState<{ hash: string; referrer: string } | undefined>(undefined);
  const getLuckTokenDetail = React.useCallback(async () => {
    if (LoopringAPI.luckTokenAPI && redPacketInfo) {
      setShowAccount({
        isShow: true,
        step: AccountStep.RedPacketOpen_In_Progress,
      });
      const response = await LoopringAPI.luckTokenAPI.getLuckTokenDetail(
        {
          hash: redPacketInfo.hash,
          fromId: 0,
          showHelper: true,
        } as any,
        apiKey
      );
      if (
        (response as sdk.RESULT_INFO).code ||
        (response as sdk.RESULT_INFO).message
      ) {
        setShowAccount({
          isShow: true,
          step: AccountStep.RedPacketOpen_Failed,
          error: {
            code: (response as sdk.RESULT_INFO)?.code,
            msg: (response as sdk.RESULT_INFO)?.message,
            ...(response instanceof Error
              ? {
                  message: response?.message,
                  stack: response?.stack,
                }
              : response ?? {}),
          },
        });
      } else {
        const luckTokenInfo: sdk.LuckyTokenItemForReceive = (response as any)
          .detail.luckyToken;
        if (luckTokenInfo) {
          setShowAccount({ isShow: false });
          setShowRedPacket({
            isShow: true,
            info: {
              ...luckTokenInfo,
              referer: redPacketInfo.referrer,
            },
            step: RedPacketViewStep.OpenPanel,
          });
        } else {
          const error = new CustomError(ErrorMap.ERROR_REDPACKET_EMPTY);
          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketOpen_Failed,
            error: {
              code: UIERROR_CODE.ERROR_REDPACKET_EMPTY,
              msg: error.message,
            },
          });
        }
      }
    }
  }, [redPacketInfo]);
  React.useEffect(() => {
    if (redPacketInfo) {
      getLuckTokenDetail();
    }
  }, [redPacketInfo]);
  const handleSuccess = React.useCallback(
    async (data: string) => {
      const url = new URL(data);
      const searchParams = new URLSearchParams(
        url.hash.replace("#/wallet", "")
      );
      if (searchParams.has("redpacket") && searchParams.get("id")) {
        setRedPacketInfo({
          hash: searchParams.get("id")?.toString() ?? "",
          referrer: searchParams.get("referrer")?.toString() ?? "",
        });
      } else {
        setRedPacketInfo({
          hash: "",
          referrer: "",
        });
        const error = new CustomError(ErrorMap.ERROR_REDPACKET_EMPTY);
        setShowAccount({
          isShow: true,
          step: AccountStep.RedPacketOpen_Failed,
          error: {
            code: UIERROR_CODE.ERROR_REDPACKET_EMPTY,
            msg: error.message,
          },
        });
      }
    },
    [apiKey]
  );
  return {
    handleSuccess,
  };
};
export const useRedPacketDetail = () => {
  return {
    redPacketProps: undefined,
  };
};
