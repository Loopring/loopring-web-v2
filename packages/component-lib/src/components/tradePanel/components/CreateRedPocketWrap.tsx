import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React from "react";
import { BtnInfo, Button } from "../../basic-lib";
import { useTranslation } from "react-i18next";
import {
  // LoadingIcon,
  // CloseIcon,
  // CheckedIcon,
  // CheckBoxIcon,
  BackIcon,
  LuckyRedPocketList,
  LuckyRedPocketItem,
  RedPocketSend,
  WalletMap,
} from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";
import { TradeBtnStatus } from "../Interface";
// import { MintStep } from "./MintAdvanceNFTWrap";
import { HorizontalLabelPositionBelowStepper } from "./tool";
import { MenuBtnStyled } from "components";
import * as sdk from "@loopring-web/loopring-sdk";
import styled from "@emotion/styled";

const steps = [
  "labelRedPocketChoose", //Prepare NFT metadata
  "labelRedPocketMain", //labelADMint2
];

export type CreateRedPocketViewProps<Co> = {
  btnStatus: TradeBtnStatus;
  btnInfo?: BtnInfo;
  disabled?: boolean;
  walletMap: WalletMap<any>;
  setActiveStep: (step: RedPocketStepStep) => void;
  handleOnDataChange: (value: Partial<Co>) => void;
  redPocketStepValue: Co;
  onSubmitClick: () => Promise<void>;
  activeStep: RedPocketStepStep;
  selectedType: LuckyRedPocketItem;
  handleOnSelectedType: (item: LuckyRedPocketItem) => void;
};
export enum RedPocketStepStep {
  ChooseType,
  Main,
}
const RedPockBoxStyle = styled(Box)`
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

export const CreateRedPocketStepWrap = <T extends Partial<RedPocketSend>>({
  btnStatus,
  btnInfo,
  disabled,
  handleOnSelectedType,
  handleOnDataChange,
  redPocketStepValue,
  onSubmitClick,
  walletMap,
  selectedType,
  activeStep,
  setActiveStep,
}: CreateRedPocketViewProps<T>) => {
  const { t } = useTranslation("common");

  const getDisabled = React.useMemo(() => {
    return disabled || btnStatus === TradeBtnStatus.DISABLED;
  }, [disabled, btnStatus]);
  const btnMain = React.useCallback(
    ({
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
          loading={
            !disabled() && btnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={disabled() || btnStatus === TradeBtnStatus.LOADING}
          onClick={onClick}
        >
          {btnInfo ? t(btnInfo.label, btnInfo.params) : t(defaultLabel)}
        </Button>
      );
    },
    [btnStatus, t]
  );
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
              flexDirection={"column"}
              justifyContent={"center"}
              flex={1}
              alignItems={"stretch"}
              alignSelf={"stretch"}
              className="modalContent"
              marginTop={3}
              paddingX={isMobile ? 7 : 10}
              paddingBottom={4}
            >
              {LuckyRedPocketList.map((item: LuckyRedPocketItem) => (
                <Box key={item.value.value} marginTop={1.5}>
                  <MenuBtnStyled
                    variant={"outlined"}
                    size={"large"}
                    className={`${isMobile ? "isMobile" : ""} ${
                      selectedType.value.value === item.value.value
                        ? "selected redPocketType "
                        : "redPocketType"
                    }`}
                    fullWidth
                    onClick={(_e) => {
                      handleOnSelectedType(item);
                    }}
                  >
                    {t(item.labelKey)}
                  </MenuBtnStyled>
                </Box>
              ))}
            </Box>
            <Box marginTop={1}>
              <RadioGroup
                aria-label="withdraw"
                name="withdraw"
                value={redPocketStepValue?.type?.scope}
                onChange={(_e, value) => {
                  handleOnDataChange({
                    type: {
                      scope: value,
                    },
                  } as any);
                }}
              >
                {Object.keys(sdk.LuckyTokenViewType).map((key) => {
                  return (
                    <FormControlLabel
                      key={key}
                      value={key.toString()}
                      control={<Radio />}
                      label={
                        <>
                          <Typography>
                            `${t("labelLuckyTokenViewType" + key)}`
                          </Typography>
                          <Typography>
                            `${t("labelLuckyTokenViewTypeDes" + key)}`
                          </Typography>
                        </>
                      }
                    />
                  );
                })}
              </RadioGroup>
            </Box>
          </Box>
        ),
        // onBack: () => setStep(CreateCollectionStep.ChooseMethod)
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
              <Box display={"flex"} position={"relative"} width={"auto"}></Box>
              <Box
                flex={1}
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"space-between"}
                alignItems={"stretch"}
                paddingLeft={isMobile ? 0 : 2}
              >
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
                      setActiveStep(RedPocketStepStep.Main);
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
                        getDisabled || btnStatus === TradeBtnStatus.DISABLED
                      );
                    },
                    onClick: () => {
                      onSubmitClick();
                      // setActiveStep(MintSte)
                      // onNFTMintClick(tradeData);
                    },
                  })}
                </Box>
              </Box>
            </Box>
          </>
        ),
      },
    ];
  }, [t]);
  const { isMobile } = useSettings();
  return (
    <Box
      className={walletMap ? "" : "loading"}
      display={"flex"}
      flex={1}
      flexDirection={"column"}
      padding={5 / 2}
      alignItems={"center"}
    >
      <HorizontalLabelPositionBelowStepper
        activeStep={activeStep}
        steps={steps}
      />
      <RedPockBoxStyle
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
      </RedPockBoxStyle>
    </Box>
  );
};
