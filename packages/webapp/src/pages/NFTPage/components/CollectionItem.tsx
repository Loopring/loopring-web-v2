import {
  Button,
  CardStyleItem,
  CollectionMedia,
  useOpenModals,
  useSettings,
  useToggle
} from '@loopring-web/component-lib';
import { Box, Typography } from '@mui/material';
import {
  CollectionHttps,
  CopyIcon,
  copyToClipBoard,
  CreateCollectionStep,
  getShortAddr,
  TradeNFT
} from '@loopring-web/common-resources';
import React from 'react';
import { CollectionMeta, DEPLOYMENT_STATUS, NFTType } from '@loopring-web/loopring-sdk';
import { LoopringAPI, useAccount, useModalData } from '@loopring-web/core';
import { useTranslation } from 'react-i18next';

export const CollectionItem = React.memo(React.forwardRef(({
                                                             item,
                                                             index,
                                                             setCopyToastOpen,
                                                             setCreateOpen,
                                                             setShowMintNFT,
                                                           }: {
  item: CollectionMeta & { nftType?: NFTType },
  index: number,
  setCopyToastOpen: (value: boolean) => void;
  setCreateOpen: (value: boolean) => void;
  setShowMintNFT: (step: CreateCollectionStep) => void;
}, _ref: React.Ref<any>) => {
  const {account} = useAccount();
  const {isMobile} = useSettings();
  const {t} = useTranslation('common');
  const {toggle: {deployNFT}} = useToggle();
  const {setShowNFTDeploy} =
    useOpenModals();
  const {updateNFTDeployData} =
    useModalData();
  const {setShowTradeIsFrozen} = useOpenModals();

  return <CardStyleItem ref={_ref} className={'collection'}>
    <Box
      position={"absolute"}
      width={"100%"}
      height={"100%"}
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"space-between"}
    >
      <CollectionMedia
        item={item}
        index={index}
        // onNFTReload={onNFTReload}
        onRenderError={() => undefined}
      />
      <Box
        paddingX={2}
        paddingTop={2}

        paddingBottom={3}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-between"}
      >
        <Typography
          color={"textPrimary"}
          component={"h6"}
          whiteSpace={"pre"}
          overflow={"hidden"}
          display={'inline-flex'}
          textOverflow={"ellipsis"}
          variant={'h5'}
          justifyContent={"space-between"}
        >
          <span>
            {item?.name ?? t('labelUnknown')}
          </span>
          <Button variant={'text'} color={'primary'} size={'small'} endIcon={<CopyIcon color={'secondary'}/>}
                  sx={{marginLeft: 1}} onClick={() => {
            copyToClipBoard(item?.contractAddress ?? "");
            setCopyToastOpen(true);

          }}>
            {getShortAddr(item?.contractAddress ?? "")}
          </Button>
        </Typography>
        <Typography
          color={"text.secondary"}
          component={"h6"}
          whiteSpace={"pre"}
          overflow={"hidden"}
          display={'inline-flex'}
          textOverflow={"ellipsis"}
          justifyContent={"space-between"}
        >
          {/*<Typography>*/}
          {/*  <Typography color={"var(--color-text-third)"} width={160}>*/}
          {/*    {t("labelNFTContractAddress")}*/}
          {/*  </Typography>*/}
          {/*  */}
          {/*</Typography>*/}
          <Typography
            color={"var(--color-text-third)"}
            title={item?.nftType === NFTType.ERC721 ? "ERC721" : "ERC1155"}
          >
            {item?.nftType === NFTType.ERC721 ? "ERC721" : "ERC1155"}
          </Typography>
          <Button variant={'text'} color={'primary'} size={'small'} endIcon={<CopyIcon color={'secondary'}/>}
                  sx={{marginLeft: 1}} onClick={() => {
            const metaDemo = {
              "name": "`${NFT_NAME}`",
              "description": "`${NFT_DESCRIPTION}`",
              "image": "ipfs://`${CID}`",
              "animation_url": "ipfs://`${CID}`",
              "collection_metadata": `${CollectionHttps}/${item.contractAddress}`,   //TODO: makesure from backend
              "royalty_percentage": "`[0..10] (int 0-10)`",
              "attributes": [
                {
                  "trait_type": "`${PROPERTIES_KEY}`",
                  "value": "`${VALUE}`"
                }],
              "properties": {
                "`${PROPERTIES_KEY}`": "`${VALUE}`"
              }
            };
            copyToClipBoard(JSON.stringify(metaDemo));
            setCopyToastOpen(true);

          }}>
            {t('labelCopyNFTDemo')}
          </Button>
        </Typography>
        <Box display={'flex'} flexDirection={'row'} justifyContent={'flex-end'} marginTop={2}>
          <>
            {!!(
              // item.isCounterFactualNFT &&
              item.deployStatus === DEPLOYMENT_STATUS.NOT_DEPLOYED
              && item.owner?.toLowerCase() === account.accAddress.toLowerCase()
            ) && (
              <Box className={isMobile ? "isMobile" : ""} width={"48%"}>
                <Button
                  variant={"outlined"}
                  size={"medium"}
                  fullWidth
                  onClick={() => {
                    const _deployItem: TradeNFT<any> = {
                      tokenAddress: item.contractAddress,
                      // TODO: fix backend
                      nftType: 'ERC1155',
                    };
                    LoopringAPI.userAPI
                      ?.getAvailableBroker({type: 0})
                      .then(({broker}) => {
                        updateNFTDeployData({broker});
                      });
                    updateNFTDeployData(_deployItem);
                    deployNFT.enable
                      ? setShowNFTDeploy({
                        isShow: true,
                        info: {...{_deployItem}},
                      })
                      : setShowTradeIsFrozen({isShow: true})
                  }
                  }

                >
                  {t("labelNFTDeployContract")}
                </Button>
              </Box>
            )}
            {!(item?.nftType && item.nftType === NFTType.ERC721) ?
              <Box className={isMobile ? "isMobile" : ""} width={"48%"} marginLeft={'4%'}>
                <Button
                  variant={"contained"}
                  className={(item.name && item.tileUri) ? "" : "Mui-disabled disabledViewOnly"}
                  size={"small"}
                  fullWidth
                  onClick={() => {
                    if (item.name && item.tileUri) {
                      setShowMintNFT(CreateCollectionStep.ChooseMintMethod);
                      setCreateOpen(true);
                    } else {
                      setShowMintNFT(CreateCollectionStep.ChooseCollectionEdit);
                      setCreateOpen(true);
                    }

                  }}
                >
                  {t("labelNFTMintBtn")}
                </Button>
              </Box> :
              <Box className={isMobile ? "isMobile" : ""} width={"48%"} marginLeft={'4%'}>
                <Button
                  variant={"contained"}
                  disabled={true}
                  size={"small"}
                  fullWidth
                  onClick={() => {
                    if (item.name && item.tileUri) {
                      setShowMintNFT(CreateCollectionStep.ChooseMintMethod);
                      setCreateOpen(true);
                    } else {
                      setShowMintNFT(CreateCollectionStep.ChooseCollectionEdit);
                      setCreateOpen(true);
                    }

                  }}
                >
                  {t("labelNFTMint721Btn")}
                </Button>
              </Box>
            }
          </>


        </Box>
      </Box>
    </Box>
  </CardStyleItem>


}));