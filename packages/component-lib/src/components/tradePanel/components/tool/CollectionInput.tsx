import { Box, ClickAwayListener, Divider, Grid, Pagination, Typography } from '@mui/material';
import { bindTrigger } from 'material-ui-popup-state/es';
import {
	CollectionLimit,
	CopyIcon,
	copyToClipBoard,
	DropDownIcon,
	NFTLimit
} from '@loopring-web/common-resources';
import { Button, InputSearch, InputSearchWrapperStyled, PopoverPure } from '../../../index';
import { bindPopper, usePopupState } from 'material-ui-popup-state/hooks';
import React from 'react';
import { CollectionMeta } from '@loopring-web/loopring-sdk';
import { CollectionHttps } from '@loopring-web/common-resources';
import * as sdk from '@loopring-web/loopring-sdk';
import { useTranslation } from 'react-i18next';

export const makeMeta = ({collection}: { collection: CollectionMeta }) => {
	const metaDemo = {
		"name": "`${NFT_NAME}`",
		"description": "`${NFT_DESCRIPTION}`",
		"image": "ipfs://`${CID}`",
		"animation_url": "ipfs://`${CID}`",
		"collection_metadata": `${CollectionHttps}/${collection.contractAddress}`,   //TODO: makesure from backend
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
	return {metaDemo}
};
export const CollectionInput = (
	{
		collection,
		onPageChange,
		collectionList,
		total,
		setCopyToastOpen,
		page
	}: {
		collection?: CollectionMeta,
		onPageChange: (props: any) => void,
		collectionList: sdk.CollectionMeta[],
		total: number,
		page: number,
		setCopyToastOpen: (isShow: boolean) => void,
	}) => {
	const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
	const [selectCollectionMeta, setSelectCollectionMeta] = React.useState(collection);
	const [searchValue, setSearchValue] = React.useState('');
	const {t} = useTranslation('common');
	const popState = usePopupState({
		variant: "popover",
		popupId: `popup-pro-toolbar-markets`,
	});
	const handleSearchChange = React.useCallback((value) => {
		setSearchValue(value);
	}, []);

	const handleClickAway = React.useCallback(() => {
		popState.setOpen(false);
		setIsDropdownOpen(false);
	}, [popState]);

	return <>
		<Box
			display={"flex"}
			alignItems={"center"}
			fontSize={"1.6rem"}
			{...bindTrigger(popState)}
			onClick={(e: any) => {
				bindTrigger(popState).onClick(e);
				setIsDropdownOpen(true);
				// if (tableTabValue === "favourite") {
				// 	handleTabChange(_, "favourite");
				// }
			}}
			style={{cursor: "pointer", whiteSpace: "nowrap"}}
		>
			<Box display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
				{selectCollectionMeta ? <>
					<Typography component={'span'} variant={'body1'} color={'textPrimary'} marginBottom={1}>
						{selectCollectionMeta.name}
					</Typography>
					<Typography component={'span'} variant={'body2'} color={'var(--color-text-third)'} marginBottom={1}>
						{selectCollectionMeta.contractAddress}
					</Typography>
				</> : <></>

				}

			</Box>
			<DropDownIcon
				htmlColor={"var(--color-text-third)"}
				style={{
					marginBottom: 2,
					transform: isDropdownOpen ? "rotate(0.5turn)" : "rotate(0)",
				}}
			/>

			<PopoverPure
				className={"arrow-center no-arrow"}
				{...bindPopper(popState)}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "center",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "center",
				}}
			>
				<ClickAwayListener onClickAway={handleClickAway}>
					<>
						<Grid container spacing={2} paddingBottom={3}>
							<Grid item xs={12}>
								<InputSearchWrapperStyled>
									<InputSearch
										fullWidth
										value={searchValue}
										onChange={handleSearchChange}
									/>
								</InputSearchWrapperStyled>
							</Grid>

							{collectionList.map((item, index) => {
								return <Grid
									key={(item?.name ?? "") + index.toString()}
									item
									xs={12}
									md={6}
									lg={4}
									flex={"1 1 120%"}
									onClick={() => setSelectCollectionMeta(item)}
								>

									<Box display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
										<Typography component={'span'} variant={'body1'} color={'textPrimary'} marginBottom={1}>
											{item.name}
										</Typography>
										<Typography component={'span'} variant={'body2'} color={'var(--color-text-third)'} marginBottom={1}>
											{item.contractAddress}
										</Typography>
									</Box>
								</Grid>
							})}
						</Grid>
						<Divider style={{marginTop: "-1px"}}/>
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
					</>
				</ClickAwayListener>
			</PopoverPure>
		</Box>
		{selectCollectionMeta &&
      <Button variant={'text'} color={'primary'} size={'small'} endIcon={<CopyIcon color={'secondary'}/>}
              sx={{marginLeft: 1}} onClick={() => {
				if (selectCollectionMeta) {
					const {metaDemo} = makeMeta({collection: selectCollectionMeta});
					copyToClipBoard(JSON.stringify(metaDemo));
					setCopyToastOpen(true);
				}
			}}>
				{t('labelCopyNFTDemo')}
      </Button>}

	</>
};
