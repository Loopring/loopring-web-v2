import { CoinInfo, CoinMap, IBData } from "@loopring-web/common-resources";
import { WithTranslation } from "react-i18next";
import React from "react";
import { BasicACoinTradeProps } from "./Interface";
import { InputButton } from "../../basic-lib";

export const BasicACoinTrade = <T extends Partial<IBData<I>>, I>({
  t,
  tradeData,
  onChangeEvent,
  coinMap,
  walletMap,
  disabled,
  inputButtonDefaultProps,
  handleError,
  inputBtnRef,
  inputButtonProps,
  ...rest
}: BasicACoinTradeProps<T, I> & WithTranslation) => {
  const getDisabled = () => {
    if (
      disabled ||
      tradeData === undefined ||
      walletMap === undefined ||
      coinMap === undefined
    ) {
      return true;
    } else {
      return false;
    }
  };
  const handleOnClick = React.useCallback(
    (_event: React.MouseEvent, _ref: any) => {
      onChangeEvent(1, {
        tradeData: { ...tradeData, tradeValue: 0 },
        to: "menu",
      });
    },
    [tradeData, onChangeEvent]
  );
  const handleCountChange: any = React.useCallback(
    (_tradeData: T, _name: string, _ref: any) => {
      //const focus: 'buy' | 'sell' = _ref?.current === buyRef.current ? 'buy' : 'sell';
      if (tradeData.tradeValue !== _tradeData.tradeValue) {
        onChangeEvent(0, {
          tradeData: { ...tradeData, ..._tradeData },
          to: "button",
        });
      }

      // onCoinValueChange(ibData);
    },
    [onChangeEvent, tradeData]
  );

  if (typeof handleError !== "function") {
    handleError = ({ belong, balance, tradeValue }: T) => {
      if (
        (typeof tradeValue !== "undefined" &&
          balance &&
          balance < tradeValue) ||
        (tradeValue && !balance)
      ) {
        return {
          error: true,
          message: t("tokenNotEnough", { belong: belong }),
        };
      }
      return { error: false, message: "" };
    };
  }

  const inputBtnProps = {
    subLabel: t("tokenMax"),
    emptyText: t("tokenSelectToken"),
    placeholderText: "0.00",
    maxAllow: true,
    handleError: handleError as any,
    handleCountChange,
    handleOnClick,
    ...inputButtonDefaultProps,
    ...inputButtonProps,
    ...rest,
  };

  return (
    <InputButton
      ref={inputBtnRef}
      disabled={getDisabled()}
      {...{
        ...inputBtnProps,
        inputData: tradeData ? tradeData : ({} as T),
        coinMap: coinMap ? coinMap : ({} as CoinMap<I, CoinInfo<I>>),
      }}
    />
  );
};
