import React from 'react'

import {
    ButtonComponentsMap,
    headerMenuData,
    headerToolBarData as initHeaderToolBarData,
} from '@loopring-web/common-resources'


export const useHeader = () => {
    const headerToolBarData = React.useMemo(() => {
        return initHeaderToolBarData.filter((ele) => {
            return ele.buttonComponent !== ButtonComponentsMap.WalletConnect
        })
    }, [initHeaderToolBarData])
    // const  headerMenuData = React.useMemo(()=>{
    //     return initHeaderMenuData.map((ele)=>{
    //
    //     })
    //     // return initHeaderToolBarData.filter((ele)=>{
    //     //     return ele.buttonComponent !==  ButtonComponentsMap.WalletConnect
    //     // })
    // },[initHeaderMenuData])
    //
    return {
        headerToolBarData,
        headerMenuData,
    }
}

