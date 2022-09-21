import { IconType, PanelProps, DualBase } from "./BasicPanel";
import { Typography } from "@mui/material";
import { useSettings } from "../../../stores";

// value symbol
export const Dual_Success = (props: PanelProps) => {
  const { isMobile } = useSettings();
  const propsPatch = {
    iconType: IconType.DoneIcon,
    describe1: props.t("labelDualSuccess", {
      symbol: props.symbol,
      value: props.value,
    }),
    describe2: (
      <Typography
        justifySelf={"stretch"}
        display={"flex"}
        flexDirection={"column"}
        minWidth={340}
        justifyContent={"center"}
        marginTop={2}
        paddingX={isMobile ? 5 : 1}
        whiteSpace={"pre-line"}
        color={"var(--text-secondary)"}
      >
        {props.t("labelDualDesSuccess")}
      </Typography>
    ),
  };
  return <DualBase {...propsPatch} {...props} />;
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
  return <DualBase {...propsPatch} {...props} />;
};
