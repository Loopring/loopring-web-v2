import React from 'react'
import {
  accountReducer,
  accountStaticCallBack,
  makeVaultLayer2,
  numberStringListSum,
  store,
  useAccount,
  useSystem,
  useWalletLayer2,
  VaultAccountInfoStatus,
  WalletConnectL2Btn,
} from '@loopring-web/core'
import {
  Button,
  VaultDataAssetsItem,
  setShowWrongNetworkGuide,
  useOpenModals,
  useSettings,
  VaultAssetsTableProps,
  Transaction,
  setShowVaultJoin,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  EmptyValueTag,
  fnType,
  globalSetup,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  RouterPath,
  SagaStatus,
  SoursURL,
  TokenType,
  TradeBtnStatus,
  VaultAction,
  VaultKey,
} from '@loopring-web/common-resources'

import * as sdk from '@loopring-web/loopring-sdk'
import _ from 'lodash'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { VaultAccountStatus } from '@loopring-web/loopring-sdk'
import { useLocation, useRouteMatch } from 'react-router-dom'
import { useHistory } from 'react-router-dom'

const VaultPath = `${RouterPath.vault}/:item/:method?`

const parseVaultTokenStatus = (status: number) => ({
  show: status & 1,
  join: status & 2,
  exit: status & 4,
  loan: status & 8,
  repay: status & 16,
})

export const useGetVaultAssets = <R extends VaultDataAssetsItem>({
  vaultAccountInfo: _vaultAccountInfo,
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}): VaultAssetsTableProps<R> & {
  totalAsset: string
  onActionBtnClick: (key: VaultAction) => void
  setShowNoVaultAccount: (props: any) => void
  [key: string]: any
} => {
  let match: any = useRouteMatch(VaultPath)
  const history = useHistory()
  const { search, pathname } = useLocation()
  const searchParams = new URLSearchParams(search)
  const { t } = useTranslation(['common'])

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
  const [assetsRawData, setAssetsRawData] = React.useState<R[]>([])
  const [totalAsset, setTotalAsset] = React.useState<string>(EmptyValueTag)
  const { account } = useAccount()
  const { allowTrade, forexMap } = useSystem()

  const {
    setShowNoVaultAccount,
    modals: {
      isShowNoVaultAccount: { isShow: showNoVaultAccount, whichBtn, ...btnProps },
    },
  } = useOpenModals()

  const { isMobile, defaultNetwork, hideL2Assets, hideSmallBalances, setHideSmallBalances } =
    useSettings()
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
            case VaultAction.VaultLoan:
              onBorrowPop({ isShow: true })
              break
            case VaultAction.VaultSwap:
              onSwapPop({})
              break
          }
        } else if (
          [sdk.VaultAccountStatus.IN_REDEEM].includes(vaultAccountInfo?.accountStatus as any)
        ) {
          setShowNoVaultAccount({
            isShow: true,
            des: 'labelRedeemDesMessage',
            title: 'labelRedeemTitle',
          })
        } else {
          setShowNoVaultAccount({
            isShow: true,
            whichBtn: VaultAction.VaultJoin,
            des: 'labelJoinDesMessage',
            title: 'labelVaultJoinTitle',
          })
        }
      },
      [vaultAccountInfo?.accountStatus, activeInfo?.hash],
    ],
  }
  const onActionBtnClick = (props: string) => {
    accountStaticCallBack(btnClickCallbackArray, [props])
  }
  React.useEffect(() => {
    if (
      match?.params?.item == VaultKey.VAULT_DASHBOARD &&
      vaultAccountInfoStatus === SagaStatus.UNSET
    ) {
      const { vaultAccountInfo } = store.getState().vaultLayer2
      if (vaultAccountInfo?.accountStatus) {
        if ([sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus as any)) {
          if (match?.params?.method) {
            switch (match?.params?.method) {
              case VaultAction.VaultJoin:
                onJoinPop({})
                // setShowVaultJoin({ isShow: true, info: { isActiveAccount: false } })
                break
              case VaultAction.VaultExit:
                onRedeemPop({ isShow: true, symbol: searchParams.get('symbol') })
                break
              case VaultAction.VaultLoan:
                onBorrowPop({ isShow: true, symbol: searchParams.get('symbol') })
                break
              case VaultAction.VaultSwap:
                onSwapPop({ isShow: true, symbol: searchParams.get('symbol') })
                break
            }
            history.replace(`${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}`)
          }
        } else if (
          [sdk.VaultAccountStatus.IN_REDEEM].includes(vaultAccountInfo?.accountStatus as any)
        ) {
          setShowNoVaultAccount({
            isShow: true,
            des: 'labelRedeemDesMessage',
            title: 'labelRedeemTitle',
          })
        } else {
        }
      } else {
        
      }
    }
  }, [vaultAccountInfoStatus, match?.params?.item, match?.params?.method])
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
            </Box>
          )
        } else if (
          [sdk.VaultAccountStatus.UNDEFINED, sdk.VaultAccountStatus.FREE].includes(
            (vaultAccountInfo?.accountStatus ?? '') as any,
          ) ||
          vaultAccountInfo == undefined ||
          vaultAccountInfo?.accountStatus == undefined
        ) {
          return (
            <Button
              size={'medium'}
              className={'vaultInProcessing'}
              onClick={() => {
                setShowNoVaultAccount({ isShow: false, whichBtn: undefined })
                onJoinPop(true)
              }}
              variant={'contained'}
              fullWidth={true}
              sx={{ minWidth: 'var(--walletconnect-width)' }}
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
      default:
        break
    }
  }, [
    account.readyState,
    account.connectName,
    activeInfo?.hash,
    vaultAccountInfo?.accountStatus,
    isMobile,
    joinBtnStatus,
    joinBtnLabel,
  ])
  const { status: walletL2Status } = useWalletLayer2()
  const getAssetsRawData = () => {
    const {
      // vaultLayer2: { vaultAccountInfo },
      tokenMap: {
        // tokenMap: erc20TokenMap,
        idIndex: erc20IdIndex,
      },

      invest: {
        vaultMap: { tokenMap,  tokenPrices },
      },
    } = store.getState()
    const walletMap = makeVaultLayer2({ needFilterZero: false }).vaultLayer2Map ?? {}
    myLog('asdfhsjdhfjsd', tokenMap, walletMap)
    if (
      tokenMap &&
      !!Object.keys(tokenMap).length &&
      !!Object.keys(walletMap ?? {}).length
    ) {
      const data: Array<any> = Object.keys(tokenMap ?? {})
      .map((key, _index) => {
        let item: any
        let tokenInfo = {
          ...tokenMap[key],
          token: key,
          erc20Symbol: erc20IdIndex[tokenMap[key].tokenId],
        }
        const erc20Symbol = key.slice(2)
        if (walletMap && walletMap[key]) {
          tokenInfo = {
            ...tokenInfo,
            detail: walletMap[key],
            erc20Symbol: erc20IdIndex[tokenMap[key].tokenId],
          }
          const totalAmount = sdk.toBig(tokenInfo.detail?.asset ?? 0)
          const tokenValueDollar = totalAmount?.times(tokenPrices?.[tokenInfo.symbol] ?? 0)
          const isSmallBalance = tokenValueDollar.lt(1)
          item = {
            token: {
              type: TokenType.vault,
              value: key,
              belongAlice: erc20Symbol,
            },
            amount: totalAmount?.toString(),
            available: tokenInfo?.detail?.count??0,
            smallBalance: isSmallBalance,
            tokenValueDollar: tokenValueDollar.toString(),
            name: tokenInfo.token,
            erc20Symbol,
          }
        } else {
          item = {
            ...tokenInfo,
            token: {
              type: TokenType.vault,
              value: key,
              belongAlice: erc20Symbol,
            },
            amount: 0,
            available: 0,
            locked: 0,
            smallBalance: true,
            tokenValueDollar: 0,
            name: key,
            tokenValueYuan: 0,
            erc20Symbol,
          }
        }
        if (item) {
          let precision = tokenMap[item.token.value].precision

          return {
            ...item,
            precision: precision,
            // holding: '100-todo',
            // equity: '100-todo',
          }
        } else {
          return undefined
        }
      })
      .filter(token => {
        const status = tokenMap['LV' + token.erc20Symbol].vaultTokenAmounts.status as number
        return token && parseVaultTokenStatus(status).loan && parseVaultTokenStatus(status).repay
      }).sort((a, b) => {
        const deltaDollar = b.tokenValueDollar - a.tokenValueDollar
        const deltaAmount = sdk.toBig(b.amount).minus(a.amount).toNumber()
        const deltaName = b.token.value < a.token.value ? 1 : -1
        return deltaDollar !== 0 ? deltaDollar : deltaAmount !== 0 ? deltaAmount : deltaName
      })
      const totalAssets = data.reduce(
        (pre, item) => pre.plus(sdk.toBig(item.tokenValueDollar)),
        sdk.toBig(0),
      )
      setAssetsRawData(data)
      setTotalAsset(totalAssets.toString())
    } else {
      setAssetsRawData([])
      setTotalAsset(EmptyValueTag)
    }
  }
  const startWorker = _.debounce(getAssetsRawData, globalSetup.wait)
  React.useEffect(() => {
    if (
      showNoVaultAccount &&
      vaultAccountInfoStatus === SagaStatus.UNSET &&
      vaultAccountInfo?.accountStatus && walletL2Status === SagaStatus.UNSET &&
      whichBtn &&
      vaultAccountInfo?.accountStatus === VaultAccountStatus.IN_STAKING
    ) {
      onActionBtnClick(whichBtn)
    }
    // enableBtn()
  }, [
    whichBtn,
    walletL2Status,
    vaultAccountInfo?.accountStatus,
    activeInfo,
    assetsRawData,
    // tokenPriceStatus,
  ])
  const walletLayer2Callback = React.useCallback(() => {
    startWorker()
  }, [])
  React.useEffect(() => {
    if (vaultAccountInfoStatus === SagaStatus.UNSET) {
      walletLayer2Callback()
    }
  }, [vaultAccountInfoStatus])
  const onRowClick = React.useCallback(
    ({ row }: { row: R }) => {
      
      if ([sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus ?? '')) {
        history.push('/portal/portalDashboard')
        onSwapPop({ symbol: row?.token?.value })
      } else {
        history.push('/portal')
        setShowNoVaultAccount({
          isShow: true,
          whichBtn: VaultAction.VaultJoin,
          des: 'labelJoinDesMessage',
          title: 'labelVaultJoinTitle',
        })
      }
    },
    [vaultAccountInfo?.accountStatus],
  )
  return {
    btnProps,
    onBtnClose: () => {
      setShowNoVaultAccount({ isShow: false, whichBtn: undefined })
    },
    forexMap,
    rawData: assetsRawData as R[],
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
    actionRow: ({ row }) => {
      return (
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onRowClick({ row })
          }}
        >
          {t('labelTrade')}
        </Button>
      )
    },
    onRowClick: (_, row) => {
      onRowClick({ row })
    },
    positionOpend: [sdk.VaultAccountStatus.IN_REDEEM, sdk.VaultAccountStatus.IN_STAKING]
      .includes(vaultAccountInfo?.accountStatus as any),
    onClcikOpenPosition: () => {
      setShowNoVaultAccount({
        isShow: true,
        whichBtn: VaultAction.VaultJoin,
        des: 'labelJoinDesMessage',
        title: 'labelVaultJoinTitle',
      })
    },
    onRowClickTrade: ({ row }: { row: R }) => {
      if ([sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus ?? '')) {
        history.push('/portal/portalDashboard')
        if (row?.token?.value === 'USDT') {
          onSwapPop({ symbol: 'ETH', isSell: true })
        } else {
          onSwapPop({ symbol: row?.token?.value })
        }
        
      } else {
        history.push('/portal')
        setShowNoVaultAccount({
          isShow: true,
          whichBtn: VaultAction.VaultJoin,
          des: 'labelJoinDesMessage',
          title: 'labelVaultJoinTitle',
        })
      }
    },
    onRowClickRepay: ({ row }: { row: R }) => {
      if ([sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus ?? '')) {
        history.push('/portal/portalDashboard')
        // todo repay
      } else {
        history.push('/portal')
        setShowNoVaultAccount({
          isShow: true,
          whichBtn: VaultAction.VaultJoin,
          des: 'labelJoinDesMessage',
          title: 'labelVaultJoinTitle',
        })
      }
    },
    noMinHeight: true
  }
}
