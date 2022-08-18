import { NFTMintAdvanceViewProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import {
  Box,
  Grid,
  Typography,
  Link,
  Stepper,
  StepLabel,
  Step,
  FormControlLabel,
  Radio,
} from "@mui/material";
import {
  CloseIcon,
  EmptyValueTag,
  FeeInfo,
  Info2Icon,
  LoadingIcon,
  myLog,
  TradeNFT,
  SoursURL,
  RefreshIcon,
  getShortAddr,
} from "@loopring-web/common-resources";
import {
  EmptyDefault,
  InputSize,
  NftImage,
  TextField,
  TGItemData,
  RadioGroupStyle,
  Button,
  BtnInfo,
  CollectionInput,
} from "../../basic-lib";
import {
  DropdownIconStyled,
  FeeTokenItemWrapper,
  IconClearStyled,
} from "./Styled";
import { NFTInput } from "./BasicANFTTrade";
import {
  CollectionMeta,
  DEPLOYMENT_STATUS,
  NFTType,
} from "@loopring-web/loopring-sdk";
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
      font-size: ${({ theme }) => theme.fontDefault.body1};
    }
  }
` as typeof Grid;
const MintAdStyle = styled(Box)`
  .MuiFormGroup-root {
    align-items: flex-start;
  }

  .coinInput-wrap {
    border: 1px solid var(--color-border);
  }

  .MuiInputLabel-root {
    font-size: ${({ theme }) => theme.fontDefault.body2};
  }
`;

const NFT_TYPE: TGItemData[] = [
  {
    value: NFTType.ERC1155,
    key: "ERC1155",
    label: "ERC1155",
    disabled: false,
  },
];

const steps = [
  "labelADMint1", //Prepare NFT metadata
  "labelADMint2", //labelADMint2
  "labelADMint3", //Preview & Mint NFT
];

export enum MintStep {
  SELECTWAY = 0,
  INPUTCID = 1,
  MINT = 2,
}

export function HorizontalLabelPositionBelowStepper({
  activeStep,
}: // handleSubmit
{
  // handleReset:()=>void,
  // handleNext:(currStep:number)=>void,
  activeStep: number;
  // setActiveStep: (step: number) => void
}) {
  const { t } = useTranslation("common");
  const { isMobile } = useSettings();
  return (
    <>
      <BoxStyle sx={{ width: "100%" }} marginTop={isMobile ? 3 : 0}>
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

export const MintAdvanceNFTWrap = <
  T extends TradeNFT<I, Co>,
  Co extends CollectionMeta,
  I extends any,
  C extends FeeInfo
>({
  disabled: gDisabled,
  walletMap,
  tradeData,
  btnInfo,
  baseURL,
  handleOnNFTDataChange,
  nftMintBtnStatus,
  isFeeNotEnough,
  handleFeeChange,
  chargeFeeTokenList,
  feeInfo,
  isNotAvailableCID,
  isNFTCheckLoading,
  collectionInputProps,
  onNFTMintClick,
  getIPFSString,
  etherscanBaseUrl,
}: NFTMintAdvanceViewProps<T, Co, I, C>) => {
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const [activeStep, setActiveStep] = React.useState(MintStep.SELECTWAY);
  const inputBtnRef = React.useRef();
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");

  const handleToggleChange = React.useCallback(
    (value: C) => {
      if (handleFeeChange) {
        handleFeeChange(value);
      }
    },
    [handleFeeChange]
  );
  // const handleBack = React.useCallback((currentStep: number) => {
  // 	setActiveStep(currentStep - 1)
  // }, []);
  const _handleOnNFTDataChange = (_tradeData: T) => {
    if (handleOnNFTDataChange) {
      handleOnNFTDataChange({ ...tradeData, ..._tradeData });
    }
  };

  // const tradeData
  myLog("mint tradeData", tradeData);
  const methodLabel = React.useCallback(
    ({ key }: { key: string }) => {
      return (
        <>
          <Typography
            component={"span"}
            variant={"body1"}
            color={"textPrimary"}
          >
            {t(`label${key}`)}
          </Typography>
        </>
      );
    },
    [t]
  );
  const [method, setMethod] = React.useState(AdMethod.NoData);
  const handleMethodChange = React.useCallback((_e: any, value: any) => {
    setMethod(value);
  }, []);
  const [src, setSrc] = React.useState<string>("");

  const btnMain = React.useCallback(
    ({
      defaultLabel = "labelMintNext",
      btnInfo,
      disabled,
      onClick,
    }: {
      defaultLabel?: string;
      btnInfo?: BtnInfo;
      disabled: () => boolean;
      onClick: () => void;
    }) => {
      return (
        <Button
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          fullWidth
          loading={
            !disabled() && nftMintBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={disabled() || nftMintBtnStatus === TradeBtnStatus.LOADING}
          onClick={onClick}
        >
          {btnInfo ? t(btnInfo.label, btnInfo.params) : t(defaultLabel)}
        </Button>
      );
    },
    [nftMintBtnStatus, t]
  );
  const [error, setError] = React.useState(false);

  const panelList: Array<{
    view: JSX.Element;
    onBack?: undefined | (() => void);
    height?: any;
    width?: any;
  }> = React.useMemo(() => {
    return [
      {
        view: (
          <Box
            marginTop={3}
            display={"flex"}
            justifyContent={"flex-start"}
            flexDirection={"column"}
            alignItems={"flex-start"}
            width={"100%"}
            maxWidth={"760px"}
          >
            <Typography component={"h4"} variant={"h5"} marginBottom={2}>
              {t("labelADMintSelect")}
            </Typography>
            <Box
              display={"flex"}
              alignItems={"flex-start"}
              flexDirection={isMobile ? "column" : "row"}
              justifyContent={"stretch"}
            >
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
                        control={<Radio />}
                        label={methodLabel({ key })}
                      />
                    </React.Fragment>
                  );
                })}
              </RadioGroupStyle>
            </Box>
            {method === AdMethod.NoData && (
              <Box width={"100%"} paddingX={isMobile ? 2 : 0}>
                <CollectionInput
                  {...{
                    ...(collectionInputProps as any),
                    collection: tradeData.collectionMeta as any,
                    onSelected: (item: Co) => {
                      collectionInputProps.onSelected(item);
                    },
                  }}
                  fullWidth={true}
                  size={"large"}
                  showCopy={true}
                />
              </Box>
            )}
            <Box width={"100%"} paddingX={isMobile ? 2 : 0} marginTop={2}>
              {btnMain({
                defaultLabel: "labelMintNext",
                disabled: () => {
                  return (
                    gDisabled ||
                    (method == AdMethod.NoData &&
                      tradeData.collectionMeta === undefined)
                  );
                },
                onClick: () => {
                  setActiveStep(MintStep.INPUTCID);
                },
              })}
            </Box>
          </Box>
        ),
        // onBack: () => setStep(CreateCollectionStep.ChooseMethod)
      },
      {
        view: (
          <Box
            marginTop={3}
            display={"flex"}
            justifyContent={"flex-start"}
            flexDirection={"column"}
            alignItems={"flex-start"}
            width={"100%"}
            maxWidth={"760px"}
          >
            <Typography variant={"h5"} marginBottom={2}>
              {t("labelMintIPFSCIDDes")}
            </Typography>
            <Box
              display={"flex"}
              alignItems={"center"}
              flexDirection={"column"}
              justifyContent={"space-between"}
              position={"relative"}
              alignSelf={"stretch"}
            >
              <Typography
                component={"span"}
                display={"flex"}
                alignItems={"flex-start"}
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
                      style={{ cursor: "pointer", marginLeft: "4px" }}
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
                    isNotAvailableCID
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
                    style={{ top: "32px", right: "8px", position: "absolute" }}
                  />
                ) : (
                  <IconClearStyled
                    color={"inherit"}
                    size={"small"}
                    style={{ top: "30px" }}
                    aria-label="Clear"
                    onClick={() =>
                      _handleOnNFTDataChange({ nftIdView: "", nftId: "" } as T)
                    }
                  >
                    <CloseIcon />
                  </IconClearStyled>
                )
              ) : (
                ""
              )}
              {isNotAvailableCID &&
              tradeData?.nftIdView &&
              tradeData?.nftIdView !== "" ? (
                <Typography
                  color={"var(--color-error)"}
                  variant={"body1"}
                  alignSelf={"stretch"}
                  position={"relative"}
                  component={"span"}
                  whiteSpace={"pre-line"}
                >
                  {t("labelInvalidCID") +
                    "\n Reason: " +
                    t(isNotAvailableCID.reason, { ns: "error" })}
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
                        width={"100%"}
                        style={{ wordBreak: "break-all" }}
                      >
                        {tradeData?.nftId}
                      </Typography>
                    )}
                </>
              )}
              {!!(
                tradeData.nftId &&
                tradeData.tokenAddress &&
                tradeData.collectionMeta &&
                tradeData.collectionMeta.contractAddress
              ) &&
                (!tradeData.collectionMeta.name ||
                !tradeData.collectionMeta.tileUri ? (
                  <Typography
                    color={"var(--color-warning)"}
                    variant={"body1"}
                    alignSelf={"stretch"}
                    position={"relative"}
                    component={"span"}
                    marginTop={2}
                    whiteSpace={"pre-line"}
                  >
                    {t("labelCollectionMetaNoNameORTileUri")}
                  </Typography>
                ) : (
                  <></>
                ))}
            </Box>
            <Box
              width={"100%"}
              paddingX={isMobile ? 2 : 0}
              marginTop={2}
              flexDirection={"row"}
              display={"flex"}
            >
              <Box width={"50%"} paddingRight={1}>
                <Button
                  variant={"outlined"}
                  size={"medium"}
                  color={"primary"}
                  fullWidth
                  sx={{ height: "var(--btn-medium-height)" }}
                  onClick={() => {
                    setActiveStep(MintStep.SELECTWAY);
                    _handleOnNFTDataChange({
                      nftIdView: "",
                      nftId: "",
                      tradeValue: undefined,
                    } as T);
                  }}
                >
                  {t(`labelMintBack`)}
                </Button>
              </Box>
              <Box width={"50%"} paddingLeft={1}>
                {btnMain({
                  defaultLabel: "labelMintNext",
                  btnInfo: undefined, //btnInfo,
                  disabled: () => {
                    return gDisabled || !!isNotAvailableCID;
                  },
                  onClick: () => {
                    setActiveStep(MintStep.MINT);
                    setSrc(getIPFSString(tradeData?.image, baseURL));
                  },
                })}
              </Box>
            </Box>
          </Box>
        ),
      },
      {
        view: (
          <>
            <Box
              marginTop={2}
              flex={1}
              alignSelf={"stretch"}
              display={"flex"}
              paddingX={isMobile ? 0 : 4}
              flexDirection={isMobile ? "column" : "row"}
            >
              <Box
                display={"flex"}
                position={"relative"}
                width={"auto"}
                minHeight={200}
                minWidth={380}
              >
                <img
                  style={{
                    opacity: 0,
                    width: "100%",
                    padding: 16,
                    height: "100%",
                    display: "block",
                  }}
                  alt={"ipfs"}
                  src={SoursURL + "svg/ipfs.svg"}
                />
                <Box
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0,
                    height: "100%",
                    width: "100%",
                  }}
                >
                  {!!(tradeData?.nftId && tradeData.image) ? (
                    <Box
                      alignSelf={"stretch"}
                      flex={1}
                      display={"flex"}
                      style={{ background: "var(--field-opacity)" }}
                      alignItems={"center"}
                      height={"100%"}
                      justifyContent={"center"}
                    >
                      {error ? (
                        <Box
                          flex={1}
                          display={"flex"}
                          alignItems={"center"}
                          justifyContent={"center"}
                          sx={{ cursor: "pointer" }}
                          onClick={async (event) => {
                            event.stopPropagation();
                            setError(false);
                            setSrc(getIPFSString(tradeData?.image, baseURL));
                          }}
                        >
                          <RefreshIcon style={{ height: 36, width: 36 }} />
                        </Box>
                      ) : (
                        <NftImage
                          alt={src}
                          src={src}
                          onError={() => setError(true)}
                        />
                      )}
                    </Box>
                  ) : (
                    <Box
                      flex={1}
                      display={"flex"}
                      alignItems={"center"}
                      height={"100%"}
                      justifyContent={"center"}
                    >
                      <EmptyDefault
                        // width={"100%"}
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
                    </Box>
                  )}
                </Box>
              </Box>
              <Box
                flex={1}
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"space-between"}
                alignItems={"stretch"}
                paddingLeft={isMobile ? 0 : 2}
              >
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  alignItems={"stretch"}
                >
                  <Typography
                    component={"span"}
                    display={"inline-flex"}
                    justifyContent={"space-between"}
                    variant={"body1"}
                    marginBottom={2}
                  >
                    <Typography
                      color={"textSecondary"}
                      component={"span"}
                      marginRight={1}
                    >
                      {t("labelNFTName")}
                    </Typography>
                    <Typography
                      component={"span"}
                      color={"var(--color-text-third)"}
                      whiteSpace={"break-spaces"}
                      style={{ wordBreak: "break-all" }}
                      title={tradeData.name}
                    >
                      {tradeData.name ?? EmptyValueTag}
                    </Typography>
                  </Typography>
                  <Typography
                    component={"span"}
                    display={"inline-flex"}
                    justifyContent={"space-between"}
                    variant={"body1"}
                    marginBottom={2}
                  >
                    <Typography
                      color={"textSecondary"}
                      component={"span"}
                      marginRight={1}
                    >
                      {t("labelNFTType")}
                    </Typography>
                    <Typography
                      component={"span"}
                      color={"var(--color-text-third)"}
                      whiteSpace={"break-spaces"}
                      style={{ wordBreak: "break-all" }}
                      title={NFT_TYPE[0].label}
                    >
                      {NFT_TYPE[0].label}
                    </Typography>
                  </Typography>

                  <Typography
                    component={"span"}
                    display={"inline-flex"}
                    justifyContent={"space-between"}
                    variant={"body1"}
                    marginBottom={2}
                  >
                    <Typography
                      color={"textSecondary"}
                      component={"span"}
                      marginRight={1}
                    >
                      {t("labelNFTContractAddress")}
                    </Typography>
                    {tradeData.collectionMeta &&
                    tradeData.collectionMeta.deployStatus ==
                      DEPLOYMENT_STATUS.DEPLOYED ? (
                      <Link
                        fontSize={"inherit"}
                        whiteSpace={"break-spaces"}
                        style={{ wordBreak: "break-all" }}
                        target="_blank"
                        color={"var(--color-text-third)"}
                        title={tradeData.collectionMeta.contractAddress}
                        rel="noopener noreferrer"
                        href={`${etherscanBaseUrl}token/${tradeData.collectionMeta.contractAddress}`}
                      >
                        {tradeData.collectionMeta.contractAddress}
                      </Link>
                    ) : (
                      <Typography
                        component={"span"}
                        color={"var(--color-text-third)"}
                        title={
                          "Counter Factual NFT" +
                          tradeData?.collectionMeta?.contractAddress
                        }
                      >
                        {t("labelCounterFactualNFT") +
                          getShortAddr(
                            tradeData?.collectionMeta?.contractAddress ?? ""
                          )}
                      </Typography>
                    )}
                  </Typography>

                  <Typography
                    component={"span"}
                    display={"inline-flex"}
                    justifyContent={"space-between"}
                    variant={"body1"}
                    marginBottom={2}
                  >
                    <Typography
                      color={"textSecondary"}
                      component={"span"}
                      marginRight={1}
                    >
                      {t("labelNFTCollection")}
                    </Typography>
                    <Typography
                      component={"span"}
                      color={"var(--color-text-third)"}
                      whiteSpace={"break-spaces"}
                      display={"inline-flex"}
                      alignItems={"center"}
                      style={{ wordBreak: "break-all" }}
                      title={tradeData.collectionMeta?.contractAddress}
                    >
                      {tradeData.collectionMeta?.name}
                      {/*{tradeData.collectionMeta?.name  + ' ' ?? EmptyValueTag}*/}
                    </Typography>
                  </Typography>

                  <NFTInput
                    {...({ t } as any)}
                    isThumb={false}
                    baseURL={baseURL}
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

                  <Box marginTop={2} alignSelf={"stretch"}>
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
                          <Typography
                            component={"span"}
                            color={"inherit"}
                            minWidth={28}
                          >
                            {t("labelMintFee")}：
                          </Typography>
                          <Box
                            component={"span"}
                            display={"flex"}
                            alignItems={"center"}
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              setDropdownStatus((prev) =>
                                prev === "up" ? "down" : "up"
                              )
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
                  </Box>
                </Box>
                <Box
                  width={"100%"}
                  paddingX={isMobile ? 2 : 0}
                  marginTop={2}
                  flexDirection={"row"}
                  display={"flex"}
                >
                  <Box width={"50%"} paddingRight={1}>
                    <Button
                      variant={"outlined"}
                      size={"medium"}
                      color={"primary"}
                      fullWidth
                      sx={{ height: "var(--btn-medium-height)" }}
                      onClick={() => {
                        setActiveStep(MintStep.INPUTCID);

                        _handleOnNFTDataChange({
                          tradeValue: undefined,
                          collectionMeta: undefined,
                          // tokenAddress:undefined,
                        } as T);
                      }}
                    >
                      {t(`labelMintBack`)}
                    </Button>
                  </Box>
                  <Box width={"50%"} paddingLeft={1}>
                    {btnMain({
                      defaultLabel: t("labelTokenAdMintBtn"),
                      btnInfo: btnInfo,
                      disabled: () => {
                        return (
                          gDisabled ||
                          nftMintBtnStatus === TradeBtnStatus.DISABLED
                        );
                      },
                      onClick: () => {
                        // setActiveStep(MintSte)
                        onNFTMintClick(tradeData);
                      },
                    })}
                  </Box>
                </Box>
              </Box>
            </Box>
          </>
        ),
      },
    ];
  }, [
    _handleOnNFTDataChange,
    chargeFeeTokenList,
    dropdownStatus,
    feeInfo,
    handleMethodChange,
    handleToggleChange,
    isNotAvailableCID,
    isFeeNotEnough.isFeeNotEnough,
    isFeeNotEnough.isOnLoading,
    isMobile,
    isNFTCheckLoading,
    method,
    methodLabel,
    t,
    tradeData,
    walletMap,
  ]);

  // @ts-ignore
  return (
    <Box
      className={walletMap ? "" : "loading"}
      display={"flex"}
      flex={1}
      flexDirection={"column"}
      padding={5 / 2}
      alignItems={"center"}
    >
      <HorizontalLabelPositionBelowStepper activeStep={activeStep} />
      <MintAdStyle
        flex={1}
        marginTop={2}
        paddingX={isMobile ? 2 : 5}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"flex-start"}
        width={"100%"}
      >
        {panelList.map((panel, index) => {
          return (
            <React.Fragment key={index}>
              {activeStep === index ? panel.view : <></>}
            </React.Fragment>
          );
        })}
      </MintAdStyle>
    </Box>
  );
};
