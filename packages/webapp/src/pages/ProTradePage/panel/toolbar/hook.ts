import React from 'react'
import { LoopringAPI } from 'api_wrapper'

export const useToolbar = () => {
    const [ammPoolBalances, setAmmPoolBalances] = React.useState<any[]>([])
    
    const getAmmPoolBalances = React.useCallback(async () => {
        if (LoopringAPI.ammpoolAPI) {
            const ammRes = await LoopringAPI.ammpoolAPI?.getAmmPoolBalances()
            const fomattedRes = ammRes.raw_data.map((o: any) => ({
                ...o,
                poolName: o.poolName.replace('AMM-', '')
            }))
            setAmmPoolBalances(fomattedRes)
        }
    }, [])

    React.useEffect(() => {
        getAmmPoolBalances()
    }, [getAmmPoolBalances])
    
    return {
        ammPoolBalances,
    }
}
