import styled from '@emotion/styled';
import { Meta, Story } from '@storybook/react/types-6-0';
import { MemoryRouter } from 'react-router-dom';
import { Grid, Typography } from '@material-ui/core';
import { AmmCardProps, CoinInfo, FloatTag, LockIcon, PriceTag, UnLockIcon, WalletStatus } from '@loopring-web/common-resources';
import { coinMap, CoinType } from '../../static';
import { withTranslation } from 'react-i18next';
import { AccountInfo, BtnWalletConnect } from '../index';
import { AccountInfoProps, AssetTitle, AssetTitleProps, TradeTitle } from './';
import { useDispatch } from 'react-redux';
import { setShowDeposit, setShowTransfer, setShowWithdraw } from '../../stores';
import { SettingPanel } from './SettingPanel';
import { MarketBlock } from './MarketBlock';
// import { PoolDetailTitle } from './PoolDetailTitle';
import { AmmCard } from './AmmCard';
import React from 'react';
import { Button } from '@material-ui/core/';


const Style = styled.div`
  background: ${({theme}) => theme.colorBase.background().bg};
  color: #fff;
  height: 100%;
  flex: 1
`
const ConnectButtonWrap = withTranslation('common')((rest: any) => {
    return <>
        <Grid item xs={3}><BtnWalletConnect {...rest} status={WalletStatus.default} handleClick={() => {
        }} label={'Connect Wallet'} wait={200}></BtnWalletConnect></Grid>
        <Grid item xs={3}><BtnWalletConnect {...rest} status={WalletStatus.disabled} handleClick={() => {
        }} label={'Connect Wallet'} wait={200}></BtnWalletConnect></Grid>
        <Grid item xs={3}><BtnWalletConnect {...rest} status={WalletStatus.loading} handleClick={() => {
        }} label={'xxxxx....xxxx'} wait={200}></BtnWalletConnect></Grid>
        <Grid item xs={3}><BtnWalletConnect {...rest} status={WalletStatus.noAccount} handleClick={() => {
        }} label={'xxxxx....xxxx'} wait={200}></BtnWalletConnect></Grid>
        <Grid item xs={3}><BtnWalletConnect {...rest} status={WalletStatus.accountPending} handleClick={() => {
        }} label={'xxxxx....xxxx'} wait={200}></BtnWalletConnect></Grid>
        <Grid item xs={3}><BtnWalletConnect {...rest} status={WalletStatus.connect} handleClick={() => {
        }} label={'xxxxx....xxxx'} wait={200}></BtnWalletConnect></Grid>
        <Grid item xs={3}><BtnWalletConnect {...rest} status={WalletStatus.unlock} handleClick={() => {
        }} label={'xxxxx....xxxx'}
                                            wait={200}></BtnWalletConnect></Grid>
        <Grid item xs={3}><BtnWalletConnect {...rest} status={WalletStatus.noNetwork} handleClick={() => {
        }} label={'xxxxx....xxxx'}
                                            wait={200}></BtnWalletConnect></Grid>
    </>
})


const TradeTitleWrap = withTranslation('common')((rest) => {
    // let tradeData: any = {sell: {belong: undefined}, buy: {belong: undefined}};
    let props: any = {
        // swapTradeData: tradeData,
        coinAInfo: coinMap.LRC, coinBInfo: coinMap.ETH
    }
    return <>
        <Grid item>
            <TradeTitle  {...{
                ...rest, ...props
            }} /></Grid>
        <Grid item>
            <TradeTitle  {...{
                ...rest,
                ...props, tradeFloat: {priceDollar: +123, priceYuan: 2343232, change: '+15%', timeUnit: "24h"}
            }} /></Grid>
        <Grid item> <TradeTitle  {...{
            ...rest, ...props, tradeFloat: {priceDollar: -123, priceYuan: -2343232, change: '-15%', timeUnit: "24h"}
        }} /></Grid>

    </>
})
// const PoolDetailTitleWrap = withTranslation('common')((rest) => {
//     // let tradeData: any = {sell: {belong: undefined}, buy: {belong: undefined}};
//     let ammProps: any = {
//         // swapTradeData: tradeData,
//         ammCalcData,
//     }
//     return <>
//         <Grid item> <PoolDetailTitle  {...{
//             ...rest, ...ammProps,
//         }} /></Grid>
//         <Grid item> <PoolDetailTitle  {...{
//             ...rest, ...{
//                 ...ammProps,
//                 // swapTradeData: {sell: {belong: 'ETH'}, buy: {belong: 'LRC'}}
//             }, tradeFloat: {priceDollar: +123, priceYuan: 2343232, change: '+15%', timeUnit: "24h"}
//         }} /></Grid>
//         <Grid item> <PoolDetailTitle  {...{
//             ...rest, ...{
//                 ...ammProps,
//                 // swapTradeData: {sell: {belong: 'ETH'}, buy: {belong: 'LRC'}}
//             }, tradeFloat: {priceDollar: -123, priceYuan: -2343232, change: '-15%', timeUnit: "24h"}
//         }} /></Grid>
//
//     </>
// })

const AmmCardWrap = () => {
    const ref = React.createRef();
    const ammInfo: AmmCardProps<CoinType> = {
        handleClick(): void {
        },
        // ammCalcData,
        coinAInfo: coinMap.ETH as CoinInfo<CoinType>,
        coinBInfo: coinMap.LRC as CoinInfo<CoinType>,
        activity: {
            totalRewards: 241232132,
            myRewards: 1232.123,
            rewardToken: coinMap.ETH as CoinInfo<CoinType>,
            duration: {
                from: new Date('2021-1-1'),
                to: new Date()
            },
        },
        APY: 56,
        tradeFloat: {
            priceDollar: 123,
            priceYuan: 2343232,
            change: '0%',
            timeUnit: "24h",
            volume: Number('112312312'),
            floatTag: FloatTag.none
        },
        amountDollar: 197764.89,
        amountYuan: 194.89,
        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,
        rewardToken: 'LRC',
        rewardValue: 13,
        feeA: 121,
        feeB: 1232,
        isNew: true,
        isActivity: false
    }

    return <AmmCard ref={ref} {...{...ammInfo}} ></AmmCard>
}


const MarketWrap = withTranslation('common')((rest) => {
    let props: any = {
        ...rest,
        coinAInfo: coinMap.ETH,
        coinBInfo: coinMap.LRC,
        tradeFloat: {
            priceDollar: +123,
            priceYuan: 2343232, change: '+15%', timeUnit: "24h",
            volume: '112312312 USBD',
            floatTag: FloatTag.increase
        },
    }
    const RowStyled = styled(Grid)`
      & .MuiGrid-root:not(:last-of-type) > div {
        margin-right: ${({theme}) => theme.unit * 3}px;
      }
    ` as typeof Grid
    return <>
        <RowStyled container>
            <Grid item xs={3}>
                <MarketBlock {...{...props}}></MarketBlock>
            </Grid>
            <Grid item xs={3}>
                <MarketBlock {...{
                    ...props,
                    tradeFloat: {
                        priceDollar: 123,
                        priceYuan: 2343232,
                        change: '0%',
                        timeUnit: "24h",
                        volume: '112312312 USBD',
                        floatTag: FloatTag.none
                    }
                }}></MarketBlock>
            </Grid>
            <Grid item xs={3}>
                <MarketBlock {...{
                    ...props,
                    tradeFloat: {
                        priceDollar: 123,
                        priceYuan: 2343232,
                        change: '-15%',
                        timeUnit: "24h",
                        volume: '112312312 USBD',
                        floatTag: FloatTag.decrease
                    }
                }}></MarketBlock>
            </Grid>
            <Grid item xs={3}>
                <MarketBlock {...{...props}}></MarketBlock>
            </Grid>
        </RowStyled>

    </>
})

const AccountInfoWrap = (rest: any) => {
    const accountInfoProps: AccountInfoProps = {
        address: '0x123567243o24o24242dsdsd3098784',
        addressShort: '0x12...8784',
        level: 'VIP 1',
        etherscanLink: 'https://material-ui.com/components/material-icons/',
        connectBy: 'MetaMask',
        // mainBtn: <Button variant={'contained'} size={'small'} color={'primary'} onClick={() => console.log('my event')}>My
        //     button</Button>
    }
    return <>
        <Grid item xs={6}>
            <AccountInfo  {...{
                ...rest,
                ...accountInfoProps
            }} />
        </Grid>
        <Grid item xs={6}>
            <AccountInfo  {...{
                ...rest,
                ...accountInfoProps,
                mainBtn: <>
                    <Button className={'unlock'} startIcon={<LockIcon fontSize={'large'}/>} variant={'outlined'}>
                        <Typography variant={'body2'} marginTop={1 / 2}> {'unLock'} </Typography>
                    </Button>
                    <Button className={'lock'} startIcon={<UnLockIcon fontSize={'large'}/>} variant={'outlined'}>
                        <Typography variant={'body2'} marginTop={1 / 2}> {'Lock'} </Typography>
                    </Button>
                </>
            }} />
        </Grid>

    </>
}
const SettingPanelWrap = (_rest: any) => {
    return <SettingPanel/>
}

const AssetTitleWrap = (rest: any) => {
    const dispatch = useDispatch();
    const AssetTitleProps: AssetTitleProps = {
        assetInfo: {
            totalAsset: 123456.789,
            priceTag: PriceTag.Dollar,
        },
        onShowWithdraw: () => dispatch(setShowDeposit({
            isShow: true, props: {
                title: 'Demo change title props'
            }
        })),
        onShowTransfer: () => dispatch(setShowTransfer({isShow: true})),
        onShowDeposit: () => dispatch(setShowWithdraw({isShow: true})),
    }
    return <>
        <Grid item xs={12}>
            <AssetTitle  {...{
                ...rest,
                ...AssetTitleProps
            }} />
        </Grid>
    </>
}
const Template: Story<any> = () => {
    return <Style> <MemoryRouter initialEntries={['/']}>
        <h4>MarketWrap row</h4>
        <MarketWrap/>

        <h4>Trade Title</h4>
        <Grid container spacing={2} alignContent={'center'} justifyContent={'flex-start'} marginBottom={2}>
            <TradeTitleWrap/>
        </Grid>
        {/*<h4>Amm Detail Title</h4>*/}
        {/*<Grid container spacing={2} alignContent={'center'} justifyContent={'flex-start'} marginBottom={2}>*/}
        {/*    <PoolDetailTitleWrap/>*/}
        {/*</Grid>*/}
        <h4>Amm Card</h4>
        <Grid container spacing={2} alignContent={'center'} justifyContent={'flex-start'} marginBottom={2}>
            <Grid item md={3} xs={4} lg={4}>
                <AmmCardWrap/>
            </Grid>
            <Grid item md={3} xs={4} lg={4}>
                <AmmCardWrap/>
            </Grid>
            <Grid item md={3} xs={4} lg={4}>
                <AmmCardWrap/>
            </Grid>

        </Grid>


        <h4>Account Info</h4>
        <Grid container spacing={2} alignContent={'center'} justifyContent={'flex-start'} marginBottom={2}>
            <AccountInfoWrap/>
        </Grid>
        <h4>Asset Title</h4>
        <Grid container spacing={2} alignContent={'center'} justifyContent={'flex-start'} marginBottom={2}>
            <AssetTitleWrap/>
        </Grid>
        <h4>Connect Button status</h4>
        <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'} marginBottom={2}>
            <ConnectButtonWrap/>
        </Grid>
        <h4>Setting Panel</h4>
        <Grid container spacing={2} alignContent={'stretch'} justifyContent={'stretch'} marginBottom={2}>
            <Grid item xs={10}>
                <SettingPanelWrap/>
            </Grid>
        </Grid>

    </MemoryRouter>
    </Style>
};

export default {
    title: 'components/Block',
    component: TradeTitleWrap,
    argTypes: {},
} as Meta

export const BlockStory = Template.bind({});
// SwitchPanel.args = {}

