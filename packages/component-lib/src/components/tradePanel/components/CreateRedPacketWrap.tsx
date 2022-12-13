import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React from "react";
import { BtnInfo, Button } from "../../basic-lib";
import {
  useTranslation,
  WithTranslation,
  withTranslation,
} from "react-i18next";
import {
  // LoadingIcon,
  // CloseIcon,
  // CheckedIcon,
  // CheckBoxIcon,
  BackIcon,
  LuckyRedPacketList,
  LuckyRedPacketItem,
  RedPacketSend,
  WalletMap,
} from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";
import { CreateRedPacketViewProps, TradeBtnStatus } from "../Interface";
// import { MintStep } from "./MintAdvanceNFTWrap";
import { MenuBtnStyled } from "components";
import * as sdk from "@loopring-web/loopring-sdk";
import styled from "@emotion/styled";

export enum RedPacketStep {
  ChooseType,
  Main,
}
const RedPacketBoxStyle = styled(Box)`
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

const BtnMain = React.memo(
  ({
    defaultLabel = "labelMintNext",
    btnInfo,
    disabled,
    onClick,
    btnStatus,
    fullWidth,
  }: {
    defaultLabel?: string;
    btnInfo?: BtnInfo;
    disabled: () => boolean;
    onClick: () => void;
    fullWidth?: boolean;
    btnStatus: TradeBtnStatus;
  }) => {
    const { t } = useTranslation();
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
          !disabled() && btnStatus === TradeBtnStatus.LOADING ? "true" : "false"
        }
        disabled={disabled() || btnStatus === TradeBtnStatus.LOADING}
        onClick={onClick}
      >
        {btnInfo ? t(btnInfo.label, btnInfo.params) : t(defaultLabel)}
      </Button>
    );
  }
);
export const CreateRedPacketStepType = withTranslation()(
  <T extends {}>({
    handleOnSelectedType,
    handleOnDataChange,
    redPacketStepValue,
    selectedType,
    setActiveStep,
    disabled,
    btnStatus,
    btnInfo,
    t,
  }: CreateRedPacketViewProps<T> & WithTranslation) => {
    const { isMobile } = useSettings();
    const getDisabled = React.useMemo(() => {
      return disabled || btnStatus === TradeBtnStatus.DISABLED;
    }, [disabled, btnStatus]);
    return (
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
          {LuckyRedPacketList.map((item: LuckyRedPacketItem) => (
            <Box key={item.value.value} marginTop={1.5}>
              <MenuBtnStyled
                variant={"outlined"}
                size={"large"}
                className={`${isMobile ? "isMobile" : ""} ${
                  selectedType.value.value === item.value.value
                    ? "selected redPacketType "
                    : "redPacketType"
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
            value={redPacketStepValue?.type?.scope}
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
        <Box>
          <BtnMain
            {...{
              defaultLabel: "labelContinue",
              fullWidth: true,
              btnInfo: btnInfo,
              btnStatus,
              disabled: () => {
                return getDisabled || btnStatus === TradeBtnStatus.DISABLED;
              },
              onClick: () => {
                setActiveStep(RedPacketStep.Main);
                // onNFTMintClick(tradeData);
              },
            }}
          />
        </Box>
      </Box>
    );
  }
);

export const CreateRedPacketStepWrap = <T extends Partial<RedPacketSend>>({
  btnStatus,
  btnInfo,
  disabled,
  handleOnSelectedType,
  handleOnDataChange,
  redPacketStepValue,
  onSubmitClick,
  walletMap,
  selectedType,
}: CreateRedPacketViewProps<T>) => {
  const { t } = useTranslation("common");
  const inputButtonDefaultProps = {
    label: t("labelInputRedpacket"),
  };
  const getDisabled = React.useMemo(() => {
    return disabled || btnStatus === TradeBtnStatus.DISABLED;
  }, [disabled, btnStatus]);
  const inputBtnRef = React.useRef();

  // const panelList: Array<{
  //   view: JSX.Element;
  //   onBack?: undefined | (() => void);
  //   height?: any;
  //   width?: any;
  // }> = React.useMemo(() => {
  //
  // }, [t]);
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
      <RedPacketBoxStyle
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
      </RedPacketBoxStyle>
    </Box>
  );
};
