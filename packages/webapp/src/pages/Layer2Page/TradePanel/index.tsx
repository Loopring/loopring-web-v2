import React from "react";
import { TradeTable } from "@loopring-web/component-lib";
import { WithTranslation, withTranslation } from "react-i18next";

import { StylePaper } from "../../styled";
import { useGetTrades } from "./hooks";
import { RowConfig } from "@loopring-web/common-resources";

const TradePanel = withTranslation("common")(
  (rest: WithTranslation<"common">) => {
    const [pageSize, setPageSize] = React.useState(10);
    const { userTrades, showLoading } = useGetTrades();
    const container = React.useRef(null);
    const { t } = rest;

    React.useEffect(() => {
      // @ts-ignore
      let height = container?.current?.offsetHeight;
      if (height) {
        setPageSize(Math.floor((height - 120) / RowConfig.rowHeight) - 2);
      }
    }, [container, pageSize]);

    return (
      <StylePaper ref={container}>
        <div className="title">{t("labelTradePageTitle")}</div>
        <div className="tableWrapper extraTradeClass">
          <TradeTable
            {...{
              rawData: userTrades,
              showFilter: true,
              showLoading: showLoading,
              ...rest,
            }}
          />
        </div>
      </StylePaper>
    );
  }
);

export default TradePanel;
