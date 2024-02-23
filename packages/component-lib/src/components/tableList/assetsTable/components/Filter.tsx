import { Checkbox, Grid } from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next'
import { FormControlLabel, InputSearch } from '../../../'
import { CheckBoxIcon, CheckedIcon, TokenType } from '@loopring-web/common-resources'

export type TokenTypeCol = {
  type: TokenType
  value: string
}

export interface FilterProps {
  hideInvestToken?: boolean
  hideSmallBalances?: boolean
  setHideLpToken?: (value: boolean) => void
  setHideSmallBalances?: (value: boolean) => void
  filter: {
    searchValue: string
  }
  handleFilterChange: (props: { searchValue: string }) => void
  noHideInvestToken?: boolean
}

export enum CheckboxType {
  smallBalance = 'smallBalance',
  invest = 'invest',
}

export const Filter = withTranslation('tables', { withRef: true })(
  ({
    t,
    handleFilterChange,
    filter,
    hideInvestToken,
    hideSmallBalances,
    setHideLpToken,
    setHideSmallBalances,
    noHideInvestToken
  }: FilterProps & WithTranslation) => {
    return (
      <Grid container spacing={4} justifyContent={'space-between'}>
        <Grid item>
          <InputSearch
            value={filter.searchValue}
            onChange={(value: any) => {
              handleFilterChange({ searchValue: value })
            }}
          />
        </Grid>

        <Grid item>
          {!noHideInvestToken && <FormControlLabel
            control={
              <Checkbox
                checked={hideInvestToken}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color='default'
                onChange={(event) => {
                  if (setHideLpToken) {
                    setHideLpToken(event.target.checked)
                  }
                }}
              />
            }
            label={t('labelHideInvestToken')}
          />}
          <FormControlLabel
            style={{ marginRight: 0, paddingRight: 0 }}
            control={
              <Checkbox
                checked={hideSmallBalances}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color='default'
                onChange={(event) => {
                  if (setHideSmallBalances) {
                    setHideSmallBalances(event.target.checked)
                  }
                }}
              />
            }
            label={t('labelHideSmallBalances')}
          />
        </Grid>
      </Grid>
    )
  },
)
