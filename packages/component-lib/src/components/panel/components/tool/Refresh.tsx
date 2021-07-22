import { CountDownStyled } from '../Styled';
import { Box, Typography } from '@material-ui/core';
import React from 'react';
import { refreshTime } from '@loopring-web/common-resources';

export const  CountDownIcon = React.memo(({onRefreshData}:{onRefreshData?:()=>void})=>{
    const countDownRef = React.useRef();
    const [refreshCount, setRefreshCount] = React.useState(refreshTime);
    const [nodeTimer, setNodeTimer] = React.useState<NodeJS.Timeout | -1>(-1);
    const startCountDown = React.useCallback(() => {

        setRefreshCount(refreshTime);
        //@ts-ignore
        countDownRef.current?.classList.add('countdown')
        setNodeTimer(setInterval(decreaseNum, 1000))
    }, [countDownRef])
    const _refresh = React.useCallback(() => {
        //@ts-ignore
        countDownRef?.current?.classList?.remove('countdown');
        clearInterval(nodeTimer as NodeJS.Timeout);
        setImmediate(() => {
            startCountDown()
        }, [countDownRef])

        if (typeof onRefreshData === 'function') {
            onRefreshData();
        }
    }, [onRefreshData, countDownRef, refreshTime,nodeTimer,startCountDown]);
    const decreaseNum = React.useCallback(() => setRefreshCount((prev) => {
        if (prev > 1) {
            return prev - 1
        } else {
            return refreshTime;
        }
    }), [refreshTime]);
    React.useEffect(() => {
        _refresh();
        return () => clearInterval(nodeTimer as NodeJS.Timeout);
    }, []);
    return <CountDownStyled ref={countDownRef}
                            className={'clock-loading outline countdown'}
                            onClick={_refresh}>
        <Typography component={'span'} className={'text-count'}>{refreshCount - 1}</Typography>
        <Box className={'circle'}/>
    </CountDownStyled>
})