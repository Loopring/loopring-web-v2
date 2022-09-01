import {
  Toast,
  useOpenModals,
  useToggle,
  CollectionCardList,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { Box, Button, Grid, Pagination, Typography } from "@mui/material";
import React, { useState } from "react";
import styled from "@emotion/styled/";
import {
  CollectionMeta,
  CreateCollectionStep,
  TradeNFT,
  TOAST_TIME,
  AddIcon,
} from "@loopring-web/common-resources";
import {
  LoopringAPI,
  useAccount,
  useModalData,
  useMyCollection,
} from "@loopring-web/core";
import { CreateUrlPanel } from "../components/landingPanel";
import { useHistory } from "react-router-dom";
import { NFTType } from "@loopring-web/loopring-sdk";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

const CommonPanel = () => {
  return <></>;
};
export const NFTCollectPanel = <Co extends CollectionMeta>() => {
  const { t } = useTranslation(["common"]);
  const { copyToastOpen, ...collectionListProps } = useMyCollection();
  const [showCreateOpen, setCreateOpen] = React.useState(false);
  const [step, setStep] = React.useState(CreateCollectionStep.ChooseMethod);
  const history = useHistory();
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
            // history.push("/nft/addCollection");
            // setCreateOpen(true)
          }}
          setShowMintNFT={(item) => {
            setCreateOpen(true);
            history.push(`/nft/mintNFT/${item.contractAddress}`);
          }}
          setShowDeploy={(item: Co) => {
            const _deployItem: TradeNFT<any, any> = {
              tokenAddress: item?.contractAddress,
              nftType: NFTType[item.nftType ?? 0],
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
              : setShowTradeIsFrozen({ isShow: true });
          }}
        />
      </Box>
      <CreateUrlPanel
        open={showCreateOpen}
        step={step}
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
