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
    ModalAccount,
} from './AccountInfo'

import {
    AccountBaseNewProps,
    AccountStepNew as AccountStep,
    Deposit_Approve_WaitForAuth,
    Deposit_Approve_Refused,
    Deposit_Approve_Submited,
    Deposit_WaitForAuth,
    Deposit_Refused,
    Deposit_Failed,
    Deposit_Submited,

    Transfer_WaitForAuth,
    Transfer_Refused,
    Transfer_Submited,
    Transfer_Success,
    Transfer_Failed,

    Withdraw_WaitForAuth,
    Withdraw_Refused,
    Withdraw_Submited,
    Withdraw_Success,
    Withdraw_Failed,
} from './ModalPanels';
import { account, coinMap, CoinType, walletMap } from '../../static';
import { DepositProps, SwapTradeData, SwitchData, TradeBtnStatus } from '../index';
import { Box } from '@material-ui/core/';
import QRCode from 'qrcode.react';

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

const coinInfo = coinMap['USDC']
const Template: Story<any> = withTranslation()(({ ...rest }: any) => {
    const [openAccount, setOpenAccount] = React.useState(false)

    gatewayList[0] = {
        ...gatewayList[0],
        handleSelect: () => console.log('metaMask 11'),
    };

    const mainBtn = React.useMemo(() => {
        return <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
        }}>{'unlock'} </Button>
    }, []);
    const accountInfoProps: AccountBaseNewProps = {
        ...account,
        level: 'VIP 1',
        etherscanUrl: 'https://material-ui.com/components/material-icons/'
    }
    const accAddress = '0xcEd11e039a5C50927a17a8D4632616DFa8F72BF6'
    const etherscanLink = accAddress
    const { nameList, accountList, } = React.useMemo(() => {
        const accountMap = {
            [AccountStep.Deposit_Approve_WaitForAuth]: {
                view: <Deposit_Approve_WaitForAuth
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Deposit_Approve_Refused]: {
                view: <Deposit_Approve_Refused
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Deposit_Approve_Submited]: {
                view: <Deposit_Approve_Submited
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Deposit_WaitForAuth]: {
                view: <Deposit_WaitForAuth
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Deposit_Refused]: {
                view: <Deposit_Refused
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Deposit_Failed]: {
                view: <Deposit_Failed
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Deposit_Submited]: {
                view: <Deposit_Submited
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
            [AccountStep.Transfer_Refused]: {
                view: <Transfer_Refused
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Transfer_Submited]: {
                view: <Transfer_Submited
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Transfer_Success]: {
                view: <Transfer_Success
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Transfer_Failed]: {
                view: <Transfer_Failed
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
            [AccountStep.Withdraw_Refused]: {
                view: <Withdraw_Refused
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
            [AccountStep.Withdraw_Submited]: {
                view: <Withdraw_Submited
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
                view: <Withdraw_Failed
                    providerName={account.connectName} {...{
                        ...rest
                    }} />,
            },
        }

        return { nameList3: Object.keys(accountMap), accountList3: Object.values(accountMap) }

    }, [])

    const fontSize = '30px'
    const color = 'red'

    return (
        <>
            <Style>
                <MemoryRouter initialEntries={['/']}>
                    <Box paddingTop={2} paddingX={2} width={180} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                        <Typography fontSize={fontSize} color={color} variant={'body2'} > Deposit</Typography>
                    </Box>
                    <Grid container spacing={2}>

                        {accountList.map((panel, index) => {
                            return (<>
                                <Box key={index} display={'flex'} flexDirection={'column'} width={480} height={400} padding={2}
                                    justifyContent={'center'} alignItems={'stretch'}>
                                    <Typography marginTop={2} variant={'body2'} color={'textSecondary'} style={{ wordBreak: 'break-all' }}>{AccountStep[nameList[index]]}</Typography>

                                    {panel.view}
                                </Box>
                            </>)
                        })}
                    </Grid>

                    <Box paddingTop={2} paddingX={2} width={180} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                        <Typography fontSize={fontSize} color={color} variant={'body2'} > Transfer </Typography>
                    </Box>

                    <Grid container spacing={2}>

                        {accountList2.map((panel, index) => {
                            return (<>
                                <Box key={index} display={'flex'} flexDirection={'column'} width={480} height={400} padding={2}
                                    justifyContent={'center'} alignItems={'stretch'}>
                                    <Typography marginTop={2} variant={'body2'} color={'textSecondary'} style={{ wordBreak: 'break-all' }}>{AccountStep[nameList2[index]]}</Typography>

                                    {panel.view}
                                </Box>
                            </>)
                        })}
                    </Grid>

                    <Box paddingTop={2} paddingX={2} width={180} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                        <Typography fontSize={fontSize} color={color} variant={'body2'} > Withdraw </Typography>
                    </Box>

                    <Grid container spacing={2}>

                        {accountList3.map((panel, index) => {
                            return (<>
                                <Box key={index} display={'flex'} flexDirection={'column'} width={480} height={400} padding={2}
                                    justifyContent={'center'} alignItems={'stretch'}>
                                    <Typography marginTop={2} variant={'body2'} color={'textSecondary'} style={{ wordBreak: 'break-all' }}>{AccountStep[nameList3[index]]}</Typography>

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
