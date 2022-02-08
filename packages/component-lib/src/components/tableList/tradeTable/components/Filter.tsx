import React from "react";
import styled from "@emotion/styled";
import { Box, Grid, MenuItem } from "@mui/material";
import { withTranslation, WithTranslation } from "react-i18next";
import { TextField } from "../../../basic-lib/form";
import { Button } from "../../../basic-lib/btns";
import { DropDownIcon } from "@loopring-web/common-resources";
import { DateRange } from "@mui/lab";
import { RawDataTradeItem } from "../TradeTable";

export interface FilterProps {
  rawData: RawDataTradeItem[];
  filterDate: DateRange<Date | string>;
  filterType: FilterTradeTypes;
  filterPair: string;
  handleReset: () => void;
  handleFilterChange: ({ type, date }: any) => void;
  marketMap?: any;
}

const StyledTextFiled = styled(TextField)`
  &.MuiTextField-root {
    max-width: initial;
  }
  .MuiInputBase-root {
    width: initial;
    max-width: initial;
  }
`;

const StyledBtnBox = styled(Box)`
  display: flex;
  margin-left: 40%;

  button:first-of-type {
    margin-right: 8px;
  }
`;

export enum FilterTradeTypes {
  maker = "Maker",
  taker = "Taker",
  allTypes = "All Types",
}

export const Filter = withTranslation("tables", { withRef: true })(
  ({
    t,
    rawData,
    filterPair,
    handleReset,
    handleFilterChange,
    marketMap,
  }: FilterProps & WithTranslation) => {
    const rawPairList = rawData
      .map((item) => `${item.amount.from.key}-${item.amount.to.key}`)
      .filter((o) => marketMap[o])
      .map((market) => {
        const formattedMarket = market.split("-");
        return formattedMarket.join(" - ");
      });
    const formattedRawPairList = [
      {
        label: t("labelFilterAllPairs"),
        value: "all",
      },
      ...Array.from(new Set(rawPairList)).map((pair: string) => ({
        label: pair,
        value: pair,
      })),
    ];

    return (
      <Grid container spacing={2} alignItems={"center"}>
        <Grid item xs={2}>
          <StyledTextFiled
            id="table-trade-filter-pairs"
            select
            fullWidth
            value={filterPair}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              handleFilterChange({ pair: event.target.value });
            }}
            inputProps={{ IconComponent: DropDownIcon }}
          >
            {formattedRawPairList.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </StyledTextFiled>
        </Grid>
        <Grid item>
          <StyledBtnBox>
            <Button
              variant={"outlined"}
              size={"medium"}
              color={"primary"}
              onClick={handleReset}
            >
              {t("labelFilterReset")}
            </Button>
          </StyledBtnBox>
        </Grid>
      </Grid>
    );
  }
);
