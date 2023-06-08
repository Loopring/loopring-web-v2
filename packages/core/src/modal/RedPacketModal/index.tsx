import { WithTranslation, withTranslation } from "react-i18next";
import {
  ModalRedPacket,
  RedPacketBlindBoxDetail,
  RedPacketClock,
  RedPacketDetail,
  RedPacketOpen,
  RedPacketOpened,
  RedPacketQRCode,
  RedPacketSize,
  RedPacketTimeout,
  RedPacketViewStep,
  useOpenModals,
} from "@loopring-web/component-lib";
import React from "react";
import { useRedPacketModal } from "./hook";
import { myLog, SoursURL } from "@loopring-web/common-resources";
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
    const {
      redPacketQRCodeProps,
      redPacketTimeoutProps,
      redPacketOpenProps,
      redPacketOpenedProps,
      redPacketDetailProps,
      redPacketClockProps,
      redPacketBlindBoxDetailProps,
    } = useRedPacketModal();
    // const { redPacketProps } = useRedPacketDetail();
    // const theme = useTheme();
    const redPacketList = React.useMemo(() => {
      myLog(redPacketOpenProps);
      return Object.values({
        [RedPacketViewStep.QRCodePanel]: {
          view: redPacketQRCodeProps ? (
            <Box
              height={603}
              display={"flex"}
              justifyContent={"start"}
              alignItems={"start"}
            >
              <Box flex={1}>
                <RedPacketQRCode {...redPacketQRCodeProps} />
              </Box>
            </Box>
          ) : (
            <></>
          ),
        },
        [RedPacketViewStep.OpenPanel]: {
          view: redPacketOpenProps ? (
            <Box
              height={RedPacketSize.large.height}
              width={RedPacketSize.large.width}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Box flex={1}>
                <RedPacketOpen size={"large"} {...redPacketOpenProps} />
              </Box>
            </Box>
          ) : (
            <></>
          ),
        },
        [RedPacketViewStep.RedPacketClock]: {
          view: redPacketClockProps ? (
            <Box
              height={RedPacketSize.large.height}
              width={RedPacketSize.large.width}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Box flex={1}>
                <RedPacketClock size={"large"} {...redPacketClockProps} />
              </Box>
            </Box>
          ) : (
            <></>
          ),
        },
        [RedPacketViewStep.OpenedPanel]: {
          view: redPacketOpenedProps ? (
            <Box
              height={RedPacketSize.large.height}
              width={RedPacketSize.large.width}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Box flex={1}>
                <RedPacketOpened size={"large"} {...redPacketOpenedProps} />
              </Box>
            </Box>
          ) : (
            <></>
          ),
        },
        [RedPacketViewStep.TimeOutPanel]: {
          view: redPacketTimeoutProps ? (
            <Box
              height={RedPacketSize.large.height}
              width={RedPacketSize.large.width}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Box flex={1}>
                <RedPacketTimeout size={"large"} {...redPacketTimeoutProps} />
              </Box>
            </Box>
          ) : (
            <></>
          ),
        },
        [RedPacketViewStep.DetailPanel]: {
          view: redPacketDetailProps ? (
            <Box
              minHeight={RedPacketSize.large.height}
              height={"80vh"}
              width={RedPacketSize.large.width}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"start"}
            >
              <RedPacketDetail {...redPacketDetailProps} />
            </Box>
          ) : (
            <></>
          ),
        },

        [RedPacketViewStep.PreparePanel]: { view: <></> },
        [RedPacketViewStep.BlindBoxDetail]: {
          view: redPacketBlindBoxDetailProps ? (
            <Box
              minHeight={RedPacketSize.large.height}
              height={"80vh"}
              width={RedPacketSize.large.width}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"start"}
            >
              <RedPacketBlindBoxDetail {...redPacketBlindBoxDetailProps} />
            </Box>
          ) : (
            <></>
          ),
        },
        [RedPacketViewStep.Loading]: {
          view: (
            <Box
              minHeight={RedPacketSize.large.height}
              height={"80vh"}
              width={RedPacketSize.large.width}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <img
                className="loading-gif"
                alt={"loading"}
                width="36"
                src={`${SoursURL}images/loading-line.gif`}
              />
            </Box>
          ),
        },
      });
    }, [
      redPacketQRCodeProps,
      redPacketOpenProps,
      redPacketDetailProps,
      redPacketTimeoutProps,
      redPacketOpenedProps,
      redPacketClockProps,
      redPacketBlindBoxDetailProps,
    ]);
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
