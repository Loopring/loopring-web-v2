import { useCallback, useEffect, useRef, useState } from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { PriceTag } from '@loopring-web/component-lib/src/static-resource'
import { Box, Paper, Typography } from '@material-ui/core'
import styled from '@emotion/styled'
import {
    AssetsTable,
    AssetTitle,
    AssetTitleProps,
    ChartType,
    DoughnutChart,
    ScaleAreaChart,
    ToggleButtonGroup,
    TokenType,
} from '@loopring-web/component-lib'
import { useModals } from 'hooks/modal/useModals'
// import { useGetUserBalances } from 'hooks/exchange/useUserAPI'
import { useGetTokens } from 'hooks/exchange/useExchangeAPI'
import { volumeToCount } from 'hooks/help'
import { LoopringAPI } from 'stores/apis/api'
import { AssetType } from 'loopring-sdk'
import store from 'stores'
import { useWalletLayer1 } from 'stores/walletLayer1'
import { makeWallet } from 'hooks/help'
import { EmptyValueTag,unit } from '@loopring-web/component-lib/src/static-resource'
import { StylePaper } from '../../styled'

// const StylePaper = styled(Box)`
//   width: 100%;
//   height: 100%;
//   flex: 1;
//   background-color: ${({theme}) => theme.colorBase.background().default};
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
        background-color: ${({theme}) => theme.colorBase.background().default};
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
    
    const { accAddr } = store.getState().account
    const { walletLayer2 } = store.getState().walletLayer2;
    const { ammMap } = store.getState().amm.ammMap
    const walletMap = makeWallet()
    const assetsKeyList = walletMap && walletMap.walletMap ? Object.keys(walletMap.walletMap) : []
    const assetsDetailList = walletMap && walletMap.walletMap ? Object.values(walletMap.walletMap) : []
    const assetsList = assetsKeyList.map((key, index) => ({
        token: key,
        detail: assetsDetailList[index]
    }))

    const getUserTotalAssets = useCallback(async (limit: number = 7) => {
        const userAssets = await LoopringAPI.walletAPI?.getUserAssets({
            wallet: accAddr,
            assetType: AssetType.DEX,
            limit: limit // TODO: minium unit is day, discuss with pm later
        })
        if (userAssets && userAssets.userAssets.length && !!userAssets.userAssets.length) {
            setChartData(userAssets.userAssets.map(o => ({
                timeStamp: Number(o.createdAt),
                close: Number(o.amount)
            })))
        }
    }, [accAddr])

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
        ShowDeposit,
        ShowTransfer,
        ShowWithdraw,
        ShowResetAccount,
    } = useModals()

    const { updateWalletLayer1 } = useWalletLayer1()

    const onShowDeposit = useCallback(() => {
        updateWalletLayer1()
        ShowDeposit(true)
    }, [ShowDeposit, updateWalletLayer1])

    const onShowTransfer = () => {
        ShowTransfer(true)
    }

    const onShowWithdraw = () => {
        ShowWithdraw(true)
    }

    const handleChartPeriodChange = useCallback((event: React.MouseEvent<HTMLElement, MouseEvent>, newValue: string) => {
        const limit = newValue === 'week' ? 7 : 9999
        getUserTotalAssets(limit)
    }, [getUserTotalAssets])

    // const { tokens: tokensAll } = useGetTokens()

    // const tokens = tokensAll?.tokenSymbolMap

    // const { balances } = useGetUserBalances(tokens)

    // const { walletLayer2 } = store.getState().walletLayer2;
    const { faitPrices } = store.getState().system

    const tokenPriceList = faitPrices ? Object.entries(faitPrices).map(o => ({
        token: o[ 0 ],
        detail: o[ 1 ]
    })) as ITokenInfoItem[] : []

    let jointLPTokenValue = 0
    assetsList.filter(o => o.token.split('-')[0] === 'LP').forEach(o => {
        const result = o.token.split('-')
        result.splice(0, 1, 'AMM')
        const ammToken = result.join('-')
        const ammTokenList = Object.keys(ammMap)
        const tokenValue = ammTokenList.includes(ammToken) && ammMap[ammToken] ? Number(ammMap[ammToken].amountDollar) : 0
        jointLPTokenValue += tokenValue
    });

    const doughnutData = assetsList.filter(o => o.token.split('-')[0] !== 'LP').map((tokenInfo) => {
        const tokenPriceUSDT = tokenInfo.token === 'DAI' ? 1 : Number(tokenPriceList.find(o => o.token === tokenInfo.token)?.detail.price) / Number(tokenPriceList.find(o => o.token === 'USDT')?.detail.price)
        return ({
            name: tokenInfo.token,
            value: Number(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail?.total as string)) * tokenPriceUSDT
        })
    })
    const formattedDoughnutData = [...doughnutData, {
            name: 'LP-Token',
            value: jointLPTokenValue
        }]
    const AssetTitleProps: AssetTitleProps = {
        assetInfo: {
            totalAsset: formattedDoughnutData.map(o => o.value).reduce((prev, next) => {
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
                    <Typography component="span" color="textSecondary" variant="body1">Asset Distribution</Typography>
                    <DoughnutChart data={walletLayer2 ? formattedDoughnutData : []}/>
                </Paper>
                <Paper component={'div'}>
                    <Typography component="span" color="textSecondary" variant="body1">Total Assets</Typography>
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
                        ...rest
                    }} />
                </div>
            </StylePaper>
        </>
    )
})

export default AssetPanel
