import {
  RawDataNFTRedPacketClaimItem,
  RawDataRedPacketClaimItem,
  ToastType,
  useOpenModals,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import {
  amountStrCallback,
  amountStrNFTCallback,
  LoopringAPI,
  useAccount,
  useTokenMap,
  useTokenPrices,
  volumeToCountAsBigNumber,
} from '@loopring-web/core'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  CLAIM_TYPE,
  ClaimToken,
  RedPacketLimit,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  TokenType,
} from '@loopring-web/common-resources'
import { useHistory } from 'react-router-dom'

export const useClaimRedPacket = <R extends RawDataRedPacketClaimItem>(
  setToastOpen: (props: any) => void,
) => {
  const { t } = useTranslation(['error'])

  const {
    account: { accountId, apiKey },
  } = useAccount()

  const [redPacketClaimList, setRedPacketClaimList] = React.useState<R[]>([])
  const [redPacketClaimTotal, setRedPacketClaimTotal] = React.useState(0)
  const { idIndex, coinMap, tokenMap } = useTokenMap()
  const { tokenPrices } = useTokenPrices()
  const [showLoading, setShowLoading] = React.useState(true)
  const { setShowClaimWithdraw } = useOpenModals()
  const getClaimRedPacket = React.useCallback(async () => {
    setShowLoading(true)
    if (LoopringAPI.luckTokenAPI && accountId && apiKey) {
      const response = await LoopringAPI.luckTokenAPI.getLuckTokenBalances(
        {
          accountId,
          tokens: Reflect.ownKeys(idIndex ?? {}).map((key) => Number(key)),
        },
        apiKey,
      )
      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
        if (setToastOpen) {
          setToastOpen({
            open: true,
            type: ToastType.error,
            content:
              'error : ' + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          })
        }
      } else {
        setRedPacketClaimTotal((response as any)?.totalNum)
        // @ts-ignore
        let result = (response as any)?.tokenBalance.reduce(
          (prev: R[], item: sdk.UserBalanceInfo & any) => {
            const token = tokenMap[idIndex[item.tokenId]]
            const tokenInfo = coinMap[token.symbol ?? '']
            const amountStr = amountStrCallback(tokenMap, idIndex, item.tokenId, item.total).amount

            const volume =
              volumeToCountAsBigNumber(token.symbol, item.total)
                ?.times(tokenPrices[token.symbol ?? ''])
                .toNumber() ?? 0
            const _item: R = {
              token: { ...tokenInfo, type: TokenType.single } as any,
              amountStr,
              volume,
              rawData: item,
            } as R
            prev.push(_item)
            return prev
          },
          [] as R[],
        )

        setRedPacketClaimList(result)
      }
    }
    setShowLoading(false)
  }, [accountId, apiKey, t, idIndex])
  const onItemClick = (item: ClaimToken) => {
    setShowClaimWithdraw({
      isShow: true,
      claimToken: {
        ...item,
      },
      claimType: CLAIM_TYPE.redPacket,
    })
  }
  const [showNFTsPanel, setShowNFTsPanel] = React.useState(false)
  const history = useHistory()
  const onViewMoreClick = (type: 'NFTs' | 'blindbox') => {
    if (type === 'NFTs') {
      history.push('/redPacket/records/NFTsUnClaimed')
    } else {
      history.push('/redPacket/records/BlindBoxUnClaimed')
    }
  }
  const onCloseNFts = () => {
    setShowNFTsPanel(false)
  }

  return {
    onViewMoreClick,
    onItemClick,
    redPacketClaimList,
    showLoading,
    redPacketClaimTotal,
    getClaimRedPacket,
    showNFTsPanel,
    onCloseNFts,
  }
}

export const useClaimNFTRedPacket = <R extends RawDataNFTRedPacketClaimItem>({
  setToastOpen,
}: {
  setToastOpen: (props: any) => void
}) => {
  const { t } = useTranslation(['error'])

  const {
    account: { accountId, apiKey },
  } = useAccount()

  const [redPacketNFTClaimList, setNFTRedPacketClaimList] = React.useState<R[]>([])

  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  const [showLoading, setShowLoading] = React.useState(true)
  const { setShowClaimWithdraw } = useOpenModals()
  const getClaimNFTRedPacket = React.useCallback(
    async ({ offset = 0, limit = RedPacketLimit, filter }: any) => {
      setShowLoading(true)
      if (LoopringAPI.luckTokenAPI && accountId && apiKey) {
        const response = await LoopringAPI.luckTokenAPI.getLuckTokenBalances(
          {
            accountId,
            isNft: true,
            offset,
            limit,
          },
          apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
          if (setToastOpen) {
            setToastOpen({
              open: true,
              type: ToastType.error,
              content:
                'error : ' + errorItem
                  ? t(errorItem.messageKey)
                  : (response as sdk.RESULT_INFO).message,
            })
          }
        } else {
          setTotal((response as any)?.totalNum)
          setPage(Number(1 + (offset / limit).toFixed()))
          // @ts-ignore
          let result = (response as any).tokenBalance?.reduce(
            (prev: R[], item: sdk.UserBalanceInfo & { nftTokenInfo: any }) => {
              const amountStr = amountStrNFTCallback(item?.nftTokenInfo as any, item.total).amount

              // const volume = item.total;
              const _item = {
                token: { ...item.nftTokenInfo, type: TokenType.nft },
                amountStr,
                volume: 0,
                rawData: item,
              } as unknown as R
              prev.push(_item)
              return prev
            },
            [] as R[],
          )

          setNFTRedPacketClaimList(result)
        }
      }
      setShowLoading(false)
    },
    [accountId, apiKey, t],
  )
  const onItemClick = (item: ClaimToken) => {
    setShowClaimWithdraw({
      isShow: true,
      claimToken: {
        ...item,
      },
      claimType: CLAIM_TYPE.redPacket,
    })
  }

  return {
    page,
    onItemClick,
    redPacketNFTClaimList,
    showLoading,
    redPacketNFTClaimTotal: total,
    getClaimNFTRedPacket,
  }
}
