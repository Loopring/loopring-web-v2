import { useTranslation } from 'react-i18next'
import {
  amountStrCallback,
  amountStrNFTCallback,
  LoopringAPI,
  useAccount,
  useTokenMap,
} from '@loopring-web/core'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  CLAIM_TYPE,
  getShortAddr,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  TokenType,
} from '@loopring-web/common-resources'
import {
  AccountStep,
  RawDataRedPacketReceivesItem,
  RawDataRedPacketRecordsItem,
  RedPacketViewStep,
  ToastType,
  useOpenModals,
} from '@loopring-web/component-lib'

export const useMyRedPacketRecordTransaction = <R extends RawDataRedPacketRecordsItem>({
  setToastOpen,
}: // tabType,
{
  setToastOpen: (props: any) => void
  // tabType: TabTokenTypeIndex;
}) => {
  const { t } = useTranslation(['error'])

  const {
    account: { accountId, apiKey },
  } = useAccount()

  const [myRedPacketRecordList, setMyRedPacketRecordList] = React.useState<R[]>([])
  const { setShowRedPacket } = useOpenModals()
  const { idIndex, coinMap, tokenMap } = useTokenMap()
  const [myRedPacketRecordTotal, setMyRedPacketRecordTotal] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(true)
  // let match: any = useRouteMatch("/redPacket/records/?:item/?:type");
  const getMyRedPacketRecordTxList = React.useCallback(
    async ({ offset, limit, filter }: any) => {
      setShowLoading(true)
      if (LoopringAPI.luckTokenAPI && accountId) {
        if (apiKey) {
          myLog('filterfilterfilterfilterfilter', filter)
          const response = await LoopringAPI.luckTokenAPI.getLuckTokenLuckyTokens(
            {
              senderId: accountId,
              scopes: '0,1,2',
              partitions: '0,1',
              statuses: '1,2,3,4',
              official: false,
              offset,
              limit,
              ...filter,
            } as any,
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
            setMyRedPacketRecordTotal((response as any)?.totalNum)
            // @ts-ignore
            let result = (response as any)?.list.reduce(
              (prev: RawDataRedPacketRecordsItem[], item: sdk.LuckyTokenItemForReceive) => {
                // const type = coinMap[idIndex[item.tokenId] ?? ""];
                let remainAmount, totalAmount, tokenInfo
                if (item.isNft) {
                  tokenInfo = {
                    ...item.nftTokenInfo,
                    type: TokenType.nft,
                    // icon:
                  }
                  totalAmount = amountStrNFTCallback(
                    item.nftTokenInfo as any,
                    item.tokenAmount.totalAmount ?? 0,
                  ).amount
                  remainAmount = amountStrNFTCallback(
                    item.nftTokenInfo as any,
                    item.tokenAmount.remainAmount ?? 0,
                  ).amount
                } else {
                  const token = tokenMap[idIndex[item.tokenId]]
                  tokenInfo = {
                    ...coinMap[token.symbol ?? ''],
                    name: token?.name,
                    type: TokenType.single,
                  }
                  totalAmount = amountStrCallback(
                    tokenMap,
                    idIndex,
                    item.tokenId,
                    item.tokenAmount.totalAmount ?? 0,
                  ).amount
                  remainAmount = amountStrCallback(
                    tokenMap,
                    idIndex,
                    item.tokenId,
                    item.tokenAmount.remainAmount ?? 0,
                  ).amount
                }

                prev.push({
                  token: {
                    ...tokenInfo,
                  } as any,
                  type: item.type, //sdk.LuckyTokenItemStatus
                  status: item.status,
                  validSince: item.validSince,
                  validUntil: item.validUntil,
                  totalCount: item.tokenAmount.totalCount,
                  remainCount: item.tokenAmount.remainCount,
                  totalAmount,
                  remainAmount,
                  createdAt: item.createdAt,
                  rawData: item,
                })
                return prev
              },
              [] as RawDataRedPacketRecordsItem[],
            )

            setMyRedPacketRecordList(result)
          }
        }
      }
      setShowLoading(false)
    },
    [accountId, apiKey, setToastOpen, t, idIndex],
  )
  const onItemClick = async (item: sdk.LuckyTokenItemForReceive) => {
    const resposne = await LoopringAPI.luckTokenAPI?.getLuckTokenDetail(
      {
        hash: item.hash,
      },
      apiKey,
    )
    if (resposne?.detail.luckyToken.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
      if (
        resposne?.detail.luckyToken.status === sdk.LuckyTokenItemStatus.PENDING &&
        (resposne?.raw_data as any).blindBoxStatus === '' && 
        resposne?.detail.luckyToken.type.scope !== sdk.LuckyTokenViewType.TARGET
      ) {
        setShowRedPacket({
          isShow: true,
          info: {
            ...item,
            hash: item.hash,
            serialNo: item.serialNo
          },
          step: RedPacketViewStep.OpenPanel,
        })
      } else {
        setShowRedPacket({
          isShow: true,
          info: {
            ...item,
            hash: item.hash,
            serialNo: item.serialNo
          },
          step: RedPacketViewStep.BlindBoxDetail,
        })
      }
    } else {
      if (
        resposne?.detail.luckyToken.status === sdk.LuckyTokenItemStatus.PENDING &&
        !resposne?.detail.claimStatus &&
        resposne?.detail.luckyToken.type.scope !== sdk.LuckyTokenViewType.TARGET
      ) {
        setShowRedPacket({
          isShow: true,
          info: {
            ...item,
            hash: item.hash,
            serialNo: item.serialNo
          },
          step: RedPacketViewStep.OpenPanel,
        })
      } else {
        setShowRedPacket({
          isShow: true,
          info: {
            ...item,
            hash: item.hash,
            serialNo: item.serialNo
          },
          step: RedPacketViewStep.DetailPanel,
        })
      }
    }
  }

  return {
    // page,
    onItemClick,
    myRedPacketRecordList,
    showLoading,
    getMyRedPacketRecordTxList,
    myRedPacketRecordTotal,
  }
}

export const useMyRedPacketReceiveTransaction = <R extends RawDataRedPacketReceivesItem>({
  setToastOpen,
}: {
  setToastOpen: (props: any) => void
}) => {
  const { t } = useTranslation(['error'])

  const {
    account: { accountId, apiKey, accAddress },
  } = useAccount()

  const [redPacketReceiveList, setRedPacketReceiveList] = React.useState<R[]>([])
  const { setShowRedPacket, setShowClaimWithdraw } = useOpenModals()

  const { idIndex, coinMap, tokenMap } = useTokenMap()
  const [redPacketReceiveTotal, setRedPacketReceiveTotal] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(true)
  // let match: any = useRouteMatch("/redPacket/records/?:item/?:type");

  const getRedPacketReceiveList = React.useCallback(
    async ({ offset, limit, filter }: any) => {
      setShowLoading(true)
      try {
        if (LoopringAPI.luckTokenAPI && accountId) {
          if (apiKey) {
            const response = await LoopringAPI.luckTokenAPI.getLuckTokenClaimHistory(
              {
                offset,
                limit,
                ...filter,
              } as any,
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
              setRedPacketReceiveTotal((response as any)?.totalNum)
              // @ts-ignore
              let result = (response as any)?.list.reduce(
                (prev: R[], item: sdk.LuckTokenHistory) => {
                  // @ts-ignore
                  const { luckyToken, claim: myClaim } = item

                  let amount, tokenInfo
                  if (luckyToken.isNft) {
                    amount = amountStrNFTCallback(
                      luckyToken.nftTokenInfo as any,
                      myClaim?.amount?.toString() ?? 0,
                    ).amount
                    tokenInfo = {
                      ...luckyToken.nftTokenInfo,
                      type: TokenType.nft,
                    }
                  } else {
                    const token = tokenMap[idIndex[luckyToken.tokenId]]
                    tokenInfo = {
                      ...coinMap[token.symbol ?? ''],
                      name: token.name,
                      type: TokenType.single,
                    }
                    amount = amountStrCallback(
                      tokenMap,
                      idIndex,
                      luckyToken.tokenId,
                      myClaim?.amount?.toString() ?? 0,
                    ).amount
                  }

                  prev.push()
                  return [
                    ...prev,
                    {
                      token: {
                        ...tokenInfo,
                      } as any,
                      amount,
                      type: luckyToken.type, //sdk.LuckyTokenItemStatus
                      status: luckyToken.status,
                      claimAt: myClaim?.createdAt,
                      sender: luckyToken?.sender?.ens
                        ? luckyToken?.sender?.ens
                        : getShortAddr(luckyToken?.sender?.address),
                      rawData: item,
                    },
                  ]
                },
                [] as R[],
              )

              setRedPacketReceiveList(result)
            }
          }
        }
      } finally {
        setShowLoading(false)
      }
    },
    [accountId, apiKey, setToastOpen, t, idIndex],
  )

  const onItemClick = (item: sdk.LuckTokenHistory) => {
    if (item.luckyToken.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
      setShowRedPacket({
        isShow: true,
        step: RedPacketViewStep.BlindBoxDetail,
        info: {
          ...item.luckyToken,
          serialNo: item.claim.serialNo
        },
      })
    } else {
      setShowRedPacket({
        isShow: true,
        step: RedPacketViewStep.DetailPanel,
        info: {
          ...item.luckyToken,
          serialNo: item.claim.serialNo
        },
      })
    }
  }
  const onClaimItem = async (item: sdk.LuckTokenHistory) => {
    const response = await LoopringAPI.luckTokenAPI?.getLuckTokenBalances(
      {
        accountId: accountId,
        isNft: item.luckyToken.isNft,
        tokens: [item.luckyToken.tokenId],
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
      setShowClaimWithdraw({
        isShow: true,
        claimToken: {
          tokenId: item.luckyToken.tokenId,
          total: item.claim.amount.toString(),
          locked: response!.tokenBalance[0].locked,
          pending: response!.tokenBalance[0].pending,
          nftTokenInfo: item.luckyToken.nftTokenInfo,
          isNft: item.luckyToken.isNft,
          luckyTokenHash: item.luckyToken.hash,
        },
        claimType: CLAIM_TYPE.redPacket,
      })
    }
  }
  return {
    onItemClick,
    redPacketReceiveList,
    showLoading,
    getRedPacketReceiveList,
    redPacketReceiveTotal,
    onClaimItem,
  }
}

export const useMyRedPacketBlindBoxReceiveTransaction = <R extends RawDataRedPacketReceivesItem>({
  setToastOpen,
}: // showActionableRecords
{
  setToastOpen: (props: any) => void
  // showActionableRecords: boolean
}) => {
  const { t } = useTranslation(['error'])

  const {
    account: { accountId, apiKey, eddsaKey, accAddress },
  } = useAccount()

  const [redPacketReceiveList, setRedPacketReceiveList] = React.useState<R[]>([])
  const { setShowRedPacket, setShowAccount } = useOpenModals()

  const { idIndex, coinMap, tokenMap } = useTokenMap()
  const [redPacketReceiveTotal, setRedPacketReceiveTotal] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(true)
  // let match: any = useRouteMatch("/redPacket/records/?:item/?:type");

  const getRedPacketReceiveList = React.useCallback(
    async ({ offset, limit, filter }: any) => {
      const _filer = {
        ...filter,
        // statuses: showActionableRecords
        //   ? [sdk.BlindBoxStatus.NOT_OPENED]
        //   : undefined
      }
      setShowLoading(true)
      try {
        if (LoopringAPI.luckTokenAPI && accountId) {
          if (apiKey) {
            const response = await LoopringAPI.luckTokenAPI.getLuckTokenClaimedBlindBox(
              {
                offset,
                limit,
                isNft: true,
                ..._filer,
              } as any,
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
              setRedPacketReceiveTotal((response as any)?.totalNum)
              let result = (response as any)?.list.map(
                (item: sdk.LuckyTokenBlindBoxItemReceive) => {
                  // @ts-ignore
                  const { luckyToken, claim: myClaim } = item
                  let tokenInfo
                  if (!luckyToken.isNft) {
                    const token = tokenMap[idIndex[luckyToken.tokenId]]
                    tokenInfo = {
                      ...coinMap[token.symbol ?? ''],
                      name: token.name,
                      type: TokenType.single,
                      decimals: token.decimals,
                      precision: token.precision,
                    }
                  }
                  return {
                    type: luckyToken.type,
                    status: luckyToken.status,
                    claimAt: myClaim?.createdAt,
                    sender: luckyToken?.sender?.ens
                      ? luckyToken?.sender?.ens
                      : getShortAddr(luckyToken?.sender?.address),
                    rawData: item,
                    token: tokenInfo,
                  }
                },
              )

              setRedPacketReceiveList(result)
            }
          }
        }
      } finally {
        setShowLoading(false)
      }
    },
    [accountId, apiKey, setToastOpen, t, idIndex],
  )

  const onItemClick = async (item: sdk.LuckyTokenBlindBoxItemReceive) => {
    setShowRedPacket({
      isShow: true,
      step: RedPacketViewStep.BlindBoxDetail,
      info: {
        ...item.luckyToken,
        serialNo: item.claim.serialNo
      },
    })
  }
  
  const onItemClickOpen = async (item: sdk.LuckyTokenBlindBoxItemReceive) => {
    if (LoopringAPI.luckTokenAPI && accountId) {
      const response = await LoopringAPI.luckTokenAPI.sendLuckTokenClaimLuckyToken({
        request: {
          hash: item.luckyToken.hash,
          serialNo: item.claim.serialNo,
          claimer: accAddress,
          referrer: '',
        },
        apiKey,
        eddsaKey: eddsaKey.sk
      })
      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        setShowAccount({
          isShow: true,
          step: AccountStep.ClaimWithdraw_Failed,
          error: {
            code: (response as sdk.RESULT_INFO).code,
            message: (response as sdk.RESULT_INFO).message
          }
        })
        return
      }
      setShowRedPacket({
        isShow: true,
        step: RedPacketViewStep.BlindBoxDetail,
        info: {
          ...item.luckyToken,
          serialNo: item.claim.serialNo
        },
      })
    }
    
  }
  return {
    onItemClick,
    onItemClickOpen,
    redPacketReceiveList,
    showLoading,
    getRedPacketReceiveList,
    redPacketReceiveTotal,
  }
}
