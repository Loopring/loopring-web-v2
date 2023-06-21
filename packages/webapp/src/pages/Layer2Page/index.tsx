import { useRouteMatch } from 'react-router-dom'

import { Box, Container } from '@mui/material'

import React from 'react'
import { ViewAccountTemplate } from '@loopring-web/core'
import { SecurityPanel } from './SecurityPanel'
import { VipPanel } from './VipPanel'
import { ForcewithdrawPanel } from './ForcewithdrawPanel'
import { ReferralRewardsPanel } from './ReferralRewardsPanel'
import { ContactPage } from './ContactPanel'
import { ProfileKey, ProfileIndex, MapChainId } from '@loopring-web/common-resources'
import { useSettings } from '@loopring-web/component-lib'

export const Layer2Page = () => {
  let match: any = useRouteMatch('/layer2/:item')
  const selected = match?.params.item ?? 'assets'
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
      case ProfileKey.forcewithdraw:
        return <ForcewithdrawPanel />
      case ProfileKey.security:
        return <SecurityPanel />
      case ProfileKey.vip:
        return <VipPanel />
      case ProfileKey.contact:
        return <ContactPage />
      default:
        return <SecurityPanel />
    }
  }, [selected])

  return selected === ProfileKey.referralrewards ? (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <ReferralRewardsPanel />
    </Box>
  ) : (
    <Container
      maxWidth='lg'
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      <Box display={'flex'} flex={1} alignItems={'stretch'} flexDirection={'column'} marginTop={3}>
        <ViewAccountTemplate activeViewTemplate={layer2Router} />
      </Box>
    </Container>
  )
  // <>{viewTemplate}</>;
}
