import { CollectionMeta, GET_IPFS_STRING } from '@loopring-web/common-resources'
import styled from '@emotion/styled'
import { Box, BoxProps, Typography } from '@mui/material'
import React from 'react'
import { NFTList, useOpenModals } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { useAccount } from '@loopring-web/core'
import { useLocation } from 'react-router-dom'

export const CollectionItemPanel = <Co extends CollectionMeta>({
  getIPFSString,
  baseURL,
  nftPublicProps,
}: {
  collectionDate: Co
  getIPFSString: GET_IPFS_STRING
  baseURL: string
  nftPublicProps: any
}) => {
  const { t } = useTranslation()
  const { setNFTMetaNotReady } = useOpenModals()

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'} paddingY={2}>
      <Box display={'flex'} flex={1} marginBottom={1} flexDirection={'column'}>
        <Typography variant={'h5'} marginBottom={1} marginX={3}>
          {t('labelTitleTotalAvailable', { ns: 'common' })}
        </Typography>
        <NFTList
          onPageChange={(page: number) => {
            nftPublicProps.onFilterNFT({ ...nftPublicProps.filter, page })
          }}
          isManage={false}
          isSelectOnly={false}
          isMultipleSelect={false}
          getIPFSString={getIPFSString}
          baseURL={baseURL}
          nftList={nftPublicProps.listNFT}
          isLoading={nftPublicProps.isLoading}
          total={nftPublicProps.total}
          page={nftPublicProps.page}
          size={'medium'}
          onClick={async (_item) => {
            nftPublicProps.onDetail()
          }}
          setNFTMetaNotReady={setNFTMetaNotReady}
        />
      </Box>
    </Box>
  )
}
