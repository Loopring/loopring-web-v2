import { AccountStatus } from '@loopring-web/common-resources';
import exportFromJSON from 'export-from-json';
import { useAccount } from '../../../stores/account';
import React from 'react';

export function useResetAccount() {

}

export function useExportAccountInfo() {
    // const account: Account = useSelector((state: RootState) => state.account)
    const {account} = useAccount()
    const exportAccInfo = React.useCallback(() => {

        if (account.readyState !== AccountStatus.ACTIVATED) {
            return undefined
        }

        // const accInfo = {
        //     address: account.accAddress,
        //     accountId: account.accountId,
        //     nonce: account.level,
        //     apiKey: account.apiKey,
        //     publicX: account.publicKey.x,
        //     publicY: account.publicKey.y,
        //     privateKey: account.eddsaKey,
        // }

        const fileName = 'accountInfo'
        const exportType = 'json'

        exportFromJSON({data: account, fileName, exportType})

        // myLog('exportFromJSON:', account)

    }, [account])

    return {
        exportAccInfo,
    }
}
