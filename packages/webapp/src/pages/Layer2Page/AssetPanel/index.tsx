import { useCallback, useRef } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { PriceTag } from '@loopring-web/common-resources'
import { Box, Grid, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { useHistory } from 'react-router-dom'
import {
    AssetsTable,
    AssetTitle,
    AssetTitleProps,
    DoughnutChart,
    LpTokenAction,
    useSettings,
} from '@loopring-web/component-lib'

import { useModals } from 'hooks/useractions/useModals'

import store from 'stores'
import { StylePaper } from 'pages/styled'
import { useGetAssets } from './hook'
import { Currency } from '@loopring-web/loopring-sdk';
import { useSystem } from 'stores/system';
import { useAccount } from 'stores/account';

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
const StyleTitlePaper = styled(Box)`
  width: 100%;
  //height: 100%;
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`


const ChartWrapper = styled(Box)`
    background-image: url('https://static.loopring.io/assets/images/${({ dark }: any) => dark === 'true' ? 'noDataDark' : 'noDataLight'}.png');
    background-repeat: no-repeat;
` as any

// const StyledBtnGroupWrapper = styled(Box)`
//     position: absolute;
//     z-index: 10;
//     right: ${({theme}) => theme.unit * 3}px;
//     bottom: ${({theme}) => theme.unit * 2.5}px;
// `
//
// const toggleData = [
//     // {value: '24 H', key: '24 H'},
//     {value: 'week', key: '1 W'},
//     {value: 'all', key: 'ALL'},
// ]

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
    // const [pageSize, setPageSize] = useState(10);
    // const [chartPeriod, setChartPeriod] = useState('week')
    const {allowTrade} = useSystem();
    const { account: { accountId } } = useAccount();
    const {marketArray, assetsRawData} = useGetAssets()
    const {currency, themeMode, setHideL2Assets, setHideLpToken, setHideSmallBalances} = useSettings()
    const {walletLayer2} = store.getState().walletLayer2;
    const { hideL2Assets, hideLpToken, hideSmallBalances } = store.getState().settings

    const total = assetsRawData.map(o => o.tokenValueDollar).reduce((a, b) => a + b, 0)
    
    const percentList = assetsRawData.map(o => ({
        ...o,
        value: (o.tokenValueDollar && total) ? o.tokenValueDollar / total : 0,
    }))

    const lpTotalData = percentList
        .filter(o => o.token.value.split('-')[ 0 ] === 'LP')
        .reduce((prev, next) => ({
            name: 'LP-Token',
            value: prev.value + next.value
        }), {
            name: 'LP-Token',
            value: 0
        })

    const formattedDoughnutData = percentList.filter(o => o.token.value.split('-')[ 0 ] === 'LP').length > 0
        ? [...percentList.filter(o => o.token.value.split('-')[ 0 ] !== 'LP'), lpTotalData]
        : percentList

    // useEffect(() => {
    //     // @ts-ignore
    //     let height = container?.current?.offsetHeight;
    //     if (height) {
    //         setPageSize(Math.floor((height - 120) / 44) - 1);
    //     }
    // }, [container, pageSize]);

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
        showDeposit({isShow: true, symbol: token})
    }, [showDeposit])

    const onShowTransfer = useCallback((token?: any) => {
        showTransfer({isShow: true, symbol: token})
    }, [showTransfer])

    const onShowWithdraw = useCallback((token?: any) => {
        showWithdraw({isShow: true, symbol: token})
    }, [showWithdraw])

    const lpTokenJump = useCallback((token: string, type: LpTokenAction) => {
        if (history) {
            history.push(`/liquidity/pools/coinPair/${token}?type=${type}`)
        }
    }, [history])

    const AssetTitleProps: AssetTitleProps = {
        assetInfo: {
            totalAsset: assetsRawData.map(o => currency === Currency.usd ? o.tokenValueDollar : o.tokenValueYuan).reduce((prev, next) => {
                return prev + next
            }, 0),
            priceTag: currency === Currency.usd ? PriceTag.Dollar : PriceTag.Yuan,
        },
        accountId,
        hideL2Assets,
        onShowDeposit,
        onShowTransfer,
        onShowWithdraw,
        setHideL2Assets,
    }

    return (
        <>
            <StyleTitlePaper paddingX={3} paddingY={5/2} className={'MuiPaper-elevation2'} >
                <AssetTitle  {...{
                    t,
                    ...rest,
                    ...AssetTitleProps,
                }} />
            </StyleTitlePaper>

            {/*<div className="title">{t('labelAssetsTitle')}</div>*/}

            <StyledChartWrapper flexDirection={'row'} display={'flex'} justifyContent={'space-between'}
                                alignItems={'stretch'} marginTop={2}>
                <Box flex={1} component={'section'} className={'MuiPaper-elevation2'} marginRight={2}>
                    <Typography component="span" color="textSecondary"
                                variant="body1">{t('labelAssetsDistribution')}</Typography>
                    <DoughnutChart data={walletLayer2 ? formattedDoughnutData : []}/>
                </Box>
                <Box display={'flex'} flexDirection={'column'} flex={1} component={'section'}
                     className={'MuiPaper-elevation2'}>
                    <Typography component="span" color="textSecondary"
                                variant="body1">{t('labelTotalAssets')}</Typography>
                    <ChartWrapper marginTop={2} dark={themeMode === 'dark' ? 'true' : 'false'} flex={1} component={'div'}/>
                </Box>
            </StyledChartWrapper>
            <StylePaper marginTop={2} ref={container} className={'MuiPaper-elevation2'}>
                <Box className="tableWrapper table-divide-short">
                    <AssetsTable {...{
                        rawData: assetsRawData,
                        // pagination: {
                        //     pageSize: pageSize
                        // },
                        showFilter: true,
                        allowTrade,
                        onShowDeposit: onShowDeposit,
                        onShowTransfer: onShowTransfer,
                        onShowWithdraw: onShowWithdraw,
                        onLpDeposit: lpTokenJump,
                        onLpWithdraw: lpTokenJump,
                        getMarketArrayListCallback: getTokenRelatedMarketArray,
                        hideLpToken, 
                        hideSmallBalances,
                        setHideLpToken, 
                        setHideSmallBalances,
                        ...rest
                    }} />
                </Box>
            </StylePaper>
        </>
    )
})

export default AssetPanel
