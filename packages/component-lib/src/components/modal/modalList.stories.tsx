import styled from '@emotion/styled'
import React from 'react'
import { Meta, Story } from '@storybook/react/types-6-0'
import { withTranslation } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { Button } from '@material-ui/core'
import { gatewayList } from '@loopring-web/common-resources'
import { ModalWalletConnect, WalletConnectPanel } from './WalletConnect'
import { ModalQRCode, QRCodePanel } from './QRCode'

// import { GlobalStyles, Grid } from '@material-ui/core'
// import { globalCss } from '@loopring-web/common-resources'
// import { css, Theme, useTheme } from '@emotion/react'
// import { ModalWalletConnect } from './WalletConnect'
// import { ModalQRCode } from './QRCode'
// import { Button } from '../basic-lib/btns'

// import { useState } from 'react'
// import {  IBData } from '@loopring-web/common-resources'
// import { coinMap, CoinType, walletMap } from '../../static';
// import { SwitchData, SwapTradeData } from './Interface'
// import { DepositModal } from '../panel/Deposit';
// import { ResetModal } from '../panel/Reset';
// import { WithdrawModal } from '../panel/Withdraw';

const Style = styled.div`
	color: #fff;
	flex: 1;
	height: 100%;
	flex: 1;
`

// const WrapTransferPanel = (rest: any) => {
//     const [open, setOpen] = React.useState(false);
//
//     let resetProps = {
//         tradeData: {belong: undefined},
//         open,
//         coinMap,
//         walletMap,
//         onClose:() => setOpen(false),
//         onCoinValueChange: (transferData: SwitchData<IBData<CoinType>>) => {
//             console.log('onCoinValueChange', transferData);
//         },
//         doBeforeSwitch: async (props: SwitchData<SwapTradeData<CoinType>>) => {
//             return new Promise((res: any) => {
//                 console.log('wait 100, with props', props);
//                 res();
//             })
//         },
//         onResetClick: (tradeData: SwapTradeData<CoinType>) => {
//             console.log('Transfer button click', tradeData);
//         },
//     }
//
//     return <> <Grid item sm={6}>
//         <Button variant={'outlined'} size={'small'} color={'primary'} onClick={() => setOpen(true)}>Open Reset</Button>
//         <ResetModal {...resetProps} {...rest}> </ResetModal>
//     </Grid>
//         {/*<Grid item sm={6}>*/}
//         {/*    <TransferModal  {...rest}> </TransferModal>*/}
//         {/*</Grid>*/}
//     </>
//
// }

// const WrapDepositPanel = (rest: any) => {
//     const [open, setOpen] = React.useState(false);
//
//     const depositProps = {
//         tradeData: {belong: undefined},
//         open,
//         coinMap,
//         walletMap,
//         onClose:() => setOpen(false),
//         onCoinValueChange: (transferData: SwitchData<IBData<CoinType>>) => {
//             console.log('onCoinValueChange', transferData);
//         },
//         doBeforeSwitch: async (props: SwitchData<SwapTradeData<CoinType>>) => {
//             return new Promise((res: any) => {
//                 console.log('wait 100, with props', props);
//                 res();
//             })
//         },
//         onDepositClick: (tradeData: SwapTradeData<CoinType>) => {
//             console.log('Transfer button click', tradeData);
//         },
//     }
//
//     return <>
//         <Grid item sm={6}>
//             <Button variant={'outlined'} size={'small'} color={'primary'} onClick={() => setOpen(true)}>Open Deposit</Button>
//             <DepositModal {...depositProps} {...rest}> </DepositModal>
//         </Grid>
//     </>
// }

// const WrapWithdrawPanel = (rest: any) => {
//     const [open, setOpen] = React.useState(false);
//
//     const withdrawProps = {
//         tradeData: {belong: undefined},
//         open,
//         coinMap,
//         walletMap,
//         onClose:() => setOpen(false),
//         onCoinValueChange: (transferData: SwitchData<IBData<CoinType>>) => {
//             console.log('onCoinValueChange', transferData);
//         },
//         doBeforeSwitch: async (props: SwitchData<SwapTradeData<CoinType>>) => {
//             return new Promise((res: any) => {
//                 console.log('wait 100, with props', props);
//                 res();
//             })
//         },
//         onWithdrawClick: (tradeData: SwapTradeData<CoinType>) => {
//             console.log('Transfer button click', tradeData);
//         },
//     }
//
//     return <>
//         <Grid item sm={6}>
//             <Button variant={'outlined'} size={'small'} color={'primary'} onClick={() => setOpen(true)}>Open Withdraw</Button>
//             <WithdrawModal {...withdrawProps} {...rest}> </WithdrawModal>
//         </Grid>
//     </>
// }

// const Template: Story<any> = withTranslation()(() => {
const Template: Story<any> = withTranslation()(({...rest}: any) => {
    const [openWallet, setOpenWallet] = React.useState(false)
    const [openQRCode, setOpenQRCode] = React.useState(false)
    gatewayList[ 0 ] = {
        ...gatewayList[ 0 ],
        handleSelect: () => console.log('metaMask 11')
    };

    return (
        <>
            <Style>
                <MemoryRouter initialEntries={['/']}>
                    <Button variant={'outlined'} size={'small'} color={'primary'} style={{marginRight: 8}}
                            onClick={() => setOpenWallet(true)}>Connect wallet</Button>
                    <ModalWalletConnect open={openWallet} onClose={() => setOpenWallet(false)}
                                        gatewayList={gatewayList}/>
                    <WalletConnectPanel {...{...rest}} gatewayList={gatewayList}/>
                    <WalletConnectPanel {...{...rest}} gatewayList={gatewayList}
                                        handleSelect={(_event, key) => {
                                            console.log('defaule select event, click item key', key)
                                        }}/>

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
