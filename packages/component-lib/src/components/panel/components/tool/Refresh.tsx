import { CountDownStyled } from '../Styled';
import { Box, Typography } from '@material-ui/core';
import React from 'react';
import { globalSetup, refreshTime } from '@loopring-web/common-resources';
import { debounce } from 'lodash';

export const  CountDownIcon = React.memo(({onRefreshData, wait=globalSetup.wait}:{wait?:number,onRefreshData?:()=>void})=>{
    const countDownRef = React.useRef<any>();
    const [refreshCount, setRefreshCount] = React.useState(0);
    const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
    const logoTimer = React.useRef<NodeJS.Timeout | -1>(-1);

    React.useEffect(() => {

        if (refreshCount === 0 && onRefreshData) {
            onRefreshData()
        }

    }, [refreshCount,])

    const startCountDown = React.useCallback(() => {
        if(countDownRef && countDownRef.current) {
            countDownRef.current?.classList.add('countdown');
            countDownRef.current?.classList?.remove('logo');
            // setRefreshCount(refreshTime-1);
            if(nodeTimer.current !== -1){
                clearInterval(nodeTimer.current as NodeJS.Timeout);
            }
            nodeTimer.current = setInterval(decreaseNum, 1000)
        }
    }, [countDownRef,nodeTimer])
    const _refresh = React.useCallback(debounce((onRefreshData, countDownRef, nodeTimer, startCountDown) => {
        if(countDownRef && countDownRef.current) {
            // setRefreshCount(0)
            if(nodeTimer.current !== -1){
                clearInterval(nodeTimer.current as NodeJS.Timeout);
            }
            if(logoTimer.current !==-1){
                clearTimeout(logoTimer.current as NodeJS.Timeout);
            }
            countDownRef.current?.classList?.remove('countdown');
            countDownRef.current?.classList?.add('logo');

            logoTimer.current = setTimeout(() => {
                startCountDown()
            }, 1000 - wait);

            if (typeof onRefreshData === 'function') {
                onRefreshData();
            }
        }
    },wait), []);

    const decreaseNum = React.useCallback(() => setRefreshCount((prev) => {
        if (prev > 1) {
            return prev - 1
        } else if(prev == 1){
            //@ts-ignore
            countDownRef?.current?.classList?.remove('countdown');
            //@ts-ignore
            countDownRef?.current?.classList?.add('logo');

            return 0
        }else {
            //@ts-ignore
            countDownRef?.current?.classList?.add('countdown');
            //@ts-ignore
            countDownRef?.current?.classList?.remove('logo');
            return refreshTime - 1
        }
    }), [setRefreshCount, countDownRef, refreshTime])
    
    const cleanSubscribe = React.useCallback(()=>{
        clearInterval(nodeTimer.current as NodeJS.Timeout);
        clearTimeout(logoTimer.current as NodeJS.Timeout);
    },[nodeTimer,logoTimer] )
    React.useEffect(() => {
        _refresh(onRefreshData, countDownRef, nodeTimer, startCountDown);
        return cleanSubscribe;
    }, []);
    return <CountDownStyled ref={countDownRef}
                            className={'clock-loading outline logo'}
                            onClick={()=>_refresh(onRefreshData, countDownRef, nodeTimer, startCountDown)}>
        <Typography component={'span'} className={'text-count'}>
            {/*{refreshCount>0?refreshCount:''}*/}
        </Typography>
        <Box className={'circle'}/>
    </CountDownStyled>
})