import {
  AccountStatus,
  CLAIM_TYPE,
  getValuePrecisionThousand,
  IBData,
  LIVE_FEE_TIMES,
  myLog,
  SUBMIT_PANEL_AUTO_CLOSE,
  TRADE_TYPE,
  UIERROR_CODE,
} from '@loopring-web/common-resources'
import { store, useAccount, useModalData, useSystem, useTokenMap } from '../../stores'
import { useWalletInfo } from '../../stores/localStore/walletInfo'
import { AccountStep, ClaimProps, useOpenModals } from '@loopring-web/component-lib'
import { useBtnStatus } from '../common'
import React from 'react'
import { volumeToCount } from '../help'
import {
  useChargeFees,
  useWalletLayer2Socket,
  walletLayer2Service,
  claimServices,
} from '../../services'
import * as sdk from '@loopring-web/loopring-sdk'
import { ConnectProvidersSignMap, connectProvides } from '@loopring-web/web3-provider'
import { LoopringAPI } from '../../api_wrapper'
import { isAccActivated } from './useCheckAccStatus'
import { getTimestampDaysLater } from '../../utils'
import { DAYS } from '../../defs'

export const useClaimConfirm = <T extends IBData<I> & { tradeValueView: string }, I>() => {
  const { exchangeInfo, chainId } = useSystem()
  const { account } = useAccount()
  const {
    allowTrade: { raw_data },
  } = useSystem()
  const legalEnable = (raw_data as any)?.legal?.enable
  const { tokenMap, idIndex } = useTokenMap()
  const { checkHWAddr, updateHW } = useWalletInfo()

  const {
    setShowAccount,
    setShowClaimWithdraw,
    modals: {
      isShowClaimWithdraw: { claimToken, isShow, claimType },
      isShowAccount: { info },
    },
  } = useOpenModals()
  const { claimValue, updateClaimData } = useModalData()
  const { btnStatus, enableBtn, disableBtn, btnInfo } = useBtnStatus()
  const feeProps =
    claimValue.tradeType === TRADE_TYPE.TOKEN
      ? claimType === CLAIM_TYPE.lrcStaking || claimType === CLAIM_TYPE.allToken
        ? {
            requestType: sdk.OffchainFeeReqType.EXTRA_TYPES,
            extraType: 3,
          }
        : {
            requestType: sdk.OffchainFeeReqType.EXTRA_TYPES,
            extraType: 2,
          }
      : {
          requestType: sdk.OffchainNFTFeeReqType.EXTRA_TYPES,
          tokenAddress: claimValue?.tokenAddress,
          extraType: 2,
          isNFT: true,
        }
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    resetIntervalTime,
  } = useChargeFees({
    ...feeProps,
    intervalTime: undefined,
    updateData: ({ fee }) => {
      const claimValue = store.getState()._router_modalData.claimValue
      if (
        (claimValue.tradeType === TRADE_TYPE.TOKEN &&
          (claimValue.claimType === CLAIM_TYPE.lrcStaking ||
            claimValue.claimType === CLAIM_TYPE.allToken) &&
          feeProps.extraType === 3) ||
        (claimValue.tradeType === TRADE_TYPE.TOKEN &&
          claimType === CLAIM_TYPE.redPacket &&
          feeProps.extraType === 2 &&
          !feeProps.isNFT) ||
        (claimValue.tradeType === TRADE_TYPE.NFT &&
          claimType === CLAIM_TYPE.redPacket &&
          feeProps.extraType === 2 &&
          feeProps.isNFT)
      ) {
        updateClaimData({ ...claimValue, fee: fee })
      }
    },
  })

  useWalletLayer2Socket({ walletLayer2Callback: undefined })
  // calim
  const resetDefault = React.useCallback(() => {
    if (info?.isRetry) {
      checkFeeIsEnough()
      return
    }
    // claimToken
    if (claimToken) {
      if (claimToken?.isNft) {
        updateClaimData({
          ...claimToken.nftTokenInfo,
          tradeType: TRADE_TYPE.NFT,
          // nftData: claimToken.nftData,
          tokenAddress: claimToken?.nftTokenInfo?.tokenAddress,
          tokenId: claimToken.tokenId,
          belong: claimToken.nftTokenInfo?.metadata?.base?.name ?? 'NFT',
          tradeValue: Number(claimToken.total),
          volume: claimToken.total,
          balance: Number(claimToken.total),
          claimType,
          fee: feeInfo,
          luckyTokenHash: claimToken.luckyTokenHash,
        } as any)
      } else {
        const token = tokenMap[idIndex[claimToken.tokenId]]
        updateClaimData({
          belong: idIndex[claimToken.tokenId],
          tradeType: TRADE_TYPE.TOKEN,
          tradeValue: volumeToCount(token.symbol, claimToken.total),
          volume: claimToken.total,
          balance: volumeToCount(token.symbol, claimToken.total),
          claimType,
          fee: feeInfo,
        })
      }
    } else {
    }
  }, [checkFeeIsEnough, updateClaimData, feeInfo, claimToken, info?.isRetry])

  React.useEffect(() => {
    if (isShow) {
      resetDefault()
      walletLayer2Service.sendUserUpdate()
    }
  }, [isShow])
  React.useEffect(() => {
    if (isShow) {
      checkFeeIsEnough({ isRequiredAPI: true, intervalTime: LIVE_FEE_TIMES })
    } else {
      resetIntervalTime()
    }
    return () => {
      resetIntervalTime()
    }
  }, [isShow, claimValue.claimType, claimValue.tradeType])
  const processRequest = React.useCallback(
    async (
      request: sdk.OriginLuckTokenWithdrawsRequestV3 | sdk.OriginStakeClaimRequestV3,
      isHardwareWallet: boolean = false,
    ) => {
      const { apiKey, connectName, eddsaKey } = account
      const claimValue = store.getState()._router_modalData.claimValue
      // const claimValue = store.getState()._router_modalData.c;

      try {
        if (connectProvides.usedWeb3 && LoopringAPI.luckTokenAPI && isAccActivated()) {
          let isHWAddr = checkHWAddr(account.accAddress)

          if (!isHWAddr && isHardwareWallet) {
            isHWAddr = true
          }

          myLog('ClaimConfirm processRequest:', isHWAddr, isHardwareWallet)
          let response
          if (claimValue.claimType === CLAIM_TYPE.redPacket) {
            response = await LoopringAPI.luckTokenAPI.sendLuckTokenWithdraws(
              {
                request: request as sdk.OriginLuckTokenWithdrawsRequestV3,
                web3: connectProvides.usedWeb3 as any,
                chainId: chainId === 'unknown' ? 1 : chainId,
                walletType: (ConnectProvidersSignMap[connectName] ??
                  connectName) as unknown as sdk.ConnectorNames,
                eddsaKey: eddsaKey.sk,
                apiKey,
                isHWAddr,
              },
              {
                accountId: account.accountId,
                counterFactualInfo: eddsaKey.counterFactualInfo,
              },
            )
          } else if (claimValue.claimType === CLAIM_TYPE.allToken) {
            response = await LoopringAPI.userAPI?.sendTotalClaim(
              {
                request: request as sdk.OriginClaimRequestV3,
                web3: connectProvides.usedWeb3 as any,
                chainId: chainId === 'unknown' ? 1 : chainId,
                walletType: (ConnectProvidersSignMap[connectName] ??
                  connectName) as unknown as sdk.ConnectorNames,
                eddsaKey: eddsaKey.sk,
                apiKey,
                isHWAddr,
              },
              {
                accountId: account.accountId,
                counterFactualInfo: eddsaKey.counterFactualInfo,
              },
            )
          } else if (claimValue.claimType === CLAIM_TYPE.lrcStaking) {
            response = await LoopringAPI.defiAPI?.sendStakeClaim(
              {
                request: request as sdk.OriginStakeClaimRequestV3,
                web3: connectProvides.usedWeb3 as any,
                chainId: chainId === 'unknown' ? 1 : chainId,
                walletType: (ConnectProvidersSignMap[connectName] ??
                  connectName) as unknown as sdk.ConnectorNames,
                eddsaKey: eddsaKey.sk,
                apiKey,
                isHWAddr,
              },
              {
                accountId: account.accountId,
                counterFactualInfo: eddsaKey.counterFactualInfo,
              },
            )
          }

          myLog('claim submitted :', claimValue.claimType, response)

          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            throw response
          }
          setShowAccount({
            isShow: true,
            step: AccountStep.ClaimWithdraw_In_Progress,
          })
          setShowAccount({
            isShow: true,
            step: AccountStep.ClaimWithdraw_Submit,
            info: {
              symbol: claimValue.belong,
            },
          })
          claimServices.claimSuccess({ type: claimValue.claimType })
          if (isHWAddr) {
            myLog('......try to set isHWAddr', isHWAddr)
            updateHW({ wallet: account.accAddress, isHWAddr })
          }
          walletLayer2Service.sendUserUpdate()
          setShowClaimWithdraw({ isShow: false })
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step == AccountStep.ClaimWithdraw_Submit
          ) {
            setShowAccount({ isShow: false })
          }
        }
      } catch (e: any) {
        const code = sdk.checkErrorInfo(e, isHardwareWallet)
        claimServices.claimFailed({ type: claimValue.claimType, error: { ...e, code } })
        switch (code) {
          case sdk.ConnectorError.NOT_SUPPORT_ERROR:
            setShowAccount({
              isShow: true,
              step: AccountStep.ClaimWithdraw_First_Method_Denied,
              info: {
                symbol: claimValue.belong,
              },
            })
            break
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            setShowAccount({
              isShow: true,
              step: AccountStep.ClaimWithdraw_Denied,
              info: {
                symbol: claimValue.belong,
              },
            })
            break
          default:
            if ([102024, 102025, 114001, 114002].includes((e as sdk.RESULT_INFO)?.code || 0)) {
              checkFeeIsEnough({ isRequiredAPI: true })
            }
            setShowAccount({
              isShow: true,
              step: AccountStep.ClaimWithdraw_Failed,
              info: {
                symbol: claimValue.belong,
              },
              error: {
                code: UIERROR_CODE.UNKNOWN,
                msg: e?.message,
                ...(e instanceof Error
                  ? {
                      message: e?.message,
                      stack: e?.stack,
                    }
                  : e ?? {}),
              },
            })
            break
        }
      }
    },
    [account],
  )

  const onClaimClick = React.useCallback(
    async (_data: Partial<T>, isHardwareRetry = false) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account
      const claimValue = store.getState()._router_modalData.claimValue
      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        LoopringAPI.userAPI &&
        exchangeInfo &&
        claimValue?.fee?.belong &&
        claimValue.fee?.feeRaw &&
        claimValue?.tradeValue &&
        (claimValue?.belong || claimValue.nftData) &&
        !isFeeNotEnough.isFeeNotEnough &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.ClaimWithdraw_WaitForAuth,
          })
          const feeToken = tokenMap[claimValue.fee.belong]
          const feeRaw = claimValue.fee.feeRaw ?? claimValue.fee.__raw__?.feeRaw ?? 0
          const fee = sdk.toBig(feeRaw)

          let token: any
          let amount: any = 0
          if (claimValue?.nftData) {
            token = {
              tokenId: claimValue.tokenId,
            }
            amount = claimValue.volume
          } else {
            token = tokenMap[claimValue?.belong]
            amount = claimValue.volume
          }

          const storageId = await LoopringAPI.userAPI?.getNextStorageId(
            {
              accountId,
              sellTokenId: Number(feeToken.tokenId),
            },
            apiKey,
          )
          let brokerType: any = undefined
          switch (claimValue.claimType) {
            case CLAIM_TYPE.redPacket:
              brokerType = 2
              break
            case CLAIM_TYPE.lrcStaking:
            case CLAIM_TYPE.allToken:
              brokerType = 0
              break
          }
          const { broker } = await LoopringAPI.userAPI?.getAvailableBroker({
            type: brokerType,
          })
          let request:
            | (sdk.OriginLuckTokenWithdrawsRequestV3 & {
                luckyTokenHash?: string
              })
            | sdk.OriginStakeClaimRequestV3 = {} as any

          if (claimValue.claimType === CLAIM_TYPE.redPacket) {
            request = {
              tokenId: token.tokenId,
              feeTokenId: feeToken.tokenId,
              amount: amount.toString(),
              nftData: claimToken?.isNft ? claimToken.nftTokenInfo?.nftData : undefined,
              claimer: accAddress,
              transfer: {
                exchange: exchangeInfo.exchangeAddress,
                payerAddr: accAddress,
                payerId: accountId,
                payeeAddr: broker,
                storageId: storageId.offchainId,
                maxFee: {
                  tokenId: feeToken.tokenId,
                  volume: '0',
                },
                token: {
                  tokenId: feeToken.tokenId,
                  volume: fee.toFixed(), // TEST: fee.toString(),
                },
                validUntil: getTimestampDaysLater(DAYS),
              },
              luckyTokenHash: claimToken?.isNft ? claimToken?.luckyTokenHash : undefined,
            }
          } else if (claimValue.claimType === CLAIM_TYPE.allToken) {
            request = {
              accountId: account.accountId,
              token: {
                tokenId: token.tokenId,
                volume: amount.toString(),
              },
              transfer: {
                exchange: exchangeInfo.exchangeAddress,
                payerAddr: accAddress,
                payerId: accountId,
                payeeAddr: broker,
                storageId: storageId.offchainId,
                maxFee: {
                  tokenId: feeToken.tokenId,
                  volume: '0',
                },
                token: {
                  tokenId: feeToken.tokenId,
                  volume: fee.toFixed(), // TEST: fee.toString(),
                },
                validUntil: getTimestampDaysLater(DAYS),
              },
            }
          } else if (claimValue.claimType === CLAIM_TYPE.lrcStaking) {
            request = {
              accountId: account.accountId,
              token: {
                tokenId: token.tokenId,
                volume: amount.toString(),
              },
              transfer: {
                exchange: exchangeInfo.exchangeAddress,
                payerAddr: accAddress,
                payeeId: 0,
                payerId: accountId,
                payeeAddr: broker,
                storageId: storageId.offchainId,
                maxFee: {
                  tokenId: feeToken.tokenId,
                  volume: '0',
                },
                token: {
                  tokenId: feeToken.tokenId,
                  volume: fee.toFixed(), // TEST: fee.toString(),
                },
                validUntil: getTimestampDaysLater(DAYS),
              },
            }
          }

          myLog('claimWithdrawals request:', request)
          processRequest(request, isHardwareRetry)
        } catch (e: any) {
          // sdk.dumpError400(e);
          setShowAccount({
            isShow: true,
            step: AccountStep.ClaimWithdraw_Failed,
            error: {
              code: e?.code ?? UIERROR_CODE.UNKNOWN,
              message: e.message,
              ...(e instanceof Error
                ? {
                    message: e?.message,
                    stack: e?.stack,
                  }
                : e ?? {}),
            } as sdk.RESULT_INFO,
          })
        }

        return true
      } else {
        return false
      }
    },
    [
      account,
      tokenMap,
      exchangeInfo,
      isFeeNotEnough.isFeeNotEnough,
      setShowAccount,
      processRequest,
    ],
  )
  const checkBtnStatus = React.useCallback(() => {
    const claimValue = store.getState()._router_modalData.claimValue
    if (
      tokenMap &&
      chargeFeeTokenList.length &&
      isFeeNotEnough &&
      !isFeeNotEnough.isFeeNotEnough &&
      (claimValue.belong || claimValue.nftData) &&
      claimValue.tradeValue &&
      claimValue.fee &&
      claimValue.fee.belong
    ) {
      enableBtn()
      return
    }
    disableBtn()
  }, [
    chargeFeeTokenList.length,
    disableBtn,
    enableBtn,
    isFeeNotEnough.isFeeNotEnough,
    tokenMap,
    claimValue?.balance,
    claimValue?.belong,
    claimValue?.fee?.feeRaw,
    claimValue?.tradeValue,
  ])

  React.useEffect(() => {
    checkBtnStatus()
  }, [
    chargeFeeTokenList,
    claimValue?.tradeValue,
    isFeeNotEnough?.isFeeNotEnough,
    claimValue?.fee?.feeRaw,
  ])

  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.ClaimWithdraw_WaitForAuth,
      })
      onClaimClick({}, isHardwareRetry)
    },
    [setShowAccount],
  )
  return {
    retryBtn,
    claimProps: {
      btnStatus,
      btnInfo,
      disabled: !(legalEnable === true),
      tradeData: {
        tradeValue: claimValue?.tradeValue,
        belong: claimValue?.belong,
        balance: claimValue?.belong,
        tradeValueView: getValuePrecisionThousand(
          claimValue?.tradeValue,
          tokenMap[claimValue?.belong?.toString() ?? '']?.precision,
          tokenMap[claimValue?.belong?.toString() ?? '']?.precision,
          tokenMap[claimValue?.belong?.toString() ?? '']?.precision,
          false,
        ),
      },
      chargeFeeTokenList,
      isFeeNotEnough,
      handleFeeChange,
      feeInfo,
      checkFeeIsEnough,
      onClaimClick,
      claimType,
      isNFT: claimToken?.isNft ? true : false,
      nftIMGURL: claimToken?.nftTokenInfo?.metadata?.imageSize.original,
    } as any as ClaimProps<any, any>,
  }
}
