import React from "react";
import styled from "@emotion/styled";
import { Grid, MenuItem } from "@mui/material";
import { withTranslation, WithTranslation } from "react-i18next";
import { DatePicker, TextField } from "../../../basic-lib/form";
import { Button } from "../../../basic-lib/btns";
import { DropDownIcon } from "@loopring-web/common-resources";
import { RawDataAmmItem } from "../AmmTable";

export interface FilterProps {
  rawData: RawDataAmmItem[];
  filterType: string;
  filterDate: Date | null;
  filterPair: string;
  handleFilterChange: ({ filterType, filterDate, filterToken }: any) => void;
  handleReset: () => void;
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

export enum FilterTradeTypes {
  join = "Add",
  exit = "Remove",
  allTypes = "All Types",
}

export const Filter = withTranslation("tables", { withRef: true })(
  ({
    t,
    rawData,
    filterType,
    filterDate,
    filterPair,
    handleReset,
    handleFilterChange,
  }: FilterProps & WithTranslation) => {
    const FilterTradeTypeList = [
      {
        label: t("labelAmmFilterTypes"),
        value: "All Types",
      },
      {
        label: t("labelAmmJoin"),
        value: "Join",
      },
      {
        label: t("labelAmmExit"),
        value: "Exit",
      },
    ];

    const rawPairList = rawData.map(
      (item) => `${item.amount.from.key} - ${item.amount.to.key}`
    );
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
        <Grid item xs={6} lg={2}>
          <StyledTextFiled
            id="table-amm-filter-types"
            select
            fullWidth
            value={filterType}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              handleFilterChange({ type: event.target.value });
            }}
            inputProps={{ IconComponent: DropDownIcon }}
          >
            {FilterTradeTypeList.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </StyledTextFiled>
        </Grid>
        <Grid item xs={6} lg={2}>
          <DatePicker
            value={filterDate}
            onChange={(newValue: any) => handleFilterChange({ date: newValue })}
          />
        </Grid>
        <Grid item xs={6} lg={2}>
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
        <Grid item xs={6} lg={2}>
          <Button
            fullWidth
            variant={"outlined"}
            size={"medium"}
            color={"primary"}
            onClick={handleReset}
          >
            {t("labelFilterReset")}
          </Button>
          {/* <Button variant={'contained'} size={'small'} color={'primary'}
                            onClick={handleSearch}>{t('Search')}</Button> */}
        </Grid>
      </Grid>
    );
  }
);
