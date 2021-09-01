import React from 'react'
import { TradeBtnStatus } from '@loopring-web/component-lib'

export function useBtnStatus() {

    const [btnStatus, setBtnStatus,] = React.useState<TradeBtnStatus>(TradeBtnStatus.AVAILABLE)

    const enableBtn = React.useCallback(() => {
        setBtnStatus(TradeBtnStatus.AVAILABLE)
    }, [setBtnStatus])

    const disableBtn = React.useCallback(() => {
        setBtnStatus(TradeBtnStatus.DISABLED)
    }, [setBtnStatus])

    const setLoadingBtn = React.useCallback(() => {
        setBtnStatus(TradeBtnStatus.LOADING)
    }, [setBtnStatus])

    React.useEffect(() => {
        enableBtn()
    }, [])

    return {
        btnStatus,
        enableBtn,
        disableBtn,
        setLoadingBtn,
    }

}
