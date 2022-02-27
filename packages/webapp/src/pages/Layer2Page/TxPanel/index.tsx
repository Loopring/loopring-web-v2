import React from "react";
import { TransactionTable } from "@loopring-web/component-lib";
import { WithTranslation, withTranslation } from "react-i18next";
import { StylePaper } from "../../styled";
import { useGetTxs } from "./hooks";
import { useTokenMap } from "../../../stores/token";

const TxPanel = withTranslation("common")((rest: WithTranslation<"common">) => {
  const { t } = rest;
  const container = React.useRef(null);
  const [pageSize, setPageSize] = React.useState(10);
  const { totalCoinMap } = useTokenMap();
  const { txs: txTableData, isLoading } = useGetTxs();

  React.useEffect(() => {
    // @ts-ignore
    let height = container?.current?.offsetHeight;
    if (height) {
      setPageSize(Math.floor((height - 120) / 44) - 2);
    }
  }, [container, pageSize]);

  return (
    <StylePaper ref={container}>
      <div className="title">{t("labelTxnPageTitle")}</div>
      <div className="tableWrapper">
        <TransactionTable
          {...{
            rawData: txTableData,
            pagination: {
              pageSize: pageSize,
              total: txTableData.length,
            },
            filterTokens: totalCoinMap
              ? (Reflect.ownKeys(totalCoinMap) as string[])
              : [],
            showFilter: true,
            showloading: isLoading,
            getTxnList: (): any => {},
            ...rest,
          }}
        />
      </div>
    </StylePaper>
  );
});

export default TxPanel;
