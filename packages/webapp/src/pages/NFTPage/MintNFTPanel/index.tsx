import { useTranslation } from "react-i18next";
import { Box, Button, Typography } from "@mui/material";
import {
  CardNFTStyled, MintAdvanceNFTWrap,
  MintNFTConfirm, NftImage, NFTMintAdvanceProps,
  PanelContent,
  useOpenModals, useSettings,
} from "@loopring-web/component-lib";
import React from "react";
import { MetaNFTPanel } from "./metaNFTPanel";
import styled from "@emotion/styled";
import { useMintNFTPanel } from "./hook";
import { useHistory, useRouteMatch } from "react-router-dom";
import { BackIcon, FeeInfo, SoursURL, TradeNFT } from "@loopring-web/common-resources";
import { useNFTMintAdvance } from '@loopring-web/core';

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`;


export const MintNFTPanel = () => {
  const history = useHistory();

  const {t} = useTranslation("common");
  const mintWholeProps = useMintNFTPanel();
  const panelList: Pick<PanelContent<"METADATA" | "MINT_CONFIRM">,
    "key" | "element">[] = [
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
          startIcon={<BackIcon fontSize={"small"}/>}
          variant={"text"}
          size={"medium"}
          sx={{color: "var(--color-text-secondary)"}}
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
export const MintLandingPage = () => {
  const history = useHistory();
  const {setShowNFTMintAdvance} = useOpenModals();
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
        <CardNFTStyled onClick={() => {
          history.push("/nft/mintAdvanceNFT");
          // setShowNFTMintAdvance({isShow: true});
        }}>
          <Box flex={1} display={"flex"}
               alignItems={"center"}
               justifyContent={"center"}
               marginBottom={2}
               minHeight={200}
               width={"100%"}
          >
            {/*<NftImage*/}
            {/*  */}
            {/*  onError={() => undefined}*/}
            {/*  src={"https://static.loopring.io/assets/images/nft-mint.png"}*/}
            {/*/>*/}
            <NftImage
              alt={"NFT Created"}
              onError={() => undefined}
              src={`${SoursURL}images/nft_guid1.webp`}
            />
          </Box>
          <Typography
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'space-between'}
            paddingX={2}
            component={'p'}
            variant={'body1'}
            minHeight={"160px"}
            marginBottom={3}
          >
            <>{t('labelAdMintGuid')}

              <Button
                variant={"contained"}
                color={"primary"}
                fullWidth={true}
              >
                {t("labelAdvanceMint")}
              </Button>
            </>
          </Typography>
        </CardNFTStyled>
        <CardNFTStyled sx={{marginLeft: isMobile ? 0 : 4}} onClick={() => {
          history.push("/nft/mintNFT");
        }}>
          <Box flex={1} display={"flex"}
               alignItems={"center"}
               justifyContent={"center"}
               marginBottom={2}
               minHeight={200}
               width={"100%"}
          >
            <NftImage

              alt={"NFT Created"}
              onError={() => undefined}
              src={`${SoursURL}images/nft_guid2.webp`}
            />
          </Box>
          <Typography
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'space-between'}
            paddingX={2}
            component={'p'}
            variant={'body1'}
            minHeight={"160px"}
            marginBottom={3}
          >
            <>{t('labelMintGuid')}

              <Button
                variant={"contained"}
                color={"primary"}
                fullWidth={true}
              >
                {t("labelMintNFT")}
              </Button>
            </>
          </Typography>
        </CardNFTStyled>
      </Box>
    </Box>
  );
};
export const MintNFTAdvancePanel = <T extends TradeNFT<I>,
  I>() => {
  const history = useHistory();
  const {resetDefault, nftMintAdvanceProps} = useNFTMintAdvance();
  const match: any = useRouteMatch("/nft/:mintAdvanceNFT");
  React.useEffect(() => {
    resetDefault();
  }, [match?.params?.mintAdvanceNFT])
  const {t} = useTranslation("common");
  return <>
    <Box marginBottom={2}>
      <Button
        startIcon={<BackIcon fontSize={"small"}/>}
        variant={"text"}
        size={"medium"}
        sx={{color: "var(--color-text-secondary)"}}
        color={"inherit"}
        onClick={history.goBack}
      >
        {t("labelAdMintTitle")}
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
      alignItems={"center"}
    >
      <MintAdvanceNFTWrap

        {...{
          // ...rest,
          // _width: `calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`,
          // _height: `calc(var(--modal-height) - ${theme.unit * 6}px)`,
          ...nftMintAdvanceProps,
        }}
      />
    </StyledPaper>
  </>
}
