import { WithTranslation, withTranslation } from "react-i18next";
import { Box, Modal } from "@mui/material";
import {
  ModalBackButton,
  ModalCloseButton,
  ModalRedPacketProps,
  RedPacketViewStep,
} from "../../../index";
import SwipeableViews from "react-swipeable-views";
import { CloseRedPacketIcon } from "@loopring-web/common-resources";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { isEmpty } from "lodash";

const BoxStyle = styled(Box)`
  .redPacketClose {
    svg {
      height: var(--btn-icon-size);
      width: var(--btn-icon-size);
    }

    //transform: translateY(-50%) translateX(-50%);
    //left: 50%;
    top: ${({ theme }) => 3.5 * theme.unit}px;
    right: ${({ theme }) => 16 * theme.unit}px;
  }
`;

export const ModalRedPacket = withTranslation("common", { withRef: true })(
  ({
    // t,
    open,
    onClose,
    step,
    onBack,
    panelList,
    style,
    ...rest
  }: ModalRedPacketProps & WithTranslation) => {
    const theme = useTheme();
    // console.log('isEmpty(panelList[step].view.props', isEmpty(panelList[step].view.props))
    // console.log('isEmpty(panelList[step].view.props', panelList[step].view.props)

    return (
      <Modal
        open={open}
        onClose={onClose}
        disableEnforceFocus
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <BoxStyle
          // width={"100%"}
          // height={`calc(100vh - ${HEADER_HEIGHT}px)`}
          position={"absolute"}
          overflow={"scroll"}
          display={"flex"}
          top="50%"
          left="50%"
          sx={{
            transform: "translateY(-50%) translateX(-50%)",
          }}
        >
          {/* hide close button if view redpacket view not rendered */}
          {step !== RedPacketViewStep.Loading &&
            !isEmpty(panelList[step].view.props) && (
              <ModalCloseButton
                closeIcon={
                  <CloseRedPacketIcon htmlColor={"var(--color-text-button)"} />
                }
                onClose={onClose}
                className={"redPacketClose"}
                {...rest}
              />
            )}
          {onBack ? <ModalBackButton onBack={onBack} {...rest} /> : <></>}
          <SwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={step}
            style={{
              boxShadow: "24",
              marginTop: 4 * theme.unit,
              marginLeft: 4 * theme.unit,
              marginRight: 4 * theme.unit,
            }}
          >
            {panelList.map((panel, index) => {
              return (
                <Box
                  flexDirection={"column"}
                  flex={1}
                  display={"flex"}
                  key={index}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  {panel.view}
                </Box>
              );
            })}
          </SwipeableViews>
        </BoxStyle>
      </Modal>
    );
  }
);
