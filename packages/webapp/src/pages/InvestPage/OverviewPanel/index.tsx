import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import styled from "@emotion/styled";

import React from "react";
import { useOverview } from "./hook";

import {
  useSettings,
  InvestOverviewTable,
  EmptyDefault,
} from "@loopring-web/component-lib";
import { useHistory } from "react-router-dom";

const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
  .MuiCard-root {
    background: var(--color-pop-bg);
    :hover {
      background: var(--color-box-hover);
    }
  }
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

export const OverviewPanel = withTranslation("common")(
  ({ t }: WithTranslation & {}) => {
    const { filteredData, sortMethod, filterValue, getFilteredData } =
      useOverview();
    const { coinJson } = useSettings();
    const showLoading = filteredData && !filteredData.length;
    const history = useHistory();
    // const table = React.useMemo(() => {
    //   return filteredData.length ? (
    //
    //   ) : (
    //     <EmptyDefault
    //       height={"calc(100% - 35px)"}
    //       message={() => {
    //         return <Trans i18nKey="labelNoContent">Content is Empty</Trans>;
    //       }}
    //     />
    //   );
    // }, [
    //   coinJson,
    //   filterValue,
    //   filteredData,
    //   getFilteredData,
    //   showLoading,
    //   sortMethod,
    // ]);
    return (
      <>
        {/*<WrapperStyled>banner</WrapperStyled>*/}
        <WrapperStyled>
          <Grid container spacing={2} padding={3}>
            <Grid item xs={6} md={4} lg={3}>
              <Card onClick={() => history.push("./invest/ammpools")}>
                <CardContent>
                  <Typography>{t("labelAmmPool")}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={4} lg={3}>
              <Card onClick={() => history.push("./invest/defi")}>
                <CardContent>
                  <Typography>{t("labelDefi")}</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/*<Tabs aria-label="l2-history-tabs" variant="scrollable">*/}
            {/*  <Tab label={t("labelAmmPool")} />*/}
            {/*  <Tab label={t("labelDefi")} value="trades" />*/}
            {/*  /!*<Tab label={t("labelLayer2HistoryAmmRecords")} />*!/*/}
            {/*  /!*<Tab label={t("labelOrderTableOpenOrder")} />*!/*/}
            {/*  /!*<Tab label={t("labelOrderTableOrderHistory")} />*!/*/}
            {/*</Tabs>*/}
          </Grid>
          <Box flex={1}>
            <InvestOverviewTable
              showLoading={showLoading}
              sortMethod={sortMethod}
              filterValue={filterValue}
              getFilteredData={getFilteredData}
              // hideSmallBalances={hideSmallBalances}
              // setHideSmallBalances={setHideSmallBalances}
              coinJson={coinJson}
              rawData={filteredData}
            />
          </Box>
        </WrapperStyled>
      </>
    );
  }
);
