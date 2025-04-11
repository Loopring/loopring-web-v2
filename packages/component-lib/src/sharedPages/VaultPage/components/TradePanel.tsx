import { Box, Typography } from '@mui/material'
import { useVaultSwap } from '../hooks/useVaultSwap'
import { VaultSwapView } from './VaultSwapView'
import { CloseIcon } from '@loopring-web/common-resources'
import { useConfirmation } from '@loopring-web/core/src/stores/localStore/confirmation'

export const VaultTradePanel = () => {
  const { vaultSwapModalProps } = useVaultSwap()
  const { confirmation, setShowVaultTradeHint } = useConfirmation()

  return (
    <Box display={'flex'} justifyContent={'center'} position='relative' my={5} alignItems={'start'}>
      <Box
        sx={{
          position: 'relative',
          height: 'auto',
          borderRadius: '8px',
          width: '20%',
          py: 2,
          px: 3,
          border: '1px solid var(--color-border)',
          mr: 3,
          opacity: confirmation.showVaultTradeHint ? 1 : 0,
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
    </Box>
  )
}
