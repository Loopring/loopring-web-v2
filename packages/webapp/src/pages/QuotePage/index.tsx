import React from "react";
import styled from "@emotion/styled/macro";

import {
  InputSearch,
  // MarketBlock,
  // MarketBlockProps,
  QuoteTable,
} from "@loopring-web/component-lib";
import { WithTranslation, withTranslation } from "react-i18next";
import { myLog, RowConfig } from "@loopring-web/common-resources";
import { Box, Container, Divider, Grid, Tab, Tabs } from "@mui/material";
import { useQuotePage } from "./hook";
import { useAccount, TableWrapStyled, useSystem } from "@loopring-web/core";

const RowStyled = styled(Grid)`
  & .MuiGrid-root:not(:last-of-type) > div {
    // margin-right: ${({ theme }) => theme.unit * 2}px;
  }
` as typeof Grid;

export const QuotePage = withTranslation("common")(
  ({ t, ...rest }: WithTranslation) => {
    const tableRef = React.useRef<HTMLDivElement>();
    const { account } = useAccount();
    const { forexMap } = useSystem();
    const {
      // recommendations,
      // formattedRecommendations,
      // getTradeFloatVolumeToCount,
      // handleRecommendBoxClick,
      tableTabValue,
      handleTabChange,
      searchValue,
      removeMarket,
      favoriteMarket,
      handleSearchChange,
      addMarket,
      tableHeight,
      filteredData,
      showLoading,
      // tickList,
      campaignTagConfig,
      handleRowClick,
    } = useQuotePage({ tableRef });
    // const showLoading = !tickList?.length;
    // myLog("showLoading", showLoading);
    return (
      <Box display={"flex"} flexDirection={"column"} flex={1}>
        <TableWrapStyled
          ref={tableRef as any}
          marginTop={1}
          marginBottom={3}
          paddingBottom={1}
          flex={1}
          className={"MuiPaper-elevation2"}
        >
          <Box display={"flex"} flexDirection={"column"}>
            <Container className={"toolbar"}>
              <Box
                paddingLeft={1}
                paddingRight={2}
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Tabs
                  value={tableTabValue}
                  onChange={handleTabChange}
                  disabled={showLoading}
                  aria-label="disabled tabs example"
                >
                  <Tab label={t("labelQuotePageFavourite")} value="favourite" />
                  <Tab label={t("labelAll")} value="all" />
                  {/* <Tab label={t('labelQuotePageTradeRanking')} value="tradeRanking"/> */}
                </Tabs>
                <InputSearch
                  value={searchValue}
                  onChange={handleSearchChange}
                />
              </Box>
              <Divider style={{ marginTop: "-1px" }} />
            </Container>

            <QuoteTable /* onVisibleRowsChange={onVisibleRowsChange} */
              onRowClick={(index: any, row: any, col: any) =>
                handleRowClick(row)
              }
              campaignTagConfig={campaignTagConfig}
              forexMap={forexMap as any}
              account={account}
              rawData={filteredData}
              favoriteMarket={favoriteMarket}
              addFavoriteMarket={addMarket}
              removeFavoriteMarket={removeMarket}
              currentheight={tableHeight}
              rowHeight={RowConfig.rowHeight}
              headerRowHeight={RowConfig.rowHeaderHeight}
              showLoading={showLoading}
              {...{ ...rest }}
            />
          </Box>
        </TableWrapStyled>
      </Box>
    );
  }
);
