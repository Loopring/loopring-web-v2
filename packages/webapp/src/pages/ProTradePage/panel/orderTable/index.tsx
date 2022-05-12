import React from "react";
import { TFunction, withTranslation } from "react-i18next";
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Tab,
  Tabs,
} from "@mui/material";
import { OrderHistoryTable } from "@loopring-web/component-lib";
import {
  CheckBoxIcon,
  CheckedIcon,
  MarketType,
} from "@loopring-web/common-resources";
import { useOrderList } from "./hookTable";
import {
  useAccount,
  tradeProSettings as tradeProSettingsReduce,
} from "@loopring-web/core";
import styled from "@emotion/styled";
import { useGetTrades } from "../../../Layer2Page/TradePanel/hooks";
import { useHistory } from "react-router-dom";

const CheckboxStyled = styled(Box)`
  position: absolute;
  top: 50%;
  right: ${({ theme }) => theme.unit * 3}px;
  transform: translateY(-50%);
`;

export const OrderTableView = withTranslation("common")(
  <C extends { [key: string]: any }>({
    t,
    market,
    handleOnMarketChange,
  }: {
    t: TFunction<"translation">;
    market?: string;
    handleOnMarketChange: (newMarket: MarketType) => void;
  }) => {
    const {
      getOrderDetail,
      getOrderList,
      rawData,
      orderDetailList,
      cancelOrder,
      showLoading,
      clearRawData,
      setOrderOriginalData,
      handleScroll,
      clearOrderDetail,
      showDetailLoading,
      cancelOrderByHashList,
    } = useOrderList();
    const { userOrderDetailList, getUserOrderDetailTradeList } = useGetTrades();
    const [tabValue, setTabValue] = React.useState(0);
    const history = useHistory();
    const {
      account: { readyState },
    } = useAccount();
    const isShowHidePairsOption = readyState === "ACTIVATED";
    const { tradeProSettings, updateIsHideOtherPairs } =
      tradeProSettingsReduce.useTradeProSettings();

    const getFilteredData = React.useCallback(() => {
      return tradeProSettings?.hideOtherTradingPairs
        ? rawData.filter((o) => o.market === market)
        : rawData;
    }, [tradeProSettings, market, rawData]);

    const updateOrderList = React.useCallback(
      async (currentTabIndex: number) => {
        const data = await getOrderList({
          limit: 50,
          status:
            currentTabIndex === 0
              ? ["processing"]
              : ["processed", "failed", "cancelled", "cancelling", "expired"],
        });
        setOrderOriginalData(data);
      },
      [getOrderList, setOrderOriginalData]
    );

    const handleTabSwitch = React.useCallback(
      (index: number) => {
        setTabValue(index);
        clearRawData();
        updateOrderList(index);
      },
      [clearRawData, updateOrderList]
    );

    const handleCheckBoxChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        // setHideOtherPairs(event.target.checked)
        updateIsHideOtherPairs({
          isHide: event.target.checked,
        });
      },
      [updateIsHideOtherPairs]
    );
    const onRowClick = (_rowIdx: number, row: any) => {
      if (row.market !== market) {
        handleOnMarketChange(row.market);
        // history.push(`/trade/pro/${row.market}`);
      } else {
        return;
      }
      // const _rowMarket = row.pair.coinA +'-' +row.pair.coinB
    };

    return (
      <>
        <Box
          padding={2}
          paddingTop={0}
          paddingBottom={0}
          style={{ position: "relative" }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, index) => handleTabSwitch(index)}
            aria-label="tabs orderTable"
          >
            <Tab label={t("labelOrderTableOpenOrder")} />
            <Tab label={t("labelOrderTableOrderHistory")} />
          </Tabs>
          {isShowHidePairsOption && (
            <CheckboxStyled>
              <FormControlLabel
                style={{ marginRight: 0 }}
                control={
                  <Checkbox
                    checked={tradeProSettings?.hideOtherTradingPairs}
                    checkedIcon={<CheckedIcon />}
                    icon={<CheckBoxIcon />}
                    color="default"
                    onChange={handleCheckBoxChange}
                  />
                }
                label={t("labelTradeProHideOtherPairs")}
              />
            </CheckboxStyled>
          )}
        </Box>
        <Divider />
        <OrderHistoryTable
          {...{
            rawData: getFilteredData(),
            getOrderList,
            getOrderDetail,
            orderDetailList,
            cancelOrder,
            onRowClick,
            cancelOrderByHashList,
            showLoading,
            isOpenOrder: tabValue === 0,
            isPro: true,
            isScroll: true,
            handleScroll: handleScroll,
            clearOrderDetail,
            showDetailLoading,
            userOrderDetailList,
            getUserOrderDetailTradeList,
          }}
        />
      </>
    );
  }
);
