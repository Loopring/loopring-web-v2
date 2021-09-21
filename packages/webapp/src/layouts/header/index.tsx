import { headerRoot } from '@loopring-web/common-resources'


import { Container, Toolbar, } from '@mui/material'

import { useHeader } from './hook'
import { useConfirmation } from 'stores/localStore/confirmation'
import { withTranslation } from 'react-i18next'

import { BottomRule, Header as HeaderUI, HideOnScroll, } from '@loopring-web/component-lib'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router';
import React from 'react';

const Header = withTranslation('common')(withRouter(({t,location,isHideOnScroll = false,...rest}: any & RouteComponentProps) => {

    const {
        headerToolBarData,
        headerMenuData,                                                     
    } = useHeader()

    const {confirmWrapper, confirmation} = useConfirmation()

    return (<>
        {isHideOnScroll ?< HideOnScroll window={undefined}>
            <HeaderUI isWrap={false} {...rest}
                      headerMenuData={headerMenuData}
                      headerToolBarData={headerToolBarData}
                      selected={location.pathname === '/' ? headerRoot : location.pathname}></HeaderUI>
        </HideOnScroll>: <HeaderUI {...rest} headerMenuData={headerMenuData} headerToolBarData={headerToolBarData}
                                      selected={location.pathname === '/' ? headerRoot : location.pathname}></HeaderUI>}
        <Toolbar/>
        <BottomRule isShow={!confirmation?.confirmed}
                    content={t('labelAgreeLoopringTxt')} btnTxt={t('labelCookiesAgree')}
                    clickToConfirm={() => confirmWrapper()}/>
    </>)
}))

export default Header
