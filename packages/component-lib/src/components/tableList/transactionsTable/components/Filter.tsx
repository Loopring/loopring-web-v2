import React from "react";
import styled from "@emotion/styled";
import { Box, Grid, MenuItem } from "@mui/material";
import { withTranslation, WithTranslation } from "react-i18next";
import { TextField, DateRangePicker } from "../../../basic-lib/form";
import { Button } from "../../../basic-lib/btns";
import { DropDownIcon } from "@loopring-web/common-resources";
import { TransactionTradeTypes, RawDataTransactionItem } from "../Interface";
import { DateRange } from "@mui/lab";

export interface FilterProps {
  originalData: RawDataTransactionItem[];
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
    originalData,
    filterDate,
    filterType,
    filterToken,
    handleFilterChange,
    handleReset,
  }: FilterProps & WithTranslation) => {
    const transactionTypeList = [
      {
        label: t("labelTxFilterAllTypes"),
        value: "All Types",
      },
      {
        label: t("labelTxFilterDeposit"),
        value: "Deposit",
      },
      {
        label: t("labelTxFilterWithdraw"),
        value: "Withdraw",
      },
      {
        label: t("labelTxFilterTransfer"),
        value: "Transfer",
      },
    ];

    // tokenPairList.map(o => <MenuItem key={o.key} value={o.value}>{o.value}</MenuItem>)
    // const [filterType, setFilterType] = React.useState<TransactionTradeTypes>(TransactionTradeTypes.allTypes)
    // const [filterDate, setFilterDate] = React.useState<Date | any>(null);
    // const [filterToken, setFilterToken] = React.useState('All Tokens')

    // const [timeRange, setTimeRange] = React.useState<DateRange<Date | string>>(['', '']);

    // de-duplicate
    const tokenTypeList = [
      {
        label: t("labelTxFilterAllTokens"),
        value: "All Tokens",
      },
      // @ts-ignore
      ...Array.from(new Set(originalData.map((o) => o?.amount.unit))).map(
        (token) => ({
          label: token,
          value: token,
        })
      ),
    ];

    // const handleReset = React.useCallback(() => {
    //     setFilterType(TransactionTradeTypes.allTypes)
    //     setTimeRange([null, null])
    //     // setFilterToken('All Tokens')
    //     handleFilterChange({
    //         filterType: TransactionTradeTypes.allTypes,
    //         filterDate: ['', ''],
    //         filterToken: 'All Tokens'
    //     })
    // }, [handleFilterChange])

    // const handleSearch = React.useCallback(() => {
    //     handleFilterChange({
    //         filterType,
    //         filterDate: filterDate,
    //         // filterToken
    //     })
    // }, [handleFilterChange, filterType, filterDate])

    return (
      <Grid container spacing={2} alignItems={"center"}>
        <Grid item xs={2}>
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
            {" "}
            {transactionTypeList.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </StyledTextFiled>
        </Grid>
        <Grid item>
          <DateRangePicker
            value={filterDate}
            onChange={(date: any) => {
              handleFilterChange({ date: date });
            }}
          />
        </Grid>
        <Grid item xs={2}>
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
            {" "}
            {tokenTypeList.map((o) => (
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
                            onClick={handleSearch}>{t('Search')}</Button> */}
          </StyledBtnBox>
        </Grid>
      </Grid>
    );
  }
);
