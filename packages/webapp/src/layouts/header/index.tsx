import { useCallback, useState, } from 'react'

import {
    Header as HeaderUI,
    HideOnScroll,
    ModalWalletConnect,
    Toast,
} from '@loopring-web/component-lib'

import { headerRoot } from '@loopring-web/common-resources'

import { useLocation } from 'react-router-dom'

import { Toolbar, } from '@material-ui/core'

import { useHeader } from './hook'

import { useDisconnect, } from 'stores/account/hook'
import { ModalPanel, ModalQRCode, } from '@loopring-web/component-lib'
import { useModalProps } from './hook'

import { copyToClipBoard } from 'utils/obj_tools'
import { ModalAccountInfo } from '../../pages/AccountPage';
import { useTranslation } from 'react-i18next';
import { TOAST_TIME } from 'defs/common_defs'

const Header = ({ ...rest }: any) => {

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
        gatewayList,
        isShowConnect,
        isShowAccountInfo,
        setShowAccountInfo,
        // setShowAccountInfo,
        setShowConnect,
        // open,
        // setOpen,
        // openConnect,
        // setOpenConnect,
        account,
        accountInfoProps,
        // showAccountInfo
    } = useHeader()

    const { disconnect } = useDisconnect()

    const {t} = useTranslation('common')

    const onSwitch = useCallback(() => {
        setShowAccountInfo({isShow:false})
        setShowConnect({isShow:true})
    }, [setShowConnect,setShowAccountInfo])

    const [openQRCode, setOpenQRCode] = useState(false)

    const [copyToastOpen, setCopyToastOpen] = useState(false);

    return (<>
        <Toast alertText={t('Address Copied to Clipboard!')} open={copyToastOpen} 
            autoHideDuration={TOAST_TIME} setOpen={setCopyToastOpen} severity={"success"} />

        <ModalQRCode open={openQRCode} onClose={() => setOpenQRCode(false)} title={'ETH Address'}
            description={account?.accAddr} url={account?.accAddr} />

        <ModalPanel transferProps={transferProps} withDrawProps={withdrawProps} 
        depositProps={depositProps} resetProps={resetProps} ammProps={ammProps} swapProps={swapProps}/>

        <HideOnScroll>
            {process.env.NODE_ENV !== 'production' && JSON.stringify(account?.status) + '\t'
            + account?.connectName  + '/' + account?.connectNameTemp }

            <HeaderUI {...rest} headerMenuData={headerMenuData} headerToolBarData={headerToolBarData}
                selected={location.pathname === '/' ? headerRoot : location.pathname}></HeaderUI>

        </HideOnScroll>
        <Toolbar />

        <ModalWalletConnect {...{ ...rest, gatewayList, open:isShowConnect.isShow, onClose: () => setShowConnect({isShow:false}) }} />
        {<ModalAccountInfo
            open={isShowAccountInfo.isShow}
            onClose={() => {setShowAccountInfo({isShow:false})}}
            onCopy={() => {
                copyToClipBoard(account.accAddr);
                setCopyToastOpen(true)
            }}
            onViewQRCode={() => {
                setOpenQRCode(true)
            }}
            onDisconnect={() => {
                disconnect();
                setShowAccountInfo({isShow:false});
            }}
            onSwitch={onSwitch}
            {...{...accountInfoProps, ...rest}}></ModalAccountInfo>}
    </>)
}


export default Header



