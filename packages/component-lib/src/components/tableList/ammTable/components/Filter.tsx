import React from 'react'
import styled from '@emotion/styled'
import { Box, Grid, MenuItem } from '@material-ui/core'
import { withTranslation, WithTranslation } from "react-i18next";
import { DatePicker, TextField } from '../../../basic-lib/form'
import { Button } from '../../../basic-lib/btns'
import { DropDownIcon } from '@loopring-web/common-resources'

export interface FilterProps {
    filterType: string;
    filterDate: Date | null;
    handleFilterChange: ({filterType, filterDate, filterToken}: any) => void;
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
`

const StyledBtnBox = styled(Box)`
  display: flex;
  margin-left: 40%;

  button:first-of-type {
    margin-right: 8px;
  }
`

export enum FilterTradeTypes {
    join = 'Join',
    exit = 'Exit',
    allTypes = 'All Types'
}

export const Filter = withTranslation('tables', {withRef: true})(({
        t,
        filterType,
        filterDate,
        handleReset,
        handleFilterChange,
    }: FilterProps & WithTranslation) => {
    const FilterTradeTypeList = [
        {
            label: t('labelAmmFilterTypes'),
            value: 'All Types'
        },
        {
            label: t('labelAmmFilterJoin'),
            value: 'Join'
        },
        {
            label: t('labelAmmFilterExit'),
            value: 'Exit'
        },
    ]

    return (
        <Grid container spacing={2}>
            <Grid item xs={2}>
                <StyledTextFiled
                    id="table-amm-filter-types"
                    select
                    fullWidth
                    value={filterType}
                    onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                        handleFilterChange({type: event.target.value})
                    }}
                    inputProps={{IconComponent: DropDownIcon}}
                > {FilterTradeTypeList.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </StyledTextFiled>
            </Grid>
            <Grid item>
                <DatePicker value={filterDate} onChange={(newValue: any) => handleFilterChange({date: newValue})}/>
            </Grid>
            <Grid item>
                <StyledBtnBox>
                    <Button variant={'contained'} size={'small'} color={'primary'}
                            onClick={handleReset}>{t('Reset')}</Button>
                    {/* <Button variant={'contained'} size={'small'} color={'primary'}
                            onClick={handleSearch}>{t('Search')}</Button> */}
                </StyledBtnBox>
            </Grid>
        </Grid>
    )
})
