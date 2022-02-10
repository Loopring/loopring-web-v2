import styled from "@emotion/styled";
import {
  Box,
  Button,
  Card,
  Grid,
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
  PanelContent,
  SwitchPanelStyled,
} from "@loopring-web/component-lib";
import { useMyNFT } from "./hook";
import { NFTDetail } from "./components/detail";
import {
  EmptyValueTag,
  getShortAddr,
  IPFS_META_URL,
  LoadingIcon,
} from "@loopring-web/common-resources";
import { LOOPRING_URLs } from "@loopring-web/loopring-sdk";
import { useTheme } from "@emotion/react";
import { HistoryNFT } from "./components/history";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

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
                        <Box
                          flex={1}
                          style={{ background: "var(--field-opacity)" }}
                          display={"flex"}
                          alignItems={"center"}
                          justifyContent={"center"}
                        >
                          <img
                            alt={"NFT"}
                            width={"100%"}
                            height={"100%"}
                            src={item?.image?.replace(
                              IPFS_META_URL,
                              LOOPRING_URLs.IPFS_META_URL
                            )}
                          />
                        </Box>
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
