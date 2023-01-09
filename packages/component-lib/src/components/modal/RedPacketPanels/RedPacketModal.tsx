import { WithTranslation, withTranslation } from "react-i18next";
import { Modal } from "@mui/material";
import {
  ModalBackButton,
  ModalCloseButton,
  ModalRedPacketProps,
} from "../../../index";
import { Box } from "@mui/material";
import SwipeableViews from "react-swipeable-views";
import { HEADER_HEIGHT } from "@loopring-web/common-resources";

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
        <Box
          width={"100%"}
          height={`calc(100vh - ${HEADER_HEIGHT}px)`}
          position={"relative"}
          overflow={"scroll"}
        >
          <ModalCloseButton onClose={onClose} {...rest} />
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
        </Box>
      </Modal>
    );
  }
);
