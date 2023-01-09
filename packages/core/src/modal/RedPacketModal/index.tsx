import { WithTranslation, withTranslation } from "react-i18next";
import {
  ModalRedPacket,
  RedPacketQRCode,
  RedPacketViewStep,
  useOpenModals,
} from "@loopring-web/component-lib";
import React from "react";
import { useRedPacketModal } from "./hook";

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
    const { redPacketQRCodeProps } = useRedPacketModal();

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
        [RedPacketViewStep.OpenPanel]: { view: <></> },
        [RedPacketViewStep.OpenedPanel]: { view: <></> },
        [RedPacketViewStep.DetailPanel]: { view: <></> },
        [RedPacketViewStep.TimeOutPanel]: { view: <></> },
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
