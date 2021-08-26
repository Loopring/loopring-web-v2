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
    AccountStep,
    ActiveAccountProcess,
    DepositApproveProcess,
    FailedDeposit,
    FailedTokenAccess,
    FailedUnlock,
    ModalAccount,
    ProcessUnlock,
    SuccessUnlock,
    TokenAccessProcess,
    UpdateAccSigWarning,
    UpdateAccUserDenied,
} from './AccountInfo';
import { account, coinMap, CoinType, walletMap } from '../../static';
import { DepositProps, SwapTradeData, SwitchData, TradeBtnStatus } from '../index';
import { DepositWrap } from '../panel/components';
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

const coinInfo = coinMap[ 'USDC' ]
const Template: Story<any> = withTranslation()(({...rest}: any) => {
    const [openAccount, setOpenAccount] = React.useState(false)

    gatewayList[ 0 ] = {
        ...gatewayList[ 0 ],
        handleSelect: () => console.log('metaMask 11'),
    };

    const mainBtn = React.useMemo(() => {
        return <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
        }}>{'unlock'} </Button>
    }, []);
    const accountInfoProps: AccountBaseProps = {
        ...account,
        level: 'VIP 1',
        etherscanUrl: 'https://material-ui.com/components/material-icons/'
    }
    const accAddress = '0xcEd11e039a5C50927a17a8D4632616DFa8F72BF6'
    const etherscanLink =  accAddress
    const { nameList, accountList, } = React.useMemo(() => {
        const accountMap = {
            [ AccountStep.Deposit ]: {view: <DepositWrap _height={480} _width={400}  {...{...rest, ...depositProps}} />,},
            [ AccountStep.DepositFailed ]: {view: <FailedDeposit {...rest} label={rest.t('depositTitleAndActive')}
                                                          onRetry={() => undefined}
                                                          etherscanLink={accountInfoProps.etherscanUrl}/>,},
            [ AccountStep.ProcessUnlock ]: {view: <ProcessUnlock {...{providerName: ConnectProviders.MetaMask, ...rest}}/>,},
            [ AccountStep.SuccessUnlock ]: {view: <SuccessUnlock {...{...rest, onClose: () => undefined}}/>,},
            [ AccountStep.FailedUnlock ]: {view: <FailedUnlock {...rest} onRetry={() => undefined}/>,},
            [ AccountStep.TokenApproveInProcess ]: {view: <TokenAccessProcess label={rest.t('depositTitleAndActive')} {...{
                ...rest,
                coinInfo,
                providerName: ConnectProviders.MetaMask
            }}/>,},
            [ AccountStep.DepositApproveProcess ]: {view: <DepositApproveProcess label={rest.t('depositTitleAndActive')} {...{
                ...rest,
                providerName: ConnectProviders.MetaMask
            }}/>,},
            [ AccountStep.UpdateAccountInProcess ]: {view: <ActiveAccountProcess label={rest.t('depositTitleAndActive')} {...{
                ...rest,
                providerName: ConnectProviders.MetaMask
            }}/>,},
            [ AccountStep.TokenApproveFailed ]: {view: <FailedTokenAccess {...{...rest, coinInfo}}/>,},

            [ AccountStep.UpdateAccountUserDenied ]: {view: <UpdateAccUserDenied {...{...rest, coinInfo}}/>,},
            [ AccountStep.UpdateAccountSigWarning ]: {view: <UpdateAccSigWarning {...{...rest, coinInfo}}/>,},
        }

        return { nameList: Object.keys(accountMap), accountList: Object.values(accountMap) }

    }, [])

    return (
        <>
            <Style>
                <MemoryRouter initialEntries={['/']}>
                    <Box paddingTop={2} paddingX={2} width={180} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                        {/*<QRCodePanel {...{*/}
                        {/*    ...rest, t, title: '', description: '',*/}
                        {/*    url: etherscanLink*/}
                        {/*}} />*/}
                        <QRCode value={etherscanLink} size={80} style={{ backgroundColor: '#fff'}} aria-label={`link:${etherscanLink}`}/>
                        <Typography  marginTop={2} variant={'body2'} color={'textSecondary'}  style={{wordBreak:'break-all'}}>{accAddress}</Typography>
                        <Button onClick={() => {

                        }}>
                            <Typography variant={'body2'} > {'labelCopyAddress'} </Typography>
                        </Button>
                    </Box>
                    <Grid container spacing={2}>

                        {accountList.map((panel, index) => {
                            return (<>
                                <Box key={index} display={'flex'} flexDirection={'column'} width={480} height={400} padding={2}
                                        justifyContent={'center'} alignItems={'stretch'}>
                                <Typography  marginTop={2} variant={'body2'} color={'textSecondary'}  style={{wordBreak:'break-all'}}>{AccountStep[nameList[index]]}</Typography>
                                            
                                {panel.view}
                            </Box>
                            </>)
                        })}
                    </Grid>
                    <Button variant={'outlined'} size={'small'} color={'primary'} style={{marginRight: 8}}
                            onClick={() => setOpenAccount(true)}>Connect wallet</Button>
                    <ModalAccount open={openAccount} onClose={() => setOpenAccount(false)}
                                  panelList={accountList} step={AccountStep.Deposit}/>
                                  
                </MemoryRouter>
            </Style>
        </>
    )
}) as Story<any>

// @ts-ignore
export const ModalListStory = Template.bind({})

export default {
    title: 'components/account_list',
    component: ModalWalletConnect,
    argTypes: {},
} as Meta
