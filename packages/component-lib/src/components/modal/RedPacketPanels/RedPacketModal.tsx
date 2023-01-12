import { WithTranslation, withTranslation } from "react-i18next";
import { Modal } from "@mui/material";
import {
  ModalBackButton,
  ModalCloseButton,
  ModalRedPacketProps,
} from "../../../index";
import { Box } from "@mui/material";
import SwipeableViews from "react-swipeable-views";
import {
  CloseRedPacketIcon,
  HEADER_HEIGHT,
} from "@loopring-web/common-resources";
import styled from "@emotion/styled";

const BoxStyle = styled(Box)`
  .redPacketClose {
    svg {
      height: var(--btn-icon-size);
      width: var(--btn-icon-size);
    }

    transform: translateY(-50%) translateX(-50%);
    left: 50%;
    bottom: ${({ theme }) => theme.unit}px;
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
          height={`calc(100vh - ${HEADER_HEIGHT}px)`}
          position={"absolute"}
          overflow={"scroll"}
          display={"flex"}
          top="50%"
          left="50%"
          sx={{
            transform: "translateY(-50%) translateX(-50%)",
          }}
        >
          <ModalCloseButton
            closeIcon={<CloseRedPacketIcon />}
            onClose={onClose}
            className={"redPacketClose"}
            {...rest}
          />
          {onBack ? <ModalBackButton onBack={onBack} {...rest} /> : <></>}
          <SwipeableViews style={{ boxShadow: "24" }}>
            {panelList.map((panel, index) => {
              return (
                <Box
                  flexDirection={"column"}
                  flex={1}
                  display={"flex"}
                  key={index}
                  justifyContent={"center"}
                  alignItems={"stretch"}
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
