import React from 'react'
import styled from '@emotion/styled'
import { Box, Grid, MenuItem } from '@material-ui/core'
import { withTranslation, WithTranslation } from "react-i18next";
import { DatePicker, TextField } from '../../../basic-lib/form'
import { Button } from '../../../basic-lib/btns'
import { DropDownIcon } from 'static-resource'
import { TransactionSide, TransactionTradeTypes } from '../Interface'

export interface FilterProps {
    originalData: (string | number | TransactionSide | {
        unit: string;
        value: number;
    } | undefined)[][];
    handleFilterChange: ({ filterType, filterDate, filterToken }: any) => void
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
                                                                                originalData,
                                                                                handleFilterChange
                                                                            }: FilterProps & WithTranslation) => {
    const transactionTypeList = [
        {
            label: t('labelTxFilterAllTypes'),
            value: 'All Types',
        },
        {
            label: t('labelTxFilterDeposit'),
            value: 'Deposit',
        },
        {
            label: t('labelTxFilterWithdraw'),
            value: 'Withdraw',
        },
        {
            label: t('labelTxFilterTransfer'),
            value: 'Transfer',
        },
    ]
    const [filterType, setFilterType] = React.useState<TransactionTradeTypes>(TransactionTradeTypes.allTypes)
    const [filterDate, setFilterDate] = React.useState<Date | any>(null);
    const [filterToken, setFilterToken] = React.useState('All Tokens')

    // de-duplicate
    const tokenTypeList = [{
        label: t('labelTxFilterAllTokens'),
        value: 'All Tokens'
    }, ...Array.from(new Set(originalData.map(o => o[ 0 ] as string))).map(val => ({
        label: val,
        value: val
    }))]

    const handleReset = React.useCallback(() => {
        setFilterType(TransactionTradeTypes.allTypes)
        setFilterDate(null)
        setFilterToken('All Tokens')
        handleFilterChange({
            filterType: TransactionTradeTypes.allTypes,
            filterDate: null,
            filterToken: 'All Tokens'
        })
    }, [handleFilterChange])

    const handleSearch = React.useCallback(() => {
        handleFilterChange({
            filterType,
            filterDate,
            filterToken
        })
    }, [handleFilterChange, filterDate, filterType, filterToken])

    return (
        <Grid container spacing={2}>
            <Grid item xs={2}>
                <StyledTextFiled
                    id="table-transaction-trade-types"
                    select
                    fullWidth
                    value={filterType}
                    onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                        setFilterType(event.target.value as TransactionTradeTypes);
                    }}
                    inputProps={{IconComponent: DropDownIcon}}
                > {transactionTypeList.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </StyledTextFiled>
            </Grid>
            <Grid item>
                <StyledDatePicker value={filterDate} onChange={(newValue: any) => setFilterDate(newValue)}/>
            </Grid>
            <Grid item xs={2}>
                <StyledTextFiled
                    id="table-transaction-token-types"
                    select
                    fullWidth
                    value={filterToken}
                    onChange={(event: React.ChangeEvent<{ value: string }>) => {
                        setFilterToken(event.target.value);
                    }}
                    inputProps={{IconComponent: DropDownIcon}}
                > {tokenTypeList.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </StyledTextFiled>
            </Grid>
            <Grid item>
                <StyledBtnBox>
                    <Button variant={'outlined'} size={'medium'} color={'primary'}
                            onClick={handleReset}>{t('Reset')}</Button>
                    <Button variant={'contained'} size={'small'} color={'primary'}
                            onClick={handleSearch}>{t('Search')}</Button>
                </StyledBtnBox>
            </Grid>
        </Grid>
    )
})
