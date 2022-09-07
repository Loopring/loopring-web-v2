import { WithTranslation, withTranslation } from "react-i18next";
import {
  boxLiner,
  CoinIcons,
  DualWrap,
  ModalBackButton,
  ModalCloseButton,
  SwitchPanelStyled,
  Toast,
  // TradeTitle,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import { TOAST_TIME } from "@loopring-web/common-resources";
import { Box, Modal as MuiModal, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { useDualTrade } from "../../index";

import { useTheme } from "@emotion/react";

// background: var(--color-box);
// border-radius: ${({ theme }) => theme.unit}px;
// padding: ${({ theme }) => theme.unit * 2}px;
// width: var(--swap-box-width);
// box-sizing: border-box;
// const BoxStyle = styled(Box)`
//   .rdg {
//     background: var(--color-box);
//     border-bottom-left-radius: ${({ theme }) => theme.unit}px;
//     border-bottom-right-radius: ${({ theme }) => theme.unit}px;
//   }
// `;
const BoxLinear = styled(SwitchPanelStyled)`
  && {
    ${({ theme }) => boxLiner({ theme })};

    .trade-panel {
      background: initial;

      .react-swipeable-view-container > div {
        height: initial;
      }
    }

    @media only screen and (max-height: 680px) {
      height: 100vh;
      overflow: scroll;
    }
    @media only screen and (max-width: 768px) {
      height: 86%;
      overflow: scroll;
    }
  }
`;

export const ModalDualPanel = withTranslation("common")(
  ({ t, ...rest }: WithTranslation) => {
    const {
      modals: {
        isShowDual: { isShow, dualInfo },
      },
      setShowAmm,
    } = useOpenModals();
    const {
      dualToastOpen,
      // setDualTostOpen,
      closeDualToast,
      dualTradeProps,
    } = useDualTrade();
    const { isMobile, coinJson } = useSettings();
    // const theme = useTheme();

    return (
      <MuiModal
        // open={true}
        open={isShow}
        onClose={() => {
          setShowAmm({ isShow: false });
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <BoxLinear
          width={"80%"}
          minWidth={isMobile ? "initial" : 720}
          maxWidth={isMobile ? "initial" : 1000}
          position={"relative"}
          style={{ alignItems: "stretch" }}
        >
          <Box
            display={"flex"}
            width={"100%"}
            flexDirection={"row"}
            justifyContent={"space-between"}
          >
            <Box
              component={"h3"}
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
            >
              {dualInfo?.productId && (
                <>
                  <Typography component={"span"} display={"inline-flex"}>
                    {/* eslint-disable-next-line react/jsx-no-undef */}
                    <CoinIcons
                      type={"dual"}
                      size={32}
                      tokenIcon={[
                        coinJson[dualInfo.sellSymbol],
                        coinJson[dualInfo.buySymbol],
                      ]}
                    />
                  </Typography>
                  <Typography
                    component={"span"}
                    flexDirection={"column"}
                    display={"flex"}
                  >
                    <Typography
                      component={"span"}
                      display={"inline-flex"}
                      color={"textPrimary"}
                    >
                      {t("labelDualInvestTitle", {
                        symbolA: dualInfo.sellSymbol,
                        symbolB: dualInfo.buySymbol,
                      })}
                    </Typography>
                  </Typography>{" "}
                </>
              )}
            </Box>
            <ModalCloseButton
              onClose={() => {
                setShowAmm({ isShow: false });
              }}
              t={t}
              {...rest}
            />
          </Box>

          <Box
            flex={1}
            flexDirection={!isMobile ? "row" : "column"}
            alignItems={!isMobile ? "flex-start" : "center"}
            position={"relative"}
            display={"flex"}
          >
            <DualWrap {...{ ...rest, ...dualTradeProps }} />
          </Box>
          <Toast
            alertText={dualToastOpen?.content ?? ""}
            severity={dualToastOpen?.type ?? "success"}
            open={dualToastOpen?.open ?? false}
            autoHideDuration={TOAST_TIME}
            onClose={closeDualToast}
          />
        </BoxLinear>
      </MuiModal>
    );
  }
);
