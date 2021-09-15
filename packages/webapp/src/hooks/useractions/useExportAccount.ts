import React from 'react';

import { ResetProps } from '@loopring-web/component-lib';
import { IBData, WalletMap, FeeInfo, AccountStatus} from '@loopring-web/common-resources';
import { useBtnStatus } from 'hooks/common/useBtnStatus';
import { useChargeFees } from 'hooks/common/useChargeFees';
import * as sdk from 'loopring-sdk'
import { useTokenMap } from 'stores/token';
import { useAccount } from 'stores/account'

export const useExportAccount = <T>() => {
    const {account} = useAccount()
    const [accountInfo, setAccountInfo] = React.useState({
        address: '',
        accountId: 0,
        level: '',
        nonce: 0 as number | undefined, 
        apiKey: '',
        publicX: '',
        publicY: '',
        privateKey: '',
    })
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
        setAccountInfo(accInfo)

        // const fileName = 'accountInfo'
        // const exportType = 'json'

        // exportFromJSON({data: accInfo, fileName, exportType})
    }, [account])

    const exportAccountProps = {
        accountInfo,
        exportAccInfo,
    }

    return {
        exportAccountProps: exportAccountProps,
    }
}
