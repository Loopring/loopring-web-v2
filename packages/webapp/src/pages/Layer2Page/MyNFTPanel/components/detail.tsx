import { Box, Link, Typography } from "@mui/material";
import { IPFS_META_URL, NFTWholeINFO } from "@loopring-web/common-resources";
import {
  Button,
  ModalBackButton,
  TransferPanel,
  WithdrawPanel,
  DeployNFTWrap,
} from "@loopring-web/component-lib";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { useNFTTransfer } from "hooks/useractions/useNFTTransfer";
import { useNFTWithdraw } from "hooks/useractions/useNFTWithdraw";
import { LOOPRING_URLs, NFTType } from "@loopring-web/loopring-sdk";
import { useNFTDeploy } from "hooks/useractions/useNFTDeploy";
import { useGetAssets } from "../../AssetPanel/hook";
import { updateNFTTransferData } from "../../../../stores/router";

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

    const [viewPage, setViewPage] = React.useState<number>(0);

    const { nftTransferProps, updateNFTTransferData } = useNFTTransfer({
      isLocalShow: viewPage === 1,
      doTransferDone: onDetailClose,
    });
    const { nftWithdrawProps, updateNFTWithdrawData } = useNFTWithdraw({
      isLocalShow: viewPage === 2,
      doWithdrawDone: onDetailClose,
    });
    const { nftDeployProps, updateNFTDeployData } = useNFTDeploy({
      isLocalShow: viewPage === 3,
      doDeployDone: onDetailClose,
    });

    const handleChangeIndex = (index: number) => {
      setViewPage(index);
      // switch (index) {
      //   case 1:
      //     updateNFTTransferData({
      //       ...nftTransferProps.tradeData,
      //       ...popItem,
      //     });
      //     break;
      //   case 2:
      //     updateNFTWithdrawData({
      //       ...nftWithdrawProps.tradeData,
      //       ...popItem,
      //     });
      //     break;
      //   case 3:
      //     updateNFTDeployData({
      //       ...nftDeployProps.tradeData,
      //       ...popItem,
      //     });
      //     break;
      // }
    };
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
                {popItem?.nftIdView ?? ""}
              </Typography>
            </Typography>
            <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTTYPE")}
              </Typography>
              <Typography
                color={"var(--color-text-third)"}
                title={popItem?.nftType}
              >
                {popItem?.nftType}
              </Typography>
            </Typography>
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
                {t("labelNFTMinter")}
              </Typography>

              <Link
                fontSize={"inherit"}
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
                {t("labelNFTDescription")}
              </Typography>
              <Typography
                color={"var(--color-text-third)"}
                component={"span"}
                whiteSpace={"break-spaces"}
                style={{ wordBreak: "break-all" }}
                title={popItem?.description}
              >
                {popItem.description}
              </Typography>
            </Typography>

            <Typography
              display={"inline-flex"}
              alignItems={"center"}
              variant={"body1"}
              marginTop={3}
              justifyContent={"space-between"}
            >
              <Typography
                display={"inline-flex"}
                alignItems={"center"}
              ></Typography>
              <Box display={"flex"} flexDirection={"row"}>
                <Typography minWidth={100} marginRight={2}>
                  {popItem.isDeployed ? (
                    <Button
                      variant={"outlined"}
                      size={"medium"}
                      fullWidth
                      onClick={() => handleChangeIndex(2)}
                    >
                      {t("labelNFTWithdraw")}
                    </Button>
                  ) : (
                    <Button
                      variant={"outlined"}
                      size={"medium"}
                      fullWidth
                      onClick={() => handleChangeIndex(3)}
                    >
                      {t("labelNFTDeployContract")}
                    </Button>
                  )}
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
          <img
            alt={"NFT"}
            width={"100%"}
            height={"100%"}
            src={popItem?.image?.replace(
              IPFS_META_URL,
              LOOPRING_URLs.IPFS_META_URL
            )}
          />
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
          {viewPage === 3 && (
            <Box height={540} width={"100%"} paddingX={3} flex={1}>
              <DeployNFTWrap<any, any>
                {...{
                  ...nftDeployProps,
                  tradeData: {
                    ...nftDeployProps.tradeData,
                    belong: popItem.nftData,
                    balance: Number(popItem?.nftBalance),
                  },
                  assetsData: assetsRawData,
                }}
              />
            </Box>
          )}
        </BoxStyle>
      </>
    );
  }
);

// {/*{[*/}
// {/*  {*/}
// {/*    linkName: (*/}
// {/*      <DiscordIcon color={"inherit"} fontSize={"large"} />*/}
// {/*    ),*/}
// {/*    linkHref: "https://discord.com/invite/KkYccYp",*/}
// {/*  },*/}
// {/*  {*/}
// {/*    linkName: (*/}
// {/*      <TwitterIcon color={"inherit"} fontSize={"large"} />*/}
// {/*    ),*/}
// {/*    linkHref: "https://twitter.com/loopringorg",*/}
// {/*  },*/}
// {/*  {*/}
// {/*    linkName: (*/}
// {/*      <YoutubeIcon color={"inherit"} fontSize={"large"} />*/}
// {/*    ),*/}
// {/*    linkHref: "https://www.youtube.com/c/Loopring",*/}
// {/*  },*/}
// {/*  {*/}
// {/*    linkName: (*/}
// {/*      <MediumIcon color={"inherit"} fontSize={"large"} />*/}
// {/*    ),*/}
// {/*    linkHref: "https://medium.com/loopring-protocol",*/}
// {/*  },*/}
// {/*].map((o, index) => (*/}
// {/*  <Link*/}
// {/*    paddingX={0.5}*/}
// {/*    fontSize={12}*/}
// {/*    key={`${o.linkName}-${index}`}*/}
// {/*    onClick={() => window.open(o.linkHref)}*/}
// {/*  >*/}
// {/*    {o.linkName}*/}
// {/*  </Link>*/}
// {/*))}*/}
