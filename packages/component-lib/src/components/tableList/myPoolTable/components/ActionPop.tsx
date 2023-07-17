import React from 'react'
import { Box, ListItemText, MenuItem } from '@mui/material'

export const ActionPopContent = React.memo(
  ({ row, allowTrade, handleWithdraw, handleDeposit, t }: any) => {
    return (
      <Box borderRadius={'inherit'} minWidth={110}>
        {allowTrade?.joinAmm?.enable && (
          <MenuItem onClick={() => handleDeposit(row)}>
            <ListItemText>{t('labelPoolTableAddLiquidity')}</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleWithdraw(row)}>
          <ListItemText>{t('labelPoolTableRemoveLiquidity')}</ListItemText>
        </MenuItem>
      </Box>
    )
  },
)
