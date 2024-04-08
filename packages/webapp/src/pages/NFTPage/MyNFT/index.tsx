import React from 'react'
import { useTranslation } from 'react-i18next'

import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { MyNFTList } from './MyNFTList'
import { NFTDetail, useSystem, useToast } from '@loopring-web/core'
import {
  BackIcon,
  CollectionMeta,
  EmptyValueTag,
  getShortAddr,
  htmlDecode,
  MY_NFT_VIEW,
  NFTSubRouter,
  NFTWholeINFO,
  RouterPath,
  SoursURL,
  TOAST_TIME,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { MyNFTCollectionList } from './MyNFTCollectionList'
import { Box, Breadcrumbs, Link, Tab, Tabs, Typography } from '@mui/material'
import {
  Button,
  Toast,
  ToastType,
  ToggleState,
  useOpenModals,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import { sanitize } from 'dompurify'
import { useNFTCollection } from './useMyNFT'
import { XOR } from '@loopring-web/loopring-sdk'

export const MyNFTPanelUI = <NFT extends NFTWholeINFO>({
  tabBy,
  matchPreUrl,
  contractStr,
  isSelect = false,
  isMultipleSelect,
  collectionMeta,
  toggle,
  selected,
  onSelect,
  size = 'medium',
}: {
  tabBy: MY_NFT_VIEW
  matchPreUrl: string
  contractStr: string
  filter: string
  toggle: ToggleState
  collectionMeta?: CollectionMeta
  size?: 'small' | 'large' | 'medium'
} & XOR<
  {
    isSelect: true
    selected: NFT[]
    isMultipleSelect: boolean
    onSelect: (value: NFT) => void
  },
  { isSelect?: false }
>) => {
  const { t } = useTranslation('common')
  const [currentTab, setCurrentTab] = React.useState(tabBy)
  const { toastOpen, closeToast } = useToast()
  const { isMobile } = useSettings()
  const history = useHistory()
  const { search } = useLocation()
  const { setShowTradeIsFrozen } = useOpenModals()
  const searchParams = new URLSearchParams(search)

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      {tabBy === MY_NFT_VIEW.LIST_COLLECTION && contractStr ? (
        <>
          <Box
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            justifyContent={'space-between'}
            marginBottom={2}
          >
            <Button
              startIcon={<BackIcon fontSize={'small'} />}
              variant={'text'}
              size={'medium'}
              sx={{ color: 'var(--color-text-secondary)' }}
              color={'inherit'}
              onClick={() => history.push(`${matchPreUrl}byCollection?${searchParams.toString()}`)}
            >
              <Typography
                component={'span'}
                color={'inherit'}
                dangerouslySetInnerHTML={{
                  __html: sanitize(
                    t('labelNFTMyNFT', {
                      collection: collectionMeta
                        ? collectionMeta.name
                          ? htmlDecode(collectionMeta?.name)
                          : t('labelUnknown') +
                            ' - ' +
                            getShortAddr(collectionMeta.contractAddress ?? '')
                        : EmptyValueTag,
                    }),
                  ),
                }}
              />
            </Button>
          </Box>
          {collectionMeta ? (
            <Box flex={1} display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
              <MyNFTList
                collectionMeta={collectionMeta}
                collectionPage={
                  searchParams?.get('collectionPage')
                    ? Number(searchParams?.get('collectionPage'))
                    : 1
                }
                size={size}
                onSelect={onSelect as any}
                isSelect={isSelect}
                isMultipleSelect={isMultipleSelect}
                selected={selected}
                myNFTPage={
                  searchParams?.get('myNFTPage') ? Number(searchParams?.get('myNFTPage')) : 1
                }
              />
            </Box>
          ) : (
            <Box
              flex={1}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              height={'90%'}
            >
              <img
                className='loading-gif'
                alt={'loading'}
                width='36'
                src={`${SoursURL}images/loading-line.gif`}
              />
            </Box>
          )}
        </>
      ) : (
        <>
          <Box
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={isMobile ? 'stretch' : 'center'}
            marginBottom={1}
            flexDirection={isMobile ? 'column' : 'row'}
          >
            <Tabs
              value={currentTab}
              onChange={(_event, value) => {
                history.replace(`${matchPreUrl}${value}`)
                setCurrentTab(value)
              }}
              aria-label='my-nft-tabs'
              variant='scrollable'
              sx={{ order: isMobile ? 1 : 0 }}
            >
              <Tab label={t('labelNFTMyNFTList')} value={MY_NFT_VIEW.LIST_NFT} />
              <Tab label={t('labelNFTMyNFTCollection')} value={MY_NFT_VIEW.LIST_COLLECTION} />
            </Tabs>
            {!isSelect && (
              <Box
                sx={{ order: isMobile ? 0 : 0 }}
                display={'flex'}
                flexDirection={'row'}
                paddingX={isMobile ? 0 : 5 / 2}
                paddingY={isMobile ? 2 : 0}
              >
                <Box marginLeft={1}>
                  <Button
                    variant={'contained'}
                    size={'small'}
                    color={'primary'}
                    // disabled={!toggle.depositNFT}
                    onClick={() => {
                      if (toggle.depositNFT.enable) {
                        history.push(`${RouterPath.nft}/${NFTSubRouter.depositNFT}`)
                      } else {
                        setShowTradeIsFrozen({ isShow: true, type: 'Deposit' })
                      }
                    }}
                  >
                    {t('labelL1toL2NFT')}
                  </Button>
                </Box>
                <Box marginLeft={1}>
                  <Button
                    variant={'outlined'}
                    color={'primary'}
                    onClick={() => history.push(`${RouterPath.nft}/${NFTSubRouter.transactionNFT}`)}
                  >
                    {t('labelTransactionNFT')}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
          <Box display={'flex'} flex={1} flexDirection={'column'} justifyContent={'stretch'}>
            {currentTab === MY_NFT_VIEW.LIST_NFT && (
              <MyNFTList
                size={size}
                onSelect={onSelect as any}
                collectionMeta={undefined}
                isSelect={isSelect}
                isMultipleSelect={isMultipleSelect}
                selected={selected}
                myNFTPage={
                  searchParams?.get('myNFTPage') ? Number(searchParams?.get('myNFTPage')) : 1
                }
              />
            )}
            {currentTab === MY_NFT_VIEW.LIST_COLLECTION && (
              <MyNFTCollectionList size={size} matchPreUrl={matchPreUrl} />
            )}
          </Box>
        </>
      )}

      <Toast
        alertText={toastOpen?.content ?? ''}
        severity={toastOpen?.type ?? ToastType.success}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />
    </Box>
  )
}
export const MyNFTPanel = ({}: any) => {
  const matchPreUrl = '/nft/assetsNFT/'
  const preMatch = useRouteMatch(`/nft/assetsNFT/:tab?/:contract?`)
  const { baseURL, etherscanBaseUrl } = useSystem()
  const { search, pathname } = useLocation()
  const history = useHistory()
  const { t } = useTranslation('common')
  const { toggle } = useToggle()
  const searchParams = new URLSearchParams(search)
  const filter = JSON.parse(
    searchParams.get('filter') ??
      JSON.stringify({
        favourite: false,
        hidden: false,
      }),
  )
  const tabBy = preMatch?.params['tab'] ?? MY_NFT_VIEW.LIST_COLLECTION
  const contractStr = preMatch?.params['contract'] ?? ''
  const { collectionMeta } = useNFTCollection({ contractStr, matchPreUrl })
  const {
    modals: { isShowNFTDetail },
    setShowNFTDetail,
    setNFTMetaNotReady,
  } = useOpenModals()
  React.useEffect(() => {
    if (isShowNFTDetail.isShow) {
      searchParams.set('detail', 'true')
    } else {
      searchParams.delete('detail')
    }
    history.replace(pathname + '?' + searchParams.toString())

    return () => {
      if (isShowNFTDetail.isShow) {
        setShowNFTDetail({ isShow: false })
      }
    }
  }, [isShowNFTDetail.isShow])
  const breadcrumbs = React.useMemo(() => {
    const [contract, id] = contractStr ? contractStr.split('--') : [null, null]
    return [
      <Link
        underline='hover'
        key='1'
        color='inherit'
        onClick={() => {
          if (tabBy === MY_NFT_VIEW.LIST_NFT) {
            history.replace(
              `${matchPreUrl}${tabBy ?? MY_NFT_VIEW.LIST_NFT}?${searchParams.toString()}`,
            )
          } else {
            history.replace(`${matchPreUrl}byCollection?${searchParams.toString()}`)
          }
          setShowNFTDetail({ isShow: false })
        }}
      >
        {t('labelNFTTitleMyNFT')}
      </Link>,
      ...[
        tabBy === MY_NFT_VIEW.LIST_COLLECTION && contract && id && contract.startsWith('0x')
          ? [
              <Link
                underline='hover'
                key='2'
                color='inherit'
                onClick={() => {
                  history.replace(
                    `${matchPreUrl}${
                      MY_NFT_VIEW.LIST_COLLECTION
                    }/${contract}--${id}?${searchParams.toString()}`,
                  )
                  setShowNFTDetail({ isShow: false })
                }}
              >
                <Typography
                  component={'span'}
                  color={'inherit'}
                  dangerouslySetInnerHTML={{
                    __html: sanitize(
                      t('labelNFTMyCollection', {
                        collection: collectionMeta
                          ? collectionMeta.name
                            ? htmlDecode(collectionMeta?.name)
                            : t('labelUnknown') +
                              ' - ' +
                              getShortAddr(collectionMeta.contractAddress ?? '')
                          : EmptyValueTag,
                      }),
                    ),
                  }}
                />
              </Link>,
            ]
          : [],
      ],
      <Typography key='3' color={'textPrimary'}>
        {t('labelDetail')}
      </Typography>,
    ]
  }, [contractStr, tabBy, collectionMeta, searchParams.get('filter')])

  return (
    <>
      {isShowNFTDetail.isShow ? (
        <>
          <Breadcrumbs
            separator={<BackIcon fontSize={'small'} sx={{ transform: 'rotate(180deg)' }} />}
            aria-label='breadcrumb'
          >
            {breadcrumbs}
          </Breadcrumbs>
          <NFTDetail
            baseURL={baseURL}
            etherscanBaseUrl={etherscanBaseUrl}
            popItem={isShowNFTDetail}
            assetsRawData={[]}
            setNFTMetaNotReady={setNFTMetaNotReady}
          />
        </>
      ) : (
        <MyNFTPanelUI
          tabBy={tabBy}
          filter={
            filter?.favourite
              ? sdk.NFT_PREFERENCE_TYPE.fav
              : filter?.hidden
              ? sdk.NFT_PREFERENCE_TYPE.hide
              : 'all'
          }
          toggle={toggle}
          collectionMeta={collectionMeta}
          contractStr={contractStr}
          matchPreUrl={matchPreUrl}
        />
      )}
    </>
  )
}
