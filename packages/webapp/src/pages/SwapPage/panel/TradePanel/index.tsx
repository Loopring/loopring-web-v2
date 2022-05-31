import { useState } from "react";

import { Tabs } from "@mui/material";
import { Tab } from "@mui/material";
import styled from "@emotion/styled";

import { RawDataTradeItem, TradeTable } from "@loopring-web/component-lib";
import { withTranslation, WithTranslation } from "react-i18next";
import { RowConfig } from "@loopring-web/common-resources";
import { RouteComponentProps } from "react-router-dom";
import { Divider } from "@mui/material";
import { store, Limit, TableWrapStyled } from "@loopring-web/core";

const TabsStyled = styled(Tabs)`
  margin-left: ${({ theme }) => theme.unit}px;
`;
const applyProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

const tableHeight = RowConfig.rowHeaderHeight + 15 * RowConfig.rowHeight;

const TradePanel = withTranslation("common")(
  ({
    tradeArray,
    myTradeArray,
    updateMyTradeTable,
    t,
  }: {
    tradeArray: RawDataTradeItem[];
    myTradeArray: {
      data: RawDataTradeItem[];
      total: number;
      page: number;
    };
    updateMyTradeTable: (props: { page: number }) => Promise<void>;
  } & WithTranslation &
    RouteComponentProps) => {
    const [value, setValue] = useState(0);
    // const [tableHeight, setTableHeight] = useState(0);
    const handleChange = (event: any, newValue: any) => {
      setValue(newValue);
    };
    const { tokenMap } = store.getState().tokenMap;

    return (
      <TableWrapStyled
        alignSelf={"stretch"}
        xs={12}
        marginY={2}
        paddingBottom={2}
        flex={1}
        className={"MuiPaper-elevation2"}
      >
        <TabsStyled
          value={value}
          onChange={handleChange}
          aria-label="tabs switch"
        >
          <Tab label={t("labelRecent")} {...applyProps(0)} />
          <Tab label={t("labelMyTrade")} {...applyProps(1)} />
        </TabsStyled>
        <Divider style={{ marginTop: "-1px" }} />
        {value === 0 ? (
          <TradeTable
            rowHeight={RowConfig.rowHeight}
            headerRowHeight={RowConfig.rowHeaderHeight}
            rawData={tradeArray}
            tokenMap={tokenMap}
            currentheight={tableHeight}
          />
        ) : (
          <TradeTable
            rowHeight={RowConfig.rowHeight}
            headerRowHeight={RowConfig.rowHeaderHeight}
            rawData={myTradeArray.data}
            pagination={{
              page: myTradeArray.page,
              pageSize: Limit,
              total: myTradeArray.total,
            }}
            getUserTradeList={updateMyTradeTable}
            tokenMap={tokenMap}
            currentheight={tableHeight - RowConfig.rowHeight}
          />
        )}
      </TableWrapStyled>
    );
  }
) as (props: {
  tradeArray: RawDataTradeItem[];
  myTradeArray: {
    data: RawDataTradeItem[];
    total: number;
    page: number;
  };
  updateMyTradeTable: (props: { page: number }) => Promise<void>;
}) => JSX.Element;
//)

export default TradePanel;
