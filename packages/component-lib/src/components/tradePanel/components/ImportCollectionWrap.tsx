import { ImportCollectionStep, ImportCollectionViewProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import {
  Box,
  Grid,
  Typography,
  Stepper,
  StepLabel,
  Step,
  ListItemText,
} from "@mui/material";
import {
  myLog,
  getShortAddr,
  BackIcon,
  DropDownIcon,
  NFTWholeINFO,
  CollectionMeta,
} from "@loopring-web/common-resources";
import {
  TextField,
  Button,
  BtnInfo,
  MenuItem,
  CollectionInput,
} from "../../basic-lib";
import styled from "@emotion/styled";
import { useSettings } from "../../../stores";
import { CollectionManageWrap } from "./CollectionManageWrap";

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

const steps = [
  "labelImportCollection1", //Prepare NFT metadata
  "labelImportCollection2", //labelADMint2
  "labelImportCollection3", //Preview & Mint NFT
];

function HorizontalLabelPositionBelowStepper({
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
  NFT extends Partial<NFTWholeINFO>
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
  baseURL,
  // btnStatus,
  disabled,
  onLoading,
}: ImportCollectionViewProps<Co, NFT>) => {
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const {
    contractList,
    selectContract,
    collectionInputProps,
    selectCollection,
    nftProps,
    selectNFTList,
  } = data;
  myLog("ImportCollectionWrap", contractList);

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
            <Typography variant={"body1"} marginBottom={2}>
              {t("labelImportChooseCollection")}
            </Typography>
            <Box width={"100%"} paddingTop={2} paddingX={isMobile ? 2 : 0}>
              <CollectionInput
                {...{
                  ...(collectionInputProps as any),
                  collection: selectCollection,
                  onSelected: (item: Co) => {
                    collectionInputProps.onSelected(item);
                    onCollectionChange(item);
                  },
                }}
                fullWidth={true}
                size={"large"}
                showCopy={true}
              />
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
                  onCollectionChange(undefined);
                  setStep(ImportCollectionStep.SELECTCONTRACT);
                }}
              >
                {t(`labelMintBack`)}
              </Button>

              {btnMain({
                defaultLabel: "labelMintNext",
                btnInfo: undefined, //btnInfo,
                disabled: () => {
                  return disabled || !selectCollection;
                },
                onClick: () => {
                  setStep(ImportCollectionStep.SELECTNFT);
                  onCollectionNext(selectCollection);
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
              <Box width={"100%"} paddingTop={2} paddingX={isMobile ? 2 : 0}>
                {selectCollection && (
                  <CollectionManageWrap
                    baseURL={baseURL}
                    collection={selectCollection}
                    selectedNFTS={selectNFTList}
                    onNFTSelected={onNFTSelected as any}
                    onNFTSelectedMethod={onNFTSelectedMethod as any}
                    {...nftProps}
                  />
                )}
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
                    setStep(ImportCollectionStep.SELECTNFT);
                    onCollectionNext(selectCollection);
                  }}
                >
                  {t(`labelMintBack`)}
                </Button>
                {btnMain({
                  defaultLabel: t("labelCloseBtn"),
                  btnInfo: undefined,
                  disabled: () => {
                    return disabled || !selectCollection;
                  },
                  onClick: () => {
                    // setStep(ImportCollectionStep.SELECTNFT);
                    // onNFTSelectedMethod(selectCollection);
                  },
                })}
              </Box>
            </Box>
          </>
        ),
      },
    ];
  }, [
    t,
    isMobile,
    selectContract,
    contractList,
    btnMain,
    collectionInputProps,
    selectCollection,
    baseURL,
    selectNFTList,
    onNFTSelected,
    onNFTSelectedMethod,
    nftProps,
    onContractChange,
    disabled,
    setStep,
    onContractNext,
    onCollectionChange,
    onCollectionNext,
  ]);

  // @ts-ignore
  return (
    <Box
      // className={walletMap ? "" : "loading"}
      display={"flex"}
      flex={1}
      flexDirection={"column"}
      padding={5 / 2}
      alignItems={"center"}
    >
      <HorizontalLabelPositionBelowStepper step={step} />
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
              {step === index ? panel.view : <></>}
            </React.Fragment>
          );
        })}
      </MintAdStyle>
      {/*{copyToastOpen && (*/}
      {/*  <Toast*/}
      {/*    alertText={*/}
      {/*      copyToastOpen?.type === "json"*/}
      {/*        ? t("labelCopyMetaClip")*/}
      {/*        : copyToastOpen.type === "url"*/}
      {/*        ? t("labelCopyUrlClip")*/}
      {/*        : t("labelCopyAddClip")*/}
      {/*    }*/}
      {/*    open={copyToastOpen?.isShow}*/}
      {/*    autoHideDuration={TOAST_TIME}*/}
      {/*    onClose={() => {*/}
      {/*      collectionInputProps?.collectionListProps?.setCopyToastOpen({*/}
      {/*        isShow: false,*/}
      {/*        type: "",*/}
      {/*      });*/}
      {/*    }}*/}
      {/*    severity={"success"}*/}
      {/*  />*/}
      {/*)}*/}
    </Box>
  );
};
