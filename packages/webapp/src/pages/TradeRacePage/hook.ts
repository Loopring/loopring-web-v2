import React from 'react'
import { LoopringAPI } from 'api_wrapper'
import { useAccount } from 'stores/account'
import { GameRankInfo } from '@loopring-web/loopring-sdk'
import { volumeToCount, getTokenNameFromTokenId } from 'hooks/help'
import { getValuePrecisionThousand } from '@loopring-web/common-resources'

export const useTradeRace = () => {
    const { account: { apiKey, accAddress } } = useAccount()
    const [currPairRankData, setCurrPairRankData] = React.useState<GameRankInfo[]>([])
    const [currPairUserRank, setCurrPairUserRank] = React.useState<any>(undefined)

    // const getTradeRaceList = React.useCallback(async() => {
    //     if (LoopringAPI && LoopringAPI.ammpoolAPI) {
    //         const { groupByRuleTypeAndStatus } = await LoopringAPI.ammpoolAPI.getAmmPoolActivityRules()
    //         const { SWAP_VOLUME_RANKING } = groupByRuleTypeAndStatus
    //         // TODO: filter active races
    //         return SWAP_VOLUME_RANKING['EndOfGame']
    //         // setTradeRaceLsit(SWAP_VOLUME_RANKING['EndOfGame'])
    //     }
    //     return []
    // }, [])

    const getAmmGameRank = React.useCallback(async(market: string) => {
        if (LoopringAPI && LoopringAPI.ammpoolAPI) {
            const [coinBase, coinQuote] = market.split('-')
            const { userRankList } = await LoopringAPI.ammpoolAPI.getAmmPoolGameRank({
                ammPoolMarket: market
            })
            const formattedUserRankList = userRankList.map(o => ({
                ...o,
                tradeVolume: getValuePrecisionThousand(volumeToCount(coinQuote, o.volume)),
                profit: getValuePrecisionThousand(volumeToCount(getTokenNameFromTokenId(Number(o.rewards[0].tokenId)), o.rewards[0].volume)),
            }))
            setCurrPairRankData(formattedUserRankList)
        }
    }, [])

    const getAmmGameUserRank = React.useCallback(async(market: string) => {
        if (LoopringAPI && LoopringAPI.ammpoolAPI) {
            const data = await LoopringAPI.ammpoolAPI.getAmmPoolGameUserRank({
                ammPoolMarket: market,
                owner: accAddress,
            }, apiKey)
            setCurrPairUserRank(data)
        }
    }, [accAddress, apiKey])

    return {
        // tradeRaceList,
        currPairUserRank,
        currPairRankData,
        // getTradeRaceList,
        getAmmGameRank,
        getAmmGameUserRank,
    }
}
