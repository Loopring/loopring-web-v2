import { withTranslation, WithTranslation } from 'react-i18next';
import { AvatarCoinStyled, EmptyValueTag, MarketType, TradeCalcData } from '@loopring-web/common-resources';
import { Avatar, Box, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { Button, useSettings } from '@loopring-web/component-lib';
import { useModals } from 'hooks/useractions/useModals';
import { usePageTradePro } from 'stores/router';

export const WalletInfo = withTranslation('common')(<C extends { [ key: string ]: any }>({t, market}: {
    market: MarketType,
    // tradeCalcProData: TradeCalcData<C>
} & WithTranslation) => {
    const { pageTradePro: {tradeCalcProData} } = usePageTradePro();
    //@ts-ignore
    const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
    const {coinJson, slippage} = useSettings();
    const tokenAIcon: any = coinJson[ coinA ];
    const tokenBIcon: any = coinJson[ coinB ];
    const walletMap = tradeCalcProData && tradeCalcProData.walletMap?tradeCalcProData.walletMap:{};
    const {showDeposit, showWithdraw,} = useModals()
    const onShowDeposit = React.useCallback((token?: any) => {
        showDeposit({isShow: true, symbol: token})
    }, [showDeposit])
    const onShowWithdraw = React.useCallback((token?: any) => {
        showWithdraw({isShow: true, symbol: token})
    }, [showWithdraw])
    return <Box paddingBottom={2}>
        <Typography paddingX={2} paddingY={2} variant={'body1'} component={'h4'}>{t('Available')}</Typography>
        <Divider/>
        <Box  paddingX={2}  display={'flex'} flex={1} flexDirection={'column'} justifyContent={''}>
            <Box marginTop={2} display={'flex'} flexDirection={'row'} alignItems={'center'}
                 justifyContent={'space-between'}>
                <Box component={'span'} display={'flex'} flexDirection={'row'} alignItems={'center'}
                     className={'logo-icon'} height={'var(--withdraw-coin-size)'} justifyContent={'flex-start'}
                     marginRight={1 / 2}>
                    {tokenAIcon ?
                        <AvatarCoinStyled imgx={tokenAIcon.x} imgy={tokenAIcon.y}
                                          imgheight={tokenAIcon.height}
                                          imgwidth={tokenAIcon.width} size={16}
                                          variant="circular"
                                          style={{marginLeft: '-8px'}}
                                          alt={coinA}
                                          src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                        : <Avatar variant="circular" alt={coinA}
                                  style={{
                                      width: 'var(--withdraw-coin-size)',
                                      height: 'var(--withdraw-coin-size)',
                                  }}
                                  src={'static/images/icon-default.png'}/>
                    }
                    <Typography variant={'body1'}>{coinA}</Typography>
                </Box>
                <Typography variant={'body1'}>{walletMap[coinA] ? walletMap[coinA]?.count:0}</Typography>
            </Box>
            <Box marginTop={1} display={'flex'} flexDirection={'row'} alignItems={'center'}
                 justifyContent={'space-between'} >
                <Box component={'span'} display={'flex'} flexDirection={'row'} alignItems={'center'}
                     className={'logo-icon'} height={'var(--withdraw-coin-size)'} justifyContent={'flex-start'}
                     marginRight={1 / 2}>
                    {tokenBIcon ?
                        <AvatarCoinStyled imgx={tokenBIcon.x} imgy={tokenBIcon.y}
                                          imgheight={tokenBIcon.height}
                                          imgwidth={tokenBIcon.width} size={16}
                                          variant="circular"
                                          style={{marginLeft: '-8px'}}
                                          alt={coinB}
                                          src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                        : <Avatar variant="circular" alt={coinB}
                                  style={{
                                      width: 'var(--withdraw-coin-size)',
                                      height: 'var(--withdraw-coin-size)',
                                  }}
                                  src={'static/images/icon-default.png'}/>
                    }
                    <Typography variant={'body1'}>{coinB}</Typography>
                </Box>
                <Typography variant={'body1'}>{walletMap[coinB]? walletMap[coinB]?.count:0}</Typography>
            </Box>
            <Box display={'flex'} flexDirection={'row'} alignItems={'center'} marginTop={2} justifyContent={'center'}>
                <Box marginRight={1}>
                    <Button style={{height: 28,fontSize: '1.4rem'}}  variant={'contained'} size={'small'} color={'primary'} onClick={() => onShowDeposit(coinA)}>{t('labelDeposit')}</Button></Box>
                <Box marginLeft={1}><Button  style={{height: 28,fontSize: '1.4rem'}}  variant={'outlined'} size={'small'} onClick={() => onShowWithdraw(coinA)}>{t('labelTransfer')}</Button></Box>
            </Box>

        </Box>
    </Box>
})