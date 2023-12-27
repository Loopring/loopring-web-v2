import {Trans, useTranslation} from 'react-i18next'
import React from 'react'
import {
	Box, Divider,
	Grid,
	Typography,
} from '@mui/material'
import {bindHover} from 'material-ui-popup-state/es'
import {bindPopper, usePopupState} from 'material-ui-popup-state/hooks'
import {
	FeeInfo, GET_IPFS_STRING,
	IBData,
	Info2Icon,
	L1L2_NAME_DEFINED,
	MapChainId,
	NFTWholeINFO, TRADE_TYPE,
	TradeBtnStatus,
} from '@loopring-web/common-resources'
import {
	Button,
	FeeSelect,
	InputSize, TransferProps,
} from '../../index'
import {PopoverPure} from '../..'
import {NFTInput} from './BasicANFTTrade'
import {useSettings} from '../../../stores'
import {useBasicTrade} from "./hook/BasicACoinPanelHook";

export const TransferNFTBurn = <T extends IBData<I> & Partial<NFTWholeINFO>, I, C extends FeeInfo>(
{
   type=TRADE_TYPE.NFT,
   transferBtnStatus,
   disabled,
   walletMap,
   handleFeeChange,
   chargeFeeTokenList,
   feeInfo,
   isFeeNotEnough,
   onTransferClick,
   transferI18nKey,
   ...rest
 }: TransferProps<T, I, C> &
	{
	getIPFSString: GET_IPFS_STRING,
	assetsData: any[]
}) => {
	const { switchData:{tradeData},..._event } = useBasicTrade({
		...rest,
		walletMap,
		coinMap:{},
		type,
	} as any)
	const {t} = useTranslation()
	const inputBtnRef = React.useRef()
	const {defaultNetwork} = useSettings()
	const network = MapChainId[defaultNetwork] ?? MapChainId[1]

	// addressType

	const inputButtonDefaultProps = {
		label: t('labelL2toL2EnterToken'),
		size: InputSize.middle,
	}

	const [showFeeModal, setShowFeeModal] = React.useState(false)

	const popupState = usePopupState({
		variant: 'popover',
		popupId: `popupId-transfer`,
	})

	const getDisabled = React.useMemo(() => {
		return disabled || transferBtnStatus === TradeBtnStatus.DISABLED
	}, [disabled, transferBtnStatus])
	const handleToggleChange = (value: C) => {
		if (handleFeeChange) {
			handleFeeChange(value)
		}
	}
	return (
		<Box
		     width={'var(--modal-width)'}>
			<Typography
				component={'header'}
				height={'var(--toolbar-row-padding)'}
				display={'flex'}
				paddingX={3}
				justifyContent={'flex-start'}
				flexDirection={'row'}
				alignItems={'center'}
			>
				<Typography variant={'h4'} component={'span'} display={'inline-flex'} color={'textPrimary'} >
					{t('labelL2NFTBurnTitle', {
						loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
					})}
				</Typography>
				<Info2Icon
					{...bindHover(popupState)}
					sx={{
						marginLeft:1
					}}
					fontSize={'large'}
					htmlColor={'var(--color-text-third)'}
				/>
			</Typography>
			<PopoverPure
				className={'arrow-center'}
				{...bindPopper(popupState)}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
			>
				<Typography padding={2} maxWidth={450} variant={'body1'} whiteSpace={'pre-line'}>
					<Trans
						i18nKey='labelL2NFTBurnTip'
						tOptions={{
							l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
							loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
							loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
							l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
							l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
							ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
						}}
					>
						Transfer to any valid Ethereum addresses instantly. Please make sure the recipient
						address accepts Loopring layer-2 payments before you proceed.
					</Trans>
				</Typography>
			</PopoverPure>
			<Divider />
			<Grid container 
			      marginY={3}
			      paddingX={3}
			      spacing={2}>
				<Grid item xs={12} alignSelf={'stretch'} position={'relative'}>
					<NFTInput
						{...({
							...rest,
							..._event,
							t,
							getIPFSString: rest?.getIPFSString ?? (() => '' as any),
							disabled,
							walletMap,
							tradeData,
							inputNFTDefaultProps: {...inputButtonDefaultProps, label: '', size: InputSize.middle},
							inputNFTRef: inputBtnRef,
						} as any)}
					/>
				</Grid>
				<Grid item xs={12}  alignSelf={'stretch'} position={'relative'}>
					{!chargeFeeTokenList?.length ? (
						<Typography>{t('labelFeeCalculating')}</Typography>
					) : (
						<>
							<FeeSelect
								chargeFeeTokenList={chargeFeeTokenList}
								handleToggleChange={(fee: FeeInfo) => {
									handleToggleChange(fee as C)
									setShowFeeModal(false)
								}}
								feeInfo={feeInfo as FeeInfo}
								open={showFeeModal}
								onClose={() => {
									setShowFeeModal(false)
								}}
								isFeeNotEnough={isFeeNotEnough.isFeeNotEnough}
								feeLoading={isFeeNotEnough.isOnLoading}
								onClickFee={() => setShowFeeModal((prev) => !prev)}
							/>
						</>
					)}
				</Grid>
				<Grid item xs={12}  alignSelf={'stretch'} paddingBottom={0}>
					<Button
						fullWidth
						variant={'contained'}
						size={'medium'}
						color={'primary'}
						onClick={() => {
							onTransferClick({...tradeData, memo: "Burn"} as unknown as T)
						}}
						loading={!getDisabled && transferBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
						disabled={
							getDisabled ||
							transferBtnStatus === TradeBtnStatus.LOADING
						}
					>
						{t(transferI18nKey ?? `labelL2toL2Btn`)}
					</Button>
				</Grid>
			</Grid>
		</Box>
	)
}
