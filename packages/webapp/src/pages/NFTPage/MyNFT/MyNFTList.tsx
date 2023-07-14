import {
  AccountStatus,
  CollectionMeta,
  NFTWholeINFO,
  SagaStatus,
} from '@loopring-web/common-resources'
import { NFTList, useOpenModals, useSettings, useToggle } from '@loopring-web/component-lib'
import { getIPFSString, useAccount, useModalData, useSystem } from '@loopring-web/core'
import React from 'react'
import { useMyNFT } from './useMyNFT'
import { WithTranslation, withTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'
import { Tab, Tabs, Typography } from '@mui/material'
import { useLocation } from 'react-router'

export type MyNFTListProps<NFT> = {
  collectionMeta: CollectionMeta | undefined
  collectionPage?: number
  myNFTPage?: number
  size?: string
  isSelect?: boolean
  selected?: NFT[]
  isMultipleSelect?: boolean
  onSelect: (value: NFT) => void
}
export const MyNFTList = withTranslation('common')(
  <NFT extends NFTWholeINFO>({
    collectionMeta,
    collectionPage,
    myNFTPage,
    size,
    isSelect,
    selected,
    isMultipleSelect,
    onSelect,
    t,
  }: MyNFTListProps<NFT> & WithTranslation) => {
    const { baseURL } = useSystem()
    const { isMobile } = useSettings()
    const { status: accountStatus, account } = useAccount()
    const { search } = useLocation()
    const searchParam = new URLSearchParams(search)
    const [tab, setTab] = React.useState<sdk.NFT_PREFERENCE_TYPE | 'all'>('all')
    const nftProps = useMyNFT({
      collectionMeta,
      collectionPage,
      myNFTPage,
    })
    const {
      // setShowNFTDetail,
      // setShowAccount,
      setShowNFTDeploy,
      setShowNFTDetail,
      setShowNFTTransfer,
      setShowNFTWithdraw,
      setShowTradeIsFrozen,
      setShowRedPacket,
      setShowAccount,
      setNFTMetaNotReady,
      // modals: { isShowNFTDetail },
    } = useOpenModals()
    const { updateNFTDeployData, updateNFTTransferData, updateNFTWithdrawData } = useModalData()
    const { toggle } = useToggle()

    const onPageChange = React.useCallback(
      (page, filter) => {
        nftProps.onPageChange(page, { ...filter })
      },
      [nftProps?.onPageChange],
    )
    const handleTabChange = React.useCallback(
      (_e, value, page = 1) => {
        let _filter = {}
        setTab(value)
        switch (value) {
          case 'all':
            _filter = { favourite: false, hidden: false }
            break
          case sdk.NFT_PREFERENCE_TYPE.fav:
            _filter = { favourite: true }
            break
          case sdk.NFT_PREFERENCE_TYPE.hide:
            _filter = { favourite: false, hidden: true }
            break
        }
        onPageChange(page, _filter)
      },
      [tab, onPageChange],
    )

    React.useEffect(() => {
      if (
        accountStatus === SagaStatus.UNSET &&
        account.readyState === AccountStatus.ACTIVATED &&
        nftProps?.collectionMeta?.contractAddress === collectionMeta?.contractAddress
      ) {
        const page = myNFTPage
        // const page = searchParam.get("myNFTPage");
        const filter = JSON.parse(
          searchParam.get('filter') ??
            JSON.stringify({
              favourite: false,
              hidden: false,
            }),
        )
        let tab = filter?.favourite
          ? sdk.NFT_PREFERENCE_TYPE.fav
          : filter?.hidden
          ? sdk.NFT_PREFERENCE_TYPE.hide
          : 'all'

        handleTabChange(undefined, tab, page ?? 1)
      }
    }, [nftProps?.collectionMeta?.contractAddress, accountStatus, myNFTPage, account.readyState])

    return (
      <>
        <Tabs value={tab} onChange={handleTabChange} aria-label='NFT Group Tab'>
          {['all', sdk.NFT_PREFERENCE_TYPE.fav, sdk.NFT_PREFERENCE_TYPE.hide].map((item) => {
            return (
              <Tab
                disabled={nftProps?.isLoading}
                key={item.toString()}
                value={item.toString()}
                label={
                  <Typography component={'span'} display={'inline-flex'} alignItems={'center'}>
                    {t(`labelNFTList${item}`)}
                  </Typography>
                  // </Tooltip>
                }
              />
            )
          })}
        </Tabs>
        <NFTList
          {...{
            ...nftProps,
            baseURL,
            onClick: isSelect
              ? (value: NFT) => {
                  onSelect(value)
                }
              : nftProps.onDetail,
            getIPFSString,
          }}
          onPageChange={(page) => {
            const filter = JSON.parse(
              searchParam.get('filter') ??
                JSON.stringify({
                  favourite: false,
                  hidden: false,
                }),
            )
            onPageChange(page, filter)
          }}
          account={account}
          isEdit={false}
          isSelectOnly={isSelect}
          isMultipleSelect={isMultipleSelect}
          selected={selected}
          toggle={toggle}
          // @ts-ignore
          setShowNFTDeploy={(item: any) => {
            updateNFTDeployData({ ...item })
            setShowNFTDeploy({ isShow: true, info: { ...{ item } } })
            setShowAccount({ isShow: false })
          }}
          setShowNFTDetail={(item: any) => {
            // updateNFTDetail({...item})
            setShowNFTDetail({ isShow: true, info: { ...{ item } } })
            setShowAccount({ isShow: false })
          }}
          setShowNFTTransfer={(item: any) => {
            updateNFTTransferData({ ...item })
            setShowNFTTransfer({ isShow: false, info: { ...{ item } } })
            setShowAccount({ isShow: false })
          }}
          setShowNFTWithdraw={(item: any) => {
            updateNFTWithdrawData({ ...item })
            setShowNFTWithdraw({ isShow: false, info: { ...{ item } } })
            setShowAccount({ isShow: false })
          }}
          setShowTradeIsFrozen={setShowTradeIsFrozen}
          setShowRedPacket={(item: any) => {
            setShowRedPacket({ isShow: true, info: { ...item } })
            setShowAccount({ isShow: false })
          }}
          setShowAccount={setShowAccount}
          setNFTMetaNotReady={setNFTMetaNotReady}
          isManage={false}
          size={size ?? isMobile ? 'small' : 'large'}
        />
      </>
    )
  },
) as <NFT extends NFTWholeINFO>(pros: MyNFTListProps<NFT>) => JSX.Element
