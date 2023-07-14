import { Grid } from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next'
import { InputSearch } from '../../../'

export interface FilterProps {
  // hideInvestToken: boolean;
  // hideSmallBalances: boolean;
  // setHideLpToken: (value: boolean) => void;
  // setHideSmallBalances: (value: boolean) => void;
  searchValue: string
  handleFilterChange: (props: { searchValue: string }) => void
}

export enum CheckboxType {
  smallBalance = 'smallBalance',
  invest = 'invest',
}

export const Filter = withTranslation('tables', { withRef: true })(
  ({
    // t,
    handleFilterChange,
    searchValue,
  }: // hideInvestToken,
  // hideSmallBalances,
  // // setHideLpToken,
  // setHideSmallBalances,
  FilterProps & WithTranslation) => {
    // myLog(searchValue, "searchValue");

    return (
      <Grid container spacing={4} justifyContent={'space-between'}>
        <Grid item>
          <InputSearch
            value={searchValue}
            onChange={(value: any) => {
              handleFilterChange({ searchValue: value })
            }}
          />
        </Grid>
      </Grid>
    )
  },
)
