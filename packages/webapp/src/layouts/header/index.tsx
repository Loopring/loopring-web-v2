import React from 'react'

import {
    Header as HeaderUI,
    HideOnScroll,
} from '@loopring-web/component-lib'

import { headerRoot } from '@loopring-web/common-resources'

import { useLocation } from 'react-router-dom'

import { Toolbar, } from '@material-ui/core'
import { useHeader } from './hook'
// import { ModalAccountInfo } from '../../../modal/AccountModal';
// import { ModalWalletConnectPanel } from '../../../modal/WalletModal';

const Header = ({...rest}: any) => {



    const location = useLocation()

    const {
        headerToolBarData,
        headerMenuData,
        // gatewayList,
        // isShowConnect,
        // setShowAccount,
        // isShowAccount,
        // // setShowAccount,
        // setShowConnect,
        // etherscanUrl,
        // open,
        // setOpen,
        // openConnect,
        // setOpenConnect,
        // account,
        // accountInfoProps,
        // showAccountInfo
    } = useHeader()


    // const {t} = useTranslation('common')




    return (<>


        <HideOnScroll>
            {/*<>*/}
            {/*{process.env.NODE_ENV !== 'production' */}
            {/*&& JSON.stringify(account?.readyState) + '| addr:' + account.accAddress + '|\t'*/}
            {/*+ account?.connectName + '/' + JSON.stringify(isShowConnect)*/}
            {/*+ ' |isShowConnect:' + (AccountStep[isShowConnect.step])}*/}
            {/*</>*/}
            {/*<>*/}
            {/*{process.env.NODE_ENV !== 'production' */}
            {/*&& JSON.stringify(isShowAccount)*/}
            {/*+ ' |isShowAccount:' + (AccountStep[isShowAccount.step])}*/}
            {/*</>*/}

            <HeaderUI {...rest} headerMenuData={headerMenuData} headerToolBarData={headerToolBarData}
                      selected={location.pathname === '/' ? headerRoot : location.pathname}></HeaderUI>

        </HideOnScroll>
        <Toolbar/>

    </>)
}


export default Header



