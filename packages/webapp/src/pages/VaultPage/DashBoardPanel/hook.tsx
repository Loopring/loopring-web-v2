import React from 'react'
import {
  accountReducer,
  accountStaticCallBack,
  makeVaultLayer2,
  store,
  useAccount,
  useSystem,
  useTokenPrices,
  useWalletLayer2,
  VaultAccountInfoStatus,
  volumeToCountAsBigNumber,
  WalletConnectL2Btn,
} from '@loopring-web/core'
import {
  Button,
  setShowWrongNetworkGuide,
  useSettings,
  VaultAssetsTableProps,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  AssetsRawDataItem,
  EmptyValueTag,
  fnType,
  globalSetup,
  L1L2_NAME_DEFINED,
  LoadingIcon,
  MapChainId,
  myLog,
  SagaStatus,
  SoursURL,
  TokenType,
  TradeBtnStatus,
  VaultAction,
} from '@loopring-web/common-resources'

import * as sdk from '@loopring-web/loopring-sdk'
import _ from 'lodash'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { VaultAccountStatus } from '@loopring-web/loopring-sdk'

export const useGetVaultAssets = ({
  vaultAccountInfo: _vaultAccountInfo,
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}): VaultAssetsTableProps & {
  totalAsset: string
  onActionBtnClick: (key: VaultAction) => void
  setShowNoVaultAccount: (props: { isShow: boolean; whichBtn: VaultAction | undefined }) => void
  [key: string]: any
} => {
  const { t } = useTranslation('common')
  const {
    vaultAccountInfoStatus,
    vaultAccountInfo,
    activeInfo,
    joinBtnStatus,
    joinBtnLabel,
    onJoinPop,
    onSwapPop,
    onBorrowPop,
    onRedeemPop,
  } = _vaultAccountInfo
  const [assetsRawData, setAssetsRawData] = React.useState<AssetsRawDataItem[]>([])
  const [totalAsset, setTotalAsset] = React.useState<string | undefined>('0')
  const { status: accountStatus, account } = useAccount()
  const { allowTrade, forexMap } = useSystem()
  const { status: tokenPriceStatus } = useTokenPrices()
  // const { btnStatus: assetBtnStatus, enableBtn, setLoadingBtn } = useBtnStatus()
  const [noVaultAccount, setShowNoVaultAccount] = React.useState<{
    isShow: boolean
    whichBtn: VaultAction | undefined
  }>({ isShow: true, whichBtn: undefined })
  const { isShow: showNoVaultAccount, whichBtn } = noVaultAccount

  const { isMobile, currency, defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const btnClickCallbackArray = {
    [fnType.ERROR_NETWORK]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: false }))
        store.dispatch(setShowWrongNetworkGuide({ isShow: true }))
      },
    ],
    [fnType.UN_CONNECT]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.NO_ACCOUNT]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.DEPOSITING]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.NOT_ACTIVE]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.LOCKED]: [
      function (key: VaultAction) {
        setShowNoVaultAccount({ isShow: true, whichBtn: key })
      },
    ],
    [fnType.ACTIVATED]: [
      (
        accountStatus: sdk.VaultAccountStatus,
        activeInfo: {
          hash: string
          isInActive: true
        },
        key: any,
      ) => {
        if (
          [sdk.VaultAccountStatus.IN_STAKING].includes(accountStatus as any) ||
          activeInfo?.hash
        ) {
          switch (key) {
            case VaultAction.VaultJoin:
              onJoinPop({})
              // setShowVaultJoin({ isShow: true, info: { isActiveAccount: false } })
              break
            case VaultAction.VaultExit:
              onRedeemPop({ isShow: true })
              break
            case VaultAction.VaultLoad:
              // debugger
              onBorrowPop({ isShow: true })
              break
            case VaultAction.VaultSwap:
              onSwapPop({})
              break
          }
        } else {
          setShowNoVaultAccount({ isShow: true, whichBtn: VaultAction.VaultJoin })
        }
      },
      [vaultAccountInfo?.accountStatus, activeInfo?.hash],
    ],
  }
  const onActionBtnClick = (props: string) => {
    accountStaticCallBack(btnClickCallbackArray, [props])
  }
  const dialogBtn = React.useMemo(() => {
    switch (account.readyState) {
      case AccountStatus.UN_CONNECT:
      case AccountStatus.LOCKED:
      case AccountStatus.NO_ACCOUNT:
      case AccountStatus.NOT_ACTIVE:
        return <WalletConnectL2Btn />
      case AccountStatus.DEPOSITING:
        return (
          <Box
            flex={1}
            display={'flex'}
            justifyContent={'center'}
            flexDirection={'column'}
            alignItems={'center'}
          >
            <img
              className='loading-gif'
              alt={'loading'}
              width='60'
              src={`${SoursURL}images/loading-line.gif`}
            />
            <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
              {t('describeTitleOpenAccounting', {
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              })}
            </Typography>
          </Box>
        )
        break
      case AccountStatus.ERROR_NETWORK:
        return (
          <Box
            flex={1}
            display={'flex'}
            justifyContent={'center'}
            flexDirection={'column'}
            alignItems={'center'}
          >
            <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
              {t('describeTitleOnErrorNetwork', {
                connectName: account.connectName,
              })}
            </Typography>
          </Box>
        )
        break
      case AccountStatus.ACTIVATED:
        if (sdk.VaultAccountStatus.IN_REDEEM === vaultAccountInfo?.accountStatus) {
          return (
            <Box
              flex={1}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
              alignItems={'center'}
            >
              <img
                className='loading-gif'
                alt={'loading'}
                width='60'
                src={`${SoursURL}images/loading-line.gif`}
              />
              <Typography marginY={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
                TODO
                {t('TODO in INREDEEM waiding', {
                  l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                })}
              </Typography>
            </Box>
          )
        } else if (
          [sdk.VaultAccountStatus.UNDEFINED, sdk.VaultAccountStatus.FREE].includes(
            (vaultAccountInfo?.accountStatus ?? '') as any,
          )
        ) {
          return (
            <Button
              size={'medium'}
              className={'vaultInProcessing'}
              onClick={() => {
                setShowNoVaultAccount({ isShow: false, whichBtn: undefined })
                onJoinPop(true)
              }}
              loading={'false'}
              variant={'contained'}
              fullWidth={true}
              sx={{ minWidth: 'var(--walletconnect-width)' }}
              // @ts-ignore
              loading={(joinBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false') as any}
              disabled={
                joinBtnStatus === TradeBtnStatus.DISABLED ||
                joinBtnStatus === TradeBtnStatus.LOADING
              }
            >
              {joinBtnLabel}
            </Button>
          )
        } else if (
          activeInfo?.hash ||
          (vaultAccountInfo?.accountStatus &&
            sdk.VaultAccountStatus.IN_STAKING !== vaultAccountInfo?.accountStatus)
        ) {
          return (
            <Box
              flex={1}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
              alignItems={'center'}
            >
              <img
                className='loading-gif'
                alt={'loading'}
                width='60'
                src={`${SoursURL}images/loading-line.gif`}
              />
              <Typography marginY={3} variant={'body1'} textAlign={'center'}>
                {t('labelVaultAccountWait', {
                  l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                })}
              </Typography>
            </Box>
          )
        } else {
          return (
            <Button
              size={'medium'}
              className={'vaultInProcessing'}
              onClick={() => {
                setShowNoVaultAccount({ isShow: false, whichBtn: undefined })
              }}
              loading={'false'}
              variant={'contained'}
              fullWidth={true}
              sx={{ minWidth: 'var(--walletconnect-width)' }}
            >
              {t('labelVaultCloseBtn')}
            </Button>
          )
        }
        break
      default:
        break
    }
  }, [
    account.readyState,
    account.connectName,
    activeInfo?.hash,
    vaultAccountInfo?.accountStatus,
    isMobile,
  ])
  const { hideL2Assets, hideSmallBalances, setHideSmallBalances } = useSettings()
  const { status: walletL2Status } = useWalletLayer2()
  const getAssetsRawData = () => {
    // debugger
    const {
      // vaultLayer2: { vaultAccountInfo },
      tokenMap: {
        // tokenMap: erc20TokenMap,
        idIndex: erc20IdIndex,
      },
      // tokenPrices: { tokenPrices },
      tokenPrices: { tokenPrices },
      invest: {
        vaultMap: { tokenMap, idIndex: vaultIdIndex },
      },
    } = store.getState()
    const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map ?? {}
    if (
      tokenMap &&
      !!Object.keys(tokenMap).length &&
      !!Object.keys(walletMap ?? {}).length
      // &&
      // !!tokenPriceList.length
    ) {
      let totalAssets = sdk.toBig(0)
      let data: Array<any> = Object.keys(tokenMap ?? {}).reduce((pre, key, _index) => {
        let item: any = undefined
        // tokenInfo
        let tokenInfo = {
          ...tokenMap[key],
          token: key,
          erc20Symbol: erc20IdIndex[tokenMap[key].tokenId],
        }
        if (walletMap && walletMap[key]) {
          tokenInfo = {
            ...tokenInfo,
            detail: walletMap[key],
            erc20Symbol: erc20IdIndex[tokenMap[key].tokenId],
          }
          let tokenValueDollar = sdk.toBig(0)

          const totalAmount = volumeToCountAsBigNumber(
            tokenInfo.erc20Symbol,
            tokenInfo.detail?.detail?.total ?? 0,
          )
          const price = tokenPrices?.[tokenInfo.erc20Symbol] || 0
          if (totalAmount && price) {
            tokenValueDollar = totalAmount?.times(price)
          }
          const isSmallBalance = tokenValueDollar.lt(1)
          item = {
            token: {
              type: TokenType.vault,
              value: tokenInfo.token,
            },
            amount: totalAmount?.toString() || EmptyValueTag,
            available: Number(tokenInfo.detail?.count) || EmptyValueTag,
            smallBalance: isSmallBalance,
            tokenValueDollar: tokenValueDollar.toString(),
            name: tokenInfo.token,
            erc20Symbol: erc20IdIndex[tokenMap[key].tokenId],
          }
        } else {
          item = {
            ...tokenInfo,
            token: {
              type: TokenType.vault,
              value: key,
            },
            amount: EmptyValueTag,
            available: EmptyValueTag,
            locked: 0,
            smallBalance: true,
            tokenValueDollar: 0,
            name: key,
            tokenValueYuan: 0,
            erc20Symbol: erc20IdIndex[tokenMap[key].tokenId],
          }
        }
        if (item) {
          const token = item.token.value
          let precision = tokenMap[item.token.value].precision

          pre.push({
            ...item,
            precision: precision,
          })
          totalAssets = totalAssets.plus(sdk.toBig(item.tokenValueDollar))
        }
        pre?.sort((a, b) => {
          const deltaDollar = b.tokenValueDollar - a.tokenValueDollar
          const deltaAmount = sdk.toBig(b.amount).minus(a.amount).toNumber()
          const deltaName = b.token.value < a.token.value ? 1 : -1
          return deltaDollar !== 0 ? deltaDollar : deltaAmount !== 0 ? deltaAmount : deltaName
        })
        return pre
      }, [] as Array<any>)
      setAssetsRawData(data)
      setTotalAsset(totalAssets.toString())
    } else {
      setAssetsRawData([])
      setTotalAsset(undefined)
    }
  }
  const startWorker = _.debounce(getAssetsRawData, globalSetup.wait)
  React.useEffect(() => {
    if (
      noVaultAccount?.isShow === true &&
      vaultAccountInfoStatus === SagaStatus.UNSET &&
      vaultAccountInfo?.accountStatus &&
      tokenPriceStatus === SagaStatus.UNSET &&
      walletL2Status === SagaStatus.UNSET &&
      noVaultAccount.whichBtn &&
      vaultAccountInfo?.accountStatus === VaultAccountStatus.IN_STAKING
    ) {
      onActionBtnClick(noVaultAccount.whichBtn)
    }
    // enableBtn()
  }, [
    noVaultAccount,
    walletL2Status,
    vaultAccountInfo?.accountStatus,
    activeInfo,
    assetsRawData,
    tokenPriceStatus,
  ])
  const walletLayer2Callback = React.useCallback(() => {
    startWorker()
  }, [])
  React.useEffect(() => {
    if (vaultAccountInfoStatus === SagaStatus.UNSET) {
      walletLayer2Callback()
    }
  }, [vaultAccountInfoStatus])
  // useWalletLayer2Socket({ walletLayer2Callback })

  myLog('assetsRawData', assetsRawData)
  return {
    forexMap,
    rawData: assetsRawData,
    hideAssets: hideL2Assets,
    allowTrade,
    setHideSmallBalances,
    hideSmallBalances,
    showFilter: true,
    totalAsset,
    showNoVaultAccount,
    whichBtn,
    setShowNoVaultAccount,
    onActionBtnClick,
    dialogBtn,
  }
}
