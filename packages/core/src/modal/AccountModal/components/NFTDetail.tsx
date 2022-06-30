import styled from "@emotion/styled";
import { Box, BoxProps, Link, Typography } from "@mui/material";
import {
  AssetsRawDataItem,
  EmptyValueTag,
  Explorer,
  getShortAddr,
  IPFS_LOOPRING_SITE,
  IPFS_META_URL,
  LinkIcon,
  NFTWholeINFO,
} from "@loopring-web/common-resources";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  Button,
  InformationForNoMetaNFT,
  TextareaAutosizeStyled,
  useOpenModals,
  useSettings,
  useToggle,
  NFTMedia,
  AccountStep,
} from "@loopring-web/component-lib";
import { useAccount } from "../../../stores";
import React from "react";
import { DEPLOYMENT_STATUS, NFTType } from "@loopring-web/loopring-sdk";
import { useTheme } from "@emotion/react";

const BoxNFT = styled(Box)`
  background: var(--color-global-bg);
  img {
    object-fit: contain;
  }
` as typeof Box;

const BoxStyle = styled(Box)<
  { isMobile: boolean } & BoxProps & Partial<NFTWholeINFO>
>`
  &.nft-detail {
    margin-top: -26px;
    .detail-info {
      max-height: 520px;
      overflow-y: scroll;
    }
    .react-swipeable-view-container {
      & > div {
        align-items: center;
        padding-bottom: 0;
        word-break: break-all;
        white-space: break-spaces;
        min-width: 400px;
      }
    }
    .transfer-wrap {
      padding-left: 0;
      padding-right: 0;
    }
    .nft-trade {
      max-height: 520px;
      .container {
        width: 320px;
      }
    }
    .MuiToolbar-root {
      .back-btn {
        margin-left: ${({ theme }) => -4 * theme.unit}px;
      }
    }
  }
  &.nft-detail {
    ${({ isMobile, image }) => `
     ${
       isMobile &&
       `
       .detail-info{
          max-height:  initial;
        }
       .react-swipeable-view-container {
          & > div {
             min-width:  initial;
          }
        }
       position:relative;    
       width:auto; 
       .MuiBox-root{
        z-index:2
       } 
       &:before{
         z-index:1;
         position:absolute;
         filter: blur(3px);
         background:url(${
           image ? image.replace(IPFS_META_URL, IPFS_LOOPRING_SITE) : ""
         }) no-repeat 50% 10px;
          background-size: contain;
         opacity: 0.08;
         content:'';
         height: 100vh;
         width: 50%;
         display:block;
         height:100%;
         width:100%;
         
       }
       .MuiToolbar-root {
        .back-btn {
          margin-left: 0px;
        }
       } 
       
     `
     }
  `}
  }
` as (
  props: { isMobile: boolean } & BoxProps & Partial<NFTWholeINFO>
) => JSX.Element;

// const BoxBtnStyle = styled(Box)<{ isMobile?: boolean } & BoxProps>`
//   display: flex;
//   flex-direction: row;
//   align-self: flex-end;
//   width: 100%;
//   .btn {
//     width: 100%;
//     padding: ${({ theme }) => `${theme.unit}px ${0 * theme.unit}px`};
//   }
//   &.isMobile {
//     flex-direction: column;
//   }
// ` as (props: { isMobile?: boolean } & BoxProps) => JSX.Element;
export const NFTDetail = withTranslation("common")(
  ({
    popItem,
    etherscanBaseUrl,
    // nftTransferProps,
    // nftWithdrawProps,
    // nftDeployProps,
    // assetsRawData,
    t,
  }: {
    // nftTransferProps: TransferProps<any, any>;
    // nftWithdrawProps: WithdrawProps<any, any>;
    // nftDeployProps: NFTDeployProps<any, any>;
    onDetailClose: () => void;
    popItem: Partial<NFTWholeINFO>;
    etherscanBaseUrl: string;
    assetsRawData: AssetsRawDataItem[];
  } & WithTranslation) => {
    const { isMobile } = useSettings();
    const { account } = useAccount();
    const {
      toggle: { deployNFT },
    } = useToggle();
    const {
      // setShowNFTWithdraw,
      // setShowNFTTransfer,
      setShowAccount,
      setShowNFTDeploy,
      setShowTradeIsFrozen,
    } = useOpenModals();

    const [showDialog, setShowDialog] =
      React.useState<string | undefined>(undefined);
    // const [viewPage, setViewPage] = React.useState<number>(0);
    const [isKnowNFTNoMeta, setIsKnowNFTNoMeta] = React.useState<boolean>(
      !!(popItem?.name !== "" && popItem.image && popItem.image !== "")
    );

    const properties = popItem.properties
      ? typeof popItem.properties === "string"
        ? JSON.parse(popItem.properties)
        : popItem.properties
      : undefined;
    React.useEffect(() => {
      setIsKnowNFTNoMeta((_state) => {
        return !!(popItem.name !== "" && popItem.image && popItem.image !== "");
      });
    }, [popItem.name, popItem.image]);

    // const handleChangeIndex = (index: number) => {
    //   setView(index);
    // };

    // React.useEffect(() => {
    //   if (isShow) {
    //     toDetail();
    //   }
    // }, [isShow]);
    // const toDetail = React.useCallback(() => {
    //   // handleChangeIndex(0);
    //   setShowNFTWithdraw({
    //     isShow: false,
    //     info: { isShowLocal: false },
    //   });
    //   setShowNFTTransfer({
    //     isShow: false,
    //     info: { isShowLocal: false },
    //   });
    // }, [popItem, setShowNFTWithdraw]);

    // const toWithdraw = React.useCallback(
    //   (isToMySelf?: boolean) => {
    //     setShowNFTWithdraw({
    //       ...popItem,
    //       isShow: false,
    //       info: { isToMyself: isToMySelf, isShowLocal: true },
    //     });
    //     handleChangeIndex(2);
    //   },
    //   [popItem, setShowNFTWithdraw]
    // );

    // const toTransfer = React.useCallback(() => {
    //   setShowNFTTransfer({
    //     ...popItem,
    //     isShow: false,
    //     info: { isShowLocal: true },
    //   });
    //   handleChangeIndex(1);
    // }, [popItem, setShowNFTTransfer]);

    const detailView = React.useMemo(() => {
      return (
        <Box
          flexDirection={"column"}
          display={"flex"}
          className={"detail-info"}
          maxWidth={isMobile ? "var(--mobile-full-panel-width)" : 550}
        >
          <InformationForNoMetaNFT
            open={!!showDialog}
            method={showDialog}
            handleClose={(_e, isAgress) => {
              setShowDialog(undefined);
              if (isAgress && showDialog) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.SendNFTGateway,
                });
                //
                // switch (showDialog?.toLowerCase()) {
                //   case "withdraw":
                //     toWithdraw(isShowNFTWithdraw.info?.isToMyself);
                //     break;
                //   case "transfer":
                //     toTransfer();
                //     break;
                // }
              }
            }}
          />
          <Box marginBottom={3} display={"flex"} alignItems={"center"}>
            <Typography color={"text.primary"} variant={"h2"} marginBottom={1}>
              {popItem?.name ?? EmptyValueTag}
            </Typography>
          </Box>

          <Box
            display={"flex"}
            flexDirection={isMobile ? "column" : "row"}
            justifyContent={"flex-end"}
            marginBottom={2}
            paddingRight={3}
          >
            {!!(
              popItem.isCounterFactualNFT &&
              popItem.deploymentStatus === DEPLOYMENT_STATUS.NOT_DEPLOYED &&
              popItem.minter?.toLowerCase() === account.accAddress.toLowerCase()
            ) && (
              <Box>
                <Button
                  variant={"outlined"}
                  size={"medium"}
                  fullWidth
                  onClick={() =>
                    deployNFT.enable
                      ? setShowNFTDeploy({
                          isShow: true,
                          info: { ...popItem },
                        })
                      : setShowTradeIsFrozen({ isShow: true })
                  }
                >
                  {t("labelNFTDeployContract")}
                </Button>
              </Box>
            )}
            <Box className={isMobile ? "isMobile" : ""} width={"40%"}>
              <Button
                variant={"contained"}
                size={"small"}
                fullWidth
                onClick={() =>
                  setShowAccount({
                    isShow: true,
                    step: AccountStep.SendNFTGateway,
                    info: { ...popItem },
                  })
                }
                // deployNFT.enable
                //   ? setShowNFTDeploy({
                //     isShow: true,
                //     info: { ...popItem },
                //   })
                //   : setShowTradeIsFrozen({ isShow: true })
              >
                {t("labelNFTSendBtn")}
              </Button>
            </Box>
          </Box>

          <Box
            display={"flex"}
            flexDirection={"column"}
            marginBottom={2}
            paddingRight={3}
          >
            <Typography component={"h6"} color={"text.primary"} variant={"h4"}>
              {t("labelNFTDetail")}
            </Typography>
            {/*<Typography*/}
            {/*  display={"inline-flex"}*/}
            {/*  flexDirection={isMobile ? "column" : "row"}*/}
            {/*  variant={"body1"}*/}
            {/*  marginBottom={1}*/}
            {/*>*/}
            {/*  <Typography*/}
            {/*    color={"var(--color-text-third)"}*/}
            {/*    width={150}*/}
            {/*    textOverflow={"ellipsis"}*/}
            {/*  >*/}
            {/*    {t("labelNFTName")}*/}
            {/*  </Typography>*/}
            {/*  <Typography*/}
            {/*    color={"var(--color-text-secondary)"}*/}
            {/*    title={popItem?.name}*/}
            {/*    whiteSpace={"pre"}*/}
            {/*    overflow={"hidden"}*/}
            {/*    textOverflow={"ellipsis"}*/}
            {/*  >*/}
            {/*    {popItem?.name ?? EmptyValueTag}*/}
            {/*  </Typography>*/}
            {/*</Typography>*/}
            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              variant={"body1"}
              marginBottom={1}
            >
              <Typography color={"var(--color-text-third)"} width={150}>
                {t("labelNFTTOTAL")}
              </Typography>
              <Typography
                color={"var(--color-text-secondary)"}
                title={popItem?.total}
              >
                {Number(popItem.total) - Number(popItem.locked ?? 0)}
              </Typography>
            </Typography>
            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              variant={"body1"}
              marginTop={1}
            >
              <Typography color={"var(--color-text-third)"} width={150}>
                {t("labelNFTID")}
              </Typography>
              <Link
                fontSize={"inherit"}
                whiteSpace={"break-spaces"}
                display={"inline-flex"}
                alignItems={"center"}
                style={{ wordBreak: "break-all" }}
                target="_blank"
                rel="noopener noreferrer"
                href={
                  Explorer +
                  `nft/${popItem.minter}-${NFTType[popItem.nftType ?? 0]}-${
                    popItem.tokenAddress
                  }-${popItem.nftId}-${popItem.royaltyPercentage}`
                  // ${minterAddress}-0-${tokenAddress}-${nftid}
                  // -0--0x01348998000000000000000002386f26fc100000000000000000000000000066-0
                }
                title={popItem?.nftId}
                width={"fit-content"}
              >
                #
                {" " +
                  getShortAddr(
                    popItem?.nftIdView ? popItem.nftIdView : popItem.nftId ?? ""
                  )}{" "}
                <LinkIcon color={"inherit"} fontSize={"medium"} />
              </Link>
            </Typography>
            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              variant={"body1"}
              marginTop={1}
            >
              <Typography color={"var(--color-text-third)"} width={150}>
                {t("labelNFTContractAddress")}
              </Typography>
              <Link
                fontSize={"inherit"}
                whiteSpace={"break-spaces"}
                style={{ wordBreak: "break-all" }}
                target="_blank"
                rel="noopener noreferrer"
                href={`${etherscanBaseUrl}token/${popItem.tokenAddress}?a=${popItem.nftId}`}
              >
                {popItem.tokenAddress}
              </Link>
            </Typography>
            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              variant={"body1"}
              marginTop={1}
            >
              <Typography color={"var(--color-text-third)"} width={150}>
                {t("labelNFTTYPE")}
              </Typography>
              <Typography
                color={"var(--color-text-secondary)"}
                title={popItem?.nftType}
              >
                {popItem?.nftType}
              </Typography>
            </Typography>

            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              variant={"body1"}
              marginTop={1}
            >
              <Typography color={"var(--color-text-third)"} width={150}>
                {t("labelNFTMinter")}
              </Typography>

              <Link
                fontSize={"inherit"}
                whiteSpace={"break-spaces"}
                style={{ wordBreak: "break-all" }}
                onClick={() => {
                  window.open(
                    `${etherscanBaseUrl}address/${popItem.minter}`,
                    "blank"
                  );
                  window.opener = null;
                }}
              >
                {popItem.minter}
              </Link>
            </Typography>

            {/*<BoxBtnStyle className={isMobile ? "isMobile" : ""}>*/}
            {/*  <Typography color={"var(--color-text-third)"} width={150}>*/}
            {/*    {t("labelNFTSend")}*/}
            {/*  </Typography>*/}
            {/*  <Box flex={1} display={"flex"} flexDirection={"column"}>*/}
            {/*    <Typography className={"btn"} minWidth={100} marginRight={2}>*/}
            {/*      <Button*/}
            {/*        variant={"contained"}*/}
            {/*        size={"small"}*/}
            {/*        color={"primary"}*/}
            {/*        fullWidth*/}
            {/*        disabled={*/}
            {/*          popItem.isCounterFactualNFT &&*/}
            {/*          popItem.deploymentStatus === DEPLOYMENT_STATUS.DEPLOYING*/}
            {/*        }*/}
            {/*        onClick={() => {*/}
            {/*          isKnowNFTNoMeta*/}
            {/*            ? withdrawNFT.enable*/}
            {/*              ? toWithdraw(true)*/}
            {/*              : setShowTradeIsFrozen({ isShow: true })*/}
            {/*            : setShowDialog("Withdraw");*/}
            {/*        }}*/}
            {/*      >*/}
            {/*        {popItem.isCounterFactualNFT &&*/}
            {/*        popItem.deploymentStatus ===*/}
            {/*          DEPLOYMENT_STATUS.NOT_DEPLOYED ? (*/}
            {/*          t("labelNFTDeploySendMyL1")*/}
            {/*        ) : popItem.isCounterFactualNFT &&*/}
            {/*          popItem.deploymentStatus ===*/}
            {/*            DEPLOYMENT_STATUS.DEPLOYING ? (*/}
            {/*          <>*/}
            {/*            <LoadingIcon*/}
            {/*              color={"primary"}*/}
            {/*              style={{*/}
            {/*                width: 18,*/}
            {/*                height: 18,*/}
            {/*                marginRight: "8px",*/}
            {/*              }}*/}
            {/*            />*/}
            {/*            {t("labelNFTDeploying")}*/}
            {/*          </>*/}
            {/*        ) : (*/}
            {/*          t("labelNFTSendMyL1Btn")*/}
            {/*        )}*/}
            {/*      </Button>*/}
            {/*    </Typography>*/}

            {/*    /!*<Typography className={"btn"} minWidth={100} marginRight={2}>*!/*/}
            {/*    /!*  <Button*!/*/}
            {/*    /!*    variant={"contained"}*!/*/}
            {/*    /!*    size={"small"}*!/*/}
            {/*    /!*    color={"primary"}*!/*/}
            {/*    /!*    fullWidth*!/*/}
            {/*    /!*    disabled={*!/*/}
            {/*    /!*      popItem.isCounterFactualNFT &&*!/*/}
            {/*    /!*      popItem.deploymentStatus === DEPLOYMENT_STATUS.DEPLOYING*!/*/}
            {/*    /!*    }*!/*/}
            {/*    /!*    onClick={() => {*!/*/}
            {/*    /!*      isKnowNFTNoMeta*!/*/}
            {/*    /!*        ? withdrawNFT.enable*!/*/}
            {/*    /!*          ? toWithdraw(false)*!/*/}
            {/*    /!*          : setShowTradeIsFrozen({ isShow: true })*!/*/}
            {/*    /!*        : setShowDialog("Withdraw");*!/*/}
            {/*    /!*    }}*!/*/}
            {/*    /!*  >*!/*/}
            {/*    /!*    {popItem.isCounterFactualNFT &&*!/*/}
            {/*    /!*    popItem.deploymentStatus ===*!/*/}
            {/*    /!*      DEPLOYMENT_STATUS.NOT_DEPLOYED ? (*!/*/}
            {/*    /!*      t("labelNFTDeploySendAnotherL1")*!/*/}
            {/*    /!*    ) : popItem.isCounterFactualNFT &&*!/*/}
            {/*    /!*      popItem.deploymentStatus ===*!/*/}
            {/*    /!*        DEPLOYMENT_STATUS.DEPLOYING ? (*!/*/}
            {/*    /!*      <>*!/*/}
            {/*    /!*        <LoadingIcon*!/*/}
            {/*    /!*          color={"primary"}*!/*/}
            {/*    /!*          style={{*!/*/}
            {/*    /!*            width: 18,*!/*/}
            {/*    /!*            height: 18,*!/*/}
            {/*    /!*            marginRight: "8px",*!/*/}
            {/*    /!*          }}*!/*/}
            {/*    /!*        />*!/*/}
            {/*    /!*        {t("labelNFTDeploying")}*!/*/}
            {/*    /!*      </>*!/*/}
            {/*    /!*    ) : (*!/*/}
            {/*    /!*      t("labelNFTSendOtherL1Btn")*!/*/}
            {/*    /!*    )}*!/*/}
            {/*    /!*  </Button>*!/*/}
            {/*    /!*</Typography>*!/*/}

            {/*    /!*<Typography className={"btn"} minWidth={100} marginRight={2}>*!/*/}
            {/*    /!*  <Button*!/*/}
            {/*    /!*    variant={"contained"}*!/*/}
            {/*    /!*    size={"small"}*!/*/}
            {/*    /!*    color={"primary"}*!/*/}
            {/*    /!*    fullWidth*!/*/}
            {/*    /!*    // disabled={isKnowNFTNoMeta ? true : false}*!/*/}
            {/*    /!*    onClick={() =>*!/*/}
            {/*    /!*      isKnowNFTNoMeta*!/*/}
            {/*    /!*        ? transferNFT.enable*!/*/}
            {/*    /!*          ? setShowNFTTransfer()*!/*/}
            {/*    /!*          : setShowTradeIsFrozen({ isShow: true })*!/*/}
            {/*    /!*        : setShowDialog("Transfer")*!/*/}
            {/*    /!*    }*!/*/}
            {/*    /!*  >*!/*/}
            {/*    /!*    {t("labelNFTSendL2Btn")}*!/*/}
            {/*    /!*  </Button>*!/*/}
            {/*    /!*</Typography>*!/*/}
            {/*  </Box>*/}
            {/*</BoxBtnStyle>*/}
          </Box>

          <Box
            display={"flex"}
            flexDirection={"column"}
            marginBottom={2}
            paddingRight={3}
          >
            <Typography component={"h6"} color={"text.primary"} variant={"h4"}>
              {t("labelNFTProperties")}
            </Typography>
            <Box
              flex={1}
              marginBottom={1}
              display={"flex"}
              flexDirection={"column"}
            >
              {!!properties
                ? Object.keys(properties).map((key, index) => {
                    // @ts-ignore
                    return (
                      <Typography
                        key={key.toString() + index}
                        display={"inline-flex"}
                        flexDirection={isMobile ? "column" : "row"}
                        variant={"body1"}
                        marginTop={1}
                      >
                        <Typography
                          color={"var(--color-text-third)"}
                          width={150}
                        >
                          {key.toString()}
                        </Typography>
                        <Typography
                          color={"var(--color-text-secondary)"}
                          title={key.toString()}
                        >
                          {
                            // @ts-ignore
                            properties[key.toString()] ?? EmptyValueTag
                          }
                        </Typography>
                      </Typography>
                    );
                  })
                : EmptyValueTag}
            </Box>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            marginBottom={2}
            paddingRight={3}
          >
            <Typography component={"h6"} color={"text.primary"} variant={"h4"}>
              {t("labelNFTDescription")}
            </Typography>
            <Box flex={1}>
              <TextareaAutosizeStyled
                aria-label="NFT Description"
                minRows={2}
                maxRows={5}
                disabled={true}
                value={`${popItem.description}` ?? EmptyValueTag}
              />
            </Box>
          </Box>

          {/*<Box marginBottom={3} display={"flex"} alignItems={"center"}>*/}
          {/*  <Typography color={"text.primary"} variant={"h2"} marginBottom={1}>*/}
          {/*    # {" " + getShortAddr(popItem?.nftId ?? "")}*/}
          {/*  </Typography>*/}
          {/*</Box>*/}
        </Box>
      );
    }, [showDialog, popItem, t, isKnowNFTNoMeta, etherscanBaseUrl]);
    const theme = useTheme();
    const style = isMobile
      ? {
          width: 300,
          height: 300,
          margin: theme.unit,
          marginTop: 0,
          cursor: "pointer",
        }
      : {
          margin: theme.unit,
          marginTop: -4 * theme.unit,
          width: 570,
          height: 570,
          cursor: "pointer",
        };
    return (
      <>
        {!isMobile && (
          <BoxNFT
            display={"flex"}
            style={style}
            alignItems={"center"}
            justifyContent={"center"}
            position={"relative"}
          >
            <NFTMedia
              item={popItem}
              onNFTError={() => undefined}
              isOrigin={true}
            />
          </BoxNFT>
        )}
        <BoxStyle
          isMobile={isMobile}
          image={popItem.image}
          marginLeft={2}
          display={"flex"}
          flex={1}
          flexDirection={"column"}
          alignItems={"center"}
          className={"nft-detail"}
          whiteSpace={"break-spaces"}
          style={{ wordBreak: "break-all" }}
        >
          {/*{viewPage === 0 && detailView}*/}
          {detailView}
        </BoxStyle>
      </>
    );
  }
);
