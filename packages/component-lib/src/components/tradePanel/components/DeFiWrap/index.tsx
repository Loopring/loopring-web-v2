import {
  AccountStatus,
  DeFiCalcData,
  IBData,
} from "@loopring-web/common-resources";
import { WithTranslation } from "react-i18next";
import { DeFiWrapProps } from "./Interface";
import React from "react";
import { Grid } from "@mui/material";

export const DeFiWrap = <T extends IBData<I>, I, ACD extends DeFiCalcData<T>>({
  t,
  disabled,
  isStob,
  switchStobEvent,

  onSubmitClick,
  onChangeEvent,
  handleError,
  deFiCalcData,
  accStatus,
  tokenA,
  tokenB,
  tokenAProps,
  tokenBProps,
  ...rest
}: DeFiWrapProps<T, I, ACD> & WithTranslation) => {
  const coinARef = React.useRef();
  const coinBRef = React.useRef();
  const [errorA, setErrorA] = React.useState<{
    error: boolean;
    message?: string | JSX.Element;
  }>({
    error: false,
    message: "",
  });
  const [errorB, setErrorB] = React.useState<{
    error: boolean;
    message?: string | JSX.Element;
  }>({
    error: false,
    message: "",
  });

  const _onSwitchStob = React.useCallback(
    (_event: any) => {
      if (typeof switchStobEvent === "function") {
        switchStobEvent(!isStob);
      }
    },
    [switchStobEvent, isStob]
  );

  const getDisabled = () => {
    return (
      disabled ||
      deFiCalcData === undefined ||
      deFiCalcData.coinInfoMap === undefined
    );
  };

  if (typeof handleError !== "function") {
    handleError = ({ belong, balance, tradeValue }: any) => {
      if (accStatus === AccountStatus.ACTIVATED) {
        // const isCoinA = belong === deFiCalcData.myCoinA.belong;
        // if (balance < tradeValue || (tradeValue && !balance)) {
        //   const _error = {
        //     error: true,
        //     message: t("tokenNotEnough", {belong: belong}),
        //   };
        //   if (isCoinA) {
        //     setErrorA(_error);
        //   } else {
        //     setErrorB(_error);
        //   }
        //   return _error;
        // }
        // if (isCoinA) {
        //   setErrorA({error: false, message: ""});
        // } else {
        //   setErrorB({error: false, message: ""});
        // }
      }
      return { error: false, message: "" };
    };
  }
  const handleCountChange = React.useCallback(
    (ibData: T, _name: string, _ref: any) => {
      const focus: "coinA" | "coinB" =
        _ref?.current === coinARef.current ? "coinA" : "coinB";
      if (deFiCalcData[focus].tradeValue !== ibData.tradeValue) {
        onChangeEvent({
          tradeData: { ...ibData },
          type: focus,
        });
      }
    },
    [deFiCalcData]
  );
  const propsA: any = {
    label: t("labelTokenAmount"),
    subLabel: t("labelAvailable"),
    placeholderText: "0.00",
    maxAllow: true,
    ...tokenAProps,
    handleError,
    handleCountChange,
    ...rest,
  };
  const propsB: any = {
    label: t("labelTokenAmount"),
    subLabel: t("labelAvailable"),
    placeholderText: "0.00",
    maxAllow: true,
    ...tokenBProps,
    handleError,
    handleCountChange,
    ...rest,
  };
  return (
    <Grid
      className={deFiCalcData ? "" : "loading"}
      container
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flex={1}
      height={"100%"}
    ></Grid>
  );
};

export * from "./Interface";
