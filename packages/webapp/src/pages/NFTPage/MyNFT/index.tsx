import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { MyNFTList } from "./NFTList";
import {
  LoopringAPI,
  useAccount,
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
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { MyNFTCollectionList } from "./MyNFTCollectionList";
import { Box, Typography } from "@mui/material";
import { Button } from "@loopring-web/component-lib";

enum MY_NFTVIEW {
  LIST_COLLECTION = "LIST_COLLECTION",
  LIST_NFT = "LIST_NFT",
}

export const MyNFTPanel = withTranslation("common")(
  ({ t }: WithTranslation) => {
    let match: any = useRouteMatch("/NFT/assetsNFT/:contract?");
    const { walletL2NFTCollection } = useWalletL2NFTCollection();
    const history = useHistory();
    const { search } = useLocation();
    const {
      account: { accountId, apiKey },
    } = useAccount();
    const [collectionMeta, setCollectionMeta] =
      React.useState<undefined | sdk.CollectionMeta>(undefined);
    const checkCollectin = async () => {
      if (match?.params?.contract && LoopringAPI.userAPI) {
        const [contract, id] = match.params.contract.split("-")[0];
        const collectionMeta = walletL2NFTCollection.find((item) => {
          if (id) {
            return item.id === id;
          } else {
            return item.contractAddress === contract;
          }
        });
        if (collectionMeta) {
          setCollectionMeta(collectionMeta);
          return;
        } else {
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
            let collectionMeta;
            if (id) {
              collectionMeta = walletL2NFTCollection.find((item) => {
                if (id) {
                  return (item.id = id);
                }
              });
            }
            if (!collectionMeta) {
              collectionMeta = collections[0];
            }
            setCollectionMeta(collectionMeta);
            return;
          } else {
            history.push({ pathname: "/NFT/assetsNFT", search });
          }
        }
      }
    };
    React.useEffect(() => {
      checkCollectin();
    }, [match.params?.contract]);
    // const [contract, setContract] = React.useState(match.params.contract);

    // const [view, setView] = React.useState<MY_NFTVIEW>(
    //   match.params.contract ? MY_NFTVIEW.LIST_NFT : MY_NFTVIEW.LIST_COLLECTION
    // );

    // React.useEffect(() => {
    //   if (match?.params?.contract && contract !== match.params.contract) {
    //     setContract(match.params.contract);
    //     setView(MY_NFTVIEW.LIST_NFT);
    //     //TODO:
    //   } else {
    //     setView(MY_NFTVIEW.LIST_COLLECTION);
    //   }
    // }, [match.params.contract]);

    return (
      <Box flex={1} display={"flex"} flexDirection={"column"}>
        {match.params?.contract ? (
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
                  history.push({ pathname: "/NFT/assetsNFT", search })
                }
              >
                {t("labelNFTMyNFT", {
                  type: collectionMeta
                    ? collectionMeta.name +
                      " " +
                      getShortAddr(collectionMeta.contractAddress ?? "")
                    : EmptyValueTag,
                })}
              </Button>
            </Box>
            {collectionMeta ? (
              <MyNFTList collectionMeta={collectionMeta} />
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
        ) : (
          <MyNFTCollectionList />
        )}
      </Box>
    );
  }
);
