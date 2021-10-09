// import React from 'react'
import { Checkbox, Grid } from '@mui/material'
import { withTranslation, WithTranslation } from "react-i18next";
import { FormControlLabel, InputSearch } from '../../../'
import { CheckBoxIcon, CheckedIcon } from '@loopring-web/common-resources'
import { TokenType,
    // RawDataAssetsItem
} from '../AssetsTable'

export type TokenTypeCol = {
    type: TokenType,
    value: string
}
export interface FilterProps {
    // searchValue: string;
    // // originalData: RawDataAssetsItem[];
    // hideSmallBalance: boolean;
    // hideLpToken: boolean;
    hideLpToken: boolean,
    hideSmallBalances: boolean,
    setHideLpToken: (value: boolean) => void,
    setHideSmallBalances: (value: boolean) => void,
    filter: {
        searchValue:string,
        // hideSmallBalance:boolean,
        // hideLpToken:boolean,
    }
    handleFilterChange: (props:{searchValue:string}) => void;
}

// const StyledTextFiled = styled(TextField)`
//     &.MuiTextField-root {
//         max-width: initial;
//     }
//     .MuiInputBase-root {
//         width: initial;
//         max-width: initial;
//     }
// `

export enum CheckboxType {
    smallBalance = 'smallBalance',
    lp = 'lp'
}

export const Filter = withTranslation('tables', {withRef: true})(({
                                                                    t,
                                                                //   originalData,
                                                                    handleFilterChange,
                                                                    filter,
                                                                    // searchValue,
                                                                    // hideSmallBalance,
                                                                    // hideLpToken,
                                                                    hideLpToken,
                                                                    hideSmallBalances,
                                                                    setHideLpToken,
                                                                    setHideSmallBalances,
                                                                  }: FilterProps & WithTranslation) => {
    // de-duplicate
    // const tokenTypeList = [{
    //     label: t('labelAllToken'),
    //     value: 'All Tokens'
    // }, ...Array.from(new Set(originalData.map(o => (o[ 0 ] as TokenTypeCol).value))).map(val => ({
    //     label: val,
    //     value: val
    // }))]
    // const [tokenType, setTokenType] = React.useState<string>('All Tokens')
    // const [hideSmallBalance, setHideSmallBalance] = React.useState(false)
    // const [hideLPToken, setHideLPToken] = React.useState(false)
    // const refTokenType = React.useRef(tokenType)

    // const refHideSmallBalance = React.useRef(hideSmallBalance)
    // const refHideLPToken = React.useRef(hideLPToken)

    // const handleCheckboxChange = React.useCallback((type: CheckboxType, event: any) => {
    //     // if (type === CheckboxType.smallBalance) {
    //     //     setHideSmallBalance(event.target.checked)
    //     // } else {
    //     //     setHideLPToken(event.target.checked)
    //     // }
    //     handleFilterChange({
            
    //     })
    // }, [handleFilterChange])

    // const handleFilterData = React.useCallback((type, value) => {
    //     // const valueTokenType = refTokenType.current;
    //     // const valueHideSmallBalance = refHideSmallBalance.current;
    //     // const valueHideLPToken = refHideLPToken.current;
    //     if (type === 'smallBalance') {
    //         handleFilterChange({
    //             hideSmallBalance: value
    //         })
    //     }
    //     if (type === 'lp') {
    //         handleFilterChange({
    //             hideLPToken: value
    //         })
    //     }

    //     handleFilterChange({
    //         // tokenType: valueTokenType,
    //         currHideSmallBalance: valueHideSmallBalance,
    //         currHideLPToken: valueHideLPToken
    //     })
    // }, [handleFilterChange])

    return (
        <Grid container spacing={4} justifyContent={'space-between'}>
            {/* <Grid item xs={2}>
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
            </Grid> */}
            <Grid item>
                <InputSearch value={filter.searchValue} onChange={(value: any) => {
                    // setSearchValue(value)
                    handleFilterChange({ searchValue: value })
                }} />
            </Grid>

            <Grid item>
                <FormControlLabel
                    control={<Checkbox checked={hideLpToken} checkedIcon={<CheckedIcon/>} icon={<CheckBoxIcon/>}
                                color="default" onChange={(event) => {
                        // handleCheckboxChange(CheckboxType.lp, event);
                        // refHideLPToken.current = event.target.checked;
                        // handleFilterChange({
                        //     ...filter,
                        //     hideLpToken: event.target.checked
                        // });
                        setHideLpToken(event.target.checked)
                    }}/>} label={t('labelHideLPToken')}/>
                <FormControlLabel style={{marginRight: 0}}
                    control={<Checkbox checked={hideSmallBalances} checkedIcon={<CheckedIcon/>}
                                        icon={<CheckBoxIcon/>}
                                        color="default" onChange={(event) => {
                        // handleCheckboxChange(CheckboxType.smallBalance, event);
                        // refHideSmallBalance.current = event.target.checked;
                        // handleFilterChange({
                        //     ...filter,
                        //     hideSmallBalance: event.target.checked
                        // });
                        setHideSmallBalances(event.target.checked)
                    }}/>} label={t('labelHideSmallBalances')}/>
            </Grid>
        </Grid>
    )
})
