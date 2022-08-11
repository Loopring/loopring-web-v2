import { NFTMintAdvanceViewProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Typography, Link, Stepper, StepLabel, Step, FormControlLabel, Radio } from "@mui/material";
import {
	CloseIcon,
	EmptyValueTag,
	FeeInfo,
	Info2Icon,
	IPFS_LOOPRING_SITE,
  IPFS_HEAD_URL,
	LoadingIcon,
	myLog,
	TradeNFT,
} from "@loopring-web/common-resources";
import {
	Button,
	EmptyDefault,
	InputSize,
	NftImage,
	TextField,
	TGItemData,
	RadioGroupStyle
} from "../../basic-lib";
import {
	DropdownIconStyled,
	FeeTokenItemWrapper,
	IconClearStyled,
} from "./Styled";
import { NFTInput } from "./BasicANFTTrade";
import { NFTType } from "@loopring-web/loopring-sdk";
import { TradeBtnStatus } from "../Interface";
import styled from "@emotion/styled";
import { FeeToggle } from "./tool/FeeList";
import { useSettings } from "../../../stores";

export enum AdMethod {
	HasData = "HasData",
	NoData = "NoData",
}

const BoxStyle = styled(Grid)`
  .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium {
    height: var(--btn-icon-size-large);
    width: var(--btn-icon-size-large);

    .MuiStepIcon-text {
      font-size: ${({theme}) => theme.fontDefault.body1};
    }
  }
` as typeof Grid;
const NFT_TYPE: TGItemData[] = [
	{
		value: NFTType.ERC1155,
		key: "ERC1155",
		label: "ERC1155",
		disabled: false,
	},
];


const steps = [
	'labelADMint1', //Prepare NFT metadata
	'labelADMint2', //labelADMint2
	'labelADMint3', //Preview & Mint NFT
];

export enum MintStep {
	SELECTWAY = 0,
	INPUTCID = 1,
	MINT = 1,
}

export function HorizontalLabelPositionBelowStepper(
	{
		activeStep,
		// handleSubmit
	}: {
		// handleReset:()=>void,
		// handleNext:(currStep:number)=>void,
		activeStep: number,
		// setActiveStep: (step: number) => void
	}) {
	const {t} = useTranslation('common');
	return (<>
			<BoxStyle sx={{width: '100%'}}>
				<Stepper activeStep={activeStep} alternativeLabel>
					{steps.map((label) => (
						<Step key={label}>
							<StepLabel>{t(label)}</StepLabel>
						</Step>
					))}
				</Stepper>
			</BoxStyle>

		</>

	);
}

export const MintAdvanceNFTWrap = <T extends TradeNFT<I>,
	I,
	C extends FeeInfo>(
	{
		disabled,
		walletMap,
		tradeData,
		btnInfo,
		handleOnNFTDataChange,
		nftMintBtnStatus,
		isFeeNotEnough,
		handleFeeChange,
		chargeFeeTokenList,
		feeInfo,
		isAvailableId,
		isNFTCheckLoading,
		onNFTMintClick,
	}: NFTMintAdvanceViewProps<T, I, C>) => {
	const {t} = useTranslation(["common"]);
	const {isMobile} = useSettings();
  const [activeStep, setActiveStep] = React.useState(MintStep.SELECTWAY);

	const inputBtnRef = React.useRef();
	const [dropdownStatus, setDropdownStatus] =
		React.useState<"up" | "down">("down");
	const getDisabled = React.useMemo(() => {
		return disabled || nftMintBtnStatus === TradeBtnStatus.DISABLED;
	}, [disabled, nftMintBtnStatus]);

	const handleToggleChange = (value: C) => {
		if (handleFeeChange) {
			handleFeeChange(value);
		}
	};
	const handleBack = React.useCallback((currentStep: number) => {
		setActiveStep(currentStep - 1)
	}, []);
	const _handleOnNFTDataChange = (_tradeData: T) => {
		if (handleOnNFTDataChange) {
			handleOnNFTDataChange({...tradeData, ..._tradeData});
		}
	};
	myLog("mint tradeData", tradeData);
	const methodLabel = React.useCallback(
		({key}: any) => {
			return (
				<>
					<Typography
						component={"span"}
						variant={"body1"}
						color={"textPrimary"}
					>
						{t(`label${key}`)}
						{/*<Trans*/}
						{/*	i18nKey="whichColorIsUp"*/}
						{/*>*/}
						{/*	<Typography*/}
						{/*		component={"span"}*/}
						{/*		variant={"body2"}*/}
						{/*		color={"textPrimary"}*/}
						{/*		style={{*/}
						{/*			textTransform: "capitalize",*/}
						{/*			// color: key === UpColor.green ? theme.colorBase.success : theme.colorBase.error*/}
						{/*		}}*/}
						{/*	>*/}
						{/*		color up*/}
						{/*	</Typography>*/}
						{/*	and*/}
						{/*	<Typography*/}
						{/*		component={"span"}*/}
						{/*		variant={"body2"}*/}
						{/*		color={"textPrimary"}*/}
						{/*		style={{*/}
						{/*			textTransform: "capitalize",*/}
						{/*			// color: key === UpColor.green ? theme.colorBase.error : theme.colorBase.success*/}
						{/*		}}*/}
						{/*	>*/}
						{/*		color down*/}
						{/*	</Typography>*/}
						{/*</Trans>*/}
					</Typography>
					{/*<Typography*/}
					{/*	component={"span"}*/}
					{/*	style={{ verticalAlign: "-webkit-baseline-middle" }}*/}
					{/*	color={*/}
					{/*		key === UpColor.green*/}
					{/*			? "var(--color-success)"*/}
					{/*			: "var(--color-error)"*/}
					{/*	}*/}
					{/*>*/}
					{/*	<GrowIcon fontSize={"medium"} color={"inherit"} />*/}
					{/*</Typography>*/}
				</>
			);
		},
		[UpColor]
	);
	const [method, setMethod] = React.useState(AdMethod.NoData);
	const handleMethodChange = React.useCallback((_e: any, value: any) => {
		setMethod(value)
	}, []);
	const panelList: Array<{
		view: JSX.Element;
		onBack?: undefined | (() => void);
		height?: any;
		width?: any;
	}> = React.useMemo(() => {
		return [
			{
				view: <Box
					flex={1}
					// alignItems={"center"}
					display={"flex"}
					justifyContent={"center"}
					flexDirection={"column"}
				>
					<Typography component={'h4'} variant={'h5'} marginBottom={2}>
						{t('labelADMintSelect')}
					</Typography>
					<Box flex={1}
					     display={"flex"}
					     flexDirection={isMobile ? "column" : "row"}
					     justifyContent={"flex-start"}>

						<RadioGroupStyle
							row={false}
							aria-label="withdraw"
							name="withdraw"
							value={method}
							onChange={handleMethodChange}
						>
							{Object.keys(AdMethod).map((key) => {
								return (
									<React.Fragment key={key}>
										<FormControlLabel
											value={key}
											control={<Radio/>}
											label={methodLabel({key})}
										/>
									</React.Fragment>
								);
							})}
						</RadioGroupStyle>
					</Box>
				</Box>,
				// onBack: () => setStep(CreateCollectionStep.ChooseMethod)
			},
			{
				view: <Grid item marginTop={2} alignSelf={"stretch"}>
					<Box
						display={"flex"}
						alignItems={"center"}
						flexDirection={"column"}
						justifyContent={"space-between"}
						position={"relative"}
					>
						<Typography
							component={"span"}
							display={"flex"}
							alignItems={"center"}
							alignSelf={"flex-start"}
							marginBottom={1}
							color={"textSecondary"}
							variant={"body2"}
						>
							<Trans i18nKey={"labelNFTCid"}>
								IPFS CID :(Store Metadata Information),
								<Link
									target="_blank"
									rel="noopener noreferrer"
									href={"./#/document/mint_nft.md"}
									paddingLeft={1}
								>
									Follow this Guide
									<Info2Icon
										style={{cursor: "pointer", marginLeft: "4px"}}
										fontSize={"medium"}
										htmlColor={"var(--color-text-third)"}
									/>
								</Link>
							</Trans>
						</Typography>
						<TextField
							value={tradeData?.nftIdView}
							label={""}
							title={t("labelNFTCid")}
							error={
								!!(
									tradeData.nftIdView !== "" &&
									!isNFTCheckLoading &&
									!isAvailableId
								)
							}
							placeholder={t("mintNFTAddressLabelPlaceholder")}
							onChange={(event) =>
								_handleOnNFTDataChange({
									nftIdView: event.target?.value,
									nftId: "",
								} as T)
							}
							fullWidth={true}
						/>
						{tradeData?.nftIdView && tradeData.nftIdView !== "" ? (
							isNFTCheckLoading ? (
								<LoadingIcon
									width={24}
									style={{top: "32px", right: "8px", position: "absolute"}}
								/>
							) : (
								<IconClearStyled
									color={"inherit"}
									size={"small"}
									style={{top: "30px"}}
									aria-label="Clear"
									onClick={() =>
										_handleOnNFTDataChange({nftIdView: "", nftId: ""} as T)
									}
								>
									<CloseIcon/>
								</IconClearStyled>
							)
						) : (
							""
						)}
						{!isAvailableId &&
						tradeData?.nftIdView &&
						tradeData?.nftIdView !== "" ? (
							<Typography
								color={"var(--color-error)"}
								fontSize={14}
								alignSelf={"stretch"}
								position={"relative"}
								component={"span"}
							>
								{t("labelInvalidCID")}
							</Typography>
						) : (
							<>
								{tradeData?.nftId &&
									tradeData.tokenAddress &&
									tradeData?.nftIdView !== "" && (
										<Typography
											color={"var(--color-text-primary)"}
											variant={"body2"}
											whiteSpace={"break-spaces"}
											marginTop={1 / 4}
											component={"span"}
											style={{wordBreak: "break-all"}}
										>
											{tradeData?.nftId}
										</Typography>
									)}
							</>
						)}
					</Box>
				</Grid>,
			},
			{
				view: <>
					<Grid item marginTop={2} alignSelf={"stretch"}>
						<Box
							display={"flex"}
							flexDirection={"row"}
							justifyContent={"space-between"}
							alignContent={"center"}
						>
							<Box>
								<Box>
									<Typography
										color={"textSecondary"}
										marginBottom={2}
										variant={"body1"}
										display={"flex"}
										flexDirection={"column"}
										whiteSpace={"pre-line"}
										maxWidth={240}
									>
										{t("labelNFTName") +
											" " +
											(tradeData?.nftId
												? tradeData.name ?? t("labelUnknown").toUpperCase()
												: EmptyValueTag)}
									</Typography>
									<Typography
										color={"textSecondary"}
										marginBottom={2}
										variant={"body1"}
									>
										{t("labelNFTType") + " "} {NFT_TYPE[ 0 ].label}
									</Typography>
								</Box>
								<Box
									display={"flex"}
									alignItems={"center"}
									justifyContent={"flex-start"}
								>
									<NFTInput
										{...({t} as any)}
										isThumb={false}
										isBalanceLimit={true}
										inputNFTDefaultProps={{
											subLabel: t("tokenNFTMaxMINT"),
											size: InputSize.small,
											label: (
												<Trans i18nKey={"labelNFTMintInputTitle"}>
													Amount
													<Typography
														component={"span"}
														variant={"inherit"}
														color={"error"}
													>
														{"\uFE61"}
													</Typography>
												</Trans>
											),
										}}
										// disabled={!(tradeData?.nftId && tradeData.tokenAddress)}
										type={"NFT"}
										inputNFTRef={inputBtnRef}
										onChangeEvent={(_index, data) =>
											_handleOnNFTDataChange({
												tradeValue: data.tradeData?.tradeValue ?? "0",
											} as T)
										}
										tradeData={
											{
												...tradeData,
												belong: tradeData?.tokenAddress ?? "NFT",
											} as any
										}
										walletMap={walletMap}
									/>
								</Box>
							</Box>
							<Box
								flex={1}
								display={"flex"}
								justifyContent={"center"}
								alignItems={"center"}
								width={160}
								height={160}
							>
								{tradeData?.nftId && tradeData.image ? (
									<NftImage
										alt={"NFT"}
										src={tradeData?.image?.replace(
                      IPFS_HEAD_URL,
											IPFS_LOOPRING_SITE
										)}
										onError={() => undefined}
									/>
								) : isNFTCheckLoading ? (
									<LoadingIcon fontSize={"large"}/>
								) : (
									<EmptyDefault
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
								)}
							</Box>
						</Box>
					</Grid>
					<Grid item /* marginTop={2} */ alignSelf={"stretch"} marginTop={2}>
						{!chargeFeeTokenList?.length ? (
							<Typography>{t("labelFeeCalculating")}</Typography>
						) : (
							<>
								<Typography
									component={"span"}
									display={"flex"}
									flexWrap={"wrap"}
									alignItems={"center"}
									variant={"body1"}
									color={"var(--color-text-secondary)"}
									marginBottom={1}
								>
									<Typography component={"span"} color={"inherit"} minWidth={28}>
										{t("labelMintFee")}：
									</Typography>
									<Box
										component={"span"}
										display={"flex"}
										alignItems={"center"}
										style={{cursor: "pointer"}}
										onClick={() =>
											setDropdownStatus((prev) => (prev === "up" ? "down" : "up"))
										}
									>
										{feeInfo && feeInfo.belong && feeInfo.fee
											? feeInfo.fee + " " + feeInfo.belong
											: EmptyValueTag + " " + feeInfo?.belong}
										<DropdownIconStyled
											status={dropdownStatus}
											fontSize={"medium"}
										/>
										{isFeeNotEnough.isOnLoading ? (
											<Typography
												color={"var(--color-warning)"}
												marginLeft={1}
												component={"span"}
											>
												{t("labelFeeCalculating")}
											</Typography>
										) : (
											isFeeNotEnough.isFeeNotEnough && (
												<Typography
													marginLeft={1}
													component={"span"}
													color={"var(--color-error)"}
												>
													{t("labelMintFeeNotEnough")}
												</Typography>
											)
										)}
									</Box>
								</Typography>
								{dropdownStatus === "up" && (
									<FeeTokenItemWrapper padding={2}>
										<Typography
											variant={"body2"}
											color={"var(--color-text-third)"}
											marginBottom={1}
											component={"span"}
										>
											{t("labelMintFeeChoose")}
										</Typography>
										<FeeToggle
											chargeFeeTokenList={chargeFeeTokenList}
											handleToggleChange={handleToggleChange}
											feeInfo={feeInfo}
										/>
									</FeeTokenItemWrapper>
								)}
							</>
						)}
					</Grid>
				</>

			}

		]
	}, [_handleOnNFTDataChange, chargeFeeTokenList, dropdownStatus, feeInfo, handleToggleChange, isAvailableId, isFeeNotEnough.isFeeNotEnough, isFeeNotEnough.isOnLoading, isMobile, isNFTCheckLoading, t, tradeData, walletMap]);
	const handleNext = React.useCallback((currentNext) => {
		setActiveStep(currentNext + 1)
	}, []);
	// @ts-ignore
	return (
		<Grid
			className={walletMap ? "" : "loading"}
			spacing={2}
			container
			// paddingLeft={5 / 2}
			// paddingRight={5 / 2}
			padding={5 / 2}
		>
			<Grid item xs={12} marginY={2}>
				<HorizontalLabelPositionBelowStepper activeStep={activeStep}/>
			</Grid>

			<Grid item xs={12}>
				{
					panelList.map((panel, index) => {
						return (
							<Box
								flex={1}
								paddingX={3}
								display={
									activeStep === index ? "flex" : "none"
								}
								alignItems={"stretch"}
								key={index}
							>
								{panel.view}
							</Box>
						);
					})
				}
			</Grid>


			<Grid item marginTop={3} alignSelf={"stretch"}>
				{btnInfo?.label === "labelNFTMintNoMetaBtn" && (
					<Typography
						color={"var(--color-warning)"}
						component={"p"}
						variant={"body1"}
						marginBottom={1}
						style={{wordBreak: "break-all"}}
					>
						<Trans i18nKey={"labelNFTMintNoMetaDetail"}>
							Your NFT metadata should identify
							<em style={{fontWeight: 600}}>
								name, image & royalty_percentage(number from 0 to 10)
							</em>
							.
						</Trans>
					</Typography>
				)}
				<Box>
					<Typography sx={{mt: 2, mb: 1}}>Step {activeStep + 1}</Typography>
					<Box sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
						<Button
							color="inherit"
							disabled={activeStep === 0}
							onClick={() => handleBack(activeStep)}
							sx={{mr: 1}}
						>
							{t('labelBack')}
						</Button>
						<Box sx={{flex: '1 1 auto'}}/>
						<Button onClick={() => {
							handleNext(activeStep)
						}} sx={{mr: 1}}>
							{t('labelNext')}
						</Button>
						{activeStep !== steps.length && <></>
							// (completed[ activeStep ] ? (
							// 	<Typography variant="caption" sx={{display: 'inline-block'}}>
							// 		Step {activeStep + 1} already completed
							// 	</Typography>
							// ) : (
							// <Button onClick={handleComplete}>
							// 	{completedSteps() === totalSteps() - 1
							// 		? 'Finish'
							// 		: 'Complete Step'}
							// </Button>
							// ))
						}
					</Box>
					<Button
						fullWidth
						variant={"contained"}
						size={"medium"}
						color={"primary"}
						onClick={async () => {
							await onNFTMintClick(tradeData);
						}}
						loading={
							!getDisabled && nftMintBtnStatus === TradeBtnStatus.LOADING
								? "true"
								: "false"
						}
						disabled={getDisabled || nftMintBtnStatus === TradeBtnStatus.LOADING}
					>
						{btnInfo ? t(btnInfo.label, btnInfo.params) : t(`labelNFTMintBtn`)}
					</Button>
				</Box>

			</Grid>
		</Grid>
	);
};
