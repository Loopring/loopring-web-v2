import { IconType, PanelProps, DualBase } from "./BasicPanel";
import { Typography } from "@mui/material";
import { useSettings } from "../../../stores";

// value symbol
export const Dual_Success = (props: PanelProps) => {
  const { isMobile } = useSettings();
  const propsPatch = {
    iconType: IconType.PendingIcon,
    describe1: <Typography variant={"h5"} color={"var(--color-primary)"}>
      {props.t("labelDualProcessing", {
        symbol: props.symbol,
        value: props.value,
      })}
    </Typography>,
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
