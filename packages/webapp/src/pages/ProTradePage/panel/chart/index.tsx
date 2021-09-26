import React from 'react'
import { withTranslation, WithTranslation } from 'react-i18next';
import { Divider, Box, Typography, Grid } from '@mui/material'
import { ScaleAreaChart, ChartType, testKlineData, MainIndicator, SubIndicator, HeaderMenuSub, HeadMenuItem } from '@loopring-web/component-lib'
import { BreakPoint, HeaderMenuItemInterface, HeaderMenuTabStatus } from '@loopring-web/common-resources'
import styled from '@emotion/styled'
import { useKlineChart } from './hook';

const ChartWrapperStyled = styled(Box)`
    flex: 1;
    width: 100%;
    height: 100%;
`

const formatDateData = testKlineData.map(d => ({
    ...d,
    date: new Date(d.date)
}))

const headerMenuData: Array<HeaderMenuItemInterface> = [
    {
        label: {
            id: 'TimeDefault', i18nKey: 'labelProTimeDefault',
        },
    },
    {
        label: {
            id: '1m', i18nKey: 'labelProTime1m',
        },
    },
    {
        label: {
            id: '5m', i18nKey: 'labelProTime5m',
        },
    },
    {
        label: {
            id: '15m', i18nKey: 'labelProTime15m',
        },
    },
    {
        label: {
            id: '1H', i18nKey: 'labelProTime1H',
        },
    },
    {
        label: {
            id: '14H', i18nKey: 'labelProTime4H',
        },
    },
    {
        label: {
            id: '1D', i18nKey: 'labelProTime1D',
        },
    },
    {
        label: {
            id: '1W', i18nKey: 'labelProTime1W',
        },
    },
    {
        label: {
            id: '1M', i18nKey: 'labelProTime1M',
        },
    },
]


export const ChartView = withTranslation('common')(({market, breakpoint, t}: 
    {
        market: string | undefined;
        breakpoint: BreakPoint;
    } & WithTranslation) => {

    const { candlestickViewData, genCandlestickData } = useKlineChart(market)
    const [timeInterval, setTimeInterval] = React.useState('')

//     const getDrawerChoices = ({
//         menuList,
//         layer = 0,
//         ...rest
//     }: { menuList: HeaderMenuItemInterface[], layer?: number, handleListKeyDown?: any } & WithTranslation) => {

//     const nodeMenuItem = ({label, router, layer, child, ...rest}: HeaderMenuItemInterface & any) => {
//         return <>
//             {layer >= 1 ? <Layer2Item {...{...rest, label, router, child, layer}} />
//                 : <Typography variant={'body1'} key={label.id} color={'inherit'}>{rest.t(label.i18nKey)}</Typography>
//             }
//         </>
//     }

// const Memoized = ({label, router, child, layer, ref, ...rest}: any) => (<HeaderMenuSub {...{
//     ...rest,
//     label,
//     router,
//     child,
//     layer,
//     selected: new RegExp(label.id, 'ig').test(selected.split('/')[ 1 ] ? selected.split('/')[ 1 ] : selected) ? true : false,
//     // className: new RegExp(label.id, 'ig').test(selected.split('/')[ 1 ] ? selected.split('/')[ 1 ] : selected) ? 'Mui-selected' : '',
//     renderList: ({handleListKeyDown}: { handleListKeyDown: ({...rest}) => any }) => {
//     return getDrawerChoices({menuList: child, layer: layer + 1, handleListKeyDown, ...rest})
//     },
// }} />);

// return menuList.map((props: HeaderMenuItemInterface) => {
// // @ts-ignore
// const {label, child, router, status} = props;
// const selectedFlag = new RegExp(label.id, 'ig').test(selected.split('/')[ 1 ] ? selected.split('/')[ 1 ] : selected)
// if (status === HeaderMenuTabStatus.hidden) {
// // return <React.Fragment key={label.id + '-' + layer}></React.Fragment>
// return <React.Fragment key={label.id + '-' + layer}></React.Fragment>} else {
// if (child) {
//     return <Memoized {...{...props, layer, ...rest}} key={label.id + '-' + layer}/>
// } else {
//     return <HeadMenuItem selected={selectedFlag}  {...{
//         ...props,
//         layer,
//         children: nodeMenuItem({...props, layer, child, ...rest}),
//         style: {textDecoration: "none"},
//         key: label.id + '-' + layer,
//     }} onClick={rest?.handleListKeyDown ? rest.handleListKeyDown : undefined}/>
//     }
// }
// });
// };

    return <>
        <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'} height={'100%'}>
            <Box component={'header'} width={'100%'} paddingX={2}>
                <Typography variant={'body1'} lineHeight={'44px'}>{t(`labelProChartTitle`)}</Typography>
            </Box>
            <Divider style={{marginTop: '-1px'}}/>
            <Box width={'100%'} height={'36px'} paddingX={1} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                <Box>
                    {/* {headerMenuData.map((props: HeaderMenuItemInterface, index: number) => {
                        // @ts-ignore
                        const {label} = props;
                        return <HeadMenuItem
                                selected={label.id === timeInterval}
                                {...{
                                    ...props,
                                    layer: 1,
                                    style: {textDecoration: "none"},
                                    key: label.id + '-' + index,
                                }} 
                                onClick={() => setTimeInterval(label.id)}/>
                    })} */}
                    <Grid container spacing={1}>
                        <Grid item>{t('labelProTimeDefault')}</Grid>
                        <Grid item>{t('labelProTime1m')}</Grid>
                        <Grid item>{t('labelProTime5m')}</Grid>
                        <Grid item>{t('labelProTime15m')}</Grid>
                        <Grid item>{t('labelProTime1H')}</Grid>
                        <Grid item>{t('labelProTime4H')}</Grid>
                        <Grid item>{t('labelProTime1D')}</Grid>
                        <Grid item>{t('labelProTime1W')}</Grid>
                        <Grid item>{t('labelProTime1M')}</Grid>
                    </Grid>
                </Box>
                <Box>
                    
                </Box>
            </Box>
            <Divider style={{marginTop: '-1px'}}/>
            <ChartWrapperStyled>
                <ScaleAreaChart
                    type={ChartType.Kline}
                    data={candlestickViewData}
                    indicator={
                        {
                            mainIndicators: [{indicator: MainIndicator.MA, params: {period: 5}}, 
                                {indicator: MainIndicator.MA, params: {period: 10}}, 
                                {indicator: MainIndicator.BOLL}
                            ],
                            subIndicator: [{ indicator: SubIndicator.VOLUME }, { indicator: SubIndicator.MACD }]
                        }
                    }
                />
            </ChartWrapperStyled>
        </Box>
    </>
})