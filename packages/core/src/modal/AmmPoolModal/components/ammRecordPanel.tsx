import React from "react";
import { StylePaper } from "../../../component";
import { Divider, Tab, Tabs } from "@mui/material";
import { AmmRecordTable, useSettings } from "@loopring-web/component-lib";
import { RowConfig } from "@loopring-web/common-resources";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";

const TabsStyled = styled(Tabs)`
  padding-left: ${({ theme }) => theme.unit}px;
`;
const AMMPanelStyled = styled(StylePaper)`
  background: initial;
  && {
    margin-bottom: 0;
  }
`;

const applyProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
};
export const AmmRecordPanel = ({
  ammMarketArray,
  getUserAmmPoolTxs,
  isMyAmmLoading,
  ammUserTotal,
  isRecentLoading,
  myAmmMarketArray,
  setPageSize,
  pageSize,
}: any) => {
  const container = React.useRef(null);

  const [tabIndex, setTabIndex] = React.useState<0 | 1>(0);

  const { t } = useTranslation("common");
  const { currency } = useSettings();
  const tableHeight =
    RowConfig.rowHeaderHeight +
    (tabIndex === 0 ? 15 : 14) * RowConfig.rowHeight;
  React.useEffect(() => {
    // @ts-ignore
    let height = container?.current?.offsetHeight;
    if (height) {
      // const pageSize =
      setPageSize(
        Math.floor((height - RowConfig.rowHeight * 2) / RowConfig.rowHeight) - 1
      );
      // getUserAmmPoolTxs()
    }
  }, [container]);
  const handleTabsChange = React.useCallback((_: any, value: 0 | 1) => {
    setTabIndex(value);
  }, []);
  return (
    <AMMPanelStyled
      // className={"MuiPaper-elevation2"}
      // paddingBottom={1}
      ref={container}
      marginBottom={0}
    >
      <TabsStyled
        value={tabIndex}
        onChange={handleTabsChange}
        aria-label="tabs switch"
      >
        <Tab label={t("labelAmmAllTransactions")} {...applyProps(0)} />
        <Tab label={t("labelAmmMyTransactions")} {...applyProps(1)} />
      </TabsStyled>
      <Divider style={{ marginTop: "-1px" }} />
      {/*ammRecordArray*/}
      {tabIndex === 0 ? (
        <AmmRecordTable
          rawData={ammMarketArray}
          rowHeight={RowConfig.rowHeight}
          headerRowHeight={RowConfig.rowHeaderHeight}
          currentheight={tableHeight}
          showloading={isRecentLoading}
          currency={currency}
          scroll={true}
        />
      ) : (
        <AmmRecordTable
          rawData={myAmmMarketArray}
          handlePageChange={getUserAmmPoolTxs}
          pagination={{
            pageSize,
            total: ammUserTotal,
          }}
          showloading={isMyAmmLoading}
          rowHeight={RowConfig.rowHeight}
          headerRowHeight={RowConfig.rowHeaderHeight}
          // currentheight={tableHeight}
          currency={currency}
        />
      )}
    </AMMPanelStyled>
  );
};
