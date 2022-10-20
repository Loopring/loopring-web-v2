import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { MyNFTList } from "./MyNFTList";
import {
  LoopringAPI,
  NFTDetail,
  useAccount,
  useSystem,
  useToast,
  useWalletL2NFTCollection,
} from "@loopring-web/core";
import {
  BackIcon,
  CollectionLimit,
  CustomError,
  EmptyValueTag,
  ErrorMap,
  getShortAddr,
  SoursURL,
  CollectionMeta,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { MyNFTCollectionList } from "./MyNFTCollectionList";
import { Box, Breadcrumbs, Link, Tab, Tabs, Typography } from "@mui/material";
import {
  Button,
  Toast,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import { sanitize } from "dompurify";

enum MY_NFT_VIEW {
  LIST_COLLECTION = "byCollection",
  LIST_NFT = "byList",
  // ITEM = "item",
}

export const MyNFTPanel = withTranslation("common")(
  ({ t }: WithTranslation) => {
    const match: any = useRouteMatch("/NFT/assetsNFT/:tab?/:contract?");
    const { walletL2NFTCollection } = useWalletL2NFTCollection();
    const [currentTab, setCurrentTab] = React.useState(() => {
      return match?.params.tab === MY_NFT_VIEW.LIST_COLLECTION
        ? MY_NFT_VIEW.LIST_COLLECTION
        : MY_NFT_VIEW.LIST_NFT;
    });
    const { toastOpen, closeToast } = useToast();
    const { isMobile } = useSettings();
    const { baseURL, etherscanBaseUrl } = useSystem();
    const history = useHistory();
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    const {
      account: { accountId, apiKey },
    } = useAccount();
    const [collectionMeta, setCollectionMeta] =
      React.useState<undefined | CollectionMeta>(undefined);
    const checkCollection = async () => {
      const [id, contract] = !!match?.params?.contract
        ? match?.params?.contract.split("--")
        : [null, null];
      if (contract !== undefined && id !== undefined && LoopringAPI.userAPI) {
        const collectionMeta = walletL2NFTCollection.find((item) => {
          return (
            (id !== undefined ? Number(item.id) === Number(id) : true) &&
            item.contractAddress?.toLowerCase() === contract.toLowerCase()
          );
        });
        if (collectionMeta) {
          setCollectionMeta(collectionMeta);
          return;
        } else {
          //TODO: getNFTCOllection By NFTID
          const response = await LoopringAPI.userAPI
            .getUserNFTCollection(
              {
                // @ts-ignore
                tokenAddress: contract,
                accountId: accountId.toString(),
                limit: CollectionLimit,
              },
              apiKey
            )
            .catch((_error) => {
              throw new CustomError(ErrorMap.TIME_OUT);
            });
          if (
            response &&
            ((response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message)
          ) {
            throw new CustomError(ErrorMap.ERROR_UNKNOWN);
          }
          const collections = response.collections;
          if (collections.length) {
            const collectionMeta = collections.find((item: any) => {
              return (
                (id !== undefined ? Number(item.id) === Number(id) : true) &&
                item.contractAddress?.toLowerCase() === contract.toLowerCase()
              );
            });

            setCollectionMeta(collectionMeta);
            return;
          } else {
            history.push({ pathname: "/NFT/assetsNFT/byCollection", search });
          }
        }
      }
    };

    const {
      modals: { isShowNFTDetail },
      setShowNFTDetail,
    } = useOpenModals();
    React.useEffect(() => {
      const [id, contract] = !!match?.params?.contract
        ? match?.params?.contract.split("--")
        : [null, null];
      if (contract && id && contract.startsWith("0x")) {
        checkCollection();
      }
      return () => {
        setShowNFTDetail({ isShow: false });
      };
    }, [match?.params?.contract]);
    const breadcrumbs = React.useMemo(() => {
      const [id, contract] = !!match?.params?.contract
        ? match?.params?.contract.split("--")
        : [null, null];
      return [
        <Link
          underline="hover"
          key="1"
          color="inherit"
          onClick={() => {
            history.replace(
              `/NFT/assetsNFT/${
                match?.params?.tab ?? "byList"
              }?${searchParams.toString()}`
            );
            setShowNFTDetail({ isShow: false });
          }}
        >
          {t("labelNFTTitleMyNFT")}
        </Link>,
        ...[
          match?.params?.tab === MY_NFT_VIEW.LIST_COLLECTION &&
          contract &&
          id &&
          contract.startsWith("0x")
            ? [
                <Link
                  underline="hover"
                  key="2"
                  color="inherit"
                  onClick={() => {
                    history.replace(
                      `/NFT/assetsNFT/${
                        MY_NFT_VIEW.LIST_COLLECTION
                      }?${searchParams.toString()}`
                    );
                    setShowNFTDetail({ isShow: false });
                  }}
                >
                  <Typography
                    component={"span"}
                    color={"inherit"}
                    dangerouslySetInnerHTML={{
                      __html: sanitize(
                        t("labelNFTMyCollection", {
                          collection: collectionMeta
                            ? collectionMeta.name
                              ? collectionMeta?.name
                              : t("labelUnknown") +
                                " - " +
                                getShortAddr(
                                  collectionMeta.contractAddress ?? ""
                                )
                            : EmptyValueTag,
                        })
                      ),
                    }}
                  />
                </Link>,
              ]
            : [],
        ],
        <Typography key="3" color={"textPrimary"}>
          {t("labelDetail")}
        </Typography>,
      ];
    }, [
      match?.params?.contract,
      match?.params?.tab,
      collectionMeta,
      searchParams,
    ]);
    return (
      <Box flex={1} display={"flex"} flexDirection={"column"}>
        {match?.params?.contract && !isShowNFTDetail?.isShow ? (
          <>
            <Box
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              marginBottom={2}
            >
              <Button
                startIcon={<BackIcon fontSize={"small"} />}
                variant={"text"}
                size={"medium"}
                sx={{ color: "var(--color-text-secondary)" }}
                color={"inherit"}
                onClick={() =>
                  history.push({
                    pathname: "/NFT/assetsNFT/byCollection",
                    search,
                  })
                }
              >
                <Typography
                  component={"span"}
                  color={"inherit"}
                  dangerouslySetInnerHTML={{
                    __html: sanitize(
                      t("labelNFTMyNFT", {
                        collection: collectionMeta
                          ? collectionMeta.name
                            ? collectionMeta?.name
                            : t("labelUnknown") +
                              " - " +
                              getShortAddr(collectionMeta.contractAddress ?? "")
                          : EmptyValueTag,
                      })
                    ),
                  }}
                />
              </Button>
            </Box>
            {collectionMeta ? (
              <Box
                flex={1}
                display={"flex"}
                flexDirection={"column"}
                justifyContent={""}
                alignItems={"stretch"}
              >
                <MyNFTList
                  collectionMeta={collectionMeta}
                  collectionPage={
                    searchParams?.get("collectionPage")
                      ? Number(searchParams?.get("collectionPage"))
                      : 1
                  }
                  myNFTPage={
                    searchParams?.get("myNFTPage")
                      ? Number(searchParams?.get("myNFTPage"))
                      : 1
                  }
                />
              </Box>
            ) : (
              <Box
                flex={1}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                height={"90%"}
              >
                <img
                  className="loading-gif"
                  alt={"loading"}
                  width="36"
                  src={`${SoursURL}images/loading-line.gif`}
                />
              </Box>
            )}
          </>
        ) : isShowNFTDetail.isShow ? (
          <>
            {/*<Breadcrumbs separator="›" aria-label="breadcrumb">*/}
            <Breadcrumbs
              separator={
                <BackIcon
                  fontSize={"small"}
                  sx={{ transform: "rotate(180deg)" }}
                />
              }
              aria-label="breadcrumb"
            >
              {breadcrumbs}
            </Breadcrumbs>
            <NFTDetail
              baseURL={baseURL}
              etherscanBaseUrl={etherscanBaseUrl}
              popItem={isShowNFTDetail}
              assetsRawData={[]}
            />
          </>
        ) : (
          <>
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={isMobile ? "stretch" : "center"}
              marginBottom={1}
              flexDirection={isMobile ? "column" : "row"}
            >
              <Tabs
                value={currentTab}
                onChange={(_event, value) => {
                  history.replace({
                    pathname: `/NFT/assetsNFT/${value}`,
                    search: "",
                  });
                  setCurrentTab(value);
                }}
                aria-label="my-nft-tabs"
                variant="scrollable"
                sx={{ order: isMobile ? 1 : 0 }}
              >
                <Tab
                  label={t("labelNFTMyNFTList")}
                  value={MY_NFT_VIEW.LIST_NFT}
                />
                <Tab
                  label={t("labelNFTMyNFTCollection")}
                  value={MY_NFT_VIEW.LIST_COLLECTION}
                />
              </Tabs>
              <Box
                sx={{ order: isMobile ? 0 : 0 }}
                display={"flex"}
                flexDirection={"row"}
                paddingX={isMobile ? 0 : 5 / 2}
                paddingY={isMobile ? 2 : 0}
              >
                <Box marginLeft={1}>
                  <Button
                    variant={"contained"}
                    size={"small"}
                    color={"primary"}
                    onClick={() => history.push("/nft/depositNFT")}
                  >
                    {t("labelL1toL2NFT")}
                  </Button>
                </Box>
                <Box marginLeft={1}>
                  <Button
                    variant={"outlined"}
                    color={"primary"}
                    onClick={() => history.push("/nft/transactionNFT")}
                  >
                    {t("labelTransactionNFT")}
                  </Button>
                </Box>
              </Box>
            </Box>
            <Box display={"flex"} flex={1}>
              {currentTab === MY_NFT_VIEW.LIST_NFT && (
                <MyNFTList
                  collectionMeta={undefined}
                  myNFTPage={
                    searchParams?.get("myNFTPage")
                      ? Number(searchParams?.get("myNFTPage"))
                      : 1
                  }
                />
              )}
              {currentTab === MY_NFT_VIEW.LIST_COLLECTION && (
                <MyNFTCollectionList />
              )}
            </Box>
          </>
        )}

        <Toast
          alertText={toastOpen?.content ?? ""}
          severity={toastOpen?.type ?? "success"}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />
      </Box>
    );
  }
);
