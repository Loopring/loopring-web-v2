import React from 'react';
import { useAmmMap } from '../../../stores/Amm/AmmMap';
import { AmmDetail, CustomError, ErrorMap, SagaStatus, } from '@loopring-web/common-resources';
import { deepClone } from '../../../utils/obj_tools';
import { useTokenMap } from '../../../stores/token';
import { useSocket } from '../../../stores/socket';
import { useTicker } from '../../../stores/ticker';

// import { tickerService } from '../../../services/tickerService';

export function useAmmMapUI<R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>({pageSize}: { pageSize: number }) {
    const [rawData, setRawData] = React.useState<Array<AmmDetail<any>> | []>([]);
    const [page, setPage] = React.useState<number>(1);
    const [timestamp, setTimestamp] = React.useState<NodeJS.Timer | -1>(-1)
    const {coinMap} = useTokenMap();
    const {ammMap, status: ammMapStatus,} = useAmmMap();
    const {
        tickerMap,
        status: tickerStatus,
        updateTickers,
    } = useTicker();
    const {status: socketStatus, statusUnset: socketStatusUnset,} = useSocket();
    const updateRawData = React.useCallback((tickerMap) => {
        try {
            const _ammMap = deepClone(ammMap);
            for (let tickerMapKey in tickerMap) {
                if (_ammMap[ 'AMM-' + tickerMapKey ]) {
                    _ammMap[ 'AMM-' + tickerMapKey ].tradeFloat = {
                        ..._ammMap[ 'AMM-' + tickerMapKey ].tradeFloat,
                        ...tickerMap[ tickerMapKey ],
                        // APY: _ammMap['AMM-' + tickerMapKey ].APY
                    }

                }
            }
            setRawData(Object.keys(_ammMap).map((ammKey: string) => {
                if (coinMap) {
                    _ammMap[ ammKey ][ 'coinAInfo' ] = coinMap[ _ammMap[ ammKey ][ 'coinA' ] ];
                    _ammMap[ ammKey ][ 'coinBInfo' ] = coinMap[ _ammMap[ ammKey ][ 'coinB' ] ];
                }
                return _ammMap[ ammKey ];
            }))
        } catch (error) {
            throw new CustomError({...ErrorMap.NO_TOKEN_MAP, options: error})
        }

    }, [ammMap]);
    const updateTickerLoop = React.useCallback((_keys?: string[]) => {

        if (timestamp !== -1) {
            clearTimeout(timestamp)
        }

        setTimestamp(setTimeout(() => {
            updateTickerLoop(_keys);
        }, 60000))

        //console.log(_keys)
        setImmediate(updateTickers, _keys as string[])
    },[])

    const updateTickersUI = React.useCallback((_page) => {
        setPage(_page);
        if (ammMap && Object.keys(ammMap).length > 0) {
            const _keys = []
            for (let i = (page - 1) * pageSize; i < Object.keys(ammMap).length && i < (page - 1) * pageSize + pageSize; i++) {
                _keys.push(Object.keys(ammMap)[ i ]);
            }
            
            // setKeys(_keys);
            updateTickerLoop(_keys);
            // try{
            //    // socketStart({})
            // }catch (error){
            //
            // }


        }
    }, [ammMap, pageSize]);
    React.useEffect(() => {
        if (ammMap && Object.keys(ammMap).length !== 0) {
            updateTickersUI(page)
        }
    }, []);
    React.useEffect(() => {
        if (tickerStatus === SagaStatus.UNSET){
            updateRawData(tickerMap)
        }
    }, [tickerStatus]);
    React.useEffect(() => {
        if(ammMapStatus === SagaStatus.UNSET){
            updateTickersUI(1)
        }
    }, [ammMapStatus, updateTickersUI]);
    return {
        page,
        rawData,
        updateTickersUI,
    }
}

