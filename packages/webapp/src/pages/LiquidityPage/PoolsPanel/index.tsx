import { WithTranslation, withTranslation, } from 'react-i18next'
import { Box, InputAdornment, OutlinedInput, Typography } from '@mui/material'
import styled from '@emotion/styled'

import React from 'react';
import { useAmmMapUI } from './hook';

import { PoolsTable } from '@loopring-web/component-lib';
import { SearchIcon } from '@loopring-web/common-resources'
import { useSettings } from '@loopring-web/component-lib';
import { useSystem } from 'stores/system';
import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk';
import store from 'stores'

const WrapperStyled = styled(Box)`
    flex: 1;
    display: flex;
    flex-direction: column;
`

const StylePaper = styled(Box)`
    width: 100%;
    //height: 100%;
    flex: 1;
    background: var(--color-box);
    border-radius: ${({theme}) => theme.unit}px;
    padding-bottom: ${({theme}) => theme.unit}px;

    .rdg {
        flex: 1;
    }

` as typeof Box;

export const PoolsPanel = withTranslation('common')(<R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>
({t, ...rest}: WithTranslation
    & {}) => {
    const container = React.useRef(null);
    const {filteredData, sortMethod, tableHeight, getFilteredData, filterValue } = useAmmMapUI();
    const { coinJson } = useSettings();
    const { forex } = useSystem()
    const { tokenPrices } = store.getState().tokenPrices

    return (
        <>
            <WrapperStyled flex={1} marginBottom={3}>
                <Box marginBottom={3} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                    <Typography
                        variant={'h2'}
                        component={'h2'}
                    >{t('labelLiquidityPageTitle')}</Typography>
                    <OutlinedInput
                        {...{
                            placeholder: t('labelFilter'),
                            value: filterValue,
                            onChange: (event: any) => {
                                getFilteredData(event)
                               //
                            }
                        }}
                        key={'search'}
                        className={'search'}
                        aria-label={'search'}
                        startAdornment={<InputAdornment position="start">
                            <SearchIcon/>
                        </InputAdornment>}
                    />
                </Box>
                <StylePaper display={'flex'}  flexDirection={'column'} ref={container} >
                    <PoolsTable {...{
                        rawData:filteredData,
                        showLoading: !filteredData.length,
                        tableHeight: tableHeight,
                        sortMethod: sortMethod,
                        coinJson,
                        forex,
                        tokenPrices,
                    }} />
                </StylePaper>
            </WrapperStyled>
        </>
    )
})
