import { CountDownStyled } from '../Styled';
import { Box, Typography } from '@material-ui/core';
import React from 'react';
import { refreshTime } from '@loopring-web/common-resources';

export const  CountDownIcon = React.memo(({onRefreshData}:{onRefreshData?:()=>void})=>{
    const countDownRef = React.useRef();
    const [refreshCount, setRefreshCount] = React.useState(0);
    const [nodeTimer, setNodeTimer] = React.useState<NodeJS.Timeout | -1>(-1);
    const startCountDown = React.useCallback(() => {
        //@ts-ignore
        countDownRef.current?.classList.add('countdown');
        //@ts-ignore
        countDownRef?.current?.classList?.remove('logo');
        setRefreshCount(refreshTime-1);
        setNodeTimer(setInterval(decreaseNum, 1000))

    }, [countDownRef,nodeTimer])
    const _refresh = React.useCallback(() => {
        setRefreshCount(0)
        if(nodeTimer!== -1){
            clearInterval(nodeTimer as NodeJS.Timeout);
        }

        //@ts-ignore
        countDownRef?.current?.classList?.remove('countdown');
        //@ts-ignore
        countDownRef?.current?.classList?.add('logo');
        // setImmediate(() => {
        //     startCountDown()
        // }, [])
        setTimeout(() => {
            startCountDown()

        }, 1000)

        if (typeof onRefreshData === 'function') {
            onRefreshData();
        }
        return refreshTime;
    }, [onRefreshData, countDownRef, refreshTime,nodeTimer,startCountDown]);
    const decreaseNum = React.useCallback(() => setRefreshCount((prev) => {
        if (prev > 1) {
            return prev - 1
        } else if(prev == 1){
            //@ts-ignore
            countDownRef?.current?.classList?.remove('countdown');
            //@ts-ignore
            countDownRef?.current?.classList?.add('logo');
            //_refresh()
            return 0
        }else {
            //@ts-ignore
            countDownRef?.current?.classList?.add('countdown');
            //@ts-ignore
            countDownRef?.current?.classList?.remove('logo');
            return refreshTime-1
        }
    }), [refreshCount]);
    React.useEffect(() => {
        _refresh();
        return () => clearInterval(nodeTimer as NodeJS.Timeout);
    }, []);
    return <CountDownStyled ref={countDownRef}
                            className={'clock-loading outline logo'}
                            onClick={_refresh}>
        <Typography component={'span'} className={'text-count'}>{refreshCount>0?refreshCount:''}</Typography>
        <Box className={'circle'}/>
    </CountDownStyled>
})