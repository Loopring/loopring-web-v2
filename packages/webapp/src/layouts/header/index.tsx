import { headerRoot } from '@loopring-web/common-resources'


import { Container, Toolbar, } from '@mui/material'

import { useHeader } from './hook'
import { useConfirmation } from 'stores/localStore/confirmation'
import { withTranslation } from 'react-i18next'

import { BottomRule, Header as HeaderUI, HideOnScroll, } from '@loopring-web/component-lib'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router';
import React from 'react';
import { useSystem } from '../../stores/system';

const Header = withTranslation('common')(withRouter(({t,location,isHideOnScroll = false,...rest}: any & RouteComponentProps) => {

    const {
        headerToolBarData,
        headerMenuData,                                                     
    } = useHeader()

    const {confirmWrapper, confirmation} = useConfirmation()
    const {allowTrade} = useSystem()

    return (<>
        {isHideOnScroll ?< HideOnScroll window={undefined}>
            <HeaderUI isWrap={false} {...rest}
                      allowTrade={allowTrade}
                      headerMenuData={headerMenuData}
                      headerToolBarData={headerToolBarData}
                      selected={location.pathname === '/' ? headerRoot : location.pathname}></HeaderUI>
        </HideOnScroll>: <HeaderUI {...rest}
                                   allowTrade={allowTrade}
                                   headerMenuData={headerMenuData} headerToolBarData={headerToolBarData}
                                      selected={location.pathname === '/' ? headerRoot : location.pathname}></HeaderUI>}
        <Toolbar/>
        {/* <BottomRule isShow={!confirmation?.confirmed} */}
        <BottomRule isShow={false}
                    content={t('labelAgreeLoopringTxt')} btnTxt={t('labelCookiesAgree')}
                    clickToConfirm={() => confirmWrapper()}/>
    </>)
}))

export default Header
