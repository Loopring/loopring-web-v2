import { Box, Typography } from '@mui/material'
import { useVaultSwap } from '../hooks/useVaultSwap'
import { VaultSwapView } from './VaultSwapView'
import { CloseIcon } from '@loopring-web/common-resources'
import { useConfirmation } from '@loopring-web/core/src/stores/localStore/confirmation'
// import { SmallOrderAlert, Toast } from '../components/'
import { CloseAllConfirmModal } from './modals'
import { SmallOrderAlert, Toast } from '../../../components'
import { useSettings } from '../../../stores'


export const VaultTradePanel = () => {
  const { vaultSwapModalProps, smallOrderAlertProps, toastProps, closeAllConfirmModalProps } = useVaultSwap()
  const { confirmation, setShowVaultTradeHint } = useConfirmation()
  const isMobile = useSettings().isMobile
  return (
    <Box display={'flex'} justifyContent={'center'} flexDirection={isMobile ? 'column' : 'row'} position='relative' my={5} alignItems={'start'}>
      <Box
        sx={{
          position: 'relative',
          height: confirmation.showVaultTradeHint ? 'auto' : 0,
          borderRadius: '8px',
          py: 2,
          px: 3,
          border: '1px solid var(--color-border)',
          opacity: confirmation.showVaultTradeHint ? 1 : 0,
          width: isMobile ? '92%' : '20%',
          ml: isMobile ? '4%' : 0,
          mr: isMobile ? '4%' : 3,
          mb: isMobile ? 4 : 0,
        }}
      >
        <Typography>Portal Trade</Typography>
        <Typography mt={2} color={'var(--color-text-secondary)'}>
          Loopring Portal functions as an isolated margin account, allowing users to borrow and lend
          tokens using collateral. It enables leveraged trading and provides access to assets beyond
          Ethereum.
        </Typography>
        <CloseIcon
          onClick={() => setShowVaultTradeHint(false)}
          fontSize={'large'}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
          }}
        />
      </Box>
      <VaultSwapView {...vaultSwapModalProps} />
      <Box width={'20%'} />
      <SmallOrderAlert {...smallOrderAlertProps} />
      <Toast {...toastProps} />
      <CloseAllConfirmModal {...closeAllConfirmModalProps}/>
    </Box>
  )
}
