import { SwapProps, SwapTradeData } from '../Interface';
import { withTranslation, WithTranslation } from 'react-i18next';
import React from 'react';
import { Grid } from '@material-ui/core';
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib';
import { DropDownIcon, IBData, TradeCalcData } from '@loopring-web/common-resources';
// import { useDeepCompareEffect } from 'react-use';
// import clockLoading from '@loopring-web/common-resources/assets/svg/clock-loading.svg';
import { IconButtonStyled, SwapMenuList, SwapTradeWrap } from '../components';
import { SwapData } from '../components/panel/SwapWrap/Interface';
import { CountDownIcon } from '../components/tool/Refresh';


// html {
//     font-size: 1vmin;
//     background: var(--bg) radial-gradient(closest-corner, rgba(255,255,255,.1), rgba(255,255,255,0));
//     height: 100%;
// }


export const SwapPanel = withTranslation('common', {withRef: true})(<T extends IBData<I>,
    I,
    TCD extends TradeCalcData<I>>({
                                      disabled,
                                      handleSwapPanelEvent, tradeCalcData,
                                      handleError,
                                      onSwapClick,
                                      onRefreshData,
                                      swapBtnStatus,
                                      tokenSellProps,
                                      tokenBuyProps,
                                      ...rest
                                  }: SwapProps<T, I, TCD> & WithTranslation) => {
    // useSettings()
    let swapTradeData: SwapTradeData<T>
    if (tradeCalcData && tradeCalcData.sellCoinInfoMap) {
        swapTradeData = ({
            // @ts-ignore
            sell: {
                belong: tradeCalcData.sellCoinInfoMap ? tradeCalcData.sellCoinInfoMap[ tradeCalcData.coinSell ]?.simpleName : undefined,
                balance: tradeCalcData.walletMap ? tradeCalcData.walletMap[ tradeCalcData.coinSell ]?.count : 0
            },
            // @ts-ignore
            buy: {
                belong: tradeCalcData.sellCoinInfoMap ? tradeCalcData.sellCoinInfoMap[ tradeCalcData.coinBuy ]?.simpleName : undefined,
                balance: tradeCalcData.walletMap ? tradeCalcData.walletMap[ tradeCalcData.coinBuy ]?.count : 0
            },
            slippage: tradeCalcData.slippage,
        });
    } else {
        swapTradeData = {
            // @ts-ignore
            sell: {
                belong: undefined,
                balance: 0
            },
            // @ts-ignore
            buy: {
                belong: undefined,
                balance: 0,
            }
        }

    }

    const [index, setIndex] = React.useState(0);
    const [swapData, setSwapData] = React.useState<SwapData<SwapTradeData<T>>>({
        to: 'button',
        type: 'buy',
        tradeData: {
            ...swapTradeData
        }
    })


    React.useEffect(() => {
        if (rest.tradeData && rest.tradeData !== swapData.tradeData
            // && (rest.tradeData.sell.tradeValue !== swapData.tradeData.sell.tradeValue
            //     || rest.tradeData.buy.tradeValue !== swapData.tradeData.buy.tradeValue)
        ) {
            setSwapData({...swapData, tradeData: rest.tradeData});
        }
    }, [rest.tradeData, swapData])
    const onChangeEvent = React.useCallback(async (_index: 0 | 1, {
        to,
        tradeData,
        type
    }: SwapData<SwapTradeData<T>>) => {
        await handleSwapPanelEvent && handleSwapPanelEvent({
            to,
            tradeData,
            type
        }, type === 'exchange' ? 'exchange' : `${type}To${to}` as any);
        if (typeof rest.onChangeEvent == 'function') {
            setSwapData(rest.onChangeEvent(_index, {to, tradeData, type}));
        } else {
            if (type === 'exchange') {
                const countBuy = (tradeData.buy.belong && tradeCalcData.walletMap) ? tradeCalcData.walletMap[ tradeData.buy.belong ]?.count : 0;
                const countSell = (tradeData.sell.belong && tradeCalcData.walletMap) ? tradeCalcData.walletMap[ tradeData.sell.belong ]?.count : 0;
                setSwapData({
                    tradeData: {
                        ...swapData.tradeData,
                        sell: {belong: tradeData.sell.belong, balance: countSell, tradeValue: 0},
                        buy: {belong: tradeData.buy.belong, balance: countBuy, tradeValue: 0},
                    } as SwapTradeData<T>, to, type: 'buy'
                });
            } else if (to === 'menu') {
                setSwapData({tradeData, to, type});
            } else if (to === 'button') {
                const count = (tradeData[ type ].belong && tradeCalcData.walletMap) ? tradeCalcData.walletMap[ tradeData[ type ].belong ]?.count : 0;
                let _tradeData = {
                    ...tradeData,
                    [ type ]: {
                        ...tradeData[ type ],
                        balance: count ? count : 0,
                    }
                };
                setSwapData({tradeData: _tradeData, to, type});
            }
        }
        if (_index !== index) {
            setIndex(_index);
        }

    }, [handleSwapPanelEvent, tradeCalcData, rest, index, swapData]);
    const props: SwitchPanelProps<'tradeMenuList' | 'trade'> = {
        index: index, // show default show
        panelList: [
            {
                key: "trade",
                element: () => <SwapTradeWrap<T, I, TCD> key={"trade"} {...{
                    ...rest,
                    swapData,
                    tradeCalcData,
                    onSwapClick,
                    onChangeEvent,
                    disabled,
                    swapBtnStatus,
                    tokenSellProps,
                    tokenBuyProps,
                    handleError,
                }}/>,
                toolBarItem: () => <Grid container justifyContent={'flex-end'}>
                    {/*<IconButtonStyled edge="end"*/}
                    {/*                  className={'switch outline'}*/}
                    {/*                  color="inherit"*/}
                    {/*                  aria-label="to Professional">*/}
                    {/*    <ProToLiteIcon/>*/}
                    {/*</IconButtonStyled>*/}
                    {/*<IconButtonStyled edge="end"*/}
                    {/*                  className={'clock-loading outline'}*/}
                    {/*                  color="inherit"*/}
                    {/*                  aria-label="3' price update">*/}
                    {/*    <img src={clockLoading} alt={'loading'} width={28} height={28}/>*/}
                    {/*</IconButtonStyled>*/}
                    <CountDownIcon onRefreshData={onRefreshData}/>
                </Grid>
            },
            {
                key: "tradeMenuList",
                element: () => <SwapMenuList<T, I, TCD> key={"tradeMenuList"} {...{
                    ...rest,
                    onChangeEvent,
                    tradeCalcData,
                    swapData
                }}/>,
                toolBarItem: () => <Grid container justifyContent={'flex-start'}>
                    <IconButtonStyled edge="start" sx={{transform: 'rotate(90deg)', transformOrigin: '50%'}}
                                      className={'switch'}
                                      color="inherit"
                                      onClick={() => onChangeEvent(0, swapData)}
                                      aria-label="to Professional">

                        <DropDownIcon/>
                    </IconButtonStyled>

                </Grid>
            },
        ],

    }
    return <SwitchPanel {...{...rest, ...props}} />
}) as <T extends IBData<I>,
    I,
    TCD extends TradeCalcData<I>> (props: SwapProps<T, I, TCD> & React.RefAttributes<any>) => JSX.Element;

