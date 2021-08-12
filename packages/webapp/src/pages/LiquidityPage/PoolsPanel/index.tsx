import { WithTranslation, withTranslation, } from 'react-i18next'
import { Box, OutlinedInput, InputAdornment } from '@material-ui/core'
import styled from '@emotion/styled'

import React from 'react';
import { useAmmMapUI } from './hook';

import { PoolsTable } from '@loopring-web/component-lib';
import { SearchIcon } from '@loopring-web/common-resources'
import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk/dist/defs/loopring_defs';

const WrapperStyled = styled(Box)`
    flex: 1;
    display: flex;
    flex-direction: column;
`

const StylePaper = styled(Box)`
    width: 100%;
    height: 100%;
    flex: 1;
    background-color: ${({theme}) => theme.colorBase.background().default};
    border-radius: ${({theme}) => theme.unit}px;

    .rdg {
        flex: 1;
    }

` as typeof Box;


export const PoolsPanel = withTranslation('common')(<R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>
({t, ammActivityMap, ...rest}: WithTranslation
    & {
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined }) => {
    const container = React.useRef(null);
    const [pageSize, setPageSize] = React.useState(10);
    const [filterValue, setFilterValue] = React.useState('');
    const {updateTickersUI, rawData, page} = useAmmMapUI({pageSize});

    React.useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 120) / 44) - 1);
        }
    }, [container, pageSize]);

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

    const handlePageChange = React.useCallback((page) => {
        updateTickersUI(page)
    }, [updateTickersUI]);
    return (
        <>
            <WrapperStyled>
                <Box marginBottom={3}>
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
                <StylePaper display={'flex'} flexDirection={'column'} ref={container}>
                    <PoolsTable {...{
                        rawData: getFilteredData(),
                        handlePageChange,
                        page,
                        pagination: {
                            pageSize
                        },
                        showFilter: false
                    }} />
                </StylePaper>
            </WrapperStyled>
        </>
    )
})
