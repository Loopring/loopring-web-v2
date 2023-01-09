/* eslint-disable react/jsx-pascal-case */

import {
  RedPacketQRCodeProps,
  RedPacketViewStep,
  useOpenModals,
} from "@loopring-web/component-lib";
import React from "react";
import {
  Exchange,
  getShortAddr,
  getValuePrecisionThousand,
  YEAR_DAY_MINUTE_FORMAT,
} from "@loopring-web/common-resources";
import { useAccount, useTokenMap } from "../../stores";
import { volumeToCountAsBigNumber } from "../../hooks";
import { useTranslation } from "react-i18next";
import moment from "moment";
import * as sdk from "@loopring-web/loopring-sdk";

export function useRedPacketModal() {
  const {
    modals: {
      // isShowNFTDetail,
      isShowRedPacket: {info, isShow, step},
    },
    setShowRedPacket,
  } = useOpenModals();
  const {account} = useAccount();
  const {tokenMap, idIndex} = useTokenMap();
  const {t} = useTranslation("common");
  // React.useEffect(() => {
  //
  // }, [info.]);
  const amountStr = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive;
    const token = tokenMap[ idIndex[ _info.tokenId ] ?? "" ];
    if (token && _info.tokenAmount) {
      const symbol = token.symbol;
      const amount = getValuePrecisionThousand(
        volumeToCountAsBigNumber(symbol, _info.tokenAmount as any),
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
  const textSendBy = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive;
    if (_info.validSince > _info.createdAt) {
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
      // new Date(info.validSince)
      const _info = info as sdk.LuckyTokenItemForReceive;
      if (isShow && _info.status === sdk.LuckyTokenItemStatus.COMPLETED ||
        _info.status === sdk.LuckyTokenItemStatus.OVER_DUE) {
        setShowRedPacket({isShow,})
      } else (isShow && _info?.hash && step === RedPacketViewStep.QRCodePanel &&)
      {
        const url = `${Exchange}/wallet?redpacket&id=${info?.hash}&referrer=${account.accAddress}`;
        return {
          url,
          textAddress: _info.sender?.ens ?? getShortAddr(_info.sender?.address),
          textContent: _info.info.memo,
          amountStr,
          textSendBy,
          textType:
            _info.type.mode == sdk.LuckyTokenClaimType.RELAY
              ? t("labelRelayRedPacket")
              : t("labelLuckyRedPacket"),
          textShared: t("labelShare"),
          textNo: _info.templateNo?.toString(),
        } as RedPacketQRCodeProps;
      }
    else
      {
        return undefined;
      }
    }, [info, account.accAddress, isShow, textSendBy, amountStr]);
  return {
    redPacketQRCodeProps,
  };
}
