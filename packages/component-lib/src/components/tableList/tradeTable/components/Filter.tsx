import React from 'react'
import styled from '@emotion/styled'
import { Grid, MenuItem } from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next'
import { TextField } from '../../../basic-lib/form'
import { Button } from '../../../basic-lib/btns'
import { DropDownIcon } from '@loopring-web/common-resources'
import { DateRange } from '@mui/lab'

export interface FilterProps {
  // rawData: RawDataTradeItem[];
  filterDate: DateRange<Date | string>
  filterType: FilterTradeTypes
  filterPair: string
  handleReset: () => void
  handleFilterChange: ({ type, date }: any) => void
  marketMap?: any
  filterPairs: string[]
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

export enum FilterTradeTypes {
  maker = 'Maker',
  taker = 'Taker',
  allTypes = 'all',
}

export const Filter = withTranslation('tables', { withRef: true })(
  ({
    t,
    // filterDate,
    // filterType,
    filterPairs = [],
    filterPair,
    handleReset,
    handleFilterChange,
  }: // marketMap,
  FilterProps & WithTranslation) => {
    const rawPairList = [].slice
      .call(filterPairs)
      // .map((item: string) => item.replace("-", " - "))
      .sort((a: string, b: string) => {
        return a.localeCompare(b)
      })

    const formattedRawPairList = [
      {
        label: t('labelFilterAllPairs'),
        value: 'all',
      },
      ...Array.from(new Set(rawPairList)).map((pair: string) => ({
        label: pair, //.replace("-", " - "),
        value: pair,
      })),
    ]

    return (
      <Grid container spacing={2} alignItems={'center'}>
        <Grid item xs={6} lg={2}>
          <StyledTextFiled
            id='table-trade-filter-pairs'
            select
            fullWidth
            value={filterPair}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              handleFilterChange({ pair: event.target.value })
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
