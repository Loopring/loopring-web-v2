import React, { useEffect } from 'react'
import { RawDataAmmItem, AmmTable, AmmSideTypes } from '@loopring-web/component-lib'
import { WithTranslation, withTranslation } from 'react-i18next'
import store from 'stores'
import { LoopringAPI } from 'stores/apis/api'
import { AmmTxType } from 'loopring-sdk'
import { StylePaper } from '../../styled'
import { volumeToCount } from '../../../hooks/help';

const AmmPanel = withTranslation('common')((rest:WithTranslation<'common'>) => {
    const container = React.useRef(null);
    const [pageSize, setPageSize] = React.useState(10);
    const [originalData, setOriginalData] = React.useState<RawDataAmmItem[]>([])

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
                        value: String(volumeToCount(getTokenName(o.poolTokens[1]?.tokenId), o.poolTokens[1]?.feeAmount))
                    },
                    time: o.updatedAt
                }))
                setOriginalData(result)
            }
        }
    }, [accountId, apiKey, getTokenName])

    useEffect(() => {
        getAmmpoolList()
    }, [getAmmpoolList])

    React.useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 120) / 44) - 2);
        }
    }, [container, pageSize]);

    return (
        <>
            <StylePaper ref={container}>
                <div className="title">AMM Records</div>
                <div className="tableWrapper">
                    <AmmTable {...{
                        rawData: originalData,
                        pagination: {
                            pageSize: pageSize
                        },
                        showFilter: true,
                        ...rest}}/>
                </div>
            </StylePaper>
        </>
    )
})

export default AmmPanel
