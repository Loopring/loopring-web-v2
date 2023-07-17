import { useTranslation } from 'react-i18next'
import { Box, Button } from '@mui/material'
import {
  MintAdvanceNFTWrap,
  MintNFTConfirm,
  PanelContent,
  StyledPaperBg,
} from '@loopring-web/component-lib'
import React from 'react'
import { MetaNFTPanel } from './metaNFTPanel'
import { useMintNFTPanel } from './hook'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { BackIcon, CollectionMeta, TradeNFT } from '@loopring-web/common-resources'
import {
  getIPFSString,
  LoopringAPI,
  makeMeta,
  useMyCollection,
  useNFTMintAdvance,
  useSystem,
} from '@loopring-web/core'

export const MintNFTPanel = <Co extends CollectionMeta>() => {
  const history = useHistory()
  const mintWholeProps = useMintNFTPanel()
  const collectionListProps = useMyCollection()
  const { t } = useTranslation(['common'])
  const { baseURL } = useSystem()

  const panelList: Pick<PanelContent<'METADATA' | 'MINT_CONFIRM'>, 'key' | 'element'>[] = [
    {
      key: 'METADATA',
      element: (
        <MetaNFTPanel
          {...{
            getIPFSString,
            baseURL,
            ...mintWholeProps,
            nftMetaProps: {
              ...mintWholeProps.nftMetaProps,
              collectionInputProps: {
                collection: mintWholeProps.nftMintValue.collection,
                collectionListProps: {
                  ...collectionListProps,
                  size: 'small',
                },
                domain: LoopringAPI.delegate?.getCollectionDomain(),
                makeMeta,
              } as any,
            },
          }}
          // collectionInputProps={}
          nftMetaBtnStatus={mintWholeProps.nftMetaProps.nftMetaBtnStatus}
          btnInfo={mintWholeProps.nftMetaProps.btnInfo}
        />
      ),
    },
    {
      key: 'MINT_CONFIRM',
      element: (
        <MintNFTConfirm
          disabled={false}
          // baseURL={mintWholeProps.nftMetaProps.baseURL}
          walletMap={{}}
          {...{ ...mintWholeProps.nftMintProps, getIPFSString, baseURL }}
          metaData={mintWholeProps.nftMintValue.nftMETA}
          isFeeNotEnough={mintWholeProps.isFeeNotEnough}
          handleFeeChange={mintWholeProps.handleFeeChange}
          chargeFeeTokenList={mintWholeProps.chargeFeeTokenList}
          feeInfo={mintWholeProps.feeInfo}
        />
      ),
    },
  ]
  return (
    <>
      <Box marginBottom={2}>
        <Button
          startIcon={<BackIcon fontSize={'small'} />}
          variant={'text'}
          size={'medium'}
          sx={{ color: 'var(--color-text-secondary)' }}
          color={'inherit'}
          onClick={history.goBack}
        >
          {t('labelMINTNFTTitle')}
          {/*<Typography color={"textPrimary"}></Typography>*/}
        </Button>
      </Box>
      <StyledPaperBg
        flex={1}
        className={'MuiPaper-elevation2'}
        marginTop={0}
        marginBottom={2}
        display={'flex'}
        flexDirection={'column'}
      >
        <Box flex={1} display={'flex'}>
          {
            panelList.map((panel, index) => {
              return (
                <Box
                  flex={1}
                  display={mintWholeProps.currentTab === index ? 'flex' : 'none'}
                  alignItems={'stretch'}
                  key={index}
                >
                  {panel.element}
                </Box>
              )
            })
            // panelList[currentTab].element
          }
        </Box>
      </StyledPaperBg>
    </>
  )
}
export const MintNFTAdvancePanel = <T extends TradeNFT<I, Co>, Co extends CollectionMeta, I>() => {
  const { resetDefault: resetNFTMint, nftMintAdvanceProps, resetIntervalTime } = useNFTMintAdvance()

  const history = useHistory()
  const match: any = useRouteMatch('/nft/:type')
  React.useEffect(() => {
    if (match.params?.type === 'mintNFTAdvance') {
      resetNFTMint()
    } else {
      resetIntervalTime()
    }
    return () => {
      resetIntervalTime()
    }
  }, [match.params?.type])
  const { t } = useTranslation('common')

  return (
    <>
      <Box marginBottom={2}>
        <Button
          startIcon={<BackIcon fontSize={'small'} />}
          variant={'text'}
          size={'medium'}
          sx={{ color: 'var(--color-text-secondary)' }}
          color={'inherit'}
          onClick={history.goBack}
        >
          {t('labelAdMintTitle')}
        </Button>
      </Box>
      <StyledPaperBg
        flex={1}
        className={'MuiPaper-elevation2'}
        marginTop={0}
        marginBottom={2}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'stretch'}
      >
        <MintAdvanceNFTWrap {...{ ...nftMintAdvanceProps }} />
      </StyledPaperBg>
    </>
  )
}
