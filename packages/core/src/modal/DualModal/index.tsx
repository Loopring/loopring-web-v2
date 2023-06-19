import { WithTranslation, withTranslation } from "react-i18next";
import {
  boxLiner,
  CoinIcons,
  CountDownIcon,
  DualWrap,
  DualWrapProps,
  ModalCloseButton,
  SwitchPanelStyled,
  Toast,
  TOASTOPEN,
  ToastType,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import { Box, Divider, Modal as MuiModal, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { myLog, TOAST_TIME, TokenType } from "@loopring-web/common-resources";
import { DUAL_TYPE } from "@loopring-web/loopring-sdk";

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
  ({
    t,
    dualTradeProps,
    dualToastOpen,
    closeDualToast,
    isBeginnerMode,
    ...rest
  }: WithTranslation & {
    dualTradeProps: DualWrapProps<any, any, any>;
    dualToastOpen?: TOASTOPEN;
    closeDualToast?: (state: boolean) => void;
    isBeginnerMode: boolean;
  }) => {
    const {
      modals: { isShowDual },
      setShowDual,
    } = useOpenModals();
    const { isShow, dualInfo } = isShowDual ?? {};
    myLog("isShowDual", isShowDual);
    const { isMobile, coinJson } = useSettings();
    // const theme = useTheme();

    return (
      <MuiModal
        // open={true}
        open={isShow}
        onClose={() => {
          setShowDual({ isShow: false, dualInfo: undefined });
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <BoxLinear
          width={isMobile ? "90%" : "var(--modal-width)"}
          height={isMobile ? "auto" : "inherit"}
          // width={"80%"}
          // minWidth={isMobile ? "initial" : 720}
          // maxWidth={isMobile ? "initial" : 1000}
          position={"relative"}
          style={{ alignItems: "stretch" }}
        >
          <ModalCloseButton
            onClose={() => {
              setShowDual({ isShow: false, dualInfo: undefined });
            }}
            t={t}
            {...rest}
          />
          <Box
            width={"100%"}
            display={"flex"}
            position={"relative"}
            marginTop={"var(--toolbar-row-padding-minus)"}
            height={"var(--toolbar-row-height)"}
            paddingX={3}
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
                      type={TokenType.dual}
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
                      {t(
                        dualInfo.__raw__.info.dualType === DUAL_TYPE.DUAL_BASE
                          ? "labelDualInvestBaseTitle"
                          : "labelDualInvestQuoteTitle",
                        {
                          symbolA: dualInfo.sellSymbol,
                          symbolB: dualInfo.buySymbol,
                        }
                      )}
                    </Typography>
                  </Typography>
                </>
              )}
            </Box>
            <Box alignSelf={"flex-end"} sx={{ display: "none" }}>
              {/*sx={{ display: "none" }}*/}
              <CountDownIcon
                onRefreshData={dualTradeProps.onRefreshData}
                ref={dualTradeProps.refreshRef}
              />
            </Box>
          </Box>
          <Divider sx={{ marginX: 2 }} />
          <Box
            flex={1}
            // flexDirection={!isMobile ? "row" : "column"}
            alignItems={!isMobile ? "flex-start" : "center"}
            position={"relative"}
            display={"flex"}
            paddingTop={2}
            paddingBottom={3}
            paddingX={1}
          >
            <DualWrap
              isBeginnerMode={isBeginnerMode}
              {...{ ...rest, ...dualTradeProps }}
            />
          </Box>
          <Toast
            alertText={dualToastOpen?.content ?? ""}
            severity={dualToastOpen?.type ?? ToastType.success}
            open={dualToastOpen?.open ?? false}
            autoHideDuration={TOAST_TIME}
            onClose={() => {
              if (closeDualToast) {
                closeDualToast(false);
              }
            }}
          />
        </BoxLinear>
      </MuiModal>
    );
  }
);
