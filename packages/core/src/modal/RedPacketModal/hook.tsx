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
  RedPacketDetailLimit,
  NFTMedia,
  BoxNFT,
} from "@loopring-web/component-lib";
import React from "react";
import {
  CustomError,
  ErrorMap,
  Exchange,
  getShortAddr,
  getValuePrecisionThousand,
  myLog,
  NFTWholeINFO,
  UIERROR_CODE,
  YEAR_DAY_SECOND_FORMAT,
} from "@loopring-web/common-resources";
import { store, useAccount, useSystem, useTokenMap } from "../../stores";
import {
  getUserReceiveList,
  useOpenRedpacket,
  volumeToCountAsBigNumber,
} from "../../hooks";
import { useTranslation } from "react-i18next";
import moment from "moment";
import * as sdk from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "../../api_wrapper";
import { useRedPacketHistory } from "../../stores/localStore/redPacket";
import { Box } from "@mui/material";
import { getIPFSString } from "../../utils";

export function useRedPacketModal() {
  const ref = React.createRef();

  const {
    modals: {
      // isShowNFTDetail,
      isShowRedPacket: { info, isShow, step },
    },
    setShowRedPacket,
    setShowAccount,
  } = useOpenModals();
  const { account } = useAccount();
  const { updateRedpacketHash } = useRedPacketHistory();
  const { chainId, baseURL } = useSystem();
  const { tokenMap, idIndex } = useTokenMap();
  const { t } = useTranslation("common");
  const { callOpen } = useOpenRedpacket();

  const [detail, setDetail] =
    React.useState<undefined | sdk.LuckTokenClaimDetail>(undefined);
  const [qrcode, setQrcode] =
    React.useState<undefined | sdk.LuckyTokenItemForReceive>(undefined);
  const ImageEle = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive;
    if (isShow && _info.isNft && _info && _info.nftTokenInfo) {
      return (
        <BoxNFT flex={1} position={"relative"} className={"redPacketNFT"}>
          <Box
            position={"absolute"}
            top={0}
            right={0}
            bottom={0}
            left={0}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <NFTMedia
              ref={ref}
              item={_info.nftTokenInfo as Partial<NFTWholeINFO>}
              shouldPlay={true}
              onNFTError={() => undefined}
              isOrigin={true}
              getIPFSString={getIPFSString}
              baseURL={baseURL}
            />
          </Box>
        </BoxNFT>
      );
    }
  }, [info?.isNft, info?.nftDta, info]);
  const amountStr = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive;
    let symbol;
    if (isShow && _info && _info.tokenAmount) {
      if (_info.isNft) {
        //@ ts-ignore
        symbol = (_info.nftTokenInfo as any)?.metadata?.base?.name ?? "NFT";
        const amount = getValuePrecisionThousand(
          _info.tokenAmount.totalAmount,
          0,
          0,
          undefined,
          false,
          {
            floor: false,
            // isTrade: true,
          }
        );
        return amount + " " + symbol;
      } else {
        const token = tokenMap[idIndex[_info?.tokenId] ?? ""];
        const symbol = token.symbol;
        const amount = getValuePrecisionThousand(
          volumeToCountAsBigNumber(
            symbol,
            _info.tokenAmount.totalAmount as any
          ),
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
    }
    return "";
  }, [info?.tokenId, info?.tokenAmount]);
  const amountClaimStr = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive & {
      claimAmount: string;
    };
    let symbol;
    if (isShow && _info && _info.claimAmount) {
      if (_info.isNft) {
        //@ ts-ignore
        symbol = (_info.nftTokenInfo as any)?.metadata?.base?.name ?? "NFT";
        const amount = getValuePrecisionThousand(
          _info.claimAmount,
          0,
          0,
          undefined,
          false,
          {
            floor: false,
            // isTrade: true,
          }
        );
        return amount + " " + symbol;
      } else {
        const token = tokenMap[idIndex[_info?.tokenId] ?? ""];
        symbol = token.symbol;
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
    }
    return "";

    // tokenMap[]
  }, [info?.tokenId, info?.claimAmount]);

  const textSendBy = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive;

    if (isShow && info && _info.validSince > Date.now()) {
      const date = moment(new Date(_info.validSince)).format(
        YEAR_DAY_SECOND_FORMAT
      );
      return t("labelLuckyRedPacketStart", {
        value: date,
      });
    } else {
      return t("labelLuckyRedPacketStarted");
    }
  }, [info?.validSince, info?.createdAt]);

  const redPacketTimeoutProps: RedPacketTimeoutProps | undefined =
    React.useMemo(() => {
      const _info = info as sdk.LuckyTokenItemForReceive;
      if (
        isShow &&
        info &&
        step === RedPacketViewStep.TimeOutPanel
        // &&
        // (_info.status === sdk.LuckyTokenItemStatus.COMPLETED ||
        //   _info.status === sdk.LuckyTokenItemStatus.OVER_DUE)
      ) {
        return {
          ImageEle,
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
            ImageEle,
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

            onOpen: callOpen,
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
        let myAmountStr: string | undefined = undefined;
        let symbol: string;
        if (_info?.claimAmount) {
          if (_info.isNft) {
            // @ts-ignore
            symbol = _info.nftTokenInfo?.metadata?.base?.name ?? "NFT";
            myAmountStr =
              getValuePrecisionThousand(
                volumeToCountAsBigNumber(symbol, _info.claimAmount as any),
                0,
                0,
                undefined,
                false,
                {
                  floor: false,
                  // isTrade: true,
                }
              ) +
              " " +
              symbol;
          } else {
            let tokenInfo = tokenMap[idIndex[_info?.tokenId] ?? ""];
            symbol = tokenInfo.symbol;
            myAmountStr =
              getValuePrecisionThousand(
                volumeToCountAsBigNumber(symbol, _info.claimAmount as any),
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
              symbol;
          }
        }
        return {
          ImageEle,
          memo: _info.info.memo,
          amountStr,
          myAmountStr,
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
        myLog("redPacketClockProps", _info);
        return {
          ImageEle,
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
  const redPacketDetailCall = React.useCallback(
    async ({
      limit = RedPacketDetailLimit,
      offset = 0,
    }: {
      limit?: number;
      offset?: number;
    }) => {
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
              accountId: account.accountId,
              hash: _info.hash,
              limit,
              offset,
              // fromId: 0,
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
            if (
              response.detail?.claimAmount?.toString() !== "0" &&
              _info?.type.scope === sdk.LuckyTokenViewType.PUBLIC
            ) {
              updateRedpacketHash({
                hash: _info?.hash,
                chainId: chainId as any,
                luckToken: _info,
                claimAmount: response.detail.claimAmount.toString(),
                address: account.accAddress,
              });
            }
            const detail = (response as any).detail;
            const luckTokenInfo: sdk.LuckyTokenItemForReceive =
              detail.luckyToken;
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
    },
    [isShow, step, info]
  );

  const redPacketQrCodeCall = React.useCallback(async () => {
    setQrcode(undefined);
    if (info?.hash && LoopringAPI.luckTokenAPI) {
      const response = await LoopringAPI.luckTokenAPI.getLuckTokenDetail(
        {
          account: account.accountId,
          hash: info.hash,
          fromId: 0,
          showHelper: true,
        } as any,
        account.apiKey
      );
      const luckTokenInfo = response.detail
        .luckyToken as sdk.LuckyTokenItemForReceive;
      setQrcode(luckTokenInfo);
    }
  }, [isShow, step, info]);
  React.useEffect(() => {
    if (isShow) {
      const info = store.getState().modals.isShowRedPacket.info;
      if (step === RedPacketViewStep.DetailPanel) {
        redPacketDetailCall({});
      } else if (step === RedPacketViewStep.QRCodePanel && info?.hash) {
        if (info?.id) {
          setQrcode(info as any);
        } else {
          redPacketQrCodeCall();
        }
      }
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
        // detail.luckyToken.type.scope === sdk.LuckyTokenViewType.PRIVATE &&
        ![
          sdk.LuckyTokenItemStatus.OVER_DUE,
          sdk.LuckyTokenItemStatus.FAILED,
          sdk.LuckyTokenItemStatus.COMPLETED,
        ].includes(detail.luckyToken.status);
      const tokenInfo = tokenMap[idIndex[detail?.tokenId] ?? ""];
      const token = tokenMap[idIndex[_info?.tokenId] ?? ""];
      let myAmountStr: string | undefined = undefined;
      const relyNumber = detail.helpers?.length;
      const value =
        detail.helpers?.reduce((prev, item) => {
          // @ts-ignore
          return prev.plus(item.amount);
        }, sdk.toBig(0)) ?? 0;
      let relyAmount: string | undefined = undefined;
      if (detail.claimAmount.toString() !== "0") {
        if (_info.isNft) {
          // @ts-ignore
          const symbol = _info.nftTokenInfo?.metadata?.base?.name ?? "NFT";
          myAmountStr =
            getValuePrecisionThousand(
              _info.claimAmount,
              0,
              0,
              undefined,
              false,
              {
                floor: false,
                // isTrade: true,
              }
            ) +
            " " +
            symbol;
          relyAmount = getValuePrecisionThousand(
            value,
            0,
            0,
            undefined,
            false,
            {
              floor: false,
              // isTrade: true,
            }
          );
        } else {
          let tokenInfo = tokenMap[idIndex[_info?.tokenId] ?? ""];
          const symbol = tokenInfo.symbol;
          myAmountStr =
            getValuePrecisionThousand(
              volumeToCountAsBigNumber(symbol, _info.claimAmount as any),
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
            symbol;
          relyAmount = getValuePrecisionThousand(
            volumeToCountAsBigNumber(symbol, value),
            token.precision,
            token.precision,
            undefined,
            false,
            {
              floor: false,
              // isTrade: true,
            }
          );
        }
      }

      const { list } = getUserReceiveList(
        detail.claims as any,
        tokenInfo,
        detail.champion
      );
      return {
        ImageEle,
        totalCount: detail.luckyToken.tokenAmount.totalCount,
        remainCount: detail.luckyToken.tokenAmount.remainCount,
        memo: _info.info.memo,
        amountStr,
        amountClaimStr,
        sender: _info.sender?.ens
          ? _info.sender?.ens
          : getShortAddr(_info.sender?.address),
        claimList: list,
        detail,
        myAmountStr,
        relyAmount: relyAmount ? relyAmount?.toString() : undefined,
        relyNumber: relyNumber ? relyNumber?.toString() : undefined,
        isShouldSharedRely,
        handlePageChange: (page: number = 1) => {
          redPacketDetailCall({ offset: page - 1 });
        },
        onShared: () => {
          setShowRedPacket({
            isShow: true,
            step: RedPacketViewStep.QRCodePanel,
            info: {
              ...detail.luckyToken,
              referrer: account.accountId,
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
  const redPacketQRCodeProps: RedPacketQRCodeProps | undefined =
    React.useMemo(() => {
      if (
        isShow &&
        info &&
        step === RedPacketViewStep.QRCodePanel &&
        qrcode &&
        qrcode.hash
      ) {
        if (
          qrcode.status === sdk.LuckyTokenItemStatus.COMPLETED ||
          qrcode.status === sdk.LuckyTokenItemStatus.OVER_DUE
        ) {
          setShowRedPacket({
            isShow,
            step: RedPacketViewStep.TimeOutPanel,
            info: qrcode,
          });
        } else if (qrcode?.hash) {
          const url = `${Exchange}wallet?redpacket&id=${qrcode?.hash}&referrer=${account.accAddress}`;
          return {
            url,
            ImageEle,
            textAddress: qrcode.sender?.ens
              ? qrcode.sender?.ens
              : getShortAddr(qrcode.sender?.address),
            textContent: qrcode.info.memo,
            amountStr,
            textSendBy,
            textType:
              qrcode.type.mode == sdk.LuckyTokenClaimType.RELAY
                ? t("labelRelayRedPacket")
                : t("labelLuckyRedPacket"),
            textShared: t("labelShare"),
            textDes: t("labelRedpacketScanDes"),
            isShouldSharedRely:
              qrcode.type.mode == sdk.LuckyTokenClaimType.RELAY,
            // @ts-ignore
            textNo: t("labelRedPacketNo", { value: qrcode?.id?.toString() }),
          } as RedPacketQRCodeProps;
        }
      }
      return undefined;
    }, [info, qrcode, account.accAddress, isShow, textSendBy, amountStr, step]);
  return {
    redPacketQRCodeProps,
    redPacketTimeoutProps,
    redPacketOpenProps,
    redPacketOpenedProps,
    redPacketDetailProps,
    redPacketClockProps,
  };
}
