import {
	EmptyDefault,
	Toast,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { Box, Button, Grid, Pagination } from "@mui/material";
import React, { useState } from "react";
import styled from "@emotion/styled/";
import {
  CollectionLimit,
  CreateCollectionStep,
	NFTLimit
} from "@loopring-web/common-resources"
import { useMyCollection } from './hook';
import { CollectionItem } from '../components/CollectionItem';
import { DEPLOYMENT_STATUS, NFTType } from '@loopring-web/loopring-sdk';
import { TOAST_TIME } from '@loopring-web/core';
import { CreateUrlPanel } from '../components/landingPanel';

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


const CommonPanel = () => {
  return <></>;
};
export const NFTCollectPanel = () => {
	const {t} = useTranslation(["common"]);
	const [showCreateOpen, setCreateOpen] = React.useState(false);
	const [copyToastOpen, setCopyToastOpen] = useState(false);
	const [step, setStep] = React.useState(CreateCollectionStep.ChooseMethod);

	const {
		onPageChange,
		collectionList,
		total,
		page,
	} = useMyCollection();
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
			flexDirection={'column'}
			justifyContent={"center"}
			component={"section"}
			marginTop={1}
		>

      <Box display={'flex'} alignSelf={"flex-end"}>
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
	                <CollectionItem
		                setShowMintNFT={setStep}
		                setCreateOpen={setCreateOpen}
		                item={item as any}
		                index={index} setCopyToastOpen={setCopyToastOpen}/>
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
			<CreateUrlPanel open={showCreateOpen} step={step} onClose={() => {
				setCreateOpen(false);
			}}
			/>


			<Toast
				alertText={t("labelCopyAddClip")}
				open={copyToastOpen}
				autoHideDuration={TOAST_TIME}
				onClose={() => {
					setCopyToastOpen(false);
				}}
				severity={"success"}
			/>
		</Box>
  );
};
