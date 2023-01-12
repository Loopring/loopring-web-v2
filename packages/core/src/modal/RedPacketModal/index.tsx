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
import { useRedPacketModal } from "./hook";
import { myLog } from "@loopring-web/common-resources";

export const ModalRedPacketPanel = withTranslation("common")(
  ({
    etherscanBaseUrl,
  }: WithTranslation & {
    etherscanBaseUrl: string;
  }) => {
    const {
      modals: { isShowRedPacket },
      setShowRedPacket,
    } = useOpenModals();
    const { redPacketQRCodeProps, redPacketTimeoutProps, redPacketOpenProps } =
      useRedPacketModal();
    // const { redPacketProps } = useRedPacketDetail();
    // const theme = useTheme();
    const redPacketList = React.useMemo(() => {
      myLog(redPacketQRCodeProps);
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
    }, [redPacketQRCodeProps, redPacketTimeoutProps, redPacketOpenProps]);
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
