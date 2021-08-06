import React from 'react'

import { Header as HeaderUI, HideOnScroll, } from '@loopring-web/component-lib'

import { headerRoot } from '@loopring-web/common-resources'

import { useLocation } from 'react-router-dom'

import { Toolbar, } from '@material-ui/core'
import { useHeader } from './hook'

const Header = ({...rest}: any) => {
    const location = useLocation()

    const {
        headerToolBarData,
        headerMenuData,

    } = useHeader()

    return (<>
        <HideOnScroll>
            <HeaderUI {...rest} headerMenuData={headerMenuData} headerToolBarData={headerToolBarData}
                      selected={location.pathname === '/' ? headerRoot : location.pathname}></HeaderUI>

        </HideOnScroll>
        <Toolbar/>

    </>)
}
export default Header



