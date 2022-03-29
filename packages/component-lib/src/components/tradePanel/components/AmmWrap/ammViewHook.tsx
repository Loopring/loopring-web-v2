import React from "react";
import {
  AccountStatus,
  EmptyValueTag,
  ReverseIcon,
} from "@loopring-web/common-resources";
import { IconButtonStyled } from "../Styled";

export function useAmmViewData({
  accStatus,
  error,
  i18nKey,
  t,
  _isStoB,
  ammCalcData,
  _onSwitchStob,
  isAdd,
}: {
  accStatus?: AccountStatus;
  error: any;
  i18nKey: any;
  t: any;
  _isStoB: boolean;
  ammCalcData: any;
  _onSwitchStob: any;
  isAdd: boolean;
}) {
  const label = React.useMemo(() => {
    if (isAdd && accStatus === AccountStatus.ACTIVATED) {
      if (error.errorA.error || error.errorB.error) {
        const errorTmp = error.errorA.error ? error.errorA : error.errorB;

        if (typeof errorTmp.message === "string") {
          return t(errorTmp.message);
        } else if (errorTmp.message !== undefined) {
          return errorTmp.message;
        } else {
          return t("labelError");
        }
      }
    }
    if (i18nKey) {
      const key = i18nKey.split("|");
      return t(key[0], key && key[1] ? { arg: key[1] } : undefined);
    } else {
      return isAdd ? t(`labelAddLiquidityBtn`) : t(`labelRemoveLiquidityBtn`);
    }
  }, [error, i18nKey, t]);

  const stob = React.useMemo(() => {
    if (
      ammCalcData &&
      ammCalcData?.lpCoinA &&
      ammCalcData?.lpCoinB &&
      ammCalcData.AtoB
    ) {
      let price: string;
      if (_isStoB) {
        price = `1 ${ammCalcData?.lpCoinA?.belong} \u2248 ${
          ammCalcData.AtoB && ammCalcData.AtoB != "NaN"
            ? ammCalcData.AtoB
            : EmptyValueTag
        } ${ammCalcData?.lpCoinB?.belong}`;
      } else {
        price = `1 ${ammCalcData?.lpCoinB?.belong} \u2248 ${
          ammCalcData.BtoA && ammCalcData.BtoA != "NaN"
            ? ammCalcData.BtoA
            : EmptyValueTag
        } ${ammCalcData?.lpCoinA?.belong}`;
      }
      return (
        <>
          {" "}
          {price}{" "}
          <IconButtonStyled
            size={"small"}
            aria-label={t("tokenExchange")}
            onClick={_onSwitchStob}
          >
            <ReverseIcon />
          </IconButtonStyled>
        </>
      );
    } else {
      return EmptyValueTag;
    }
  }, [_isStoB, ammCalcData, _onSwitchStob]);

  return {
    label,
    stob,
  };
}
