import { WithTranslation, withTranslation } from "react-i18next";
import {
  ModalRedPacket,
  RedPacketOpen,
  RedPacketQRCode,
  RedPacketSize,
  RedPacketTimeout,
  RedPacketViewStep,
  useOpenModals,
} from "@loopring-web/component-lib";
import React from "react";
import { useRedPacketModal } from "./hook";
import { myLog } from "@loopring-web/common-resources";
import { Box } from "@mui/material";

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
      myLog(redPacketOpenProps);
      return Object.values({
        [RedPacketViewStep.QRCodePanel]: {
          view: redPacketQRCodeProps ? (
            <Box height={603 + 64}>
              <RedPacketQRCode {...redPacketQRCodeProps} />
            </Box>
          ) : (
            <></>
          ),
        },
        [RedPacketViewStep.OpenPanel]: {
          view: redPacketOpenProps ? (
            <Box
              height={RedPacketSize.large.height + 64}
              width={RedPacketSize.large.width}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <RedPacketOpen size={"large"} {...redPacketOpenProps} />
            </Box>
          ) : (
            <></>
          ),
        },
        [RedPacketViewStep.OpenedPanel]: { view: <></> },
        [RedPacketViewStep.DetailPanel]: { view: <></> },
        [RedPacketViewStep.TimeOutPanel]: {
          view: redPacketTimeoutProps ? (
            <Box
              height={RedPacketSize.large.height + 64}
              width={RedPacketSize.large.width}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <RedPacketTimeout
                size={"large"}
                {...{ ...redPacketTimeoutProps }}
              />
            </Box>
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
