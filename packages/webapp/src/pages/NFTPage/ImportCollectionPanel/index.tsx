import { Box } from '@mui/material'
import React from 'react'
import { AccountStatus, BackIcon, CollectionMeta, RouterPath } from '@loopring-web/common-resources'
import { useAccount, useModalData } from '@loopring-web/core'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, LoadingBlock, StyledPaperBg } from '@loopring-web/component-lib'
import { CollectionManage } from './CollectionManage'
import { ImportCollection } from './ImportCollection'

enum CollectionImportView {
  Guide = 'Guide',
  Item = 'Item',
}

export const ImportCollectionPanel = <Co extends CollectionMeta>() => {
  const { t } = useTranslation()
  const match: any = useRouteMatch('/nft/importLegacyCollection/:id?')
  const { collectionValue } = useModalData()
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const history = useHistory()
  const { account } = useAccount()
  const [_collection, setCollection] = React.useState<undefined | Co>(
    searchParams.get('isEdit') ? (collectionValue as Co) : undefined,
  )
  const [view, setView] = React.useState<CollectionImportView>(CollectionImportView.Guide)

  React.useEffect(() => {
    const stepList = match?.params?.id?.split('--')
    const contractId = stepList && stepList[1]
    if (searchParams.has('isEdit')) {
      if (
        collectionValue?.id?.toString() === contractId.toString() &&
        account.readyState === AccountStatus.ACTIVATED &&
        collectionValue?.owner?.toLowerCase() === account.accAddress.toLowerCase()
      ) {
        setCollection(collectionValue as Co)
        setView(CollectionImportView.Item)
      } else {
        setView(CollectionImportView.Guide)
        history.replace(`${RouterPath.nft}/importLegacyCollection`)
      }
    }
  }, [search, account.readyState])
  return (
    <Box flex={1} display={'flex'} flexDirection={'column'} marginBottom={2}>
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} marginBottom={2}>
        <Button
          startIcon={<BackIcon fontSize={'small'} />}
          variant={'text'}
          size={'medium'}
          sx={{ color: 'var(--color-text-secondary)' }}
          color={'inherit'}
          onClick={() => history.push(`${RouterPath.nft}/myCollection`)}
        >
          {searchParams.get('isEdit')
            ? t('labelManageCollectionTitle')
            : t('labelImportCollectionTitle')}
        </Button>
      </Box>
      <StyledPaperBg flex={1} display={'flex'}>
        {view === CollectionImportView.Guide && <ImportCollection />}
        {view === CollectionImportView.Item &&
          (_collection?.owner ? (
            <Box flex={1} display={'flex'} paddingX={2}>
              <CollectionManage collection={_collection} />
            </Box>
          ) : (
            <LoadingBlock />
          ))}
      </StyledPaperBg>
    </Box>
  )
}
