import { WithTranslation, withTranslation } from "react-i18next";
import { Modal } from "@mui/material";
import { Box } from "@mui/material";
import {
  ModalAccountProps,
  ModalBackButton,
  ModalCloseButton,
  QRButtonStyle,
  SwitchPanelStyled,
} from "../../../index";

export const ModalAccount = withTranslation("common", { withRef: true })(
  ({
    open,
    onClose,
    step,
    isLayer2Only = false,
    onBack,
    style,
    noClose,
    onQRClick,
    panelList,
    ...rest
  }: ModalAccountProps & WithTranslation) => {
    const { w, h } = style ? style : { w: undefined, h: undefined };

    return (
      <Modal
        open={open}
        onClose={onClose}
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
            {noClose ? <></> : <ModalCloseButton onClose={onClose} {...rest} />}
            {onBack ? <ModalBackButton onBack={onBack} {...rest} /> : <></>}
            {onQRClick ? (
              <QRButtonStyle onQRClick={onQRClick} {...rest} />
            ) : (
              <></>
            )}
          </Box>
          {panelList.map((panel, index) => {
            return (
              <Box
                display={step === index ? "flex" : "none"}
                alignItems={"stretch"}
                height={panel.height ? panel.height : "var(--modal-height)"}
                width={panel.width ? panel.width : "var(--modal-width)"}
                key={index}
              >
                {panel.view}
              </Box>
            );
          })}

          {/*<SwipeableViewsStyled*/}
          {/*  animateTransitions={false}*/}
          {/*  axis={theme.direction === "rtl" ? "x-reverse" : "x"}*/}
          {/*  index={step}*/}
          {/*  {...{*/}
          {/*    _height: h ? h : "var(--modal-height)",*/}
          {/*    _width: w ? w : "var(--modal-width)",*/}
          {/*  }}*/}
          {/*>*/}
          {/*  */}
          {/*</SwipeableViewsStyled>*/}
        </SwitchPanelStyled>
      </Modal>
    );
  }
);
