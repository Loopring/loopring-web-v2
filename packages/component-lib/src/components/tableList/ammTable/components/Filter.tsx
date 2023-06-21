import React from 'react'
import styled from '@emotion/styled'
import { Grid, MenuItem } from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next'
import { DateRangePicker, TextField } from '../../../basic-lib/form'
import { Button } from '../../../basic-lib/btns'
import { DropDownIcon } from '@loopring-web/common-resources'
import { DateRange } from '@mui/lab'
import { useSettings } from '../../../../stores'

export interface FilterProps {
  filterPairs: string[]
  filterType: string
  filterPair: string
  filterDate: DateRange<Date | null>
  handleFilterChange: ({ filterType, filterDate, filterToken }: any) => void
  handleReset: () => void
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
  join = 'Add',
  exit = 'Remove',
  allTypes = 'all',
}

export const Filter = withTranslation('tables', { withRef: true })(
  ({
    t,
    filterPairs,
    filterType,
    filterDate,
    filterPair,
    handleReset,
    handleFilterChange,
  }: FilterProps & WithTranslation) => {
    const { isMobile } = useSettings()

    const FilterTradeTypeList = [
      {
        label: t('labelAmmFilterTypes'),
        value: FilterTradeTypes.allTypes,
      },
      {
        label: t('labelAmmJoin'),
        value: FilterTradeTypes.join,
      },
      {
        label: t('labelAmmExit'),
        value: FilterTradeTypes.exit,
      },
    ]

    const rawPairList = [].slice
      .call(filterPairs)
      .sort((a: string, b: string) => {
        return a.localeCompare(b)
      })
      .map((pair: string) => ({
        label: pair,
        value: pair,
      }))
    const formattedRawPairList = [
      {
        label: t('labelFilterAllPairs'),
        value: 'all',
      },
      ...rawPairList,
    ]

    return (
      <Grid container spacing={2} alignItems={'center'}>
        <Grid item xs={12} order={isMobile ? 0 : 1} lg={6}>
          <DateRangePicker
            value={filterDate}
            onChange={(date: any) => {
              handleFilterChange({ date: date })
            }}
          />
        </Grid>
        <Grid item xs={4} order={isMobile ? 1 : 0} lg={2}>
          <StyledTextFiled
            id='table-amm-filter-types'
            select
            fullWidth
            value={filterType}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              handleFilterChange({ type: event.target.value })
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
        <Grid item xs={4} order={2} lg={2}>
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
        <Grid item xs={4} order={3} lg={2}>
          <Button
            fullWidth
            variant={'outlined'}
            size={'medium'}
            color={'primary'}
            onClick={handleReset}
          >
            {t('labelFilterReset')}
          </Button>
          {/* <Button variant={'contained'} size={'small'} color={'primary'}
                            onClick={handleSearch}>{t('Search')}</Button> */}
        </Grid>
      </Grid>
    )
  },
)
