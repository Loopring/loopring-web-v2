import { BasicPanel, DualBase, IconType, PanelProps } from "./BasicPanel";
import { Box, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useSettings } from "../../../stores";
import {
  ConvertToIcon,
  EmptyValueTag,
  YEAR_DAY_MINUTE_FORMAT,
} from "@loopring-web/common-resources";
import moment from "moment";
import { CoinIcon } from "../../basic-lib";

// value symbol
export const Dual_Success = (props: PanelProps) => {
  const { isMobile } = useSettings();
  const propsPatch = {
    iconType: IconType.PendingIcon,
    describe1: (
      <Typography variant={"h5"} color={"var(--color-primary)"}>
        {props.t("labelDualProcessing", {
          symbol: props.symbol,
          value: props.value,
        })}
      </Typography>
    ),
    describe2: (
      <Typography
        justifySelf={"stretch"}
        display={"flex"}
        flexDirection={"column"}
        minWidth={340}
        justifyContent={"center"}
        marginTop={2}
        paddingX={isMobile ? 1 : 5}
        whiteSpace={"pre-line"}
        color={"textSecondary"}
      >
        {props.t("labelDualProcessingDes")}
      </Typography>
    ),
  };
  return <DualBase showTitle={false} {...propsPatch} {...props} />;
};

// value symbol
export const Dual_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelDualFailed", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DualBase showTitle={true} {...propsPatch} {...props} />;
};

export const Staking_Success = (props: PanelProps) => {
  const { isMobile } = useSettings();
  const { info } = props;
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: (
      <Typography variant={"h5"} color={"var(--color-primary)"}>
        {props.t("labelStakingSuccess", {
          symbol: info.symbol,
        })}
      </Typography>
    ),
    describe2: (
      <Box
        justifySelf={"stretch"}
        display={"flex"}
        flexDirection={"column"}
        minWidth={340}
        justifyContent={"center"}
        marginTop={2}
        paddingX={isMobile ? 1 : 0}
      >
        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelDeFiSideAmount")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info.amount + " " + info.symbol}
          </Typography>
        </Typography>
        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelDeFiSideProduct")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.productId ?? EmptyValueTag}
          </Typography>
        </Typography>
        <Typography
          component={"span"}
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelDeFiSideSubscribeTime")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {moment(new Date(info.stakeAt))
              // .utc()
              // .startOf("days")
              .format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
        <Typography
          component={"span"}
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelDeFiSideLockDuration")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info.daysDuration
              ? "≥ " + info.daysDuration + " " + props.t("labelDay")
              : EmptyValueTag}
          </Typography>
        </Typography>
      </Box>
    ),
  };
  return <DualBase showTitle={false} {...propsPatch} {...props} />;
};
export const Staking_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelStakingFailed", {
      symbol: props.info?.symbol,
    }),
  };
  return <DualBase showTitle={true} {...propsPatch} {...props} />;
};

export const Staking_Redeem_Success = (props: PanelProps) => {
  const { isMobile } = useSettings();
  const { info } = props;
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: (
      <Typography variant={"h5"} color={"var(--color-primary)"}>
        {props.t("labelStakingRedeemSuccess", {
          symbol: info?.symbol,
        })}
      </Typography>
    ),
    describe2: (
      <Box
        justifySelf={"stretch"}
        display={"flex"}
        flexDirection={"column"}
        minWidth={340}
        justifyContent={"center"}
        marginTop={2}
        paddingX={isMobile ? 1 : 0}
      >
        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelDefiStakingRedeem")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info.amount + " " + info.symbol}
          </Typography>
        </Typography>
        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelStakingRedeemRemaining")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info.remainAmount && info.remainAmount != "0"
              ? info.remainAmount + " " + info.symbol
              : EmptyValueTag}
          </Typography>
        </Typography>

        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelDeFiSideProduct")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.productId ?? EmptyValueTag}
          </Typography>
        </Typography>
        <Typography
          component={"span"}
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelStakingRedeemDate")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {moment(new Date())
              // .utc()
              // .startOf("days")
              .format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
      </Box>
    ),
  };
  return <DualBase showTitle={false} {...propsPatch} {...props} />;
};

export const Staking_Redeem_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelStakingFailed", {
      symbol: props.info?.symbol,
    }),
  };
  return <DualBase showTitle={true} {...propsPatch} {...props} />;
};

export const CexSwap_Delivering = (props: PanelProps) => {
  const { info, t } = props;
  const { isMobile } = useSettings();
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: (
      <Typography color={"var(--color-text-primary)"} variant={"h5"}>
        {t("labelCexSwapSettled")}
      </Typography>
    ),
    describe2: (
      <Box
        justifySelf={"stretch"}
        display={"flex"}
        flexDirection={"column"}
        minWidth={340}
        justifyContent={"center"}
        marginTop={2}
        paddingX={isMobile ? 1 : 0}
      >
        <Typography color={"var(--color-text-secondary)"} marginTop={2}>
          {t("labelCexSwapPanelDes")}
        </Typography>
        <Box
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"space-evenly"}
          display={"flex"}
          flex={1}
        >
          <Typography
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            display={"flex"}
          >
            <ListItemIcon style={{ minWidth: "40px" }}>
              <CoinIcon symbol={info?.sellToken.symbol} size={32} />
            </ListItemIcon>
            <ListItemText>
              <Typography marginLeft={1} variant={"h5"}>
                {info?.sellStr}
              </Typography>
            </ListItemText>
          </Typography>
          <Box>
            <ConvertToIcon
              fontSize={"large"}
              htmlColor={"var(--color-text-primary)"}
            />
          </Box>
          <Typography>
            <ListItemIcon style={{ minWidth: "40px" }}>
              <CoinIcon symbol={info?.buyToken.symbol} size={32} />
            </ListItemIcon>
            <ListItemText>
              <Typography marginLeft={1} variant={"h5"}>
                {info?.buyStr}
              </Typography>
            </ListItemText>
          </Typography>
        </Box>

        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelType")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {props.t("labelCexTrade")}
          </Typography>
        </Typography>
        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelPrice")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.convertStr}
          </Typography>
        </Typography>

        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelSell")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.sellStr}
          </Typography>
        </Typography>
        <Typography
          component={"span"}
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelBuy")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.buyStr}
          </Typography>
        </Typography>
        <Typography
          component={"span"}
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelFee")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.feeStr}
          </Typography>
        </Typography>
      </Box>
    ),
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const CexSwap_Settled = (props: PanelProps) => {
  const { info, t } = props;
  const { isMobile } = useSettings();
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: (
      <Typography color={"var(--color-text-primary)"} variant={"h5"}>
        {t("labelCexSwapSettled")}
      </Typography>
    ),
    describe2: (
      <Box
        justifySelf={"stretch"}
        display={"flex"}
        flexDirection={"column"}
        minWidth={340}
        justifyContent={"center"}
        marginTop={2}
        paddingX={isMobile ? 1 : 0}
      >
        <Typography color={"var(--color-text-secondary)"} marginTop={2}>
          {t("labelCexSwapPanelDes")}
        </Typography>
        <Box
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"space-evenly"}
          display={"flex"}
          flex={1}
        >
          <Typography
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            display={"flex"}
          >
            <ListItemIcon style={{ minWidth: "40px" }}>
              <CoinIcon symbol={info?.sellToken.symbol} size={32} />
            </ListItemIcon>
            <ListItemText>
              <Typography marginLeft={1} variant={"h5"}>
                {info?.sellStr}
              </Typography>
            </ListItemText>
          </Typography>
          <Box>
            <ConvertToIcon
              fontSize={"large"}
              htmlColor={"var(--color-text-primary)"}
            />
          </Box>
          <Typography>
            <ListItemIcon style={{ minWidth: "40px" }}>
              <CoinIcon symbol={info?.buyToken.symbol} size={32} />
            </ListItemIcon>
            <ListItemText>
              <Typography marginLeft={1} variant={"h5"}>
                {info?.buyStr}
              </Typography>
            </ListItemText>
          </Typography>
        </Box>

        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelType")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {props.t("labelCexTrade")}
          </Typography>
        </Typography>
        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelPrice")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.convertStr}
          </Typography>
        </Typography>

        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelSell")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.sellStr}
          </Typography>
        </Typography>
        <Typography
          component={"span"}
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelBuy")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.buyStr}
          </Typography>
        </Typography>
        <Typography
          component={"span"}
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelFee")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.feeStr}
          </Typography>
        </Typography>
      </Box>
    ),
  };
  return <BasicPanel {...propsPatch} {...props} />;
};

export const CexSwap_Failed = (props: PanelProps) => {
  const { info, t } = props;
  const { isMobile } = useSettings();
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: (
      <Typography color={"var(--color-text-primary)"} variant={"h5"}>
        {t("labelCexSwapFailed")}
      </Typography>
    ),
    describe2: (
      <Box
        justifySelf={"stretch"}
        display={"flex"}
        flexDirection={"column"}
        minWidth={340}
        justifyContent={"center"}
        marginTop={2}
        paddingX={isMobile ? 1 : 0}
      >
        <Typography color={"var(--color-text-secondary)"} marginTop={2}>
          {t("labelCexSwapPanelDes")}
        </Typography>
        <Box
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"space-evenly"}
          display={"flex"}
          flex={1}
        >
          <Typography
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            display={"flex"}
          >
            <ListItemIcon style={{ minWidth: "40px" }}>
              <CoinIcon symbol={info?.sellToken.symbol} size={32} />
            </ListItemIcon>
            <ListItemText>
              <Typography marginLeft={1} variant={"h5"}>
                {info?.sellStr}
              </Typography>
            </ListItemText>
          </Typography>
          <Box>
            <ConvertToIcon
              fontSize={"large"}
              htmlColor={"var(--color-text-primary)"}
            />
          </Box>
          <Typography>
            <ListItemIcon style={{ minWidth: "40px" }}>
              <CoinIcon symbol={info?.buyToken.symbol} size={32} />
            </ListItemIcon>
            <ListItemText>
              <Typography marginLeft={1} variant={"h5"}>
                {info?.buyStr}
              </Typography>
            </ListItemText>
          </Typography>
        </Box>

        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelType")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {props.t("labelCexTrade")}
          </Typography>
        </Typography>
        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelPrice")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.convertStr}
          </Typography>
        </Typography>

        <Typography
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
          component={"span"}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelSell")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.sellStr}
          </Typography>
        </Typography>
        <Typography
          component={"span"}
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelBuy")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.buyStr}
          </Typography>
        </Typography>
        <Typography
          component={"span"}
          display={"inline-flex"}
          justifyContent={"space-between"}
          marginTop={2}
        >
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-secondary)"}
          >
            {props.t("labelFee")}
          </Typography>
          <Typography
            variant={"body1"}
            component={"span"}
            color={"var(--color-text-primary)"}
          >
            {info?.feeStr}
          </Typography>
        </Typography>
      </Box>
    ),
  };
  return <BasicPanel {...propsPatch} {...props} />;
};
