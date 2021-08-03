import React from 'react'

import {
    Header as HeaderUI,
    HideOnScroll,
    ModalPanel
} from '@loopring-web/component-lib'

import { headerRoot } from '@loopring-web/common-resources'

import { useLocation } from 'react-router-dom'

import { Toolbar, } from '@material-ui/core'
import { useHeader, useModalProps } from './hook'
import { ModalAccountInfo } from '../AccountModal';
import { ModalWalletConnectPanel } from '../WalletModal';

const Header = ({...rest}: any) => {

    const {
        depositProps,
        withdrawProps,
        transferProps,
        resetProps,
        ammProps,
        swapProps,
    } = useModalProps()

    const location = useLocation()

    const {
        headerToolBarData,
        headerMenuData,
        // gatewayList,
        isShowConnect,
        setShowAccount,
        isShowAccount,
        // setShowAccount,
        setShowConnect,
        etherscanUrl,
        // open,
        // setOpen,
        // openConnect,
        // setOpenConnect,
        account,
        accountInfoProps,
        // showAccountInfo
    } = useHeader()


    // const {t} = useTranslation('common')


    const onClose = React.useCallback(() => {
        setShowAccount({isShow: false})
    }, [])

    return (<>

        <ModalPanel transferProps={transferProps} withDrawProps={withdrawProps}
                    depositProps={depositProps} resetProps={resetProps} ammProps={ammProps} swapProps={swapProps}/>

        <HideOnScroll>
            {process.env.NODE_ENV !== 'production' 
            && JSON.stringify(account?.readyState) + '| addr:' + account.accAddress + '|\t'
            + account?.connectName + '/' + JSON.stringify(isShowConnect)}

            <HeaderUI {...rest} headerMenuData={headerMenuData} headerToolBarData={headerToolBarData}
                      selected={location.pathname === '/' ? headerRoot : location.pathname}></HeaderUI>

        </HideOnScroll>
        <Toolbar/>
        <ModalWalletConnectPanel {...{
            ...rest,
            // step:connectStep,
            // gatewayList,
            open: isShowConnect.isShow,
            onClose: () => setShowConnect({isShow: false})
        }} />
        <ModalAccountInfo
            {...{
                ...rest,
                depositProps,
                etherscanUrl,
                open: isShowAccount.isShow,
                onClose: () => setShowAccount({isShow: false})
            }}
        ></ModalAccountInfo>
    </>)
}


export default Header



