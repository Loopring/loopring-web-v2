import { WithTranslation, withTranslation } from "react-i18next";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import styled from "@emotion/styled";

import React from "react";
import { useOverview } from "./hook";

import {
  PoolsTable,
  InputSearch,
  useSettings,
  useOpenModals,
  AmmPanelType,
} from "@loopring-web/component-lib";

import {
  store,
  useAccount,
  useSystem,
  useAmmActivityMap,
  useTokenMap,
} from "@loopring-web/core";

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

export const OverviewPanel = withTranslation("common")(
  ({ t }: WithTranslation & {}) => {
    const overview = useOverview();
    return (
      <>
        {/*<WrapperStyled>banner</WrapperStyled>*/}
        <WrapperStyled>
          <Box marginTop={2} marginLeft={2}>
            <Tabs aria-label="l2-history-tabs" variant="scrollable">
              <Tab label={t("labelAmmPool")} />
              <Tab label={t("labelDefi")} value="trades" />
              {/*<Tab label={t("labelLayer2HistoryAmmRecords")} />*/}
              {/*<Tab label={t("labelOrderTableOpenOrder")} />*/}
              {/*<Tab label={t("labelOrderTableOrderHistory")} />*/}
            </Tabs>
          </Box>
          <Box marginTop={2} marginLeft={2}>
            <Typography variant={"h5"}>
              {t("labelTitleOverviewToken")}
            </Typography>
            <Box flex={1}>{/*<Table></Table>*/}</Box>
          </Box>
        </WrapperStyled>
      </>
    );
  }
);
