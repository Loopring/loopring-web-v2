import React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { AmmRecordTable, ChartType, ScaleAreaChart, TradeTitle, useSettings } from '@loopring-web/component-lib';
import {
    AvatarCoinStyled,
    Currency,
    EmptyValueTag,
    getThousandFormattedNumbers,
    PriceTag
} from '@loopring-web/common-resources';
import { Avatar, Box, Breadcrumbs, Divider, Grid, Link, Typography } from '@material-ui/core';
import { AmmPanelView } from '../AmmPanel';
import moment from 'moment';
import styled from '@emotion/styled/';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { useCoinPair } from './hooks';
import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk';
import { StylePaper } from 'pages/styled';

//******************** page code ************************//
const BoxWrapperStyled = styled(Grid)`
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`

styled(Box)`
  background: var(--color-box);
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

const AwardWrapperStyled = styled(Box)`
  padding: ${({theme}) => theme.unit * 2}px ${({theme}) => theme.unit * 5 / 2}px;
  background-color: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`

const TabsStyled = styled(Tabs)`
  padding: ${({theme}) => theme.unit}px;
  padding-bottom: 0;
`

const applyProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `tabpanel-${index}`,
    }
}
const RowConfig = {
    rowHeight:44,
    headerRowHeight:44,
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
        pairHistory,
        awardList,
        getUserAmmPoolTxs,
        showAmmPoolLoading,
        ammUserTotal,
        isRecentLoading,
    } = useCoinPair({ammActivityMap});
    const [tabIndex, setTabIndex] = React.useState<0 | 1>(1);
    // const [page, setPage] = React.useState(rest?.page ? rest.page : 1);

    const {coinJson} = useSettings();
    const coinAIcon: any = coinJson[ coinPairInfo.myCoinA?.simpleName ];
    const coinBIcon: any = coinJson[ coinPairInfo.myCoinB?.simpleName ];
    // const [pageSize, setPageSize] = React.useState(0)
    const container = React.useRef(null);
    const tableHeight = RowConfig.headerRowHeight + (tabIndex === 0 ? 15: 14) *  RowConfig.rowHeight;

    // React.useEffect(() => {
    //     // @ts-ignore
    //     let height = container?.current?.offsetHeight;
    //     if (height) {
    //         setPageSize(Math.floor((height / 44) - 2));
    //     }
    // }, [container, pageSize]);

    const handleTabsChange = React.useCallback((_: any, value: 0 | 1) => {
        setTabIndex(value)
    }, [])

    return <>
        <Box marginBottom={2}>
            <Breadcrumbs aria-label="breadcrumb">
                <Link color="textSecondary" href="/#/liquidity/pools">
                    {t('labelAmmList')}
                </Link>
                <Typography color={'textSecondary'} display={'flex'} alignItems={'center'}
                            justifyContent={'center'}
                >{pair.coinAInfo?.simpleName}-{pair.coinBInfo?.simpleName}</Typography>
            </Breadcrumbs>
        </Box>
        <Box flex={1} display={'flex'} flexDirection={'row'}>
            <Box display={'flex'} flex={1} marginRight={3} alignContent={'stretch'} flexDirection={'column'}
                 flexWrap={'nowrap'}>
                <Box marginTop={0}>
                    <TradeTitle {...{
                        baseShow: coinPairInfo.myCoinA?.simpleName,
                        quoteShow: coinPairInfo.myCoinB?.simpleName,
                        ...rest, t,
                        ...pair,
                        tradeFloat,
                        isNew: false
                    }}/>
                </Box>
                {/*<Box flex={1} display={'flex'} alignItems={'stretch'} flexDirection="row" marginTop={3}>*/}
                <Box marginTop={3} display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                    <Box flex={1} width={'101%'} minHeight={396} maxHeight={460}>
                        <ScaleAreaChart
                            type={ChartType.Trend}
                            data={pairHistory}
                            extraInfo={pair.coinBInfo?.simpleName}
                            showXAxis
                        />
                    </Box>
                    <BoxWrapperStyled container className={'MuiPaper-elevation2'} display={'flex'}
                                      alignItems={'center'}>
                        <Grid item paddingLeft={2} paddingY={3} xs={6} sm={4} lg={3}
                              display={'flex'}
                              direction={'row'}
                              justifyContent={'space-between'}
                              alignItems={'center'}>
                            {/* <Typography component={'p'} color={'textSecondary'} display={'flex'}
                                        marginBottom={1 / 2 * 3}
                            >
                                {t('labelAmmTotalToken')}
                            </Typography> */}
                            <Box>


                                <Typography component={'span'} display={'flex'} flexDirection={'row'}
                                            justifyContent={'flex-start'} alignItems={'center'}
                                            style={{textTransform: 'capitalize'}} color={'textPrimary'}>
                                    <Box component={'span'} className={'logo-icon'} display={'flex'}
                                         height={'var(--list-menu-coin-size)'}
                                         width={'var(--list-menu-coin-size)'} alignItems={'center'}
                                         justifyContent={'center'}>
                                        {coinAIcon ?
                                            <AvatarCoinStyled imgx={coinAIcon.x} imgy={coinAIcon.y}
                                                              imgheight={coinAIcon.height}
                                                              imgwidth={coinAIcon.width} size={20}
                                                              variant="circular"
                                                              style={{marginTop: 2}}
                                                              alt={coinPairInfo?.myCoinA?.simpleName as string}
                                                // src={sellData?.icon}
                                                              src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                                            :
                                            <Avatar variant="circular" alt={coinPairInfo?.myCoinA?.simpleName as string}
                                                    style={{
                                                        height: 'var(--list-menu-coin-size))',
                                                        width: 'var(--list-menu-coin-size)'
                                                    }}
                                                // src={sellData?.icon}
                                                    src={'static/images/icon-default.png'}/>
                                        }</Box>
                                    <Typography marginLeft={1 / 2} justifyContent={'center'} display={'flex'}>
                                        <Typography component={'span'} alignSelf={'right'} variant={'h5'} height={24}
                                                    lineHeight={'24px'}>
                                            {getThousandFormattedNumbers(coinPairInfo.totalA, 4)}</Typography>
                                        <Typography component={'span'} variant={'h5'} marginLeft={1} alignSelf={'right'}
                                                    height={24}
                                                    lineHeight={'24px'}>
                                            {/*<HiddenHidden>{t('labelLPTotal')}</Hidden>*/}
                                            {coinPairInfo.myCoinA?.simpleName}
                                        </Typography>

                                    </Typography>

                                </Typography>
                                <Typography component={'span'} display={'flex'} flexDirection={'row'}
                                            justifyContent={'flex-start'} alignItems={'center'} marginTop={1}
                                            style={{textTransform: 'capitalize'}}>
                                    {/*<Typography component={'span'} marginRight={1 / 2}*/}
                                    {/*            color={'textSecondary'}>*/}
                                    {/*    */}
                                    {/*    /!*<Avatar variant="square" sizes={'small'} alt={'coinLogo'}*!/*/}
                                    {/*    /!*    // src={coinBInfo?.icon}*!/*/}
                                    {/*    /!*        src={buyIconHasLoaded ? coinPairInfo?.myCoinB?.icon : 'static/images/icon-default.png'}/>*!/*/}
                                    {/*</Typography>*/}
                                    <Box component={'span'} className={'logo-icon'} display={'flex'}
                                         height={'var(--list-menu-coin-size)'}
                                         width={'var(--list-menu-coin-size)'} alignItems={'center'}
                                         justifyContent={'center'}>{coinBIcon ?
                                        <AvatarCoinStyled style={{marginTop: 2}} imgx={coinBIcon.x} imgy={coinBIcon.y}
                                                          imgheight={coinBIcon.height}
                                                          imgwidth={coinBIcon.width} size={20}
                                                          variant="circular"
                                                          alt={coinPairInfo?.myCoinB?.simpleName as string}
                                            // src={sellData?.icon}
                                                          src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                                        : <Avatar variant="circular" alt={coinPairInfo?.myCoinB?.simpleName as string}
                                                  style={{
                                                      height: 'var(--list-menu-coin-size)',
                                                      width: 'var(--list-menu-coin-size)'
                                                  }}
                                            // src={sellData?.icon}
                                                  src={'static/images/icon-default.png'}/>}</Box>
                                    <Typography marginLeft={1 / 2} justifyContent={'center'} display={'flex'}>
                                        <Typography variant={'h5'} component={'span'} alignSelf={'right'} height={24}
                                                    lineHeight={'24px'}>
                                            {getThousandFormattedNumbers(coinPairInfo.totalB, 4)}</Typography>
                                        <Typography variant={'h5'} component={'span'} marginLeft={1} alignSelf={'right'}
                                                    height={24}
                                                    lineHeight={'24px'}>
                                            {/*<Hidden>{t('labelLPTotal')}</Hidden>*/}
                                            {coinPairInfo.myCoinB?.simpleName}
                                        </Typography>

                                    </Typography>

                                </Typography>
                            </Box>
                            <Divider style={{height: '56px',marginLeft: '8px', borderRight:'1px solid var(--color-divide)'}} orientation={'vertical'}/>
                        </Grid>


                        <Grid item paddingX={2} paddingY={3} xs={6} sm={3} lg={3}>
                            <Box>
                                <Typography variant={'h3'}
                                            component={'span'}> {typeof coinPairInfo.amountDollar === 'undefined' ? EmptyValueTag :
                                    currency === Currency.dollar ? PriceTag.Dollar + getThousandFormattedNumbers(coinPairInfo.amountDollar, 2, {isAbbreviate: true}) : PriceTag.Yuan + getThousandFormattedNumbers(coinPairInfo.amountYuan ? coinPairInfo.amountYuan : 0, 2, {isAbbreviate: true})}
                                </Typography>

                                <Typography component={'p'} color={'textSecondary'} display={'flex'}>
                                    {t('labelTVL')}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item paddingX={2} paddingY={3} xs={6} sm={3} lg={3}>
                            <Box>
                                <Typography variant={'h3'} component={'span'}>
                                    {getThousandFormattedNumbers(tradeFloat && tradeFloat.volume ? tradeFloat.volume : 0.00, 2, {isAbbreviate: true})}
                                </Typography>
                                <Typography component={'p'} color={'textSecondary'} display={'flex'}>
                                    {t('label24Volume')}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item paddingX={2} paddingY={3} xs={6} sm={2} lg={3}>
                            <Box>
                                <Typography variant={'h3'}
                                            component={'span'}> {coinPairInfo.APY ? coinPairInfo.APY : EmptyValueTag}%
                                </Typography>
                                <Typography component={'p'} color={'textSecondary'} display={'flex'}>
                                    {t('labelAPY')}
                                </Typography>
                            </Box>
                        </Grid>
                    </BoxWrapperStyled>

                </Box>
                <StylePaper className={'MuiPaper-elevation2'} marginTop={3} paddingBottom={1} ref={container}>
                    <TabsStyled value={tabIndex}
                        onChange={handleTabsChange}
                        aria-label="tabs switch"
                    >
                        <Tab label={t('labelAmmAllTransactions')} {...applyProps(0)} />
                        <Tab label={t('labelAmmMyTransactions')} {...applyProps(1)} />
                    </TabsStyled>
                    <Divider/>
                    {/*ammRecordArray*/}
                    {tabIndex === 0 ? <AmmRecordTable
                        rawData={ammMarketArray}
                        rowHeight={RowConfig.rowHeight}
                        headerRowHeight={RowConfig.headerRowHeight}
                        currentHeight={tableHeight}
                        showLoading={isRecentLoading}
                        currency={currency}
                        // handlePageChange={getUserAmmPoolTxs} page={page}
                    /> : <AmmRecordTable
                        rawData={myAmmMarketArray}
                        handlePageChange={getUserAmmPoolTxs}
                        pagination={{
                            pageSize: 14,
                            total: ammUserTotal
                        }}
                        showLoading={showAmmPoolLoading}
                        rowHeight={RowConfig.rowHeight}
                        headerRowHeight={RowConfig.headerRowHeight}
                        currentHeight={tableHeight-44}
                        currency={currency}
                    />}
                </StylePaper>
            </Box>
            <Box display={'flex'} style={{minWidth: 'var(--swap-box-width)'}}>
                {/*<FixedStyle>*/}
                <Box>
                    <AmmPanelView pair={pair} walletMap={walletMap} snapShotData={snapShotData}/>
                    {/* <Box marginTop={3}>
                        {awardList.map((o, index) => (
                            <AwardWrapperStyled key={`${o.market}-${index}}`} display={'flex'}
                                                className={'MuiPaper-elevation2'} marginTop={2}>
                                {o.awardList.map(item => {
                                    const rewardIcon: any = item.token ? coinJson[ item.token ] : undefined
                                    const renderReward = Number.isFinite(item.volume) ? `${getThousandFormattedNumbers(Number((item.volume as any).toFixed(2)))} ${item.token}` : '--'
                                    const end = moment(o.end).format('MM/DD')
                                    return (
                                        <Box key={`${item.token}-${item.volume}`} display={'flex'}
                                             alignItems={'center'}>
                                            <Box component={'span'} className={'logo-icon'} display={'flex'}
                                                 height={'var(--list-menu-coin-size)'}
                                                 width={'var(--list-menu-coin-size)'} alignItems={'center'}
                                                 justifyContent={'center'} marginRight={2}>
                                                {coinAIcon ?
                                                    <AvatarCoinStyled imgx={rewardIcon.x} imgy={rewardIcon.y}
                                                                      imgheight={rewardIcon.height}
                                                                      imgwidth={rewardIcon.width} size={24}
                                                                      variant="circular"
                                                                      alt={item.token as string}
                                                                      src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                                                    : <Avatar variant="circular" alt={item.token as string}
                                                              style={{
                                                                  height: 'var(--list-menu-coin-size)',
                                                                  width: 'var(--list-menu-coin-size)'
                                                              }}
                                                        // src={sellData?.icon}
                                                              src={'static/images/icon-default.png'}/>
                                                }
                                            </Box>
                                            <Box display={'flex'} flexDirection={'column'}
                                                 justifyContent={'space-between'}>
                                                <Typography variant={'h6'}
                                                            color={'var(--color-text-secondary)'}>Rewards</Typography>
                                                <Typography variant={'h3'}>{renderReward}</Typography>
                                                <Typography variant={'body2'}
                                                            color={'var(--color-text-third)'}>{o.start} - {end}</Typography>
                                            </Box>
                                        </Box>
                                    )
                                })}
                            </AwardWrapperStyled>
                        ))}
                    </Box> */}
                </Box>

                {/*</FixedStyle>*/}
            </Box>
        </Box>
    </>
})
