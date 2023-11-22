import * as dualManageConfig from '../../config/dualConfig.json'
import { useTokenMap } from '@loopring-web/core'
import { Grid, Box, Typography } from '@mui/material'
import { getValuePrecisionThousand } from '@loopring-web/common-resources'
export const useData = () => {
  const { tokenMap } = useTokenMap()
  // dualManageConfig.tokenList
  const deposit = (symbol) => {}
  const withdraw = (symbol) => {}
  const settle = (symbol) => {}
  return {
    protocolData: [] as any,
    protocolTotal: 1000000,
    assetData: [] as any,
    assetTotal: 1000000,
    delivering: [] as any,
    progress: [] as any,
    deposit,
    withdraw,
    settle,
    products: {
      delivering: {
        list: [] as any,
        total: 10000,
      },
      progress: {
        list: [] as any,
        total: 10000,
      },
    },
  }
}
