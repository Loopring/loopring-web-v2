import * as sdk from '@loopring-web/loopring-sdk'
import { useSettings } from '@loopring-web/component-lib'

import React from 'react'
import * as _ from 'lodash'
import {
  AccountStatus,
  FeeChargeOrderDefaultMap,
  FeeInfo,
  globalSetup,
  myLog,
  WalletMap,
} from '@loopring-web/common-resources'
import {
  useTokenMap,
  LoopringAPI,
  useAccount,
  useSystem,
  makeWalletLayer2,
  store,
  useWalletLayer2,
} from '../../index'

const INTERVAL_TIME = (() => 900000)()
export function useChargeFees({
  tokenSymbol: _tokenSymbol,
  requestType: _requestType,
  amount,
  extraType,
  isNFT = false,
  tokenAddress,
  updateData,
  needAmountRefresh,
  isActiveAccount = false,
  deployInWithdraw = undefined,
  intervalTime = INTERVAL_TIME,
}: {
  tokenAddress?: string | undefined
  tokenSymbol?: string | undefined
  isNFT?: boolean
  requestType:
    | sdk.OffchainFeeReqType
    | sdk.OffchainNFTFeeReqType
    | 'UPDATE_ACCOUNT_BY_NEW'
    | 'TRANSFER_ACTIVE'
  extraType?: number
  amount?: number
  intervalTime?: number
  updateData?:
    | undefined
    | ((props: {
        fee: FeeInfo
        chargeFeeTokenList?: FeeInfo[]
        isFeeNotEnough?: {
          isFeeNotEnough: boolean
          isOnLoading: boolean
        }
        requestType:
          | sdk.OffchainFeeReqType
          | sdk.OffchainNFTFeeReqType
          | 'UPDATE_ACCOUNT_BY_NEW'
          | 'TRANSFER_ACTIVE'
        [key: string]: any
      }) => void)
  isActiveAccount?: boolean
  needAmountRefresh?: boolean
  deployInWithdraw?: boolean
}): {
  chargeFeeTokenList: FeeInfo[]
  isFeeNotEnough: {
    isFeeNotEnough: boolean
    isOnLoading: boolean
  }
  checkFeeIsEnough: (
    props?: {
      isRequiredAPI: true
      intervalTime?: number
      requestType?: sdk.OffchainFeeReqType | sdk.OffchainNFTFeeReqType
    } & any,
  ) => void
  handleFeeChange: (value: FeeInfo) => void
  feeInfo: FeeInfo
  resetIntervalTime: () => void
} {
  const [feeInfo, setFeeInfo] = React.useState<FeeInfo>({
    belong: 'ETH',
    fee: 0,
    feeRaw: undefined,
  } as FeeInfo)
  const { chainId } = useSystem()
  // let { feeChargeOrder } = useSettings()
  const feeChargeOrder = FeeChargeOrderDefaultMap.get(chainId as sdk.ChainId)
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)
  const [chargeFeeTokenList, setChargeFeeTokenList] = React.useState<FeeInfo[]>([])
  const [isFeeNotEnough, setIsFeeNotEnough] = React.useState<{
    isFeeNotEnough: boolean
    isOnLoading: boolean
  }>({
    isFeeNotEnough: false,
    isOnLoading: false,
  })
  const { tokenMap } = useTokenMap()
  const { account } = useAccount()
  const [_amount, setAmount] = React.useState({ amount, needAmountRefresh })
  const [_intervalTime, setIntervalTime] = React.useState<number>(intervalTime)
  const { status: walletLayer2Status } = useWalletLayer2()
  const [requestType, setRequestType] = React.useState(_requestType)
  const [tokenSymbol, seTokenSymbol] = React.useState(_tokenSymbol)

  const handleFeeChange = (_value: FeeInfo): void => {
    const walletMap =
      makeWalletLayer2({ needFilterZero: true, isActive: isActiveAccount }).walletMap ??
      ({} as WalletMap<any>)
    let isFeeNotEnough = {
      isFeeNotEnough: true,
      isOnLoading: false,
    }
    const value = chargeFeeTokenList.find((ele) => _value?.belong === ele.belong) ?? _value
    if (
      walletMap &&
      value?.belong &&
      walletMap[value.belong] &&
      walletMap[value.belong]?.count &&
      sdk
        // @ts-ignore
        .toBig(walletMap[value.belong].count)
        .gte(sdk.toBig(value.fee.toString().replaceAll(sdk.SEP, '')))
    ) {
      isFeeNotEnough = {
        isFeeNotEnough: false,
        isOnLoading: false,
      }
      setIsFeeNotEnough(isFeeNotEnough)
    } else {
      setIsFeeNotEnough(isFeeNotEnough)
    }
    if (updateData && value) {
      updateData({
        fee: {
          ...value,
          __raw__: {
            ...value.__raw__,
            tokenId: tokenMap[value.belong.toString()].tokenId,
          },
        },
        requestType,
        isFeeNotEnough: isFeeNotEnough,
        amount: _amount.needAmountRefresh ? _amount.amount : undefined,
        tokenSymbol,
      })
    }
    setFeeInfo(value)
  }

  const getFeeList = _.debounce(
    async () => {
      let isFeeNotEnough = {
        isFeeNotEnough: true,
        isOnLoading: false,
      }
      let _feeInfo: any = undefined,
        isSame = true
      let tokenInfo
      setIsFeeNotEnough((state) => {
        isFeeNotEnough = { ...state }
        return { ...state, isOnLoading: true }
      })
      const { tokenMap } = store.getState().tokenMap
      const walletMap =
        makeWalletLayer2({ needFilterZero: true, isActive: isActiveAccount }).walletMap ??
        ({} as WalletMap<any>)
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout)
      }

      if (tokenSymbol && tokenMap) {
        tokenInfo = tokenMap[tokenSymbol]
      }
      if (tokenMap && tokenMap.ETH && LoopringAPI.userAPI && LoopringAPI.globalAPI) {
        // myLog("getFeeList", requestType);

        try {
          const request: sdk.GetOffchainFeeAmtRequest | sdk.GetNFTOffchainFeeAmtRequest = {
            accountId: account.accountId,
            tokenSymbol,
            tokenAddress,
            extraType,
            requestType: requestType as any,
            amount:
              tokenInfo && _amount.amount && _amount.needAmountRefresh
                ? sdk
                    .toBig(_amount.amount)
                    .times('1e' + tokenInfo.decimals)
                    .toFixed(0, 0)
                : '0',
            deployInWithdraw:
              requestType === sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL
                ? deployInWithdraw
                : undefined,
          }
          let fees: any
          if (isActiveAccount && requestType !== undefined) {
            const response = await LoopringAPI.globalAPI.getActiveFeeInfo({
              accountId:
                account.accountId === -1 && account._accountIdNotActive !== -1
                  ? account._accountIdNotActive
                  : account.accountId > 10000
                  ? account.accountId
                  : -1,
            })

            if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            } else {
              fees = response.fees
            }
          } else if (
            requestType !== undefined &&
            ([
              sdk.OffchainNFTFeeReqType.NFT_MINT,
              sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL,
              sdk.OffchainNFTFeeReqType.NFT_TRANSFER_AND_UPDATE_ACCOUNT,
              sdk.OffchainNFTFeeReqType.NFT_TRANSFER,
              sdk.OffchainNFTFeeReqType.NFT_DEPLOY,
            ].includes(requestType as any) ||
              (sdk.OffchainNFTFeeReqType.EXTRA_TYPES == requestType && isNFT)) &&
            account.accountId &&
            account.accountId !== -1 &&
            account.apiKey
          ) {
            const response = await LoopringAPI.userAPI.getNFTOffchainFeeAmt(
              request as sdk.GetNFTOffchainFeeAmtRequest,
              account.apiKey,
            )
            if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            } else {
              fees = response.fees
            }
          } else if (
            [
              sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
              sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL,
            ].includes(Number(requestType)) &&
            account.accountId &&
            account.accountId !== -1
          ) {
            const response = await LoopringAPI.userAPI.getOffchainFeeAmt(
              request as sdk.GetOffchainFeeAmtRequest,
              account.apiKey,
            )
            if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            } else {
              fees = response.fees
            }
          } else if (
            requestType !== undefined &&
            account.accountId &&
            account.accountId !== -1 &&
            account.apiKey
          ) {
            const response = await LoopringAPI.userAPI.getOffchainFeeAmt(
              request as sdk.GetOffchainFeeAmtRequest,
              account.apiKey,
            )
            if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            } else {
              fees = response.fees
            }
          }

          if (_amount?.needAmountRefresh) {
            setAmount((state) => {
              isSame = _amount.amount === state.amount
              return state
            })
          }
          if (isSame && fees && feeChargeOrder) {
            const _chargeFeeTokenList = feeChargeOrder?.reduce((pre, item) => {
              let { fee, token, discount } = fees[item] ?? {}
              if (fee && token) {
                const tokenInfo = tokenMap[token]
                const tokenId = tokenInfo.tokenId
                const fastWithDraw = tokenInfo.fastWithdrawLimit
                const feeRaw = fee
                fee = sdk
                  .toBig(fee)
                  .div('1e' + tokenInfo.decimals)
                  .toString()
                const feeInfoTemplate = {
                  belong: token,
                  fee,
                  feeRaw,
                  hasToken: !!(walletMap && walletMap[token]),
                  discount: discount as number,
                  __raw__: { fastWithDraw, feeRaw, tokenId },
                }
                pre.push(feeInfoTemplate)
                if (_feeInfo === undefined && walletMap && walletMap[token]) {
                  const { count } = walletMap[token] ?? { count: 0 }
                  if (sdk.toBig(count).gte(sdk.toBig(fee.toString().replaceAll(sdk.SEP, '')))) {
                    _feeInfo = _.cloneDeep(feeInfoTemplate)
                  }
                }
              }
              return pre
            }, [] as Array<FeeInfo>)
            let _isFeeNotEnough = {
              isFeeNotEnough: true,
              isOnLoading: false,
            }
            setFeeInfo((state) => {
              if (_feeInfo === undefined) {
                if (state?.feeRaw === '0' && isActiveAccount) {
                  _isFeeNotEnough = {
                    isFeeNotEnough: false,
                    isOnLoading: false,
                  }
                }
                setIsFeeNotEnough(_isFeeNotEnough)
                _feeInfo =
                  !state || state?.feeRaw === undefined
                    ? _chargeFeeTokenList[0]
                      ? _.cloneDeep(_chargeFeeTokenList[0])
                      : {
                          belong: 'ETH',
                          fee: 0,
                          feeRaw: undefined,
                        }
                    : _chargeFeeTokenList?.find((ele) => ele.belong === state.belong) ?? state

                if (updateData && _feeInfo) {
                  updateData({
                    fee: {
                      ..._feeInfo,
                      __raw__: {
                        ..._feeInfo.__raw__,
                        tokenId: tokenMap[_feeInfo?.belong.toString()].tokenId,
                      },
                    },
                    requestType,
                    chargeFeeTokenList: _chargeFeeTokenList,
                    isFeeNotEnough: _isFeeNotEnough,
                    amount: _amount.needAmountRefresh ? _amount.amount : undefined,
                    tokenSymbol,
                  })
                }
                // myLog("_feeInfo", _feeInfo);
                return _feeInfo
              } else {
                if (isFeeNotEnough.isFeeNotEnough || !state || state?.feeRaw === undefined) {
                  _isFeeNotEnough = {
                    isFeeNotEnough: false,
                    isOnLoading: false,
                  }
                  setIsFeeNotEnough(_isFeeNotEnough)
                  if (updateData && _feeInfo) {
                    updateData({
                      fee: {
                        ..._feeInfo,
                        __raw__: {
                          ...feeInfo?.__raw__,
                          ..._feeInfo?.__raw__,
                          tokenId: tokenMap[_feeInfo?.belong.toString()].tokenId,
                        },
                      },
                      requestType,
                      chargeFeeTokenList: _chargeFeeTokenList,
                      isFeeNotEnough: _isFeeNotEnough,
                      amount: _amount.needAmountRefresh ? _amount.amount : undefined,
                      tokenSymbol,
                    })
                  }
                  return _feeInfo
                } else {
                  const feeInfo = _chargeFeeTokenList?.find((ele) => ele.belong === state.belong)
                  if (updateData && feeInfo) {
                    _isFeeNotEnough = {
                      isFeeNotEnough: sdk
                        .toBig(walletMap[state.belong]?.count ?? 0)
                        .lt(sdk.toBig(feeInfo.fee.toString().replaceAll(sdk.SEP, ''))),
                      isOnLoading: false,
                    }
                    setIsFeeNotEnough(_isFeeNotEnough)
                    updateData({
                      fee: { ...feeInfo },
                      requestType,
                      chargeFeeTokenList: _chargeFeeTokenList,
                      isFeeNotEnough: _isFeeNotEnough,
                      amount: _amount.needAmountRefresh ? _amount.amount : undefined,
                      tokenSymbol,
                    })
                  }
                  return feeInfo ?? state
                }
              }
            })
            const _chargeFeeTokenListWithCount = _chargeFeeTokenList.map((feeInfo) => {
              return {
                ...feeInfo,
                count: walletMap[feeInfo.belong]?.count
                  ? walletMap[feeInfo.belong]?.count
                  : undefined,
              } as FeeInfo
            })
            setChargeFeeTokenList(_chargeFeeTokenListWithCount ?? [])
          }
        } catch (reason: any) {
          // myLog("chargeFeeTokenList, error", reason);
          if ((reason as sdk.RESULT_INFO).code) {
          }
        }
        if (isSame && Number.isFinite(_intervalTime) && !Number.isNaN(_intervalTime)) {
          nodeTimer.current = setTimeout(() => {
            getFeeList()
          }, _intervalTime)
        }
        return
      } else {
        nodeTimer.current = setTimeout(() => {
          getFeeList()
        }, 1000)
      }
    },
    globalSetup.wait,
    { trailing: true },
  )
  const checkFeeIsEnough = async (
    props:
      | undefined
      | ({
          isRequiredAPI: true
          intervalTime?: number
          requestType?: sdk.OffchainFeeReqType
        } & any),
  ) => {
    if (props?.isRequiredAPI) {
      const intervalTime = props.intervalTime
      setIntervalTime((state) => {
        return intervalTime ? intervalTime : state
      })
      if (props?.tokenSymbol && props?.tokenSymbol !== tokenSymbol) {
        seTokenSymbol(props.tokenSymbol)
      }
      if (props.amount && props.needAmountRefresh && props.requestType) {
        myLog('checkFeeIsEnough needAmountRefresh', requestType)
        if (props.requestType && props.requestType !== requestType) {
          setRequestType(props.requestType)
        }
        setAmount(() => ({
          amount: props.amount,
          needAmountRefresh: props.needAmountRefresh,
        }))
        getFeeList.cancel()
      } else if (props.requestType && props.requestType !== requestType) {
        setRequestType(props.requestType)
        myLog('checkFeeIsEnough', requestType)
        getFeeList.cancel()
      } else {
        getFeeList.cancel()
        getFeeList()
      }
    } else {
      const walletMap =
        makeWalletLayer2({ needFilterZero: true, isActive: isActiveAccount }).walletMap ??
        ({} as WalletMap<any>)
      if (chargeFeeTokenList && walletMap) {
        chargeFeeTokenList.map((feeInfo) => {
          return {
            ...feeInfo,
            hasToken: !!(walletMap && walletMap[feeInfo.belong]),
          }
        })
      }

      if (feeInfo && feeInfo.belong && feeInfo.feeRaw) {
        const { count } = walletMap[feeInfo.belong] ?? { count: 0 }
        if (sdk.toBig(count).gte(sdk.toBig(feeInfo.fee.toString().replaceAll(sdk.SEP, '')))) {
          setIsFeeNotEnough({ isFeeNotEnough: false, isOnLoading: false })
          return
        }
      }
      setIsFeeNotEnough({ isFeeNotEnough: true, isOnLoading: false })
    }
  }

  React.useEffect(() => {
    if (nodeTimer.current !== -1) {
      clearTimeout(nodeTimer.current as NodeJS.Timeout)
      getFeeList.cancel()
    }

    if (
      (isActiveAccount &&
        ((requestType === 'UPDATE_ACCOUNT_BY_NEW' &&
          [
            AccountStatus.NO_ACCOUNT,
            AccountStatus.DEPOSITING,
            AccountStatus.NOT_ACTIVE,
            AccountStatus.LOCKED,
          ].includes(account.readyState as any)) ||
          requestType === 'TRANSFER_ACTIVE')) ||
      (!isActiveAccount &&
        walletLayer2Status === 'UNSET' &&
        AccountStatus.ACTIVATED === account.readyState &&
        [
          sdk.OffchainFeeReqType.UPDATE_ACCOUNT,
          sdk.OffchainFeeReqType.UPDATE_ACCOUNT,
          sdk.OffchainFeeReqType.TRANSFER,
          sdk.OffchainFeeReqType.EXTRA_TYPES,
          sdk.OffchainFeeReqType.TRANSFER_AND_UPDATE_ACCOUNT,
          sdk.OffchainFeeReqType.FORCE_WITHDRAWAL,
          sdk.OffchainNFTFeeReqType.NFT_TRANSFER,
          sdk.OffchainNFTFeeReqType.EXTRA_TYPES,
          sdk.OffchainNFTFeeReqType.NFT_TRANSFER_AND_UPDATE_ACCOUNT,
          sdk.OffchainNFTFeeReqType.NFT_DEPLOY,
        ].includes(Number(requestType))) ||
      (!isActiveAccount &&
        walletLayer2Status === 'UNSET' &&
        sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL === requestType &&
        tokenAddress) ||
      (!isActiveAccount &&
        tokenSymbol &&
        [
          sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
          sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL,
        ].includes(Number(requestType))) ||
      //   [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL].includes(
      //     Number(requestType)
      //   )) ||
      // (!isActiveAccount &&
      //   tokenSymbol &&
      //   amount &&
      //   AccountStatus.ACTIVATED === account.readyState &&
      //   walletLayer2Status === "UNSET" &&
      //   [sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL].includes(
      //     Number(requestType)
      //   )) ||
      (!isActiveAccount &&
        tokenAddress &&
        AccountStatus.ACTIVATED === account.readyState &&
        walletLayer2Status === 'UNSET' &&
        [sdk.OffchainNFTFeeReqType.NFT_MINT].includes(Number(requestType)))
    ) {
      getFeeList()
    }

    return () => {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout)
      }
      getFeeList.cancel()
    }
  }, [
    isActiveAccount,
    tokenAddress,
    tokenSymbol,
    requestType,
    _intervalTime,
    _amount,
    account.readyState,
    walletLayer2Status,
  ])

  return {
    chargeFeeTokenList,
    isFeeNotEnough,
    resetIntervalTime: () => {
      setIntervalTime(intervalTime)
    },
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
  }
}
