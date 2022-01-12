import React from "react";
import styled from "@emotion/styled";
import { Box, Grid, MenuItem } from "@mui/material";
import { withTranslation, WithTranslation } from "react-i18next";
import { Button, TextField, DateRangePicker } from "../../../basic-lib";
import { DropDownIcon } from "@loopring-web/common-resources";
import { DateRange } from "@mui/lab";
import { RawDataTsNFTItem } from "../Interface";

export interface FilterProps {
  originalData: RawDataTsNFTItem[];
  handleFilterChange: ({ filterDate, filterToken }: any) => void;
  filterDate: DateRange<Date | string>;
  filterToken: string;
  handleReset: () => void;
  marketArray?: string[];
}

export enum FilterOrderTypes {
  allTypes = "All Types",
  buy = "Buy",
  sell = "Sell",
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

export const Filter = withTranslation("tables", { withRef: true })(
  ({
    t,
    filterDate,
    filterToken,
    handleFilterChange,
    handleReset,
    marketArray = [],
  }: FilterProps & WithTranslation) => {
    const getTokenTypeList = React.useCallback(() => {
      return [
        {
          label: t("labelOrderFilterAllPairs"),
          value: "All Pairs",
        },
        ...Array.from(new Set(marketArray)).map((token) => ({
          label: token,
          value: token,
        })),
      ];
    }, [t, marketArray]);

    return (
      <Grid container spacing={2}>
        <Grid item>
          <DateRangePicker
            value={filterDate}
            onChange={(date: any) => {
              handleFilterChange({ date: date });
            }}
          />
        </Grid>
        <Grid item xs={2} minWidth={200}>
          <StyledTextFiled
            id="table-order-token-types"
            select
            fullWidth
            value={filterToken}
            onChange={(event: React.ChangeEvent<{ value: string }>) => {
              handleFilterChange({ token: event.target.value });
            }}
            inputProps={{ IconComponent: DropDownIcon }}
          >
            {" "}
            {getTokenTypeList().map((o) => (
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
            {/* <Button variant={'contained'} size={'small'} color={'primary'}
                            onClick={handleSearch}>{t('labelFilterSearch')}</Button> */}
          </StyledBtnBox>
        </Grid>
      </Grid>
    );
  }
);
