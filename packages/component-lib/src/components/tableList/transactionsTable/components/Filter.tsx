import React from "react";
import styled from "@emotion/styled";
import { Box, Grid, MenuItem } from "@mui/material";
import { withTranslation, WithTranslation } from "react-i18next";
import { TextField, DateRangePicker } from "../../../basic-lib/form";
import { Button } from "../../../basic-lib/btns";
import { DropDownIcon } from "@loopring-web/common-resources";
import { DateRange } from "@mui/lab";
import { useSettings } from "../../../../stores";
import { TransactionTradeTypes } from "../Interface";

export interface FilterProps {
  filterTokens: string[];
  filterDate: DateRange<Date | string>;
  filterType: TransactionTradeTypes;
  filterToken: string;
  handleFilterChange: ({ type, date }: any) => void;
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
    filterTokens = [],
    filterDate,
    filterType,
    filterToken,
    handleFilterChange,
    handleReset,
  }: FilterProps & WithTranslation) => {
    const { isMobile } = useSettings();
    const transactionTypeList = [
      {
        label: t("labelTxFilterALL"),
        value: TransactionTradeTypes.allTypes,
      },
      {
        label: t("labelTxFilterDEPOSIT"),
        value: TransactionTradeTypes.deposit,
      },
      {
        label: t("labelTxFilterWITHDRAW"),
        value: TransactionTradeTypes.withdraw,
      },
      {
        label: t("labelTxFilterTRANSFER"),
        value: TransactionTradeTypes.transfer,
      },
    ];

    const tokenTypeList: { label: string; value: string }[] = [
      {
        label: t("labelTxFilterAllTokens"),
        value: "all",
      },
      ...Array.from(filterTokens)
        .sort((a: string, b: string) => {
          return a.localeCompare(b);
        })
        .map((token: string) => ({
          label: token,
          value: token,
        })),
    ];

    return (
      <Grid container spacing={isMobile ? 1 : 2} alignItems={"center"}>
        <Grid item xs={12} order={isMobile ? 0 : 1} lg={6}>
          <DateRangePicker
            value={filterDate}
            onChange={(date: any) => {
              handleFilterChange({ date: date });
            }}
          />
        </Grid>
        <Grid item xs={4} order={isMobile ? 1 : 0} lg={2}>
          <StyledTextFiled
            id="table-transaction-trade-types"
            select
            fullWidth
            value={filterType}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              handleFilterChange({ type: event.target.value });
            }}
            inputProps={{ IconComponent: DropDownIcon }}
          >
            {transactionTypeList.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </StyledTextFiled>
        </Grid>
        <Grid item xs={4} order={2} lg={2}>
          <StyledTextFiled
            id="table-transaction-token-types"
            select
            fullWidth
            value={filterToken}
            onChange={(event: React.ChangeEvent<{ value: string }>) => {
              handleFilterChange({ token: event.target.value });
            }}
            inputProps={{ IconComponent: DropDownIcon }}
          >
            {tokenTypeList.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </StyledTextFiled>
        </Grid>
        <Grid item xs={4} order={3} lg={2}>
          <StyledBtnBox>
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
          </StyledBtnBox>
        </Grid>
      </Grid>
    );
  }
);
