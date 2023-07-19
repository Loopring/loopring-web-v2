import { useRouteMatch } from 'react-router-dom'

import { Box } from '@mui/material'
import { subMenuNFT } from '@loopring-web/common-resources'
import React from 'react'
import { useAccount, ViewAccountTemplate } from '@loopring-web/core'
import { MyNFTPanel } from './MyNFT'
import { MyNFTHistory } from './NFThistory'
import { MintNFTAdvancePanel, MintNFTPanel } from './MintNFTPanel'
import { DepositNFTPanel } from './NFTDeposit'
import { NFTCollectPanel } from './CollectionPanel'
import { EditCollectionPanel } from './EditCollectionPanel'
import { MintLandingPage } from './components/landingPanel'
import { ImportCollectionPanel } from './ImportCollectionPanel'
import { CollectionHadUnknown } from '@loopring-web/component-lib'

export const subMenu = subMenuNFT

export const NFTPage = () => {
  let match: any = useRouteMatch('/NFT/:item')
  const selected = match?.params?.item ?? 'assetsNFT'
  const account = useAccount()
  const [open, setOpen] = React.useState(false)
  const routerNFT = React.useMemo(() => {
    switch (selected) {
      case 'transactionNFT':
        return <MyNFTHistory />
      case 'mintNFTLanding':
        return <MintLandingPage />
      case 'mintNFT':
        return <MintNFTPanel />
      case 'mintNFTAdvance':
        return <MintNFTAdvancePanel />
      case 'depositNFT':
        return <DepositNFTPanel />
      case 'myCollection':
        return <NFTCollectPanel />
      case 'addCollection':
      case 'editCollection':
      case 'addLegacyCollection':
        return <EditCollectionPanel type={selected} />
      case 'importLegacyCollection':
        return <ImportCollectionPanel />
      default:
        return <MyNFTPanel />
    }
  }, [selected])
  React.useEffect(() => {
    if (account?.hasUnknownCollection) {
      setOpen(true)
    }
  }, [])

  const activeViewTemplate = React.useMemo(
    () => (
      <>
        <Box
          // minHeight={420}
          display={'flex'}
          alignItems={'stretch'}
          flexDirection={'column'}
          marginTop={0}
          flex={1}
        >
          {routerNFT}
        </Box>
      </>
    ),
    [routerNFT],
  )

  return (
    <>
      <CollectionHadUnknown open={open} onClose={() => setOpen(false)} />
      <ViewAccountTemplate activeViewTemplate={activeViewTemplate} />
    </>
  )
}
