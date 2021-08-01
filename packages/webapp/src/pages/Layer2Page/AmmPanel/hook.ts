import React, { useEffect } from 'react'
import { RawDataAmmItem, AmmSideTypes } from '@loopring-web/component-lib'
import store from 'stores'
import { LoopringAPI } from 'stores/apis/api'
import { AmmTxType } from 'loopring-sdk'
import { volumeToCount } from '../../../hooks/help';

export function useGetAmmRecord() {
    const [ammRecordList, setAmmRecordList] = React.useState<RawDataAmmItem[]>([])
    const [showLoading, setShowLoading] = React.useState(true)
    const { accountId,apiKey } = store.getState().account;
    const { tokenMap } = store.getState().tokenMap

    const getTokenName = React.useCallback((tokenId?: number) => {
        if (tokenMap) {
            const keys = Object.keys(tokenMap)
            const values = Object.values(tokenMap)
            const index = values.findIndex(o => o.tokenId === tokenId)
            if (index > -1) {
                return keys[index]
            }
            return ''
        }
        return ''
    }, [tokenMap])

    const getAmmpoolList = React.useCallback(async () => {
        if (LoopringAPI.ammpoolAPI && accountId && apiKey) {
            const ammpool = await LoopringAPI.ammpoolAPI.getUserAmmPoolTxs({
                accountId,
            }, apiKey)
            if (ammpool && ammpool.userAmmPoolTxs) {
                const result = ammpool.userAmmPoolTxs.map(o => ({
                    side: o.txType === AmmTxType.JOIN ? AmmSideTypes.Join : AmmSideTypes.Exit,
                    amount: {
                        from: {
                            key: getTokenName(o.poolTokens[0]?.tokenId),
                            value: String(volumeToCount(getTokenName(o.poolTokens[0]?.tokenId), o.poolTokens[0]?.actualAmount))
                        },
                        to: {
                            key: getTokenName(o.poolTokens[1]?.tokenId),
                            value: String(volumeToCount(getTokenName(o.poolTokens[1]?.tokenId), o.poolTokens[1]?.actualAmount))
                        }
                    },
                    lpTokenAmount: String(volumeToCount(getTokenName(o.lpToken?.tokenId), o.lpToken?.actualAmount)),
                    fee: {
                        key: getTokenName(o.poolTokens[1]?.tokenId),
                        value: volumeToCount(getTokenName(o.poolTokens[1]?.tokenId), o.poolTokens[1]?.feeAmount)?.toFixed(6)
                    },
                    time: o.updatedAt
                }))
                setAmmRecordList(result)
                setShowLoading(false)
            }
        }
    }, [accountId, apiKey, getTokenName])
    
    useEffect(() => {
        getAmmpoolList()
    }, [getAmmpoolList])

    return  {
        ammRecordList,
        showLoading,
    }
}

