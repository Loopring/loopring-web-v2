import { Lv2Account } from "defs/account_defs";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { AccountStatus } from "state_machine/account_machine_spec";
import { RootState } from "stores";

import exportFromJSON from 'export-from-json'
import { myLog } from "utils/log_tools";

export function useResetAccount() {

}

export function useExportAccoutInfo() {
    const account : Lv2Account = useSelector((state: RootState) => state.account)

    const exportAccInfo = useCallback(() => {
        
        if (account.status !== AccountStatus.ACTIVATED) {
            return undefined
        }

        const accInfo = {
            address: account.accAddr,
            accountId: account.accountId,
            nonce: account.nonce,
            apiKey: account.apiKey,
            publicX: account.publicKey.x,
            publicY: account.publicKey.y,
            privateKey: account.eddsaKey,
        }
        
        const fileName = 'accountInfo'
        const exportType = 'json'
    
        exportFromJSON({ data: accInfo, fileName, exportType })

        myLog('exportFromJSON:', accInfo)

    }, [account])

    return {
        exportAccInfo,
    }
}
