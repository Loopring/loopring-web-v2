import {
  Toast,
  useOpenModals,
  useToggle,
  CollectionCardList,
  CollectionListProps,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { Box, Button, Grid, Pagination } from "@mui/material";
import React, { useState } from "react";
import styled from "@emotion/styled/";
import {
  CollectionMeta,
  CreateCollectionStep,
  TradeNFT,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import {
  LoopringAPI,
  useAccount,
  useModalData,
  useMyCollection,
} from "@loopring-web/core";
import { CreateUrlPanel } from "../components/landingPanel";
import { useHistory } from "react-router-dom";

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
  // TODO: MOCK
  // const collectionList = [
  // 	{
  // 		"id": 4,
  // 		"owner": "0xfF7d59D9316EBA168837E3eF924BCDFd64b237D8",
  // 		"name": "test1",
  // 		"contractAddress": "0x",
  // 		"isPublic": false,
  // 		"baseUri": "0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  // 		"nftFactory": "0x25315F9878BA07221db684b7ad3676502E914894",
  // 		"collectionTitle": "",
  // 		"description": "desc",
  // 		"avatar": "avatar",
  // 		"banner": "banner",
  // 		"thumbnail": "",
  // 		"cid": "ipfs://QmRiUrgoTVfVERfPfg6dHeH8LQVpa7xf8VutYqZ5V4kgVE",
  // 		"tileUri": "ipfs://QmRiUrgoTVfVERfPfg6dHeH8LQVpa7xf8VutYqZ5V4kgVE",
  // 		"deployStatus": DEPLOYMENT_STATUS.NOT_DEPLOYED,
  // 		"createdAt": 1658480151042,
  // 		"updatedAt": 1658480151042,
  // 		"nftType": NFTType.ERC1155,
  // 	},
  // 	{
  // 		"id": 5,
  // 		"owner": "0xfF7d59D9316EBA168837E3eF924BCDFd64b237D8",
  // 		"name": "test12",
  // 		"contractAddress": "0x0280e07385F1aCD12daDd342911bf7e7B2De7fD6",
  // 		"isPublic": false,
  // 		"baseUri": "0xa98ec5c5044800c88e862f007b98d89815fc40ca155d6ce7909530d792e909ce",
  // 		"nftFactory": "0x25315F9878BA07221db684b7ad3676502E914894",
  // 		"collectionTitle": "",
  // 		"description": "",
  // 		"avatar": "123",
  // 		"banner": "",
  // 		"thumbnail": "",
  // 		"cid": "",
  // 		"tileUri": "ipfs://QmRiUrgoTVfVERfPfg6dHeH8LQVpa7xf8VutYqZ5V4kgVE",
  // 		"deployStatus": DEPLOYMENT_STATUS.DEPLOYED,
  // 		"createdAt": 1658480264912,
  // 		"updatedAt": 1658480264912,
  // 		"nftType": NFTType.ERC1155,
  // 	},
  // 	{
  // 		"id": 6,
  // 		"owner": "0xfF7d59D9316EBA168837E3eF924BCDFd64b237D8",
  // 		"name": "test123",
  // 		"contractAddress": "0x3488c0735e3a9d2FDB41634300187B45ACc656E8",
  // 		"isPublic": false,
  // 		"baseUri": "0xecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae",
  // 		"nftFactory": "0x25315F9878BA07221db684b7ad3676502E914894",
  // 		"collectionTitle": "",
  // 		"description": "",
  // 		"avatar": "123",
  // 		"banner": "",
  // 		"thumbnail": "",
  // 		"cid": "",
  // 		"tileUri": "ipfs://QmRiUrgoTVfVERfPfg6dHeH8LQVpa7xf8VutYqZ5V4kgVE",
  // 		"deployStatus": DEPLOYMENT_STATUS.DEPLOYED,
  // 		"createdAt": 1658718302048,
  // 		"updatedAt": 1658718302048,
  // 		"nftType": NFTType.ERC721,
  // 	},
  // 	{
  // 		"id": 7,
  // 		"owner": "0xfF7d59D9316EBA168837E3eF924BCDFd64b237D8",
  // 		"name": "",
  // 		"contractAddress": "0xcb7675d3f888419f445f5a895c60c8b8b2652d6a",
  // 		"isPublic": false,
  // 		"baseUri": "0x02530c90e884ed9048ed5835eda043879f8c630622e28a4330a09aae120dc821",
  // 		"nftFactory": "0x25315F9878BA07221db684b7ad3676502E914894",
  // 		"collectionTitle": "",
  // 		"description": "",
  // 		"avatar": "",
  // 		"banner": "",
  // 		"thumbnail": "",
  // 		"cid": "",
  // 		"tileUri": "",
  // 		"deployStatus": DEPLOYMENT_STATUS.DEPLOY_FAILED,
  // 		"createdAt": 1659600719224,
  // 		"updatedAt": 1659600719224,
  // 		"nftType": NFTType.ERC1155,
  // 	},
  // ];
  // const total = 4;
  return (
    <Box
      flex={1}
      alignItems={"center"}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      component={"section"}
      marginTop={1}
    >
      <Box display={"flex"} alignSelf={"flex-end"}>
        <Button
          onClick={() => {
            setStep(CreateCollectionStep.ChooseMethod);
            setCreateOpen(true);
          }}
          variant={"outlined"}
          color={"primary"}
        >
          {t("labelCreateCollection")}
        </Button>
      </Box>
      <CollectionCardList
        {...{ ...(collectionListProps as any) }}
        account={account}
        toggle={deployNFT}
        setShowEdit={(item) => {
          history.push("/nft/addCollection");
          // setCreateOpen(true)
        }}
        setShowMintNFT={(step) => {
          setCreateOpen(true);
          //TODO: updateTokenAddress
          setStep(CreateCollectionStep.ChooseCollectionEdit);
        }}
        setShowDeploy={(item: Co) => {
          const _deployItem: TradeNFT<any, any> = {
            tokenAddress: item?.contractAddress,
            // TODO: fix backend
            nftType: "ERC1155",
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
