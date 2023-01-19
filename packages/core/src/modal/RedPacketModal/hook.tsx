/* eslint-disable react/jsx-pascal-case */

import {
  AccountStep,
  RedPacketDetailProps,
  RedPacketOpenedProps,
  RedPacketOpenProps,
  RedPacketQRCodeProps,
  RedPacketTimeoutProps,
  RedPacketClockProps,
  RedPacketViewStep,
  useOpenModals,
} from "@loopring-web/component-lib";
import React from "react";
import {
  CustomError,
  ErrorMap,
  Exchange,
  getShortAddr,
  getValuePrecisionThousand,
  myLog,
  UIERROR_CODE,
  YEAR_DAY_MINUTE_FORMAT,
} from "@loopring-web/common-resources";
import {
  useAccount,
  // useSystem,
  useTokenMap,
} from "../../stores";
import { getUserReceiveList, volumeToCountAsBigNumber } from "../../hooks";
import { useTranslation } from "react-i18next";
import moment from "moment";
import * as sdk from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "../../api_wrapper";

export function useRedPacketModal() {
  const {
    modals: {
      // isShowNFTDetail,
      isShowRedPacket: { info, isShow, step },
    },
    setShowRedPacket,
    setShowAccount,
  } = useOpenModals();
  const { account } = useAccount();
  const { tokenMap, idIndex } = useTokenMap();
  const { t } = useTranslation("common");
  const [detail, setDetail] =
    React.useState<undefined | sdk.LuckTokenClaimDetail>(undefined);
  const amountStr = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive;
    const token = tokenMap[idIndex[_info?.tokenId] ?? ""];
    if (isShow && token && _info && _info.tokenAmount) {
      const symbol = token.symbol;
      const amount = getValuePrecisionThousand(
        volumeToCountAsBigNumber(symbol, _info.tokenAmount.totalAmount as any),
        token.precision,
        token.precision,
        undefined,
        false,
        {
          floor: false,
          // isTrade: true,
        }
      );
      return amount + " " + symbol;
    }
    return "";

    // tokenMap[]
  }, [info?.tokenId, info?.tokenAmount]);
  const amountClaimStr = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive & {
      claimAmount: string;
    };
    const token = tokenMap[idIndex[_info?.tokenId] ?? ""];
    if (isShow && token && _info && _info.claimAmount) {
      const symbol = token.symbol;
      const amount = getValuePrecisionThousand(
        volumeToCountAsBigNumber(symbol, _info.claimAmount as any),
        token.precision,
        token.precision,
        undefined,
        false,
        {
          floor: false,
          // isTrade: true,
        }
      );
      return amount + " " + symbol;
    }
    return "";

    // tokenMap[]
  }, [info?.tokenId, info?.claimAmount]);

  const textSendBy = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive;
    if (isShow && info && _info.validSince > _info.createdAt) {
      const date = moment(new Date(`${_info.validSince}000`)).format(
        YEAR_DAY_MINUTE_FORMAT
      );
      return t("labelLuckyRedPacketStart", date);
    } else {
      return "";
    }
  }, [info?.validSince, info?.createdAt]);
  const redPacketQRCodeProps: RedPacketQRCodeProps | undefined =
    React.useMemo(() => {
      const _info = info as sdk.LuckyTokenItemForReceive & {
        isShouldSharedRely: boolean;
      };
      if (isShow && info && step === RedPacketViewStep.QRCodePanel) {
        if (
          _info?.status === sdk.LuckyTokenItemStatus.COMPLETED ||
          _info.status === sdk.LuckyTokenItemStatus.OVER_DUE
        ) {
          setShowRedPacket({
            isShow,
            step: RedPacketViewStep.TimeOutPanel,
            info: _info,
          });
        } else if (_info?.hash) {
          const url = `${Exchange}wallet?redpacket&id=${info?.hash}&referrer=${account.accAddress}`;

          return {
            url,
            textAddress: _info.sender?.ens
              ? _info.sender?.ens
              : getShortAddr(_info.sender?.address),
            textContent: _info.info.memo,
            amountStr,
            textSendBy,
            textType:
              _info.type.mode == sdk.LuckyTokenClaimType.RELAY
                ? t("labelRelayRedPacket")
                : t("labelLuckyRedPacket"),
            textShared: t("labelShare"),
            isShouldSharedRely: _info.isShouldSharedRely,
            // @ts-ignore
            textNo: t("labelRedPacketNo", { value: _info?.id?.toString() }),
          } as RedPacketQRCodeProps;
        }
      }
      return undefined;
    }, [info, account.accAddress, isShow, textSendBy, amountStr, step]);
  const redPacketTimeoutProps: RedPacketTimeoutProps | undefined =
    React.useMemo(() => {
      const _info = info as sdk.LuckyTokenItemForReceive;
      if (
        isShow &&
        info &&
        step === RedPacketViewStep.TimeOutPanel &&
        (_info.status === sdk.LuckyTokenItemStatus.COMPLETED ||
          _info.status === sdk.LuckyTokenItemStatus.OVER_DUE)
      ) {
        return {
          memo: _info.info.memo,
          sender: _info.sender?.ens
            ? _info.sender?.ens
            : getShortAddr(_info.sender?.address),
          viewDetail: () => {
            setShowRedPacket({
              isShow,
              step: RedPacketViewStep.DetailPanel,
              info: _info,
            });
          },
        };
      }
      return undefined;
    }, [info, account.accAddress, isShow, step]);
  const redPacketOpenProps: RedPacketOpenProps | undefined =
    React.useMemo(() => {
      const _info = info as sdk.LuckyTokenItemForReceive & {
        referrer?: string;
      };
      if (isShow && info && step === RedPacketViewStep.OpenPanel) {
        if (_info?.status == sdk.LuckyTokenItemStatus.COMPLETED) {
          // TODO:
        } else if (_info.status === sdk.LuckyTokenItemStatus.OVER_DUE) {
          setShowRedPacket({
            isShow,
            step: RedPacketViewStep.TimeOutPanel,
            info: _info,
          });
        } else if (_info?.hash) {
          myLog("redPacketOpenProps", _info);
          return {
            memo: _info.info.memo,
            amountStr,
            sender: _info.sender?.ens
              ? _info.sender?.ens
              : getShortAddr(_info.sender?.address),
            viewDetail: () => {
              setShowRedPacket({
                isShow,
                step: RedPacketViewStep.DetailPanel,
                info: _info,
              });
            },

            onOpen: async () => {
              setShowAccount({
                isShow: true,
                step: AccountStep.RedPacketOpen_Claim_In_Progress,
              });
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
                  isShow,
                  step: RedPacketViewStep.OpenedPanel,
                  info: {
                    ..._info,
                    response,
                    claimAmount: (response as any).amount,
                  },
                });
              } catch (error: any) {
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
            },
          };
        }
      }
      return undefined;
    }, [info, amountStr, account.accAddress, isShow, step]);
  const redPacketOpenedProps: RedPacketOpenedProps | undefined =
    React.useMemo(() => {
      const _info = info as sdk.LuckyTokenItemForReceive & {
        claimAmount?: string;
      };
      if (
        isShow &&
        info &&
        step === RedPacketViewStep.OpenedPanel &&
        _info?.hash
      ) {
        myLog("redPacketOpenProps", _info);
        return {
          memo: _info.info.memo,
          amountStr,
          amountClaimStr,
          sender: _info.sender?.ens
            ? _info.sender?.ens
            : getShortAddr(_info.sender?.address),
          viewDetail: () => {
            setShowRedPacket({
              isShow,
              step: RedPacketViewStep.DetailPanel,
              info: _info,
            });
          },
        };
      }
      return undefined;
    }, [info, amountClaimStr, amountStr, account.accAddress, isShow, step]);
  let redPacketClockProps: RedPacketClockProps | undefined =
    React.useMemo(() => {
      const _info = info as sdk.LuckyTokenItemForReceive & {
        claimAmount?: string;
      };
      if (
        isShow &&
        info &&
        step === RedPacketViewStep.RedPacketClock &&
        _info?.hash
      ) {
        myLog("redPacketOpenProps", _info);
        return {
          memo: _info.info.memo,
          amountStr,
          amountClaimStr,
          sender: _info.sender?.ens
            ? _info.sender?.ens
            : getShortAddr(_info.sender?.address),
          validSince: _info.validSince,
          showRedPacket: () => {
            setShowRedPacket({
              isShow: true,
              step: RedPacketViewStep.OpenPanel,
              info: _info,
            });
          },
        };
      }

      return undefined;
    }, [info, amountClaimStr, amountStr, account.accAddress, isShow, step]);
  const redPacketDetailCall = React.useCallback(async () => {
    setDetail(undefined);
    const _info = info as sdk.LuckyTokenItemForReceive & {
      claimAmount?: string;
    };
    setShowAccount({
      isShow: true,
      step: AccountStep.RedPacketOpen_Claim_In_Progress,
    });
    if (_info?.hash && LoopringAPI.luckTokenAPI) {
      try {
        setShowAccount({
          isShow: true,
          step: AccountStep.RedPacketOpen_In_Progress,
        });
        const response = await LoopringAPI.luckTokenAPI.getLuckTokenDetail(
          {
            hash: _info.hash,
            fromId: 0,
            showHelper: true,
          } as any,
          account.apiKey
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
          const detail = (response as any).detail;
          const luckTokenInfo: sdk.LuckyTokenItemForReceive = detail.luckyToken;
          if (luckTokenInfo) {
            setDetail(detail);
            // setShowRedPacket({
            //   isShow: true,
            //   step: RedPacketViewStep.DetailPanel,
            // });
            setShowAccount({
              isShow: false,
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
      } catch (error: any) {
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
        setShowRedPacket({ isShow: false });
      }
    }
  }, [isShow, step, info]);
  React.useEffect(() => {
    if (isShow && step === RedPacketViewStep.DetailPanel) {
      redPacketDetailCall();
    }
  }, [step, isShow]);
  const redPacketDetailProps = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive & {
      claimAmount?: string;
    };
    if (
      isShow &&
      info &&
      step === RedPacketViewStep.DetailPanel &&
      _info?.hash &&
      LoopringAPI.luckTokenAPI &&
      detail &&
      detail.luckyToken
    ) {
      const isShouldSharedRely =
        detail.luckyToken.type.mode === sdk.LuckyTokenClaimType.RELAY &&
        !["OVER_DUE", "FAILED"].includes(detail.luckyToken.status);
      const tokenInfo = tokenMap[idIndex[detail?.tokenId] ?? ""];

      return {
        totalCount: detail.luckyToken.tokenAmount.totalCount,
        remainCount: detail.luckyToken.tokenAmount.remainCount,
        memo: _info.info.memo,
        amountStr,
        amountClaimStr,
        sender: _info.sender?.ens
          ? _info.sender?.ens
          : getShortAddr(_info.sender?.address),
        claimList: getUserReceiveList(detail.claims as any, tokenInfo),
        detail,
        isShouldSharedRely,
        onShared: () => {
          setShowRedPacket({
            isShow: true,
            step: RedPacketViewStep.QRCodePanel,
            info: {
              ...detail.luckyToken,
              isShouldSharedRely,
            },
          });
        },
      } as RedPacketDetailProps;
    } else {
      return undefined;
    }
  }, [
    info,
    detail,
    amountClaimStr,
    amountStr,
    account.accAddress,
    isShow,
    step,
  ]);
  return {
    redPacketQRCodeProps,
    redPacketTimeoutProps,
    redPacketOpenProps,
    redPacketOpenedProps,
    redPacketDetailProps,
    redPacketClockProps,
  };
}
