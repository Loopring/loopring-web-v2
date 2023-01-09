import { WithTranslation, withTranslation } from "react-i18next";
import {
  ModalRedPacket,
  RedPacketOpen,
  RedPacketQRCode,
  RedPacketTimeout,
  RedPacketViewStep,
  useOpenModals,
} from "@loopring-web/component-lib";
import React from "react";
import { useRedPacketDetail, useRedPacketModal } from "./hook";

export const ModalRedPacketPanel = withTranslation("common")(
  ({
    t,
    etherscanBaseUrl,
    ..._rest
  }: WithTranslation & {
    etherscanBaseUrl: string;
  }) => {
    const {
      modals: {
        // isShowNFTDetail,
        isShowRedPacket,
      },
      setShowRedPacket,
    } = useOpenModals();
    const { redPacketQRCodeProps, redPacketTimeoutProps, redPacketOpenProps } =
      useRedPacketModal();
    // const { redPacketProps } = useRedPacketDetail();
    // const theme = useTheme();
    const redPacketList = React.useMemo(() => {
      return Object.values({
        [RedPacketViewStep.QRCodePanel]: {
          view: redPacketQRCodeProps ? (
            <RedPacketQRCode {...redPacketQRCodeProps} />
          ) : (
            <></>
          ),
        },
        [RedPacketViewStep.OpenPanel]: {
          view: redPacketOpenProps ? (
            <RedPacketOpen {...redPacketOpenProps} />
          ) : (
            <></>
          ),
        },
        [RedPacketViewStep.OpenedPanel]: { view: <></> },
        [RedPacketViewStep.DetailPanel]: { view: <></> },
        [RedPacketViewStep.TimeOutPanel]: {
          view: redPacketTimeoutProps ? (
            <RedPacketTimeout
              size={"large"}
              {...{ ...redPacketTimeoutProps }}
            />
          ) : (
            <></>
          ),
        },
        [RedPacketViewStep.PreparePanel]: { view: <></> },
      });
    }, []);
    return (
      <ModalRedPacket
        onClose={() => {
          setShowRedPacket({ isShow: false });
        }}
        etherscanBaseUrl={etherscanBaseUrl}
        step={isShowRedPacket.step}
        open={isShowRedPacket.isShow}
        panelList={redPacketList}
      />
    );
  }
);
