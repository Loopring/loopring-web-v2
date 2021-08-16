import React from 'react'
import styled from '@emotion/styled'
import { Box, Grid, Typography } from '@material-ui/core'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import {
    AmmRecordTable,
    AmmTradeType,
    ChartType,
    ScaleAreaChart,
    TablePaddingX,
    ToggleButtonGroup,
    useSettings ,
    MyPoolTable
} from '@loopring-web/component-lib'
import {
    Currency, EmptyValueTag,
    getThousandFormattedNumbers,
    PriceTag
} from '@loopring-web/common-resources';

import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk/dist/defs/loopring_defs';
import { useOverview } from './hook';
import { TableWrapStyled } from 'pages/styled'


//TODO: FIXED:  demo data


const toggleData = [
    {value: '24 H', key: '24 H'},
    {value: '1 W', key: '1 W'},
    {value: 'ALL', key: 'ALL'},
]

const StylePaper = styled(Box)`
    height: 100%;
    flex: 1;
    background: var(--color-box);
    border-radius: ${({theme}) => theme.unit}px;
` as typeof Box;

const StyleWrapper = styled(Grid)`
    position: relative;
    width: 100%;
    background: var(--color-box);
    border-radius: ${({theme}) => theme.unit}px;
` as typeof Grid



const StyledBtnGroupWrapper = styled(Box)`
  position: absolute;
  z-index: 99;
  top: ${({theme}) => theme.unit}px;
  width: 100%;
` as typeof Box


const MyLiquidity: any = withTranslation('common')(
    <R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>
    ({t, ammActivityMap, ...rest}:
         WithTranslation &
         { ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined }
    ) => {
        const [chartPeriod, setChartPeriod] = React.useState('ALL');
        const [page, setPage] = React.useState(1);
        const {currency} = useSettings();
        const history = useHistory()

        const JumpToLiqudity = React.useCallback((pair, type) => {
            if (history) {
                history.push(`/liquidity/pools/coinPair/${pair}?type=${type}`)
            }
        }, [history])

        const _handlePageChange = React.useCallback((page: number) => {
            setPage(page);
        }, [])

        const {myAmmMarketArray, summaryReward, myPoolRow} = useOverview({ammActivityMap});
        return (
            <>
                <Grid container spacing={2}>
                    <Grid item sm={3}>
                        <StyleWrapper container paddingY={3} paddingX={4} margin={0} display={'flex'} flexDirection={'column'}>
                            <Grid display={'flex'} flexDirection={'column'} item>
                                <Typography variant={'h5'}
                                            color={'textSecondary'} fontFamily={'Roboto'}>{t('labelTotalPositionValue')}</Typography>
                                <Typography variant={'h3'} marginTop={1} fontFamily={'Roboto'}>
                                    {summaryReward === undefined ? EmptyValueTag : currency === Currency.dollar ? PriceTag.Dollar
                                        + getThousandFormattedNumbers(summaryReward.rewardDollar !== undefined? summaryReward.rewardDollar : 0)
                                        + getThousandFormattedNumbers( summaryReward.feeDollar !== undefined?summaryReward.feeDollar : 0)
                                        : PriceTag.Yuan + getThousandFormattedNumbers(summaryReward.rewardYuan ? summaryReward.rewardYuan : 0)
                                            +  getThousandFormattedNumbers(summaryReward.feeYuan ? summaryReward.feeYuan : 0)}
                                </Typography>
                            </Grid>
                            <Grid display={'flex'} flexDirection={'column'} marginTop={5} item>
                                <Typography variant={'h5'} component={'h3'} fontFamily={'Roboto'}
                                            color={'textSecondary'}>{t('labelFeeRewards')}</Typography>
                                <Typography variant={'h3'} marginTop={1} fontFamily={'Roboto'}>
                                    {summaryReward === undefined ? EmptyValueTag : currency === Currency.dollar ? PriceTag.Dollar
                                        + getThousandFormattedNumbers(summaryReward.feeDollar ? summaryReward.feeDollar : 0)
                                        : PriceTag.Yuan
                                        + getThousandFormattedNumbers(summaryReward.feeYuan ? summaryReward.feeYuan : 0)}
                                </Typography>
                            </Grid>
                            <Grid display={'flex'} flexDirection={'column'} marginTop={5} item>
                                <Typography variant={'h5'} component={'h3'} fontFamily={'Roboto'}
                                            color={'textSecondary'}>{t('labelMiningRewards')}</Typography>
                                <Typography variant={'h3'} marginTop={1} fontFamily={'Roboto'}>
                                    {summaryReward === undefined ? EmptyValueTag : currency === Currency.dollar ? PriceTag.Dollar
                                        + getThousandFormattedNumbers(summaryReward.rewardDollar ? summaryReward.rewardDollar : 0)
                                        : PriceTag.Yuan
                                        + getThousandFormattedNumbers(summaryReward.rewardYuan ? summaryReward.rewardYuan : 0)}
                                </Typography>
                            </Grid>
                        </StyleWrapper>
                    </Grid>
                    <Grid item xs={9}>
                        <StylePaper />
                    </Grid>
                </Grid>

                {/*<StyleWrapper container marginY={2} height={340}>*/}
                {/*    <StyledBtnGroupWrapper display={'flex'} padding={3} justifyContent={'space-between'}>*/}
                {/*        <Typography variant={'body1'} component={'h5'}*/}
                {/*                    color={'textSecondary'}>{t('labelLiquidityValue')}</Typography>*/}
                {/*        <Box marginRight={-1}>*/}
                {/*            <ToggleButtonGroup exclusive size="small" {...{*/}
                {/*                ...rest,*/}
                {/*                t,*/}
                {/*                data: toggleData,*/}
                {/*                value: chartPeriod,*/}
                {/*                setValue: setChartPeriod*/}
                {/*            }} />*/}
                {/*        </Box>*/}
                {/*    </StyledBtnGroupWrapper>*/}
                {/*    <ScaleAreaChart type={ChartType.Trend} data={[]}/>*/}
                {/*</StyleWrapper>*/}
                
                <TableWrapStyled marginY={2} paddingY={2} paddingX={3} flex={1}>
                    <Grid item xs={12} display={'flex'} flexDirection={'column'}>
                        <Typography variant={'h5'} marginBottom={3}>{t('labelMyAmm')}</Typography>
                        <MyPoolTable
                            rawData={myPoolRow}
                            // pagination={{pageSize: 10}}
                            handleDeposit={(row: any) => {
                                const pair = `${row.ammDetail.coinAInfo.name}-${row.ammDetail.coinBInfo.name}`
                                JumpToLiqudity(pair, 'add')
                            }}
                            handleWithdraw={(row: any) => {
                                const pair = `${row.ammDetail.coinAInfo.name}-${row.ammDetail.coinBInfo.name}`
                                JumpToLiqudity(pair, 'remove')
                            }}
                            handlePageChange={() => {
                            }}
                        />
                    </Grid>
                </TableWrapStyled>
                {/* <Typography paddingLeft={2} variant={'h5'}>{t('labelMyAmmRecord')}</Typography> */}
                {/* <TableWrapStyled container marginTop={2}  paddingBottom={2} flex={1}>
                    <Grid item xs={12} display={'flex'} flexDirection={'column'}>
                        <AmmRecordTable rawData={myAmmMarketArray} handlePageChange={_handlePageChange} page={page}/>
                    </Grid>
                </TableWrapStyled> */}
            </>
        )
    })
    
export default MyLiquidity
