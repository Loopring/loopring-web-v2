import React from "react";
import styled from "@emotion/styled/macro";

import {
  InputSearch,
  MarketBlock,
  MarketBlockProps,
  QuoteTable,
} from "@loopring-web/component-lib";
import { WithTranslation, withTranslation } from "react-i18next";
import { RowConfig } from "@loopring-web/common-resources";
import { Box, Container, Divider, Grid, Tab, Tabs } from "@mui/material";
import { useQuotePage } from "./hook";
import { TableWrapStyled } from "pages/styled";
import { useAccount } from "@loopring-web/core";

const RowStyled = styled(Grid)`
  & .MuiGrid-root:not(:last-of-type) > div {
    // margin-right: ${({ theme }) => theme.unit * 2}px;
  }
` as typeof Grid;

export enum TableFilterParams {
  all = "all",
  favourite = "favourite",
  ranking = "ranking",
}

export const QuotePage = withTranslation("common")(
  ({ t, ...rest }: WithTranslation) => {
    const tableRef = React.useRef<HTMLDivElement>();
    const { account } = useAccount();
    const {
      recommendations,
      formattedRecommendations,
      getTradeFloatVolumeToCount,
      handleRecommendBoxClick,
      tableTabValue,
      handleTabChange,
      searchValue,
      removeMarket,
      favoriteMarket,
      activityInProgressRules,
      handleSearchChange,
      addMarket,
      tableHeight,
      filteredData,
      tickList,
      handleRowClick,
    } = useQuotePage({ tableRef });
    return (
      <Box display={"flex"} flexDirection={"column"} flex={1}>
        <RowStyled container spacing={2}>
          {(!!recommendations.length
            ? recommendations
            : ([
                {
                  coinAInfo: {
                    simpleName: "",
                  },
                  coinBInfo: {
                    simpleName: "",
                  },
                },
                {
                  coinAInfo: {
                    simpleName: "",
                  },
                  coinBInfo: {
                    simpleName: "",
                  },
                },
                {
                  coinAInfo: {
                    simpleName: "",
                  },
                  coinBInfo: {
                    simpleName: "",
                  },
                },
                {
                  coinAInfo: {
                    simpleName: "",
                  },
                  coinBInfo: {
                    simpleName: "",
                  },
                },
              ] as MarketBlockProps<{
                [key: string]: string;
              }>[])
          ).map((item, index) => (
            <Grid
              key={`${item.coinAInfo.simpleName}-${item.coinBInfo.simpleName}-${index}`}
              item
              xs={12}
              sm={6}
              lg={3}
            >
              <MarketBlock
                {...{
                  ...formattedRecommendations[index],
                  tradeFloat: getTradeFloatVolumeToCount(
                    formattedRecommendations[index]?.tradeFloat
                  ),
                  chartData: formattedRecommendations[index]
                    ? formattedRecommendations[index].chartData
                    : [],
                  handleBlockClick: () =>
                    handleRecommendBoxClick(formattedRecommendations[index]),
                  t,
                  ...rest,
                }}
              />
            </Grid>
          ))}
        </RowStyled>
        <TableWrapStyled
          ref={tableRef as any}
          marginY={3}
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
              account={account}
              rawData={filteredData}
              favoriteMarket={favoriteMarket}
              addFavoriteMarket={addMarket}
              removeFavoriteMarket={removeMarket}
              currentheight={tableHeight}
              rowHeight={RowConfig.rowHeight}
              headerRowHeight={RowConfig.rowHeaderHeight}
              activityInProgressRules={activityInProgressRules}
              {...{ showLoading: tickList && !tickList.length, ...rest }}
            />
          </Box>
        </TableWrapStyled>
      </Box>
    );
  }
);
