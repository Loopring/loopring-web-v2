import { WithTranslation, withTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import styled from "@emotion/styled";

import React from "react";
import { useAmmMapUI } from "./hook";

import {
  PoolsTable,
  InputSearch,
  useSettings,
  useOpenModals,
  AmmPanelType,
  Button,
} from "@loopring-web/component-lib";

import {
  store,
  useAccount,
  useSystem,
  useAmmActivityMap,
  useTokenMap,
  useNotify,
} from "@loopring-web/core";
import { BackIcon, RowInvestConfig } from "@loopring-web/common-resources";
import { useHistory } from "react-router-dom";
import { useTheme } from "@emotion/react";

const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

const StylePaper = styled(Box)`
  width: 100%;
  //height: 100%;
  flex: 1;
  padding-bottom: ${({ theme }) => theme.unit}px;
  .rdg {
    flex: 1;
  }
` as typeof Box;

export const PoolsPanel = withTranslation("common")(
  <R extends { [key: string]: any }, I extends { [key: string]: any }>({
    t,
  }: WithTranslation & {}) => {
    const container = React.useRef(null);
    const { account } = useAccount();
    const history = useHistory();
    const theme = useTheme();
    const {
      filteredData,
      sortMethod,
      tableHeight,
      getFilteredData,
      filterValue,
      rawData,
    } = useAmmMapUI();
    const { setShowAmm } = useOpenModals();
    const { coinJson } = useSettings();
    const { forexMap, allowTrade } = useSystem();
    const { tokenMap } = useTokenMap();
    const { tokenPrices } = store.getState().tokenPrices;
    const showLoading = rawData && !rawData.length;
    const { campaignTagConfig } = useNotify().notifyMap ?? {};

    return (
      <Box display={"flex"} flexDirection={"column"} flex={1}>
        <Box
          marginBottom={2}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Button
            startIcon={<BackIcon fontSize={"small"} />}
            variant={"text"}
            size={"medium"}
            sx={{ color: "var(--color-text-secondary)" }}
            color={"inherit"}
            onClick={history.goBack}
          >
            {t("labelLiquidityPageTitle")}
            {/*<Typography color={"textPrimary"}></Typography>*/}
          </Button>
          <Button
            variant={"outlined"}
            sx={{ marginLeft: 2 }}
            onClick={() => history.push("/invest/balance/amm")}
          >
            {t("labelInvestMyAmm")}
          </Button>
        </Box>
        <WrapperStyled flex={1} marginBottom={3}>
          <Box
            marginBottom={3}
            display={"inline-flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            paddingX={3}
            paddingTop={3}
            alignItems={"center"}
          >
            <Typography variant={"h5"} color={"textSecondary"} component={"h2"}>
              {/* {t("labelLiquidityPageTitle")} */}
            </Typography>
            <InputSearch
              key={"search"}
              className={"search"}
              aria-label={"search"}
              placeholder={t("labelFilter")}
              value={filterValue}
              onChange={getFilteredData as any}
            />
          </Box>
          <StylePaper
            display={"flex"}
            flexDirection={"column"}
            ref={container}
            className={"table-divide"}
          >
            <PoolsTable
              tokenMap={tokenMap as any}
              {...{
                rawData: filteredData,
                showLoading,
                tableHeight,
                sortMethod,
                campaignTagConfig,
                coinJson,
                account,
                tokenPrices,
                allowTrade,
                forexMap: forexMap as any,
                rowConfig: RowInvestConfig,
                handleWithdraw: (row) => {
                  // const pair = `${row.ammDetail.coinAInfo.name}-${row.ammDetail.coinBInfo.name}`;
                  const pair = `${row.coinAInfo.name}-${row.coinBInfo.name}`;

                  setShowAmm({
                    isShow: true,
                    type: AmmPanelType.Exit,
                    symbol: pair,
                  });
                },

                handleDeposit: (row) => {
                  const pair = `${row.coinAInfo.name}-${row.coinBInfo.name}`;
                  setShowAmm({
                    isShow: true,
                    type: AmmPanelType.Join,
                    symbol: pair,
                  });
                },
              }}
            />
          </StylePaper>
        </WrapperStyled>
      </Box>
    );
  }
);
