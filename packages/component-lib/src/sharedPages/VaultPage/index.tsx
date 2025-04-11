


import {
  useSettings,
} from '@loopring-web/component-lib'
import { useVaultPage } from './hooks/useVaultPage'
import { VaultPageUI } from './components/VaultPageUI'
export { useVaultMarket } from './hooks/useVaultMarket'
export { useGetVaultAssets } from './hooks/useVaultDashBoard'

export const VaultPage = () => {
  const props = useVaultPage()

  return (
    <VaultPageUI
      {...props}
    />
  )
}
