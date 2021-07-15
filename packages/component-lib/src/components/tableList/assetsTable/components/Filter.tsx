import React from 'react'
import styled from '@emotion/styled'
import { Grid, MenuItem, Checkbox } from '@material-ui/core'
import { withTranslation, WithTranslation } from "react-i18next";
import { TextField, FormControlLabel } from '../../../'
import { DropDownIcon, CheckBoxIcon, CheckedIcon } from 'static-resource'
import { TokenType, TradePairItem } from '../AssetsTable'

export type TokenTypeCol = {
    type: TokenType,
    value: string
}

export type OriginalDataItem = string | number | TokenTypeCol | TradePairItem[] | boolean | undefined

export interface FilterProps {
    originalData: OriginalDataItem[][];
    handleFilterChange: ({ tokenType, hideSmallBalance, hideLPToken }: any) => void;
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

export enum CheckboxType {
    smallBalance = 'smallBalance',
    lp = 'lp'
}

export const Filter = withTranslation('tables', {withRef: true})(({
                                                                            t,
                                                                            originalData,
                                                                            handleFilterChange
                                                                        }: FilterProps & WithTranslation) => {
    // de-duplicate
    const tokenTypeList = [{
        label: t('labelAllToken'),
        value: 'All Tokens'
    }, ...Array.from(new Set(originalData.map(o => (o[ 0 ] as TokenTypeCol).value))).map(val => ({
        label: val,
        value: val
    }))]
    const [tokenType, setTokenType] = React.useState<string>('All Tokens')
    const [hideSmallBalance, setHideSmallBalance] = React.useState(false)
    const [hideLPToken, setHideLPToken] = React.useState(false)
    const refTokenType = React.useRef(tokenType)
    const refHideSmallBalance = React.useRef(hideSmallBalance)
    const refHideLPToken = React.useRef(hideLPToken)

    const handleCheckboxChange = React.useCallback((type: CheckboxType, event: any) => {
        if (type === CheckboxType.smallBalance) {
            setHideSmallBalance(event.target.checked)
        } else {
            setHideLPToken(event.target.checked)
        }
    }, [])

    const handleFilterData = React.useCallback(() => {
        const valueTokenType = refTokenType.current;
        const valueHideSmallBalance = refHideSmallBalance.current;
        const valueHideLPToken = refHideLPToken.current;
        handleFilterChange({ tokenType: valueTokenType, currHideSmallBalance: valueHideSmallBalance, currHideLPToken: valueHideLPToken })
    }, [handleFilterChange])

    return (
        <Grid container spacing={4}>
            <Grid item xs={2}>
                <StyledTextFiled
                    id="table-assets-trade-types"
                    select
                    fullWidth
                    value={tokenType}
                    onChange={(event: React.ChangeEvent<{ value: string }>) => {
                        setTokenType(event.target.value);
                        refTokenType.current = event.target.value;
                        handleFilterData();
                    }}
                    inputProps={{IconComponent: DropDownIcon}}
                > {tokenTypeList.map(token => <MenuItem key={token.value}
                    value={token.value}>{token.label}</MenuItem>)}
                </StyledTextFiled>
            </Grid>

            <Grid item>
                <FormControlLabel style={{ marginRight: 0 }} control={<Checkbox checked={hideSmallBalance} checkedIcon={<CheckedIcon/>} icon={<CheckBoxIcon/>}
                color="default" onChange={(event) => {
                    handleCheckboxChange(CheckboxType.smallBalance, event);
                    refHideSmallBalance.current = event.target.checked;
                    handleFilterData();
                }} />} label={t('labelHideSmallBalances')} />
            </Grid>

            <Grid item>
                <FormControlLabel control={<Checkbox checked={hideLPToken} checkedIcon={<CheckedIcon/>} icon={<CheckBoxIcon/>}
                color="default" onChange={(event) => {
                    handleCheckboxChange(CheckboxType.lp, event);
                    refHideLPToken.current = event.target.checked;
                    handleFilterData();
                }} />} label={t('labelHideLPToken')} />
            </Grid>
        </Grid>
    )
})
