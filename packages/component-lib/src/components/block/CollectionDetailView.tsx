import {
  Account,
  CollectionMeta,
  CopyIcon,
  copyToClipBoard,
  GET_IPFS_STRING,
  getShortAddr,
  ImageIcon,
} from '@loopring-web/common-resources'
import styled from '@emotion/styled'
import { Avatar, Box, BoxProps, Link, Typography } from '@mui/material'
import { useTheme } from '@emotion/react'
import { Button, useSettings } from '../../index'
import { useTranslation } from 'react-i18next'
import { sanitize } from 'dompurify'

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`
//--color-box
const HeaderBannerStyle = styled(Box)<BoxProps & { url: string }>`
  background-image: url(${({ url }) => url});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: ${({ theme }) => theme.unit}px;
  height: 100%;
  width: 100%;
` as (props: BoxProps & { url: string }) => JSX.Element

export const CollectionDetailView = <Co extends CollectionMeta>({
  collectionDate,
  getIPFSString,
  baseURL,
  account,
  setCopyToastOpen,
  setShowEdit,
  setShowManageLegacy,
  count,
}: {
  collectionDate: Co
  getIPFSString: GET_IPFS_STRING
  baseURL: string
  account: Account
  setShowManageLegacy?: (item: Co) => void
  setShowEdit?: (item: Co) => void
  count: number
  setCopyToastOpen: (props: { isShow: boolean; type: string }) => void
}) => {
  const theme = useTheme()
  const { isMobile } = useSettings()
  const { t } = useTranslation()
  const lageSize = isMobile
    ? {
        icon: 36,
        move: 20,
        width: 'var(--nft-small-avatar)',
      }
    : {
        icon: 48,
        move: 40,
        width: 'var(--nft-large-avatar)',
      }
  return (
    <StyledPaper display={'flex'} marginX={2} flexDirection={'column'}>
      <Box
        width={'100%'}
        paddingTop={'calc(100% / 3)'}
        position={'relative'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        borderRadius={1}
        sx={{ background: 'var(--field-opacity)' }}
      >
        <Box
          display={'flex'}
          position={'absolute'}
          alignItems={'center'}
          top={0}
          left={0}
          right={0}
          bottom={0}
          justifyContent={'center'}
        >
          {(
            collectionDate?.cached?.banner ?? getIPFSString(collectionDate?.banner ?? '', baseURL)
          ).startsWith('http') ? (
            <HeaderBannerStyle
              url={
                collectionDate?.cached?.banner ??
                getIPFSString(collectionDate?.banner ?? '', baseURL)
              }
            />
          ) : (
            <ImageIcon
              style={{
                height: lageSize.icon,
                width: lageSize.icon,
              }}
            />
          )}
        </Box>
      </Box>

      <Box paddingLeft={5} paddingRight={3} position={'relative'} display={'flex'}>
        <Box
          position={'relative'}
          top={-lageSize.move}
          // left={lageSize.move}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          height={lageSize.width}
          width={lageSize.width}
          borderRadius={theme.unit}
          sx={{ background: 'var(--color-pop-bg)' }}
        >
          {(
            collectionDate?.cached?.avatar ?? getIPFSString(collectionDate?.avatar ?? '', baseURL)
          ).startsWith('http') ? (
            <Avatar
              sx={{
                bgcolor: 'var(--color-border-disable2)',
                borderRadius: `${theme.unit}px`,
                height: '100%',
                width: '100%',
              }}
              variant={'rounded'}
              src={
                collectionDate?.cached?.avatar ??
                getIPFSString(collectionDate?.avatar ?? '', baseURL)
              }
            />
          ) : (
            <ImageIcon fontSize={'large'} />
          )}
        </Box>
        <Box
          flex={1}
          paddingY={3}
          paddingLeft={3}
          position={'relative'}
          display={'flex'}
          justifyContent={'space-between'}
        >
          <Box>
            <Typography
              variant={'body1'}
              component={'span'}
              whiteSpace={'pre'}
              overflow={'hidden'}
              display={'flex'}
              textOverflow={'ellipsis'}
              dangerouslySetInnerHTML={{
                __html:
                  sanitize(
                    collectionDate?.name
                      ? collectionDate.name
                      : t('labelUnknown') +
                          '-' +
                          getShortAddr(collectionDate?.contractAddress ?? '', true),
                  ) ?? '',
              }}
            />
            <Link
              color={'textPrimary'}
              paddingTop={1}
              variant={'body1'}
              component={'span'}
              whiteSpace={'pre'}
              overflow={'hidden'}
              display={'flex'}
              alignItems={'center'}
              textOverflow={'ellipsis'}
              onClick={(e) => {
                e.stopPropagation()
                copyToClipBoard(collectionDate?.contractAddress ?? '')
                setCopyToastOpen({ isShow: true, type: 'address' })
              }}
            >
              {getShortAddr(collectionDate?.contractAddress ?? '')}
              <CopyIcon color={'inherit'} sx={{ marginLeft: 1 }} />
            </Link>
            <Typography
              color={'textPrimary'}
              paddingTop={1}
              variant={'body1'}
              component={'span'}
              whiteSpace={'pre'}
              overflow={'hidden'}
              display={'flex'}
              textOverflow={'ellipsis'}
            >
              {t('labelCollectionItemValue', {
                value: count, //collectionDate?.extends.count,
              })}
            </Typography>
          </Box>
          <Box display={'flex'} flexDirection={'column'} alignItems={'flex-end'}>
            <Typography
              color={'textPrimary'}
              variant={'body1'}
              component={'span'}
              whiteSpace={'pre'}
              overflow={'hidden'}
              display={'flex'}
              textOverflow={'ellipsis'}
              title={collectionDate?.nftType}
            >
              {collectionDate?.nftType}
            </Typography>
            {account.accAddress === collectionDate.owner ? (
              <>
                {setShowEdit && collectionDate.extra?.properties?.isEditable && (
                  <Button
                    fullWidth
                    variant={'outlined'}
                    size={'medium'}
                    color={'primary'}
                    onClick={() => {
                      setShowEdit(collectionDate)
                    }}
                    sx={{ marginTop: 1 }}
                  >
                    {t(`labelCollectionEditBtn`)}
                  </Button>
                )}
                {setShowManageLegacy &&
                  collectionDate.extra?.properties?.isLegacy &&
                  collectionDate.extra?.properties?.isEditable && (
                    <Button
                      fullWidth
                      variant={'outlined'}
                      size={'medium'}
                      color={'primary'}
                      onClick={() => {
                        setShowManageLegacy(collectionDate)
                      }}
                      sx={{ marginTop: 1 }}
                    >
                      {t(`labelCollectionImportNFTBtn`)}
                    </Button>
                  )}
              </>
            ) : (
              <></>
            )}
          </Box>
        </Box>
      </Box>
    </StyledPaper>
  )
}
