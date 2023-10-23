import { Box, Link, Typography } from '@mui/material'
import { RouterPath, TOAST_TIME } from '@loopring-web/common-resources'
import { CollectionCardList, Toast, ToastType, useSettings } from '@loopring-web/component-lib'
import { useAccount, useMyNFTCollection } from '@loopring-web/core'
import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Trans, WithTranslation, withTranslation } from 'react-i18next'
import styled from '@emotion/styled'

const _StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`
export const MyNFTCollectionList = withTranslation('common')(
  ({
    t,
    size,
    matchPreUrl,
  }: {
    size?: 'large' | 'medium' | 'small' | undefined
    matchPreUrl: string
  } & WithTranslation) => {
    const history = useHistory()
    const { search } = useLocation()
    const searchParams = new URLSearchParams(search)
    const { account } = useAccount()
    const { isMobile } = useSettings()
    const { copyToastOpen, ...collectionListProps } = useMyNFTCollection()
    return (
      <Box
        flex={1}
        marginTop={0}
        paddingX={2}
        marginBottom={2}
        display={'flex'}
        flexDirection={'column'}
      >
        <Typography variant={'body1'} marginY={2} color={'textSecondary'}>
          <Trans i18nKey={'labelMyCollectionsDes'}>
            Legacy NFTs created in Loopring don't contain collection information. We have added the
            feature to allow creators to import the collection information so that those NFTs can be
            categorized well.
            <Link href={`/#/${RouterPath.nft}/importLegacyCollection`} target={'_self'}>
              Go to Import Collection for Legacy NFT
            </Link>
          </Trans>
        </Typography>
        <CollectionCardList
          noEdit={true}
          account={account}
          size={size ?? isMobile ? 'small' : 'large'}
          onItemClick={(item) => {
            searchParams.set('myNFTPage', '1')
            history.push({
              pathname: `${matchPreUrl}byCollection/${item.contractAddress}--${item.id}`,
              search: searchParams.toString(),
            })
            window.scrollTo(0, 0)
          }}
          {...{ ...(collectionListProps as any) }}
        />
        <Toast
          alertText={
            copyToastOpen?.type === 'json'
              ? t('labelCopyMetaClip')
              : copyToastOpen.type === 'url'
              ? t('labelCopyUrlClip')
              : t('labelCopyAddClip')
          }
          open={copyToastOpen?.isShow}
          autoHideDuration={TOAST_TIME}
          onClose={() => {
            collectionListProps.setCopyToastOpen({ isShow: false, type: '' })
          }}
          severity={ToastType.success}
        />
      </Box>
    )
  },
)
