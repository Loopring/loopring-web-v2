import { Box, Link, Typography } from "@mui/material";
import {
  DiscordIcon,
  MediumIcon,
  NFTWholeINFO,
  TwitterIcon,
  YoutubeIcon,
} from "@loopring-web/common-resources";
import {
  Button,
  ModalBackButton,
  TransferPanel,
  WithdrawPanel,
} from "@loopring-web/component-lib";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { useNFTTransfer } from "hooks/useractions/useNFTTransfer";
import { useGetAssets } from "../AssetPanel/hook";
import { useNFTWithdraw } from "../../../hooks/useractions/useNFTWithdraw";
import { toBig } from "@loopring-web/loopring-sdk";

const BoxNFT = styled(Box)`
  background: var(--color-global-bg);

  img {
    object-fit: contain;
  }
` as typeof Box;
const BoxStyle = styled(Box)`
  &.nft-detail {
    .react-swipeable-view-container {
      & > div {
        min-width: 400px;
        padding-bottom: 0;
        word-break: break-all;
        white-space: break-spaces;
      }
    }

    .transfer-wrap {
      padding-left: 0;
      padding-right: 0;
    }
  }
` as typeof Box;
export const NFTDetail = withTranslation("common")(
  ({
    popItem,
    etherscanBaseUrl,
    onDetailClose,
    t,
    ...rest
  }: {
    onDetailClose: () => void;
    popItem: Partial<NFTWholeINFO>;
    etherscanBaseUrl: string;
  } & WithTranslation) => {
    const { assetsRawData } = useGetAssets();

    // const theme = useTheme();
    const [viewPage, setViewPage] = React.useState<number>(0);
    const handleChangeIndex = (index: number) => {
      setViewPage(index);
    };
    const {
      // nftTransferToastOpen,
      // nftTransferAlertText,
      // setNFTTransferToastOpen,
      nftTransferProps,
      // processRequestNFT,
      // lastNFTRequest,
    } = useNFTTransfer({
      isLocalShow: viewPage === 1,
      doTransferDone: onDetailClose,
    });
    //TODO: finished feature with draw
    const {
      // nftTransferToastOpen,
      // nftTransferAlertText,
      // setNFTTransferToastOpen,
      nftWithdrawProps,
      // processRequestNFT,
      // lastNFTRequest,
    } = useNFTWithdraw({
      isLocalShow: viewPage === 2,
      doWithdrawDone: onDetailClose,
    });

    const detailView = React.useMemo(() => {
      return (
        <Box flexDirection={"column"} display={"flex"}>
          <Box marginBottom={3}>
            <Typography color={"text.secondary"}>
              {t("labelNFTTokenID")}
            </Typography>
            <Typography color={"text.primary"} variant={"h2"} marginTop={2}>
              #{popItem?.tokenId}{" "}
            </Typography>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            marginBottom={4}
            paddingRight={3}
          >
            <Typography component={"h6"} color={"text.primary"} variant={"h4"}>
              {t("labelNFTDetail")}
            </Typography>
            <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTName")}
              </Typography>
              <Typography
                color={"var(--color-text-third)"}
                title={popItem?.name}
              >
                {popItem?.name}
              </Typography>
            </Typography>
            <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTTOTAL")}
              </Typography>
              <Typography
                color={"var(--color-text-third)"}
                title={popItem?.name}
              >
                {popItem?.total}
              </Typography>
            </Typography>

            <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTID")}
              </Typography>
              <Typography
                color={"var(--color-text-third)"}
                maxWidth={300}
                title={popItem?.nftId}
              >
                {toBig(popItem?.nftId ?? "").toString()}
              </Typography>
            </Typography>
            <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTTYPE")}{" "}
              </Typography>
              <Typography
                color={"var(--color-text-third)"}
                title={popItem?.nftType}
              >
                {popItem.nftType}
              </Typography>
            </Typography>
            {/*<Typography display={'inline-flex'} variant={'body1'} marginTop={2}>*/}
            {/*    <Typography color={'var(--color-text-third)'} width={160}>{t('labelNFTTYPE')} </Typography>*/}
            {/*    <Typography color={'var(--color-text-third)'}*/}
            {/*                title={popItem?.nftType}>{popItem.nftType}</Typography>*/}
            {/*</Typography>*/}
            <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTContractAddress")}
              </Typography>
              <Link
                fontSize={"inherit"}
                whiteSpace={"break-spaces"}
                style={{ wordBreak: "break-all" }}
                onClick={() =>
                  window.open(
                    `${etherscanBaseUrl}address/${popItem.tokenAddress}`
                  )
                }
              >
                {popItem.tokenAddress}
              </Link>
            </Typography>
            <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTMinter")}{" "}
              </Typography>

              <Link
                fontSize={"inherit"}
                maxWidth={300}
                whiteSpace={"break-spaces"}
                style={{ wordBreak: "break-all" }}
                onClick={() =>
                  window.open(`${etherscanBaseUrl}address/${popItem.minter}`)
                }
              >
                {popItem.minter}
              </Link>
            </Typography>

            <Typography
              display={"inline-flex"}
              variant={"body1"}
              marginTop={2}
              flex={1}
            >
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTDescription")}{" "}
              </Typography>
              <Typography
                color={"var(--color-text-third)"}
                component={"span"}
                whiteSpace={"break-spaces"}
                style={{ wordBreak: "break-all" }}
                title={popItem?.description}
              >
                {popItem.description}{" "}
              </Typography>
            </Typography>

            <Typography
              display={"inline-flex"}
              alignItems={"center"}
              variant={"body1"}
              marginTop={3}
              justifyContent={"space-between"}
            >
              <Typography display={"inline-flex"} alignItems={"center"}>
                {[
                  {
                    linkName: (
                      <DiscordIcon color={"inherit"} fontSize={"large"} />
                    ),
                    linkHref: "https://discord.com/invite/KkYccYp",
                  },
                  {
                    linkName: (
                      <TwitterIcon color={"inherit"} fontSize={"large"} />
                    ),
                    linkHref: "https://twitter.com/loopringorg",
                  },
                  {
                    linkName: (
                      <YoutubeIcon color={"inherit"} fontSize={"large"} />
                    ),
                    linkHref: "https://www.youtube.com/c/Loopring",
                  },
                  {
                    linkName: (
                      <MediumIcon color={"inherit"} fontSize={"large"} />
                    ),
                    linkHref: "https://medium.com/loopring-protocol",
                  },
                ].map((o, index) => (
                  <Link
                    paddingX={0.5}
                    fontSize={12}
                    key={`${o.linkName}-${index}`}
                    onClick={() => window.open(o.linkHref)}
                  >
                    {o.linkName}
                  </Link>
                ))}
              </Typography>
              <Box display={"flex"} flexDirection={"row"}>
                <Typography minWidth={100} marginRight={2}>
                  <Button
                    variant={"outlined"}
                    size={"medium"}
                    fullWidth
                    onClick={() => handleChangeIndex(2)}
                  >
                    {" "}
                    {t("labelNFTWithdraw")}
                  </Button>
                </Typography>
                <Typography minWidth={100}>
                  <Button
                    variant={"contained"}
                    size={"small"}
                    color={"primary"}
                    fullWidth
                    onClick={() => handleChangeIndex(1)}
                  >
                    {t("labelNFTTransfer")}
                  </Button>
                </Typography>
              </Box>
            </Typography>
          </Box>
        </Box>
      );
    }, [popItem, etherscanBaseUrl]);
    return (
      <>
        <BoxNFT
          display={"flex"}
          width={570}
          height={570}
          margin={1}
          marginTop={-4}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <img alt={"NFT"} width={"100%"} height={"100%"} src={popItem.image} />
        </BoxNFT>
        <BoxStyle
          marginLeft={2}
          display={"flex"}
          flex={1}
          flexDirection={"column"}
          alignItems={"center"}
          className={"nft-detail"}
          whiteSpace={"break-spaces"}
          style={{ wordBreak: "break-all" }}
        >
          {viewPage !== 0 && (
            <ModalBackButton
              marginTop={-3.5}
              onBack={() => handleChangeIndex(0)}
              {...{ ...rest, t }}
            />
          )}

          {viewPage === 0 && detailView}
          {viewPage === 1 && (
            <TransferPanel<any, any>
              {...{
                _width: 416,
                type: "NFT",
                _height: 540,
                isThumb: false,

                ...{
                  ...nftTransferProps,
                  tradeData: {
                    ...popItem,
                    belong: popItem.nftData,
                    balance: Number(popItem?.nftBalance),
                  },
                },
                assetsData: assetsRawData,
              }}
            />
          )}
          {/*TODO: finished feature withdraw*/}
          {viewPage === 2 && (
            <WithdrawPanel<any, any>
              {...{
                _width: 400,
                type: "NFT",
                _height: 540,
                isThumb: false,

                ...{
                  ...nftWithdrawProps,
                  tradeData: {
                    ...popItem,
                    belong: popItem.nftData,
                    balance: Number(popItem?.nftBalance),
                  },
                },
                assetsData: assetsRawData,
              }}
            />
          )}
        </BoxStyle>
      </>
    );
  }
);
// onClick={() => showNFTTransfer({
//     isShow: true,
//     ...popItem
// })}
// {/*<SwipeableViews*/}
// {/*    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}*/}
// {/*    index={viewPage}*/}
// {/*    width={400}*/}
// {/*    onChangeIndex={handleChangeIndex}*/}
// {/*>*/}
