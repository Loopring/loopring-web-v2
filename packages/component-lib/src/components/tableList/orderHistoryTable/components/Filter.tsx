import React from 'react'
import styled from '@emotion/styled'
import { Box, Grid, MenuItem } from '@material-ui/core'
import { withTranslation, WithTranslation } from "react-i18next";
import { DatePicker, TextField, DateRangePicker } from '../../../'
import { Button } from '../../../basic-lib/btns'
import { DropDownIcon } from '@loopring-web/common-resources'
import { OrderHistoryRawDataItem } from '../OrderHistoryTable'
import { DateRange } from '@material-ui/lab'

export interface FilterProps {
    handleFilterChange: ({filterType, filterDate, filterToken}: any) => void
    originalData: OrderHistoryRawDataItem[];
    filterDate: DateRange<Date | string>;
    filterType: FilterOrderTypes;
    filterToken: string;
    handleReset: () => void;
}

export enum FilterOrderTypes {
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

const StyledBtnBox = styled(Box)`
    display: flex;
    margin-left: 40%;

    button:first-of-type {
        margin-right: 8px;
    }
`

export const Filter = withTranslation('tables', {withRef: true})(({
                                                                      t,
                                                                      originalData,
                                                                      filterDate,
                                                                      filterType,
                                                                      filterToken,
                                                                      handleFilterChange,
                                                                      handleReset,
                                                                  }: FilterProps & WithTranslation) => {
    const FilterOrderTypeList = [
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

    // de-duplicate
    const getTokenTypeList = React.useCallback(() => {
        const buyTokenList = originalData.map(o => o.amount && o.amount.from ? o.amount.from.key : '')
        const sellTokenList = originalData.map(o => o.amount && o.amount.to ? o.amount.to.key : '')
        return [{
            label: t('labelOrderFilterAllTokens'),
            value: 'All Tokens',
        }, ...Array.from(new Set(buyTokenList.concat(sellTokenList)))
            .map(token => ({
                label: token,
                value: token
            }))]
    }, [originalData, t])

    return (
        <Grid container spacing={2}>
            <Grid item xs={2}>
                <StyledTextFiled
                    id="table-order-filter-types"
                    select
                    fullWidth
                    value={filterType}
                    onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                        handleFilterChange({
                            type: event.target.value as FilterOrderTypes
                        })
                    }}
                    inputProps={{IconComponent: DropDownIcon}}
                    // > {Object.values(FilterTradeTypes).map(type => <MenuItem key={type} value={type}>{t(type)}</MenuItem>)}
                > {FilterOrderTypeList.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </StyledTextFiled>
            </Grid>
            <Grid item>
                {/* <StyledDatePicker value={filterDate} onChange={(newValue: any) => setFilterDate(newValue)}/> */}
                <DateRangePicker value={filterDate} onChange={(date: any) => {
                    handleFilterChange({date: date})
                }} />
            </Grid>
            <Grid item xs={2}>
                <StyledTextFiled
                    id="table-order-token-types"
                    select
                    fullWidth
                    value={filterToken}
                    onChange={(event: React.ChangeEvent<{ value: string }>) => {
                        handleFilterChange({token: event.target.value});
                    }}
                    inputProps={{IconComponent: DropDownIcon}}
                > {getTokenTypeList().map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </StyledTextFiled>
            </Grid>
            <Grid item>
                <StyledBtnBox>
                    <Button variant={'outlined'} size={'medium'} color={'primary'}
                            onClick={handleReset}>{t('labelFilterReset')}</Button>
                    {/* <Button variant={'contained'} size={'small'} color={'primary'}
                            onClick={handleSearch}>{t('labelFilterSearch')}</Button> */}
                </StyledBtnBox>
            </Grid>
        </Grid>
    )
})
