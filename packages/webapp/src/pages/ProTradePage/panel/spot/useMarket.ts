import { AccountStatus, CoinMap, IBData, MarketType, myLog, TradeCalcData } from '@loopring-web/common-resources';
import React from 'react';
import { useToast } from 'hooks/common/useToast';
import { LoopringAPI } from 'api_wrapper';
import * as sdk from 'loopring-sdk';
import { getTimestampDaysLater } from 'utils/dt_tools';
import { OrderStatus, sleep } from 'loopring-sdk';
import { walletLayer2Service } from 'services/socket';
import { MarketTradeData, SwapData, SwapTradeData, TradeBaseType } from '@loopring-web/component-lib';
import { usePageTradePro } from 'stores/router';
import { useAccount } from 'stores/account';
import { useTokenMap } from 'stores/token';
import { useSystem } from 'stores/system';
import { useTranslation } from 'react-i18next';

export const useMarket = <C extends { [ key: string ]: any }>(market:MarketType):{
    [key: string]: any;
    // market: MarketType|undefined;
    // marketTicker: MarketBlockProps<C> |undefined,
} =>{
    const {t} = useTranslation();
    const {tokenMap,marketCoins,coinMap} = useTokenMap();
    const [alertOpen, setAlertOpen] = React.useState<boolean>(false);
    const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false);
    const {toastOpen, setToastOpen, closeToast} = useToast();
    const {account, status: accountStatus} = useAccount();
    const [marketTradeData, setMarketTradeData] = React.useState<MarketTradeData<IBData<C>> | undefined>(undefined);
    // const limitTradeData:LimitTradeData<IBData<any>> = {
    //     sell: {belong: 'ETH'} as IBData<any>,
    //     buy: {belong: 'LRC'} as IBData<any>,
    //     price: {count: 0},
    //     type: TradeProType.sell
    // }
    const {exchangeInfo} = useSystem();


    const [isMarketLoading, setIsMarketLoading] = React.useState(false)

    const {
        pageTradePro,
        updatePageTradePro,
        __DAYS__,
        __SUBMIT_LOCK_TIMER__,
        __TOAST_AUTO_CLOSE_TIMER__
    } = usePageTradePro();
    const onChangeMarketEvent = async (tradeData: MarketTradeData<IBData<any>>, formType: TradeBaseType): Promise<void> => {

        // myLog('handleSwapPanelEvent...')

        // const {tradeData} = swapData
        // resetSwap(swapType, tradeData)

    }

    const marketSubmit = React.useCallback(async (event: MouseEvent, isAgree?: boolean) => {
        let {calcTradeParams, tradeChannel, orderType,tradeCalcProData, totalFee} = pageTradePro;
        setAlertOpen(false)
        setConfirmOpen(false)

        if (isAgree) {

            setIsMarketLoading(true);
            if (!LoopringAPI.userAPI || !tokenMap || !exchangeInfo || !calcTradeParams
                || account.readyState !== AccountStatus.ACTIVATED) {

                setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})
                setIsMarketLoading(false)

                return
            }

            const baseToken = tokenMap[ marketTradeData?.base.belong as string ]
            const quoteToken = tokenMap[ marketTradeData?.quote.belong as string ]

            const request: sdk.GetNextStorageIdRequest = {
                accountId: account.accountId,
                sellTokenId: baseToken.tokenId
            }

            const storageId = await LoopringAPI.userAPI.getNextStorageId(request, account.apiKey)

            try {


                const request: sdk.SubmitOrderRequestV3 = {
                    exchange: exchangeInfo.exchangeAddress,
                    accountId: account.accountId,
                    storageId: storageId.orderId,
                    sellToken: {
                        tokenId: baseToken.tokenId,
                        volume: calcTradeParams.amountS as string
                    },
                    buyToken: {
                        tokenId: quoteToken.tokenId,
                        volume: calcTradeParams.amountBOutSlip.minReceived as string
                    },
                    allOrNone: false,
                    validUntil: getTimestampDaysLater(__DAYS__),
                    maxFeeBips: parseInt(totalFee as string),
                    fillAmountBOrS: false, // amm only false
                    orderType,
                    tradeChannel,
                    eddsaSignature: '',
                }

                myLog(request)

                const response = await LoopringAPI.userAPI.submitOrder(request, account.eddsaKey.sk, account.apiKey)

                myLog(response)

                if (!response?.hash) {
                    setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})
                    myLog(response?.resultInfo)
                } else {
                    await sleep(__TOAST_AUTO_CLOSE_TIMER__)

                    const resp = await LoopringAPI.userAPI.getOrderDetails({
                        accountId: account.accountId,
                        orderHash: response.hash
                    }, account.apiKey)

                    myLog('-----> resp:', resp)

                    if (resp.orderDetail?.status !== undefined) {
                        switch (resp.orderDetail?.status) {
                            case OrderStatus.cancelled:
                                setToastOpen({open: true, type: 'warning', content: t('labelSwapCancelled')})
                                break
                            case OrderStatus.processed:
                                setToastOpen({open: true, type: 'success', content: t('labelSwapSuccess')})
                                break
                            default:
                                setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})
                        }
                    }
                    walletLayer2Service.sendUserUpdate()
                    setMarketTradeData((state) => {
                        return {
                            ...state,
                            sell: {...state?.base, tradeValue: 0},
                            buy: {...state?.quote, tradeValue: 0},
                        } as MarketTradeData<IBData<C>>
                    });
                    updatePageTradePro({
                        market: market as MarketType,
                        tradeCalcProData:{
                            ...tradeCalcProData,
                            minimumReceived: undefined,
                            priceImpact: undefined,
                            fee: undefined
                        }
                    })
                    // setTradeCalcData((state) => {
                    //     return {
                    //         ...state,
                    //         minimumReceived: undefined,
                    //         priceImpact: undefined,
                    //         fee: undefined
                    //     }
                    // })
                }
            } catch (reason) {
                sdk.dumpError400(reason)
                setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})

            }

            // setOutput(undefined)

            await sleep(__SUBMIT_LOCK_TIMER__)

            setIsMarketLoading(false)

        }

    }, [account.readyState, pageTradePro, tokenMap, marketTradeData, setIsMarketLoading, setToastOpen, setMarketTradeData])

    return {
        alertOpen,
        confirmOpen,
        toastOpen,
        closeToast,
        // marketLastCall,
       marketSubmit,
       marketTradeData,
       onChangeMarketEvent
        // marketTicker,
    }
}