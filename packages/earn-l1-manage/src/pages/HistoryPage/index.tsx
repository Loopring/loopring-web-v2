import { useTokenMap } from '@loopring-web/core'
import React from 'react'
import { useData, RecordIndex } from './hook'
import { useSettings } from '@loopring-web/component-lib'
import { Box, Tab, Tabs } from '@mui/material'
import { getValuePrecisionThousand, TokenType } from '@loopring-web/common-resources'
import { DualTxTable } from './DualTxTable'
import { DualInvestTable } from './DualInvestTable'

export const RecordPage = () => {
  // dualManageConfig.tokenList
  const { tokenMap } = useTokenMap()
  const [value, setValue] = React.useState(RecordIndex.Transactions)
  const {} = useData()
  const { coinJson } = useSettings()
  return (
    <Box flex={1} marginX={3} display={'flex'} flexDirection={'column'}>
      <Tabs
        value={value}
        onChange={(_, value) => {
          setValue(value)
        }}
      >
        <Tab value={RecordIndex.Transactions} label={'Transactions'} />
        <Tab value={RecordIndex.DualInvestment} label={'Products in progress'} />
      </Tabs>
      <Box borderTop={'1px solid var(--color-border)'} borderRadius={1} padding={2} flex={1}>
        {value === RecordIndex.Transactions && <DualTxTable rawData={[]} showloading={true} />}
        {value === RecordIndex.DualInvestment && (
          <DualInvestTable rawData={[]} showloading={true} />
        )}
      </Box>
    </Box>
  )
}
