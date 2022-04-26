import { useTranslation } from "react-i18next";
import { Box, Typography, useTheme } from "@mui/material";
import {
  MintNFTConfirm,
  PanelContent,
  SwipeableViewsStyled,
} from "@loopring-web/component-lib";
import React from "react";
import { MetaNFTPanel } from "./metaNFTPanel";
import styled from "@emotion/styled";
import { useMintNFTPanel } from "./hook";
import { mintService } from "services/mintServices";
const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const MintNFTPanel = () => {
  const { t } = useTranslation("common");

  const theme = useTheme();

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

          // feeInfo={feeInfo}
          // handleFeeChange={handleFeeChange}
          // nftMetaProps={nftMetaProps}
          // nftMintProps={nftMintProps}
          // nftMintValue={nftMintValue}
          // isFeeNotEnough={isFeeNotEnough}
          // chargeFeeTokenList={chargeFeeTokenList}
          // ipfsMediaSources={ipfsMediaSources}
          // ipfsProvides={ipfsProvides}
          // onDelete
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
          metaData={mintWholeProps.nftMetaProps.nftMeta}
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
      <StyledPaper
        flex={1}
        className={"MuiPaper-elevation2"}
        marginTop={0}
        marginBottom={2}
        display={"flex"}
        flexDirection={"column"}
      >
        <Typography
          component={"h3"}
          variant={"h4"}
          paddingX={5 / 2}
          paddingTop={5 / 2}
        >
          {t("labelMINTNFTTitle")}
        </Typography>
        <Box flex={1} display={"flex"}>
          <SwipeableViewsStyled
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={mintWholeProps.currentTab}
          >
            {
              panelList.map((panel, index) => {
                return (
                  <Box
                    flex={1}
                    display={"flex"}
                    alignItems={"stretch"}
                    key={index}
                  >
                    {panel.element}
                  </Box>
                );
              })
              // panelList[currentTab].element
            }
          </SwipeableViewsStyled>
        </Box>
      </StyledPaper>
    </>
  );
};
