import { WithTranslation, withTranslation, } from 'react-i18next'
import { Box, InputAdornment, OutlinedInput, Typography } from '@material-ui/core'
import styled from '@emotion/styled'

import React, { useEffect } from 'react';
import { useAmmMapUI } from './hook';

import { PoolsTable } from '@loopring-web/component-lib';
import { SearchIcon } from '@loopring-web/common-resources'
import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk';

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

// const StylePaper = styled(Box)`
//     width: 100%;
//     height: 100%;
//     flex: 1;
//     background-color: ${({theme}) => theme.colorBase.background().default};
//     border-radius: ${({theme}) => theme.unit}px;

export const PoolsPanel = withTranslation('common')(<R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>
({t, ammActivityMap, ...rest}: WithTranslation
    & {
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined
}) => {
    const container = React.useRef(null);
    const [pageSize, setPageSize] = React.useState(10);
    const [filterValue, setFilterValue] = React.useState('');
    const [tableHeight, setTableHeight] = React.useState(0)
    const {updateTickersUI, rawData, page, sortMethod} = useAmmMapUI({pageSize});

    const getCurrentHeight = React.useCallback(() => {
        // const height = window.innerHeight
        // const tableHeight = height - 64 - 117
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if(height) {
            setTableHeight(height-36-44)
        }
    }, [])

    React.useEffect(() => {
        getCurrentHeight()
        window.addEventListener('resize', getCurrentHeight)
        return () => {
            window.removeEventListener('resize', getCurrentHeight)
        }
    }, [getCurrentHeight])

    React.useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 36 ) / 44) - 1);
        }
    }, [container]);

    const getFilteredData = React.useCallback(() => {
        if (!filterValue) {
            return rawData
        }
        return rawData.filter(o => {
            const coinA = o.coinAInfo.name.toLowerCase()
            const coinB = o.coinBInfo.name.toLowerCase()
            const formattedValue = filterValue.toLowerCase()
            return coinA.includes(formattedValue) || coinB.includes(formattedValue)
        })
    }, [filterValue, rawData])
    // useEffect(() => {
    //     if (pageSize) {
    //         getFilteredData({
    //             limit: pageSize,
    //         })
    //     }
    // }, [ pageSize])

    const handlePageChange = React.useCallback((page) => {
        updateTickersUI(page)
    }, [updateTickersUI]);
    return (
        <>
            <WrapperStyled flex={1} marginBottom={3}>
                <Box  marginBottom={3} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                    <Typography
                        variant={'h2'}
                        component={'h2'}
                    >{t('labelLiquidityPageTitle')}</Typography>
                    <OutlinedInput
                        {...{
                            placeholder: t('labelFilter'),
                            value: filterValue,
                            onChange: (event: any) => {
                                setFilterValue(event.currentTarget?.value);
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
                        rawData: getFilteredData(),
                        handlePageChange,
                        page,
                        pagination: {
                            pageSize
                        },
                        showFilter: false,
                        showLoading: !rawData.length,
                        tableHeight: tableHeight,
                        sortMethod: sortMethod
                    }} />
                </StylePaper>
            </WrapperStyled>
        </>
    )
})
