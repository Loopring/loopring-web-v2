import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import { MintNFTConfirm, PanelContent } from "@loopring-web/component-lib";
import React from "react";
import { MetaNFTPanel } from "./metaNFTPanel";
import styled from "@emotion/styled";
import { useMintNFTPanel } from "./hook";
const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;
const enum MINT_VIEW_STEP {
  METADATA,
  MINT_CONFIRM,
}
export const MintNFTPanel = () => {
  const { t } = useTranslation("common");
  const [currentTab, setCurrentTab] = React.useState<MINT_VIEW_STEP>(
    MINT_VIEW_STEP.METADATA
  );
  const handleTabChange = React.useCallback((value) => {
    setCurrentTab(value);
  }, []);
  const {
    nftMetaProps,
    nftMintProps,
    handleFeeChange,
    feeInfo,
    nftMintValue,
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    tokenAddress,
    resetMETADAT,
  } = useMintNFTPanel();
  const panelList: Pick<
    PanelContent<"METADATA" | "MINT_CONFIRM">,
    "key" | "element"
  >[] = [
    {
      key: "METADATA",
      element: (
        <MetaNFTPanel
          feeInfo={feeInfo}
          handleFeeChange={handleFeeChange}
          nftMetaProps={nftMetaProps}
          nftMintProps={nftMintProps}
          nftMintValue={nftMintValue}
          isFeeNotEnough={isFeeNotEnough}
          chargeFeeTokenList={chargeFeeTokenList}
          nftMetaBtnStatus={nftMetaProps.nftMetaBtnStatus}
          btnInfo={nftMetaProps.btnInfo}
        />
      ),
    },
    {
      key: "MINT_CONFIRM",
      element: (
        <MintNFTConfirm
          disabled={false}
          walletMap={{}}
          tradeData={nftMintProps.tradeData}
          metaData={nftMetaProps.nftMeta}
          isFeeNotEnough={isFeeNotEnough}
          handleFeeChange={handleFeeChange}
          chargeFeeTokenList={chargeFeeTokenList}
          feeInfo={feeInfo}
          handleOnNFTDataChange={nftMintProps.handleOnNFTDataChange}
          onNFTMintClick={nftMintProps.onNFTMintClick}
          nftMintBtnStatus={nftMintProps.nftMintBtnStatus}
          btnInfo={nftMintProps.btnInfo}
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
        {panelList[currentTab].element}
      </StyledPaper>
    </>
  );
};
