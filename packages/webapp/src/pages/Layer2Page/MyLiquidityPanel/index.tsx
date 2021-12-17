import React from 'react'
import styled from '@emotion/styled'
import { Box, Divider, Grid, Typography } from '@mui/material'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { MyPoolTable, useSettings } from '@loopring-web/component-lib'
import {  EmptyValueTag, PriceTag, getValuePrecisionThousand } from '@loopring-web/common-resources';

import { AmmPoolActivityRule, LoopringMap, Currency } from '@loopring-web/loopring-sdk';
import { useOverview } from './hook';
import { useSystem } from 'stores/system'
import { TableWrapStyled } from 'pages/styled'
import { useAmmActivityMap } from 'stores/Amm/AmmActivityMap'



const StyleWrapper = styled(Grid)`
    position: relative;
    width: 100%;
    background: var(--color-box);
    border-radius: ${({theme}) => theme.unit}px;
` as typeof Grid


const MyLiquidity: any = withTranslation('common')(
    <R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>
    ({t, /* ammActivityMap, */ ...rest}:
         WithTranslation &
         { ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined }
    ) => {
        const {ammActivityMap} = useAmmActivityMap()
        const {currency} = useSettings();
        const {forex,allowTrade} = useSystem()
        const history = useHistory()


        const JumpToLiqudity = React.useCallback((pair, type) => {
            if (history) {
                history.push(`/liquidity/pools/coinPair/${pair}?type=${type}`)
            }
        }, [history])

        const {summaryReward, myPoolRow, showLoading} = useOverview({ammActivityMap});
        const totalValueDollar = myPoolRow.map((o: any) => {
            return o.totalAmmValueDollar as number
        }).reduce((a, b) => a + b, 0)
        const totalRewardDollar = myPoolRow.map(o => o.feeDollar).reduce((a, b) => (a || 0) + (b || 0), 0)

        const renderPositionValueDollar = PriceTag.Dollar + getValuePrecisionThousand(totalValueDollar, undefined, undefined, undefined, true, { isFait: true, floor: true })
        const renderPositionValueYuan = PriceTag.Yuan + getValuePrecisionThousand(totalValueDollar * (forex || 6.5), undefined, undefined, undefined, true, { isFait: true, floor: true })
        const renderRewardsDollar = PriceTag.Dollar + getValuePrecisionThousand((totalRewardDollar || 0), undefined, undefined, undefined, true, { isFait: true, floor: true })
        const renderRewardsYuan = PriceTag.Yuan + getValuePrecisionThousand((totalRewardDollar || 0) * (forex || 6.5), undefined, undefined, undefined, true, { isFait: true, floor: true })

        return (
            <>
                <Grid container spacing={2} >
                    <Grid item sm={12} >
                        <StyleWrapper container className={'MuiPaper-elevation2'} paddingY={3} paddingX={4} margin={0} display={'flex'}>
                            <Grid item display={'flex'} flexDirection={'column'} sm={3}>
                                <Typography variant={'h5'}
                                            color={'textSecondary'}
                                            fontFamily={'Roboto'}>{t('labelTotalPositionValue')}</Typography>
                                <Typography variant={'h3'} marginTop={1} fontFamily={'Roboto'}>
                                    {summaryReward === undefined ? EmptyValueTag : currency === Currency.usd
                                        ? renderPositionValueDollar
                                        : renderPositionValueYuan}
                                </Typography>
                            </Grid>
                            <Grid item marginRight={6}>
                                <Divider orientation={'vertical'}/>
                            </Grid>
                            <Grid item display={'flex'} flexDirection={'column'} sm={3}>
                                <Typography variant={'h5'} component={'h3'} fontFamily={'Roboto'}
                                            color={'textSecondary'}>{t('labelFeeRewards')}</Typography>
                                <Typography variant={'h3'} marginTop={1} fontFamily={'Roboto'}>
                                    {summaryReward === undefined ? EmptyValueTag : currency === Currency.usd 
                                        ? renderRewardsDollar
                                        : renderRewardsYuan
                                    }
                                </Typography>
                            </Grid>
                        </StyleWrapper>
                    </Grid>

                </Grid>
                <TableWrapStyled className={'table-divide-short MuiPaper-elevation2'} marginY={2} paddingY={2} paddingX={3} flex={1}>
                    <Grid item xs={12} display={'flex'} flexDirection={'column'} flex={1}>
                        <Typography variant={'h5'} marginBottom={3}>{t('labelMyAmm')}</Typography>
                        <MyPoolTable
                            allowTrade={allowTrade}
                            rawData={myPoolRow}
                            pagination={{pageSize: 10}}
                            showloading={showLoading}
                            currency={currency}
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
            </>
        )
    })

export default MyLiquidity
