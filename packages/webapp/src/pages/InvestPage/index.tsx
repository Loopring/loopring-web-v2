import { useRouteMatch } from "react-router-dom";

import { Box } from "@mui/material";

import { withTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { PoolsPanel } from "./PoolsPanel";
import { CoinPairPanel } from "./CoinPairPanel";

const TableWrapperStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  flex: 1;
`;

export const LiquidityPage = withTranslation("common", { withRef: true })(
  () => {
    let match: any = useRouteMatch(["/liquidity/:item", ":next/"]);
    const selected = match?.params.item ?? "pools";
    let matchPair: any = useRouteMatch(["/liquidity/:item/:next/:symbol"]);
    let symbol: any = undefined;
    if (
      matchPair &&
      matchPair?.params?.next &&
      matchPair.params.item === "pools"
    ) {
      if (!matchPair.params.symbol) {
        symbol = "LRC-ETH";
      } else {
        symbol = matchPair.params.symbol;
      }
    }

    return (
      <>
        {!!symbol ? (
          <Box
            display={"flex"}
            flexDirection={"column"}
            flex={1}
            alignSelf={"flex-start"}
          >
            <CoinPairPanel />
          </Box>
        ) : (
          <TableWrapperStyled>
            {selected === "pools" && <PoolsPanel />}
          </TableWrapperStyled>
        )}
      </>
    );
  }
);
