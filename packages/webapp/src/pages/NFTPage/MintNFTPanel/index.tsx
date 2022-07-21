import { useTranslation } from "react-i18next";
import { Box, Button, Typography, useTheme } from "@mui/material";
import {
  MintNFTConfirm,
  PanelContent,
  useOpenModals,
} from "@loopring-web/component-lib";
import React from "react";
import { MetaNFTPanel } from "./metaNFTPanel";
import styled from "@emotion/styled";
import { useMintNFTPanel } from "./hook";
import { useHistory } from "react-router-dom";
import { BackIcon } from "@loopring-web/common-resources";
const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
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
  const { t } = useTranslation(["common"]);
  return (
    <Box
      flex={1}
      alignItems={"center"}
      display={"flex"}
      justifyContent={"center"}
    >
      <Box marginLeft={1}>
        <Button
          onClick={() => {
            setShowNFTMintAdvance({ isShow: true });
          }}
          variant={"outlined"}
          color={"primary"}
        >
          {t("labelAdvanceMint")}
        </Button>
      </Box>
      <Box marginLeft={1}>
        <Button
          onClick={() => {
            history.push("/nft/mintNFT");
          }}
          variant={"outlined"}
          color={"primary"}
        >
          {t("labelMintNFT")}
        </Button>
      </Box>
    </Box>
  );
};
