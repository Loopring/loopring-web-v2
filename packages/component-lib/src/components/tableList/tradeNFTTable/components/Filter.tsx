import React from 'react'
import styled from '@emotion/styled'
import { Grid, MenuItem } from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Button, DateRangePicker, TextField } from '../../../basic-lib'
import { DropDownIcon } from '@loopring-web/common-resources'
import { FilterTradeNFTTypes } from '../Interface'
import { useSettings } from '../../../../stores'
import { DateRange } from '@mui/lab'

export interface FilterProps {
  filterDate?: DateRange<Date | string>
  filterType: FilterTradeNFTTypes
  handleReset: () => void
  handleFilterChange: ({ type, date }: any) => void
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
    filterDate = [null, null],
    filterType,
    // filterPairs = [],
    // filterPair,
    handleReset,
    handleFilterChange,
  }: // marketMap,
  FilterProps & WithTranslation) => {
    const FilterTradeTypeList = [
      {
        label: t('labelFilterTradeNFTAll'),
        value: FilterTradeNFTTypes.allTypes,
      },
      {
        label: t('labelFilterTradeNFTSell'),
        value: FilterTradeNFTTypes.sell,
      },
      {
        label: t('labelFilterTradeNFTBuy'),
        value: FilterTradeNFTTypes.buy,
      },
    ]

    const { isMobile } = useSettings()
    return (
      <Grid container spacing={2} alignItems={'center'}>
        <Grid item xs={6} md={3} order={isMobile ? 1 : 0}>
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
        <Grid item xs={12} md={6} order={isMobile ? 0 : 1}>
          <DateRangePicker
            value={filterDate}
            onChange={(date: any) => {
              handleFilterChange({ date: date })
            }}
          />
        </Grid>
        <Grid item xs={6} md={3} order={2}>
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
