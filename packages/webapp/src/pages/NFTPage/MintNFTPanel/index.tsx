import { useTranslation } from "react-i18next";
import { Box, Button, Card, Typography, useTheme } from "@mui/material";
import {
  MintNFTConfirm,
  PanelContent,
  useOpenModals, useSettings,
} from "@loopring-web/component-lib";
import React from "react";
import { MetaNFTPanel } from "./metaNFTPanel";
import styled from "@emotion/styled";
import { useMintNFTPanel } from "./hook";
import { useHistory } from "react-router-dom";
import { BackIcon } from "@loopring-web/common-resources";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`;
const CardStyled = styled(Card)`
  min-height: ${({theme}) => theme.unit * 61.5}px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  width: var(--nft-card);
`;

export const MintNFTPanel = () => {
  const history = useHistory();

  const { t } = useTranslation("common");
  const mintWholeProps = useMintNFTPanel();
  const panelList: Pick<
    PanelContent<"METADATA" | "MINT_CONFIRM">,
    "key" | "element"
  >[] = [
    {
      key: "METADATA",
      element: (
        <MetaNFTPanel
          {...mintWholeProps}
          nftMetaBtnStatus={mintWholeProps.nftMetaProps.nftMetaBtnStatus}
          btnInfo={mintWholeProps.nftMetaProps.btnInfo}
        />
      ),
    },
    {
      key: "MINT_CONFIRM",
      element: (
        <MintNFTConfirm
          disabled={false}
          walletMap={{}}
          {...mintWholeProps.nftMintProps}
          metaData={mintWholeProps.nftMintValue.nftMETA}
          isFeeNotEnough={mintWholeProps.isFeeNotEnough}
          handleFeeChange={mintWholeProps.handleFeeChange}
          chargeFeeTokenList={mintWholeProps.chargeFeeTokenList}
          feeInfo={mintWholeProps.feeInfo}
        />
      ),
    },
  ];
  return (
    <>
      <Box marginBottom={2}>
        <Button
          startIcon={<BackIcon fontSize={"small"} />}
          variant={"text"}
          size={"medium"}
          sx={{ color: "var(--color-text-secondary)" }}
          color={"inherit"}
          onClick={history.goBack}
        >
          {t("labelMINTNFTTitle")}
          {/*<Typography color={"textPrimary"}></Typography>*/}
        </Button>
      </Box>
      <StyledPaper
        flex={1}
        className={"MuiPaper-elevation2"}
        marginTop={0}
        marginBottom={2}
        display={"flex"}
        flexDirection={"column"}
      >
        {/*<Box*/}
        {/*  display={"flex"}*/}
        {/*  justifyContent={"space-between"}*/}
        {/*  alignItems={"center"}*/}
        {/*  paddingX={5 / 2}*/}
        {/*  paddingTop={5 / 2}*/}
        {/*>*/}
        {/*  <Typography component={"h3"} variant={"h4"}>*/}
        {/*    {t("labelMINTNFTTitle")}*/}
        {/*  </Typography>*/}
        {/*</Box>*/}
        <Box flex={1} display={"flex"}>
          {
            panelList.map((panel, index) => {
              return (
                <Box
                  flex={1}
                  display={
                    mintWholeProps.currentTab === index ? "flex" : "none"
                  }
                  alignItems={"stretch"}
                  key={index}
                >
                  {panel.element}
                </Box>
              );
            })
            // panelList[currentTab].element
          }
        </Box>
      </StyledPaper>
    </>
  );
};
export const MintLandingPage = () => {
  const history = useHistory();
  const { setShowNFTMintAdvance } = useOpenModals();
  const {t} = useTranslation(["common"]);
  const {isMobile} = useSettings()
  return (
    <Box
      flex={1}
      display={"flex"}
      justifyContent={"stretch"}
      flexDirection={'column'}
    >
      <Box marginBottom={2}>
        <Typography component={"h3"} variant={"h4"} marginBottom={1}>
          {t('labelMintSelect')}
        </Typography>
        <Typography component={"h3"} variant={"body1"} color={"textSecondary"}>
          {t('labelMintSelectDes')}
        </Typography>
      </Box>
      <Box flex={1}
           alignItems={"center"}
           display={"flex"}
           flexDirection={isMobile ? "column" : "row"}
           justifyContent={"center"}>
        <CardStyled onClick={() => {
          setShowNFTMintAdvance({isShow: true});
        }}>
          <Box flex={1}>
            lalalala
          </Box>
          <Button
            variant={"outlined"}
            color={"primary"}
          >
            {t("labelAdvanceMint")}
          </Button>
        </CardStyled>
        <CardStyled sx={{marginLeft: isMobile ? 0 : 4}} onClick={() => {
          setShowNFTMintAdvance({isShow: true});
        }}>
          <Box flex={1}>
            lalalala
          </Box>
          <Button
            onClick={() => {
              history.push("/nft/mintNFT");
            }}
            variant={"outlined"}
            color={"primary"}
          >
            {t("labelMintNFT")}
          </Button>
        </CardStyled>
      </Box>
    </Box>
  );
};
