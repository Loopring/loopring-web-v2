import { useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "stores";

import { myLog } from "utils/log_tools";
import { Account, AccountStatus } from '@loopring-web/common-resources';
import exportFromJSON from 'export-from-json';

export function useResetAccount() {

}

export function useExportAccoutInfo() {
    const account: Account = useSelector((state: RootState) => state.account)

    const exportAccInfo = useCallback(() => {

        if (account.readyState !== AccountStatus.ACTIVATED) {
            return undefined
        }

        const accInfo = {
            address: account.accAddress,
            accountId: account.accountId,
            nonce: account.level,
            apiKey: account.apiKey,
            publicX: account.publicKey.x,
            publicY: account.publicKey.y,
            privateKey: account.eddsaKey,
        }

        const fileName = 'accountInfo'
        const exportType = 'json'

        exportFromJSON({data: accInfo, fileName, exportType})

        myLog('exportFromJSON:', accInfo)

    }, [account])

    return {
        exportAccInfo,
    }
}
