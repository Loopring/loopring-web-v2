import { DualDetailType, TickCardStyleItem } from '@loopring-web/component-lib'
import React from 'react'
import { Box, Grid } from '@mui/material'
import * as sdk from '@loopring-web/loopring-sdk'

export const ModifyParameter = <R extends any>({
  dualViewInfo,
  currentPrice,
  tokenMap,
  reInvestPrice,
}: // stepLength,
// current,
// onSelectStep1Token,
// dualType,
DualDetailType & {
  isPriceEditable: boolean
  tokenMap: any
  info: sdk.DualProductAndPrice
  reInvestPrice: string
}) =>
  // selected: boolean
  // stepLength: string
  // current: string
  // dualType: sdk.DUAL_TYPE
  // onSelectStep1Token: (item: R) => void
  // }
  {
    const priceList = []
    const stepEle = React.useMemo(() => {
      const listELE = []
      let start = sdk.toBig(stepLength).times(sdk.toBig(current / stepLength).toFixed(0))
      for (let i = 0; i < 12; i++) {
        if (dualType == sdk.DUAL_TYPE.DUAL_BASE) {
        }
        list.push(
          <TickCardStyleItem
            className={selected ? 'btnCard dualInvestCard selected' : 'btnCard dualInvestCard '}
            selected={selected}
            onClick={() => onSelectStep1Token(item)}
          >
            {item?.x}
          </TickCardStyleItem>,
        )
      }

      return listELE.map(item)
    })
    return (
      <Box>
        <Grid container>
          {priceList.map((item, index) => {
            return <Grid item key={index}></Grid>
          })}
        </Grid>
      </Box>
    )
  }
/* Rectangle 41980 */

// position: absolute;
// width: 600px;
// height: 73px;
// left: 0px;
// top: 64px;
//
// /* System/Orange (#FBA95C) */
// background: #FBA95C;
// opacity: 0.1;
