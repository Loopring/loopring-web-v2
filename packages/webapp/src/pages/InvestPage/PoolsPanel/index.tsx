import { WithTranslation, withTranslation } from "react-i18next";
import { Box } from "@mui/material";
import styled from "@emotion/styled";

import React from "react";
import { useAmmMapUI } from "./hook";

import { Button, PoolsTable, useSettings } from "@loopring-web/component-lib";

import { useNotify, useSystem } from "@loopring-web/core";
import { BackIcon, RowInvestConfig } from "@loopring-web/common-resources";
import { useHistory } from "react-router-dom";

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
    const history = useHistory();
    const { forexMap } = useSystem();
    const { currency } = useSettings();
    const poolTableProps = useAmmMapUI();
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
          <StylePaper
            display={"flex"}
            flexDirection={"column"}
            ref={container}
            className={"table-divide"}
          >
            <PoolsTable
              {...{
                ...poolTableProps,
                campaignTagConfig,
                rowConfig: RowInvestConfig,
                forexValue: forexMap[currency],
              }}
            />
          </StylePaper>
        </WrapperStyled>
      </Box>
    );
  }
);
