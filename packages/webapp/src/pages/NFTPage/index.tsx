import { useRouteMatch } from 'react-router-dom'
import { Box, Link, Typography } from '@mui/material'
import { AccountStatus, subMenuNFT, SUBMIT_PANEL_AUTO_CLOSE } from '@loopring-web/common-resources'
import React from 'react'
import { onchainHashInfo, store, useAccount, ViewAccountTemplate } from '@loopring-web/core'
import { MyNFTPanel } from './MyNFT'
import { MyNFTHistory } from './NFThistory'
import { MintNFTAdvancePanel, MintNFTPanel } from './MintNFTPanel'
import { DepositNFTPanel } from './NFTDeposit'
import { NFTCollectPanel } from './CollectionPanel'
import { EditCollectionPanel } from './EditCollectionPanel'
import { MintLandingPage } from './components/landingPanel'
import { ImportCollectionPanel } from './ImportCollectionPanel'
import { CollectionHadUnknown, ToastType, Toast } from '@loopring-web/component-lib'
import { Trans } from 'react-i18next'
import styled from '@emotion/styled'

export const subMenu = subMenuNFT
export const BoxStyle = styled(Box)`
  .MuiSnackbar-root {
    max-width: var(--modal-min-width);
    pointer-events: initial;
  }
` as typeof Box

export const NFTPage = () => {
  let match: any = useRouteMatch('/NFT/:item')
  const selected = match?.params?.item ?? 'assetsNFT'
  const { account } = useAccount()
  const [showUnknownCollection, setShowUnknownCollection] = React.useState(false)
  const { updateHadUnknownCollection } = onchainHashInfo.useOnChainInfo()
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
    if (account?.hasUnknownCollection && account.readyState === AccountStatus.ACTIVATED) {
      const {
        system: { chainId },
        localStore: { chainHashInfos },
      } = store.getState()
      const showHadUnknownCollection = chainHashInfos[chainId]?.showHadUnknownCollection
      if (
        !(showHadUnknownCollection && showHadUnknownCollection[account?.accAddress?.toLowerCase()])
      ) {
        setOpen(true)
      } else {
        // setShowUnknownCollection(true)
      }
    }
  }, [account?.readyState])

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
    <BoxStyle flex={1} display={'flex'} flexDirection={'column'}>
      <Toast
        alertText={
          <Typography component={'span'}>
            <Trans i18nKey={'errorHadUnknownCollectionDes'} ns={'error'}>
              As the creator, you will be able to generate collection information for those NFT
              minted earlier that belong to nowhere. And once done, the other people holding your
              NFT will be able to view those NFT with proper collection information via loopring.io
              and loopring wallet.
              <Link
                display={'inline-flex'}
                target='_self'
                rel='noopener noreferrer'
                href={'/nft/importLegacyCollection'}
                paddingLeft={1 / 2}
              >
                GO
              </Link>
            </Trans>
          </Typography>
        }
        open={showUnknownCollection}
        autoHideDuration={SUBMIT_PANEL_AUTO_CLOSE}
        onClose={() => {
          setShowUnknownCollection(false)
        }}
        severity={ToastType.warning}
      />
      <CollectionHadUnknown
        open={open}
        onClose={() => {
          updateHadUnknownCollection({ accountAddress: account?.accAddress?.toLowerCase() })
          setOpen(false)
        }}
      />
      <ViewAccountTemplate activeViewTemplate={activeViewTemplate} />
    </BoxStyle>
  )
}
