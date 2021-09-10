import { headerRoot } from '@loopring-web/common-resources'


import { Toolbar, } from '@mui/material'

import { useHeader } from './hook'
import { useConfirmation } from 'stores/localStore/confirmation'
import { withTranslation } from 'react-i18next'

import { BottomRule, Header as HeaderUI, HideOnScroll, } from '@loopring-web/component-lib'
import { withRouter } from 'react-router-dom'
import { RouteComponentProps } from 'react-router';

const Header = withTranslation('common')(withRouter(({t,location, ...rest}: any & RouteComponentProps) => {

    const {
        headerToolBarData,
        headerMenuData,
    } = useHeader()

    const {confirmWrapper, confirmation} = useConfirmation()

    return (<>
        <HideOnScroll>
            <HeaderUI {...rest} headerMenuData={headerMenuData} headerToolBarData={headerToolBarData}
                      selected={location.pathname === '/' ? headerRoot : location.pathname}></HeaderUI>
        </HideOnScroll>
        <Toolbar/>
        <BottomRule isShow={!confirmation?.confirmed}
                    content={t('labelAgreeLoopringTxt')} btnTxt={t('labelCookiesAgree')}
                    clickToConfirm={() => confirmWrapper()}/>
    </>)
}))

export default Header
