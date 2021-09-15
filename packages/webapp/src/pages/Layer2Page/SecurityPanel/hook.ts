import { AccountStatus } from '@loopring-web/common-resources'
import exportFromJSON from 'export-from-json'
import { useAccount } from '../../../stores/account'
import React from 'react'

import { AccountStep,
    useOpenModals 
} from '@loopring-web/component-lib'

export function useResetAccount() {

    const {
        setShowResetAccount,
    } = useOpenModals()

    const resetKeypair = React.useCallback(() => {
        setShowResetAccount({isShow: true,})
    }, [setShowResetAccount])

    return {
        resetKeypair,
    }
}

export function useExportAccountInfo() {

    const {account} = useAccount()

    const {
        setShowExportAccount,
    } = useOpenModals()

    const exportAccInfo = React.useCallback(() => {

        if (account.readyState !== AccountStatus.ACTIVATED) {
            return undefined
        }

        const accInfo = {
            address: account.accAddress,
            accountId: account.accountId,
            level: account.level,
            nonce: account.nonce,
            apiKey: account.apiKey,
            publicX: account.eddsaKey.formatedPx,
            publicY: account.eddsaKey.formatedPy,
            privateKey: account.eddsaKey.sk,
        }

        // const fileName = 'accountInfo'
        // const exportType = 'json'

        // exportFromJSON({data: accInfo, fileName, exportType})
        return accInfo
    }, [account])

    const exportAccount = React.useCallback(() => {
        setShowExportAccount({isShow: true})
    }, [setShowExportAccount])

    return {
        exportAccInfo,
        exportAccount,
    }
}
