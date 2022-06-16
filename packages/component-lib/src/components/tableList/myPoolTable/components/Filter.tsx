import { Box, Checkbox, FormControlLabel } from "@mui/material";
import { InputSearch } from "../../../basic-lib";
import { CheckBoxIcon, CheckedIcon } from "@loopring-web/common-resources";
import { WithTranslation, withTranslation } from "react-i18next";

export interface FilterProps {
  hideSmallBalances: boolean;
  setHideSmallBalances: (value: boolean) => void;
  filter: {
    searchValue: string;
  };
  handleFilterChange: (props: { searchValue: string }) => void;
}

export const Filter = withTranslation("tables", { withRef: true })(
  ({
    t,
    handleFilterChange,
    filter,
    hideSmallBalances,
    setHideSmallBalances,
  }: FilterProps & WithTranslation) => {
    return (
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Box>
          <FormControlLabel
            style={{ marginRight: 0, paddingRight: 0 }}
            control={
              <Checkbox
                checked={hideSmallBalances}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color="default"
                onChange={(event) => {
                  setHideSmallBalances(event.target.checked);
                }}
              />
            }
            label={t("labelHideSmallBalances")}
          />
        </Box>

        <Box marginLeft={2}>
          <InputSearch
            value={filter.searchValue}
            onChange={(value: any) => {
              handleFilterChange({ searchValue: value });
            }}
          />
        </Box>
      </Box>
    );
  }
);
