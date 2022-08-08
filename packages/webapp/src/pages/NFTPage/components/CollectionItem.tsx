import {
  Button,
  CardStyleItem,
  CollectionMedia,
  useOpenModals,
  useSettings,
  useToggle
} from '@loopring-web/component-lib';
import { Box, Grid, Typography } from '@mui/material';
import { EmptyValueTag, TradeNFT } from '@loopring-web/common-resources';
import React from 'react';
import { DEPLOYMENT_STATUS, NFTCollection } from '@loopring-web/loopring-sdk';
import { LoopringAPI, useAccount, useModalData } from '@loopring-web/core';
import { useTranslation } from 'react-i18next';

export const CollectionItem = React.memo(React.forwardRef(({
                                                             item,
                                                             index

                                                           }: {
  //TODO: MOCK
  item: NFTCollection & { deploymentStatus: DEPLOYMENT_STATUS }, index: number
}, _ref: React.Ref<any>) => {
  const {account} = useAccount();
  const {isMobile} = useSettings();
  const {t} = useTranslation('common');
  const {toggle: {deployNFT}} = useToggle();
  const {setShowAccount, setShowNFTDetail, setShowNFTDeploy} =
    useOpenModals();
  const {updateNFTDeployData} =
    useModalData();
  const {setShowTradeIsFrozen} = useOpenModals();

  return <CardStyleItem ref={_ref}>
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
        padding={2}
        height={80}
        display={"flex"}
        flexDirection={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        // flexWrap={"wrap"}
      >
        <Box
          display={"flex"}
          flexDirection={"column"}
          width={"60%"}
        >
          <Typography
            color={"text.secondary"}
            component={"h6"}
            whiteSpace={"pre"}
            overflow={"hidden"}
            textOverflow={"ellipsis"}
          >
            {item?.name ?? EmptyValueTag}
          </Typography>

          <Typography
            color={"text.secondary"}
            component={"h6"}
            whiteSpace={"pre"}
            overflow={"hidden"}
            textOverflow={"ellipsis"}
          >
            {!!(
              // item.isCounterFactualNFT &&
              item.deploymentStatus === DEPLOYMENT_STATUS.NOT_DEPLOYED &&
              item.owner?.toLowerCase() === account.accAddress.toLowerCase()
            ) && (
              <Box className={isMobile ? "isMobile" : ""} width={"48%"}>
                <Button
                  variant={"contained"}
                  size={"small"}
                  fullWidth
                  onClick={() => {
                    const _deployItem: TradeNFT<any> = {
                      tokenAddress: item.contractAddress,
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

          </Typography>
        </Box>
      </Box>
    </Box>
  </CardStyleItem>


}));