import { useSettings } from '../../../stores'
import { L1L2_NAME_DEFINED, MapChainId, TradeBtnStatus } from '@loopring-web/common-resources'
import { Box, Divider, Typography, IconButton } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import { Button } from '../../basic-lib'
import React from 'react'
import { VaultExitBaseProps } from '../../tradePanel'
import CloseIcon from '@mui/icons-material/Close'

export const VaultExitPanel = ({
  onSubmitClick,
  onClose,
  btnStatus,
  disabled,
  confirmLabel = 'labelVaultConfirm',
  cancelLabel = 'labelVaultCancel',
}: VaultExitBaseProps) => {
  const { t } = useTranslation()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const getDisabled = React.useMemo(() => {
    return disabled || btnStatus === TradeBtnStatus.DISABLED
  }, [btnStatus, disabled])
  const label = React.useMemo(() => {
    if (confirmLabel) {
      const key = confirmLabel.split('|')
      return t(
        key[0],
        key && key[1]
          ? {
              arg: key[1].toString(),
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }
          : {
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            },
      )
    } else {
      return t(`labelVaultConfirm`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [confirmLabel])
  return (
    <>
      <Box sx={{
        position: 'relative',
        width: 'var(--modal-width)',
        maxWidth: '450px',
        bgcolor: 'var(--color-global-bg)',
        border: 'none',
        boxShadow: 24,
        px: 4,
        py: 5,
        borderRadius: 2,
      }}>

        <Typography variant='h4' component='h2' textAlign='center' mb={4}>
          Settle
        </Typography>

        <Typography mb={3}>
          You can only settle your account after all existing positions have been closed.
        </Typography>

        <Typography mb={3} variant='body1' color={'var(--color-text-secondary)'}>
          · If there is a loss (due to an unprofitable trade or interest payments), a portion of
          your collateral may be used to cover the deficit. In this case, only the remaining
          collateral will be available for withdrawal from Portal.
        </Typography>

        <Typography color={'var(--color-text-secondary)'} variant='body1'>
          · If your trades are profitable, your full collateral will be available for withdrawal,
          and any profits will be credited to your Loopring DeFi account accordingly.
        </Typography>

        <Box display='flex' gap={2} mt={4}>
          <Button variant='outlined' sx={{ height: '40px' }} fullWidth onClick={onClose}>
            Cancel
          </Button>

          <Button 
            variant='contained'
            fullWidth
            onClick={onSubmitClick}
            loading={!getDisabled && btnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
            disabled={
              getDisabled ||
              btnStatus === TradeBtnStatus.DISABLED ||
              btnStatus === TradeBtnStatus.LOADING
            }
          >
            Settle
          </Button>
        </Box>
      </Box>
    </>
  )
}
