import { BtnPercentage, DualDetailProps, TickCardStyleItem } from '@loopring-web/component-lib'
import React from 'react'
import { Box, Grid } from '@mui/material'
import * as sdk from '@loopring-web/loopring-sdk'
import { Mark } from '@mui/base/SliderUnstyled/SliderUnstyledProps'

export const ModifyParameter = ({
  dualViewInfo,
  isRenew,
  renewTargetPrice,
  renewDuration,
  onChange,
  isPriceEditable,
  dualProducts,
  getProduct,
}: DualDetailProps) => {
  const { t } = useTranslation()
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
  const handleDuration = (item) => {}
  return (
    <Box>
      <Grid container>
        {priceList.map((item, index) => {
          return <Grid item key={index}></Grid>
        })}
      </Grid>
      <BtnPercentage
        selected={renewDuration}
        handleChanged={handleDuration}
        anchors={
          Array.from({ length: 9 }, (_, index) => ({
            value: index + 1,
            label: index + 1,
          })) as Mark[]
        }
        valueLabelDisplay='on'
        valuetext={(item) => t('labelDayDispay', { item })}
        step={1}
      />
    </Box>
  )
}
