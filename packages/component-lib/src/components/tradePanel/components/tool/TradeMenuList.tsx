import { CoinInfo, CoinKey, IBData } from "@loopring-web/common-resources";
import { WithTranslation } from "react-i18next";
import React from "react";
import { CoinMenu, InputSelect, InputSelectProps } from "../../../basic-lib";
import { Box, Link, Typography } from "@mui/material";
import { TradeMenuListProps } from "../Interface";
import { useTheme } from "@emotion/react";

export const TradeMenuList = <T extends IBData<I>, I>({
  nonZero,
  sorted,
  t,
  onChangeEvent,
  walletMap,
  selected,
  tradeData,
  coinMap,
  _height,
  ...rest
}: TradeMenuListProps<T, I> & WithTranslation) => {
  const ref = React.useRef<any>(null);
  const inputSelectProps: InputSelectProps<I> = {
    placeholder: "tokenSearchCoin",
    focusOnInput: true,
    allowScroll: true,
    selected: "",
    panelRender: () => <></>,
  };
  // const PanelEmptyRender = () => {
  //   return (
  //     <>
  //       <EmptyDefault
  //         height={"calc(100% - 35px)"}
  //         message={() => {
  //           return <Trans i18nKey="labelEmptyDefault">Content is Empty</Trans>;
  //         }}
  //       />
  //     </>
  //   );
  // };
  const theme = useTheme();
  const backElement = React.useMemo(
    () => (
      <>
        <Typography fontSize={"body1"} color="textPrimary">
          <Link
            style={{ color: "var(--color-text-primary)", textAlign: "right" }}
            onClick={() => {
              onChangeEvent(0, { tradeData, to: "button" });
            }}
          >
            {t("labelCancel")}
          </Link>
        </Typography>
      </>
    ),
    [onChangeEvent, tradeData]
  );
  const filterBy = (coinInfo: CoinInfo<I>, filterString: string) => {
    return filterString && filterString.length
      ? RegExp(filterString, "i").test(coinInfo.simpleName as string)
      : true;
  };

  const PanelRender = ({ selected, value }: any) => {
    return (
      <CoinMenu
        height={
          _height
            ? typeof _height === "number"
              ? ` calc(${_height + "px"}  - 2 * var(--toolbar-row-padding) - ${
                  theme.unit * 3
                }px ) `
              : ` calc(${_height}  - 2 * var(--toolbar-row-padding) - ${
                  theme.unit * 3
                }px )`
            : "460px"
        }
        {...{
          coinMap: coinMap, //swapData.type === 'sell' ? tradeCalcData?.sellCoinInfoMap : tradeCalcData?.buyCoinInfoMap as any,
          filterBy,
          nonZero,
          sorted,
          // height: '410px',
          filterString: value && value.trim() ? value : undefined,
          handleSelect: (_event: any, itemKey: CoinKey<I>) => {
            onChangeEvent(0, {
              ...{ tradeData: { ...tradeData, belong: itemKey } },
              to: "button",
            });
          },
          walletMap: walletMap, //tradeCalcData?.walletMap as any,
          selected,
          t,
          ...rest,
        }}
        ref={ref}
      />
    );
  };
  return (
    <Box
      className={"menu-panel"}
      flexDirection={"column"}
      flex={1}
      height={"100%"}
      display={"flex"}
    >
      <InputSelect
        {...{
          ...{ ...inputSelectProps, selected },
          backElement,
          panelRender: PanelRender,
          t,
          ...rest,
        }}
      />
    </Box>
  );
};
