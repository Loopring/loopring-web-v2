import { useCallback, useEffect, useRef, useState } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { PriceTag } from '@loopring-web/common-resources'
import { Box, Paper, Typography } from '@material-ui/core'
import styled from '@emotion/styled'
import { useHistory } from 'react-router-dom'
import {
    AssetsTable,
    AssetTitle,
    AssetTitleProps,
    ChartType,
    DoughnutChart,
    ScaleAreaChart,
    ToggleButtonGroup,
    LpTokenAction,
} from '@loopring-web/component-lib'
import { unit } from '@loopring-web/common-resources'

import { useModals } from 'hooks/useractions/useModals'

import store from 'stores'
import { StylePaper } from 'pages/styled'
import { useGetAssets } from './hook'

const StyledChartWrapper = styled(Box)`
    height: 225px;

    > section {
        //position: relative;
        //width: calc(50% - 6px);
        //height: 100%;
        background: var(--color-box);
        border-radius: ${({theme}) => theme.unit}px;
        padding: ${({theme}) => theme.unit * 2.5}px ${({theme}) => theme.unit * 3}px;
    }
`

const ChartWrapper = styled(Box)`
    // background: no-repeat center;
    // background-color: red;
    // background-image: url('chartsDefaultDark.png');
`

const StyledBtnGroupWrapper = styled(Box)`
    position: absolute;
    z-index: 10;
    right: ${({theme}) => theme.unit * 3}px;
    bottom: ${({theme}) => theme.unit * 2.5}px;
`

const toggleData = [
    // {value: '24 H', key: '24 H'},
    {value: 'week', key: '1 W'},
    {value: 'all', key: 'ALL'},
]

export type ITokenInfoItem = {
    token: string,
    detail: {
        price: string,
        symbol: string,
        updatedAt: number
    }
}

export type TrendDataItem = {
    timeStamp: number;
    close: number;
}

const AssetPanel = withTranslation('common')(({t, ...rest}: WithTranslation) => {
    const container = useRef(null);
    const [pageSize, setPageSize] = useState(10);
    const [chartPeriod, setChartPeriod] = useState('week')

    const { formattedDoughnutData, assetsRawData, formattedData, chartData, marketArray } = useGetAssets()
    const { walletLayer2 } = store.getState().walletLayer2;

    useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 120) / 44) - 1);
        }
    }, [container, pageSize]);

    const getTokenRelatedMarketArray = useCallback((token: string) => {
        if (!marketArray) return []
        return marketArray.filter(market => {
            const [coinA, coinB] = market.split('-')
            return (token === coinA) || (token === coinB)
        })
    }, [marketArray])

    const {
        showDeposit,
        showTransfer,
        showWithdraw,
    } = useModals()

    let history = useHistory();

    const onShowDeposit = useCallback((token?: any) => {
        showDeposit(true)
    }, [showDeposit])

    const onShowTransfer = useCallback((token?: any) => {
        showTransfer(true)
    }, [showTransfer])

    const onShowWithdraw = useCallback((token?: any) => {
        showWithdraw(true)
    }, [showWithdraw])

    const lpTokenJump = useCallback((token: string, type: LpTokenAction) => {
        if (history) {
            history.push(`/liquidity/pools/coinPair/${token}?type=${type}`)
        }
    }, [history])

    const AssetTitleProps: AssetTitleProps = {
        assetInfo: {
            totalAsset: formattedData.map(o => o.value).reduce((prev, next) => {
                return prev + next
            }, 0),
            priceTag: PriceTag.Dollar,
        },
        onShowDeposit,
        onShowTransfer,
        onShowWithdraw,
    }

    return (
        <>
            <Box>
                <AssetTitle  {...{
                    t,
                    ...rest,
                    ...AssetTitleProps
                }} />
            </Box>

            {/*<div className="title">{t('labelAssetsTitle')}</div>*/}

            <StyledChartWrapper flexDirection={'row'} display={'flex'} justifyContent={'space-between'} alignItems={'stretch'} marginTop={2}>
                <Box flex={1}  component={'section'} className={'MuiPaper-elevation2'} marginRight={2}>
                        <Typography component="span" color="textSecondary" variant="body1">{t('labelAssetsDistribution')}</Typography>
                        <DoughnutChart data={walletLayer2 ? formattedDoughnutData : []}/>
                </Box>
                <Box display={'flex'} flexDirection={'column'} flex={1} component={'section'} className={'MuiPaper-elevation2'}>
                    <Typography component="span"  color="textSecondary" variant="body1">{t('labelTotalAssets')}</Typography>
                    <ChartWrapper flex={1} component={'div'} />

                </Box>
            </StyledChartWrapper>
            <StylePaper marginTop={2} ref={container} className={'MuiPaper-elevation2'}>
                <Box className="tableWrapper">
                    <AssetsTable {...{
                        rawData: assetsRawData,
                        pagination: {
                            pageSize: pageSize
                        },
                        showFiliter: true,
                        onShowDeposit: onShowDeposit,
                        onShowTransfer: onShowTransfer,
                        onShowWithdraw: onShowWithdraw,
                        onLpDeposit: lpTokenJump,
                        onLpWithdraw: lpTokenJump,
                        getMakretArrayListCallback: getTokenRelatedMarketArray,
                        ...rest
                    }} />
                </Box>
            </StylePaper>
        </>
    )
})

export default AssetPanel
