import styled from "@emotion/styled";
import {
  Box,
  BoxProps,
  Button,
  Card,
  Grid,
  ListItemProps,
  Modal as MuiModal,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  DepositNFTWrap,
  EmptyDefault,
  MintNFTWrap,
  ModalCloseButton,
  NftImage,
  PanelContent,
  SwitchPanelStyled,
} from "@loopring-web/component-lib";
import { useMyNFT } from "./hook";
import { NFTDetail } from "./components/detail";
import {
  ACTIVITY,
  ACTIVITY_TYPE,
  EmptyValueTag,
  getShortAddr,
  hexToRGB,
  IPFS_META_URL,
  LoadingIcon,
  RefreshIcon,
} from "@loopring-web/common-resources";
import { LOOPRING_URLs } from "@loopring-web/loopring-sdk";
import { css, Theme, useTheme } from "@emotion/react";
import { HistoryNFT } from "./components/history";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;
const cssBackground = ({ theme }: { theme: Theme }) => {
  const fillColor = theme.colorBase.textDisable.replace("#", "%23");
  const svg = encodeURI(
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg">
<g opacity="0.09">
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.59635 7.47796L12.0594 2.80892L20.5971 7.47796V16.522L12.0642 21.1885L3.59635 16.3878V7.47796ZM12.0504 1L22.1799 6.53957V12V17.4604L12.0504 23L2 17.3022V6.53957L12.0504 1ZM10.3283 15.3263C10.3283 15.5885 10.1157 15.8011 9.85346 15.8011H9.08297C8.897 15.8011 8.72815 15.6925 8.65097 15.5233L6.27116 10.3061C6.26803 10.2992 6.26117 10.2948 6.25362 10.2948C6.24273 10.2948 6.234 10.3038 6.23434 10.3147C6.23951 10.4782 6.24469 10.645 6.24986 10.8148C6.25525 10.9848 6.26063 11.1581 6.26602 11.3349C6.27678 11.5048 6.28486 11.6782 6.29024 11.8549C6.29563 12.0248 6.30101 12.1982 6.3064 12.3749V15.3263C6.3064 15.5885 6.09381 15.8011 5.83158 15.8011H5.69095C5.42871 15.8011 5.21613 15.5885 5.21613 15.3263V8.99534C5.21613 8.7331 5.42871 8.52052 5.69095 8.52052H6.45413C6.6397 8.52052 6.80827 8.62863 6.88567 8.79729L9.25836 13.9674C9.26072 13.9726 9.26586 13.9759 9.27152 13.9759C9.2797 13.9759 9.28625 13.9691 9.28599 13.9609C9.28076 13.7961 9.27554 13.6346 9.27031 13.4762C9.26493 13.3063 9.25954 13.1397 9.25416 12.9766C9.25416 12.8066 9.25147 12.6401 9.24608 12.4769L9.22993 11.9671V8.99534C9.22993 8.7331 9.44252 8.52052 9.70475 8.52052H9.85346C10.1157 8.52052 10.3283 8.7331 10.3283 8.99534V15.3263ZM12.2987 15.3263C12.2987 15.5885 12.0861 15.8011 11.8238 15.8011H11.5701C11.3079 15.8011 11.0953 15.5885 11.0953 15.3263V8.99534C11.0953 8.7331 11.3079 8.52052 11.5701 8.52052H13.9236C14.1858 8.52052 14.3984 8.7331 14.3984 8.99534V9.31011C14.3984 9.57235 14.1858 9.78493 13.9236 9.78493H12.7735C12.5112 9.78493 12.2987 9.99752 12.2987 10.2598V11.1863C12.2987 11.4486 12.5112 11.6612 12.7735 11.6612H13.7782C14.0405 11.6612 14.2531 11.8737 14.2531 12.136V12.4508C14.2531 12.713 14.0405 12.9256 13.7782 12.9256H12.7735C12.5112 12.9256 12.2987 13.1382 12.2987 13.4004V15.3263ZM17.4192 15.8011C17.6814 15.8011 17.894 15.5885 17.894 15.3263V10.2801C17.894 10.0179 18.1066 9.80532 18.3688 9.80532H18.9859C19.2481 9.80532 19.4607 9.59274 19.4607 9.3305V8.99534C19.4607 8.7331 19.2481 8.52052 18.9859 8.52052H15.5826C15.3203 8.52052 15.1077 8.7331 15.1077 8.99534V9.3305C15.1077 9.59274 15.3203 9.80532 15.5826 9.80532H16.1997C16.4619 9.80532 16.6745 10.0179 16.6745 10.2801V12.8032V15.3263C16.6745 15.5885 16.8871 15.8011 17.1493 15.8011H17.4192Z"/>
</g>
</svg>`
  );

  return css`
    background-color: var(--field-opacity);
    background-image: url("data:image/svg+xml, ${svg}");
    background-repeat: no-repeat;
    background-clip: content-box;
    background-size: contain;
    backgroundpositionx: 100%;
  `;
};

const BoxStyle = styled(Box)<BoxProps & { theme: Theme }>`
  ${(props) => cssBackground(props)}
` as (prosp: BoxProps & { theme: Theme }) => JSX.Element;

const CardStyle = styled(Card)`
  background: var(--color-global-bg);
  width: 100%;
  cursor: pointer;
  height: 0;
  padding: 0;
  padding-bottom: calc(100% + 80px);
  position: relative;

  img {
    object-fit: contain;
  }
` as typeof Card;
const enum TabKey {
  ASSETS,
  TRANSACTION,
}

export const MyNFTPanel = withTranslation("common")(
  ({ t, ...rest }: WithTranslation) => {
    const theme = useTheme();
    const {
      popItem,
      onDetail,
      onDetailClose,
      isShow,
      nftList,
      isShowNFTDeposit,
      isShowNFTMint,
      onNFTDepositClose,
      onNFTMintClose,
      popNFTDeposit,
      popNFTMint,
      nftDepositProps,
      nftMintProps,
      etherscanBaseUrl,
      nftLayer2,
      onNFTError,
      onNFTReload,
    } = useMyNFT();
    const [currentTab, setCurrentTab] = React.useState<TabKey>(TabKey.ASSETS);
    const handleTabChange = React.useCallback((value) => {
      setCurrentTab(value);
    }, []);
    const modalContent = React.useMemo(() => {
      return (
        popItem && (
          <NFTDetail
            etherscanBaseUrl={etherscanBaseUrl}
            onDetailClose={onDetailClose}
            popItem={popItem}
          />
        )
      );
    }, [popItem, etherscanBaseUrl, onDetailClose]);
    const panelList: Pick<
      PanelContent<"ASSETS" | "TRANSACTION">,
      "key" | "element"
    >[] = [
      {
        key: "ASSETS",
        element: (
          <>
            {nftList && nftList.length ? (
              <Grid container spacing={2} paddingX={3} paddingBottom={3}>
                {nftList.map((item, index) => (
                  <Grid
                    key={(item?.nftId ?? "") + index.toString()}
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    flex={"1 1 120%"}
                  >
                    <CardStyle
                      sx={{ maxWidth: 345 }}
                      onClick={() => {
                        onDetail(item);
                      }}
                    >
                      <Box
                        position={"absolute"}
                        width={"100%"}
                        height={"100%"}
                        display={"flex"}
                        flexDirection={"column"}
                        justifyContent={"space-between"}
                      >
                        <BoxStyle
                          theme={theme}
                          flex={1}
                          display={"flex"}
                          alignItems={"center"}
                          justifyContent={"center"}
                        >
                          {item && (!item.image || item.isFailedLoadMeta) ? (
                            <Box
                              flex={1}
                              display={"flex"}
                              alignItems={"center"}
                              justifyContent={"center"}
                              onClick={() => onNFTReload(item, index)}
                            >
                              <RefreshIcon style={{ height: 36, width: 36 }} />
                            </Box>
                          ) : (
                            <Box
                              alignSelf={"stretch"}
                              flex={1}
                              display={"flex"}
                              style={{ background: "var(--color-white)" }}
                            >
                              <NftImage
                                {...item}
                                onError={() => onNFTError(item, index)}
                                alt={item.name ?? "NFT"}
                                src={
                                  item?.image?.replace(
                                    IPFS_META_URL,
                                    LOOPRING_URLs.IPFS_META_URL
                                  ) ?? ""
                                }
                              />
                            </Box>
                          )}
                        </BoxStyle>
                        <Box
                          padding={2}
                          height={80}
                          display={"flex"}
                          flexDirection={"row"}
                          alignItems={"center"}
                          justifyContent={"space-between"}
                        >
                          <Box display={"flex"} flexDirection={"column"}>
                            <Typography
                              color={"text.secondary"}
                              component={"h6"}
                            >
                              {item?.name ?? EmptyValueTag}
                            </Typography>
                            <Typography
                              color={"--color-text-primary"}
                              component={"p"}
                              paddingTop={1}
                              minWidth={164}
                              textOverflow={"ellipsis"}
                              title={item?.nftId?.toString()}
                            >
                              {t("labelNFTTokenID")} #
                              {" " + getShortAddr(item?.nftId ?? "")}
                            </Typography>
                          </Box>

                          <Box display={"inline-flex"} alignItems={"center"}>
                            <Typography
                              variant={"h4"}
                              component={"div"}
                              height={40}
                              paddingX={3}
                              whiteSpace={"pre"}
                              display={"inline-flex"}
                              alignItems={"center"}
                              color={"textPrimary"}
                              style={{
                                background: "var(--field-opacity)",
                                borderRadius: "20px",
                              }}
                            >
                              × {item.total}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardStyle>
                  </Grid>
                ))}
              </Grid>
            ) : nftLayer2 && nftLayer2.length ? (
              <Box
                flex={1}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                height={"90%"}
              >
                <LoadingIcon style={{ width: 32, height: 32 }} />
              </Box>
            ) : (
              <EmptyDefault
                message={() => (
                  <Box
                    flex={1}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    No NFT
                  </Box>
                )}
              />
            )}
          </>
        ),
      },
      {
        key: "TRANSACTION",
        element: <HistoryNFT />,
      },
    ];
    return (
      <>
        <MuiModal
          open={isShow}
          onClose={onDetailClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <SwitchPanelStyled
            width={"80%"}
            position={"relative"}
            minWidth={1000}
            style={{ alignItems: "stretch" }}
          >
            <Box display={"flex"} width={"100%"} flexDirection={"column"}>
              <ModalCloseButton onClose={onDetailClose} t={t} {...rest} />
            </Box>
            <Box
              display={"flex"}
              flexDirection={"row"}
              flex={1}
              justifyContent={"stretch"}
            >
              {modalContent}
            </Box>
          </SwitchPanelStyled>
        </MuiModal>

        <MuiModal
          open={isShowNFTDeposit.isShow}
          onClose={onNFTDepositClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <SwitchPanelStyled
            width={"var(--modal-width)"}
            position={"relative"}
            style={{ alignItems: "stretch" }}
          >
            <Box display={"flex"} width={"100%"} flexDirection={"column"}>
              <ModalCloseButton onClose={onNFTDepositClose} t={t} {...rest} />
            </Box>
            <Box
              display={"flex"}
              flexDirection={"column"}
              flex={1}
              justifyContent={"stretch"}
            >
              <DepositNFTWrap {...nftDepositProps} />
            </Box>
          </SwitchPanelStyled>
        </MuiModal>
        <MuiModal
          open={isShowNFTMint.isShow}
          onClose={onNFTMintClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <SwitchPanelStyled
            width={"var(--modal-width)"}
            position={"relative"}
            style={{ alignItems: "stretch" }}
          >
            <Box display={"flex"} width={"100%"} flexDirection={"column"}>
              <ModalCloseButton onClose={onNFTMintClose} t={t} {...rest} />
            </Box>
            <Box
              display={"flex"}
              flexDirection={"column"}
              flex={1}
              justifyContent={"stretch"}
            >
              <MintNFTWrap {...nftMintProps} />
            </Box>
          </SwitchPanelStyled>
        </MuiModal>
        <StyledPaper
          flex={1}
          className={"MuiPaper-elevation2"}
          marginTop={0}
          marginBottom={2}
          display={"flex"}
          flexDirection={"column"}
        >
          <Box
            marginY={2}
            marginLeft={2}
            marginRight={3}
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Tabs
              value={currentTab}
              onChange={(_event, value) => handleTabChange(value)}
              aria-label="l2-history-tabs"
            >
              <Tab
                label={t("labelNFTMyNFT", { num: 0 })}
                value={TabKey.ASSETS}
              />
              <Tab label={t("labelTransactions")} value={TabKey.TRANSACTION} />
            </Tabs>
            <Box display={"flex"}>
              <Button
                variant={"contained"}
                size={"small"}
                style={{ marginLeft: 4 }}
                onClick={() => popNFTDeposit()}
              >
                {t("labelNFTDeposit")}
              </Button>
              <Button
                variant={"outlined"}
                size={"medium"}
                style={{ marginLeft: `${theme.unit}px` }}
                onClick={() => popNFTMint()}
              >
                {t("nftMintBtn")}
              </Button>
            </Box>
          </Box>
          <Box flex={1}>{panelList[currentTab].element}</Box>
        </StyledPaper>
      </>
    );
  }
);
