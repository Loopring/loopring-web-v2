import { AmmCard, AmmProps, EmptyDefault } from '@loopring-web/component-lib';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { AmmCardProps, AmmJoinData, AmmInData, AmmExitData, IBData, myLog } from '@loopring-web/common-resources';
import { Box, Grid, Typography } from '@mui/material';
import styled from '@emotion/styled'
import { useAmmMiningUI } from './hook';
// import Tabs from '@mui/material';
// import Tab from '@mui/material';
import { useAmmPool } from '../LiquidityPage/hook'
import { Trans, withTranslation } from 'react-i18next';
import { AmmPoolActivityRule, LoopringMap, RewardItem } from 'loopring-sdk';
import { getMiningLinkList } from '@loopring-web/common-resources'
import store from 'stores'

export enum MiningJumpType {
    orderbook = 'orderbook',
    amm = 'amm'
}

const WrapperStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
` as typeof Box

// const AmmListWrapperStyled = styled(Box)`
//     display: flex;
// `

type ClickHandler = {
    handleClick: (pair: string, type: MiningJumpType) => void
}

const AmmCardWrap = React.memo(React.forwardRef((props: AmmCardProps<{ [ key: string ]: any }> & ClickHandler & { popoverIdx: number, ammRewardRecordList: RewardItem[], getLiquidityMining: (market: string, size?: number) => Promise<void> }, ref) => {
    const pair = `${props.coinAInfo?.simpleName}-${props.coinBInfo?.simpleName}`
    const { ruleType } = props.activity
    const type = ruleType === 'ORDERBOOK_MINING' ? MiningJumpType.orderbook : MiningJumpType.amm
    const popoverIdx = props.popoverIdx
    return props ? <AmmCard ref={ref} {...props} {...{popoverIdx, getMiningLinkList}} handleClick={() => props.handleClick(pair, type)}/> : <></>
}));

const AmmList = <I extends { [ key: string ]: any }>({ammActivityViewMap, ammRewardRecordList, getLiquidityMining}: 
    { 
        ammActivityViewMap: Array<AmmCardProps<I>>, 
        ammRewardRecordList: RewardItem[], 
        getLiquidityMining: (market: string, size?: number) => Promise<void>
    }) => {
    let history = useHistory();
    const {tokenMap} = store.getState().tokenMap

    const jumpTo = React.useCallback((pair: string, type: MiningJumpType) => {
        if (history) {
            if (type === MiningJumpType.amm) {
                history.push(`/liquidity/pools/coinPair/${pair}`)
            } else {
                history.push(`/trading/lite/${pair}`)
            }
        }
    }, [history])
    
    return <>{ammActivityViewMap.length ? ammActivityViewMap.map((item: AmmCardProps<I>, index) => {
        const precisionA = tokenMap ? tokenMap[item.coinAInfo?.simpleName]?.precision : undefined
        const precisionB = tokenMap ? tokenMap[item.coinBInfo?.simpleName]?.precision : undefined
        return (
            <Grid item xs={12} sm={6} lg={4} key={index}>
                <AmmCardWrap {...{
                    popoverIdx: index,
                    precisionA,
                    precisionB,
                    ammRewardRecordList,
                    getLiquidityMining,
                }} handleClick={jumpTo} {...item as any}   />
            </Grid>
        )
    }
    ) : <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'} flexDirection={'column'}>
        <EmptyDefault height={"calc(100% - 35px)"} marginTop={10} display={'flex'} flexWrap={'nowrap'}
                      alignItems={'center'} justifyContent={'center'}
                      flexDirection={'column'} message={() => {
            return <Trans i18nKey="labelEmptyDefault">
                Content is Empty
            </Trans>
        }}/> </Box>}   </>
}

export const MiningPage = withTranslation('common')(<T extends AmmJoinData<C extends IBData<I> ? C : IBData<I>>, I,
    TW extends AmmExitData<C extends IBData<I> ? C : IBData<I>>,
    ACD extends AmmInData<I>,
    C = IBData<I>>({ammProps, t, ...rest}: {
    ammProps: AmmProps<T, TW, I, ACD>,
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined,
} & any) => {
    const {ammActivityMap} = useAmmPool();
    const {
        ammActivityViewMap,
        ammActivityPastViewMap,
        ammRewardRecordList,
        getLiquidityMining,
    } = useAmmMiningUI({ammActivityMap});
    // const [tabIndex, setTabIndex] = React.useState<0 | 1>(0);
    // const handleChange = (event: any, newValue: 0 | 1) => {
    //     setTabIndex(newValue);
    // }
    const jointAmmViewMap = [...ammActivityViewMap, ...ammActivityPastViewMap]
    const filteredJointAmmViewMap = jointAmmViewMap.filter(o => o.activity.ruleType !== 'SWAP_VOLUME_RANKING')
    const orderedViewMap = filteredJointAmmViewMap.sort((a, b) => {
        if (a.APR && !b.APR) {
            return -1
        }
        if (b.APR && !a.APR) {
            return 1
        }
        return 0
    })

    return <WrapperStyled>
        {/* <Tabs value={tabIndex}
                onChange={handleChange}
                aria-label="tabs switch">
            <Tab label={t('labelCurrentActivities')}/>
            <Tab label={t('labelPastActivities')}/>
        </Tabs> */}
        <Typography
            variant={'h2'}
            component={'div'}
            fontFamily={'Roboto'}
            marginTop={2}
            marginBottom={3}
        >{t('labelMiningPageTitle')}</Typography>
        <Grid container spacing={5}>
            <AmmList
                ammActivityViewMap={orderedViewMap}
                ammRewardRecordList={ammRewardRecordList}
                getLiquidityMining={getLiquidityMining}
            />
        </Grid>
    </WrapperStyled>
})
