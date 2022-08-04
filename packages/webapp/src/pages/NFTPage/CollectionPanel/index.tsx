import {
  CardNFTStyled, CardStyleItem, CollectionMedia, EmptyDefault,
  ModalBackButton,
  ModalCloseButton,
  ModelPanelStyle, NftImage, NFTMedia, useOpenModals, useSettings,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { Box, Button, Grid, Modal, Pagination, Typography } from "@mui/material";
import React from "react";
import styled from "@emotion/styled/";
import { useHistory } from 'react-router-dom';
import {
  CollectionLimit,
  CreateCollectionStep,
  EmptyValueTag,
  getShortAddr,
  NFTLimit
} from "@loopring-web/common-resources"
import { useMyCollection } from './hook';

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`;

// const CreateNamePanel = ({setStep}: { setStep: (step: CreateCollectionStep) => void }) => {
//   const [value, setValue] = React.useState("");
//   const {t} = useTranslation('common');
//
//   const {createContract} = useCollectionContractTs({setStep});
//   return <Box flex={1} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
//     <Box marginBottom={3} width={'var(--modal-width)'}>
//       <Typography component={'h4'} variant={'h4'} textAlign={'center'} marginBottom={2}>
//         {t('labelCollectionCreateERC1155')}
//       </Typography>
//     </Box>
//     <Box marginBottom={2} width={'var(--modal-width)'}>
//       <TextField
//         value={value}
//         inputProps={{maxLength: 28}}
//         fullWidth
//         label={<Trans i18nKey={"labelCollectionName"}>Collection Name</Trans>}
//         type={"text"}
//         onChange={(e: React.ChangeEvent<{ value: string }>) => setValue(e.target.value)}
//       />
//     </Box>
//     <Box width={'var(--modal-width)'} alignItems={'center'} display={'flex'} justifyContent={'center'}>
//       <Button
//         onClick={() => {
//           createContract({name: value})
//           setStep(CreateCollectionStep.Loading)
//         }}
//         variant={"contained"}
//         disabled={value.trim() === ''}
//         fullWidth
//         color={"primary"}
//       >
//         {t("labelCreateCollection")}
//       </Button>
//     </Box>
//
//   </Box>
// }

const CreateUrlPanel = ({
                          open,
                          onClose,
                        }: {
  onClose: () => void,
  open: boolean,
}) => {
  const {t} = useTranslation();
  const {setShowCollectionAdvance} = useOpenModals();
  const history = useHistory();
  const [step, setStep] = React.useState(CreateCollectionStep.ChooseMethod);
  const {isMobile} = useSettings();
  const panelList: Array<{
    view: JSX.Element;
    onBack?: undefined | (() => void);
    height?: any;
    width?: any;
  }> = React.useMemo(() => {
    return [
      // {
      //   view: <CreateNamePanel setStep={setStep}/>,
      // },
      // {
      //   view: <Box minHeight={"148px"} flex={1}
      //              display={'flex'} flexDirection={'column'} alignItems={'center'} width={'var(--modal-width)'}>
      //     <Typography component={'h4'} variant={'h4'} textAlign={'center'} marginBottom={3}>
      //       {t('Waiting for create Collection token Address')}
      //     </Typography>
      //     <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
      //       <div className="loader loader--style3" title="2">
      //         <img
      //           className="loading-gif"
      //           alt={"loading"}
      //           width="36"
      //           src={`${SoursURL}images/loading-line.gif`}
      //         />
      //       </div>
      //     </Box>
      //   </Box>,
      //   onBack: () => setStep(CreateCollectionStep.CreateTokenAddress)
      // },
      // {
      //   view: <Box minHeight={"280px"} flex={1}
      //              display={'flex'} flexDirection={'column'} alignItems={'center'} width={'var(--modal-width)'}>
      //     <Typography component={'h4'} variant={'h4'} textAlign={'center'}>
      //       {t('labelCollectionCreateFailed')}
      //     </Typography>
      //     <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
      //       {t('Collection Failed')}
      //     </Box>
      //   </Box>,
      //   onBack: () => setStep(CreateCollectionStep.CreateTokenAddress)
      // },
      {
        view: <Box
          flex={1}
          alignItems={"center"}
          display={"flex"}
          justifyContent={"center"}
          flexDirection={"column"}
        >
          <Typography component={'h4'} variant={'h4'} textAlign={'center'} marginBottom={3}>
            {t('labelMintSelect')}
          </Typography>
          <Box flex={1}
               alignItems={"center"}
               display={"flex"}
               flexDirection={isMobile ? "column" : "row"}
               justifyContent={"center"}>
            <CardNFTStyled
              sx={{background: "var(--color-global-bg)"}}
              onClick={() => {
                onClose();
                setShowCollectionAdvance({isShow: true});
              }}>
              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                flex={1}
                marginBottom={2}
              >
                <NftImage
                  alt={"Collection Created"}
                  onError={() => undefined}
                  src={"https://static.loopring.io/assets/images/nft-mint.png"}
                />
              </Box>
              <Typography
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
                paddingX={2} component={'p'} variant={'body1'} minHeight={"148px"} marginBottom={2}
              >
                Fill up content in GUI and let Loopring to generate necessary metadata and upload to IPFS for you, then
                use "Mint" to create your NFT.
                <Button
                  variant={"contained"}
                  color={"primary"}
                  fullWidth={true}

                >
                  {t("labelAdvanceCreateCollection")}
                </Button>
              </Typography>

            </CardNFTStyled>
            <CardNFTStyled
              sx={{marginLeft: isMobile ? 0 : 4, background: "var(--color-global-bg)"}}
              onClick={() => {
                history.push("/nft/addCollection");
              }}>
              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                flex={1}
                marginBottom={2}
              >
                <NftImage
                  alt={"Collection Created"}
                  onError={() => undefined}
                  src={"https://static.loopring.io/assets/images/nft-mint.png"}
                />
              </Box>
              {/*<Typography component={'p'} variant={'body1'} height={"48px"} marginBottom={1}*/}
              {/*>*/}
              {/*  Fill up content in GUI and let Loopring to generate necessary metadata and upload to IPFS for you, then use "Mint" to create your NFT.*/}
              {/*</Typography>*/}
              {/*<Button*/}
              {/*  variant={"outlined"}*/}
              {/*  color={"primary"}*/}
              {/*>*/}
              {/*  {t("labelMintNFT")}*/}
              {/*</Button>*/}
              <Typography
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
                paddingX={2}
                component={'p'} variant={'body1'} minHeight={"148px"} marginBottom={2}
              >
                Generate all the required metadata and upload to IPFS by yourself first, then use "Advanced Mint" to
                create your NFT.
                <Button
                  variant={"contained"}
                  color={"primary"}
                  fullWidth={true}
                >
                  {t("labelCreateCollection")}
                </Button>
              </Typography>
            </CardNFTStyled>
          </Box>
          <Box marginLeft={1}>

          </Box>
          {/*<Box marginLeft={1}>*/}
          {/*  <Button*/}
          {/*    onClick={() => {*/}
          {/*      history.push("/nft/CreateCollection");*/}
          {/*    }}*/}
          {/*    variant={"outlined"}*/}
          {/*    color={"primary"}*/}
          {/*  >*/}
          {/*    {t("labelMintNFT")}*/}
          {/*  </Button>*/}
          {/*</Box>*/}
        </Box>,
        // onBack: () => setStep(CreateCollectionStep.ChooseMethod)
      }
    ]
  }, [])
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <ModelPanelStyle style={{boxShadow: "24"}}>

        {panelList.map((panel, index) => {
          return (
            <React.Fragment key={index + '0'}>
              <Box display={step === index ? "flex" : "none"} width={"100%"} flexDirection={"column"}>
                <ModalCloseButton onClose={onClose} t={t}/>
                {panel.onBack ? <ModalBackButton onBack={panel.onBack}/> : <></>}
              </Box>
              <Box
                display={step === index ? "flex" : "none"}
                alignItems={"stretch"}
                flex={1}
                key={index}
                margin={5 / 2}
              >
                {panel.view}
              </Box>
            </React.Fragment>
          );
        })}
      </ModelPanelStyle>
    </Modal>

  );
};
const CommonPanel = () => {
  return <></>;
};
export const NFTCollectPanel = () => {
  const {t} = useTranslation(["common"]);
  const [showCreateOpen, setCreateOpen] = React.useState(false);
  const {
    collectionList,
    etherscanBaseUrl,
    onPageChange,
    total,
    page,
    isLoading,
  } = useMyCollection()
  return (
    <Box
      flex={1}
      alignItems={"center"}
      display={"flex"}
      flexDirection={'column'}
      justifyContent={"center"}
      component={"section"}
      marginTop={1}
    >
      <Box display={'flex'} alignSelf={"flex-end"}>
        <Button
          onClick={() => {
            setCreateOpen(true)
          }}
          variant={"outlined"}
          color={"primary"}
        >
          {t("labelCreateCollection")}
        </Button>
      </Box>
      <Box flex={1} display={'flex'} justifyContent={'stretch'} marginTop={2} width={'100%'}>
        {!!collectionList?.length ?
          <>
            {total > CollectionLimit && (
              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"right"}
                marginRight={3}
                marginBottom={2}
              >
                <Pagination
                  color={"primary"}
                  count={
                    parseInt(String(total / NFTLimit)) +
                    (total % NFTLimit > 0 ? 1 : 0)
                  }
                  page={page}
                  onChange={(_event, value) => {
                    onPageChange(Number(value));
                  }}
                />
              </Box>
            )}
            <Grid container spacing={2} paddingBottom={3}>
              {collectionList.map((item, index) => {
                return <Grid
                  key={(item?.name ?? "") + index.toString()}
                  item
                  xs={12}
                  md={6}
                  lg={4}
                  flex={"1 1 120%"}
                >
                  <CardStyleItem>
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
                        </Box>
                      </Box>
                    </Box>
                  </CardStyleItem>
                </Grid>
              })}
            </Grid>
            {total > CollectionLimit && (
              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"right"}
                marginRight={3}
                marginBottom={2}
              >
                <Pagination
                  color={"primary"}
                  count={
                    parseInt(String(total / NFTLimit)) +
                    (total % NFTLimit > 0 ? 1 : 0)
                  }
                  page={page}
                  onChange={(_event, value) => {
                    onPageChange(Number(value));
                  }}
                />
              </Box>
            )}
          </> : (<Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <EmptyDefault
              style={{flex: 1}}
              height={"100%"}
              message={() => (
                <Box
                  flex={1}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  {t("labelNoContent")}
                </Box>
              )}
            />
          </Box>)
        }
      </Box>
      <CreateUrlPanel open={showCreateOpen} onClose={() => {
        setCreateOpen(false);
      }}
      />
    </Box>
  );
};
