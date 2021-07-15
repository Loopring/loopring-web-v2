import React from 'react'
import styled from '@emotion/styled'
import { Box, Grid, MenuItem } from '@material-ui/core'
import { withTranslation, WithTranslation } from "react-i18next";
import { DatePicker, TextField } from '../../../'
import { Button } from '../../../basic-lib/btns'
import { DropDownIcon } from 'static-resource'

export interface FilterProps {
    handleFilterChange: ({ filterType, filterDate, filterToken }: any) => void
}

export enum FilterTradeTypes {
    allTypes = 'All Types',
    buy = 'Buy',
    sell = 'Sell'
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

const StyledDatePicker = styled(DatePicker)`

`

const StyledBtnBox = styled(Box)`
    display: flex;
    margin-left: 40%;

    button:first-of-type {
        margin-right: 8px;
    }
`

export const Filter = withTranslation('tables', {withRef: true})(({
                                                                                t,
                                                                                handleFilterChange
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
    const [filterType, setFilterType] = React.useState<FilterTradeTypes>(FilterTradeTypes.allTypes)
    const [filterDate, setFilterDate] = React.useState<Date | any>(null);

    const handleReset = React.useCallback(() => {
        setFilterType(FilterTradeTypes.allTypes)
        setFilterDate(null)
        handleFilterChange({
            filterType: FilterTradeTypes.allTypes,
            filterDate: null,
        })
    }, [handleFilterChange])

    const handleSearch = React.useCallback(() => {
        handleFilterChange({
            filterType,
            filterDate,
        })
    }, [handleFilterChange, filterDate, filterType])

    return (
        <Grid container spacing={2}>
            <Grid item xs={2}>
                <StyledTextFiled
                    id="table-order-filter-types"
                    select
                    fullWidth
                    value={filterType}
                    onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                        setFilterType(event.target.value as FilterTradeTypes);
                    }}
                    inputProps={{IconComponent: DropDownIcon}}
                // > {Object.values(FilterTradeTypes).map(type => <MenuItem key={type} value={type}>{t(type)}</MenuItem>)}
                > {FilterTradeTypeList.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </StyledTextFiled>
            </Grid>
            <Grid item>
                <StyledDatePicker value={filterDate} onChange={(newValue: any) => setFilterDate(newValue)}/>
            </Grid>
            <Grid item>
                <StyledBtnBox>
                    <Button variant={'outlined'} size={'medium'} color={'primary'}
                            onClick={handleReset}>{t('labelFilterReset')}</Button>
                    <Button variant={'contained'} size={'small'} color={'primary'}
                            onClick={handleSearch}>{t('labelFilterSearch')}</Button>
                </StyledBtnBox>
            </Grid>
        </Grid>
    )
})
