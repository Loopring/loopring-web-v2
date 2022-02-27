// import React from 'react'
import { Checkbox, Grid } from "@mui/material";
import { withTranslation, WithTranslation } from "react-i18next";
import { FormControlLabel, InputSearch } from "../../../";
import { CheckBoxIcon, CheckedIcon } from "@loopring-web/common-resources";
import {
  TokenType,
  // RawDataAssetsItem
} from "../AssetsTable";

export type TokenTypeCol = {
  type: TokenType;
  value: string;
};
export interface FilterProps {
  // searchValue: string;
  // // originalData: RawDataAssetsItem[];
  // hideSmallBalance: boolean;
  // hideLpToken: boolean;
  hideLpToken: boolean;
  hideSmallBalances: boolean;
  setHideLpToken: (value: boolean) => void;
  setHideSmallBalances: (value: boolean) => void;
  filter: {
    searchValue: string;
    // hideSmallBalance:boolean,
    // hideLpToken:boolean,
  };
  handleFilterChange: (props: { searchValue: string }) => void;
}

// const StyledTextFiled = styled(TextField)`
//     &.MuiTextField-root {
//         max-width: initial;
//     }
//     .MuiInputBase-root {
//         width: initial;
//         max-width: initial;
//     }
// `

export enum CheckboxType {
  smallBalance = "smallBalance",
  lp = "lp",
}

export const Filter = withTranslation("tables", { withRef: true })(
  ({
    t,
    //   originalData,
    handleFilterChange,
    filter,
    // searchValue,
    // hideSmallBalance,
    // hideLpToken,
    hideLpToken,
    hideSmallBalances,
    setHideLpToken,
    setHideSmallBalances,
  }: FilterProps & WithTranslation) => {
    return (
      <Grid container spacing={4} justifyContent={"space-between"}>
        <Grid item>
          <InputSearch
            value={filter.searchValue}
            onChange={(value: any) => {
              // setSearchValue(value)
              handleFilterChange({ searchValue: value });
            }}
          />
        </Grid>

        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={hideLpToken}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color="default"
                onChange={(event) => {
                  // handleCheckboxChange(CheckboxType.lp, event);
                  // refHideLPToken.current = event.target.checked;
                  // handleFilterChange({
                  //     ...filter,
                  //     hideLpToken: event.target.checked
                  // });
                  setHideLpToken(event.target.checked);
                }}
              />
            }
            label={t("labelHideLPToken")}
          />
          <FormControlLabel
            style={{ marginRight: 0, paddingRight: 0 }}
            control={
              <Checkbox
                checked={hideSmallBalances}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color="default"
                onChange={(event) => {
                  // handleCheckboxChange(CheckboxType.smallBalance, event);
                  // refHideSmallBalance.current = event.target.checked;
                  // handleFilterChange({
                  //     ...filter,
                  //     hideSmallBalance: event.target.checked
                  // });
                  setHideSmallBalances(event.target.checked);
                }}
              />
            }
            label={t("labelHideSmallBalances")}
          />
        </Grid>
      </Grid>
    );
  }
);
