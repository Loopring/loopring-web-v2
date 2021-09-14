import { AccountStatus } from '@loopring-web/common-resources'
import exportFromJSON from 'export-from-json'
import { useAccount } from '../../../stores/account'
import React from 'react'

import { AccountStep,
    useOpenModals 
} from '@loopring-web/component-lib'

export function useResetAccount() {

    const {
        setShowAccount,
    } = useOpenModals()

    const resetKeypair = React.useCallback(() => {
        setShowAccount({isShow: true, step: AccountStep.ResetAccount_Approve_WaitForAuth})
    }, [setShowAccount])

    return {
        resetKeypair,
    }
}

export function useExportAccountInfo() {

    const {account} = useAccount()

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

        const fileName = 'accountInfo'
        const exportType = 'json'

        exportFromJSON({data: accInfo, fileName, exportType})

    }, [account])

    return {
        exportAccInfo,
    }
}
