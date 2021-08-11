import { WithTranslation, withTranslation, } from 'react-i18next'
import { Box } from '@material-ui/core'
import styled from '@emotion/styled'

import React from 'react';
import { useAmmMapUI } from './hook';

import { PoolsTable } from '@loopring-web/component-lib';
import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk/dist/defs/loopring_defs';

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
    const {updateTickersUI, rawData, page} = useAmmMapUI({pageSize});

    React.useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 120) / 44) - 1);
        }
    }, [container, pageSize]);

    const handlePageChange = React.useCallback((page) => {
        updateTickersUI(page)
    }, [updateTickersUI]);
    return (
        <>
            <StylePaper display={'flex'} flexDirection={'column'} ref={container}>
                <PoolsTable {...{
                    rawData,
                    handlePageChange,
                    page,
                    pagination: {
                        pageSize
                    },
                    showFilter: false
                }} />
            </StylePaper>
        </>
    )
})

