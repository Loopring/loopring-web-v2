import { headerRoot } from '@loopring-web/common-resources'

import { useLocation } from 'react-router-dom'

import { Toolbar, } from '@material-ui/core'

import { useHeader } from './hook'
import { useConfirmation } from 'stores/localStore/confirmation'
import { withTranslation } from 'react-i18next'

import { BottomRule, Header as HeaderUI, HideOnScroll, } from '@loopring-web/component-lib'

const Header = withTranslation('common')(({t, ...rest}: any) => {
    const location = useLocation()

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
})

export default Header



