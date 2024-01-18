import React from 'react'
import { LoopringAPI } from '../../api_wrapper'
import { AccountStep, RedPacketViewStep, useOpenModals } from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import { LuckyTokenItemStatus } from '@loopring-web/loopring-sdk'
import { store, useAccount, useSystem, useTargetRedPackets } from '../../stores'
import { CustomError, ErrorMap, UIERROR_CODE } from '@loopring-web/common-resources'


export function useOpenRedpacket() {
  const { setShowRedPacket, setShowAccount } = useOpenModals()
  const { chainId } = useSystem()
  const { account } = useAccount()
  const { getExclusiveRedpacket } = useTargetRedPackets()

  const callOpen = React.useCallback(async () => {
    // setShowAccount({
    //   isShow: true,
    //   step: AccountStep.RedPacketOpen_Claim_In_Progress,
    // });
    const _info = store.getState().modals.isShowRedPacket.info as sdk.LuckyTokenItemForReceive & {
      referrer?: string
      isShouldSharedRely: boolean
    }
    
    // let difference = new Date(_info.validSince).getTime() - Date.now();
    if (
      _info.status == LuckyTokenItemStatus.COMPLETED ||
      _info.status == LuckyTokenItemStatus.OVER_DUE ||
      _info.tokenAmount.remainCount === 0
    ) {
      setShowRedPacket({
        isShow: true,
        step: RedPacketViewStep.TimeOutPanel,
        info: {
          ..._info,
        },
      })
    } else {
      try {
        if (_info.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
          let response = await LoopringAPI.luckTokenAPI?.sendLuckTokenClaimBlindBox({
            request: {
              hash: _info?.hash,
              claimer: account.accAddress,
              referrer: _info.isShouldSharedRely && _info?.referrer ? _info?.referrer : '',
              serialNo: _info.serialNo
            },
            eddsaKey: account.eddsaKey.sk,
            apiKey: account.apiKey,
          } as any)
          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            throw response
          }
          // setShowAccount({
          //   isShow: false,
          // });
          setShowRedPacket({
            isShow: true,
            step: RedPacketViewStep.BlindBoxDetail,
            info: {
              ..._info,
            },
          })
        } else {
          
          let response = await LoopringAPI.luckTokenAPI?.sendLuckTokenClaimLuckyToken({
            request: {
              hash: _info?.hash,
              claimer: account.accAddress,
              referrer: _info.isShouldSharedRely && _info?.referrer ? _info?.referrer : '',
              serialNo: _info.serialNo
            },
            eddsaKey: account.eddsaKey.sk,
            apiKey: account.apiKey,
          } as any)
          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            throw response
          }

          // setShowAccount({
          //   isShow: false,
          // });
          setShowRedPacket({
            isShow: true,
            step: RedPacketViewStep.DetailPanel,
            info: {
              ..._info,
              response,
              claimAmount: (response as any).amount,
            },
          })
        }
        console.log('getExclusiveRedpacket2')
        getExclusiveRedpacket()
      } catch (error: any) {
        if (error?.code === UIERROR_CODE.ERROR_REDPACKET_CLAIMED) {
          // setShowAccount({
          //   isShow: false,
          // });
          if (_info.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
            setShowRedPacket({
              isShow: true,
              step: RedPacketViewStep.BlindBoxDetail,
              info: {
                ..._info,
              },
            })
          } else {
            setShowRedPacket({
              isShow: true,
              step: RedPacketViewStep.DetailPanel,
              info: {
                ..._info,
              },
            })
          }
        } else if (
          [
            UIERROR_CODE.ERROR_REDPACKET_CLAIM_TIMEOUT,
            UIERROR_CODE.ERROR_REDPACKET_CLAIM_OUT,
          ].includes(error?.code)
        ) {
          // setShowAccount({
          //   isShow: false,
          // });
          setShowRedPacket({
            isShow: true,
            step: RedPacketViewStep.TimeOutPanel,
            info: {
              ..._info,
            },
          })
        } else {
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
          // await sdk.sleep(SUBMIT_PANEL_QUICK_AUTO_CLOSE);
          // setShowAccount({
          //   isShow: false,
          // });
        }
      }
    }
  }, [chainId, account])

  return {
    callOpen,
  }
}

export const useRedPacketScanQrcodeSuccess = () => {
  const {
    setShowAccount,
    setShowRedPacket,
    // modals: { isShowAccount },
  } = useOpenModals()
  const {
    account: { apiKey, accountId },
  } = useAccount()

  const [redPacketInfo, setRedPacketInfo] = React.useState<
    { hash: string; referrer: string } | undefined
  >(undefined)
  const getLuckTokenDetail = React.useCallback(async () => {
    if (LoopringAPI.luckTokenAPI && redPacketInfo) {
      setShowAccount({
        isShow: true,
        step: AccountStep.RedPacketOpen_In_Progress,
      })

      const response = await LoopringAPI.luckTokenAPI.getLuckTokenDetail(
        {
          accountId: accountId,
          hash: redPacketInfo.hash,
          fromId: 0,
          showHelper: true,
        } as any,
        apiKey,
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
        const detail = (response as any).detail
        const luckTokenInfo: sdk.LuckyTokenItemForReceive = detail.luckyToken
        let difference = new Date(luckTokenInfo.validSince).getTime() - Date.now()

        if (luckTokenInfo) {
          setShowAccount({ isShow: false })
          if (response.detail?.claimAmount.toString() !== '0') {
            if (response.detail?.luckyToken.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
              setShowRedPacket({
                isShow: true,
                step: RedPacketViewStep.BlindBoxDetail,
                info: {
                  ...luckTokenInfo,
                },
              })
            } else {
              setShowRedPacket({
                isShow: true,
                step: RedPacketViewStep.DetailPanel,
                info: {
                  ...luckTokenInfo,
                },
              })
            }
          } else if (difference > 0) {
            // change here
            if (luckTokenInfo.sender.accountId === accountId) {
              if (luckTokenInfo.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
                setShowRedPacket({
                  isShow: true,
                  info: {
                    ...luckTokenInfo,
                    referrer: redPacketInfo.referrer,
                  },
                  step: RedPacketViewStep.BlindBoxDetail,
                })
              } else {
                setShowRedPacket({
                  isShow: true,
                  info: {
                    ...luckTokenInfo,
                    referrer: redPacketInfo.referrer,
                  },
                  step: RedPacketViewStep.DetailPanel,
                })
              }
            } else {
              setShowRedPacket({
                isShow: true,
                info: {
                  ...luckTokenInfo,
                  referrer: redPacketInfo.referrer,
                },
                step: RedPacketViewStep.RedPacketClock,
              })
            }
          } else if (
            luckTokenInfo.status == LuckyTokenItemStatus.COMPLETED ||
            luckTokenInfo.status == LuckyTokenItemStatus.OVER_DUE ||
            // difference + 86400000 < 0 ||
            luckTokenInfo.tokenAmount.remainCount === 0
          ) {
            if (luckTokenInfo.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
              setShowRedPacket({
                isShow: true,
                info: {
                  ...luckTokenInfo,
                },
                step: RedPacketViewStep.BlindBoxDetail,
              })
            } else {
              setShowRedPacket({
                isShow: true,
                info: {
                  ...luckTokenInfo,
                },
                step: RedPacketViewStep.TimeOutPanel,
              })
            }
          } else {
            const canOpenBlindbox =
              luckTokenInfo.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX &&
              luckTokenInfo.status === sdk.LuckyTokenItemStatus.PENDING &&
              detail.blindBoxStatus === ''
            const canOpenLuckyToken =
              luckTokenInfo.type.mode !== sdk.LuckyTokenClaimType.BLIND_BOX &&
              luckTokenInfo.status === sdk.LuckyTokenItemStatus.PENDING &&
              !detail.claimStatus
            if (canOpenBlindbox || canOpenLuckyToken) {
              setShowRedPacket({
                isShow: true,
                info: {
                  ...luckTokenInfo,
                  referrer: redPacketInfo.referrer,
                  hideViewDetail: accountId !== luckTokenInfo.sender.accountId,
                },
                step: RedPacketViewStep.OpenPanel,
              })
            } else {
              if (luckTokenInfo.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) {
                setShowRedPacket({
                  isShow: true,
                  info: {
                    ...luckTokenInfo,
                    referrer: redPacketInfo.referrer,
                  },
                  step: RedPacketViewStep.BlindBoxDetail,
                })
              } else {
                setShowRedPacket({
                  isShow: true,
                  info: {
                    ...luckTokenInfo,
                    referrer: redPacketInfo.referrer,
                  },
                  step: RedPacketViewStep.DetailPanel,
                })
              }
            }
          }
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
        // const luckTokenInfo: sdk.LuckyTokenItemForReceive = (response as any)
        //   .detail.luckyToken;
        // if (luckTokenInfo) {
        //   setShowAccount({ isShow: false });
        //   setShowRedPacket({
        //     isShow: true,
        //     info: {
        //       ...luckTokenInfo,
        //       referrer: redPacketInfo.referrer,
        //     },
        //     step: RedPacketViewStep.OpenPanel,
        //   });
        // } else {
        //   const error = new CustomError(ErrorMap.ERROR_REDPACKET_EMPTY);
        //   setShowAccount({
        //     isShow: true,
        //     step: AccountStep.RedPacketOpen_Failed,
        //     error: {
        //       code: UIERROR_CODE.ERROR_REDPACKET_EMPTY,
        //       msg: error.message,
        //     },
        //   });
        // }
      }
    }
  }, [redPacketInfo, accountId])
  React.useEffect(() => {
    if (redPacketInfo) {
      getLuckTokenDetail()
    }
  }, [redPacketInfo])
  const handleSuccess = React.useCallback(
    async (data: string) => {
      const url = new URL(data)
      const searchParams = new URLSearchParams(url.hash.replace('#/wallet', ''))
      if (searchParams.has('redpacket') && searchParams.get('id')) {
        setRedPacketInfo({
          hash: searchParams.get('id')?.toString() ?? '',
          referrer: searchParams.get('referrer')?.toString() ?? '',
        })
      } else {
        setRedPacketInfo({
          hash: '',
          referrer: '',
        })
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
    },
    [apiKey],
  )
  return {
    handleSuccess,
  }
}
