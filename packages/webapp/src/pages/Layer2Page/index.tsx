import { useRouteMatch } from 'react-router-dom'

import { Box } from '@mui/material'

import React from 'react'
import { ViewAccountTemplate } from '@loopring-web/core'
import { SecurityPanel } from './SecurityPanel'
import { VipPanel } from './VipPanel'
import { ForcewithdrawPanel } from './ForcewithdrawPanel'
import { ReferralRewardsPanel } from './ReferralRewardsPanel'
import { ContactPage } from './ContactPanel'
import { Layer2RouterID, ProfileIndex, MapChainId } from '@loopring-web/common-resources'
import { useSettings } from '@loopring-web/component-lib'
import { NotificationPanel } from './Notification'

export const Layer2Page = () => {
  let match: any = useRouteMatch('/layer2/:item')
  const selected = match?.params.item ?? 'vip'
  const { defaultNetwork } = useSettings()

  const layer2Router = React.useMemo(() => {
    let _selected
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    if (ProfileIndex[network]?.includes(selected)) {
      _selected = selected
    } else {
      _selected = ''
    }
    switch (_selected) {
      case Layer2RouterID.forcewithdraw:
        return <ForcewithdrawPanel />
      case Layer2RouterID.security:
        return <SecurityPanel />
      case Layer2RouterID.vip:
        return <VipPanel />
      case Layer2RouterID.contact:
        return <ContactPage />
      case Layer2RouterID.notification:
        return <NotificationPanel />
      default:
        return <SecurityPanel />
    }
  }, [selected])

  return selected === Layer2RouterID.referralrewards ? (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <ReferralRewardsPanel />
    </Box>
  ) : (
    <ViewAccountTemplate activeViewTemplate={layer2Router} />
  )
  // <>{viewTemplate}</>;
}
