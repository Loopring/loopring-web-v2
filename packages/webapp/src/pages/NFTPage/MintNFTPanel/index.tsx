import { Trans, useTranslation } from "react-i18next";
import { Box, Button, Typography } from "@mui/material";
import {
  MintAdvanceNFTWrap,
  MintNFTConfirm,
  PanelContent,
  PopoverPure,
} from "@loopring-web/component-lib";
import React from "react";
import { MetaNFTPanel } from "./metaNFTPanel";
import styled from "@emotion/styled";
import { useMintNFTPanel } from "./hook";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
  BackIcon,
  CollectionMeta,
  FeeInfo,
  Info2Icon,
  TradeNFT,
} from "@loopring-web/common-resources";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import {
  LoopringAPI,
  makeMeta,
  useMyCollection,
  useNFTMintAdvance,
} from "@loopring-web/core";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const MintNFTPanel = <Co extends CollectionMeta>() => {
  const history = useHistory();
  const mintWholeProps = useMintNFTPanel();
  const collectionListProps = useMyCollection();
  const { t } = useTranslation(["common"]);
  const panelList: Pick<
    PanelContent<"METADATA" | "MINT_CONFIRM">,
    "key" | "element"
  >[] = [
    {
      key: "METADATA",
      element: (
        <MetaNFTPanel
          {...{
            ...mintWholeProps,
            nftMetaProps: {
              ...mintWholeProps.nftMetaProps,
              collectionInputProps: {
                collection: mintWholeProps.nftMintValue.collection,
                collectionListProps,
                domain: LoopringAPI.delegate?.getCollectionDomain(),
                makeMeta,
              } as any,
            },
          }}
          // collectionInputProps={}
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
          // baseURL={mintWholeProps.nftMetaProps.baseURL}
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
export const MintNFTAdvancePanel = <
  T extends TradeNFT<I, Co>,
  Co extends CollectionMeta,
  I
>() => {
  const { resetDefault: resetNFTMint, nftMintAdvanceProps } =
    useNFTMintAdvance();

  const history = useHistory();
  const match: any = useRouteMatch("/nft/:mintAdvanceNFT");
  React.useEffect(() => {
    resetNFTMint();
  }, [match.params?.mintAdvanceNFT]);
  const { t } = useTranslation("common");
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-nftMint`,
  });

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
          {t("labelAdMintTitle")}
          <Info2Icon
            {...bindHover(popupState)}
            fontSize={"large"}
            htmlColor={"var(--color-text-third)"}
          />
          {/*<Typography color={"textPrimary"}></Typography>*/}
        </Button>
        <PopoverPure
          className={"arrow-center"}
          {...bindPopper(popupState)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <Typography
            padding={2}
            component={"p"}
            variant={"body2"}
            whiteSpace={"pre-line"}
          >
            <Trans
              i18nKey={
                nftMintAdvanceProps.description
                  ? nftMintAdvanceProps.description
                  : "nftMintDescription"
              }
            >
              Paste in the CID that you obtained from uploading the metadata
              Information file (point 11 above) - if successful, the data from
              the metadata Information you created contained within the folder
              populates the Name and also the image displays.
            </Trans>
          </Typography>
        </PopoverPure>
      </Box>
      <StyledPaper
        flex={1}
        className={"MuiPaper-elevation2"}
        marginTop={0}
        marginBottom={2}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"stretch"}
      >
        <MintAdvanceNFTWrap {...{ ...nftMintAdvanceProps }} />
      </StyledPaper>
    </>
  );
};
