import React from 'react'
import styled from '@emotion/styled'
import { Box, Grid, MenuItem } from '@material-ui/core'
import { withTranslation, WithTranslation } from "react-i18next";
import { TextField, DateRangePicker } from '../../../basic-lib/form'
import { Button } from '../../../basic-lib/btns'
import { DropDownIcon } from '@loopring-web/common-resources'
import { DateRange } from '@material-ui/lab'

export interface FilterProps {
    filterDate: DateRange<Date | string>;
    filterType: FilterTradeTypes;
    handleReset: () => void;
    handleFilterChange: ({type, date}: any) => void
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
    buy = 'Buy',
    sell = 'Sell',
    allTypes = 'All Types'
}

export const Filter = withTranslation('tables', {withRef: true})(({
        t,
        filterDate,
        filterType,
        handleReset,
        handleFilterChange,
    }: FilterProps & WithTranslation) => {
    const FilterTradeTypeList = [
        {
            label: t('labelOrderFilterAllTypes'),
            value: 'All Types'
        },
        {
            label: t('labelOrderFilterBuy'),
            value: 'Buy'
        },
        {
            label: t('labelOrderFilterSell'),
            value: 'Sell'
        },
    ]

    return (
        <Grid container spacing={2}>
            <Grid item xs={2}>
                <StyledTextFiled
                    id="table-trade-filter-types"
                    select
                    fullWidth
                    value={filterType}
                    onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                        // setFilterType(event.target.value as FilterTradeTypes)
                        handleFilterChange({type: event.target.value})
                    }}
                    inputProps={{IconComponent: DropDownIcon}}
                > {FilterTradeTypeList.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </StyledTextFiled>
            </Grid>
            <Grid item>
                <DateRangePicker value={filterDate} onChange={(date: any) => {
                    // setFilterDate(date)
                    handleFilterChange({date: date})
                }} />
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
