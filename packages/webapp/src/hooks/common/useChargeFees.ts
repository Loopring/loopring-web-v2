import * as sdk from '@loopring-web/loopring-sdk';
import {
    dumpError400,
    GetOffchainFeeAmtRequest,
    LoopringMap,
    OffchainFeeReqType,
    toBig,
    TokenInfo
} from '@loopring-web/loopring-sdk';
import { useAccount } from 'stores/account';
import React, { useState } from 'react';
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';
import { LoopringAPI } from 'api_wrapper';
import * as _ from 'lodash'
import { FeeInfo, globalSetup } from '@loopring-web/common-resources'

export function useChargeFees({ tokenSymbol, requestType, tokenMap, amount, needRefresh, }: {
    tokenSymbol: string | undefined, requestType: OffchainFeeReqType,
    tokenMap: LoopringMap<TokenInfo> | undefined, amount?: number, needRefresh?: boolean
}) {

    const { account } = useAccount()

    const [chargeFeeList, setChargeFeeList] = useState<FeeInfo[]>([])

    const getFeeList = React.useCallback(
        _.debounce(async (accountId: number, apiKey: string, tokenSymbol: string | undefined, requestType: OffchainFeeReqType,
            tokenMap: LoopringMap<TokenInfo> | undefined, amount: number | undefined) => {

            if (accountId === -1 || !apiKey || !tokenSymbol || typeof tokenSymbol !== 'string'
                || !tokenMap || !LoopringAPI.userAPI) {
                return
            }

            // myLog('tokenSymbol:', tokenSymbol, ' requestType:', OffchainFeeReqType[requestType])

            let chargeFeeList: FeeInfo[] = []

            try {
                const tokenInfo = tokenMap[tokenSymbol]

                const request: GetOffchainFeeAmtRequest = {
                    accountId,
                    tokenSymbol,
                    requestType,
                    amount: amount ? toBig(amount).times('1e' + tokenInfo.decimals).toFixed(0, 0) : '0'
                }

                // myLog('request:', request)

                const response = await LoopringAPI.userAPI.getOffchainFeeAmt(request, apiKey)

                // myLog('response:', response)

                if (response?.raw_data?.fees instanceof Array) {
                    response.raw_data.fees.forEach((item: any) => {
                        const feeRaw = item.fee
                        const tokenInfo = tokenMap[item.token]
                        const tokenId = tokenInfo.tokenId
                        const fastWithDraw = tokenInfo.fastWithdrawLimit
                        const fee = sdk.toBig(item.fee).div('1e' + tokenInfo.decimals).toString()
                        chargeFeeList.push({ belong: item.token, fee, __raw__: { fastWithDraw, feeRaw, tokenId, } })
                    })
                }

            } catch (reason) {
                dumpError400(reason)
            }

            setChargeFeeList(chargeFeeList)
        }
            , globalSetup.wait)
        , [])

    useCustomDCEffect(() => {
        getFeeList(account.accountId, account.apiKey, tokenSymbol, requestType, tokenMap, amount)
    }, [account.accountId, account.apiKey, tokenSymbol, requestType, tokenMap, amount])

    useCustomDCEffect(() => {
        if (needRefresh) {
            getFeeList(account.accountId, account.apiKey, tokenSymbol, requestType, tokenMap, amount)
        }
    }, [needRefresh, account.accountId, account.apiKey, tokenSymbol, requestType, tokenMap, amount])

    return {
        chargeFeeList,
    }

}