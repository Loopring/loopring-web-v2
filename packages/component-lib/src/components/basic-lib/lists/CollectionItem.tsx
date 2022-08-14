import {
	Button,
	CardStyleItem, CollectionListProps,
	CollectionMedia, EmptyDefault, makeMeta,
	useSettings,
} from '../../../index';
import { Box, Grid, Pagination, Radio, Typography } from '@mui/material';
import {
	CopyIcon,
	copyToClipBoard,
	getShortAddr,
	Account,
	CollectionMeta, myLog
} from '@loopring-web//common-resources';
import React from 'react';
import { DEPLOYMENT_STATUS, NFTType } from '@loopring-web/loopring-sdk';
import { useTranslation } from 'react-i18next';
import { CollectionLimit, NFTLimit } from '@loopring-web/common-resources';
import styled from '@emotion/styled';

const BoxStyle = styled(Box)`
  .MuiRadio-root {
    position: absolute;
    right: ${({theme}) => theme.unit}px;
    top: ${({theme}) => theme.unit}px;
    transform: scale(1.5);
  }

  .collection:hover {
    .btn-group {
      display: flex;
    }
  }

` as typeof Box;
const BoxBtnGroup = styled(Box)`
  display: none;
  position: absolute;
  right: ${({theme}) => 2 * theme.unit}px;
  top: ${({theme}) => 2 * theme.unit}px;
  width: 100%;
  //flex-direction: row-reverse;
  &.mobile {

  }
` as typeof Box;

export const CollectionItem = React.memo(React.forwardRef(<Co extends CollectionMeta & { nftType: NFTType }>(
	{
		item,
		index,
		setCopyToastOpen,
		setShowEdit,
		setShowDeploy,
		setShowMintNFT,
		account,
		isSelectOnly = false,
		selectCollection
		// toggle,
	}: {
		item: Co,
		index: number,
		setCopyToastOpen: (value: boolean) => void;
		setShowDeploy: (item: Co) => void;
		setShowEdit: (item: Co) => void;
		setShowMintNFT: (item: Co) => void;
		account: Account;
		toggle: any;
		isSelectOnly?: boolean;
		selectCollection?: Co
	}, _ref: React.Ref<any>) => {
	// const {account} = useAccount();
	const {isMobile} = useSettings();
	const {t} = useTranslation('common');

	const {metaDemo} = makeMeta({collection: item});
	myLog(selectCollection, 'selectCollection');

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
			{!!isSelectOnly && <Radio
        size={"medium"}
        checked={selectCollection?.contractAddress?.toLowerCase() === item?.contractAddress?.toLowerCase()}
        value={item.contractAddress}
        name="radio-collection"
				// sx={{
				//   }}
        inputProps={{'aria-label': 'selectCollection'}}
      />}
			{
				!isSelectOnly && <BoxBtnGroup
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'flex-end'}
          className={isMobile ? "mobile btn-group" : "btn-group"}
        >
          <>
						{!!(
							item.isCounterFactualNFT &&
							item.deployStatus === DEPLOYMENT_STATUS.NOT_DEPLOYED
							&& item.owner?.toLowerCase() === account.accAddress.toLowerCase()
						) && (
							<Box className={isMobile ? "isMobile" : ""} width={"48%"}>
								<Button
									variant={"outlined"}
									size={"medium"}
									fullWidth
									onClick={() => {
										setShowDeploy(item);
									}}
								>
									{t("labelNFTDeployContract")}
								</Button>
							</Box>
						)}
						{item.isCounterFactualNFT
						&& !(item?.nftType && item.nftType === NFTType.ERC721)
						&& item.name && item.tileUri ?
							<Box className={isMobile ? "isMobile" : ""} width={"48%"} marginLeft={'4%'}>
								<Button
									variant={"contained"}
									size={"small"}
									fullWidth
									onClick={() => {
										if (item.name && item.tileUri) {
											setShowMintNFT(item);
										} else {
											setShowEdit(item)
										}
									}}
								>
									{t("labelNFTMintSimpleBtn")}
								</Button>
							</Box> :
							<Box className={isMobile ? "isMobile" : ""} width={"48%"} marginLeft={'4%'}>
								<Button
									variant={"contained"}
									disabled={true}
									size={"small"}
									fullWidth
									onClick={() => {
										setShowEdit(item);
									}}
								>
									{item.isCounterFactualNFT && (!item.name || !item.tileUri) ? t("labelNFTMintEditBtn") : t("labelCollectionEditBtn")}
								</Button>
							</Box>
						}
          </>
        </BoxBtnGroup>
			}
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
					<Typography
						color={"var(--color-text-third)"}
						title={item?.nftType === NFTType.ERC721 ? "ERC721" : "ERC1155"}
					>
						{item?.nftType === NFTType.ERC721 ? "ERC721" : "ERC1155"}
					</Typography>
					<Button variant={'text'} color={'primary'} size={'small'} endIcon={<CopyIcon color={'secondary'}/>}
					        sx={{marginLeft: 1}} onClick={() => {

						copyToClipBoard(JSON.stringify(metaDemo));
						setCopyToastOpen(true);

					}}>
						{t('labelCopyNFTDemo')}
					</Button>
				</Typography>
			</Box>
		</Box>
	</CardStyleItem>


}));


export const CollectionCardList = <Co extends CollectionMeta & { nftType: NFTType }>(
	{
		collectionList,
		page,
		total,
		onPageChange,
		setCopyToastOpen,
		setShowDeploy,
		setShowEdit,
		setShowMintNFT,
		toggle,
		account,
		onSelectItem,
		isSelectOnly,
		selectCollection
	}: CollectionListProps<Co> & {
		toggle: any;
		isSelectOnly?: boolean;
		setShowDeploy: (item: Co) => void;
		setShowEdit: (item: Co) => void;
		setShowMintNFT: (item: Co) => void;
		account: Account;
		onSelectItem?: (item: Co) => void;
		selectCollection?: Co

	}) => {
	const {t} = useTranslation('common');
	return <BoxStyle flex={1} display={'flex'} justifyContent={'stretch'} marginTop={2} width={'100%'}>
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
							onClick={(e) => {
								e.stopPropagation();
								if (onSelectItem) {
									onSelectItem(item)
								}
							}}
						>
							<CollectionItem
								selectCollection={selectCollection}
								isSelectOnly={isSelectOnly}
								account={account}
								toggle={toggle}
								setShowDeploy={setShowDeploy as any}
								setShowEdit={setShowEdit as any}
								setShowMintNFT={setShowMintNFT as any}
								setCopyToastOpen={setCopyToastOpen as any}
								item={item as any}
								index={index}/>
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
	</BoxStyle>
};