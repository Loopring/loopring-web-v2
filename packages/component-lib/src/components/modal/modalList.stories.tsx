import styled from '@emotion/styled'
import React from 'react'
import { Meta, Story } from '@storybook/react/types-6-0'
import { withTranslation } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { Box, Button } from '@material-ui/core'
import { gatewayList } from '@loopring-web/common-resources'
import {
    MetaMaskProcess,
    ModalWalletConnect,
    ProviderMenu,
    SuccessConnect,
    WalletConnectProcess,
    WalletConnectQRCode,
    WalletConnectStep
} from './WalletConnect'
import { ModalQRCode, QRCodePanel } from './QRCode'
import { FailedConnect } from './WalletConnect/FailedConnect';
import {
    AccountBaseProps,
    AccountStep,
    ApproveAccount,
    Depositing,
    FailedDeposit,
    FailedUnlock,
    HadAccount,
    ModalAccount,
    NoAccount,
    ProcessUnlock,
    SuccessUnlock,
} from './AccountInfo';
import { coinMap, CoinType, walletMap } from '../../static';
import { DepositPanel, DepositProps, SwapTradeData, SwitchData, TradeBtnStatus } from '../panel';

const Style = styled.div`
  color: #fff;
  flex: 1;
  height: 100%;
  flex: 1;
`


let tradeData: any = {};
let depositProps: DepositProps<any, any> = {
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
    },
}
const Template: Story<any> = withTranslation()(({...rest}: any) => {
    const [openAccount, setOpenAccount] = React.useState(false)
    const [openWallet, setOpenWallet] = React.useState(false)
    const [openQRCode, setOpenQRCode] = React.useState(false)
    gatewayList[ 0 ] = {
        ...gatewayList[ 0 ],
        handleSelect: () => console.log('metaMask 11')
    };
    const url: string = 'xxxxxx'
    const walletList = React.useMemo(() => {
        return Object.values({
            [ WalletConnectStep.Provider ]: <ProviderMenu gatewayList={gatewayList} {...{...rest}}/>,
            [ WalletConnectStep.MetaMaskProcessing ]: <MetaMaskProcess/>,
            [ WalletConnectStep.WalletConnectProcessing ]: <WalletConnectProcess/>,
            [ WalletConnectStep.WalletConnectQRCode ]: <WalletConnectQRCode url={url}/>,
            [ WalletConnectStep.SuccessConnect ]: <SuccessConnect/>,
            [ WalletConnectStep.FailedConnect ]: <FailedConnect handleRetry={() => {
            }}/>,
        })

    }, [url])
    const accountInfoProps: AccountBaseProps = {
        addressShort: '0x123...8784',
        address: '0x123567243o24o242423098784',
        level: 'VIP 1',
        connectBy: 'MetaMask',
        etherscanLink: 'https://material-ui.com/components/material-icons/',
        mainBtn: <Button variant={'contained'} size={'small'} color={'primary'} onClick={() => console.log('my event')}>My
            button</Button>
    }

    const accountList = React.useMemo(() => {
        return Object.values({
            [ AccountStep.NoAccount ]: <NoAccount  {...accountInfoProps}/>,
            [ AccountStep.Deposit ]: <DepositPanel  {...{...rest, ...depositProps}} > </DepositPanel>,
            [ AccountStep.Depositing ]: <Depositing/>,
            [ AccountStep.FailedDeposit ]: <FailedDeposit/>,
            [ AccountStep.ApproveAccount ]: <ApproveAccount/>,
            [ AccountStep.ProcessUnlock ]: <ProcessUnlock/>,
            [ AccountStep.SuccessUnlock ]: <SuccessUnlock/>,
            [ AccountStep.FailedUnlock ]: <FailedUnlock/>,
            [ AccountStep.HadAccount ]: <HadAccount account={{} as any} {...accountInfoProps}/>,
        })

    }, [])

    return (
        <>
            <Style>
                <MemoryRouter initialEntries={['/']}>
                    {walletList.map((panel, index) => {
                        return <Box key={index}>
                            {panel}
                        </Box>
                    })}
                    <Button variant={'outlined'} size={'small'} color={'primary'} style={{marginRight: 8}}
                            onClick={() => setOpenWallet(true)}>Connect wallet</Button>
                    <ModalWalletConnect open={openWallet} onClose={() => setOpenWallet(false)}
                                        panelList={walletList} step={WalletConnectStep.Provider}/>


                    {accountList.map((panel, index) => {
                        return <Box key={index}>
                            {panel}
                        </Box>
                    })}

                    <Button variant={'outlined'} size={'small'} color={'primary'} style={{marginRight: 8}}
                            onClick={() => setOpenAccount(true)}>Connect wallet</Button>
                    <ModalAccount open={openAccount} onClose={() => setOpenAccount(false)}
                                  panelList={accountList} step={WalletConnectStep.Provider}/>


                    <Button variant={'outlined'} size={'medium'} color={'primary'} onClick={() => setOpenQRCode(true)}>QR
                        Code</Button>
                    <ModalQRCode open={openQRCode} onClose={() => setOpenQRCode(false)} title={'title'}
                                 description={'my description'} url="http://www.163.com"/>
                    <QRCodePanel {...{...rest}} description="Ox123213123123" url="http://www.163.com"
                                 handleClick={() => {
                                     console.log('click')
                                 }}/>
                    {/*<WrapTransferPanel/>*/}
                    {/*<WrapDepositPanel/>*/}
                    {/*<WrapWithdrawPanel />*/}
                </MemoryRouter>
            </Style>
        </>
    )
}) as Story<any>

export const ModalListStory = Template.bind({})

export default {
    title: 'components/ModalList',
    component: ModalWalletConnect,
    argTypes: {},
} as Meta
