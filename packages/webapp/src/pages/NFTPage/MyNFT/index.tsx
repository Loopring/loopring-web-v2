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
    const checkCollection = async () => {
      const [contract, id] = match?.params?.contract?.split("|");

      if (contract !== undefined && id !== undefined && LoopringAPI.userAPI) {
        const collectionMeta = walletL2NFTCollection.find((item) => {
          return (
            Number(item.id) === Number(id) &&
            item.contractAddress?.toLowerCase() === contract.toLowerCase()
          );
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
            const collectionMeta = collections.find((item: any) => {
              return (
                Number(item.id) === Number(id) &&
                item.collection.contractAddress?.toLowerCase() ===
                  contract.toLowerCase()
              );
            });

            setCollectionMeta({
              ...collectionMeta.collection,
              count: collectionMeta.count,
            });
            return;
          } else {
            history.push({ pathname: "/NFT/assetsNFT", search });
          }
        }
      }
    };
    React.useEffect(() => {
      checkCollection();
    }, [match.params?.contract]);

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
                  collection: collectionMeta
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
