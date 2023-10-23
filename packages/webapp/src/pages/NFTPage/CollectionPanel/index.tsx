import {
  CollectionCardList,
  CollectionDetailView,
  StyledPaperBg,
  Toast,
  ToastType,
  useOpenModals,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { Box, Button, Tooltip, Typography } from '@mui/material'
import React from 'react'
import {
  AddIcon,
  CollectionMeta,
  CreateCollectionStep,
  Explorer,
  TOAST_TIME,
  TradeNFT,
  RouterPath,
} from '@loopring-web/common-resources'
import {
  getIPFSString,
  LoopringAPI,
  useAccount,
  useModalData,
  useMyCollection,
  useSystem,
} from '@loopring-web/core'
import { CreateUrlPanel } from '../components/landingPanel'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { useTheme } from '@emotion/react'
import { CollectionItemPanel } from '../components/CollectionItemPanel'
import { usePublicNFTs } from '../components/usePublicNFTs'

enum MyCollectionView {
  List = 'List',
  Item = 'Item',
}

export const NFTCollectPanel = <Co extends CollectionMeta>() => {
  const { t } = useTranslation(['common'])
  const { baseURL } = useSystem()
  const theme = useTheme()
  const { copyToastOpen, ...collectionListProps } = useMyCollection()
  const [showCreateOpen, setCreateOpen] = React.useState(false)
  const [view, setView] = React.useState<MyCollectionView>(MyCollectionView.List)
  const { updateCollectionData } = useModalData()
  const { isMobile } = useSettings()

  const [detail, setDetail] = React.useState<CollectionMeta | undefined>(undefined)
  const history = useHistory()
  const match: any = useRouteMatch('/nft/myCollection/:id')
  React.useEffect(() => {
    if (match?.params?.id) {
      const loopringId = match.params.id.split('--')[1]
      if (loopringId && detail) {
        setView(MyCollectionView.Item)
        return
      }
    }
    setView(MyCollectionView.List)
  }, [match?.params?.id])

  const { account } = useAccount()
  const {
    toggle: { deployNFT },
  } = useToggle()
  const { setShowNFTDeploy, setShowTradeIsFrozen } = useOpenModals()
  const { updateNFTDeployData, updateNFTMintData, nftMintValue } = useModalData()
  const { search, ...rest } = useLocation()
  const searchParams = new URLSearchParams(search)
  const nftPublicProps = usePublicNFTs({
    collection: detail ?? ({} as any),
    page: searchParams?.get('totalPage') ? Number(searchParams?.get('totalPage')) : 1,
  })
  return (
    <Box flex={1} marginTop={0} marginBottom={2} display={'flex'} flexDirection={'column'}>
      {view === MyCollectionView.List && (
        <>
          <Box
            display={'flex'}
            flexDirection={isMobile ? 'column' : 'row'}
            alignItems={isMobile ? 'flex-start' : 'center'}
            justifyContent={'space-between'}
          >
            <Typography component={'h3'} variant={'h4'} paddingBottom={2}>
              {t('labelMyCollection')}
            </Typography>

            <Box display={'flex'} flexDirection={isMobile ? 'column' : 'row'}>
              <Tooltip title={t('labelCheckImportCollectionDes').toString()}>
                <Button
                  onClick={() => {
                    history.push(`${RouterPath.nft}/importLegacyCollection`)
                  }}
                  sx={isMobile ? { marginBottom: 2 } : { marginRight: 1 }}
                  // startIcon={<DownloadIcon />}
                  variant={'outlined'}
                  color={'primary'}
                >
                  {t('labelImportCollection')}
                </Button>
              </Tooltip>
              <Button
                onClick={() => {
                  history.push(`${RouterPath.nft}/addCollection`)
                  // setStep(CreateCollectionStep.ChooseMethod);
                  // setCreateOpen(true);
                }}
                startIcon={<AddIcon />}
                variant={'contained'}
                size={'small'}
                color={'primary'}
              >
                {t('labelCreateCollection')}
              </Button>
              <Button
                onClick={() => {
                  window?.open(`${Explorer}/account/${account.accountId}-nfts`, '_blank')?.focus()
                }}
                sx={isMobile ? { marginTop: 2 } : { marginLeft: 1 }}
                variant={'outlined'}
                color={'primary'}
              >
                {t('labelExplorer')}
              </Button>
            </Box>
          </Box>
          <Box flex={1} paddingBottom={2} display={'flex'}>
            <CollectionCardList
              {...{ ...(collectionListProps as any) }}
              account={account}
              toggle={deployNFT}
              size={isMobile ? 'small' : 'large'}
              setShowEdit={(item) => {
                updateCollectionData({ ...item })
                history.push(`${RouterPath.nft}/editCollection/${item.contractAddress}--${item.id}`)
              }}
              setShowManageLegacy={(item) => {
                updateCollectionData({ ...item })
                history.push(
                  `${RouterPath.nft}/importLegacyCollection/${item.contractAddress}--${item.id}?isEdit=true`,
                )
              }}
              onItemClick={(item) => {
                history.push(`${RouterPath.nft}/myCollection/${item.contractAddress}--${item.id}`)
                setDetail(item)
              }}
              setShowMintNFT={(item) => {
                setCreateOpen(true)
                updateNFTMintData({
                  nftMETA: nftMintValue.mintData,
                  mintData: nftMintValue.nftMETA,
                  collection: undefined,
                })
                history.push(`${RouterPath.nft}/mintNFT/${item.contractAddress}`)
              }}
              setShowTradeIsFrozen={(item, typeKey) => {
                setShowTradeIsFrozen({
                  isShow: true,
                  type: typeKey,
                })
              }}
              setShowDeploy={(item: Co) => {
                const _deployItem: TradeNFT<any, any> = {
                  tokenAddress: item?.contractAddress,
                  nftType: item.nftType,
                  collectionMeta: item,
                }
                LoopringAPI.userAPI?.getAvailableBroker({ type: 0 }).then(({ broker }) => {
                  updateNFTDeployData({ broker })
                })
                updateNFTDeployData(_deployItem)
                deployNFT.enable
                  ? setShowNFTDeploy({
                      isShow: true,
                      info: { ...{ _deployItem } },
                    })
                  : setShowTradeIsFrozen({
                      isShow: true,
                      type: t('nftDeployDescription'),
                    })
              }}
            />
          </Box>
        </>
      )}
      {view === MyCollectionView.Item && detail && (
        <Box flex={1} display={'flex'} flexDirection={'column'}>
          <CollectionDetailView
            collectionDate={detail}
            getIPFSString={getIPFSString}
            baseURL={baseURL}
            account={account}
            setShowEdit={(item) => {
              updateCollectionData({ ...item })
              history.push(`${RouterPath.nft}/editCollection/${item.contractAddress}--${item.id}`)
            }}
            setShowManageLegacy={(item) => {
              updateCollectionData({ ...item })
              history.push(
                `${RouterPath.nft}/importLegacyCollection/${item.contractAddress}--${item.id}?isEdit=true`,
              )
            }}
            count={nftPublicProps?.total}
            setCopyToastOpen={collectionListProps.setCopyToastOpen}
          />
          <StyledPaperBg flex={1} marginTop={2} marginX={2} height={'100%'} display={'flex'}>
            <CollectionItemPanel
              nftPublicProps={nftPublicProps}
              collectionDate={detail}
              getIPFSString={getIPFSString}
              baseURL={baseURL}
            />
            {/*<EmptyDefault*/}
            {/*  sx={{ flex: 1 }}*/}
            {/*  message={() => {*/}
            {/*    return <Trans i18nKey="labelComingSoon">Coming Soon</Trans>;*/}
            {/*  }}*/}
            {/*/>*/}
          </StyledPaperBg>
        </Box>
      )}

      <CreateUrlPanel
        open={showCreateOpen}
        step={CreateCollectionStep.ChooseMethod}
        onClose={() => {
          setCreateOpen(false)
        }}
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
}
