import {
    dumpError400,
    GetOffchainFeeAmtRequest,
    LoopringMap,
    OffchainFeeReqType,
    toBig,
    TokenInfo
} from 'loopring-sdk';
import { useAccount } from 'stores/account';
import { useState } from 'react';
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';
import { LoopringAPI } from 'api_wrapper';
import * as sdk from 'loopring-sdk';
import { myLog } from 'utils/log_tools';

export function useChargeFees(tokenSymbol: string | undefined, requestType: OffchainFeeReqType,
    tokenMap: LoopringMap<TokenInfo> | undefined, amount?: number) {

    const { account } = useAccount()

    const [chargeFeeList, setChargeFeeList] = useState<any[]>([])

    useCustomDCEffect(async () => {

        if (account.accountId === -1 || !account.apiKey || !tokenSymbol || typeof tokenSymbol !== 'string'
         || !tokenMap || !LoopringAPI.userAPI) {
            return
        }

        myLog('tokenSymbol:', tokenSymbol, ' requestType:', OffchainFeeReqType[requestType])

        let chargeFeeList: any[] = []

        try {
            const tokenInfo = tokenMap[ tokenSymbol ]

            const request: GetOffchainFeeAmtRequest = {
                accountId: account.accountId,
                tokenSymbol,
                requestType,
                amount: amount ? toBig(amount).times('1e' + tokenInfo.decimals).toFixed(0, 0) : undefined
            }

            const response = await LoopringAPI.userAPI.getOffchainFeeAmt(request, account.apiKey)

            if (response?.raw_data?.fees instanceof Array) {
                response.raw_data.fees.forEach((item: any) => {
                    const feeRaw = item.fee
                    const tokenInfo = tokenMap[ item.token ]
                    const fee = sdk.toBig(item.fee).div('1e' + tokenInfo.decimals).toNumber()
                    chargeFeeList.push({belong: item.token, fee, __raw__: feeRaw})
                })

                setChargeFeeList(chargeFeeList)
            }
            myLog('response:', response)

        } catch (reason) {
            dumpError400(reason)
        }


        setChargeFeeList(chargeFeeList)

    }, [account.accountId, account.apiKey, LoopringAPI.userAPI, requestType, tokenSymbol, tokenMap])

    return {
        chargeFeeList,
    }

}