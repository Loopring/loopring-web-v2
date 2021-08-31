import styled from '@emotion/styled'
import React from 'react'
import { Meta, Story } from '@storybook/react/types-6-0'
import { withTranslation } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { Button, Grid, Typography } from '@material-ui/core'
import { ConnectProviders, gatewayList } from '@loopring-web/common-resources'
import {
    ModalWalletConnect,
} from './WalletConnect'

import {
   AccountBaseProps,
    AccountStepNew as AccountStep,

    NoAccount,
    UpdateAccount,
    HadAccount,

    Deposit_Approve_WaitForAuth,
    Deposit_Approve_Denied,
    Deposit_Approve_Submited,
    Deposit_WaitForAuth,
    Deposit_Denied,
    Deposit_Failed,
    Deposit_Submited,

    Transfer_WaitForAuth,
    Transfer_First_Method_Denied,
    Transfer_User_Denied,
    Transfer_In_Progress,
    Transfer_Success,
    Transfer_Failed,

    Withdraw_WaitForAuth,
    Withdraw_First_Method_Denied,
    Withdraw_User_Denied,
    Withdraw_In_Progress,
    Withdraw_Success,
    Withdraw_Failed,

    CreateAccount_Approve_WaitForAuth,
    CreateAccount_Approve_Denied,
    CreateAccount_Approve_Submited,
    CreateAccount_WaitForAuth,
    CreateAccount_Denied,
    CreateAccount_Failed,
    CreateAccount_Submited,

    UpdateAccount_Approve_WaitForAuth,
    UpdateAccount_First_Method_Denied,
    UpdateAccount_User_Denied,
    UpdateAccount_Success,
    UpdateAccount_Submited,
    UpdateAccount_Failed,
} from './ModalPanels';
import { account, coinMap, CoinType, walletMap } from '../../static';
import { DepositProps, SwapTradeData, SwitchData, TradeBtnStatus } from '../index';
import { Box } from '@material-ui/core/';

const Style = styled.div`
  
  flex: 1;
  height: 100%;
`

let tradeData: any = {};
let depositProps: DepositProps<any, any> = {
    isNewAccount: true,
    tradeData,
    coinMap,
    walletMap,
    depositBtnStatus: TradeBtnStatus.AVAILABLE,
    onDepositClick: (tradeData: SwapTradeData<CoinType>) => {
        console.log('Swap button click', tradeData);
    },
    handlePanelEvent: async (props: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
        return new Promise((res) => {
            setTimeout(() => {
                console.log('wait 100, with props', props, switchType);
                res();
            }, 500)
        })
    }
}

const Template: Story<any> = withTranslation()(({ ...rest }: any) => {

    gatewayList[0] = {
        ...gatewayList[0],
        handleSelect: () => console.log('metaMask 11'),
    };

    const mainBtn = React.useMemo(() => {
        return <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
        }}>{'unlock'} </Button>
    }, []);
    const accountInfoProps:AccountBaseProps = {
        ...account,
        level: 'VIP 1',
        etherscanUrl: 'https://material-ui.com/components/material-icons/'
    }
    const accAddress = '0xcEd11e039a5C50927a17a8D4632616DFa8F72BF6'

    const retryBtn = React.useMemo(() => {
        return {
            btnTxt: 'retry',
            callback: () => {
            }
        }
    }, [])

    const closeBtn = React.useMemo(() => {
        return {
            btnTxt: 'close',
            callback: () => {
            }
        }
    }, [])

    const { nameList0, accountList0, } = React.useMemo(() => {
        const accountMap = {
            [AccountStep.NoAccount]: {
                view: <NoAccount {...{
                    ...accountInfoProps, goDeposit: () => {
                    }
                }} />,
            },
            [AccountStep.UpdateAccount]: {
                view: <UpdateAccount  {...{ ...accountInfoProps, ...rest }}
                    goActiveAccount={() => undefined} />,
            },
            [AccountStep.HadAccount]: { view: <HadAccount mainBtn={mainBtn} {...accountInfoProps} />, },
        }

        return { nameList0: Object.keys(accountMap), accountList0: Object.values(accountMap) }

    }, [])

    const { nameList, accountList, } = React.useMemo(() => {
        const accountMap = {

            [AccountStep.Deposit_Approve_WaitForAuth]: {
                view: <Deposit_Approve_WaitForAuth symbol={'DAI'}
                    providerName={ConnectProviders.MetaMask} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Deposit_Approve_Denied]: {
                view: <Deposit_Approve_Denied btnInfo={retryBtn} symbol={'DAI'}
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Deposit_Approve_Submited]: {
                view: <Deposit_Approve_Submited btnInfo={closeBtn} symbol={'DAI'} txCheck={
                    {
                        route: '',
                        callback: () => {

                        }
                    }} link = {
                        {
                            name: '最近充值记录',
                            url: 'http://demo.com',
                        }
                    }

                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Deposit_WaitForAuth]: {
                view: <Deposit_WaitForAuth value={'100'} symbol={'USDT'}
                    providerName={ConnectProviders.WalletConnect} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Deposit_Denied]: {
                view: <Deposit_Denied value={'100'} symbol={'USDT'} btnInfo={retryBtn} {...{
                    ...rest
                }} />,
            },
            [AccountStep.Deposit_Failed]: {
                view: <Deposit_Failed btnInfo={closeBtn} value={'100'} symbol={'USDT'}
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Deposit_Submited]: {
                view: <Deposit_Submited value={'100'} symbol={'USDT'} txCheck={
                    {
                        route: '',
                        callback: () => {

                        }
                    }
                }
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
        }

        return { nameList: Object.keys(accountMap), accountList: Object.values(accountMap) }

    }, [])

    const { nameList2, accountList2, } = React.useMemo(() => {
        const accountMap = {
            [AccountStep.Transfer_WaitForAuth]: {
                view: <Transfer_WaitForAuth
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Transfer_First_Method_Denied]: {
                view: <Transfer_First_Method_Denied
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Transfer_User_Denied]: {
                view: <Transfer_User_Denied
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Transfer_In_Progress]: {
                view: <Transfer_In_Progress {...{
                    ...rest
                }} />,
            },
            [AccountStep.Transfer_Success]: {
                view: <Transfer_Success value={'100'} symbol={'USDT'}
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Transfer_Failed]: {
                view: <Transfer_Failed value={'100'} symbol={'USDT'}
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
        }

        return { nameList2: Object.keys(accountMap), accountList2: Object.values(accountMap) }

    }, [])

    const { nameList3, accountList3, } = React.useMemo(() => {
        const accountMap = {
            [AccountStep.Withdraw_WaitForAuth]: {
                view: <Withdraw_WaitForAuth
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Withdraw_First_Method_Denied]: {
                view: <Withdraw_First_Method_Denied
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Withdraw_User_Denied]: {
                view: <Withdraw_User_Denied
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Withdraw_In_Progress]: {
                view: <Withdraw_In_Progress
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Withdraw_Success]: {
                view: <Withdraw_Success
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Withdraw_Failed]: {
                view: <Withdraw_Failed value={'100'} symbol={'USDT'}
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
        }

        return { nameList3: Object.keys(accountMap), accountList3: Object.values(accountMap) }

    }, [])

    const { nameList4, accountList4, } = React.useMemo(() => {
        const accountMap = {
            [AccountStep.CreateAccount_Approve_WaitForAuth]: {
                view: <CreateAccount_Approve_WaitForAuth symbol={'USDT'}
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.CreateAccount_Approve_Denied]: {
                view: <CreateAccount_Approve_Denied symbol={'USDT'}
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.CreateAccount_Approve_Submited]: {
                view: <CreateAccount_Approve_Submited
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.CreateAccount_WaitForAuth]: {
                view: <CreateAccount_WaitForAuth
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.CreateAccount_Denied]: {
                view: <CreateAccount_Denied
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.CreateAccount_Failed]: {
                view: <CreateAccount_Failed
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.CreateAccount_Submited]: {
                view: <CreateAccount_Submited
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
        }

        return { nameList4: Object.keys(accountMap), accountList4: Object.values(accountMap) }

    }, [])

    const { nameList5, accountList5, } = React.useMemo(() => {
        const accountMap = {
            [AccountStep.UpdateAccount_Approve_WaitForAuth]: {
                view: <UpdateAccount_Approve_WaitForAuth
                    providerName={ConnectProviders.MetaMask} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.UpdateAccount_First_Method_Denied]: {
                view: <UpdateAccount_First_Method_Denied btnInfo={retryBtn} {...{
                    ...rest
                }} />,
            },
            [AccountStep.UpdateAccount_User_Denied]: {
                view: <UpdateAccount_User_Denied btnInfo={retryBtn} {...{
                    ...rest
                }} />,
            },
            [AccountStep.UpdateAccount_Success]: {
                view: <UpdateAccount_Success btnInfo={closeBtn}  {...{
                    ...rest
                }} />,
            },
            [AccountStep.UpdateAccount_Submited]: {
                view: <UpdateAccount_Submited btnInfo={closeBtn} {...{
                    ...rest
                }} />,
            },
            [AccountStep.UpdateAccount_Failed]: {
                view: <UpdateAccount_Failed btnInfo={closeBtn} {...{
                    ...rest
                }} />,
            },
        }

        return { nameList5: Object.keys(accountMap), accountList5: Object.values(accountMap) }

    }, [])

    const fontSize = '30px'
    const color = 'white'
    const width = 400

    const w = 540
    const h = 600

    return (
        <>
            <Style>
                <MemoryRouter initialEntries={['/']}>
                    <Box paddingTop={2} paddingX={2} width={width} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                        <Typography fontSize={fontSize} color={color} variant={'body2'} > Old Version </Typography>
                    </Box>
                    <Grid container spacing={0}>

                        {accountList0.map((panel, index) => {
                            return (<>
                                <Box key={index} display={'flex'} flexDirection={'column'} width={w} height={h} padding={2}
                                    justifyContent={'center'} alignItems={'stretch'}>
                                    <Typography marginTop={2} variant={'body2'} color={'textSecondary'} style={{ wordBreak: 'break-all' }}>{AccountStep[nameList0[index]]}</Typography>

                                    {panel.view}
                                </Box>
                            </>)
                        })}
                    </Grid>

                    <Box paddingTop={2} paddingX={2} width={width} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                        <Typography fontSize={fontSize} color={color} variant={'body2'} > Deposit</Typography>
                    </Box>
                    <Grid container spacing={2}>

                        {accountList.map((panel, index) => {
                            return (<>
                                <Box key={index} display={'flex'} flexDirection={'column'} width={w} height={h}  padding={2}
                                    justifyContent={'center'} alignItems={'stretch'}>
                                    <Typography marginTop={2} variant={'body2'} color={'textSecondary'} style={{ wordBreak: 'break-all' }}>{AccountStep[nameList[index]]}</Typography>

                                    {panel.view}
                                </Box>
                            </>)
                        })}
                    </Grid>

                    <Box paddingTop={2} paddingX={2} width={width} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                        <Typography fontSize={fontSize} color={color} variant={'body2'} > Transfer </Typography>
                    </Box>

                    <Grid container spacing={2}>

                        {accountList2.map((panel, index) => {
                            return (<>
                                <Box key={index} display={'flex'} flexDirection={'column'} width={w} height={h}  padding={2}
                                    justifyContent={'center'} alignItems={'stretch'}>
                                    <Typography marginTop={2} variant={'body2'} color={'textSecondary'} style={{ wordBreak: 'break-all' }}>{AccountStep[nameList2[index]]}</Typography>

                                    {panel.view}
                                </Box>
                            </>)
                        })}
                    </Grid>

                    <Box paddingTop={2} paddingX={2} width={width} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                        <Typography fontSize={fontSize} color={color} variant={'body2'} > Withdraw </Typography>
                    </Box>

                    <Grid container spacing={2}>

                        {accountList3.map((panel, index) => {
                            return (<>
                                <Box key={index} display={'flex'} flexDirection={'column'} width={w} height={h}  padding={2}
                                    justifyContent={'center'} alignItems={'stretch'}>
                                    <Typography marginTop={2} variant={'body2'} color={'textSecondary'} style={{ wordBreak: 'break-all' }}>{AccountStep[nameList3[index]]}</Typography>

                                    {panel.view}
                                </Box>
                            </>)
                        })}
                    </Grid>

                    <Box paddingTop={2} paddingX={2} width={width} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                        <Typography fontSize={fontSize} color={color} variant={'body2'} > Create Layer2 Account </Typography>
                    </Box>

                    <Grid container spacing={2}>

                        {accountList4.map((panel, index) => {
                            return (<>
                                <Box key={index} display={'flex'} flexDirection={'column'} width={w} height={h}  padding={2}
                                    justifyContent={'center'} alignItems={'stretch'}>
                                    <Typography marginTop={2} variant={'body2'} color={'textSecondary'} style={{ wordBreak: 'break-all' }}>{AccountStep[nameList4[index]]}</Typography>

                                    {panel.view}
                                </Box>
                            </>)
                        })}
                    </Grid>

                    <Box paddingTop={2} paddingX={2} width={width} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                        <Typography fontSize={fontSize} color={color} variant={'body2'} > Update Layer2 Account </Typography>
                    </Box>

                    <Grid container spacing={2}>

                        {accountList5.map((panel, index) => {
                            return (<>
                                <Box key={index} display={'flex'} flexDirection={'column'} width={w} height={h} padding={2}
                                    justifyContent={'center'} alignItems={'stretch'}>
                                    <Typography marginTop={2} variant={'body2'} color={'textSecondary'} style={{ wordBreak: 'break-all' }}>{AccountStep[nameList5[index]]}</Typography>

                                    {panel.view}
                                </Box>
                            </>)
                        })}
                    </Grid>

                </MemoryRouter>
            </Style>
        </>
    )
}) as Story<any>

// @ts-ignore
export const ModalListStory = Template.bind({})

export default {
    title: 'components/account_list_new',
    component: ModalWalletConnect,
    argTypes: {},
} as Meta
