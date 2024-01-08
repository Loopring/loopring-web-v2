import React from 'react'
import styled from '@emotion/styled'
import { Grid, MenuItem } from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next'
import { DateRangePicker, TextField } from '../../../'
import { Button } from '../../../basic-lib/btns'
import { DropDownIcon } from '@loopring-web/common-resources'
import { DateRange } from '@mui/lab'

export interface FilterProps {
  handleFilterChange: ({ filterType, filterDate, filterToken }: any) => void
  filterDate: DateRange<Date | string>
  filterType: FilterOrderTypes
  filterToken: string
  handleReset: () => void
  marketArray?: string[]
}

export enum FilterOrderTypes {
  allTypes = 'all',
  buy = 'Buy',
  sell = 'Sell',
}

const StyledTextFiled = styled(TextField)`
  &.MuiTextField-root {
    max-width: initial;
  }
  .MuiInputBase-root {
    width: initial;
    max-width: initial;
  }
`

export const Filter = withTranslation('tables', { withRef: true })(
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
          label: t('labelOrderFilterAllPairs'),
          value: 'all',
        },
        ...Array.from(new Set(marketArray)).map((token) => ({
          label: token,
          value: token,
        })),
      ]
    }, [t, marketArray])

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} lg={4}>
          <DateRangePicker
            value={filterDate}
            onChange={(date: any) => {
              handleFilterChange({ date: date })
            }}
          />
        </Grid>
        <Grid item xs={6} lg={2}>
          <StyledTextFiled
            id='table-order-token-types'
            select
            fullWidth
            value={filterToken}
            onChange={(event: React.ChangeEvent<{ value: string }>) => {
              handleFilterChange({ token: event.target.value })
            }}
            inputProps={{ IconComponent: DropDownIcon }}
          >
            {getTokenTypeList().map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </StyledTextFiled>
        </Grid>
        <Grid item xs={6} lg={2}>
          <Button
            fullWidth
            variant={'outlined'}
            size={'medium'}
            color={'primary'}
            onClick={handleReset}
          >
            {t('labelFilterReset')}
          </Button>
        </Grid>
      </Grid>
    )
  },
)
