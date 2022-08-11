import { Box, BoxProps, Divider, Modal, Pagination, Tooltip, Typography } from '@mui/material';
import {
	CollectionLimit,
	CopyIcon,
	copyToClipBoard,
	Info2Icon,
	NFTLimit
} from '@loopring-web/common-resources';
import { Button, CollectionCardList, CollectionListProps, DropdownIconStyled, SwitchPanelStyled } from '../../../index';
import React from 'react';
import { CollectionHttps, CollectionMeta } from '@loopring-web/common-resources';
import { Trans, useTranslation } from 'react-i18next';
import styled from '@emotion/styled';

const SizeCss = {
	small: `
	  height: 2.4rem;
	  lineHeight: 2.4rem;
	`,
	large: `
	  height: 4.8rem;
	  lineHeight: 4.8rem;
	`,
	medium: `
	 height: 3.6rem;
	 lineHeight: 3.6rem;
	`
};
const BoxStyle = styled(Box)<BoxProps & { size: "small" | "large" | "medium" }>`
  padding: .3rem .3rem .3rem .8rem;
  border: ${({theme}) =>
          theme.border.borderConfig({c_key: "var(--color-border)"})};

  &:hover,
  &:active {
    color: var(--color-text-primary);
    background: var(--color-box-hover);
    border: ${({theme}) =>
            theme.border.borderConfig({c_key: "var(--color-border-hover)"})};
  }

  ${({size}) => SizeCss[ size ]}
` as (props: BoxProps & { size: "small" | "large" | "medium" }) => JSX.Element;
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
export type CollectionInputProps<Co> = {
	collection?: Co,
	collectionListProps: CollectionListProps<Co>
}

export const CollectionInput = <Co extends CollectionMeta>(
	{
		collection,
		// collection,
		// onPageChange,
		// collectionList,
		// total,
		// setCopyToastOpen,
		collectionListProps,
		fullWidth = false,
		width = 'content-fit',
		size = "medium",
	}: CollectionInputProps<Co> & {
		fullWidth?: boolean, width?: any,
		size?: "small" | "large" | "medium"
	}) => {
	const [_modalState, setModalState] = React.useState(false);
	// const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
	const [selectCollectionMeta, setSelectCollectionMeta] = React.useState(collection);
	// const [searchValue, setSearchValue] = React.useState('');
	const {t} = useTranslation('common');
	// const popState = usePopupState({
	// 	variant: "popover",
	// 	popupId: `popup-pro-toolbar-markets`,
	// });
	const [dropdownStatus, setDropdownStatus] =
		React.useState<"up" | "down">("down");
	// const handleSearchChange = React.useCallback((value) => {
	// 	setSearchValue(value);
	// }, []);

	// const handleClickAway = React.useCallback(() => {
	// 	popState.setOpen(false);
	// 	setIsDropdownOpen(false);
	// }, [popState]);
	const {
		// collection,
		onPageChange,
		// collectionList,
		total,
		page,
		// setCopyToastOpen,
	} = collectionListProps;
	return <Box display={'flex'} flexDirection={'column'} width={fullWidth ? "100%" : width}>
		<Tooltip
			title={t("labelMintCollectionTooltips").toString()}
			placement={"top"}
		>
			<Box width={"100%"}>
				<Typography
					variant={"body1"}
					color={"var(--color-text-secondary)"}
					className={"main-label"}
					paddingBottom={1 / 2}
				>
					<Trans i18nKey={"labelMintCollection"}>
						Choose Collection
						<Info2Icon
							fontSize={"small"}
							color={"inherit"}
							sx={{marginX: 1 / 2}}
						/>
					</Trans>
				</Typography>

			</Box>
		</Tooltip>
		<BoxStyle
			width={"100%"}
			display={"flex"}
			alignItems={"center"}
			fontSize={"1.6rem"}
			size={size}
			justifyContent={"space-between"}
			onClick={(_e: any) => {
				_e.stopPropagation();
				// bindTrigger(popState).onClick(e);
				// setIsDropdownOpen(true);
				setDropdownStatus((prev) =>
					prev === "up" ? "down" : "up"
				);
				setModalState(true);
				// if (tableTabValue === "favourite") {
				// 	handleTabChange(_, "favourite");
				// }
			}}

			style={{cursor: "pointer", whiteSpace: "nowrap"}}
		>
			<Box flex={1} display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
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
			<DropdownIconStyled
				status={dropdownStatus}
				fontSize={size}
			/>

		</BoxStyle>
		{selectCollectionMeta &&
      <Button variant={'text'} color={'primary'} size={'small'} endIcon={<CopyIcon color={'secondary'}/>}
              sx={{marginLeft: 1}} onClick={() => {
				if (selectCollectionMeta) {
					const {metaDemo} = makeMeta({collection: selectCollectionMeta});
					copyToClipBoard(JSON.stringify(metaDemo));
					collectionListProps.setCopyToastOpen(true);
				}
			}}>
				{t('labelCopyNFTDemo')}
      </Button>}
		{/*modalState*/}
		<Modal open={_modalState} onClose={() => setModalState(false)}>
			{/*<ClickAwayListener onClickAway={handleClickAway}>*/}
			<SwitchPanelStyled display={'flex'} overflow={'scroll'} height={"80%"}>
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
				<Divider style={{marginTop: "-1px"}}/>
				<CollectionCardList
					{...{...collectionListProps as any}}
					isSelectOnly={true}
					//
					// collectionList={collectionList as any}
					// total={total}
					// account={account}
					// onPageChange={onPageChange}
					// setCopyToastOpen={setCopyToastOpen}
					onSelectItem={(item) => {
						setSelectCollectionMeta(item as any)
					}}/>
				{/*<Grid container spacing={2} paddingBottom={3}>*/}
				{/* /!*{collectionList.map((item, index) => {*!/*/}
				{/*	/!* return <Grid*!/*/}
				{/*	/!*	 key={(item?.name ?? "") + index.toString()}*!/*/}
				{/*	/!*	 item*!/*/}
				{/*	/!*	 xs={12}*!/*/}
				{/*	/!*	 md={6}*!/*/}
				{/*	/!*	 lg={4}*!/*/}
				{/*	/!*	 flex={"1 1 120%"}*!/*/}
				{/*	/!*	 onClick={() => setSelectCollectionMeta(item)}*!/*/}
				{/*	/!* >*!/*/}
				{/* */}
				{/*	/!*	 <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'}>*!/*/}
				{/*	/!*		 <Typography component={'span'} variant={'body1'} color={'textPrimary'} marginBottom={1}>*!/*/}
				{/*	/!*			 {item.name}*!/*/}
				{/*	/!*		 </Typography>*!/*/}
				{/*	/!*		 <Typography component={'span'} variant={'body2'} color={'var(--color-text-third)'} marginBottom={1}>*!/*/}
				{/*	/!*			 {item.contractAddress}*!/*/}
				{/*	/!*		 </Typography>*!/*/}
				{/*	/!*	 </Box>*!/*/}
				{/*	/!* </Grid>*!/*/}
				{/* })}*/}
				{/*</Grid>*/}
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
			</SwitchPanelStyled>
			{/*</ClickAwayListener>*/}
		</Modal>
	</Box>
};
