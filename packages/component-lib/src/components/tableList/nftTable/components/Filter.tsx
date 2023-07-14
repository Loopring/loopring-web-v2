import React from 'react'
import styled from '@emotion/styled'
import { Grid, MenuItem } from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Button, DateRangePicker, TextField } from '../../../basic-lib'
import { DropDownIcon } from '@loopring-web/common-resources'
import { DateRange } from '@mui/lab'
import { TxNFTType, UserNFTTxTypes } from '@loopring-web/loopring-sdk'
import { NFTTableFilter } from '../Interface'
import { useSettings } from '../../../../stores'

export interface FilterProps {
  handleFilterChange: (filter: Partial<NFTTableFilter>) => void
  filterDate?: DateRange<Date | string>
  filterType?: UserNFTTxTypes
  // handleReset: () => void;
  marketArray?: string[]
}

// export enum FilterOrderTypes {
//   allTypes = "All Types",
//   buy = "Buy",
//   sell = "Sell",
// }

const StyledTextFiled = styled(TextField)`
  &.MuiTextField-root {
    max-width: initial;
  }
  .MuiInputBase-root {
    width: initial;
    max-width: initial;
  }
`

export const Filter = withTranslation('tables', { withRef: true })(
  ({ t, filterType, filterDate, handleFilterChange }: FilterProps & WithTranslation) => {
    const { isMobile } = useSettings()
    const transactionTypeList = [
      {
        label: t(`labelTxNFTFilter${TxNFTType.ALL}`),
        value: 0,
      },
      {
        label: t(`labelTxNFTFilter${TxNFTType.DEPOSIT}`),
        value: UserNFTTxTypes[TxNFTType.DEPOSIT],
      },
      {
        label: t(`labelTxNFTFilter${TxNFTType.WITHDRAW}`),
        value: UserNFTTxTypes[TxNFTType.WITHDRAW],
      },
      {
        label: t(`labelTxNFTFilter${TxNFTType.TRANSFER}`),
        value: UserNFTTxTypes[TxNFTType.TRANSFER],
      },
      {
        label: t(`labelTxNFTFilter${TxNFTType.MINT}`),
        value: UserNFTTxTypes[TxNFTType.MINT],
      },
    ]
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} order={isMobile ? 0 : 1} lg={6}>
          <DateRangePicker
            value={filterDate ?? [null, null]}
            onChange={(date: any) => {
              handleFilterChange({ duration: date })
            }}
          />
        </Grid>
        <Grid item xs={6} order={isMobile ? 1 : 0} lg={2}>
          <StyledTextFiled
            id='table-transaction-trade-types'
            select
            fullWidth
            value={filterType ?? 0}
            placeholder={`labelTxNFTFilter${TxNFTType.ALL}`}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              let txType: any = event.target.value as UserNFTTxTypes

              handleFilterChange({
                txType,
              })
            }}
            inputProps={{ IconComponent: DropDownIcon }}
          >
            {transactionTypeList.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </StyledTextFiled>
        </Grid>
        <Grid item xs={6} order={3} lg={2}>
          <Button
            fullWidth
            variant={'outlined'}
            size={'medium'}
            color={'primary'}
            onClick={() => {
              handleFilterChange({
                duration: [null, null],
                txType: '' as any,
              })
            }}
          >
            {t('labelFilterReset')}
          </Button>
        </Grid>
      </Grid>
    )
  },
)
