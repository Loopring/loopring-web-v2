import { WithTranslation, withTranslation } from "react-i18next";
import { Box, Modal } from "@mui/material";
import {
  ModalBackButton,
  ModalCloseButton,
  ModalWalletConnectProps,
  SwipeableViewsStyled,
  SwitchPanelStyled,
} from "../../../index";
import { useTheme } from "@emotion/react";

export const ModalWalletConnect = withTranslation("common", { withRef: true })(
  ({
    // t,
    open,
    onClose,
    step,
    onBack,
    panelList,
    style,
    ...rest
  }: ModalWalletConnectProps & WithTranslation) => {
    const theme = useTheme();
    const { w, h } = style ? style : { w: undefined, h: undefined };

    return (
      <Modal
        open={open}
        onClose={onClose}
        disableEnforceFocus
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <SwitchPanelStyled
          style={{ boxShadow: "24" }}
          {...{
            _height: h ? h : "var(--modal-height)",
            _width: w ? w : "var(--modal-width)",
          }}
        >
          <Box display={"flex"} width={"100%"} flexDirection={"column"}>
            <ModalCloseButton onClose={onClose} {...rest} />
            {onBack ? <ModalBackButton onBack={onBack} {...rest} /> : <></>}
          </Box>
          <SwipeableViewsStyled
            animateTransitions={false}
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={step}
            {...{
              _height: h ? h : "var(--modal-height)",
              _width: w ? w : "var(--modal-width)",
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
                  alignItems={"stretch"}
                >
                  {panel.view}
                </Box>
              );
            })}
          </SwipeableViewsStyled>
        </SwitchPanelStyled>
      </Modal>
    );
  }
);
