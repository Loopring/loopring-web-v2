import React from "react";
import { LoopringAPI } from "../../api_wrapper";
import {
  AccountStep,
  RedPacketViewStep,
  useOpenModals,
} from "@loopring-web/component-lib";
import * as sdk from "@loopring-web/loopring-sdk";
import { store, useAccount, useSystem } from "../../stores";
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
    account: { apiKey, accountId },
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
          accountId: accountId,
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
              referrer: redPacketInfo.referrer,
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
  }, [redPacketInfo, accountId]);
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

export function useOpenRedpacket() {
  const { setShowRedPacket, setShowAccount } = useOpenModals();
  const { chainId } = useSystem();
  const { account } = useAccount();

  const callOpen = React.useCallback(async () => {
    setShowAccount({
      isShow: true,
      step: AccountStep.RedPacketOpen_Claim_In_Progress,
    });
    const _info = store.getState().modals.isShowRedPacket
      .info as sdk.LuckyTokenItemForReceive & {
      referrer?: string;
    };
    try {
      let response =
        await LoopringAPI.luckTokenAPI?.sendLuckTokenClaimLuckyToken({
          request: {
            hash: _info?.hash,
            claimer: account.accAddress,
            referrer: _info?.referrer ?? "",
          },
          eddsaKey: account.eddsaKey.sk,
          apiKey: account.apiKey,
        } as any);
      if (
        (response as sdk.RESULT_INFO).code ||
        (response as sdk.RESULT_INFO).message
      ) {
        throw response;
      }

      setShowAccount({
        isShow: false,
      });
      setShowRedPacket({
        isShow: true,
        step: RedPacketViewStep.DetailPanel,
        info: {
          ..._info,
          response,
          claimAmount: (response as any).amount,
        },
      });
    } catch (error: any) {
      if (error?.code === UIERROR_CODE.ERROR_REDPACKET_CLAIMED) {
        setShowRedPacket({
          isShow: true,
          step: RedPacketViewStep.DetailPanel,
          info: {
            ..._info,
          },
        });
      } else {
        setShowAccount({
          isShow: true,
          step: AccountStep.RedPacketOpen_Failed,
          error: {
            code: UIERROR_CODE.UNKNOWN,
            msg: error?.message,
            // @ts-ignore
            ...(error instanceof Error
              ? {
                  message: error?.message,
                  stack: error?.stack,
                }
              : error ?? {}),
          },
        });
      }
    }
  }, [chainId, account]);

  return {
    callOpen,
  };
}
