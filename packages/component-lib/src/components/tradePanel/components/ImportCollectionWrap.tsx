import { ImportCollectionStep, ImportCollectionViewProps } from "./Interface";
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
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  MenuItem,
  ListItemText,
} from "@mui/material";
import {
  CloseIcon,
  EmptyValueTag,
  LoadingIcon,
  myLog,
  SoursURL,
  RefreshIcon,
  getShortAddr,
  CheckedIcon,
  CheckBoxIcon,
  BackIcon,
  TOAST_TIME,
  DropDownIcon,
} from "@loopring-web/common-resources";
import {
  EmptyDefault,
  InputSize,
  NftImage,
  TextField,
  TGItemData,
  Button,
  BtnInfo,
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
import { Toast } from "../../toast";
import * as sdk from "@loopring-web/loopring-sdk";

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

  .MuiButtonBase-root.step {
    padding-left: ${({ theme }) => theme.unit * 4}px;
    padding-right: ${({ theme }) => theme.unit * 4}px;
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
  "labelImportCollection1", //Prepare NFT metadata
  "labelImportCollection2", //labelADMint2
  "labelImportCollection3", //Preview & Mint NFT
];

export function HorizontalLabelPositionBelowStepper({
  step,
}: {
  step: ImportCollectionStep;
}) {
  const { t } = useTranslation("common");
  const { isMobile } = useSettings();
  return (
    <>
      <BoxStyle sx={{ width: "100%" }} marginTop={isMobile ? 3 : 0}>
        <Stepper activeStep={step} alternativeLabel>
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

export const ImportCollectionWrap = <
  Co extends CollectionMeta,
  NFT extends sdk.UserNFTBalanceInfo
>({
  // account,
  onContractChange,
  onContractNext,
  setStep,
  onCollectionChange,
  onCollectionNext,
  onNFTSelected,
  onNFTSelectedMethod,
  step,
  data,
  // btnStatus,
  disabled,
  onLoading,
  onClick,
}: ImportCollectionViewProps<Co, NFT>) => {
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const {
    contractList,
    selectContract,
    collectionList,
    selectCollection,
    listNFT,
    selectNFTList,
  } = data;
  myLog("ImportCollectionWrap", contractList);
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

  const btnMain = ({
    defaultLabel = "labelMintNext",
    btnInfo,
    disabled,
    onClick,
    fullWidth,
  }: {
    defaultLabel?: string;
    btnInfo?: BtnInfo;
    disabled: () => boolean;
    onClick: () => void;
    fullWidth?: boolean;
  }) => {
    return (
      <Button
        variant={"contained"}
        size={"medium"}
        color={"primary"}
        fullWidth={fullWidth}
        className={"step"}
        endIcon={
          <BackIcon fontSize={"small"} sx={{ transform: "rotate(180deg)" }} />
        }
        loading={!disabled() && onLoading ? "true" : "false"}
        disabled={disabled()}
        onClick={onClick}
      >
        {btnInfo ? t(btnInfo.label, btnInfo.params) : t(defaultLabel)}
      </Button>
    );
  };
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
              {t("labelCheckImportCollectionTitle")}
            </Typography>
            <Box
              display={"flex"}
              alignItems={"flex-start"}
              flexDirection={isMobile ? "column" : "row"}
              justifyContent={"stretch"}
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
                <Trans i18nKey={"labelSelectContractAddress"}>
                  Contract address
                </Trans>
              </Typography>
              <TextField
                id="ContractAddress"
                select
                label={"label"}
                value={selectContract ?? ""}
                onChange={(event: React.ChangeEvent<any>) => {
                  onContractChange(event.target?.value);
                }}
                inputProps={{ IconComponent: DropDownIcon }}
                fullWidth={true}
              >
                {contractList.map((item, index) => {
                  return (
                    <MenuItem
                      component={"div"}
                      key={item.toString() + index}
                      value={item}
                      selected={item === selectContract}
                      withnocheckicon={"true"}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            sx={{ display: "inline" }}
                            component="span"
                            variant="body1"
                            color="text.primary"
                          >
                            {getShortAddr(item)}
                          </Typography>
                        }
                      />
                    </MenuItem>
                  );
                })}
              </TextField>
            </Box>
            <Box
              width={"100%"}
              paddingX={isMobile ? 2 : 0}
              marginTop={2}
              flexDirection={"row"}
              display={"flex"}
              justifyContent={"space-between"}
            >
              {btnMain({
                defaultLabel: "labelContinue",
                fullWidth: true,
                disabled: () => {
                  return disabled || !selectContract;
                },
                onClick: () => {
                  setStep(ImportCollectionStep.SELECTCOLLECTION);
                  onContractNext(selectContract);
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
                </Trans>
              </Typography>
              <TextField
                value={cid}
                label={""}
                title={t("labelNFTCid")}
                error={
                  !!(
                    tradeData.nftIdView !== "" &&
                    !isNFTCheckLoading &&
                    isNotAvailableCID
                  )
                }
                disabled={isNFTCheckLoading}
                placeholder={t("mintNFTAddressLabelPlaceholder")}
                onChange={(event) => {
                  const cid = event.target?.value;
                  setCid(cid);
                  if (
                    /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})$/.test(
                      cid
                    )
                  ) {
                    handleOnNFTDataChange({
                      nftIdView: cid,
                      nftId: "",
                    } as T);
                  } else {
                    handleOnNFTDataChange({
                      nftIdView: "",
                      nftId: "",
                    } as T);
                  }
                }}
                fullWidth={true}
              />
              {cid && cid !== "" ? (
                isNFTCheckLoading ? (
                  <LoadingIcon
                    width={24}
                    style={{
                      top: "32px",
                      right: "8px",
                      position: "absolute",
                    }}
                  />
                ) : (
                  <IconClearStyled
                    color={"inherit"}
                    size={"small"}
                    style={{ top: "30px" }}
                    aria-label="Clear"
                    onClick={() => {
                      setCid("");
                      handleOnNFTDataChange({
                        nftIdView: "",
                        nftId: "",
                      } as T);
                    }}
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
                (metaDataErrorDataInfo.length ? (
                  <Box display={"flex"} flexDirection={"column"} width={"100%"}>
                    <Typography
                      color={"error"}
                      variant={"body1"}
                      alignSelf={"stretch"}
                      position={"relative"}
                      component={"span"}
                      marginTop={2}
                      whiteSpace={"pre-line"}
                    >
                      {t("labelCollectionMetaError", {
                        type: metaDataErrorDataInfo.length
                          ? "`" + metaDataErrorDataInfo.join("`, `") + "`"
                          : t("labelCollectionMetaErrorType"),
                      })}
                    </Typography>
                  </Box>
                ) : metaDataMissDataInfo.length ? (
                  <Box display={"flex"} flexDirection={"column"} width={"100%"}>
                    <Typography
                      color={"var(--color-warning)"}
                      variant={"body1"}
                      alignSelf={"stretch"}
                      position={"relative"}
                      component={"span"}
                      marginTop={2}
                      whiteSpace={"pre-line"}
                    >
                      {t("labelCollectionMetaMiss", {
                        type: "`" + metaDataMissDataInfo.join("`, `") + "`",
                      })}
                    </Typography>
                    <MuiFormControlLabel
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(_event: any, state: boolean) => {
                            setChecked(state);
                          }}
                          checkedIcon={<CheckedIcon />}
                          icon={<CheckBoxIcon />}
                          color="default"
                        />
                      }
                      label={t("labelCEXUnderstand")}
                    />
                  </Box>
                ) : (
                  //   : !tradeData.collectionMeta.name ||
                  //   !tradeData.collectionMeta.tileUri ? (
                  //   <Typography
                  //     color={"var(--color-warning)"}
                  //     variant={"body1"}
                  //     alignSelf={"stretch"}
                  //     position={"relative"}
                  //     component={"span"}
                  //     marginTop={2}
                  //     whiteSpace={"pre-line"}
                  //   >
                  //     {t("labelCollectionMetaNoNameORTileUri", {
                  //       type: [
                  //         ...(!tradeData.collectionMeta.name ? ["name"] : []),
                  //         ...(!tradeData.collectionMeta.tileUri
                  //           ? ["tile_uri"]
                  //           : []),
                  //       ],
                  //     })}
                  //   </Typography>
                  // )
                  <></>
                ))}
            </Box>
            <Box
              width={"100%"}
              paddingX={isMobile ? 2 : 0}
              marginTop={2}
              flexDirection={"row"}
              display={"flex"}
              justifyContent={"space-between"}
            >
              <Button
                variant={"outlined"}
                size={"medium"}
                color={"primary"}
                className={"step"}
                sx={{ height: "var(--btn-medium-height)" }}
                startIcon={<BackIcon fontSize={"small"} />}
                onClick={() => {
                  onCollectionNext(selectContract);
                }}
              >
                {t(`labelMintBack`)}
              </Button>

              {btnMain({
                defaultLabel: "labelMintNext",
                btnInfo: undefined, //btnInfo,
                disabled: () => {
                  return (
                    gDisabled ||
                    !!isNotAvailableCID ||
                    !tradeData.nftId ||
                    !!metaDataErrorDataInfo.length ||
                    !checked
                  );
                },
                onClick: () => {
                  setActiveStep(MintStep.MINT);
                  setSrc(getIPFSString(tradeData?.image, baseURL));
                },
              })}
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
                        style={{
                          wordBreak: "break-all",
                          color: "var(--color-text-third)",
                        }}
                        target="_blank"
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
                      handleOnNFTDataChange({
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
                              : EmptyValueTag + " " + feeInfo?.belong ??
                                EmptyValueTag}
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
                  justifyContent={"space-between"}
                >
                  <Button
                    variant={"outlined"}
                    size={"medium"}
                    className={"step"}
                    startIcon={<BackIcon fontSize={"small"} />}
                    color={"primary"}
                    sx={{ height: "var(--btn-medium-height)" }}
                    onClick={() => {
                      setActiveStep(MintStep.INPUTCID);

                      handleOnNFTDataChange({
                        tradeValue: undefined,
                        // collectionMeta: undefined,
                        // tokenAddress:undefined,
                      } as T);
                    }}
                  >
                    {t(`labelMintBack`)}
                  </Button>
                  {btnMain({
                    defaultLabel: t("labelMintSubmitBtn"),
                    // nftMintBtnStatus === TradeBtnStatus.DISABLED
                    //   ? t("labelTokenAdMintBtn")
                    //   : ,
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
          </>
        ),
      },
    ];
  }, [
    t,
    isMobile,
    method,
    handleMethodChange,
    address,
    isNotAvailableTokenAddress,
    isNFTCheckLoading,
    collectionInputProps,
    tradeData,
    btnMain,
    cid,
    isNotAvailableCID,
    metaDataErrorDataInfo,
    metaDataMissDataInfo,
    checked,
    error,
    src,
    etherscanBaseUrl,
    baseURL,
    walletMap,
    chargeFeeTokenList,
    feeInfo,
    dropdownStatus,
    isFeeNotEnough.isOnLoading,
    isFeeNotEnough.isFeeNotEnough,
    handleToggleChange,
    btnInfo,
    methodLabel,
    handleOnNFTDataChange,
    gDisabled,
    getIPFSString,
    nftMintBtnStatus,
    onNFTMintClick,
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
      {copyToastOpen && (
        <Toast
          alertText={
            copyToastOpen?.type === "json"
              ? t("labelCopyMetaClip")
              : copyToastOpen.type === "url"
              ? t("labelCopyUrlClip")
              : t("labelCopyAddClip")
          }
          open={copyToastOpen?.isShow}
          autoHideDuration={TOAST_TIME}
          onClose={() => {
            collectionInputProps?.collectionListProps?.setCopyToastOpen({
              isShow: false,
              type: "",
            });
          }}
          severity={"success"}
        />
      )}
    </Box>
  );
};
