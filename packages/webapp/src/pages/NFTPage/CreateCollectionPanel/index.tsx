import styled from "@emotion/styled";
import { Box, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import React from "react";
import { IPFSSourceUpload, useOpenModals } from "@loopring-web/component-lib";
import { useHistory } from 'react-router-dom';

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const CreateCollectionPanel = () => {
  const {t} = useTranslation("common");
  const {setShowCollectionAdvance} = useOpenModals();
  const history = useHistory();
  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        paddingX={5 / 2}
        paddingTop={5 / 2}
      >
        <Typography component={"h3"} variant={"h4"}>
          {t("labelCreateCollectionTitle")}
        </Typography>
      </Box>
      <Box
        flex={1}
        alignItems={"center"}
        display={"flex"}
        justifyContent={"center"}
        flexDirection={"column"}
      >
        <Box display={'flex'} width={"100%"}>
          {/*<IPFSSourceUpload*/}
          {/*  fullSize*/}
          {/*  width*/}
          {/*  height*/}
          {/*  typographyProps*/}
          {/*  buttonProps*/}
          {/*  title*/}
          {/*  buttonText*/}
          {/*  value*/}
          {/*  types*/}
          {/*  onDelete*/}
          {/*  onChange*/}
          {/*/>*/}
        </Box>

        {/*<Typography component={'h4'} variant={'h4'} textAlign={'center'} marginBottom={3}>*/}
        {/*  {t('labelMintSelect')}*/}
        {/*</Typography>*/}
        {/*<Box marginLeft={1}>*/}
        {/*  <Button*/}
        {/*    onClick={() =<> {*/}
        {/*      // onClose();*/}
        {/*      setShowCollectionAdvance({isShow: true});*/}
        {/*    }}*/}
        {/*    variant={"outlined"}*/}
        {/*    color={"primary"}*/}
        {/*  >*/}
        {/*    {t("labelAdvanceCreate")}*/}
        {/*  </Button>*/}
        {/*</Box>*/}
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
      </Box>
      {/*<StyledPaper*/}
      {/*  flex={1}*/}
      {/*  className={"MuiPaper-elevation2"}*/}
      {/*  marginTop={0}*/}
      {/*  marginBottom={2}*/}
      {/*  display={"flex"}*/}
      {/*  flexDirection={"column"}*/}
      {/*>*/}
      {/*  <Box*/}
      {/*    display={"flex"}*/}
      {/*    justifyContent={"space-between"}*/}
      {/*    alignItems={"center"}*/}
      {/*    paddingX={5 / 2}*/}
      {/*    paddingTop={5 / 2}*/}
      {/*  >*/}
      {/*    <Typography component={"h3"} variant={"h4"}>*/}
      {/*      {t("labelCreateCollectionTitle")}*/}
      {/*    </Typography>*/}
      {/*  </Box>*/}
      {/*  <Box flex={1} display={"flex"}>*/}
      {/*    <Box marginLeft={1}>*/}
      {/*      <Button onClick={() => {}} variant={"outlined"} color={"primary"}>*/}
      {/*        {t("labelAdvanceCreateCollection")}*/}
      {/*      </Button>*/}
      {/*    </Box>*/}
      {/*  </Box>*/}
      {/*</StyledPaper>*/}
    </>
  );
};
