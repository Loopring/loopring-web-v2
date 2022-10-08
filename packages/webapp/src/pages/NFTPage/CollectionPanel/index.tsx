import {
  Toast,
  useOpenModals,
  useToggle,
  CollectionCardList,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { Box, Button, Typography } from "@mui/material";
import React from "react";
import {
  CollectionMeta,
  CreateCollectionStep,
  TradeNFT,
  TOAST_TIME,
  AddIcon,
} from "@loopring-web/common-resources";
import {
  getIPFSString,
  LoopringAPI,
  useAccount,
  useModalData,
  useMyCollection,
  useSystem,
} from "@loopring-web/core";
import { CreateUrlPanel } from "../components/landingPanel";
import { useHistory, useRouteMatch } from "react-router-dom";
import { CollectionDetailView } from "../components/CollectionDetailView";

enum MyCollectionView {
  List = "List",
  Item = "Item",
}

export const NFTCollectPanel = <Co extends CollectionMeta>() => {
  const { t } = useTranslation(["common"]);
  const { baseURL } = useSystem();
  const { copyToastOpen, ...collectionListProps } = useMyCollection();
  const [showCreateOpen, setCreateOpen] = React.useState(false);
  const [view, setView] = React.useState<MyCollectionView>(
    MyCollectionView.List
  );
  const { updateCollectionData } = useModalData();

  const [detail, setDetail] =
    React.useState<CollectionMeta | undefined>(undefined);
  const history = useHistory();
  const match: any = useRouteMatch("/nft/myCollection/:id");
  React.useEffect(() => {
    if (match?.params?.id) {
      const loopringId = match.params.id.split("-")[0];
      if (loopringId && detail) {
        setView(MyCollectionView.Item);
      } else {
        setView(MyCollectionView.List);
      }
    }
  }, [match?.params?.id]);

  const { account } = useAccount();
  const {
    toggle: { deployNFT },
  } = useToggle();
  const { setShowNFTDeploy, setShowTradeIsFrozen } = useOpenModals();
  const { updateNFTDeployData } = useModalData();
  return (
    <Box
      flex={1}
      marginTop={0}
      marginBottom={2}
      display={"flex"}
      flexDirection={"column"}
    >
      {view === MyCollectionView.List && (
        <>
          <Box
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Typography component={"h3"} variant={"h4"} paddingBottom={2}>
              {t("labelMyCollection")}
            </Typography>
            <Box display={"flex"} flexDirection={"row"}>
              <Button
                onClick={() => {
                  history.push("/nft/addCollection");
                  // setStep(CreateCollectionStep.ChooseMethod);
                  // setCreateOpen(true);
                }}
                startIcon={<AddIcon />}
                variant={"outlined"}
                color={"primary"}
              >
                {t("labelCreateCollection")}
              </Button>
            </Box>
          </Box>
          <Box flex={1} paddingBottom={2} display={"flex"}>
            <CollectionCardList
              {...{ ...(collectionListProps as any) }}
              account={account}
              toggle={deployNFT}
              setShowEdit={(item) => {
                updateCollectionData({ ...item });
                history.push(
                  `/nft/editCollection/${item.id}-${item.contractAddress}`
                );
              }}
              onItemClick={(item) => {
                history.push(
                  `/nft/myCollection/${item.id}-${item.contractAddress}`
                );
                setDetail(item);
              }}
              setShowMintNFT={(item) => {
                setCreateOpen(true);
                history.push(`/nft/mintNFT/${item.contractAddress}`);
              }}
              setShowTradeIsFrozen={(item, typeKey) => {
                setShowTradeIsFrozen({
                  isShow: true,
                  type: typeKey,
                });
              }}
              setShowDeploy={(item: Co) => {
                const _deployItem: TradeNFT<any, any> = {
                  tokenAddress: item?.contractAddress,
                  nftType: item.nftType,
                  collectionMeta: item,
                };
                LoopringAPI.userAPI
                  ?.getAvailableBroker({ type: 0 })
                  .then(({ broker }) => {
                    updateNFTDeployData({ broker });
                  });
                updateNFTDeployData(_deployItem);
                deployNFT.enable
                  ? setShowNFTDeploy({
                      isShow: true,
                      info: { ...{ _deployItem } },
                    })
                  : setShowTradeIsFrozen({
                      isShow: true,
                      type: t("nftDeployDescription"),
                    });
              }}
            />
          </Box>
        </>
      )}
      {view === MyCollectionView.Item && detail && (
        <Box flex={1} display={"flex"}>
          <CollectionDetailView
            collectionDate={detail}
            getIPFSString={getIPFSString}
            baseURL={baseURL}
            setShowEdit={(item) => {
              updateCollectionData({ ...item });
              history.push(
                `/nft/editCollection/${item.id}-${item.contractAddress}`
              );
            }}
            setCopyToastOpen={collectionListProps.setCopyToastOpen}
          />
        </Box>
      )}
      <CreateUrlPanel
        open={showCreateOpen}
        step={CreateCollectionStep.ChooseMethod}
        onClose={() => {
          setCreateOpen(false);
        }}
      />
      <Toast
        alertText={
          copyToastOpen?.type === "json"
            ? t("labelCopyMetaClip")
            : copyToastOpen.type === "url"
            ? t("labelCopyUrlClip")
            : t("labelCopyAddClip")
        }
        open={copyToastOpen?.isShow}
        autoHideDuration={TOAST_TIME}
        onClose={() => {
          collectionListProps.setCopyToastOpen({ isShow: false, type: "" });
        }}
        severity={"success"}
      />
    </Box>
  );
};
