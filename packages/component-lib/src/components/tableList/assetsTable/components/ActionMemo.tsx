import React from 'react';
import { Box, Grid, ListItemText, MenuItem } from '@mui/material';
import styled from '@emotion/styled';
import { Button, Popover, PopoverType, PopoverWrapProps } from '../../../basic-lib';
import { MoreIcon } from '@loopring-web/common-resources';
import { LpTokenAction } from '../AssetsTable';
import { useHistory } from 'react-router-dom';
import { TFunction } from 'i18next';

const GridStyled = styled(Grid)`
  .MuiGrid-item {
    padding: 0;
    padding-top: ${({theme}) => theme.unit / 4}px;
  }
`
const ActionPopContent = React.memo(({market, isLp,allowTrade, getMarketArrayListCallback, t}
                                         : {
    allowTrade?:any,
    t: TFunction,
    market: string, isLp: boolean, getMarketArrayListCallback: (token: string) => string[],
}) => {
    let history = useHistory()

    const marketList = isLp ? [] : getMarketArrayListCallback(market).filter(pair => {
        const [first, last] = pair.split('-')
        if (first === 'USDT' || last === 'USDT') {
            return true
        }
        return first === market
    })

    const jumpToAmm = React.useCallback((type: LpTokenAction, market: string) => {
        const pathname = `/liquidity/pools/coinPair/${market}`

        history && history.push({
            pathname,
            search: `type=${type}`
        })
    }, [history])

    const jumpToSwapPanel = React.useCallback((pair: string) => {
        history && history.push({
            pathname: `/trade/lite/${pair}`
        })
    }, [history])
    return (
        <Box borderRadius={'inherit'} minWidth={110}>
            {isLp ? ( <>
                    {allowTrade?.joinAmm?.enable && <MenuItem onClick={() => jumpToAmm(LpTokenAction.add, market)}>
                      <ListItemText>{t('labelPoolTableAddLiqudity')}</ListItemText>
                    </MenuItem>}
                    <MenuItem onClick={() => jumpToAmm(LpTokenAction.remove, market)}>
                        <ListItemText>{t('labelPoolTableRemoveLiqudity')}</ListItemText>
                    </MenuItem>
                </>
            ) : (
                marketList.map(pair => {
                    const formattedPair = pair.replace('-', ' / ')
                    return (
                        <MenuItem key={pair} onClick={() => jumpToSwapPanel(pair)}>
                            <ListItemText>{formattedPair}</ListItemText>
                        </MenuItem>
                    )
                })
            )}
        </Box>
    )
})


const ActionMemo = React.memo(({
                                   t,
                                   allowTrade,
                                   tokenValue,
                                   getMarketArrayListCallback,
                                   isLp,
                                   market,
                                   onShowDeposit,
                                   onShowTransfer,
                                   onShowWithdraw
                               }: {
    tokenValue: any,
    allowTrade?: any,
    // renderMarket:any,
    market: `${string}-${string}`,
    isLp: boolean,
    onShowDeposit: (token: string) => void,
    onShowTransfer: (token: string) => void,
    onShowWithdraw: (token: string) => void,
    getMarketArrayListCallback: (token: string) => string[],
    t: TFunction,
}) => {

    const popoverProps: PopoverWrapProps = {
        type: PopoverType.click,
        popupId: 'testPopup',
        className: 'arrow-none',
        children: <MoreIcon cursor={'pointer'}/>,
        popoverContent: <ActionPopContent {...{isLp, market, getMarketArrayListCallback,allowTrade, t}} />,
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
        },
        transformOrigin: {
            vertical: 'top',
            horizontal: 'right',
        },
    } as PopoverWrapProps

    return <GridStyled container spacing={1} justifyContent={'space-between'} alignItems={'center'}>
        <Box display={'flex'}>
            <Grid item>
                <Button variant={'text'} size={'medium'} color={'primary'}
                        onClick={() => onShowDeposit(tokenValue)}>{t('labelDeposit')}</Button>
            </Grid>
            <Grid item>
                <Button variant={'text'} size={'medium'} color={'primary'}
                        onClick={() => onShowTransfer(tokenValue)}>{t('labelTransfer')}</Button>
            </Grid>
            {!isLp && <Grid item>
                <Button variant={'text'} size={'medium'} color={'primary'}
                        onClick={() => onShowWithdraw(tokenValue)}>{t('labelWithdrawAction')}</Button>
            </Grid>}
        </Box>
        <>
            {!isLp && allowTrade?.order?.enable &&
            <Grid item marginTop={1}>
            <Popover {...{...popoverProps}}/>
            </Grid>}
            {isLp && <Grid item marginTop={1}>
            <Popover {...{...popoverProps}}/>
            </Grid>}
        </>
        
    </GridStyled>
})
export default ActionMemo;

