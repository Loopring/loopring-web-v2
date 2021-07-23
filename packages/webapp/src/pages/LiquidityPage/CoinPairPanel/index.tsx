import React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { AmmRecordTable, ChartType, ScaleAreaChart, TradeTitle, useSettings } from '@loopring-web/component-lib';
import {
    AvatarCoinStyled,
    Currency,
    EmptyValueTag,
    getThousandFormattedNumbers,
    PriceTag,
    unit
} from '@loopring-web/common-resources';
import { Avatar, Box, Breadcrumbs, Grid, Link, Typography } from '@material-ui/core';
import { AmmPanelView } from '../AmmPanel';
import moment from 'moment';
import styled from '@emotion/styled/';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { useCoinPair } from './hooks';
import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk/dist/defs/loopring_defs';
import { StylePaper } from 'pages/styled';


//******************** page code ************************//
//  ${({theme}) => theme.border.defaultFrame({c_key: 'blur'})};
const BoxStyled = styled(Box)`
  flex: 1;
  background-color: ${({theme}) => theme.colorBase.background().default};
  border-radius: ${({theme}) => theme.unit}px;
  padding: ${({theme}) => theme.unit * 2}px;
  height: 120px;
  // min-width: 160px;
  max-width: 210px;
  // & .MuiAvatar-root {
    //     height: ${({theme}) => theme.fontDefault.h4};
    //     width: ${({theme}) => theme.fontDefault.h4};
  // }
`;

const BoxTopStyled = styled(Box)`
  background-color: ${({theme}) => theme.colorBase.background().default};
  border-radius: ${({theme}) => theme.unit}px;
  padding: ${({theme}) => theme.unit * 2}px;
  width: var(--swap-box-width);
  box-sizing: border-box;
  //height: 120px;
  //min-width: 160px;
  // & .MuiAvatar-root {
    //   height: ${({theme}) => theme.fontDefault.h4};
    //   width: ${({theme}) => theme.fontDefault.h4};
  // }
`;
// const StyleWrapper = styled(Box)`
//   //position: relative;
//   //width: 100%;
//   background-color: ${({theme}) => theme.colorBase.background().default};
//   border-radius: ${({theme}) => theme.unit}px;
// ` as typeof Grid


const applyProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `tabpanel-${index}`,
    }
}

export const CoinPairPanel = withTranslation('common')(<R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>
({t, ammActivityMap, ...rest}:
     WithTranslation & { ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined } & any) => {    //ActivityMap<I, I>
    const {currency} = useSettings();
    const {
        tradeFloat,
        snapShotData,
        pair,
        coinPairInfo,
        walletMap,
        ammMarketArray,
        myAmmMarketArray,
        myAmm,
        pairHistory,
    } = useCoinPair({ammActivityMap});
    const [tabIndex, setTabIndex] = React.useState<0 | 1>(1);
    const [page, setPage] = React.useState(rest?.page ? rest.page : 1);
    const handleChange = (event: any, newValue: 0 | 1) => {
        setTabIndex(newValue);
        setPage(1);
    }
    const _handlePageChange = React.useCallback((page: number) => {
        setPage(page);
    }, [])
    // const sellIconHasLoaded = useImage(coinPairInfo.myCoinA?.icon ? coinPairInfo.myCoinA?.icon : '').hasLoaded;
    // const buyIconHasLoaded = useImage(coinPairInfo.myCoinB?.icon ? coinPairInfo.myCoinB?.icon : '').hasLoaded;
    const {coinJson} = useSettings();
    const coinAIcon: any = coinJson [ coinPairInfo.myCoinA?.simpleName ];
    const coinBIcon: any = coinJson [ coinPairInfo.myCoinB?.simpleName ];

    return <>

        <Grid container>
            <Grid item xs={8}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link color="textSecondary" href="/#/liquidity/pools">
                        {t('labelAmmList')}
                    </Link>
                    <Typography color={'textSecondary'} display={'flex'} alignItems={'center'}
                                justifyContent={'center'}
                    >{pair.coinAInfo?.simpleName}-{pair.coinBInfo?.simpleName}</Typography>
                </Breadcrumbs>
                <Grid item xs={7} marginTop={2}>
                    <TradeTitle {...{
                        ...rest, t,
                        ...pair,
                        tradeFloat,
                        isNew: false
                    }}></TradeTitle>
                </Grid>
            </Grid>
            <Grid item xs={4} alignItems={'center'} justifyContent={'flex-end'} display={'flex'}>
                {typeof coinPairInfo.isActivity === 'undefined'? '':
                <BoxTopStyled paddingY={3} paddingX={1 / 2 * 5} display={'flex'}
                              flexDirection={'column'}>
                    <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                        <Typography display={'flex'} flexDirection={'column'} component={'div'}>
                            <Typography variant={'body2'} component={'h5'} color={'textSecondary'}>
                                {t('labelReward')}
                            </Typography>
                            <Typography variant={'body1'} component={'span'} color={'textPrimary'}>
                                {typeof coinPairInfo.isActivity === 'undefined' ? EmptyValueTag : <>
                                    <Typography
                                        component={'span'}>{coinPairInfo.activity ? getThousandFormattedNumbers(coinPairInfo.activity.totalRewards) : EmptyValueTag} </Typography>
                                    <Typography
                                        component={'span'}>{coinPairInfo.activity?.rewardToken?.simpleName}</Typography>
                                </>}
                            </Typography>
                        </Typography>
                        <Typography display={'flex'} flexDirection={'column'} alignItems={'flex-end'}
                                    component={'div'}>
                            <Typography variant={'body2'} component={'h5'} color={'textSecondary'}>
                                {t('labelMyReward')}
                            </Typography>
                            <Typography variant={'body1'} component={'span'} color={'textPrimary'}>
                                {/*{typeof coinPairInfo.isActivity === 'undefined' ? EmptyValueTag : <>*/}
                                {typeof myAmm.reward === 'undefined' ? EmptyValueTag : <>

                                    <Typography
                                        component={'span'}> {getThousandFormattedNumbers(myAmm.reward)} </Typography>
                                    <Typography
                                        component={'span'}> {coinPairInfo.activity?.rewardToken?.simpleName}</Typography></>}

                            </Typography>
                        </Typography>
                    </Box>
                    <Typography alignSelf={'flex-start'} variant={'body2'} color={'textSecondary'}
                                component="span" marginTop={1}>
                        {typeof coinPairInfo.isActivity === 'undefined' ? t('labelNoActiveEvent')
                            : <>
                                {t('labelDate')} :
                                <> {moment(coinPairInfo.activity?.duration.from).format('L') + ' - ' + moment(coinPairInfo.activity?.duration.to).format('L')}</>
                            </>
                        }
                    </Typography>
                </BoxTopStyled>
                }
            </Grid>
            {/*<Grid item xs={4} alignItems={'center'} justifyContent={'flex-end'} display={'flex'}>*/}
            {/*    <Link href="/#/liquidity/pools" variant={'h5'}>*/}
            {/*        {t('labelBack')}*/}
            {/*    </Link>*/}
            {/*</Grid>*/}
        </Grid>
        {/*<Grid container marginTop={3}>*/}
        {/*   */}
        {/*</Grid>*/}
        <Box flex={1} display={'flex'} alignItems={'stretch'} flexDirection="row" marginTop={3}>
            <Box flex={1} display={'flex'} flexDirection={'column'} marginRight={3} justifyContent={'space-between'}>
                <Box flex={1} width={'101%'}>
                    <ScaleAreaChart
                        type={ChartType.Trend} 
                        data={pairHistory} 
                        extraInfo={pair.coinBInfo?.simpleName}
                    />
                </Box>
                <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                    <BoxStyled paddingX={2} display={'flex'} flexDirection={'column'}>
                        <Typography component={'p'} color={'textSecondary'} display={'flex'} marginBottom={1 / 2 * 3}
                        >
                            {t('labelAmmTotalToken')}
                        </Typography>
                        <Typography component={'span'} display={'flex'} flexDirection={'row'}
                                    justifyContent={'space-between'} alignItems={'center'}
                                    style={{textTransform: 'capitalize'}} color={'textPrimary'}>
                            <Box component={'span'} className={'logo-icon'} height={'var(--list-menu-coin-size)'}
                                 width={'var(--list-menu-coin-size)'} alignItems={'center'} justifyContent={'center'}>
                                {coinAIcon ?
                                    <AvatarCoinStyled imgx={coinAIcon.x} imgy={coinAIcon.y}
                                                      imgheight={coinAIcon.height}
                                                      imgwidth={coinAIcon.width} size={24}
                                                      variant="circular"
                                                      alt={coinPairInfo?.myCoinA?.simpleName as string}
                                        // src={sellData?.icon}
                                                      src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                                    : <Avatar variant="circular" alt={coinPairInfo?.myCoinA?.simpleName as string}
                                              style={{
                                                  height: 'var(--list-menu-coin-size))',
                                                  width: 'var(--list-menu-coin-size)'
                                              }}
                                        // src={sellData?.icon}
                                              src={'static/images/icon-default.png'}/>
                                }</Box>
                            <Typography justifyContent={'center'} display={'flex'}>
                                <Typography component={'span'} alignSelf={'right'} height={24} lineHeight={'24px'}>
                                    {getThousandFormattedNumbers(coinPairInfo.totalA, 6)}</Typography>
                                <Typography component={'span'} marginLeft={1} alignSelf={'right'} height={24} lineHeight={'24px'}>
                                    {/*<HiddenHidden>{t('labelLPTotal')}</Hidden>*/}
                                    {coinPairInfo.myCoinA?.simpleName}
                                </Typography>

                            </Typography>

                        </Typography>
                        <Typography component={'span'} display={'flex'} flexDirection={'row'}
                                    justifyContent={'space-between'} alignItems={'center'} marginTop={1}
                                    style={{textTransform: 'capitalize'}}>
                            {/*<Typography component={'span'} marginRight={1 / 2}*/}
                            {/*            color={'textSecondary'}>*/}
                            {/*    */}
                            {/*    /!*<Avatar variant="square" sizes={'small'} alt={'coinLogo'}*!/*/}
                            {/*    /!*    // src={coinBInfo?.icon}*!/*/}
                            {/*    /!*        src={buyIconHasLoaded ? coinPairInfo?.myCoinB?.icon : 'static/images/icon-default.png'}/>*!/*/}
                            {/*</Typography>*/}
                            <Box component={'span'} className={'logo-icon'} height={'var(--list-menu-coin-size)'}
                                 width={'var(--list-menu-coin-size)'} alignItems={'center'}
                                 justifyContent={'center'}>{coinBIcon ?
                                <AvatarCoinStyled imgx={coinBIcon.x} imgy={coinBIcon.y} imgheight={coinBIcon.height}
                                                  imgwidth={coinBIcon.width} size={24}
                                                  variant="circular" alt={coinPairInfo?.myCoinB?.simpleName as string}
                                    // src={sellData?.icon}
                                                  src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                                : <Avatar variant="circular" alt={coinPairInfo?.myCoinB?.simpleName as string} style={{
                                    height: 'var(--list-menu-coin-size)',
                                    width: 'var(--list-menu-coin-size)'
                                }}
                                    // src={sellData?.icon}
                                          src={'static/images/icon-default.png'}/>}</Box>
                            <Typography justifyContent={'center'} display={'flex'}>
                                <Typography component={'span'} alignSelf={'right'} height={24} lineHeight={'24px'}>
                                    {getThousandFormattedNumbers(coinPairInfo.totalB, 6)}</Typography>
                                <Typography component={'span'} marginLeft={1} alignSelf={'right'} height={24} lineHeight={'24px'}>
                                    {/*<Hidden>{t('labelLPTotal')}</Hidden>*/}
                                    {coinPairInfo.myCoinB?.simpleName}
                                </Typography>

                            </Typography>

                        </Typography>

                    </BoxStyled>
                    <BoxStyled paddingX={2} display={'flex'} flexDirection={'column'}>
                        <Typography component={'p'} color={'textSecondary'} display={'flex'}
                        >
                            {t('label24Volume')}
                        </Typography>
                        <Typography variant={'h4'} marginTop={4}
                                    component={'span'}>
                            {currency === Currency.dollar ? PriceTag.Dollar + getThousandFormattedNumbers(tradeFloat && tradeFloat.priceDollar ? tradeFloat.priceDollar as number : 0, 2)
                                : PriceTag.Yuan + getThousandFormattedNumbers(tradeFloat && tradeFloat.priceYuan ? tradeFloat.priceYuan as number : 0, 2)}
                        </Typography>

                    </BoxStyled>
                    <BoxStyled paddingX={2} display={'flex'} flexDirection={'column'}>
                        <Typography component={'p'} color={'textSecondary'} display={'flex'}
                        >
                            {t('labelTVL')}
                        </Typography>

                        <Typography variant={'h4'} marginTop={4}
                                    component={'span'}> {typeof coinPairInfo.amountDollar === 'undefined' ? EmptyValueTag :
                            currency === Currency.dollar ? PriceTag.Dollar + getThousandFormattedNumbers(coinPairInfo.amountDollar, 2) : PriceTag.Yuan + getThousandFormattedNumbers(coinPairInfo.amountYuan ? coinPairInfo.amountYuan : 0, 2)}
                        </Typography>


                    </BoxStyled>
                    <BoxStyled paddingX={2} display={'flex'} flexDirection={'column'}>
                        <Typography component={'p'} color={'textSecondary'} display={'flex'}
                        >
                            {t('labelAPY')}
                        </Typography>
                        <Typography variant={'h4'} marginTop={4}
                                    component={'span'}> {coinPairInfo.APY ? coinPairInfo.APY : EmptyValueTag}%
                        </Typography>
                    </BoxStyled>
                </Box>
            </Box>
            <Box display={'flex'}>
                <AmmPanelView pair={pair} walletMap={walletMap} snapShotData={snapShotData}/>
            </Box>
        </Box>

        <Grid container marginY={3}>
            <Grid item xs={12}>
                <Tabs value={tabIndex}
                    //   onChange={handleChange}
                      aria-label="tabs switch">
                    {/* <Tab label={t('labelAll')} {...applyProps(0)} /> */}
                    <Tab label={t('labelMe')} {...applyProps(1)} />
                </Tabs>
                <StylePaper style={{marginTop: `${unit * 2}px`}}>
                    {/*ammRecordArray*/}
                    {tabIndex === 0 ? <AmmRecordTable
                        rawData={ammMarketArray}
                        handlePageChange={_handlePageChange} page={page}
                    /> : <AmmRecordTable rawData={myAmmMarketArray} handlePageChange={_handlePageChange}
                                         page={page}/>}
                </StylePaper>
            </Grid>

        </Grid>

    </>

})







