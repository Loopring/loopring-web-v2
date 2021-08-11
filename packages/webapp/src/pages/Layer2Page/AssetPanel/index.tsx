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
    TokenType,
    LpTokenAction,
} from '@loopring-web/component-lib'
import { useModals } from 'modal/useModals'

import { volumeToCount } from 'hooks/help'
import { LoopringAPI } from 'stores/apis/api'
import { AssetType } from 'loopring-sdk'
import store from 'stores'
import { useWalletLayer1 } from 'stores/walletLayer1'
import { makeWalletLayer2 } from 'hooks/help'
import { useWalletLayer2 } from '../../../stores/walletLayer2'
import { EmptyValueTag,unit } from '@loopring-web/common-resources'
import { StylePaper } from '../../styled'
import { useAccount } from '../../../stores/account';

// const StylePaper = styled(Box)`
//   width: 100%;
//   height: 100%;
//   flex: 1;
//   background: var(--color-box);
//   border-radius: ${({theme}) => theme.unit}px;
// //   padding: 20px;
//
//   .title {
//     font-family: Gilroy-Medium;
//     font-size: ${({theme}) => theme.unit * 3}px;
//     line-height: 19px;
//   }
//
//   .tableWrapper {
//     display: flex;
//     flex: 1;
//     height: 100%;
//     border: 1px solid ${({theme}) => theme.colorBase.borderColor};
//     border-radius: ${({theme}) => theme.unit}px;
//     padding: 26px 0;
//   }
// ` as typeof Box;

const StyledChartWrapper = styled(Box)`
    height: 225px;

    > div {
        position: relative;
        width: calc(50% - 6px);
        height: 100%;
        background: var(--color-box);
        border-radius: ${({theme}) => theme.unit}px;
        padding: ${({theme}) => theme.unit * 2.5}px ${({theme}) => theme.unit * 3}px;
    }
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
    const [chartData, setChartData] = useState<TrendDataItem[]>([])
    const [assetsList, setAssetsList] = useState<any[]>([])
    
    const { account:{accAddress} } = useAccount()
    const { walletLayer2 } = store.getState().walletLayer2;
    const { ammMap } = store.getState().amm.ammMap
    const { status: walletLayer2Status } = useWalletLayer2();

    const getUserTotalAssets = useCallback(async (limit: number = 7) => {
        const userAssets = await LoopringAPI.walletAPI?.getUserAssets({
            wallet: accAddress,
            assetType: AssetType.DEX,
            limit: limit // TODO: minium unit is day, discuss with pm later
        })
        if (userAssets && userAssets.userAssets.length && !!userAssets.userAssets.length) {
            // console.log(userAssets.userAssets)
            setChartData(userAssets.userAssets.map(o => ({
                timeStamp: Number(o.createdAt),
                // close: o.amount && o.amount !== NaN ? Number(o.amount) : 0
                close: Number(o.amount)
            })))
        }
    }, [accAddress])

    useEffect(() => {
        if (walletLayer2Status === 'UNSET') {
            const walletMap = makeWalletLayer2()
            const assetsKeyList = walletMap && walletMap.walletMap ? Object.keys(walletMap.walletMap) : []
            const assetsDetailList = walletMap && walletMap.walletMap ? Object.values(walletMap.walletMap) : []
            const list = assetsKeyList.map((key, index) => ({
                token: key,
                detail: assetsDetailList[index]
            }))
            setAssetsList(list)
        }
    }, [walletLayer2Status])

    useEffect(() => {
        if (LoopringAPI && LoopringAPI.walletAPI && walletLayer2) {
            getUserTotalAssets()
        }
    }, [walletLayer2, getUserTotalAssets])

    useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 120) / 44) - 1);
        }
    }, [container, pageSize]);

    const {
        showDeposit,
        showTransfer,
        showWithdraw,
        // ShowResetAccount,
    } = useModals()

    // const { updateWalletLayer1 } = useWalletLayer1()

    let history = useHistory();

    const onShowDeposit = useCallback((token?: any) => {
        // updateWalletLayer1()
        showDeposit(true, {
            tradeData: {
                balance: '',
                belong: token
            },
        })
    }, [showDeposit])

    const onShowTransfer = useCallback((token?: any) => {
        showTransfer(true, {
            tradeData: {
                balance: '',
                belong: token
            },
        })
    }, [showTransfer])

    const onShowWithdraw = useCallback((token?: any) => {
        showWithdraw(true, {
            tradeData: {
                balance: '',
                belong: token
            },
        })
    }, [showWithdraw])

    const lpTokenJump = useCallback((token: string, type: LpTokenAction) => {
        if (history) {
            history.push(`/liquidity/pools/coinPair/${token}?type=${type}`)
        }
    }, [history])

    const handleChartPeriodChange = useCallback((event: React.MouseEvent<HTMLElement, MouseEvent>, newValue: string) => {
        const limit = newValue === 'week' ? 7 : 9999
        getUserTotalAssets(limit)
    }, [getUserTotalAssets])

    const { faitPrices } = store.getState().system

    const tokenPriceList = faitPrices ? Object.entries(faitPrices).map(o => ({
        token: o[ 0 ],
        detail: o[ 1 ]
    })) as ITokenInfoItem[] : []

    // let jointLPTokenValue = 0
    // assetsList.filter(o => o.token.split('-')[0] === 'LP').forEach(o => {
    //     const result = o.token.split('-')
    //     result.splice(0, 1, 'AMM')
    //     const ammToken = result.join('-')
    //     console.log(ammToken)
    //     const ammTokenList = Object.keys(ammMap)
    //     const tokenValue = ammTokenList.includes(ammToken) && ammMap[ammToken] && ammMap[ammToken].amountDollar ? Number(ammMap[ammToken].amountDollar) : 0
    //     console.log(ammMap)
    //     jointLPTokenValue += tokenValue
    // });

    // const doughnutData = assetsList.filter(o => o.token.split('-')[0] !== 'LP').map((tokenInfo) => {
    //     const tokenPriceUSDT = tokenInfo.token === 'DAI'
    //         ? 1
    //         : Number(tokenPriceList.find(o => o.token === tokenInfo.token) ? tokenPriceList.find(o => o.token === tokenInfo.token)?.detail.price : 0) / Number(tokenPriceList.find(o => o.token === 'USDT')?.detail.price)
    //     return ({
    //         name: tokenInfo.token,
    //         value: Number(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail?.total as string)) * tokenPriceUSDT
    //     })
    // })
    const formattedData = assetsList.map(item => {
        const isLpToken = item.token.split('-')[0] === 'LP'
        if (!isLpToken) {
            const tokenPriceUSDT = item.token === 'DAI'
                ? 1
                : Number(tokenPriceList.find(o => o.token === item.token) ? tokenPriceList.find(o => o.token === item.token)?.detail.price : 0) / Number(tokenPriceList.find(o => o.token === 'USDT')?.detail.price)
            return ({
                name: item.token,
                value: Number(volumeToCount(item.token, item.detail?.detail?.total as string)) * tokenPriceUSDT
            })
        }
        // let jointLPTokenValue = 0
        const result = item.token.split('-')
        result.splice(0, 1, 'AMM')
        const ammToken = result.join('-')
        const ammTokenList = Object.keys(ammMap)
        const ammTokenPrice = ammTokenList.includes(ammToken) && ammMap[ammToken] && ammMap[ammToken].amountDollar ? (ammMap[ammToken].totalLpToken || 0) / ammMap[ammToken].amountDollar : 0
        const tokenValue =  ammTokenPrice * (item.detail?.count || 0)
        // jointLPTokenValue += 1
        return ({
            name: item.token,
            value: tokenValue
        })
    })

    
    const lpTotalData = formattedData
        .filter(o => o.name.split('-')[0] === 'LP')
        .reduce((prev, next) => ({
            name: 'LP-Token',
            value: prev.value + next.value
        }), {
            name: 'LP-Token',
            value: 0
        })
    
    const formattedDoughnutData = formattedData.filter(o => o.name.split('-')[0] === 'LP').length > 0
        ? [...formattedData.filter(o => o.name.split('-')[0] !== 'LP'), lpTotalData]
        : formattedData

    // const formattedDoughnutData = [...doughnutData, {
    //         name: 'LP-Token',
    //         value: jointLPTokenValue
    //     }]
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

    const assetsRawData = assetsList.map((tokenInfo) => {
        
        const tokenPriceUSDT = Number(tokenPriceList.find(o => o.token === tokenInfo.token)?.detail.price) / Number(tokenPriceList.find(o => o.token === 'USDT')?.detail.price)
        return ({
            token: {
                type: tokenInfo.token.split('-')[0] === 'LP' ? TokenType.lp : TokenType.single,
                value: tokenInfo.token
            },
            amount: String(Number(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail.total as string)).toFixed(6)) || EmptyValueTag,
            available: String(tokenInfo.detail?.count) || EmptyValueTag,
            locked: String(tokenInfo.detail?.detail.locked) || EmptyValueTag,
            smallBalance: tokenPriceUSDT * Number(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail.total as string)) < 1,
        })
    })

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

            <StyledChartWrapper display={'flex'} justifyContent={'space-between'} alignItems={'center'} marginTop={2}>
                <Paper component={'div'}>
                    <Typography component="span" color="textSecondary" variant="body1">{t('labelAssetsDistribution')}</Typography>
                    <DoughnutChart data={walletLayer2 ? formattedDoughnutData : []}/>
                </Paper>
                <Paper component={'div'}>
                    <Typography component="span" color="textSecondary" variant="body1">{t('labelTotalAssets')}</Typography>
                    <ScaleAreaChart type={ChartType.Trend} data={chartData}/>
                    <StyledBtnGroupWrapper>
                        <ToggleButtonGroup exclusive size="small" {...{
                            ...rest,
                            t,
                            data: toggleData,
                            value: chartPeriod,
                            setValue: setChartPeriod,
                            onChange: handleChartPeriodChange
                        }} />
                    </StyledBtnGroupWrapper>
                </Paper>
            </StyledChartWrapper>
            <StylePaper style={{marginTop: `${unit*2}px`}}>
                <div className="tableWrapper" ref={container}>
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
                        ...rest
                    }} />
                </div>
            </StylePaper>
        </>
    )
})

export default AssetPanel
