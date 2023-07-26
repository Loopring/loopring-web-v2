/* eslint-disable react/jsx-pascal-case */
import {
  AccountStep,
  RedPacketDetailProps,
  RedPacketOpenedProps,
  RedPacketOpenProps,
  RedPacketQRCodeProps,
  RedPacketTimeoutProps,
  RedPacketClockProps,
  RedPacketViewStep,
  useOpenModals,
  RedPacketDetailLimit,
  NFTMedia,
  BoxNFT,
  RedPacketBlindBoxDetailProps,
  RedPacketBlindBoxDetailTypes,
  RedPacketNFTDetailLimit,
  RedPacketBlindBoxLimit,
} from '@loopring-web/component-lib'
import React, { useState } from 'react'
import {
  AssetTabIndex,
  CLAIM_TYPE,
  CustomError,
  EmptyValueTag,
  ErrorMap,
  Exchange,
  getShortAddr,
  getValuePrecisionThousand,
  myLog,
  NFTWholeINFO,
  UIERROR_CODE,
  YEAR_DAY_MINUTE_FORMAT,
} from '@loopring-web/common-resources'
import { store, useAccount, useSystem, useTokenMap } from '../../stores'
import {
  amountStrCallback,
  amountStrNFTCallback,
  getUserNFTReceiveList,
  getUserReceiveList,
  useOpenRedpacket,
  volumeToCountAsBigNumber,
} from '../../hooks'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import * as sdk from '@loopring-web/loopring-sdk'
import { LoopringAPI } from '../../api_wrapper'
import { useRedPacketHistory } from '../../stores/localStore/redPacket'
import { Box } from '@mui/material'
import { getIPFSString } from '../../utils'
import { NFT_IMAGE_SIZES, toBig } from '@loopring-web/loopring-sdk'
import { useHistory } from 'react-router'
import { ClaimCommands, claimServices } from '../../services'
import { redpacketService } from '../../services'

export function useRedPacketModal() {
  const ref = React.createRef()

  const {
    modals: {
      // isShowNFTDetail,
      isShowRedPacket: { info, isShow, step },
    },
    setShowRedPacket,
    setShowAccount,
  } = useOpenModals()
  const { account } = useAccount()
  const { updateRedpacketHash } = useRedPacketHistory()
  const { chainId, baseURL } = useSystem()
  const { tokenMap, idIndex, coinMap } = useTokenMap()
  const { t } = useTranslation('common')
  const { callOpen } = useOpenRedpacket()
  const subject = React.useMemo(() => claimServices.onSocket(), [])

  const [detail, setDetail] = React.useState<undefined | sdk.LuckTokenClaimDetail>(undefined)
  const [blinBoxDetail, setBlindBoxDetail] = React.useState<undefined | any>(undefined)
  const [qrcode, setQrcode] = React.useState<undefined | sdk.LuckyTokenItemForReceive>(undefined)
  const ImageEle = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive
    if (isShow && _info && _info.isNft && _info.nftTokenInfo) {
      return (
        <BoxNFT flex={1} position={'relative'} className={'redPacketNFT'}>
          <Box
            position={'absolute'}
            top={0}
            right={0}
            bottom={0}
            left={0}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <NFTMedia
              ref={ref}
              item={_info.nftTokenInfo as Partial<NFTWholeINFO>}
              shouldPlay={true}
              onNFTError={() => undefined}
              isOrigin={true}
              getIPFSString={getIPFSString}
              baseURL={baseURL}
            />
          </Box>
        </BoxNFT>
      )
    }
  }, [info?.isNft, info?.nftDta, info])
  const amountStr = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive
    let symbol
    if (
      isShow &&
      _info &&
      _info.tokenAmount &&
      _info.type.mode !== sdk.LuckyTokenClaimType.BLIND_BOX
    ) {
      if (_info.isNft) {
        symbol = 'NFT'
        // @ ts-ignore
        // symbol = (_info.nftTokenInfo as any)?.metadata?.base?.name ?? "NFT";
        const amount = getValuePrecisionThousand(
          _info.tokenAmount.totalAmount,
          0,
          0,
          undefined,
          false,
          {
            floor: false,
            // isTrade: true,
          },
        )
        return amount + ' ' + symbol
      } else {
        const token = tokenMap[idIndex[_info?.tokenId] ?? '']
        const symbol = token.symbol
        const amount = getValuePrecisionThousand(
          volumeToCountAsBigNumber(symbol, _info.tokenAmount.totalAmount as any),
          token.precision,
          token.precision,
          undefined,
          false,
          {
            floor: false,
            // isTrade: true,
          },
        )
        return amount + ' ' + symbol
      }
    }
    return ''
  }, [info?.tokenId, info?.tokenAmount])
  const amountClaimStr = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive & {
      claimAmount: string
    }
    let symbol
    if (isShow && _info && _info.claimAmount) {
      if (_info.isNft) {
        symbol = 'NFT'
        // (_info.nftTokenInfo as any)?.metadata?.base?.name ?? "NFT";
        const amount = getValuePrecisionThousand(_info.claimAmount, 0, 0, undefined, false, {
          floor: false,
          // isTrade: true,
        })
        return amount + ' ' + symbol
      } else {
        const token = tokenMap[idIndex[_info?.tokenId] ?? '']
        symbol = token.symbol
        const amount = getValuePrecisionThousand(
          volumeToCountAsBigNumber(symbol, _info.claimAmount as any),
          token.precision,
          token.precision,
          undefined,
          false,
          {
            floor: false,
            // isTrade: true,
          },
        )
        return amount + ' ' + symbol
      }
    }
    return ''

    // tokenMap[]
  }, [info?.tokenId, info?.claimAmount])

  const textSendBy = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive
    if (isShow && _info && _info.validSince > Date.now()) {
      const date = moment(new Date(_info.validSince)).format(YEAR_DAY_MINUTE_FORMAT)
      return t('labelRedPacketStartWithTime', {
        time: date,
      })
    } else {
      if (_info && _info.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
        return ''
      } else {
        return t('labelLuckyRedPacketStarted')
      }
    }
  }, [info?.validSince, info?.createdAt])

  const redPacketTimeoutProps: RedPacketTimeoutProps | undefined = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive
    if (
      isShow &&
      info &&
      step === RedPacketViewStep.TimeOutPanel
      // &&
      // (_info.status === sdk.LuckyTokenItemStatus.COMPLETED ||
      //   _info.status === sdk.LuckyTokenItemStatus.OVER_DUE)
    ) {
      return {
        ImageEle,
        memo: _info.info.memo,
        sender: _info.sender?.ens ? _info.sender?.ens : getShortAddr(_info.sender?.address),
        viewDetail: () => {
          if (_info.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
            LoopringAPI.luckTokenAPI
              ?.getLuckTokenDetail(
                {
                  hash: _info.hash,
                },
                account.apiKey,
              )
              .then((response) => {
                setShowRedPacket({
                  isShow,
                  step: RedPacketViewStep.BlindBoxDetail,
                  info: {
                    ...response.detail.luckyToken,
                  },
                })
              })
          } else {
            LoopringAPI.luckTokenAPI
              ?.getLuckTokenDetail(
                {
                  hash: _info.hash,
                },
                account.apiKey,
              )
              .then((response) => {
                setShowRedPacket({
                  isShow,
                  step: RedPacketViewStep.DetailPanel,
                  info: {
                    ...response.detail.luckyToken,
                  },
                })
              })
          }
        },
      }
    }
    return undefined
  }, [info, account.accAddress, isShow, step])
  const redPacketOpenProps: RedPacketOpenProps | undefined = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive & {
      referrer?: string
    }
    if (isShow && info && step === RedPacketViewStep.OpenPanel) {
      if (_info?.status == sdk.LuckyTokenItemStatus.COMPLETED) {
      } else if (_info.status === sdk.LuckyTokenItemStatus.OVER_DUE) {
        setShowRedPacket({
          isShow,
          step: RedPacketViewStep.TimeOutPanel,
          info: _info,
        })
      } else if (_info?.hash) {
        myLog('redPacketOpenProps', _info)
        return {
          ImageEle,
          memo: _info.info.memo,
          amountStr,
          sender: _info.sender?.ens ? _info.sender?.ens : getShortAddr(_info.sender?.address),
          viewDetail: info['hideViewDetail']
            ? undefined
            : () => {
                if (_info.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
                  setShowRedPacket({
                    isShow,
                    step: RedPacketViewStep.BlindBoxDetail,
                    info: _info,
                  })
                } else {
                  setShowRedPacket({
                    isShow,
                    step: RedPacketViewStep.DetailPanel,
                    info: _info,
                  })
                }
              },

          onOpen: callOpen,
        }
      }
    }
    return undefined
  }, [info, amountStr, account.accAddress, isShow, step])
  const redPacketOpenedProps: RedPacketOpenedProps | undefined = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive & {
      claimAmount?: string
    }

    if (isShow && info && step === RedPacketViewStep.OpenedPanel && _info?.hash) {
      myLog('redPacketOpenProps', _info)
      let myAmountStr: string | undefined = undefined
      let symbol: string
      if (_info?.claimAmount) {
        if (_info.isNft) {
          symbol = 'NFT'
          // @ts-ignore
          // symbol = _info.nftTokenInfo?.metadata?.base?.name ?? "NFT";
          myAmountStr =
            getValuePrecisionThousand(
              volumeToCountAsBigNumber(symbol, _info.claimAmount as any),
              0,
              0,
              undefined,
              false,
              {
                floor: false,
                // isTrade: true,
              },
            ) +
            ' ' +
            symbol
        } else {
          let tokenInfo = tokenMap[idIndex[_info?.tokenId] ?? '']
          symbol = tokenInfo.symbol
          myAmountStr =
            getValuePrecisionThousand(
              volumeToCountAsBigNumber(symbol, _info.claimAmount as any),
              tokenInfo.precision,
              tokenInfo.precision,
              undefined,
              false,
              {
                floor: false,
                // isTrade: true,
              },
            ) +
            ' ' +
            symbol
        }
      }
      return {
        ImageEle,
        memo: _info.info.memo,
        amountStr,
        myAmountStr,
        sender: _info.sender?.ens ? _info.sender?.ens : getShortAddr(_info.sender?.address),
        viewDetail: () => {
          if (_info.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
            setShowRedPacket({
              isShow,
              step: RedPacketViewStep.BlindBoxDetail,
              info: _info,
            })
          } else {
            setShowRedPacket({
              isShow,
              step: RedPacketViewStep.DetailPanel,
              info: _info,
            })
          }
        },
        isBlindBox: _info.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX,
      }
    }
    return undefined
  }, [info, amountClaimStr, amountStr, account.accAddress, isShow, step])
  let redPacketClockProps: RedPacketClockProps | undefined = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive & {
      claimAmount?: string
    }
    if (isShow && info && step === RedPacketViewStep.RedPacketClock && _info?.hash) {
      myLog('redPacketClockProps', _info)
      return {
        memo: _info.info.memo,
        amountStr,
        amountClaimStr,
        sender: _info.sender?.ens ? _info.sender?.ens : getShortAddr(_info.sender?.address),
        validSince: _info.validSince,
        showRedPacket: () => {
          setShowRedPacket({
            isShow: true,
            step: RedPacketViewStep.OpenPanel,
            info: _info,
          })
        },
        ImageEle,
      }
    }

    return undefined
  }, [info, amountClaimStr, amountStr, account.accAddress, isShow, step])

  const [opendBlindBoxCount, setOpendBlindBoxCount] = React.useState(0)
  React.useState<undefined | sdk.LuckTokenClaimDetail>(undefined)

  const redPacketDetailCall = React.useCallback(
    async ({
      limit = detail?.luckyToken.isNft ? RedPacketNFTDetailLimit : RedPacketDetailLimit,
      offset = 0,
    }: {
      limit?: number
      offset?: number
    }) => {
      setDetail(undefined)
      const _info = info as sdk.LuckyTokenItemForReceive & {
        claimAmount?: string
      }
      if (_info?.hash && LoopringAPI.luckTokenAPI) {
        try {
          const response = await LoopringAPI.luckTokenAPI.getLuckTokenDetail(
            {
              accountId: account.accountId,
              hash: _info.hash,
              limit,
              offset,
              // fromId: 0,
              showHelper: true,
            } as any,
            account.apiKey,
          )

          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            setShowAccount({
              isShow: true,
              step: AccountStep.RedPacketOpen_Failed,
              error: {
                code: (response as sdk.RESULT_INFO)?.code,
                msg: (response as sdk.RESULT_INFO)?.message,
                ...(response instanceof Error
                  ? {
                      message: response?.message,
                      stack: response?.stack,
                    }
                  : response ?? {}),
              },
            })
          } else {
            if (
              response.detail?.claimAmount?.toString() !== '0' &&
              _info?.type.scope === sdk.LuckyTokenViewType.PUBLIC
            ) {
              updateRedpacketHash({
                hash: _info?.hash,
                chainId: chainId as any,
                luckToken: _info,
                claimAmount: response.detail.claimAmount.toString(),
                address: account.accAddress,
              })
            }
            const detail = (response as any).detail
            const luckTokenInfo: sdk.LuckyTokenItemForReceive = detail.luckyToken
            if (luckTokenInfo) {
              setDetail(detail)
              // setShowRedPacket({
              //   isShow: true,
              //   step: RedPacketViewStep.DetailPanel,
              // });
            } else {
              const error = new CustomError(ErrorMap.ERROR_REDPACKET_EMPTY)
              setShowAccount({
                isShow: true,
                step: AccountStep.RedPacketOpen_Failed,
                error: {
                  code: UIERROR_CODE.ERROR_REDPACKET_EMPTY,
                  msg: error.message,
                },
              })
            }
          }
        } catch (error: any) {
          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketOpen_Failed,
            error: {
              code: UIERROR_CODE.UNKNOWN,
              msg: error?.message,
              // @ts-ignore
              ...(error instanceof Error
                ? {
                    message: error?.message,
                    stack: error?.stack,
                  }
                : error ?? {}),
            },
          })
          setShowRedPacket({ isShow: false })
        }
      }
    },
    [isShow, step, info],
  )

  const [blindBoxType, setBlindBoxType] = React.useState(
    undefined as RedPacketBlindBoxDetailTypes | undefined,
  )
  const [viewDetailFrom, setViewDetailFrom] = React.useState(
    undefined as RedPacketBlindBoxDetailTypes | undefined,
  )
  const [wonPrizeInfo, setWonPrizeInfo] = React.useState(
    undefined as
      | {
          name: string
          url: string
          isNFT: true
        }
      | {
          amountStr: string
          tokenURL: string
          tokenName: string
          isNFT: false
        }
      | undefined,
  )
  const redPacketBlindBoxDetailCall = React.useCallback(
    async ({ limit = RedPacketBlindBoxLimit, offset = 0 }: { limit?: number; offset?: number }) => {
      setDetail(undefined)
      setBlindBoxDetail(undefined)
      setWonPrizeInfo(undefined)
      const _info = info as sdk.LuckyTokenItemForReceive & {
        claimAmount?: string
      }
      setShowAccount({
        isShow: true,
        step: AccountStep.RedPacketOpen_Claim_In_Progress,
      })
      if (_info?.hash && LoopringAPI.luckTokenAPI) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketOpen_In_Progress,
          })
          const responseTemp = await LoopringAPI.luckTokenAPI.getBlindBoxDetail(
            {
              accountId: account.accountId,
              hash: _info.hash,
              limit: 500,
              offset: 0,
              showHelper: true,
            } as any,
            account.apiKey,
          )
          setOpendBlindBoxCount((responseTemp.raw_data as any).claims.length)
          let response = await LoopringAPI.luckTokenAPI.getLuckTokenDetail(
            {
              accountId: account.accountId,
              hash: _info.hash,
              limit: RedPacketNFTDetailLimit,
              offset,
              // fromId: 0,
              showHelper: true,
            } as any,
            account.apiKey,
          )
          if ((response as any).detail.blindBoxStatus !== '') {
            updateRedpacketHash({
              hash: _info?.hash,
              chainId: chainId as any,
              luckToken: _info,
              claimAmount: response.detail.claimAmount.toString(),
              address: account.accAddress,
              blindboxClaimed: true,
            })
          }
          const response2 = await LoopringAPI.luckTokenAPI.getBlindBoxDetail(
            {
              accountId: account.accountId,
              hash: _info.hash,
              limit: RedPacketBlindBoxLimit,
              offset,
            } as any,
            account.apiKey,
          )

          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            setShowAccount({
              isShow: true,
              step: AccountStep.RedPacketOpen_Failed,
              error: {
                code: (response as sdk.RESULT_INFO)?.code,
                msg: (response as sdk.RESULT_INFO)?.message,
                ...(response instanceof Error
                  ? {
                      message: response?.message,
                      stack: response?.stack,
                    }
                  : response ?? {}),
              },
            })
            setShowRedPacket({ isShow: false })
          } else if (
            (response2 as sdk.RESULT_INFO).code ||
            (response2 as sdk.RESULT_INFO).message
          ) {
            setShowAccount({
              isShow: true,
              step: AccountStep.RedPacketOpen_Failed,
              error: {
                code: (response2 as sdk.RESULT_INFO)?.code,
                msg: (response2 as sdk.RESULT_INFO)?.message,
                ...(response2 instanceof Error
                  ? {
                      message: response2?.message,
                      stack: response2?.stack,
                    }
                  : response2 ?? {}),
              },
            })
            setShowRedPacket({ isShow: false })
          } else {
            const now = new Date().getTime()
            if (now < response.detail.luckyToken.validSince) {
              setBlindBoxType('Not Started')
            } else if (
              now >= response.detail.luckyToken.validSince &&
              now < response.detail.luckyToken.validUntil
            ) {
              setBlindBoxType('Blind Box Started')
            } else if (
              now > response.detail.luckyToken.validUntil ||
              response.detail.luckyToken.status === sdk.LuckyTokenItemStatus.COMPLETED
            ) {
              if (
                (response2.raw_data as any).blindBoxStatus === sdk.BlindBoxStatus.NOT_OPENED &&
                Date.now() > (response2.raw_data as any).luckyToken.validUntil
              ) {
                const claimLuckyTokenResponse =
                  await LoopringAPI.luckTokenAPI?.sendLuckTokenClaimLuckyToken({
                    request: {
                      hash: _info.hash,
                      claimer: account.accAddress,
                      referrer: '',
                    },
                    eddsaKey: account.eddsaKey.sk,
                    apiKey: account.apiKey,
                  } as any)
                if (
                  (claimLuckyTokenResponse as sdk.RESULT_INFO).code ||
                  (claimLuckyTokenResponse as sdk.RESULT_INFO).message ||
                  (claimLuckyTokenResponse as any).amount === '0'
                ) {
                  setBlindBoxType('Lottery Started and Not Win Lottery')
                } else {
                  setBlindBoxType('Lottery Started and Win Lottery')

                  if (response.detail.luckyToken.isNft) {
                    setWonPrizeInfo({
                      name: response.detail.luckyToken.nftTokenInfo?.metadata?.base.name ?? '',
                      url:
                        response.detail.luckyToken.nftTokenInfo?.metadata?.imageSize.original ?? '',
                      isNFT: true,
                    })
                  } else {
                    const token = tokenMap[idIndex[response.detail.tokenId]]
                    const coin = coinMap[idIndex[response.detail.tokenId]]
                    const amount = getValuePrecisionThousand(
                      sdk.toBig((claimLuckyTokenResponse as any).amount).div('1e' + token.decimals),
                      token.precision,
                      token.precision,
                      undefined,
                      false,
                      {
                        floor: false,
                      },
                    )
                    setWonPrizeInfo({
                      tokenURL: 'tokenIcon',
                      tokenName: coin?.simpleName ?? '',
                      amountStr: amount + ' ' + (coin?.simpleName ?? ''),
                      isNFT: false,
                    })
                  }
                }
                // refetch
                response = await LoopringAPI.luckTokenAPI.getLuckTokenDetail(
                  {
                    accountId: account.accountId,
                    hash: _info.hash,
                    limit,
                    offset,
                    // fromId: 0,
                    showHelper: true,
                  } as any,
                  account.apiKey,
                )
                redpacketService.refresh()
              } else {
                setBlindBoxType('Lottery Started')
              }
            }

            if (
              response.detail?.claimAmount?.toString() !== '0' &&
              _info?.type.scope === sdk.LuckyTokenViewType.PUBLIC
            ) {
              updateRedpacketHash({
                hash: _info?.hash,
                chainId: chainId as any,
                luckToken: _info,
                claimAmount: response.detail.claimAmount.toString(),
                address: account.accAddress,
              })
            }
            const detail = (response as any).detail
            const luckTokenInfo: sdk.LuckyTokenItemForReceive = detail.luckyToken

            if (luckTokenInfo && response2.raw_data) {
              setDetail(detail)
              setBlindBoxDetail(response2.raw_data)
              setShowAccount({
                isShow: false,
              })
            } else {
              const error = new CustomError(ErrorMap.ERROR_REDPACKET_EMPTY)
              setShowAccount({
                isShow: true,
                step: AccountStep.RedPacketOpen_Failed,
                error: {
                  code: UIERROR_CODE.ERROR_REDPACKET_EMPTY,
                  msg: error.message,
                },
              })
            }
          }
        } catch (error: any) {
          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketOpen_Failed,
            error: {
              code: UIERROR_CODE.UNKNOWN,
              msg: error?.message,
              // @ts-ignore
              ...(error instanceof Error
                ? {
                    message: error?.message,
                    stack: error?.stack,
                  }
                : error ?? {}),
            },
          })
          setShowRedPacket({ isShow: false })
        }
      }
    },
    [isShow, step, info],
  )

  const redPacketQrCodeCall = React.useCallback(async () => {
    setQrcode(undefined)
    if (info?.hash && LoopringAPI.luckTokenAPI) {
      const response = await LoopringAPI.luckTokenAPI.getLuckTokenDetail(
        {
          account: account.accountId,
          hash: info.hash,
          fromId: 0,
          showHelper: true,
        } as any,
        account.apiKey,
      )
      const luckTokenInfo = response.detail.luckyToken as sdk.LuckyTokenItemForReceive
      setQrcode(luckTokenInfo)
    }
  }, [isShow, step, info])
  const [page, setPage] = useState(1)
  const [pageForBlindbox, setPageForBlindbox] = useState(1)
  const history = useHistory()
  React.useEffect(() => {
    if (isShow) {
      const info = store.getState().modals.isShowRedPacket.info
      if (step === RedPacketViewStep.DetailPanel) {
        setPage(1)
        redPacketDetailCall({})
      } else if (step === RedPacketViewStep.BlindBoxDetail) {
        setPage(1)
        redPacketBlindBoxDetailCall({})
      } else if (step === RedPacketViewStep.QRCodePanel && info?.hash) {
        if (info?.id) {
          setQrcode(info as any)
        } else {
          redPacketQrCodeCall()
        }
      }
    }
  }, [step, isShow])

  const redpacketSubject = React.useMemo(() => redpacketService.onSuccess(), [])
  React.useEffect(() => {
    const subscription = redpacketSubject.subscribe(() => {
      redPacketDetailCall({ offset: 0 })
      redpacketService.refresh()
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const redPacketDetailProps = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive & {
      claimAmount?: string
    }
    const redPacketType =
      _info && _info.type
        ? _info.type.mode === sdk.LuckyTokenClaimType.RELAY
          ? 'relay'
          : _info.type.partition === sdk.LuckyTokenAmountType.RANDOM
          ? 'lucky'
          : 'normal'
        : 'normal'

    // _info && _info.type && console.log('_info.type.partition', _info.type.partition)
    if (
      isShow &&
      info &&
      step === RedPacketViewStep.DetailPanel &&
      _info?.hash &&
      LoopringAPI.luckTokenAPI &&
      detail &&
      detail.luckyToken
    ) {
      const isShouldSharedRely =
        detail.luckyToken.type.mode === sdk.LuckyTokenClaimType.RELAY &&
        // detail.luckyToken.type.scope === sdk.LuckyTokenViewType.PRIVATE &&
        ![
          sdk.LuckyTokenItemStatus.OVER_DUE,
          sdk.LuckyTokenItemStatus.FAILED,
          sdk.LuckyTokenItemStatus.COMPLETED,
        ].includes(detail.luckyToken.status)
      const showRelayText =
        detail.luckyToken.type.mode === sdk.LuckyTokenClaimType.RELAY &&
        account.accountId !== _info.sender.accountId

      const bottomButton: 'ended' | 'share' = [
        sdk.LuckyTokenItemStatus.OVER_DUE,
        sdk.LuckyTokenItemStatus.FAILED,
        sdk.LuckyTokenItemStatus.COMPLETED,
      ].includes(detail.luckyToken.status)
        ? 'ended'
        : 'share'

      let myAmountStr: string | undefined = undefined
      const relyNumber = detail.helpers?.length
      const value =
        detail.helpers?.reduce((prev, item) => {
          // @ts-ignore
          return prev.plus(item.amount)
        }, sdk.toBig(0)) ?? 0
      let relyAmount: string | undefined = undefined
      let symbol, list
      // if (detail.claimAmount.toString() !== "0") {
      if (_info.isNft) {
        symbol = detail.claimAmount == 1 ? 'NFT' : 'NFTs'
        // @ts-ignore
        // const symbol = _info.nftTokenInfo?.metadata?.base?.name ?? "NFT";
        myAmountStr = sdk.toBig(detail.claimAmount).isZero()
          ? EmptyValueTag
          : getValuePrecisionThousand(detail.claimAmount, 0, 0, undefined, false, {
              floor: false,
              // isTrade: true,
            }) +
            ' ' +
            symbol
        relyAmount = getValuePrecisionThousand(value, 0, 0, undefined, false, {
          floor: false,
          // isTrade: true,
        })
        list = getUserNFTReceiveList(
          detail.claims as any,
          _info.nftTokenInfo as any,
          detail.champion,
        ).list
      } else {
        let tokenInfo = tokenMap[idIndex[_info?.tokenId] ?? '']
        symbol = tokenInfo.symbol
        myAmountStr = myAmountStr = sdk.toBig(detail.claimAmount).isZero()
          ? EmptyValueTag
          : getValuePrecisionThousand(
              volumeToCountAsBigNumber(symbol, detail.claimAmount as any),
              tokenInfo.precision,
              tokenInfo.precision,
              undefined,
              false,
              {
                floor: false,
                // isTrade: true,
              },
            ) +
            ' ' +
            symbol
        relyAmount = getValuePrecisionThousand(
          volumeToCountAsBigNumber(symbol, value),
          tokenInfo.precision,
          tokenInfo.precision,
          undefined,
          false,
          {
            floor: false,
            // isTrade: true,
          },
        )
        list = getUserReceiveList(detail.claims as any, tokenInfo, detail.champion).list
      }
      // }

      const claimButton: 'claimed' | 'claim' | 'claiming' | 'expired' | 'hidden' = detail.luckyToken
        .isNft
        ? detail.claimStatus === sdk.ClaimRecordStatus.WAITING_CLAIM
          ? 'claim'
          : detail.claimStatus === sdk.ClaimRecordStatus.CLAIMED ||
            detail.claimStatus === sdk.ClaimRecordStatus.CLAIMING
          ? 'claimed'
          : detail.claimStatus === sdk.ClaimRecordStatus.EXPIRED
          ? 'expired'
          : 'hidden'
        : 'hidden'

      return {
        redPacketType,
        ImageEle,
        totalCount: detail.luckyToken.tokenAmount.totalCount,
        remainCount: detail.luckyToken.tokenAmount.remainCount,
        memo: _info.info.memo,
        amountStr,
        amountClaimStr,
        sender: _info.sender?.ens ? _info.sender?.ens : getShortAddr(_info.sender?.address),
        claimList: list,
        detail,
        myAmountStr,
        relyAmount: relyAmount ? relyAmount?.toString() : undefined,
        relyNumber: relyNumber ? relyNumber?.toString() : undefined,
        isShouldSharedRely,
        handlePageChange: (page: number = 1) => {
          setPage(page)
          redPacketDetailCall({
            offset:
              (detail.luckyToken.isNft ? RedPacketNFTDetailLimit : RedPacketDetailLimit) *
              (page - 1),
          })
        },
        onShared: () => {
          setShowRedPacket({
            isShow: true,
            step: RedPacketViewStep.QRCodePanel,
            info: {
              ...detail.luckyToken,
              referrer: account.accountId,
              isShouldSharedRely,
            },
          })
        },
        tokenSymbol: _info.isNft ? undefined : tokenMap[idIndex[_info?.tokenId] ?? ''].symbol,
        showRelayText,
        bottomButton,
        page,
        claimButton,
        onClickClaim: () => {
          LoopringAPI.luckTokenAPI
            ?.getLuckTokenBalances(
              {
                accountId: account.accountId,
                isNft: detail.luckyToken.isNft,
                tokens: [detail.luckyToken.tokenId],
              },
              account.apiKey,
            )
            .then((response) => {
              if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
              } else {
                
                setShowClaimWithdraw({
                  isShow: true,
                  claimToken: {
                    tokenId: detail.luckyToken.tokenId,
                    // response!.tokenBalance[0].tokenId,
                    total: detail.claimAmount.toString(),
                    locked: response!.tokenBalance[0].locked,
                    pending: response!.tokenBalance[0].pending,
                    nftTokenInfo: detail.luckyToken.nftTokenInfo,
                    isNft: detail.luckyToken.isNft,
                    luckyTokenHash: detail.luckyToken.hash,
                  },
                  claimType: CLAIM_TYPE.redPacket,
                })
              }
            })
        },
        totalNumber: (detail as any).totalNum,
      } as RedPacketDetailProps
    } else {
      return undefined
    }
  }, [info, detail, amountClaimStr, amountStr, account.accAddress, isShow, step])
  const { setShowClaimWithdraw } = useOpenModals()
  const successCallback = React.useCallback(async () => {
    if (isShow) {
      switch (step) {
        case RedPacketViewStep.DetailPanel:
          redPacketDetailCall({ offset: 0 })
          //TODO: refreshCallback dispatch refreshService here
          break
        case RedPacketViewStep.BlindBoxDetail:
          redPacketBlindBoxDetailCall({ offset: 0 })
          //TODO: Check async is reuqired or not   for onClickClaim2
          if (wonPrizeInfo && wonPrizeInfo.isNFT) {
            setShowRedPacket({ isShow: false })
          }
          //TODO: refreshCallback dispatch refreshService here
          break
      }
    }
  }, [step, isShow])
  React.useEffect(() => {
    const subscription = subject.subscribe((props) => {
      switch (props.status) {
        case ClaimCommands.Success:
          if (props?.data?.type == CLAIM_TYPE.redPacket) {
            successCallback()
          }
          break
        default:
          break
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [subject])
  const redPacketBlindBoxDetailProps = React.useMemo(() => {
    const _info = info as sdk.LuckyTokenItemForReceive & {
      claimAmount?: string
    }

    if (
      isShow &&
      info &&
      step === RedPacketViewStep.BlindBoxDetail &&
      _info?.hash &&
      LoopringAPI.luckTokenAPI &&
      detail &&
      detail.luckyToken &&
      blinBoxDetail &&
      blindBoxType
    ) {
      const shareButton: 'hidden' | 'share' =
        (blindBoxType === 'Not Started' || blindBoxType === 'Blind Box Started') &&
        detail.luckyToken.status !== sdk.LuckyTokenItemStatus.COMPLETED
          ? 'share'
          : 'hidden'

      const claimButton: 'claimed' | 'claim' | 'claiming' | 'expired' | 'hidden' | 'ended' = detail
        .luckyToken.isNft
        ? Date.now() > detail.luckyToken.validUntil
          ? detail.claimStatus === sdk.ClaimRecordStatus.WAITING_CLAIM
            ? 'claim'
            : detail.claimStatus === sdk.ClaimRecordStatus.CLAIMED
            ? 'claimed'
            : detail.claimStatus === sdk.ClaimRecordStatus.CLAIMING
            ? 'claiming'
            : detail.claimStatus === sdk.ClaimRecordStatus.EXPIRED
            ? 'expired'
            : detail.luckyToken.status !== sdk.LuckyTokenItemStatus.COMPLETED
            ? 'ended'
            : 'hidden'
          : 'hidden'
        : detail.luckyToken.status === sdk.LuckyTokenItemStatus.COMPLETED
        ? 'ended'
        : 'hidden'

      const tokenInfo = !detail.luckyToken.isNft
        ? tokenMap[idIndex[detail.luckyToken.tokenId]]
        : undefined
      
      return {
        sender: _info.sender?.ens ? _info.sender?.ens : getShortAddr(_info.sender?.address),
        memo: _info.info.memo,
        type: blindBoxType,
        blindBoxStartTime: detail!.luckyToken.validSince,
        lotteryStartTime: detail!.luckyToken.validUntil,
        lotteryEndTime: moment(detail!.luckyToken.nftExpireTime).toDate().getTime(),
        opendBlindBoxAmount: detail!.luckyToken.tokenAmount.claimedBoxCount,
        totalBlindBoxAmount: detail!.luckyToken.tokenAmount.totalCount,
        deliverdGiftsAmount: (detail as any).totalNum,
        totalGiftsAmount: Number(detail!.luckyToken.tokenAmount.giftCount),
        // imageEle?: JSX.Element | undefined;
        onShared: () => {
          setShowRedPacket({
            isShow: true,
            step: RedPacketViewStep.QRCodePanel,
            info: {
              ...detail.luckyToken,
              referrer: account.accountId,
            },
          })
        },
        onClickViewDetail: () => {
          redPacketBlindBoxDetailCall({}).then(() => {
            setViewDetailFrom(blindBoxType)
            setBlindBoxType('BlindBox Claime Detail')
          })
        },
        NFTClaimList: detail!.claims.map((claim) => {
          return {
            isMe: claim.claimer.accountId === account.accountId,
            who: claim.claimer?.ens ? claim.claimer?.ens : getShortAddr(claim.claimer?.address),
            when: claim.createdAt,
            amount: detail.luckyToken.isNft
              ? claim.amount
              : getValuePrecisionThousand(
                  sdk.toBig(claim.amount).div('1e' + tokenInfo!.decimals),
                  tokenInfo!.precision,
                  tokenInfo!.precision,
                  tokenInfo!.precision,
                ) +
                ' ' +
                tokenInfo!.symbol,
            showMultiplier: detail.luckyToken.isNft,
            showLuckiest:
              detail.luckyToken.tokenAmount.remainAmount == '0' &&
              detail.champion?.accountId === claim.claimer.accountId,
          }
        }),
        // to change
        BlindBoxClaimList: blinBoxDetail.claims.map((x: any) => {
          return {
            who: x.claimer?.ens ? x.claimer?.ens : getShortAddr(x.claimer?.address),
            when: x.createdAt,
            amount: x.amount ? x.amount : 0,
            isMe: x.claimer.accountId === account.accountId,
          }
        }),
        showOpenLottery:
          blindBoxType === 'Lottery Started and Win Lottery' ||
          blindBoxType === 'Lottery Started and Not Win Lottery',
        wonPrizeInfo: wonPrizeInfo,
        onCloseOpenModal: () => {
          setShowRedPacket({ isShow: false })
        },
        onClickClaimDetailBack: () => {
          setBlindBoxType(viewDetailFrom)
        },
        onClickClaim: async () => {
          if (!detail.luckyToken.isNft) {
            setShowRedPacket({
              isShow: false,
            })
            history.push(`/l2assets/assets/${AssetTabIndex.RedPacket}`)
            return
          }
          const response = await LoopringAPI.luckTokenAPI?.getLuckTokenBalances(
            {
              accountId: account.accountId,
              isNft: detail.luckyToken.isNft,
              tokens: [detail.luckyToken.tokenId],
            },
            account.apiKey,
          )
          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          } else {
            setShowClaimWithdraw({
              isShow: true,
              claimToken: {
                tokenId: detail.luckyToken.tokenId,
                // response!.tokenBalance[0].tokenId,
                total: detail.claimAmount.toString(),
                locked: response!.tokenBalance[0].locked,
                pending: response!.tokenBalance[0].pending,
                nftTokenInfo: detail.luckyToken.nftTokenInfo,
                isNft: detail.luckyToken.isNft,
                luckyTokenHash: detail.luckyToken.hash,
              },
              claimType: CLAIM_TYPE.redPacket,
            })
          }
        },
        NFTURL:
          Date.now() > detail!.luckyToken.validUntil
            ? detail.luckyToken.nftTokenInfo?.metadata?.imageSize.original
            : undefined,
        description: '',
        // Date.now() > detail!.luckyToken.validUntil
        //   ? t("labelBlindBoxExplainationEnded")
        //   : t("labelBlindBoxExplainationNotEnded"),
        claimButton,
        shareButton,
        didClaimABlindBox: blinBoxDetail.blindBoxStatus !== '',
        wonInfo: blinBoxDetail!.luckyToken.isNft
          ? {
              participated: blinBoxDetail.blindBoxStatus !== '',
              won: blinBoxDetail.claimAmount && toBig(blinBoxDetail.claimAmount).isGreaterThan(0),
              amount: detail.claimAmount,
              isNFT: true,
            }
          : {
              participated: blinBoxDetail.blindBoxStatus !== '',
              won: blinBoxDetail.claimAmount && toBig(blinBoxDetail.claimAmount).isGreaterThan(0),
              amount:
                blinBoxDetail.claimAmount &&
                getValuePrecisionThousand(
                  sdk.toBig(blinBoxDetail.claimAmount ?? '0').div('1e' + tokenInfo!.decimals),
                  tokenInfo!.precision,
                  tokenInfo!.precision,
                  tokenInfo!.precision,
                  false,
                ),
              total: getValuePrecisionThousand(
                sdk
                  .toBig(blinBoxDetail.luckyToken.tokenAmount.totalAmount)
                  .div('1e' + tokenInfo!.decimals),
                tokenInfo!.precision,
                tokenInfo!.precision,
                tokenInfo!.precision,
                false,
              ),
              symbol: tokenInfo!.symbol,
              isNFT: false,
            },
        handlePageChange: (page: number = 1) => {
          setPage(page)
          // redPacketBlindBoxDetailCall({ offset: (detail.luckyToken.isNft ? RedPacketNFTDetailLimit : RedPacketDetailLimit) * (page - 1) });
          redPacketBlindBoxDetailCall({
            offset:
              (detail.luckyToken.isNft ? RedPacketNFTDetailLimit : RedPacketDetailLimit) *
              (page - 1),
          })
        },
        totalCount: detail.luckyToken.tokenAmount.giftCount,
        remainCount: detail.luckyToken.tokenAmount.remainCount,
        page,
        totalClaimedNFTsCount: (detail as any).totalNum,
        totalBlindboxCount: opendBlindBoxCount,
        handlePageChange_BlindBox: (page: number = 1) => {
          setPageForBlindbox(page)
          // setPage(page)
          LoopringAPI.luckTokenAPI
            ?.getBlindBoxDetail(
              {
                accountId: account.accountId,
                hash: _info.hash,
                limit: RedPacketBlindBoxLimit,
                offset: (page - 1) * RedPacketBlindBoxLimit,
              } as any,
              account.apiKey,
            )
            .then((response2) => {
              setBlindBoxDetail(response2.raw_data)
            })
        },
        pageForBlindbox,
        onClickClaimPopViewDetail: () => {
          redPacketBlindBoxDetailCall({}).then(() => {
            setBlindBoxType('Lottery Started')
          })
        },
        expired: Date.now() > detail!.luckyToken.nftExpireTime,
        isTokenBlindbox: detail!.luckyToken.isNft ? false : true,
        remainGiftsAmount: detail!.luckyToken.isNft
          ? detail!.luckyToken.tokenAmount.remainAmount
          : getValuePrecisionThousand(
              sdk
                .toBig(detail!.luckyToken.tokenAmount.remainAmount)
                .div('1e' + tokenInfo!.decimals),
              tokenInfo?.precision,
              undefined,
              undefined,
              false,
            ) +
            ' ' +
            tokenInfo?.symbol,
      } as RedPacketBlindBoxDetailProps
    } else {
      return undefined
    }
  }, [
    info,
    detail,
    amountClaimStr,
    amountStr,
    account.accAddress,
    isShow,
    step,
    blinBoxDetail,
    blindBoxType,
    wonPrizeInfo,
  ])
  const redPacketQRCodeProps: RedPacketQRCodeProps | undefined = React.useMemo(() => {
    if (isShow && info && step === RedPacketViewStep.QRCodePanel && qrcode && qrcode.hash) {
      if (
        qrcode.status === sdk.LuckyTokenItemStatus.COMPLETED ||
        qrcode.status === sdk.LuckyTokenItemStatus.OVER_DUE
      ) {
        setShowRedPacket({
          isShow,
          step: RedPacketViewStep.TimeOutPanel,
          info: qrcode,
        })
      } else if (qrcode?.hash) {
        const url = `${Exchange}wallet?redpacket&id=${qrcode?.hash}&referrer=${account.accAddress}`
        return {
          url,
          imageEleUrl: qrcode.nftTokenInfo?.metadata?.imageSize[NFT_IMAGE_SIZES.large] ?? undefined,
          textAddress: qrcode.sender?.ens
            ? qrcode.sender?.ens
            : getShortAddr(qrcode.sender?.address),
          textContent: qrcode.info.memo,
          amountStr: qrcode.isNft
            ? amountStrNFTCallback(qrcode.nftTokenInfo as any, qrcode.tokenAmount.totalAmount)
                .amount === '1'
              ? t('labelNFTs_one', {
                  count: 1,
                })
              : t('labelNFTs_other', {
                  count: amountStrNFTCallback(
                    qrcode.nftTokenInfo as any,
                    qrcode.tokenAmount.totalAmount,
                  ).amount,
                })
            : amountStrCallback(tokenMap, idIndex, qrcode.tokenId, qrcode.tokenAmount.totalAmount)
                .amountStr,
          textSendBy,
          textType:
            info && info.type
              ? info.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX
                ? t('labelLuckyBlindBox')
                : info.type.mode === sdk.LuckyTokenClaimType.RELAY
                ? t('labelRelayRedPacket')
                : info.type.partition === sdk.LuckyTokenAmountType.RANDOM
                ? t('labelLuckyRedPacket')
                : t('labelNormalRedPacket')
              : t('labelNormalRedPacket'),
          textShared: t('labelShare'),
          textDes: t('labelRedpacketScanDes'),
          isShouldSharedRely: qrcode.type.mode == sdk.LuckyTokenClaimType.RELAY,
          textNo: t('labelRedPacketNo', { value: qrcode?.hash.slice(-8) }),
        } as RedPacketQRCodeProps
      }
    }
    return undefined
  }, [info, qrcode, account.accAddress, isShow, textSendBy, amountStr, step])
  return {
    redPacketQRCodeProps,
    redPacketTimeoutProps,
    redPacketOpenProps,
    redPacketOpenedProps,
    redPacketDetailProps,
    redPacketClockProps,
    redPacketBlindBoxDetailProps,
  }
}
